window.onload = function(){
	browserInit();
	separatorInit();
	focusInit();
	editInit();
	propsInit();
};
window.onresize = function(){
	if(($("body").viewHeight < 700 || $("body").viewWidth < 800) && gui) halt("window too small");
	else unhalt();
	redrawSelection();
};
window.onscroll = function(){
	redrawSelection();
}
function stopEvent(e){
	e.stop();
}
var focus;
var focusEvents = {};
function focusInit(){
	focus = $("#workspace");
	$("body").event("keyup", function(e){
		if(focusEvents[focus.id]) focusEvents[focus.id](e);
	});
	$("#wrapper").event("click", clickFocus);
}
function clickFocus(e){
	var el = e.el;
	while(el && !el.hasClass("focus")) el = el.parent();
	focus = el||focus;
}
ext.kevent = function(fu){
	focusEvents[this.id] = fu;
};
ext.rmKevent = function(){
	delete focusEvents[this.id];
};
var browserState = "pages";
function browserInit(){
	pagesInit();
	assetInit();
	$("#pageMode").event("click", function(){
		if(browserState == "pages") return false;
		browserState = "pages";
		$("#pageMode").css("color", "#171717");
		$("#assetMode").css("color", "#777777");
		ani(350, 0, 6, function(l){
			$("#browserSlider").css("left", "-"+l+"px");
		});
		$("#browserLoad").css("display", "block");
		$("#browserBack").css("display", "block");
		$("#assetBack").css("display", "none");
		$("#assetLoad").css("display", "none");
		$("#browserPathLabel").css("display", "inline");
		$("#assetPathLabel").css("display", "none");
	});
	$("#assetMode").event("click", function(){
		if(browserState == "assets") return false;
		browserState = "assets";
		$("#assetMode").css("color", "#171717");
		$("#pageMode").css("color", "#777777");
		ani(0, 350, 6, function(l){
			$("#browserSlider").css("left", "-"+l+"px");
		});
		$("#browserLoad").css("display", "none");
		$("#browserBack").css("display", "none");
		$("#assetBack").css("display", "block");
		$("#assetLoad").css("display", "block");
		$("#browserPathLabel").css("display", "none");
		$("#assetPathLabel").css("display", "inline");
	});
}
function getCurrentDir(dirArr){
	dirArr = dirArr || pageDir;
	return "/"+dirArr.join("/")+(dirArr.length > 0?"/":"");
}
function separatorInit(){
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
}
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
	halted = true;
	if(message) $("#stopMessage").innerHTML = message;
	$("#stop").css("display", "block");
	ani(0, 1, 5, function(o){
		$("#stop").css("opacity", o);
	})
}
function unhalt(){
	if(!halted) return false;
	halted = false;
	$("#stopMessage").innerHTML = "";
	ani(1, 0, 5, function(o){
		$("#stop").css("opacity", o);
	}, function(){
		$("#stop").css("display", "none");
	});
}
var warned = false;
function warn(warning, callback, abort){
	warned = true;
	$("#warnTitle").innerHTML = warning;
	ani(30, 0, 4, function(t){
		$("#warn").css("top", "-"+t+"px");
	}, function(){
		$("body").event("click", function(){unwarn(callback)});
		$("body").event("keydown", function(e){
			if(e.code == 13) unwarn(callback);
		});
	});
}
function unwarn(callback){
	warned = false;
	ani(0, 30, 4, function(t){
		$("#warn").css("top", "-"+t+"px");
	}, function(){
		$("#warn").css("top", "-40px");
		$("body").rmEvent("click");
		$("body").rmEvent("keydown");
		if(callback) callback();
	});
}
var notified = true;
var ntimeout;
function notify(message, icon, timeout, callback){
	clearTimeout(ntimeout);
	notified = true;
	$("#notifyTitle").innerHTML = message;
	if(icon){
		$("#notifyIcon").className = "icon icon-"+icon;
		$("#notifyIcon").css("display", "block");
	}else $("#notifyIcon").css("display", "none");
	ani(30, 0, 4, function(t){
		$("#notify").css("top", "-"+t+"px");
	}, function(){
		$("#notify").event("click", function(){unnotify(callback)});
		if(timeout) ntimeout = setTimeout(function(){unnotify()}, timeout*1000);
	});
}
function unnotify(callback){
	notified = false;
	clearTimeout(ntimeout);
	ani(0, 30, 4, function(t){
		$("#notify").css("top", "-"+t+"px");
	}, function(){
		$("#notify").css("top", "-40px");
		$("#notify").rmEvent("click");
		if(callback) callback();
	});
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