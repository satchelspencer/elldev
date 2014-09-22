window.onload = function(){
	browserInit();
	$("#propertiesSeparator").event("mousedown", function(){
		$("body").event("mousemove", function(e){
			$("#properties").css("height", e.y+"px");
			$("#propertiesSeparator").css("top", e.y+"px");
			$("#elements").css("top", (e.y+5)+"px");
		});
		$("body").event("mouseup", function(){
			$("body").rmEvent("mousemove");
			$("body").rmEvent("mouseup");
		});
	});
	$("#browserSeparator").event("mousedown", function(){
		$("body").event("mousemove", function(e){
			var offset = $("body").viewHeight-e.y;
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