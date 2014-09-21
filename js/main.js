window.onload = function(){
	log("starting up");
	listPageDir("/");
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
	$("#stop").css("display", "block");
	$("#stopMessage").innerHTML = message;
	halted = true;
}
function unhalt(){
	if(!halted) return false;
	$("#stop").css("display", "none");
	$("#stopMessage").innerHTML = "";
	halted = false;
}