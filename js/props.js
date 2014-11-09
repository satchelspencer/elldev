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
						var field = $("#box"+mdirs[i]).first().childs(1);
						field.attr("contenteditable", "true");
						field.focus();
						field.prevval = field.innerHTML;
						document.execCommand('selectAll',false,null);
						field.event("keyup", function(ev){
							field.css("color", validPosition(field.innerHTML)?"#a0a0a0":"red");
						});
						field.event("keydown", function(ev){
							if(ev.code == 13){
								ev.e.preventDefault();
								setPosition(ev, true);
								return false;
							}
						});
						field.event("blur", setPosition);
					}
				});
				$("#box"+mdirs[i]).first().childs(1).prop = mdirs[i];
			})(i);
		}
	},
	"disp" : function(data){
		for(var i in mdirs){
			if(data.hasOwnProperty(mdirs[i]) || getEl(selectedAddr).parent().data().type == "sequence"){
				$("#box"+mdirs[i]).first().childs(1).innerHTML = data[mdirs[i]]||"0";
				$("#box"+mdirs[i]).className = "";
			}else{
				$("#box"+mdirs[i]).first().childs(1).innerHTML = "";
				$("#box"+mdirs[i]).className = "positionDisabled";
			}
		}
		$("#boxPositionWidth").first().first().innerHTML = data.hasOwnProperty("width")?val2css(data.width):"<span style='color:#777;'>auto</span>";
		$("#boxPositionHeight").first().first().innerHTML = data.hasOwnProperty("height")?val2css(data.height):"<span style='color:#777;'>auto</span>";
		var k = parseInt(selectedAddr[selectedAddr.length-1])+1;
		$("#orderVal").innerHTML = k;
		$("#orderSuffix").innerHTML = k>10&&k<20?"th":k%10==1?"st":k%10==2?"nd":k%10==3?"rd":"th"; 
	}
};
function setPosition(e, noblur){
	var val = e.el.innerHTML;
	if(validPosition(val, e.el.prop)){
		getEl(selectedAddr).set("position", e.el.prop, val);
		if(noblur == undefined) e.el.attr("contenteditable", "false");
	}else{
		e.el.css("color", "#a0a0a0");
		e.el.innerHTML = e.el.prevval;
		if(noblur !== undefined) document.execCommand('selectAll',false,null);
		else e.el.attr("contenteditable", "false");
	}
}
function validPosition(val, type){
	return val.match(/^\d+$/i) != null;
}
props.overflow = {
	"init" : function(){
	},
	"disp" : function(data){
		if(openElData.type == "content"){
			$("#overflow").css("display", "none"); 
			$("#padding").css("display", "block"); 
		}else{
			$("#overflow").css("display", "block"); 
			$("#padding").css("display", "none"); 
			$("#overflowX").css("display", openElData.type == "canvas"?"block":"none");
			for(d in data){	
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