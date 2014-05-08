var currentPageData = false;
function editPage(path){
	$("urlField").innerHTML = path;
	sendData({"pageinfo" : path}, function(d){
		currentPageData = JSON.parse(d);
		rid = 0;
		$("root").clear();
		for(x in currentPageData.els) $("root").appendChild(el(currentPageData.els[x]));
	});
}
var selectedElId = false;
function selectEl(id){
	selectedElId = id;
	var j = $(id).j;
	var pType = $(id).parentNode.j ? $(id).parentNode.j.type : "canvas";
	if(pType == "canvas"){
		$("positioncanvas").show();
		$("positionsequence").hide();
		var p = $(id).j.position;
		var i = {"nw":["top", "left"],"n":["top", "centerx"],"ne":["top", "right"],"w":["left","centery"],"c":["centerx", "centery"],"e":["right", "centery"],"sw":["bottom","left"],"s":["bottom","centerx"],"se":["bottom","right"]};
		for(x in i) $("position"+x).style.background = p[i[x][0]] && p[i[x][1]] ? "#575757" : "#474747";
		var o = {top : "nw", left : "sw", bottom : "se", right : "ne"};
		for(x in o){
			$("position"+x).style.display = (p[x]) ? "block" : "none";
			$("origin"+o[x]).style.background = (p[x]) ? isAbsolute(p[x]) ? "white" : "red" : "white";
			$(x+"label").innerHTML = p[x]+(isAbsolute(p[x]) ? "px" : "");
		}
	}else if(pType == "sequence"){
		$("positionsequence").show();
		$("positioncanvas").hide();
	}
}