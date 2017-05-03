console.log("[STARTING] index.js");

var bodyParser=require("body-parser");
var express=require("express");
var multer=require("multer");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var app=express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({dest:"/tmp/"}).any());
app.listen(80);

MongoClient.connect("mongodb://localhost:27017/monkey-material",function(err,db){
    assert.equal(null, err);
    console.log("[CONNECTED] MongoDB successfully");
    var configDB=db.collection("config");
    var courseDB=db.collection("course");
    require("./admin.js").run(app,db);
    require("./user.js").run(app,db);

    // courseDB.updateOne({tutor:"view",day:"SUN",time:"10-12"},{$set:{submission:[]}});
    // courseDB.updateOne({tutor:"view",day:"SUN",time:"10-12"},{$unset:{NaN:""}});
    // courseDB.findOne({tutor:"view",day:"SUN",time:"10-12"},function(err,doc){
    //     console.log("========");
    //     console.log(doc);
    //     console.log("========");
    // });

    // List all databases
    db.admin().listDatabases(function(err,dbs){
        assert.equal(null, err);
        assert.ok(dbs.databases.length > 0);
        console.log("[List of databases]");
        console.log(dbs);
    });
    // Log configDB & courseDB
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
            console.log(docs[i].courseName+" "+docs[i].tutor+" "+docs[i].day+" "+docs[i].time+" #"+docs[i].submission.length);
            for(var j=0;j<docs[i].submission.length;j++){
                console.log(docs[i].submission[j]);
            }
        }
    });
});
