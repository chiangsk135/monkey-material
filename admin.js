console.log("[STARTING] admin.js");
var run=function(app,db){

    var cheerio=require('cheerio');
    var fs=require("fs-extra");
    var assert=require('assert');

    var removeDir=function(dirPath,selfDelete,exception){
        try{
            var content = fs.readdirSync(dirPath);
            console.log(content);
        }catch(err){
            console.error(err);
            $("#message").append("<pre>"+err.message+"</pre>");
            return err;
        }
        if(content.length>0){
            for(var i=0;i<content.length;i++){
                var filePath=dirPath+content[i];
                if(fs.statSync(filePath).isFile()){
                    if(exception.indexOf(filePath)==-1){
                        fs.unlinkSync(filePath);
                        console.log("[FILE DELETED] "+filePath);
                    }
                }
                else removeDir(filePath+"/",true,exception);
            }
        }
        if(selfDelete){
            fs.rmdirSync(dirPath);
            console.log("[DIRECTORY DELETED] "+dirPath);
        }
    };

    var configDB=db.collection("config");
    configDB.findOne({},function(err,config){
        var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);
        // var courseDB=db.collection("course");
        var build=require("./html-builder.js").build;

        // Load admin.html / Show table from courseDB / Log configDB & courseDB
        app.get('/monkeyadmin',function(req,res){
            console.log("[PAGE REQUEST] monkeyadmin FROM "+req.ip);
            build(db,"admin",function(page){
                res.send(page);
                // Log configDB & courseDB
                configDB.findOne({},function(err,config){
                    assert.equal(err,null);
                    console.log("[Config Collection]");
                    console.log(config);
                    courseDB.find({}).toArray(function(err,result){
                        assert.equal(err,null);
                        console.log("[Course (CR"+config.year+"Q"+config.quarter+") Collection]");
                        for(var i=0;i<result.length;i++){
                            console.log(result[i].courseName+" "+result[i].tutor+" "+result[i].day+" "+result[i].time+" #"+result[i].submission.length);
                            for(var j=0;j<result[i].submission.length;j++){
                                console.log(result[i].submission[j]);
                            }
                        }
                    });
                });
            });
        });
        // Load admin.html+message / Update status in courseDB
        app.post('/judge',function(req,res){
            console.log("[PAGE REQUEST] judge FROM "+req.ip);
            if(req.body.from=="AC"){
                courseDB.updateOne({tutor:req.body.tutor,day:req.body.day,time:req.body.time},
                    {$set:{["submission."+req.body.numberOfSub+".status"]:"accepted"}},
                    function(){
                        build(db,"admin",function(page){
                            $=cheerio.load(page);
                            $("#message").append("<pre>"+req.body.tutor+" "+req.body.day+" "+req.body.time+" #"+req.body.numberOfSub+" is accepted</pre>");
                            res.send($.html());
                        });
                    }
                );
            }
            else if(req.body.from=="RJ"){
                configDB.findOne({},function(err,config){
                    var newPath=config.path;
                    var year=config.year;
                    var quarter=config.quarter;
                    // var newPath=__dirname+"/asdf/";//For testing purpose
                    var tutor=req.body.tutor,day=req.body.day,time=req.body.time;
                    var numberOfSub=req.body.numberOfSub;
                    courseDB.findOne({tutor:tutor,day:day,time:time},function(err,result){
                        var courseName=result.courseName;
                        var dated=result.submission[numberOfSub].dated,datem=result.submission[numberOfSub].datem,datey=result.submission[numberOfSub].datey;
                        newPath+="CR"+year+"Q"+quarter+"/";
                        newPath+=courseName+"("+day.toUpperCase()+")"+"("+time+")"+"/";
                        newPath+=(parseInt(numberOfSub)+1)+"_"+dated+datem+datey+"/";
                        removeDir(newPath,false,[]);
                        courseDB.updateOne({tutor:tutor,day:day,time:time},
                            {$set:{["submission."+numberOfSub+".status"]:"rejected"}},
                            function(){
                                build(db,"admin",function(page){
                                    $=cheerio.load(page);
                                    $("#message").append("<pre>"+tutor+" "+day+" "+time+" #"+numberOfSub+" is rejected</pre>");
                                    res.send($.html());
                                });
                            }
                        );
                    });
                });
            }
        });
        // Load admin.html+message / Update path in configDB
        app.post('/update-path',function(req,res){
            console.log("[PAGE REQUEST] update-path FROM "+req.ip);
            configDB.updateOne({},{$set:{path:req.body.path+"/"}},function(){
                build(db,"admin",function(page){
                    $=cheerio.load(page);
                    configDB.findOne({},function(err,config){
                        $("#message").append("<pre>[Updated] Path = "+config.path+"</pre>");
                        $("#message").append("<div class=\"alert alert-danger\">Please restart the server to apply changes.</div>");
                        res.send($.html());
                    });
                });
            });
        });
        // Load admin.html+message / Update year&quarter in configDB
        app.post('/update-quarter',function(req,res){
            console.log("[PAGE REQUEST] update-quarter FROM "+req.ip);
            configDB.updateOne({},{$set:{year:req.body.year,quarter:req.body.quarter}},function(){
                build(db,"admin",function(page){
                    $=cheerio.load(page);
                    configDB.findOne({},function(err,config){
                        $("#message").append("<pre>[Updated] Year    = "+config.year+"</pre>");
                        $("#message").append("<pre>[Updated] Quarter = "+config.quarter+"</pre>");
                        $("#message").append("<div class=\"alert alert-danger\">Please restart the server to apply changes.</div>");
                        res.send($.html());
                    });
                });
            });
        });
        // Load admin.html+message / Get from form / Insert newCourse in courseDB
        app.post('/add-course',function(req,res){
            console.log("[PAGE REQUEST] add-course FROM "+req.ip);
            var courseName=req.body.courseName;
            var tutor=req.body.tutor;
            var day=req.body.day;
            var time=req.body.time;
            courseDB.insertOne({courseName:courseName,tutor:tutor,day:day,time:time,submission:[]},function(){
                build(db,"admin",function(page){
                    $=cheerio.load(page);
                    courseDB.find({tutor:tutor,day:day,time:time}).toArray(function(err,result){
                        for(var i=0;i<result.length;i++){
                            $("#message").append("<pre>"+result[i].courseName+" "+result[i].tutor+" "+result[i].day+" "+result[i].time+"</pre>");
                            for(var j=0;j<result[i].submission.length;j++){
                                $("#message").append("<pre>  #"+(j+1)+" : "+result[i].submission[j].status+"</pre>");
                            }
                        }
                        res.send($.html());
                    });
                });
            });
        });
        // Load admin.html / Get tutor&day&time from form / Delete course in courseDB
        app.post('/remove-course',function(req,res){
            console.log("[PAGE REQUEST] remove-course FROM "+req.ip);
            var tutor=req.body.tutor;
            var day=req.body.day;
            var time=req.body.time;
            courseDB.deleteOne({tutor:tutor,day:day,time:time},function(){
                build(db,"admin",function(page){
                    res.send(page);
                });
            });
        });
        // Load admin.html+message / Get from form / Update course in courseDB
        app.post('/edit-course',function(req,res){
            console.log("[PAGE REQUEST] edit-course FROM "+req.ip);
            var tutor=req.body.tutor;
            var day=req.body.day;
            var time=req.body.time;
            var courseName=req.body.courseName;
            var newTutor=req.body.newTutor;
            var newDay=req.body.newDay;
            var newTime=req.body.newTime;
            courseDB.updateOne({tutor:tutor,day:day,time:time},
                {$set:{courseName:courseName,tutor:newTutor,day:newDay,time:newTime}},
                function(){
                    build(db,"admin",function(page){
                        $=cheerio.load(page);
                        courseDB.find({tutor:newTutor,day:newDay,time:newTime}).toArray(function(err,result){
                            for(var i=0;i<result.length;i++){
                                $("#message").append("<pre>CHANGE "+tutor+" "+day+" "+time+" --> "+result[i].courseName+" "+result[i].tutor+" "+result[i].day+" "+result[i].time+"</pre>");
                                $("#message").append("<pre>"+result[i].courseName+" "+result[i].tutor+" "+result[i].day+" "+result[i].time+"</pre>");
                                for(var j=0;j<result[i].submission.length;j++){
                                    $("#message").append("<pre>  #"+(j+1)+" : "+result[i].submission[j].status+"</pre>");
                                }
                            }
                            res.send($.html());
                        });
                    });
                }
            );
        });
        // Load admin.html / Get tutor&day&time from form / Delete course in courseDB
        app.post('/remove-submission',function(req,res){
            console.log("[PAGE REQUEST] remove-submission FROM "+req.ip);
            var tutor=req.body.tutor;
            var day=req.body.day;
            var time=req.body.time;
            var numberOfSub=req.body.numberOfSub;
            courseDB.updateOne({tutor:tutor,day:day,time:time},{$set:{["submission."+(numberOfSub-1)]:null}},function(){
                build(db,"admin",function(page){
                    res.send(page);
                });
            });
        });
    });
}
module.exports.run=run;
