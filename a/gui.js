var currentDir = [];
function gui(){
	openDir("/");
	$("pathback").event("click", dirBack);
	$("pathnew").event("click", newPage);
	$("filedelete").event("click", delFile);
	$("fileopen").event("click", openSelectedFile);
}
var fileListId = 0;
var connectionStatus = 0;
function sendData(data, callback){
	var t = 0;
	setConnectionStatus(2);
	ajax("io.php", data, false, function(d){
		clearInterval(i);
		if(connectionStatus > 0){
			callback(d);
			setConnectionStatus(1);
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

function setConnectionStatus(s){
	connectionStatus = s;
	if(s == 0){
		$("connection").style.background = "red";
		$("connection").setAttribute("title", "not connected");
	}else if(s == 1){
		$("connection").style.background = "green";
		$("connection").setAttribute("title", "connected");
	}else if(s == 2){
		$("connection").style.background = "yellow";
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
			e.el.remove();
			openDir("");
		});
	}else if(e.code != 8){
		var hypInner = e.el.innerHTML+e.char;
		if(!hypInner.match(/^[a-z0-9_]+$/i) || hypInner.length > 16) e.e.preventDefault();
	}
}
function delFile(e){
	ajax("io.php", {"del" : currentDir.join("")+$(selId).innerHTML}, false, function(d){
		$(selId).parentNode.remove();
		selId = false;
		deselectFile();
	});
}