function propsInit(){
	for(var p  in props) if(props[p].init) props[p].init();
}
var openElData = false;
function displayProps(addr){
	openElData = getData(addr);
	$("#elementTitle").innerHTML = openElData.name;
	$("#elementType").innerHTML = "("+openElData.type+")";
	for(var p  in props) props[p].disp(openElData);
}
var props = {};
props.position = {
	"init" : function(){
	},
	"disp" : function(adata){
		var data = adata.position;
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
	"disp" : function(adata){
		var data = adata.overflow;
		if(adata.type == "canvas"){
			$("#overflow").css("display", "block");
			$("#sequenceProps").css("display", "none");
			for(d in data){	
				var horiz = d=="X";
				$("#overflowContainer").css(horiz?"height":"width", data[d]=="expand"?"100px":"75px");
				var adisp = !(data[d]=="hidden")?"block":"none";
				$("#overflow"+(!horiz?"U":"L")+"arrow").css("display", adisp);
				$("#overflow"+(!horiz?"D":"R")+"arrow").css("display", adisp);
			}
		}
	}
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
