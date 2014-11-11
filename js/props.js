function propsInit(){
	for(var p  in props){
		if(props[p].init) props[p].init();
	}
}
var mdirs = ["top", "left", "bottom", "right"];
var openElData = false;
function displayProps(addr){
	openElData = getData(addr);
	$("#elementTitle").innerHTML = openElData.name;
	$("#elementType").innerHTML = "("+openElData.type+")";
	for(var p  in props) props[p].disp(normalizeProps(openElData[p], defaults[p], addr));
}
function normalizeProps(data, defn, addr){
	if(!defn) return data;
	var def = defn(addr);
	var r = {};
	if(data) for(var i in data) r[i] = data[i];
	for(var d in def) r[d] = r[d]||def[d];
	return r;
}
var props = {};
props.position = {
	"init" : function(){
		for(var i in mdirs){
			(function(i){
				$("#box"+mdirs[i]).event("click", function(e){
					if(!e.e.shiftKey && $("#box"+mdirs[i]).className != "positionDisabled"){
						fieldClicked($("#box"+mdirs[i]).first().first(), validPosition, "#a0a0a0", function(val){
							getEl(selectedAddr).set("position", mdirs[i], val);
						}, function(){
							return getData(selectedAddr).position[mdirs[i]];
						});
					}else if(e.e.shiftKey){
						var prop = mdirs[i];
						var opposites = {"top" : "bottom", "bottom" : "top", "left" : "right", "right" : "left"};
						var alternates = {"top" : "height", "bottom" : "height", "left" : "width", "right" : "width"};
						var altAxis = {"width" : "X", "height" : "Y"};
						var opp = opposites[prop];
						var alt = alternates[prop];
						var altu = alt[0].toUpperCase()+alt.substring(1);
						var sel = getEl(selectedAddr);
						var dat = sel.data();
						var parentsize = sel.parent()["scroll"+altu];
						if(dat.position.hasOwnProperty(prop)){
							if(dat.overflow && dat.overflow[altAxis[alt]] == "expand"){
								sel.showset("position", opp, String(parentsize-val2int(dat.position[prop])-sel.cssn(alt)));
								sel.fit(altAxis[alt]);
							}
							delete dat.position[prop];
							sel.showset("position", alt, String(sel.cssn(alt)));
						}else{
							if(dat.position.hasOwnProperty(opp)){
								delete dat.position[alt];
								sel.showset("position", prop, String(parentsize-val2int(dat.position[opp])-sel.cssn(alt)));
								if(dat.overflow && dat.overflow[altAxis[alt]] == "expand"){
									sel.showset("position", prop, String(parentsize-val2int(dat.position[opp])-sel.cssn(alt)));
									delete dat.position[opp];
									sel.showset("position", alt, String(sel.cssn(alt)));
									sel.fit(altAxis[alt]);
								}
							}else{
								sel.showset("position", prop, String(Math.round((parentsize-sel.cssn(alt))/2)));
							}
						}
					}
				});
			})(i);
		}
		var whels = ["boxWidthLabel", "boxHeightLabel"];
		var wprops = ["width", "height"];
		for(var i in whels){
			(function(i){
				$("#"+whels[i]).event("click", function(e){
					if(!e.e.shiftKey && $("#"+whels[i]).first().innerHTML != "auto"){
						fieldClicked($("#"+whels[i]).first(), validSize, "#fff", function(val){
							getEl(selectedAddr).set("position", wprops[i], val);
						}, function(){
							return getData(selectedAddr).position[wprops[i]];
						});
					}
				});
			})(i);
		}
	},
	"disp" : function(data){
		for(var i in mdirs){
			if(data.hasOwnProperty(mdirs[i]) || getEl(selectedAddr).parent().data().type == "sequence"){
				$("#box"+mdirs[i]).first().first().innerHTML = data[mdirs[i]]||"0";
				$("#box"+mdirs[i]).className = "";
			}else{
				$("#box"+mdirs[i]).first().first().innerHTML = "";
				$("#box"+mdirs[i]).className = "positionDisabled";
			}
		}	
		var wh = ["Width", "Height"];
		for(var i in wh){
			var field = $("#box"+wh[i]+"Label");
			var hasProp = data.hasOwnProperty(wh[i].toLowerCase())
			field.first().innerHTML = hasProp?data[wh[i].toLowerCase()]:"auto";
			field.first().css("color", hasProp?"#fff":"#777");
			field.childs(1).innerHTML = hasProp?"px":"";
		}
		var k = parseInt(selectedAddr[selectedAddr.length-1])+1;
		$("#orderVal").innerHTML = k;
		$("#orderSuffix").innerHTML = k>10&&k<20?"th":k%10==1?"st":k%10==2?"nd":k%10==3?"rd":"th"; 
	}
};
function validPosition(val){
	return val.match(/^-?\d+$/i) != null;
}
function validSize(val, type){
	return val.match(/^\d+$/i) != null;
}
props.overflow = {
	"init" : function(){
		for(var ax in axis){
			(function(ax){
				$("#overflow"+ax).event("click", function(e){
					var sel = getEl(selectedAddr);
					var dat = sel.data();
					var odat = normalizeProps(dat.overflow, defaults.overflow, selectedAddr);
					var overflows = ["hidden", "scroll", "expand"];
					var prev = odat[ax];
					var noverflow = overflows[(overflows.indexOf(prev)+1)%3];
					var axisAlts = {"X" : "width", "Y" : "height"};
					var axisAnchors = {"X" : ["left", "right"], "Y" : ["top", "bottom"]};
					if(noverflow == "expand"){
						var anchors = [];
						for(var x in axisAnchors[ax]) if(dat.position.hasOwnProperty(axisAnchors[ax][x])) anchors.push(axisAnchors[ax][x]);
						if(dat.position.hasOwnProperty(axisAlts[ax]) && anchors.length == 1){
							for(var x in axisAnchors[ax]) $("#overflowContent").css(axisAnchors[ax][x], "-20px");
							$("#overflow"+ax).childs().css("display", "none");
						}else noverflow = "hidden";
					}
					if(noverflow == "hidden"){
						for(var x in axisAnchors[ax]) $("#overflowContent").css(axisAnchors[ax][x], "0px");
						$("#overflow"+ax).childs().css("display", "none");
					}
					if(noverflow == "scroll"){
						for(var x in axisAnchors[ax]) $("#overflowContent").css(axisAnchors[ax][x], "0px");
						$("#overflow"+ax).childs().css("display", "block");
					}
					if(prev == "expand") sel.set("position", axisAlts[ax], odat[axisAlts[ax]]);
					sel.showset("overflow", ax, noverflow);
					if(noverflow == "expand"){
						dat.overflow[axisAlts[ax]] = sel.cssn("height");
						sel.fit(ax);
					}
				});
			})(ax)
		}
	},
	"disp" : function(data){
		if(openElData.type == "content"){
			$("#overflow").css("display", "none"); 
			$("#padding").css("display", "block"); 
		}else{
			$("#overflow").css("display", "block"); 
			$("#padding").css("display", "none"); 
			$("#overflowX").css("display", openElData.type == "canvas"?"block":"none");
			for(d in axis){	
				var val = data[d]||this.def[d];
				var horiz = d=="X";
				$("#overflowContent").css(!horiz?"top":"left", val=="expand"?"-20px":"0");
				$("#overflowContent").css(!horiz?"bottom":"right", val=="expand"?"-20px":"0");
				var adisp = !(val=="hidden")?"block":"none";
				$("#overflow"+d).childs().css("display", adisp);
				$("#overflow"+d).childs().css("display", adisp);
			}
		}
	}
};
props.padding = {
	"init" : function(){
	},
	"disp" : function(data){
		for(var i in dirs) $("#padding"+dirs[i]).first().innerHTML = data[i]+"px";
	}
};
props.background = {
	"init" : function(){
	},
	"disp" : function(data){
		$("#backgroundColor").first().css("background", "rgba("+data.color+")");
		var repeatcss = {"no-repeat" : ["none","none"], "repeat-y" : ["block","none"], "repeat-x" : ["none","block"], "repeat" : ["block","block"]};
		$("#tileVertRepeat").css("display", repeatcss[data.repeat][0]);
		$("#tileHorRepeat").css("display", repeatcss[data.repeat][1]);
		var clips = data.clip=="true"?50:68;
		$("#backgroundClipBg").css("width", clips+"px");
		$("#backgroundClipBg").css("height", clips+"px");
		$("#backgroundClipBg").css("marginTop", "-"+(clips/2)+"px");
		$("#backgroundClipBg").css("marginLeft", "-"+(clips/2)+"px");
		var hasImg = data.hasOwnProperty("image");
		$("#backgroundImage").css("background", !hasImg?"#474747":"url('../as"+data.image+"')");
		$("#backgroundImage").css("backgroundSize", "cover");
		$("#backgroundImageClear").css("display", hasImg?"block":"none");
		var sizelefts = {"auto" : "2px", "contain" : ($("#bgSizeFit").offsetLeft+2)+"px", "cover" : ($("#bgSizeCover").offsetLeft+2)+"px"};
		if(sizelefts[data.size]) $("#bgHandle").css("left", sizelefts[data.size]);
		else $("#bgHandle").css("left", (((parseInt(data.size)/100)*($("#bgSizeFit").offsetLeft-6))+6)+"px");
		$("#bgSizeValue").innerHTML = data.size=="contain"?"fitted":data.size+(sizelefts[data.size]?"":"%");
	}
};
props.font = {
	"init" : function(){
	},
	"disp" : function(data){
		$("#fontFamily").innerHTML = data.family;
		$("#fontColor").first().css("background", "rgba("+data.color+")");
		$("#fontAlign").className = "icon icon-align-"+data.align;
		$("#fontBold").css("color", data.bold=="true"?"#777":"#fff");
		$("#fontUnderline").css("color", data.underline=="true"?"#777":"#fff");
		$("#fontItalic").css("color", data.italic=="true"?"#777":"#fff");
		$("#fontSize").childs(1).innerHTML = data.size+"px";
		$("#fontSize").childs(2).first().css("left", ((parseInt(data.size)/500)*220)+"px");
		$("#fontLineHeight").childs(1).innerHTML = data.height=="normal"?"auto":data.height+"px";
		var lhval = data.height=="normal"?2:(((parseInt(data.height)/100)*204)+6);
		$("#lineHeightHandle").css("left", lhval+"px");
	},
	"fdef" : {
		"family" : "arial",
		"size" : "12",
		"color" : "0,0,0,1",
		"align" : "left",
		"bold" : "false",
		"underline" : "false",
		"italic" : "false",
		"height" : "normal"
	}
};
props.border = {
	"init" : function(){
	},
	"disp" : function(data){
		$("#borderColor").first().css("background", "rgba("+data.color+")");
		$("#borderStyle").innerHTML = data.style;
		for(var i in data.edges) $("#border"+dirs[i]).first().className = data.edges[i]?"icon icon-ok":"icon";
		$("#borderWidth").childs(1).innerHTML = data.width+"px";
		$("#borderWidth").childs(2).first().css("left", ((parseInt(data.width)/100)*240)+"px");
		$("#borderRadius").childs(1).innerHTML = data.radius+"px";
		$("#borderRadius").childs(2).first().css("left", ((parseInt(data.radius)/1000)*240)+"px");
	}
};
defaults = {};
defaults.overflow = function(){
	return {
		"X" : "hidden",
		"Y" : "hidden"
	};
};
defaults.padding = function(){
	return [0,0,0,0];
};
defaults.background = function(){
	return {
		"color" : "0,0,0,0",
		"repeat" : "no-repeat",
		"size" : "auto",
		"clip" : "true"
	};
};
defaults.font = function(addr){
	var def = {
		"family" : "arial",
		"size" : "12",
		"color" : "0,0,0,1",
		"align" : "left",
		"bold" : "false",
		"underline" : "false",
		"italic" : "false",
		"height" : "normal"
	};
	for(var x in def){
		var a = addr;
		while(a.length > 0){
			var fprop = getData(a).font||{};
			if(fprop.hasOwnProperty(x)){
				def[x] = fprop[x];
				break;
			}
			a = a.slice(0,-1);
		}
	}
	return def;
}
defaults.border = function(){
	return {
		"color" : "0,0,0,0",
		"width" : "0",
		"style" : "none",
		"radius" : "0",
		"edges" : [0,0,0,0]
	};
};
function fieldClicked(field, test, vcolor, set, getRevert){
	var finish = function(e, noblur){
		var val = e.el.innerHTML;
		if(test(val)){
			set(val);
			if(noblur == undefined) e.el.attr("contenteditable", "false");
		}else{
			e.el.css("color", vcolor);
			e.el.innerHTML = getRevert();
			if(noblur !== undefined) document.execCommand('selectAll',false,null);
			else e.el.attr("contenteditable", "false");
		}
	};
	field.attr("contenteditable", "true");
	field.focus();
	document.execCommand('selectAll',false,null);
	field.event("keyup", function(ev){
		field.css("color", test(field.innerHTML)?vcolor:"red");
	});
	field.event("keydown", function(ev){
		if(ev.code == 13){
			ev.e.preventDefault();
			finish(ev, true);
			return false;
		}
	});
	field.event("blur", finish);
}