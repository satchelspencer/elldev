var openPage = "";
var openData = [];
var gui = true;
var tool = "select";
var showWireframe = true;
var add = "addContent";
var sendingEditData = false;
var editingText = false;
function editInit(){
	editPage("/");
	$("#workspace").kevent(function(e){
		if(editingText) return false;
		if(e.code == 72) setTool({"el" : $("#select"), "e" : {"shiftKey" : "true"}});
		else if(e.code == 65) setTool({"el" : $("#select")});
		else if(e.code == 66) setTool({"el" : $("#add")});
	});
	$("#tools").event("click", setTool);
	$(".selectorDrag").event("mousedown", selectorDrag);
	$("#selectorcenter").event("mousedown", selectorCenterDrag);
	$("#selectorcenter").event("mouseover", function(){
		$("#selectorcenter").css("opacity", "1");
		$("#selectorcenter").css("background", "rgba(100,100,100,0.5)");
	});
	$("#selectorcenter").event("mouseout", function(){
		$("#selectorcenter").css("opacity", "0.5");
		$("#selectorcenter").css("background", "none");
	});
	pickerInit();
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
	if(tool == "select" && e.e && e.e.shiftKey){
		showWireframe = !showWireframe;
		$("#wireframe").className = "icon "+(showWireframe?"icon-move":"icon-eye");
		$("#selector").css("display", showWireframe?"block":"none");
	}
	var cursors = {"select" : "default", "add" : "crosshair"};
	$("#canvas").css("cursor", cursors[tool]);
	for(var i=0;i<tools.length;i++){
		var d = tools[i].id=="add"? tools[i].childs(0):tools[i];
		d.css("color", tools[i].id == tool?"#272727":"#a0a0a0");
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
		showSelectOn(getEl(selectedAddr));
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
		showSelectOn(getEl(selectedAddr));
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
function elScroll(e){
	if(e.el !== getEl(selectedAddr)) redrawSelection();
}
var selectedAddr = false;
var rootAddr = false;
function selectEl(addr, nani){
	if(addr === selectedAddr) return false;
	var el = getEl(addr);
	var data = el.data();
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
	showSelectOn(el);
	selectedAddr = addr;
	displayProps(addr);
	hidePicker();
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
function redrawSelection(){
	if(showWireframe) showSelectOn(getEl(selectedAddr));
}
function showSelectOn(el){
	$("#selector").css("display", showWireframe?"block":"none");
	$("#selector").css("top", el.y($("#canvas"))+"px");
	$("#selector").css("left", el.x($("#canvas"))+"px");
	$("#selector").css("width", el.cssn("width")+"px");
	$("#selector").css("height", el.cssn("height")+"px");
	var spos = getData(el.addr).position;
	var selcss = {"top" : ["height", "marginTop"], "bottom" : ["height", "marginBottom"], "left" : ["width", "marginLeft"], "right" : ["width", "marginRight"]};
	for(var i in selcss){
		if(spos[i]){
			$("#selector"+i).css("display", "block");
			$("#selector"+i).css(selcss[i][0], val2css(spos[i]));
			$("#selector"+i).css(selcss[i][1], "-"+val2css(spos[i]));
		}else $("#selector"+i).css("display", "none");
	}
	$(".selectorDrag").css("display", "block");
	var hideOnExpand = {"top" : ["n", "nw", "ne"], "bottom" : ["s", "sw", "se"], "left" : ["w", "nw", "sw"], "right" : ["e", "ne", "se"]};
	var overflow = el.data().overflow;
	var expandPos = {"X" : ["left", "right"], "Y" : ["top", "bottom"]}
	for(var o in overflow){
		if(overflow[o] == "expand"){
			var pos = expandPos[o];
			var toHide = [];
			for(var i in pos){
				if(!el.data().position.hasOwnProperty(pos[i])) toHide = toHide.concat(hideOnExpand[pos[i]]);
			}
			for(var k in toHide) $("#drag"+toHide[k]).css("display", "none");
		}
	}	
	$("#selectorcenter").css("display", el.parent().data().type=="sequence"?"none":"block");
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
	or.innerHTML = parseInt(addr[addr.length-1])+1;
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
			if(Math.abs(me.y-inity) > 5 && !col.dragging && col.childs().length > 1){
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
				var containerh = $("#elementsSlider").cssn("height")-25;
				var val = me.y-$("#elementsSlider").y()+offset;
				del.css("top", (val<0?0:val>containerh?containerh:val)+"px");
			}
		});
		$("body").event("mouseup", function(fe){
			$("body").rmEvent("mousemove");
			$("body").rmEvent("mouseup");
			if(col.dragging){
				col.dragging = false;
				$("#dragEl").remove();
				var paddr = col.first().addr||col.childs(1).addr;
				paddr = paddr.slice(0, -1);
				var cel = getEl(paddr);
				if(col.hasOwnProperty("nindex")){
					var data = cel.data();
					data.childs.splice(col.nindex, 0, data.childs.splice(oldindex, 1)[0]);
					var oldel = cel.childs(oldindex).dclone();
					cel.childs(oldindex).remove();
					if(col.nindex == 0) cel.first().addBefore(oldel);
					else if(col.nindex == cel.childs().length) cel.appendChild(oldel);
					else cel.childs(col.nindex).addBefore(oldel);
					var cs = cel.childs();
					for(var k=0;k<cs.length;k++){
						cs[k].setAddr(paddr.concat(String(k)));
					}
					if(col.hasClass("elementCCol")) selectEl(paddr.concat(String(col.nindex)), true);
				}
				insertEls(cel.childs(), col, col.hasClass("elementPCol"), selectedAddr);
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
				$("#dragEl").first().innerHTML = index+1;
				var pel = e.el;
				while(pel && !pel.hasClass("element")) pel = pel.parent();
				var s = pel.siblings();
				for(var l=0;l<s.length;l++){
					if(s[l].childs()) s[l].first().innerHTML = l+1;
				}
			}
			
		}
	});
	if(sel) el.select();
	return el;
}
function selectorDrag(e){
	$("body").class("unselectable");
	var seld = getData(selectedAddr);
	var selel = getEl(selectedAddr);
	var dirsProps = {"n":"top","e":"right","s":"bottom","w":"left"};
	var dirsSizes = {"top" : "height", "bottom" : "height", "left" : "width", "right" : "width"};
	var dirsSigns = {"top" : -1, "bottom" : 1, "left" : -1, "right" : 1};
	var dir = e.el.id.replace("drag", "");
	toSet = {};
	for(var c in dir){
		var hasDir = seld.position.hasOwnProperty(dirsProps[dir[c]]);
		var prop = hasDir?dirsProps[dir[c]]:dirsSizes[dirsProps[dir[c]]];
		if(selel.parent().data().type == "sequence" && prop == "bottom") prop = "height";
		toSet[prop] = {};
		toSet[prop].sign = dirsSigns[dirsProps[dir[c]]];
		if(prop == "height" || prop == "width") toSet[prop].sign *= -1;
		toSet[prop].dir = dirsSizes[dirsProps[dir[c]]]=="width"?"x":"y";
		toSet[prop].init = val2int(seld.position[prop]);
	}
	$("body").event("mousemove", function(me){
		for(var i in toSet){
			var delt = (e[toSet[i].dir]-me[toSet[i].dir])*toSet[i].sign;
			selel.showset("position", i, String(toSet[i].init+delt));
		}
	});
	$("body").event("mouseup", function(){
		$("body").rmClass("unselectable");
		$("body").rmEvent("mousemove");
		$("body").rmEvent("mouseup");
	});
}
function selectorCenterDrag(e){
	$("body").class("unselectable");
	var seld = getData(selectedAddr);
	var selel = getEl(selectedAddr);
	var props = ["left", "right", "top", "bottom"];
	var dirsSigns = {"top" : -1, "bottom" : 1, "left" : -1, "right" : 1};
	var propsDirs = {"left" : "x", "right" : "x", "top" : "y", "bottom" : "y"};
	var toSet = [];
	var inits = {};
	for(var i in props){
		if(seld.position.hasOwnProperty(props[i])){
			toSet.push(props[i]);
			inits[props[i]] = val2int(seld.position[props[i]]);
		}
	}
	$("body").event("mousemove", function(me){
		for(var i in toSet){
			var prop = toSet[i];
			var delt = (e[propsDirs[prop]]-me[propsDirs[prop]])*dirsSigns[prop];
			selel.showset("position", prop, String(inits[prop]+delt));
		}
	});
	$("body").event("mouseup", function(){
		$("body").rmClass("unselectable");
		$("body").rmEvent("mousemove");
		$("body").rmEvent("mouseup");
	});
}
function getData(addr){
	var r = openData;
	for(var i in addr) r = r.childs[addr[i]];
	return r; 
}
function getEl(addr){
	var r = $("#canvas");
	for(var i in addr) r = r.childs(addr[i]);
	return extcEl(extEl(r));
}
var pfields = ["red", "green", "blue", "alpha"];
function pickerInit(){
	for(var x in pfields){
		(function(x){
			$("#"+pfields[x]).event("mousedown", function(e){
				var initx = e.x;
				var w = $("#"+pfields[x]).cssn("width");
				var l = $("#"+pfields[x]).x();
				var alpha = pfields[x]=="alpha";
				$("#"+pfields[x]).first().css("left", (e.x-l)+"px");
				$("body").event("mousemove", function(ev){
					var offset = ev.x-l;
					offset = offset>w?w:offset<0?0:offset;
					var value = Math.round((offset/w)*(alpha?100:255))*(alpha?.01:1);
					$("#"+pfields[x]).first().css("left", offset+"px");
					$("#"+pfields[x]).childs(1).innerHTML = String(value).replace(/^(0\.[\d]{2}).*$/i, "$1");
					pickerCall(getPickerVal());
				});
				$("body").event("mouseup", function(ev){
					$("body").rmEvent("mousemove");
					$("body").rmEvent("mouseup");
				});
			});
		})(x);
	}
}
function getPickerVal(){
	var o = [];
	for(var x in pfields){
		o.push($("#"+pfields[x]).childs(1).innerHTML);
	}
	return o.join(",");
}
var pickerOut = false;
var pickerCall = function(c){};
function showPicker(value){
	if(!pickerOut){
		pickerOut = true;
		ani(0, 80, 4, function(h){
			$("#colorPicker").css("height", h+"px");
			$("#propertiesList").scrollTop += 20;
			$("#propertiesList").css("bottom", h+"px");
		});
	}
	var vals = value.split(",");
	for(var x in pfields){
		$("#"+pfields[x]).first().css("left", ((parseFloat(vals[x])/(pfields[x]=="alpha"?1:255))*$("#"+pfields[x]).cssn("width"))+"px");
		$("#"+pfields[x]).childs(1).innerHTML = vals[x];
	}
}
function hidePicker(){
	if(!pickerOut) return false;
	pickerOut = false;
	ani(80, 0, 4, function(h){
		$("#colorPicker").css("height", h+"px");
		$("#propertiesList").scrollTop -= 20;
		$("#propertiesList").css("bottom", h+"px");
	});
}
function sliderInit(el, ranges, callback, suffix){
	var field = el.childs(1);
	var slider = el.childs(2);
	var sw = slider.cssn("width");
	var handle = slider.last();
	var offset = slider.x();
	var cs = slider.childs();
	var notches = [];
	for(var i=0;i<cs.length-1;i++){
		notches.push({"id" : cs[i].className.split(" ")[1], "left" : cs[i].offsetLeft, "range" : ranges[i]});
	}
	var call = function(val, suff){
		field.innerHTML = val+suff;
		if(callback) callback(val);
	};
	slider.event("mousedown", function(ev){
		var track = function(e){
			var offset = slider.x();
			var l = e.x-offset;
			l = l>sw?sw:l<0?0:l;
			var hit = false;
			var prev = false;
			if(notches.length){
				for(var n=0;n<notches.length;n++){
					if(l-notches[n].left <= 6 && l-notches[n].left >= 0) hit = n;
					else if(notches[n].left < l) prev = n;
				}
				if(hit !== false){
					l = notches[hit].left+2;
					call(notches[hit].id, "");
				}else if(prev !== false && notches[prev].range !== false){
					var ran = notches[prev].range;
					var rsize = ran[1]-ran[0];
					var dsize = (notches[prev+1]?notches[prev+1].left:sw)-(notches[prev].left+6);
					var off = l-notches[prev].left-6;
					call(Math.round(((off/dsize)*rsize)+ran[0]), suffix);
				}
			}else{
				var rsize = ranges[1]-ranges[0];
				call(Math.round(((l/sw)*rsize)+ranges[0]), suffix);
			}
			handle.css("left", l+"px");
		};
		track(ev);
		$("body").event("mousemove", track);
		$("body").event("mouseup", function(e){
			$("body").rmEvent("mousemove");
			$("body").rmEvent("mouseup");
		});
	});
}