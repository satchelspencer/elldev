var currentPageData = false;
function editPage(path){
	$("urlField").innerHTML = path;
	sendData({"pageinfo" : path}, function(d){
		currentPageData = JSON.parse(d);
	});
}