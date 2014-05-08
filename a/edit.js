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
	if($(id).parentNode.j.type == "canvas"){
		$("positioncanvas").show();
		$("positionsequence").hide();
	}else if($(id).parentNode.j.type == "sequence"){
		$("positionsequence").show();
		$("positioncanvas").hide();
	}
}