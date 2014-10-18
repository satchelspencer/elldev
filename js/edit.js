var openPage = "";
var openData = [];
var gui = true;
var sendingEditData = false;
function editInit(){
	editPage("/");
	$("#workspace").kevent(function(e){
		if(e.code == 72) gui?hideGui():showGui();
	});
}
function editPage(e){
	var path;
	if(!e.e) path = e;
	else{
		var g = e.el.parent().parent();
		path = g.data?g.data.path:"/";
	}
	if(path != openPage) sendEditData({"getpage" : path}, function(d){
		openPage = path;
		$("#uriPath").innerHTML = path;
		try{
			openData = JSON.parse(d);
		}catch(e){
			warn(path+" is corrupt");
			return false;
		}
		render(openData, $("#canvas"));
		});
}
function sendEditData(data, callback){
	sendingEditData = true;
	sendData(data, function(d){
		sendingAssetData = false;
		callback(d);
	});
}
function hideGui(){
	if(!gui) return false;
	gui = false;
	ani(0, -350, 5, function(w){
		$("#gui").css("marginLeft", w+"px");
		$("#workspace").css("left", (350+w)+"px");
	}, function(){
		gui = false;
	});
}
function showGui(){
	if(gui) return false;
	gui = true;
	ani(-350, 0, 5, function(w){
		$("#gui").css("marginLeft", w+"px");
		$("#workspace").css("left", (350+w)+"px");
	}, function(){
		gui = true;
	});
}