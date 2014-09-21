var pageDir = "";
function listPageDir(dir){
	ajax("io.php", {"opendir" : dir}, false, function(d){
		var data = JSON.parse(d);
		log(data);
		pageDir = dir;
		hideInspector();
		$("#parentPageName").innerHTML = data.parent.title;
		$("#browserPathLabel").innerHTML = dir;
		$("#browserList").clear();
		for(var i=0;i<data.children.length;i++){
			$("#browserList").appendChild(pageListItem(data.children[i]));
		}
	});
}
function inspectPage(data){
	$("#browserInspectorNameValue").innerHTML = data.title;
	$("#browserInspectorDescValue").innerHTML = data.desc;
	showInspector();
}
var inspectorOpen = false;
function showInspector(){
	if(inspectorOpen) return false;
	var b = 63;
	var a = setInterval(function(){
		if(Math.abs(b) < 2 || b < 0){
			clearInterval(a);
			$("#browserInspector").css("bottom", "0");
			inspectorOpen = true;
		}
		$("#browserInspector").css("bottom", "-"+b+"px");
		b -= 7;
	}, 25);
}
function hideInspector(){
	if(!inspectorOpen) return false;
	var b = 0;
	var a = setInterval(function(){
		if(Math.abs(b-63) < 2 || b > 63){
			clearInterval(a);
			$("#browserInspector").css("bottom", "-63px");
			inspectorOpen = false;
		}
		$("#browserInspector").css("bottom", "-"+b+"px");
		b += 7;
	}, 25);
}
function pageListItem(data){
	var el = element(false, "div", "browserListEl");
	el.innerHTML = data.title;
	el.event("click", function(){
		$("#browserList").childs().css("background", "none");
		el.css("background", "#373737");
		inspectPage(data)
	});
	return el;
}