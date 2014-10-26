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
		selectEl(["0"], true);
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
	ani(0, -350, 3, function(w){
		$("#gui").css("marginLeft", w+"px");
		$("#workspace").css("left", (350+w)+"px");
	}, function(){
		gui = false;
	});
}
function showGui(){
	if(gui) return false;
	gui = true;
	ani(-350, 0, 3, function(w){
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
var rootAddr = false;
function selectEl(addr, nani){
	if(addr === selectedAddr) return false;
	var el = getEl(addr);
	var data = getData(addr);
	var cols = $("#elementsSlider").childs();
	insertEls(el.siblings(), cols[1], false, addr);
	var root = addr.length == 1;
	if(root){
		cols[2].clear();
		if(!rootAddr && !nani) ani(195, 315, 4, function(w){
			cols[1].css("width", w+"px");
		});
		if(nani) cols[1].css("width", "315px");
	}else{
		insertEls(el.parent().siblings(), cols[2], true);
		if(rootAddr  && !nani) ani(315, 195, 4, function(w){
			cols[1].css("width", w+"px");
		});
		if(nani) cols[1].css("width", "195px");
	}
	rootAddr = root;
	showSelectOn(getEl(addr));
	selectedAddr = addr;
}
function gotoChild(addr){
	var childAddr = addr.concat("0");
	var cols = $("#elementsSlider").childs();
	var wi = cols[1].cssn("width");
	var c1cs = cols[1].childs();
	insertEls(getEl(addr).childs(), cols[0], false, childAddr);
	ani(-155, -350, 6, function(l){
		var frac = Math.abs(l+155)/195;
		$("#elementsSlider").css("left", l+"px");
		cols[1].css("width", (wi-(frac*(wi-155)))+"px");
		var gsv = Math.round((frac*10)+50);
		cols[1].css("background", "rgb("+gsv+","+gsv+","+gsv+")");
		for(var i=0;i<c1cs.length;i++) c1cs[i].last().css("opacity", (1-frac));
	}, function(){
		selectEl(childAddr, true);
		$("#elementsSlider").css("left", "-155px");
		cols[1].css("width", "195px");
		cols[1].css("background", "rgb(50,50,50)");
	});
}
function gotoParent(addr){
	var cols = $("#elementsSlider").childs();
	var wi = cols[2].cssn("width");
	var c2cs = cols[2].childs();
	for(var i=0;i<c2cs.length;i++){
		c2cs[i].last().css("display", "block");
		c2cs[i].last().css("opacity", "0");
	}
	c2cs[addr[addr.length-1]].select();
	if(addr.length > 1){
		insertEls(getEl(addr).parent().siblings(), cols[3], true, addr);
		ani(-155, 0, 6, function(l){
			var frac = Math.abs(l+155)/155;
			$("#elementsSlider").css("left", l+"px");
			cols[2].css("width", (wi+(frac*(195-wi)))+"px");
			$("#elementsSlider").css("width", (700+(frac*(195-wi)))+"px");
			var gsv = Math.round(60-(frac*10));
			cols[2].css("background", "rgb("+gsv+","+gsv+","+gsv+")");
			for(var i=0;i<c2cs.length;i++) c2cs[i].last().css("opacity", (frac));
		}, function(){
			selectEl(addr, true);
			$("#elementsSlider").css("left", "-155px");
			$("#elementsSlider").css("width", "700px");
			cols[2].css("width", "155px");
			cols[2].css("background", "rgb(60,60,60)");
		});
	}else{
		ani(0, 160, 6, function(w){
			var frac = w/160;
			$("#elementsSlider").css("left", (-155+(frac*35))+"px");
			$("#elementsSlider").css("width", (700+w)+"px");
			cols[2].css("width", (155+w)+"px");
			var gsv = Math.round(60-(frac*10));
			cols[2].css("background", "rgb("+gsv+","+gsv+","+gsv+")");
			for(var i=0;i<c2cs.length;i++) c2cs[i].last().css("opacity", (frac));
		}, function(){
			selectEl(addr, true);
			$("#elementsSlider").css("left", "-155px");
			$("#elementsSlider").css("width", "700px");
			cols[2].css("width", "155px");
			cols[2].css("background", "rgb(60,60,60)");
		});
	}
}
function showSelectOn(el){
	$("#selector").css("display", "block");
	$("#selector").css("top", el.y($("#canvas"))+"px");
	$("#selector").css("left", el.x($("#canvas"))+"px");
	$("#selector").css("width", el.cssn("width")+"px");
	$("#selector").css("height", el.cssn("height")+"px");
}
function insertEls(els, into, parent, selAddr){
	into.clear();
	for(var i=0;i<els.length;i++){
		var sel = selAddr?els[i].addr[els[i].addr.length-1]==selAddr[selAddr.length-1]:false;
		into.appendChild(elementEl(getData(els[i].addr), els[i].addr, parent, sel));
	}
}
function elementEl(data, addr, parent, sel){
	var el = element(false, "div", "element");
	el.addr = addr;
	var or = element(false, "div", "elementOrder");
	or.innerHTML = addr[addr.length-1];
	var na = element(false, "div", "elementName");
	na.innerHTML = data.name;
	el.appendChild(or);
	el.appendChild(na);
	if(data.childs){
		var ar = element(false, "div", "elementEnter icon icon-right-open");
		if(parent) ar.css("display", "none");
		el.appendChild(ar);
	}
	el.select = function(){
		this.css("background", "rgb(60,60,60)");
	};
	el.deselect = function(){
		this.css("background", "");
	};
	el.event("clickstart", function(e){
		var inity = e.y;
		var pel = e.el;
		while(pel && !pel.hasClass("element")) pel = pel.parent();
		var col = pel.parent();
		var offset = el.y()-e.y;
		var del = element("dragEl", "div", "dragElement");
		var oldindex = parseInt(pel.addr[pel.addr.length-1]);
		col.dragging = false;
		$("body").event("mousemove", function(me){
			if(Math.abs(me.y-inity) > 5 && !col.dragging){
				del.css("top", pel.offsetTop+"px");
				del.css("left", col.offsetLeft+"px");
				del.css("width", col.cssn("width")+"px");
				del.innerHTML = pel.innerHTML;
				$("#elementsSlider").appendChild(del);
				var i = element(false, "div", "ielement");
				pel.addBefore(i);
				pel.remove();
				col.dragging = true;
			}else if(col.dragging){
				del.css("top", (me.y-$("#elementsSlider").y()+offset)+"px");
			}
		});
		$("body").event("mouseup", function(fe){
			$("body").rmEvent("mousemove");
			$("body").rmEvent("mouseup");
			if(col.dragging){
				col.dragging = false;
				$("#dragEl").remove();
				var paddr = col.first().addr||col.childs(1).addr;
				paddr.pop();
				var cel = getEl(paddr);
				if(col.nindex){
					var data = getData(paddr);
					data.childs.splice(col.nindex, 0, data.childs.splice(oldindex, 1)[0]);
					var oldel = cel.childs(oldindex).clone();
					oldel.addr = cel.childs(oldindex).addr;
					cel.childs(oldindex).remove();
					if(col.nindex !== 0) cel.childs(col.nindex-(oldindex<col.nindex?1:0)).addAfter(oldel);
					else cel.first().addBefore(oldEl);
					var cs = cel.childs();
					for(var k=0;k<cs.length;k++){
						cs[k].addr = paddr.concat(String(k));
					}
				}
				insertEls(cel.childs(), col, col.hasClass("elementPCol"));
			}
		});
	});
	el.event("click", function(e){
		if(e.el.hasClass("elementEnter")) gotoChild(addr);
		else{
			var p = e.el.parent();
			var child = false;
			while(p && p.id != "elementsSlider"){
				if(p.hasClass("elementCCol")) child = true;
				p = p.parent();
			}
			!child?gotoParent(addr):selectEl(addr);
		}
	});
	el.event("mouseover", function(e){
		if(el.parent().dragging){
			var i = element(false, "div", "ielement");
			var p = e.el;
			while(!p.hasClass("element")) p = p.parent();
			var n = p;
			while(n && !n.hasClass("ielement")) n = n.next();
			while(p && !p.hasClass("ielement")) p = p.prev();
			var index = false;
			if(p){
				p.next().addAfter(i);
				p.remove();
				index = i.siblings().indexOf(i);
			}else if(n){
				n.prev().addBefore(i);
				n.remove();
				index = i.siblings().indexOf(i);
			}
			if(index !== false){
				el.parent().nindex = index;
				$("#dragEl").first().innerHTML = index;
				var pel = e.el;
				while(pel && !pel.hasClass("element")) pel = pel.parent();
				var s = pel.siblings();
				for(var l=0;l<s.length;l++){
					if(s[l].childs()) s[l].first().innerHTML = l;
				}
			}
			
		}
	});
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