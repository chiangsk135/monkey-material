console.log("[STARTING] html-builder.js");
var build=function(db,what,callback){

    var cheerio = require('cheerio');
    var fs=require("fs-extra");

    var configDB=db.collection("config");
    var courseDB=db.collection("course");

    var tutorInput=function(){
        return "<select name=\"tutor\" required>"+
            "<option disabled selected value> == Select tutor == </option>"+
            "<option value=\"third\">Third</option>"+
            "<option value=\"beng\">Beng</option>"+
            "<option value=\"ya\">Ya</option>"+
            "<option value=\"paan\">Paan</option>"+
            "<option value=\"view\">View</option>"+
            "<option value=\"bb\">BB</option>"+
            "<option value=\"gag\">Gag</option>"+
            "<option value=\"anne\">Anne</option>"+
            "<option value=\"bg\">BG</option>"+
            "<option value=\"louis\">Louis</option>"+
            "<option value=\"ten\">Ten</option>"+
            "<option value=\"pre\">Pre</option>"+
            "<option value=\"atom\">Atom</option>"+
            "<option value=\"pe/ch\">Pepe/Chote</option>"+
        "</select>";
    }
    var dayInput=function(){
        return "<select name=\"day\" required>"+
            "<option disabled selected value> == Select day == </option>"+
            "<option value=\"SAT\">Saturday</option>"+
            "<option value=\"SUN\">Sunday</option>"+
        "</select>";
    }
    var timeInput=function(){
        return "<select name=\"time\" required>"+
            "<option disabled selected value> == Select time == </option>"+
            "<option value=\"8-10\">8.00-10.00</option>"+
            "<option value=\"10-12\">10.00-12.00</option>"+
            "<option value=\"13-15\">13.00-15.00</option>"+
            "<option value=\"15-17\">15.00-17.00</option>"+
        "</select>";
    }
    var numberOfSubInput=function(){
        var ret="<select name=\"numberOfSub\" required>"+
            "<option disabled selected value> == Select # of submission == </option>";
        for(var i=1;i<=12;i++){
            ret+="<option value=\""+i+"\">"+i+"</option>";
        }
        ret+="</select>";
        return ret;
    }
    var datedInput=function(){
        var ret="<select name=\"dated\" required>"+
            "<option disabled selected value> Day </option>";
        for(var i=1;i<=9;i++){
            ret+="<option value=\"0"+i+"\">"+i+"</option>";
        }
        for(var i=10;i<=31;i++){
            ret+="<option value=\""+i+"\">"+i+"</option>";
        }
        ret+="</select>";
        return ret;
    }
    var datemInput=function(){
        return "<select name=\"datem\" required>"+
            "<option disabled selected value> Month </option>"+
            "<option value=\"01\">January</option>"+
            "<option value=\"02\">Febuary</option>"+
            "<option value=\"03\">March</option>"+
            "<option value=\"04\">April</option>"+
            "<option value=\"05\">May</option>"+
            "<option value=\"06\">June</option>"+
            "<option value=\"07\">July</option>"+
            "<option value=\"08\">August</option>"+
            "<option value=\"09\">September</option>"+
            "<option value=\"10\">October</option>"+
            "<option value=\"11\">November</option>"+
            "<option value=\"12\">December</option>"+
        "</select>";
    }
    var dateyInput=function(){
        return "<select name=\"datey\" required>"+
            "<option disabled selected value> Year </option>"+
            "<option value=\"17\">2017</option>"+
            "<option value=\"18\">2018</option>"+
        "</select>";
    }
    var submitInput=function(val){
        return "<input type=\"submit\" value=\""+val+"\">";
    }

    if(what=="admin"){
        $=cheerio.load(fs.readFileSync(__dirname+"/admin.html"));
        $("form[action=\"add-course\"]").append(tutorInput()+dayInput()+timeInput()+submitInput("Add new course"));
        $("form[action=\"remove-course\"]").append(tutorInput()+dayInput()+timeInput()+submitInput("Remove course"));
        $("form[action=\"remove-submission\"]").append(tutorInput()+dayInput()+timeInput()+numberOfSubInput()+submitInput("Remove submission"));

        courseDB.find({}).toArray(function(err,result){
            $("table").append("<tr></tr>");
            for(var i=0;i<result.length;i++)$("table tr:last-child").append("<td>"+result[i].tutor+"</td>");
            $("table").append("<tr></tr>");
            for(var i=0;i<result.length;i++)$("table tr:last-child").append("<td>"+result[i].day+"</td>");
            $("table").append("<tr></tr>");
            for(var i=0;i<result.length;i++)$("table tr:last-child").append("<td>"+result[i].time+"</td>");
            $("table").append("<tr></tr>");
            for(var i=0;i<result.length;i++)$("table tr:last-child").append("<td>"+result[i].courseName+"</td>");
            for(var i=0;i<12;i++){
                $("table").append("<tr></tr>");
                for(var j=0;j<result.length;j++){
                    if(result[j].submission[i])$("table tr:last-child").append("<td>"+result[j].submission[i].status+"</td>");// TODO add URL & Accept/Reject
                    else $("table tr:last-child").append("<td>-</td>");
                }
            }

            // $("#result").append("<pre>newPath = "+result.quarter+"</pre>");
            // $("#result").after("<input type=\"button\" onclick=\"window.location=\"\"\" value=\"Back\">");

            callback($.html());
        });
    }
    else if(what=="user"){
        $=cheerio.load(fs.readFileSync(__dirname+"/user.html"));
        $("form[action=\"file-upload\"]").append(tutorInput()+dayInput()+timeInput()+numberOfSubInput()+
            " Teach date : "+datedInput()+datemInput()+dateyInput()+
            "<br><br><input type=\"file\" name=\"file\" multiple required>"+submitInput("Upload File"));
        callback($.html());
    }
}
module.exports.build=build;