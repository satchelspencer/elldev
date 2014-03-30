var currentDir = [];
function gui(){
	openDir("/");
	$("pathback").event("click", dirBack);
	$("pathnew").event("click", newPage)
}
var fileListId;
function listFiles(dir){
	fileListId = 0;
	$("pathlabel").innerHTML = "&rsaquo; "+currentDir.join("");
	ajax("io.php", {"list" : currentDir.join("")}, false, function(d){
		var list = JSON.parse(d);
		var toDestroy = $("fileslist").getChildren();
		for(x in toDestroy) toDestroy[x].remove();
		for(x in list) $("fileslist").appendChild(fileListEl(list[x], !list[x].match(/\./g)));
	});
}
function openDir(dir){
	currentDir.push(dir);
	listFiles(currentDir.join(""));
}
function dirBack(){
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
function inspectFile(file){
	$("filename").innerHTML = file;
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
	if(selId) $(selId).parentNode.style.background = "";
	var id = "fl"+fileListId++;
	newFileListId = id+"l";
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
		ajax("io.php", {"np" : currentDir.join("")+e.el.innerHTML}, false, function(d){
			e.el.remove();
			openDir("");
		});
	}else if(e.code != 8){
		var hypInner = e.el.innerHTML+e.char;
		if(!hypInner.match(/^[a-z0-9_]+$/i) || hypInner.length > 16) e.e.preventDefault();
	}
}