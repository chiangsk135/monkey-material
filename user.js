console.log("[STARTING] user.js");
var run=function(app,db){

    var cheerio=require('cheerio');
    var fs=require("fs-extra");

    var configDB=db.collection("config");
    configDB.findOne({},function(err,config){
        var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);
        var build=require("./html-builder.js").build;

        // Send user.html
        app.get('/',function(req,res){
            console.log("[PAGE REQUEST] index FROM "+req.ip);
            build(db,"user",function(page){
                res.send(page);
            });
        });
        // Load user.html(modded) / Get configDB / Get input from form / Get courseName from courseDB / Fill newPath / Read and Write newfile / Insert new submission in courseDB
        app.post('/file-upload',function(req,res){
            console.log("[PAGE REQUEST] file-upload FROM "+req.ip);

            configDB.findOne({},function(err,result){
                var newPath=result.path;
                var year=result.year;
                var quarter=result.quarter;
                // var newPath=__dirname+"/asdf/";//For testing purpose
                var tutor=req.body.tutor,day=req.body.day,time=req.body.time;
                var numberOfSub=req.body.numberOfSub;
                var dated=req.body.dated,datem=req.body.datem,datey=req.body.datey;
                courseDB.findOne({tutor:tutor,day:day,time:time},function(err,result){
                    if(result==null){
                        console.log("[ERROR] Specified course does not exist");
                        build(db,"user",function(page){
                            $=cheerio.load(page);
                            $("#message").append("<p>Specified course does not exist</p>");
                            res.send($.html());
                        });
                    }
                    else{
                        var courseName=result.courseName;
                        newPath+="CR"+year+"Q"+quarter+"/";
                        newPath+=courseName+"("+day.toUpperCase+")"+"("+time+")"+"/";
                        newPath+=numberOfSub+"_"+dated+datem+datey+"/";

                        build(db,"user",function(page){
                            $=cheerio.load(page);
                            // TODO remove-exist-files
                            var noAnyError=true;
                            for(var i=0;i<req.files.length;i++){
                                var noError=true;
                                var originalName=req.files[i].originalname;
                                var oldPath=req.files[i].path;
                                var file=newPath+originalName;

                                try{
                                    var data=fs.readFileSync(oldPath);
                                }catch(err){
                                    noError=false;
                                    noAnyError=false;
                                    console.error(err);
                                    $("#message").append("<pre>"+err.message+"</pre>");
                                }
                                if(noError){
                                    try{
                                        fs.writeFileSync(file, data);
                                    }catch(err){
                                        noError=false;
                                        noAnyError=false;
                                        console.error(err);
                                        $("#message").append("<pre>"+err.message+"</pre>");
                                    }
                                    if(noError){
                                        console.log("[FILE UPLOADED] "+originalName+" from "+oldPath+" to "+newPath+"]");
                                        $("#message").append("<pre>File #"+(i+1)+" uploaded : "+originalName+"</pre>");
                                    }
                                }
                            }
                            if(noAnyError){
                                courseDB.updateOne({tutor:tutor,day:day,time:time},
                                    {$set:{["submission."+(numberOfSub-1)]:{dated:dated,datem:datem,datey:datey,status:"pending"}}},
                                    function(err,result){
                                        if(err)console.error(err);
                                        courseDB.find({tutor:tutor,day:day,time:time}).toArray(function(err,result){
                                            for(var i=0;i<result.length;i++){
                                                $("#message").append("<pre>"+result[i].courseName+" "+result[i].tutor+" "+result[i].day+" "+result[i].time+"</pre>");
                                                for(var j=0;j<result[i].submission.length;j++){
                                                    if(result[i].submission[j]!=null)$("#message").append("<pre>  #"+(j+1)+" : "+result[i].submission[j].status+"</pre>");
                                                }
                                            }
                                            res.send($.html());
                                        });
                                    }
                                );
                            }
                            else{
                                $("#message").append("<pre>  Error occurs </pre>");
                                courseDB.find({tutor:tutor,day:day,time:time}).toArray(function(err,result){
                                    for(var i=0;i<result.length;i++){
                                        $("#message").append("<pre>"+result[i].courseName+" "+result[i].tutor+" "+result[i].day+" "+result[i].time+"</pre>");
                                        for(var j=0;j<result[i].submission.length;j++){
                                            if(result[i].submission[j]!=null)$("#message").append("<pre>  #"+(j+1)+" : "+result[i].submission[j].status+"</pre>");
                                        }
                                    }
                                    res.send($.html());
                                });
                            }
                        });
                    }
                });
            });
        });
    });
}
module.exports.run=run;
