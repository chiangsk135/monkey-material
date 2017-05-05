console.log("[STARTING] admin.js");
var run=function(app,db){

    var cheerio = require('cheerio');
    var fs=require("fs-extra");
    var assert = require('assert');

    var configDB=db.collection("config");
    configDB.findOne({},function(err,config){
        // var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);
        var courseDB=db.collection("course");
        var build=require("./html-builder.js").build;

        // Load admin.html / Show table from courseDB / Log configDB & courseDB
        app.get('/monkeyadmin',function(req,res){
            console.log("[PAGE REQUEST] monkeyadmin FROM "+req.ip);

            // $=cheerio.load(require("./html-builder.js").build(db,"admin"));
            build(db,"admin",function(page){
                res.send(page);
                configDB.find({}).toArray(function(err,result){
                    assert.equal(err, null);
                    console.log("[Config Collection]");
                    console.log(result);
                });
                courseDB.find({}).toArray(function(err,result){
                    assert.equal(err, null);
                    console.log("[Course Collection]");
                    // console.log(result);
                    for(var i=0;i<result.length;i++){
                        console.log(result[i].courseName+" "+result[i].tutor+" "+result[i].day+" "+result[i].time+" #"+result[i].submission.length);
                        for(var j=0;j<result[i].submission.length;j++){
                            console.log(result[i].submission[j]);
                        }
                    }
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
                            configDB.findOne({},function(err,result){
                                $("#message").append("<pre>"+req.body.tutor+" "+req.body.day+" "+req.body.time+" #"+req.body.numberOfSub+" is accepted</pre>");
                                res.send($.html());
                            });
                        });
                    }
                );
            }
            else if(req.body.from=="RJ"){
                courseDB.updateOne({tutor:req.body.tutor,day:req.body.day,time:req.body.time},
                    {$set:{["submission."+req.body.numberOfSub+".status"]:"rejected"}},
                    function(){
                        build(db,"admin",function(page){
                            $=cheerio.load(page);
                            configDB.findOne({},function(err,result){
                                $("#message").append("<pre>"+req.body.tutor+" "+req.body.day+" "+req.body.time+" #"+req.body.numberOfSub+" is rejected</pre>");
                                res.send($.html());
                            });
                        });
                    }
                );
            }
        });
        // Load admin.html+message / Update path in configDB
        app.post('/update-path',function(req,res){
            console.log("[PAGE REQUEST] update-path FROM "+req.ip);
            // TODO insert if not exists
            configDB.updateOne({},{$set:{path:req.body.path+"/"}},function(){
                build(db,"admin",function(page){
                    $=cheerio.load(page);
                    configDB.findOne({},function(err,result){
                        $("#message").append("<pre>*Path   = "+result.path+"</pre>");
                        $("#message").append("<pre>Local   = "+result.local+"</pre>");
                        $("#message").append("<pre>Year    = "+result.year+"</pre>");
                        $("#message").append("<pre>Quarter = "+result.quarter+"</pre>");
                        res.send($.html());
                    });
                });
            });
        });
        // Load admin.html+message / Update local in configDB
        app.post('/update-local',function(req,res){
            console.log("[PAGE REQUEST] update-local FROM "+req.ip);
            // TODO insert if not exists
            configDB.updateOne({},{$set:{local:"file:///"+req.body.path+"/"}},function(){
                build(db,"admin",function(page){
                    $=cheerio.load(page);
                    configDB.findOne({},function(err,result){
                        $("#message").append("<pre>Path    = "+result.path+"</pre>");
                        $("#message").append("<pre>*Local  = "+result.local+"</pre>");
                        $("#message").append("<pre>Year    = "+result.year+"</pre>");
                        $("#message").append("<pre>Quarter = "+result.quarter+"</pre>");
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
                    configDB.findOne({},function(err,result){
                        $("#message").append("<pre>Path     = "+result.path+"</pre>");
                        $("#message").append("<pre>Local    = "+result.local+"</pre>");
                        $("#message").append("<pre>*Year    = "+result.year+"</pre>");
                        $("#message").append("<pre>*Quarter = "+result.quarter+"</pre>");
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
