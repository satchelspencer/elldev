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
		selectEl(["0", "0"]);
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
		selectEl(e.el.addr);
	}
}
var selectedAddr = false;
function selectEl(addr){
	if(addr === selectedAddr) return false;
	var el = getEl(addr);
	var data = getData(addr);
	var sibs = el.siblings();
	var cols = $("#elementsSlider").childs();
	if(!selectedAddr){//still need to account for selecting another child of same parent
		if(addr.length == 1 || el.childs()){
			insertEls(sibs, cols[3], addr[addr.length-1]);
			if(el.childs()) insertEls(el.childs(), cols[2]);
		}else{
			insertEls(el.parent().siblings(), cols[3]);
			insertEls(sibs, cols[2], addr[addr.length-1]);
		}
		setSlider(-350);
	}else if(selectedAddr.length < addr.length){
		var depth = addr.length-selectedAddr.length;
		if(depth > 1){
			if(el.childs()){
				insertEls(el.siblings(), cols[1]);
				insertEls(el.childs(), cols[0]);
			}else{
				insertEls(el.parent().siblings(), cols[1]);
				insertEls(el.siblings(), cols[0]);
			}
			ani(-350, -700, 12, function(l){
				setSlider(l);
			}, function(){
				setSlider(-350);
				cols[3].innerHTML = cols[1].innerHTML;
				cols[2].innerHTML = cols[0].innerHTML;
				cols[1].clear();
				cols[0].clear();
			});
		}else if(el.childs()){
			insertEls(el.childs(), cols[1]);
			ani(-350, -525, 6, function(l){
				setSlider(l);
			}, function(){
				setSlider(-350);
				cols[3].innerHTML = cols[2].innerHTML;
				cols[2].innerHTML = cols[1].innerHTML;
				cols[1].clear();
			});
		}
	}else if(selectedAddr.length > addr.length){
		log("out");
	}else{
		log("sam");
	}
	selectedAddr = addr;
}
function setSlider(l){
	$("#elementsSlider").css("left", l+"px");
	var cols = $("#elementsSlider").childs();
	var z = Math.abs(l/700)%1;
	for(var i=0;i<cols.length;i++){
		var offset = cols[i].x($("#elements"));
		var v = Math.round(60-(offset/15));
		log(v);
		cols[i].css("background", "rgb("+v+", "+v+", "+v+")");
	}
}
function showSelectOn(el){
	$("#selector").css("display", "block");
	$("#selector").css("top", el.y($("#canvas"))+"px");
	$("#selector").css("left", el.x($("#canvas"))+"px");
	$("#selector").css("width", el.cssn("width")+"px");
	$("#selector").css("height", el.cssn("height")+"px");
}
function insertEls(els, into, sel){
	into.clear();
	for(var i=0;i<els.length;i++) into.appendChild(elementEl(getData(els[i].addr), els[i].addr, sel?sel==i:false));
}
function elementEl(data, addr, sel){
	var el = element(false, "div", "element");
	el.selected = false;
	var or = element(false, "div", "elementOrder");
	or.innerHTML = addr[addr.length-1];
	var na = element(false, "div", "elementName");
	na.innerHTML = data.name;
	el.appendChild(or);
	el.appendChild(na);
	el.select = function(){
		this.selected = true;
		this.css("background", "#373737");
	};
	el.deselect = function(){
		this.selected = false;
		this.css("background", "");
	};
	if(sel) el.select();
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