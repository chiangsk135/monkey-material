console.log("[STARTING] index.js");

var bodyParser=require("body-parser");
var express=require("express");
var multer=require("multer");
var MongoClient=require('mongodb').MongoClient;
var assert=require('assert');

var app=express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({dest:"/tmp/"}).any());
app.listen(80);

MongoClient.connect("mongodb://127.0.0.1:27017/monkey-material",function(err,db){
    assert.equal(err,null);
    console.log("[CONNECTED] MongoDB successfully");
    // List all databases
    db.admin().listDatabases(function(err,result){
        console.log("[List of databases]");
        console.log(result);
        //List all collections
        db.listCollections().toArray(function(err,result){
            console.log("[List of collections]");
            console.log(result);
        });
    });
    var configDB=db.collection("config");
    configDB.findOne({},function(err,config){
        if(config==null){
            configDB.insertOne({year:0,quarter:0},function(err){
                assert.equal(err,null);
                console.log("[WARNING] Go to /monkeyadmin to config path/year/quarter");
            });
        }
        configDB.findOne({},function(err,config){
            var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);
            // var courseDB=db.collection("course");
            require("./admin.js").run(app,db);
            require("./user.js").run(app,db);

            // courseDB.updateOne({tutor:"view",day:"SUN",time:"10-12"},{$set:{submission:[]}});
            // courseDB.updateOne({tutor:"view",day:"SUN",time:"10-12"},{$unset:{NaN:""}});
            // courseDB.findOne({tutor:"view",day:"SUN",time:"10-12"},function(err,result){
            //     console.log("========");
            //     console.log(result);
            //     console.log("========");
            // });

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
});
