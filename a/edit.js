var currentPageData = false;
function editPage(path){
	$("urlField").innerHTML = path;
	sendData({"pageinfo" : path}, function(d){
		currentPageData = JSON.parse(d);
		for(x in currentPageData.els) $("root").appendChild(el(currentPageData.els[x]));
	});
}
function selectEl(id){
	log(id+"s");
}