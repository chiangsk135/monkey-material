console.log("[STARTING] html-builder.js");
var build=function(db,what,callback){

    var cheerio=require('cheerio');
    var fs=require("fs-extra");

    var configDB=db.collection("config");
    configDB.findOne({},function(err,config){
        var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);

        var digit=function(numDigit,x){
            var ret=x.toString();
            while(ret.length<numDigit)ret="0"+ret;
            return ret;
        }
        var selectInput=function(name,option,placeHolder,label,labelWidth,inputWidth){
            if(placeHolder==undefined)placeHolder="== Select "+label+" ==";
            var $=cheerio.load("<label>"+label+" :</label>");
            $("label").addClass("control-label col-sm-"+labelWidth).attr("for",name);
            $("label").after("<div></div>");
            $("div:last-child").addClass("col-sm-"+inputWidth);
            $("div:last-child").append("<select required></select>");
            $("select").addClass("form-control").attr("name",name);
            $("select").append("<option disabled selected>"+placeHolder+"</option>");
            for(var i=0;i<option.length;i++){
                $("select").append("<option>"+option[i][0]+"</option>");
                $("select option:last-child").val(option[i][1]);
            }
            return $.html();
        }
        var onlySelectInput=function(name,option,placeHolder){
            var $=cheerio.load("<select required></select>");
            $("select").addClass("form-control").attr("name",name);
            $("select").append("<option disabled selected>"+placeHolder+"</option>");
            for(var i=0;i<option.length;i++){
                $("select").append("<option>"+option[i][0]+"</option>");
                $("select option:last-child").val(option[i][1]);
            }
            return $.html();
        }
        var tutorInput=function(labelWidth,inputWidth){
            var tutor=["third","beng","ya","paan","view","bb","gag","anne","bg","louis","ten","pre","atom","pe/ch"];
            var option=[];
            for(var i=0;i<tutor.length;i++){
                option.push([tutor[i].toUpperCase(),tutor[i]]);
            }
            return selectInput("tutor",option,"Select Tutor","Tutor",labelWidth,inputWidth);
        }
        var dayInput=function(labelWidth,inputWidth){
            var option=[
                ["Saturday","sat"],
                ["Sunday","sun"]
            ];
            return selectInput("day",option,"Select Day","Day",labelWidth,inputWidth);
        }
        var timeInput=function(labelWidth,inputWidth){
            var option=[
                ["8.00-10.00","8-10"],
                ["10.00-12.00","10-12"],
                ["13.00-15.00","13-15"],
                ["15.00-17.00","15-17"]
            ];
            return selectInput("time",option,"Select Time","Time",labelWidth,inputWidth);
        }
        var numberOfSubInput=function(labelWidth,inputWidth){
            var option=[];
            for(var i=1;i<=12;i++){
                option.push([i,i]);
            }
            return selectInput("numberOfSub",option,"#","#",labelWidth,inputWidth);
        }
        var tdtInput=function(numberOfSub){
            var $=cheerio.load("<div></div>");
            $("div").addClass("form-group");
            if(numberOfSub){
                $(".form-group").append(tutorInput(2,2));
                $(".form-group").append(dayInput(1,2));
                $(".form-group").append(timeInput(1,2));
                $(".form-group").append(numberOfSubInput(1,1));
            }
            else{
                $(".form-group").append(tutorInput(2,2));
                $(".form-group").append(dayInput(1,3));
                $(".form-group").append(timeInput(1,3));
            }
            return $.html();
        }
        var datedInput=function(){
            var option=[];
            for(var i=1;i<=31;i++){
                option.push([i,digit(2,i)]);
            }
            return onlySelectInput("dated",option,"Day");
        }
        var datemInput=function(){
            var option=[
                ["January","01"],
                ["Febuary","02"],
                ["March","03"],
                ["April","04"],
                ["May","05"],
                ["June","06"],
                ["July","07"],
                ["August","08"],
                ["September","09"],
                ["October","10"],
                ["November","11"],
                ["December","12"]
            ];
            return onlySelectInput("datem",option,"Month");
        }
        var dateyInput=function(){
            var option=[
                ["2017","17"],
                ["2018","18"]
            ];
            return onlySelectInput("datey",option,"Year");
        }
        var dateInput=function(){
            var $=cheerio.load("<div></div>");
            $("div").addClass("form-group");
            $(".form-group").append("<label>Teach date :</label>");
            $(".form-group label:last-child").addClass("control-label col-sm-2").attr("for","dated");
            $(".form-group").append("<div></div>");
            $(".form-group div:last-child").addClass("col-sm-3");
            $(".form-group div:last-child").append(datedInput());
            $(".form-group").append("<div></div>");
            $(".form-group div:last-child").addClass("col-sm-4");
            $(".form-group div:last-child").append(datemInput());
            $(".form-group").append("<div></div>");
            $(".form-group div:last-child").addClass("col-sm-3");
            $(".form-group div:last-child").append(dateyInput());
            return $.html();
        }
        var submitInput=function(val){
            return "<div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><input type=\"submit\" class=\"btn btn-default\" value=\""+val+"\"></div></div>";
        }
        var compareString=function(x,y){
            if(x<y)return -1;
            if(x>y)return 1;
            return 0;
        }

        if(what=="admin"){
            $=cheerio.load(fs.readFileSync(__dirname+"/admin.html"));
            $("form").addClass("form-horizontal");
            $("form[action=\"add-course\"]").append(tdtInput(false)+submitInput("Add new course"));
            $("form[action=\"remove-course\"]").append(tdtInput(false)+submitInput("Remove course"));
            $("form[action=\"edit-course\"]").append(tdtInput(false)+"<br>"+submitInput("Edit course"));
            $("form[action=\"edit-course\"] [name=\"tutor\"]").attr("name","newTutor");
            $("form[action=\"edit-course\"] [name=\"day\"]").attr("name","newDay");
            $("form[action=\"edit-course\"] [name=\"time\"]").attr("name","newTime");
            $("form[action=\"edit-course\"] .page-header:first-of-type").after(tdtInput(false));
            $("form[action=\"remove-submission\"]").append(tdtInput(true)+submitInput("Remove submission"));

            courseDB.find({}).toArray(function(err,result){
                result.sort(function(x,y){
                    if(x.tutor!=y.tutor)return compareString(x.tutor,y.tutor);
                    if(x.day!=y.day)return compareString(x.day,y.day);
                    if(x.time=="8-10")return -1;
                    if(y.time=="8-10")return 1;
                    if(x.time!=y.time)return compareString(x.time,y.time);
                });
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
                        $("#tracking thead tr:last-child").append("<th>"+result[i].day.toUpperCase()+"</th>");
                        $("#tracking thead tr:last-child th:last-child").addClass(result[i].day);
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
                                    result[j].courseName+"("+result[j].day.toUpperCase()+")"+"("+result[j].time+")"+"/"+
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
            $("form").addClass("form-horizontal");
            $("form[action=\"file-upload\"]").prepend(tdtInput(true)+dateInput());
            $("form[action=\"file-upload\"]").append(submitInput("Upload File"));
            callback($.html());
        }
    });
}
module.exports.build=build;
