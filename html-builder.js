console.log("[STARTING] html-builder.js");
var build=function(db,what,callback){

    var cheerio=require('cheerio');
    var fs=require("fs-extra");

    var configDB=db.collection("config");
    configDB.findOne({},function(err,config){
        var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);
        // var courseDB=db.collection("course");

        var tutorInput=function(){
            var tutor=["third","beng","ya","paan","view","bb","gag","anne","bg","louis","ten","pre","atom","pe/ch"];
            var $=cheerio.load("<select></select>");
            $("select").addClass("form-control");
            $("select").append("<option disabled selected> == Select tutor == </option>");
            for(var i=0;i<tutor.length;i++){
                $("select").append("<option>"+tutor[i].toUpperCase()+"</option>");
                $("select option:last-child").val(tutor[i]);
            }
            return $.html();
        }
        var dayInput=function(){
            return "<select class=\"form-control\" name=\"day\" required>"+
                "<option disabled selected value> == Select day == </option>"+
                "<option value=\"SAT\">Saturday</option>"+
                "<option value=\"SUN\">Sunday</option>"+
            "</select>";
        }
        var timeInput=function(){
            return "<select class=\"form-control\" name=\"time\" required>"+
                "<option disabled selected value> == Select time == </option>"+
                "<option value=\"8-10\">8.00-10.00</option>"+
                "<option value=\"10-12\">10.00-12.00</option>"+
                "<option value=\"13-15\">13.00-15.00</option>"+
                "<option value=\"15-17\">15.00-17.00</option>"+
            "</select>";
        }
        var numberOfSubInput=function(){
            var ret="<select class=\"form-control\" name=\"numberOfSub\" required>"+
                "<option disabled selected value> == Select # of submission == </option>";
            for(var i=1;i<=12;i++){
                ret+="<option value=\""+i+"\">"+i+"</option>";
            }
            ret+="</select>";
            return ret;
        }
        var datedInput=function(){
            var ret="<select class=\"form-control\" name=\"dated\" required>"+
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
            return "<select class=\"form-control\" name=\"datem\" required>"+
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
            return "<select class=\"form-control\" name=\"datey\" required>"+
                "<option disabled selected value> Year </option>"+
                "<option value=\"17\">2017</option>"+
                "<option value=\"18\">2018</option>"+
            "</select>";
        }
        var submitInput=function(val){
            return "<input type=\"submit\" class=\"btn btn-default\" value=\""+val+"\">";
        }
        var digit=function(numDigit,x){
            var ret=x.toString();
            while(ret.length<numDigit)ret="0"+ret;
            return ret;
        }

        if(what=="admin"){
            $=cheerio.load(fs.readFileSync(__dirname+"/admin.html"));
            $("form").addClass("form-inline");
            $("form[action=\"add-course\"]").append(tutorInput()+dayInput()+timeInput()+submitInput("Add new course"));
            $("form[action=\"remove-course\"]").append(tutorInput()+dayInput()+timeInput()+submitInput("Remove course"));
            $("form[action=\"edit-course\"]").append(tutorInput()+dayInput()+timeInput()+submitInput("Edit course"));
            $("form[action=\"edit-course\"] [name=\"tutor\"]").attr("name","newTutor");
            $("form[action=\"edit-course\"] [name=\"day\"]").attr("name","newDay");
            $("form[action=\"edit-course\"] [name=\"time\"]").attr("name","newTime");
            $("form[action=\"edit-course\"]").prepend("old course : "+tutorInput()+dayInput()+timeInput()+"<br>");
            $("form[action=\"remove-submission\"]").append(tutorInput()+dayInput()+timeInput()+numberOfSubInput()+submitInput("Remove submission"));

            courseDB.find({}).toArray(function(err,result){
                configDB.findOne({},function(err,config){
                    var path=config.path;
                    var year=config.year;
                    var quarter=config.quarter;
                    $("#tracking thead").append("<tr></tr>");
                    for(var i=0;i<result.length;i++){
                        $("#tracking thead tr:last-child").append("<th>KRU "+result[i].tutor.toUpperCase()+"</th>");
                        $("#tracking thead tr:last-child th:last-child").addClass("tutor");
                    }
                    $("#tracking thead").append("<tr></tr>");
                    for(var i=0;i<result.length;i++){
                        $("#tracking thead tr:last-child").append("<th>"+result[i].day+"</th>");
                        $("#tracking thead tr:last-child th:last-child").addClass(result[i].day.toLowerCase());
                    }
                    $("#tracking thead").append("<tr></tr>");
                    for(var i=0;i<result.length;i++){
                        $("#tracking thead tr:last-child").append("<th>"+result[i].time+"</th>");
                        $("#tracking thead tr:last-child th:last-child").addClass("time");
                    }
                    $("#tracking thead").append("<tr></tr>");
                    for(var i=0;i<result.length;i++){
                        $("#tracking thead tr:last-child").append("<th>"+result[i].courseName+"</th>");
                        $("#tracking thead tr:last-child th:last-child").addClass("time");
                    }
                    for(var i=0;i<12;i++){
                        $("#tracking tbody").append("<tr></tr>");
                        for(var j=0;j<result.length;j++){
                            if(result[j].submission[i]){
                                $("#tracking tbody tr:last-child").append("<td></td>");
                                if(result[j].submission[i].status=="pending")$("#tracking tbody tr:last-child td:last-child").addClass("bg-warning");
                                else if(result[j].submission[i].status=="accepted")$("#tracking tbody tr:last-child td:last-child").addClass("bg-success");
                                else if(result[j].submission[i].status=="rejected")$("#tracking tbody tr:last-child td:last-child").addClass("bg-danger");
                                $("#tracking tbody tr:last-child td:last-child").append("<a href=\""+config.local+
                                    "CR"+year+"Q"+quarter+"/"+
                                    result[j].courseName+"("+result[j].day+")"+"("+result[j].time+")"+"/"+
                                    (i+1)+"_"+result[j].submission[i].dated+result[j].submission[i].datem+result[j].submission[i].datey+"/\">"+
                                    "#"+(i+1)+"_"+result[j].submission[i].dated+result[j].submission[i].datem+result[j].submission[i].datey+"</a>");
                                $("#tracking tbody tr:last-child td:last-child").append(" <code>"+result[j].submission[i].status+"</code>");
                                $("#tracking tbody tr:last-child td:last-child").append("<form method=\"post\" action=\"judge\"></form>");
                                $("#tracking tbody tr:last-child td:last-child form:last-child").append("<input type=\"hidden\" value=\""+result[j].tutor+"\" name=\"tutor\">");
                                $("#tracking tbody tr:last-child td:last-child form:last-child").append("<input type=\"hidden\" value=\""+result[j].day+"\" name=\"day\">");
                                $("#tracking tbody tr:last-child td:last-child form:last-child").append("<input type=\"hidden\" value=\""+result[j].time+"\" name=\"time\">");
                                $("#tracking tbody tr:last-child td:last-child form:last-child").append("<input type=\"hidden\" value=\""+i+"\" name=\"numberOfSub\">");
                                $("#tracking tbody tr:last-child td:last-child form:last-child").append("<div class=\"btn-group\"></div>");
                                $("#tracking tbody tr:last-child td:last-child form:last-child .btn-group").append("<input type=\"submit\" class=\"btn btn-success btn-xs\" value=\"AC\" name=\"from\">");
                                $("#tracking tbody tr:last-child td:last-child form:last-child input:last-child").attr("onclick","window.location=\"mailto:?subject=TO%20(name),"+result[j].courseName+digit(2,i+1)+"%20ACCEPTED\"");
                                $("#tracking tbody tr:last-child td:last-child form:last-child .btn-group").append("<input type=\"submit\" class=\"btn btn-danger btn-xs\" value=\"RJ\" name=\"from\">");
                                $("#tracking tbody tr:last-child td:last-child form:last-child input:last-child").attr("onclick","window.location=\"mailto:?subject=TO%20(name),"+result[j].courseName+digit(2,i+1)+"%20REJECTED\"");
                            }
                            else{
                                $("#tracking tbody tr:last-child").append("<td>-</td>");
                                $("#tracking tbody tr:last-child td:last-child").addClass("bg-info");
                            }
                        }
                    }
                    callback($.html());
                });
            });
        }
        else if(what=="user"){
            $=cheerio.load(fs.readFileSync(__dirname+"/user.html"));
            $("form").addClass("form-inline");
            $("form[action=\"file-upload\"]").append(tutorInput()+dayInput()+timeInput()+numberOfSubInput()+
                " Teach date : "+datedInput()+datemInput()+dateyInput()+
                "<br><br><input class=\"form-control\" type=\"file\" name=\"file\" multiple required>"+submitInput("Upload File"));
            callback($.html());
        }
    });
}
module.exports.build=build;
