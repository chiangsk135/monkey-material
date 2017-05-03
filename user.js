console.log("[STARTING] user.js");
var run=function(app,db){

    var cheerio = require('cheerio');
    var fs=require("fs-extra");

    var configDB=db.collection("config");
    var courseDB=db.collection("course");

    // Send index.html
    app.get('/',function(req,res){
        console.log("[PAGE REQUEST] index FROM "+req.ip);
        // res.sendFile(__dirname+"/index.html");
        $=cheerio.load(fs.readFileSync(__dirname+"/index.html"));
        // $("select[name=\"tutor\"]").append("<option value=\"chiang\">Chiang</option>");
        res.send($.html());
    });
    // Load index.html(modded) / Get configDB / Get input from form / Get courseName from courseDB / Fill newPath / Read and Write newfile / Insert new submission in courseDB
    app.post('/file_upload',function(req,res){
        console.log("[PAGE REQUEST] file_upload FROM "+req.ip);

        $=cheerio.load(fs.readFileSync(__dirname+"/index.html"));
        configDB.findOne({},function(err,doc){
            var newPath=doc.path;
            var year=doc.year;
            var quarter=doc.quarter;
            // TODO make dir if not exists
            // var newPath=__dirname+"/asdf/";//For testing purpose
            var tutor=req.body.tutor,day=req.body.day,time=req.body.time,numberOfSub=req.body.numberOfSub;
            var dated=req.body.dated,datem=req.body.datem,datey=req.body.datey;
            courseDB.findOne({tutor:tutor,day:day,time:time},function(err,doc){
                var courseName=doc.courseName;

                newPath+="CR"+year+"Q"+quarter+"/";
                newPath+=courseName+"("+day+")"+"("+time+")"+"/";
                newPath+=numberOfSub+"_"+dated+datem+datey+"/";
                // TODO warning-exist-file
                for(var i=0;i<req.files.length;i++){
                    var noError=true;
                    var originalName=req.files[i].originalname;
                    var oldPath=req.files[i].path;
                    var file=newPath+originalName;

                    try{
                        var data=fs.readFileSync(oldPath);
                    }catch(err){
                        noError=false;
                        console.error(err);
                        $("#result").append("<p>"+err.message+"</p>");
                    }
                    if(noError){
                        try{
                            fs.writeFileSync(file, data);
                        }catch(err){
                            noError=false;
                            console.error(err);
                            $("#result").append("<p>"+err.message+"</p>");
                        }
                        if(noError){
                            console.log("[FILE UPLOADED : "+originalName+" from "+oldPath+" to "+newPath+"]");
                            $("#result").append("<p>File #"+(i+1)+" uploaded : "+originalName+"</p>");
                        }
                    }
                }

                courseDB.updateOne({tutor:tutor,day:day,time:time},
                    {$set:{["submission."+(numberOfSub-1)]:{dated:dated,datem:datem,datey:datey,status:"pending"}}},
                    // {$push:{"submission":"Subb"}},
                    function(err,result){
                        if(err)console.error(err);
                        // else console.log(result);
                        courseDB.findOne({tutor:tutor,day:day,time:time},function(err,doc){
                            console.log(doc);
                        });
                    }
                );

                $("#result").after("<input type=\"button\" onclick=\"window.history.back()\" value=\"Back\">");
                res.send($.html());
            });
        });
    });
}
module.exports.run=run;
