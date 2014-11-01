function propsInit(){
	for(var p  in props) if(props[p].init) props[p].init();
}
var openElData = false;
function displayProps(addr){
	openElData = getData(addr);
	$("#elementTitle").innerHTML = openElData.name;
	$("#elementType").innerHTML = "("+openElData.type+")";
	for(var p  in props) props[p].disp(normalizeProps(openElData[p], props[p].def));
}
function normalizeProps(data, def){
	if(!def) return data;
	var r = data||{};
	for(var d in def) r[d] = r[d]||def[d];
	return r;
}
var props = {};
props.position = {
	"init" : function(){
	},
	"disp" : function(data){
		var mdirs = ["top", "left", "bottom", "right"];
		for(var i in mdirs){
			if(data.hasOwnProperty(mdirs[i])){
				$("#box"+mdirs[i]).first().innerHTML = val2css(data[mdirs[i]]);
				$("#box"+mdirs[i]).className = "";
			}else{
				$("#box"+mdirs[i]).first().innerHTML = "";
				$("#box"+mdirs[i]).className = "positionDisabled";
			}
		}
		$("#boxPositionWidth").first().first().innerHTML = data.hasOwnProperty("width")?val2css(data.width):"<span style='color:#777;'>auto</span>";
		$("#boxPositionHeight").first().first().innerHTML = data.hasOwnProperty("height")?val2css(data.height):"<span style='color:#777;'>auto</span>";
		var k = parseInt(selectedAddr[selectedAddr.length-1]);
		$("#orderVal").innerHTML = k;
		$("#orderSuffix").innerHTML = k>10&&k<20?"th":k%10==1?"st":k%10==2?"nd":k%10==3?"rd":"th"; 
	}
};
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
	},
	"def" : {
		"X" : "hidden",
		"Y" : "hidden"
	}
};
props.padding = {
	"init" : function(){
	},
	"disp" : function(data){
		
	},
	"def" : [0,0,0,0]
};
props.background = {
	"init" : function(){
	},
	"disp" : function(data){
	}
};
props.font = {
	"init" : function(){
	},
	"disp" : function(data){
	}
};
props.border = {
	"init" : function(){
	},
	"disp" : function(data){
	}
};
