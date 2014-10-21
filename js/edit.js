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
	for(var i=0;i<tools.length;i++){
		var d = tools[i].id=="add"? tools[i].childs()[0]:tools[i];
		d.css("color", tools[i].id == tool?"#a0a0a0":"#272727")
	}
	if(e.el.parent().id == "addOptions"){
		var o = tEl.childs()[1].childs();
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
	log(e.el.offsetLeft);
	if(tool == "select"){
		$("#selector").css("display", "block");
		$("#selector").css("top", e.el.y($("#canvas"))+"px");
		$("#selector").css("left", e.el.x($("#canvas"))+"px");
		$("#selector").css("width", e.el.cssn("width")+"px");
		$("#selector").css("height", e.el.cssn("height")+"px");
		selectEL(e.el.addr);
	}
}
function selectEL(addr){
	log(getData(addr));
}
function getData(addr){
	var r = openData;
	for(var i in addr) r = r.childs[addr[i]];
	return r; 
}