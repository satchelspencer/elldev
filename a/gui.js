var currentDir = [];
function gui(){
	openDir("/");
	var pingInterval = setInterval(ping, 90000);
	$("pathback").event("click", dirBack);
	$("filesback").event("click", dirBack);
	$("pathnew").event("click", newPage);
	$("filedelete").event("mousedown", startDelFile);
	$("filedelete").event("mouseup", stopDelFile);
	$("fileopen").event("click", openSelectedFile);
}
var fileListId = 0;
var connectionStatus = 1;
function sendData(data, callback){
	var t = 0;
	setConnectionStatus(2);
	ajax("io.php", data, false, function(d){
		clearInterval(i);
		if(connectionStatus > 0){
			setConnectionStatus(1);
			callback(d);
		}
	});
	var i = setInterval(function(){
		if(t > 10000){
			clearInterval(i);
			setConnectionStatus(0);
		}
		t+=10;
	}, 10);
}
function ping(){
	var t = 0;
	ajax("io.php", {"p":"!"}, false, function(d){
		if(d == ".") clearInterval(i);
		if(connectionStatus == 0) setConnectionStatus(1);
	});
	var i = setInterval(function(){
		if(t > 2000){
			clearInterval(i);
			setConnectionStatus(0);
		}
		t+=10;
	}, 10);
}
var conAniInt;
var conAniStat = false;
function setConnectionStatus(s){
	if(connectionStatus == 2) clearInterval(conAniInt);
	if(connectionStatus == 0){
		$("connection").rmEvent("click", openRoot);
		$("connection").style.cursor = "default";
	}
	connectionStatus = s;
	if(s == 0){
		$("connection").style.background = "#420000";
		$("connection").setAttribute("title", "not connected");
		$("connection").event("click", openRoot);
		$("connection").style.cursor = "pointer";
	}else if(s == 1){
		$("connection").style.background = "#aaaaaa";
		$("connection").setAttribute("title", "connected");
	}else if(s == 2){
		conAniInt = setInterval(function(){
			$("connection").style.background = conAniStat ? "#aaaaaa" : "#777777";
			conAniStat = !conAniStat;
		},100);
		$("connection").setAttribute("title", "connecting");
	}
}
function listFiles(dir){
	fileListId = 0;
	$("pathlabel").innerHTML = "&rsaquo; "+currentDir.join("");
	sendData({"list" : currentDir.join("")}, function(d){
		var list = JSON.parse(d);
		var toDestroy = $("fileslist").getChildren();
		for(x in toDestroy) toDestroy[x].remove();
		for(x in list) $("fileslist").appendChild(fileListEl(list[x], !list[x].match(/\./g)));
	});
}
function openRoot(){
	currentDir.length > 0 ? openDir("") : openDir("/");
}
function openDir(dir){
	deselectFile();
	currentDir.push(dir);
	listFiles(currentDir.join(""));
}
function dirBack(){
	deselectFile();
	if(currentDir.length > 1){
		currentDir.pop();
		listFiles(currentDir.join(""));
	}
}
var selId = false;
function selectFile(e){
	if(selId) $(selId).parentNode.style.background = "";
	selId = e.el.id;
	e.el.parentNode.style.background = "#272727";
	inspectFile(e.el.innerHTML);
}
function deselectFile(){
	if(selId){
		$(selId).parentNode.style.background = "";
		selId = false;
	}
	$("details").style.display = "none";
	$("filedetails").style.display = "none";
	$("pagedetails").style.display = "none";
	$("nofile").style.display = "block";
}
function inspectFile(file){
	$("filename").innerHTML = file;
	$("details").style.display = "block";
	$("nofile").style.display = "none";
	if(file.match(/\./g)){
		sendData({"info" : currentDir.join("")+file}, function(d){
			var data = d.split(",");
			$("filesize").innerHTML = data[0];
			$("filemod").innerHTML = data[1];
			$("filedetails").style.display = "block";
			$("pagedetails").style.display = "none";
		});
	}else{
		$("pagedetails").style.display = "block";
		$("filedetails").style.display = "none";
	}
}
function openSelectedFile(file){
	log(file);
	window.open(currentDir.join("")+$(selId).innerHTML);
}
function fileListEl(name, children){
	var r = element("fl"+fileListId, "div", {"class" : "file"});
	var n = element("fl"+fileListId+"name", "div", {"class" : "filename"});
	n.event("click", selectFile);
	r.event("mousedown", fileMouseInit);
	$("body").event("mouseup", fileMouseStop);
	n.event("dblclick", rename);
	n.innerHTML = name;
	r.appendChild(n);
	if(children){
		var c = element("fl"+fileListId+"child", "div", {"class" : "filechildren"});
		c.event("click", function(){openDir(name+"/")});
		c.innerHTML = "&rsaquo;";
		r.appendChild(c);
	}
	fileListId++;
	return r;
}
var trackingFile;
function fileMouseInit(e){
	e.el.dy = (e.y-e.el.parentNode.getPosition().y);
	e.el.inity = e.y;
	trackingFile = e.el.id;
	$("body").event("mousemove", fileMouseTrack);
	$("body").setAttribute("class", "unselectable");
}
function fileMouseTrack(e){
	var newpos = (e.y-($("fileslist").getPosition().y))-$(trackingFile).dy+35-$("fileslist").scrollTop;
	var maxt = parseInt($("files").getStyle("height").replace("px", ""))-25;
	if(Math.abs(e.y-$(trackingFile).inity) > 2){
		if(newpos <= 35) newpos = 35;
		if(newpos > maxt) newpos = maxt;
		$(trackingFile).parentNode.style.display = "none";
		$("draggingfile").innerHTML = $(trackingFile).innerHTML;
		$("draggingfile").style.display = "block";
		$("draggingfile").style.top = newpos+"px";
	}
}
function fileMouseStop(e){
	$("body").rmEvent("mousemove", fileMouseTrack);
	$("body").rmEvent("mouseup", fileMouseStop);
	$("body").setAttribute("class", "");
}
function focusField(e, regex, prog, callback){
	var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(e, 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    e.setAttribute("contenteditable", "true");
    e.focus();
    e.regex = regex;
    e.callback = callback;
    e.prog = prog;
    e.fieldVal = e.innerHTML;
    e.toSub = false;
    e.valid = true;
    e.event("keyup", updateField);
    e.event("keydown", validateField);
}
function validateField(e){
	if(e.code == 13){
		if(e.el.valid) e.el.toSub = true;
		e.e.preventDefault();
		return false;
	}
}
function updateField(e){
	if(e.el.toSub){
		e.el.innerHTML = e.el.fieldVal;
		e.el.callback(e.el.fieldVal);
		blurField(e.el);
	}else{
		e.el.valid = e.el.innerHTML.match(e.el.regex) != null;
		e.el.style.color = e.el.valid ? "white" : "red";
		e.el.fieldVal = e.el.innerHTML;
		if(e.el.valid && e.el.prog) e.el.prog(e.el.fieldVal);
	}
}
function blurField(e){
	e.setAttribute("contenteditable", "false");
	e.rmEvent("keyup", updateField);
	e.rmEvent("keydown", validateField);
	delete e.regex;
	e.blur(); 
}
function newPage(){
	deselectFile();
	if(selId) $(selId).parentNode.style.background = "";
	var id = "fl"+fileListId++;
	var newFileListId = id+"l";
	var r = element(id, "div", {"class" : "file"});
	var n = element(newFileListId, "div", {"class" : "filename", "contenteditable" : "true"});
	n.innerHTML = "";
	r.appendChild(n);
	$("fileslist").appendChild(r);
   	focusField($(id).childNodes[0], /^[a-z0-9\-\_]{1,16}$/i, false, function(x){
   		sendData({"np" : currentDir.join("")+x}, function(d){
			openDir("");
		});
   	});
    $(newFileListId).parentNode.style.background = "#272727";
}
var delTimer = 0;
var delTimerInterval;
function startDelFile(e){
	var delTimer = 5;
	delTimerInterval = setInterval(function(){
		if(delTimer > 35){
			stopDelFile(e);
			delFile(e);
		}
		$("fileDeleteProg").style.height = delTimer+"px"; 
		delTimer+=1;
	}, 30);
}
function stopDelFile(e){
	$("fileDeleteProg").style.height = "0px";
	clearInterval(delTimerInterval);
	delTimer = 0;
}
function delFile(e){
	sendData({"del" : currentDir.join("")+$(selId).innerHTML}, function(d){
		$(selId).parentNode.remove();
		selId = false;
		deselectFile();
	});
}
function rename(e){
	selectFile(e);
	var oldname = currentDir.join("")+e.el.innerHTML;
	focusField(e.el, /^[a-z0-9\-\_]{1,16}$/i, function(x){
		$("filename").innerHTML = x;
	}, function(x){
		sendData({"newname" : currentDir.join("")+x, "oldname" : oldname}, function(d){
			openDir("");
		});
	});
}