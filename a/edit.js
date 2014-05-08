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
		$("positionnw").style.background = (p.top && p.left) ? "#575757" : "#474747";
		$("positionn").style.background = (p.top && p.centerx) ? "#575757" : "#474747";
		$("positionne").style.background = (p.top && p.right) ? "#575757" : "#474747";
		$("positionw").style.background = (p.left && p.centery) ? "#575757" : "#474747";
		$("positionc").style.background = (p.centerx && p.centery) ? "#575757" : "#474747";
		$("positione").style.background = (p.right && p.centery) ? "#575757" : "#474747";
		$("positionsw").style.background = (p.bottom && p.left) ? "#575757" : "#474747";
		$("positions").style.background = (p.bottom && p.centerx) ? "#575757" : "#474747";
		$("positionse").style.background = (p.bottom && p.right) ? "#575757" : "#474747";
		$("positiontop").style.display = (p.top) ? "block" : "none";
		$("originnw").style.background = (p.top) ? isAbsolute(p.top) ? "white" : "red" : "white";
		$("toplabel").innerHTML = p.top+(isAbsolute(p.top) ? "px" : "");
		$("positionleft").style.display = p.left ? "block" : "none";
		$("originsw").style.background = p.left ? isAbsolute(p.left) ? "white" : "red" : "white";
		$("leftlabel").innerHTML = p.left+(isAbsolute(p.left) ? "px" : "");
		$("positionbottom").style.display = p.bottom ? "block" : "none";
		$("originse").style.background = p.bottom ? isAbsolute(p.bottom) ? "white" : "red" : "white";
		$("bottomlabel").innerHTML = p.bottom+(isAbsolute(p.bottom) ? "px" : "");
		$("positionright").style.display = p.right ? "block" : "none";
		$("originne").style.background = p.right ? isAbsolute(p.right) ? "white" : "red" : "white";
		$("rightlabel").innerHTML = p.right+(isAbsolute(p.right) ? "px" : "");
	}else if(pType == "sequence"){
		$("positionsequence").show();
		$("positioncanvas").hide();
	}
}