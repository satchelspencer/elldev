window.onload = function(){
	browserInit();
	$("#propertiesSeparator").event("mousedown", function(){
		var min = 200;
		var max = $("body").viewHeight-$("#browser").cssn("height")-200;
		$("body").event("mousemove", function(e){
			var offset = e.y < min ? min : e.y > max ? max : e.y;
			$("#properties").css("height", offset+"px");
			$("#propertiesSeparator").css("top", offset+"px");
			$("#elements").css("top", (offset+5)+"px");
		});
		$("body").event("mouseup", function(){
			$("body").rmEvent("mousemove");
			$("body").rmEvent("mouseup");
		});
	});
	$("#browserSeparator").event("mousedown", function(){
		var min = $("#properties").cssn("height")+200;
		var max = $("body").viewHeight-200;
		$("body").event("mousemove", function(e){
			var ny = e.y < min ? min : e.y > max ? max : e.y;
			var offset = $("body").viewHeight-ny;
			$("#browser").css("height", offset+"px");
			$("#browserSeparator").css("bottom", offset+"px");
			$("#elements").css("bottom", (offset+5)+"px");
		});
		$("body").event("mouseup", function(){
			$("body").rmEvent("mousemove");
			$("body").rmEvent("mouseup");
		});
	});
};
window.onresize = function(){
	if($("body").viewHeight < 700 || $("body").viewWidth < 800) halt("window too small");
	else unhalt();
};
var halted = false;
function halt(message){
	if(halted) return false;
	var o = 0;
	halted = true;
	$("#stopMessage").innerHTML = message;
	$("#stop").css("display", "block");
	var a = setInterval(function(){
		o += .2;
		if(o >= 1){
			$("#stop").css("opacity", 1);
			clearInterval(a);
		}
		$("#stop").css("opacity", o);
	}, 30);
}
function unhalt(){
	if(!halted) return false;
	var o = 1;
	halted = false;
	$("#stopMessage").innerHTML = "";
	var a = setInterval(function(){
		o -= .2;
		if(o <= 0){
			$("#stop").css("opacity", 0);
			$("#stop").css("display", "none");
			clearInterval(a);
		}
		$("#stop").css("opacity", o);
	}, 30);
}