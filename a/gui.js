var currentDir = [];
function gui(){
	openDir("/", function(){
		editPage("/");
	});
	var pingInterval = setInterval(ping, 90000, ready);
	$("pathback").cEvent("click", dirBack, ready);
	$("filesback").cEvent("click", dirBack, ready);
	$("pathnew").cEvent("click", newPage, ready);
	$("pathrefresh").cEvent("click", refresh, ready);
	$("filedelete").cEvent("mousedown", startDelFile, ready);
	$("filedelete").cEvent("mouseup", stopDelFile, ready);
	$("fileopen").cEvent("click", openSelectedFile, ready);
	$("pageedit").cEvent("click", openSelectedPage, ready);
	$("fileslist").cEvent("dragenter", stopEvent, ready);
	$("fileslist").cEvent("dragexit", stopEvent, ready);
	$("fileslist").cEvent("dragover", stopEvent, ready);
	$("fileslist").cEvent("drop", fileDrop, ready);
	window.onresize = function(){
		if(!$(selectedElId).j.position.width) $("widthlabel").innerHTML = "auto&#8201;&#8201;<span class='uneditable'>"+$(selectedElId).getStyle("width")+"</span>";
		if(!$(selectedElId).j.position.height) $("heightlabel").innerHTML = "auto&#8201;&#8201;<span class='uneditable'>"+$(selectedElId).getStyle("height")+"</span>";
	}
}
var fileListId = 0;
var connectionStatus = 1;
function stopEvent(e){
	e.e.stopPropagation();
	e.e.preventDefault();
}
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
		if(connectionStatus == 0 && connectionStatus != 2) setConnectionStatus(1);
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
		$("connection").style.background = "#777777";
		conAniInt = setInterval(function(){
			$("connection").style.background = conAniStat ? "#aaaaaa" : "#777777";
			conAniStat = !conAniStat;
		},100);
		$("connection").setAttribute("title", "connecting");
	}
}
function ready(){
	var r = connectionStatus == 1;	
	if(!r) notAllowed();
	return r;
}
function notAllowed(){
	$("connection").style.background = "#d7d400";
	setTimeout(function(){
		$("connection").style.background = "#aaaaaa";
	}, 100);
}
function listFiles(dir, callback){
	fileListId = 0;
	$("pathlabel").innerHTML = "&rsaquo; "+currentDir.join("");
	$("pathlabel").setAttribute("title", currentDir.join(""));
	sendData({"list" : currentDir.join("")}, function(d){
		var list = JSON.parse(d);
		var toDestroy = $("fileslist").getChildren();
		for(x in toDestroy) toDestroy[x].remove();
		for(x in list) $("fileslist").appendChild(fileListEl(list[x], !list[x].match(/\./g)));
		if(callback) callback();
	});
}
function openRoot(){
	currentDir.length > 0 ? openDir("") : openDir("/");
}
function refresh(){
	openDir("");
}
function openDir(dir, callback){
	deselectFile();
	if(dir != "") currentDir.push(dir);
	listFiles(currentDir.join(""), callback);
}
function dirBack(event, callback){
	deselectFile();
	if(currentDir.length > 1){
		currentDir.pop();
		listFiles(currentDir.join(""), callback);
	}else openDir("", callback);
}
var selId = false;
function selectFile(e){
	if(selId) $(selId).parentNode.style.background = "";
	selId = e.el.id;
	e.el.parentNode.style.background = "#272727";
	inspectFile(e.el.innerHTML);
}
function selectFileByName(name){
	var f = $("fileslist").children;
	for(x=0;x<f.length;x++){ 
		if(f[x].children[0].innerHTML == name){
			selectFile({"el" : f[x].children[0]});
			return true;
		}
	}
	return false;
}
function deselectFile(){
	if(selId){
		$(selId).parentNode.style.background = "";
		selId = false;
	}
	$("details").hide();
	$("filedetails").hide();
	$("pagedetails").hide();
	$("nofile").show();
}
function inspectFile(file){
	$("filename").innerHTML = file;
	$("details").show();
	$("nofile").hide();
	if(file.match(/\./g)){
		sendData({"info" : currentDir.join("")+file}, function(d){
			var data = d.split(",");
			$("filesize").innerHTML = data[0];
			$("filemod").innerHTML = data[1];
			$("filedetails").show();
			$("pagedetails").hide();
		});
	}else{
		$("pagedetails").show();
		$("filedetails").hide();
		sendData({"pageinfo" : currentDir.join("")+file}, function(d){
			var dat = JSON.parse(d);
			$("pagetitle").innerHTML = dat.title;
			$("pagedesc").innerHTML = dat.desc;
		});
	}
}
function openSelectedFile(file){
	window.open(currentDir.join("")+$(selId).innerHTML);
}
function openSelectedPage(page){
	editPage(currentDir.join("")+$(selId).innerHTML);
}
function fileListEl(name, children){
	var r = element("fl"+fileListId, "div", {"class" : "file"});
	var n = element("fl"+fileListId+"name", "div", {"class" : "filename"});
	n.cEvent("click", selectFile, ready);
	r.cEvent("mousedown", fileMouseInit, ready);
	n.cEvent("dblclick", rename, ready);
	n.innerHTML = name;
	r.appendChild(n);
	if(children){
		var c = element("fl"+fileListId+"child", "div", {"class" : "filechildren button"});
		c.cEvent("click", function(){openDir(name+"/")}, ready);
		c.innerHTML = "&rsaquo;";
		r.appendChild(c);
	}
	fileListId++;
	return r;
}
var trackingFile = false;
var trackMoved = false;
var dy = 0;
var inity = 0;
var initx = 0;
var trackingFilename = "";
var overIndex = 0;
var filesBackIsOver = false;
function fileMouseInit(e){
	dy = (e.y-e.el.parentNode.getPosition().y);
	inity = e.y;
	initx = e.x;
	trackingFile = e.el.parentNode.children[0].id;
	trackingFileName = $(trackingFile).innerHTML;
	$("body").event("mousemove", fileMouseTrack);
	$("fileslist").event("scroll", fileMouseTrack);
	$("filesback").event("mouseover", filesBackOver);
	$("filesback").event("mouseout", filesBackOut);
	$("body").setAttribute("class", "unselectable");
	$("body").event("mouseup", fileMouseStop);
} 
function filesBackOver(e){
	filesBackIsOver = true;
	$("filesback").style.background = "#575757";
}
function filesBackOut(e){
	filesBackIsOver = false;
	$("filesback").style.background = "#676767";
}
function fileMouseTrack(e){
	if(e.type == "scroll") for(i=0;i<$("fileslist").children.length;i++) $("fileslist").children[i].style.background = "";
	var newpos = (e.y-($("fileslist").getPosition().y))-dy+35-$("fileslist").scrollTop;
	var maxt = parseInt($("files").getStyle("height").replace("px", ""))-25;
	if(Math.abs(e.y-inity) > 2 || Math.abs(e.x-initx) > 2){
		if(!trackMoved && currentDir.length > 1) showFilesBack(); 
		trackMoved = true;
		selId = false;
		if(newpos <= 35) newpos = 35;
		if(newpos > maxt) newpos = maxt;
		if(trackingFile){
			$(trackingFile).parentNode.remove();
			trackingFile = false;
		}
		$("draggingfile").innerHTML = trackingFileName;
		$("draggingfile").show();
		$("draggingfile").style.top = newpos+"px";
		overIndex = Math.floor((e.y-($("fileslist").getPosition().y))/25);
		for(i=0;i<$("fileslist").children.length;i++) $("fileslist").children[i].style.background = (i == overIndex && $("fileslist").children[i].children.length > 1 && !filesBackIsOver && e.x < 210) ? "#373737" : "";
	}
}
function fileMouseStop(e){
	$("draggingfile").hide();
	$("draggingfile").style.top = "35px";
	$("body").rmEvent("mousemove", fileMouseTrack);
	$("body").rmEvent("mouseup", fileMouseStop);
	$("fileslist").rmEvent("scroll", fileMouseTrack);
	$("body").setAttribute("class", "");
	$("filesback").rmEvent("mouseover", filesBackOver);
	$("filesback").rmEvent("mouseout", filesBackOut);
	if(trackMoved){
		if(filesBackIsOver){
			sendData({"newname" : currentDir.slice(0, -1).join("")+trackingFileName, "oldname" : currentDir.join("")+trackingFileName}, function(d){
				dirBack(false, function(){
					selectFileByName(trackingFileName);
				});
			});
		}else if(overIndex < $("fileslist").children.length && overIndex >=0){
			if($("fileslist").children[overIndex].children.length > 1 && e.x < 210){
				sendData({"newname" : currentDir.join("")+$("fileslist").children[overIndex].children[0].innerHTML+"/"+trackingFileName, "oldname" : currentDir.join("")+trackingFileName}, function(d){
					openDir($("fileslist").children[overIndex].children[0].innerHTML+"/", function(){
						selectFileByName(trackingFileName);
					});
				});
			}else openDir("");
		}else openDir("");
		trackMoved = false;
	}
	hideFilesBack();
}
function showFilesBack(){
	$("filesback").show();
	$("fileslist").style.left = "25px";
	$("draggingfile").style.left = "25px";
}
function hideFilesBack(){
	filesBackIsOver = false;
	$("filesback").hide();
	$("fileslist").style.left = "0px";
	$("draggingfile").style.left = "0px";
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
   	focusField($(id).childNodes[0], /^[a-z0-9\-\_]{2,16}$/i, false, function(x){
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
		$("fileDeleteProg").style.height = delTimer+"px";
		if(delTimer >= 35){
			stopDelFile(e);
			delFile(e);
		} 
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
	var regex = oldname.match(/\./g) ? (/^[a-z0-9\-\_\.]{2,16}$/i) : (/^[a-z0-9\-\_]{2,16}$/i);
	focusField(e.el, regex, function(x){
		$("filename").innerHTML = x;
	}, function(x){
		sendData({"newname" : currentDir.join("")+x, "oldname" : oldname}, function(d){
			openDir("");
		});
	});
}
var currentlyUploading = 0;
function fileDrop(e){
	stopEvent(e);
	var fs = e.e.dataTransfer.files;
	currentlyUploading = fs.length;
	setConnectionStatus(2);
	document.title = "elldev - uploading ("+currentlyUploading+")";
	for(i=0;i<fs.length;i++){
		var fd = new FormData();
		fd.append("file", fs[i]);
		fd.append("path", currentDir.join(""));
		var xhr = new XMLHttpRequest();
		xhr.addEventListener("load", function(e){
			refresh();
			currentlyUploading--;
			if(currentlyUploading > 0){
				setConnectionStatus(2);
				document.title = "elldev - uploading ("+currentlyUploading+")";
			}else{
				setConnectionStatus(1);
				document.title = "elldev";
			}
		}, false);
		xhr.open("POST", "io.php");
		xhr.send(fd);	
	}
}