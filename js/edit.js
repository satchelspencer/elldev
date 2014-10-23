var openPage = "";
var openData = [];
var gui = true;
var tool = "select";
var add = "addContent";
var sendingEditData = false;
function editInit(){
	editPage("/");
	$("#workspace").kevent(function(e){
		if(e.code == 72) gui?hideGui():showGui();
	});
	$("#tools").event("click", setTool);
}
function editPage(e){
	var path;
	if(!e.e) path = e;
	else{
		var g = e.el.parent().parent();
		path = g.data?g.data.path:"/";
	}
	if(path != openPage) sendEditData({"getpage" : path}, function(d){
		openPage = path;
		$("#uriPath").innerHTML = path;
		try{
			openData = JSON.parse(d);
		}catch(e){
			warn(path+" is corrupt");
			return false;
		}
		render(openData, $("#canvas"));
		for(var k in openData.childs){
			$("#elementsC").childs(1).appendChild(elementEl(openData.childs[k], k));
		}
		for(var k in openData.childs[0].childs){
			$("#elementsC").childs(0).appendChild(elementEl(openData.childs[0].childs[k], k));
		}
	});
}
function sendEditData(data, callback){
	sendingEditData = true;
	sendData(data, function(d){
		sendingAssetData = false;
		callback(d);
	});
}
function setTool(e){
	var tools = $("#tools").childs();
	var tEl = e.el;
	while(tEl.parent().id != "tools") tEl = tEl.parent();
	tool = tEl.id;
	var cursors = {"select" : "default", "move" : "move", "add" : "crosshair"};
	$("#canvas").css("cursor", cursors[tool]);
	for(var i=0;i<tools.length;i++){
		var d = tools[i].id=="add"? tools[i].childs(0):tools[i];
		d.css("color", tools[i].id == tool?"#a0a0a0":"#272727")
	}
	if(e.el.parent().id == "addOptions"){
		var o = tEl.childs(1).childs();
		for(var j=0;j<o.length;j++) o[j].css("textDecoration", o[j]==e.el?"underline":"none");
	}
}
function hideGui(){
	if(!gui) return false;
	gui = false;
	ani(0, -350, 4, function(w){
		$("#gui").css("marginLeft", w+"px");
		$("#workspace").css("left", (350+w)+"px");
	}, function(){
		gui = false;
	});
}
function showGui(){
	if(gui) return false;
	gui = true;
	ani(-350, 0, 4, function(w){
		$("#gui").css("marginLeft", w+"px");
		$("#workspace").css("left", (350+w)+"px");
	}, function(){
		gui = true;
	});
}
function elClick(e){
	e.stop();
	clickFocus(e);
	if(tool == "select"){
		selectEL(e.el.addr);
	}
}
var selectedAddr = ["0"];
function selectEL(addr){
	selectedAddr = addr;
	var el = getEl(addr);
	$("#selector").css("display", "block");
	$("#selector").css("top", el.y($("#canvas"))+"px");
	$("#selector").css("left", el.x($("#canvas"))+"px");
	$("#selector").css("width", el.cssn("width")+"px");
	$("#selector").css("height", el.cssn("height")+"px");
	
}
function elementEl(data, index){
	var el = element(false, "div", "element");
	var or = element(false, "div", "elementOrder");
	or.innerHTML = index;
	var na = element(false, "div", "elementName");
	na.innerHTML = data.name;
	el.appendChild(or);
	el.appendChild(na);
	return el;
}
function getData(addr){
	var r = openData;
	for(var i in addr) r = r.childs[addr[i]];
	return r; 
}
function getEl(addr){
	var r = $("#canvas");
	for(var i in addr) r = r.childs(addr[i]);
	return r;
}