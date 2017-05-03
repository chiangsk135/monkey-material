console.log("[STARTING] admin.js");
var run=function(app,db){

    var cheerio = require('cheerio');
    var fs=require("fs-extra");
    var assert = require('assert');

    var configDB=db.collection("config");
    var courseDB=db.collection("course");

    // Load admin.html(modded) / Show table from courseDB / Log configDB & courseDB
    app.get('/monkeyadmin',function(req,res){
        console.log("[PAGE REQUEST] monkeyadmin FROM "+req.ip);

        $=cheerio.load(fs.readFileSync(__dirname+"/admin.html"));
        // $("select[name=\"tutor\"]").append("<option value=\"chiang\">Chiang</option>");
        courseDB.find({}).toArray(function(err, docs) {
            assert.equal(err, null);
            $("table").append("<tr></tr>");
            for(var i=0;i<docs.length;i++)$("table tr:last-child").append("<td>"+docs[i].tutor+"</td>");
            $("table").append("<tr></tr>");
            for(var i=0;i<docs.length;i++)$("table tr:last-child").append("<td>"+docs[i].day+"</td>");
            $("table").append("<tr></tr>");
            for(var i=0;i<docs.length;i++)$("table tr:last-child").append("<td>"+docs[i].time+"</td>");
            $("table").append("<tr></tr>");
            for(var i=0;i<docs.length;i++)$("table tr:last-child").append("<td>"+docs[i].courseName+"</td>");
            for(var i=0;i<12;i++){
                $("table").append("<tr></tr>");
                for(var j=0;j<docs.length;j++){
                    if(docs[j].submission[i])$("table tr:last-child").append("<td>"+docs[j].submission[i].status+"</td>");// TODO add URL & Accept/Reject
                    else $("table tr:last-child").append("<td>-</td>");
                }
            }
            res.send($.html());
        });

        configDB.find({}).toArray(function(err, docs) {
            assert.equal(err, null);
            console.log("[Config Collection]");
            console.log(docs);
        });
        courseDB.find({}).toArray(function(err, docs) {
            assert.equal(err, null);
            console.log("[Course Collection]");
            // console.log(docs);
            for(var i=0;i<docs.length;i++){
                console.log(docs[i].courseName+" "+docs[i].tutor+" "+docs[i].day+" "+docs[i].time+" "+docs[i].submission);
            }
        });
    });
    // Load admin.html / Update path in configDB
    app.post('/update-path',function(req,res){
        console.log("[PAGE REQUEST] update-path FROM "+req.ip);
        // TODO insert if not exists
        //console.log(db.collection("config").findOne());
        // db.collection("config").insertOne({path:"hello"});
        db.collection("config").updateOne({},{$set:{path:req.body.path}});
        res.sendFile(__dirname+"/admin.html");
    });
    // Load admin.html / Update year&quarter in configDB
    app.post('/update-quarter',function(req,res){
        console.log("[PAGE REQUEST] update-quarter FROM "+req.ip);
        // db.collection("config").insertOne({year:135,quarter:135});
        db.collection("config").updateOne({},{$set:{year:req.body.year,quarter:req.body.quarter}});
        res.sendFile(__dirname+"/admin.html");
    });
    // Load admin.html / Get from form / Insert newCourse in courseDB / Log configDB & courseDB
    app.post('/add-course',function(req,res){
        console.log("[PAGE REQUEST] add-course FROM "+req.ip);
        var courseName=req.body.courseName;
        var tutor=req.body.tutor;
        var day=req.body.day;
        var time=req.body.time;
        courseDB.insertOne({courseName:courseName,tutor:tutor,day:day,time:time,submission:[]});
        res.sendFile(__dirname+"/admin.html");

        configDB.find({}).toArray(function(err, docs) {
            assert.equal(err, null);
            console.log("[Config Collection]");
            console.log(docs);
        });
        courseDB.find({}).toArray(function(err, docs) {
            assert.equal(err, null);
            console.log("[Course Collection]");
            // console.log(docs);
            for(var i=0;i<docs.length;i++){
                console.log(docs[i].courseName+" "+docs[i].tutor+" "+docs[i].day+" "+docs[i].time+" "+docs[i].submission);
            }
        });
    });
    // Load admin.html / Get tutor&day&time from form / Delete course in courseDB
    app.post('/remove-course',function(req,res){
        console.log("[PAGE REQUEST : remove-course from "+req.ip+"]");
        var tutor=req.body.tutor;
        var day=req.body.day;
        var time=req.body.time;
        courseDB.deleteOne({tutor:tutor,day:day,time:time});
        res.sendFile(__dirname+"/admin.html");
    });
    // Load admin.html / Get tutor&day&time from form / Delete course in courseDB
    app.post('/remove-submission',function(req,res){
        console.log("[PAGE REQUEST : remove-submission from "+req.ip+"]");
        var tutor=req.body.tutor;
        var day=req.body.day;
        var time=req.body.time;
        var numberOfSub=req.body.numberOfSub;
        // courseDB.updateOne({tutor:tutor,day:day,time:time},
        //     {$set:{"submission.numberOfSub":{dated:dated,datem:datem,datey:datey,status:"pending"}}});
        courseDB.updateOne({tutor:tutor,day:day,time:time},{$set:{["submission."+(numberOfSub-1)]:null}});
        res.sendFile(__dirname+"/admin.html");
    });
}
module.exports.run=run;
