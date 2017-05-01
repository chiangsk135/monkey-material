console.log("[STARTING] index.js");

var bodyParser=require("body-parser");
var express=require("express");
var fs=require("fs-extra");
var multer=require("multer");
// var mongodb=require("mongodb");

// var MongoClient=require("./connect-mongodb.js").connect();
var app=express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({dest:"/tmp/"}).any());
app.listen(80);

app.get('/',function(req,res){
    console.log("[PAGE REQUEST : index from "+req.ip+"]");
    res.sendFile(__dirname+"/index.html");
});

app.post('/file_upload',function(req,res){
    console.log("[PAGE REQUEST : upload from "+req.ip+"]");
    var output="<html><body>";

    // TODO var newPath=query();
    // TODO var year=query(),quarter=query();
    // TODO var coursename=query(),day=query(),time=query();
    // var newPath="";
    // var newPath=__dirname+"/asdf/";//For testing purpose
    var year=60,quarter=2;
    var courseName=req.body.course,day=req.body.day,time=req.body.time;
    var number=req.body.number,dated=req.body.dated,datem=req.body.datem,datey=req.body.datey;
    newPath+="CR"+year+"Q"+quarter+"/";
    newPath+=courseName+"("+day+")"+"("+time+")"+"/";
    newPath+=number+"_"+dated+datem+datey+"/";
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
            output+="<p>"+err.message+"</p>";
        }
        if(noError){
            try{
                fs.writeFileSync(file, data);
            }catch(err){
                noError=false;
                console.error(err);
                output+="<p>"+err.message+"</p>";
            }
            if(noError){
                console.log("[FILE UPLOADED : "+originalName+" from "+oldPath+" to "+newPath+"]");
                output+="<p>File #"+(i+1)+" uploaded : "+originalName+"</p>";
            }
        }
    }
    output+="<input type=\"button\" onclick=\"window.history.back()\" value=\"Back\"></body></html>";
    res.end(output);
});

app.get('/monkeyadmin',function(req,res){
    console.log("[PAGE REQUEST : monkeyadmin from "+req.ip+"]");
    res.sendFile(__dirname+"/admin.html");
})

app.post('/update-path',function(req,res){
    console.log("[PAGE REQUEST : update-path from "+req.ip+"]");
    res.sendFile(__dirname+"/admin.html");
})

app.post('/update-quarter',function(req,res){
    console.log("[PAGE REQUEST : update-quarter from "+req.ip+"]");
    res.sendFile(__dirname+"/admin.html");
})

app.post('/query-sql',function(req,res){
    console.log("[PAGE REQUEST : query-sql from "+req.ip+"]");
    res.sendFile(__dirname+"/admin.html");
})

app.post('/init',function(req,res){
    console.log("[PAGE REQUEST : init from "+req.ip+"]");
    res.sendFile(__dirname+"/admin.html");
})
