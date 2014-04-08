var currentDir = [];
function gui(){
	openDir("/");
	var pingInterval = setInterval(ping, 90000);
	$("pathback").event("click", dirBack);
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
	var range = document.createRange();
    var sel = window.getSelection();
    range.setStart($(id).childNodes[0], 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    $(newFileListId).focus();
    $(newFileListId).event("keydown", validateNewPageName);
    $(newFileListId).parentNode.style.background = "#272727";
}
function validateNewPageName(e){
	var hypInner = e.code == 8 ? e.el.innerHTML : e.el.innerHTML+e.char;
	if(e.code == 13){
		e.el.rmEvent("keydown", validateNewPageName);
		e.el.blur();
		e.el.setAttribute("contenteditable", "false");
		sendData({"np" : currentDir.join("")+e.el.innerHTML}, function(d){
			openDir("");
		});
	}else if(e.code != 8){
		var hypInner = e.el.innerHTML+e.char;
		if(!hypInner.match(/^[a-z0-9_]+$/i) || hypInner.length > 16) e.e.preventDefault();
	}
}
var delTimer = 0;
var delTimerInterval;
function startDelFile(e){
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
	log(e.el);
}