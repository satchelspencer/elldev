window.onload = function(){
	browserInit();
	$("#propertiesSeparator").event("mousedown", function(e){
		$("body").class("unselectable");
		var mouse = e.y;
		var force = 0;
		var mouseForce = 0;
		var topForce = 0;
		var bottomForce = 0;
		var baseForce = 0;
		var mousedown = true;
		var ani = setInterval(function(){
			var p = $("#propertiesSeparator").y();
			var top = 0;
			var bottom = $("#browserSeparator").y()+5;
			var base = $("body").viewHeight;
			mouseForce = mousedown ? mouse-p : 0;
			topForce = p > 300?0:(1/300)*Math.pow((p-300), 2);
			bottomForce = (bottom-p) > 100?0:(-1/100)*Math.pow(((bottom-p)-100), 2);
			baseForce = (base-p) > 300?0:(-1/300)*Math.pow(((base-p)-300), 2);
			force = ((mouseForce+topForce+bottomForce)/3);
			setPsepy(p+force);
			setBsepy(bottom+((-bottomForce+baseForce)/2));
			if(!mousedown && Math.abs(force) < 1) clearInterval(ani);
		}, 30);
		$("body").event("mousemove", function(e){
			mouse = e.y;
		});
		$("body").event("mouseup", function(){
			mousedown = false;
			if(topForce == 0 && bottomForce == 0 && baseForce == 0) clearInterval(ani);
			$("body").rmEvent("mousemove");
			$("body").rmEvent("mouseup");
			$("body").rmClass("unselectable");
		});
	});
	$("#browserSeparator").event("mousedown", function(e){
		$("body").class("unselectable");
		var mouse = e.y;
		var force = 0;
		var mouseForce = 0;
		var topForce = 0;
		var bottomForce = 0;
		var baseForce = 0;
		var mousedown = true;
		var ani = setInterval(function(){
			var p = $("#propertiesSeparator").y();
			var top = 0;
			var bottom = $("#browserSeparator").y()+5;
			var base = $("body").viewHeight;
			mouseForce = mousedown ? mouse-bottom : 0;
			topForce = p > 300?0:(1/300)*Math.pow((p-300), 2);
			bottomForce = (bottom-p) > 100?0:(-1/100)*Math.pow(((bottom-p)-100), 2);
			baseForce = (base-bottom) > 300?0:(-1/200)*Math.pow(((base-bottom)-200), 2);
			force = ((topForce+bottomForce)/3);
			setPsepy(p+force);
			setBsepy(bottom+((-bottomForce+baseForce+mouseForce)/4));
			if(!mousedown && Math.abs(((-bottomForce+baseForce+mouseForce)/3)) < 1) clearInterval(ani);
		}, 30);
		$("body").event("mousemove", function(e){
			mouse = e.y;
		});
		$("body").event("mouseup", function(){
			mousedown = false;
			if(topForce == 0 && bottomForce == 0 && baseForce == 0) clearInterval(ani);
			$("body").rmEvent("mousemove");
			$("body").rmEvent("mouseup");
			$("body").rmClass("unselectable");
		});
	});
};
window.onresize = function(){
	if($("body").viewHeight < 700 || $("body").viewWidth < 800) halt("window too small");
	else unhalt();
};
function setPsepy(y){
	$("#properties").css("height", y+"px");
	$("#propertiesSeparator").css("top", y+"px");
	$("#elements").css("top", (y+5)+"px");
}
function setBsepy(y){
	var offset = $("body").viewHeight-y;
	$("#browser").css("height", offset+"px");
	$("#browserSeparator").css("bottom", offset+"px");
	$("#elements").css("bottom", (offset+5)+"px");
}
var halted = false;
function halt(message){
	if(halted) return false;
	var o = 0;
	halted = true;
	if(message) $("#stopMessage").innerHTML = message;
	$("#stop").css("display", "block");
	var a = setInterval(function(){
		o += .2;
		if(o >= 1){
			$("#stop").css("opacity", 1);
			clearInterval(a);
		}
		$("#stop").css("opacity", o);
	}, 30);
}
function unhalt(){
	if(!halted) return false;
	var o = 1;
	halted = false;
	$("#stopMessage").innerHTML = "";
	var a = setInterval(function(){
		o -= .2;
		if(o <= 0){
			$("#stop").css("opacity", 0);
			$("#stop").css("display", "none");
			clearInterval(a);
		}
		$("#stop").css("opacity", o);
	}, 30);
}
var warned = false;
function warn(warning, callback, abort){
	warned = true;
	$("#warnTitle").innerHTML = warning;
	var t = 40;
	var a = setInterval(function(){
		t-=8;
		if(t<=0){
			clearInterval(a);
			$("#warn").css("top", "0px");
			$("body").event("click", function(){unwarn(callback)});
			$("body").event("keydown", function(e){
				if(e.code == 13) unwarn(callback);
			});
		}
		$("#warn").css("top", "-"+t+"px");
	}, 30);
}
function unwarn(callback){
	warned = false;
	var t = 0;
	var a = setInterval(function(){
		t+=8;
		if(t>=40){
			clearInterval(a);
			$("#warn").css("top", "-40px");
			$("body").rmEvent("click");
			$("body").rmEvent("keydown");
			if(callback) callback();
		}
		$("#warn").css("top", "-"+t+"px");
	}, 30);
}
function sendData(data, callback){
	var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xmlhttp.open("POST","io.php",true);
 	xmlhttp.onreadystatechange  = function(){
        if(xmlhttp.readyState == 4 && xmlhttp.status == 200) callback(xmlhttp.responseText);
        else if(xmlhttp.status == 0){
        	var link = element("false", "span", "stopRetry");
        	link.event("click", function(){
        		sendData(data, function(d){
        			unhalt();
        			callback(d);
        		});
        	});
        	link.innerHTML = "try again";
        	$("#stopMessage").innerHTML = "no connection <br>";
        	$("#stopMessage").appendChild(link);
        	halt();
        } 
    };
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	var dataStr = "", ri = 0;
	for(var i in data){
		var dat = encodeURIComponent(data[i]);
		if(ri != 0) dataStr += "&"+i+"="+dat;
		else dataStr += i+"="+dat;
		ri++;
	}
	xmlhttp.send(dataStr);
}