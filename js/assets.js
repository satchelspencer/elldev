var assetDir = [];
var sendingAssetData = false;
var assetDragging = false;
var extTable = {
	"file-audio" : /^.*\.(aif|iff|aiff|m3u|mp3|wav|flac|wma|mid|m4a|mpa)$/i, 
	"file-video" : /^.*\.(mov|mp4|3g2|3gp|asf|asx|avi|flv|m4v|mpg|rm|srt|swf|vob|wmv)$/i,
	"file-image" : /^.*\.(jpg|png|jpeg|bmp|dds|gif|tif|tiff|svg)$/i,
	"file-pdf" : /^.*\.(pdf|psd|ai|indd)$/i,
	"file-archive" : /^.*\.(zip|zipx|gz|rar|pkg|7z|tar)$/i,
	"doc-text" : /^.*\.(doc|docx|log|pages|rtf|tex|txt)$/i
};
function assetInit(){
	listAssetDir([]);
	$("#assetList").event("click", function(e){
		if(e.el.id == "assetList" && !assetDragging) deselectAllAssets();
	});
}
var assetLoadAng = 0;
var assetLoadAni;
function setAssetLoadBright(c){
	c = Math.round(c);
	$("#assetLoad").css("color", "rgb("+c+","+c+","+c+")");
}
function sendAssetData(data, callback){
	sendingAssetData = true;
	var adone = false;
	ani(64, 150, 10, setAssetLoadBright, function(){
		adone = true;
		if(!sendingAssetData) ani(150, 64, 10, setAssetLoadBright);
	});
	assetLoadAni = setInterval(function(){
		$("#assetLoad").css("transform", "rotate(-"+assetLoadAng+"deg)");
		assetLoadAng = (assetLoadAng+5)%360;
	},30);
	sendData(data, function(d){
		if(adone) ani(150, 64, 10, setAssetLoadBright);
		clearInterval(assetLoadAni);
		sendingAssetData = false;
		callback(d);
	});
}
function listAssetDir(dir){
	var dirname = getCurrentDir(dir);
	sendAssetData({"openassetdir" : dirname}, function(d){
		assetDir = dir;
		$("#browserBack").css("color", assetDir.length>0?"white":"#676767");
		dispAssetDirData(JSON.parse(d), dirname);
	});
}
function dispAssetDirData(data, dirname){
	$("#assetPathLabel").innerHTML = "/<span style='color:#ffffff;margin-right:1px;'>as</span>"+dirname;
	$("#assetList").clear();
	for(var i in data){
		var el = data[i].type == "file"?assetListFile(data[i].name):assetListDir(data[i].name);
		$("#assetList").appendChild(el);
	}
}
function getSelectedAssets(){
	var r = [];
	var assets = $("#assetList").childs();
	if(assets) for(var c=0;c<assets.length;c++) if(assets[c].selected) r.push(assets[c]);
	return r;
}
function inspectAssets(){
	var sel = getSelectedAssets();
	if(!sel.length) hideAssetInspector();
	else{
		showAssetInspector();
		log(sel);
	}
}
function deselectAllAssets(){
	var assets = $("#assetList").childs();
	if(assets){
		for(var c=0;c<assets.length;c++){
			assets[c].css("background", "none");
			assets[c].selected = false;
		}
	}
	inspectAssets();
}
var assetInspectorOpen = false;
function showAssetInspector(){
	if(assetInspectorOpen) return false;
	assetInspectorOpen = true;
	ani(25, 0, 4, function(b){
		$("#assetInspector").css("bottom", "-"+b+"px");
		$("#assetList").css("bottom", (25-b)+"px");
	});
}
function hideAssetInspector(){
	if(!assetInspectorOpen) return false;
	assetInspectorOpen = false;
	var b = 0;
	ani(0, 25, 4, function(b){
		$("#assetInspector").css("bottom", "-"+b+"px");
		$("#assetList").css("bottom", (25-b)+"px");
	});
}
function assetListFile(name){
	var el = element("false", "div", "assetListEl");
	el.selected = false;
	el.dragging = false;
	var ext = name.match(/\..+$/i);
	extIcon = "";
	if(ext) for(var e in extTable){
		if(name.match(extTable[e])){
			extIcon = e;
			break;
		}
	}
	else extIcon = "doc";
	var t = element(false, "span", "assetListType icon icon-"+extIcon);
	el.appendChild(t);
	var n = element(false, "span", "assetName");
	n.innerHTML = name;
	el.appendChild(n);
	el.event("sclick", function(e){
		assetClick(e, el);
	});
	return el;
}
function assetListDir(name){
	var el = element(false, "div", "assetListEl");
	el.selected = false;
	el.dragging = false;
	var t = element(false, "span", "assetListType icon icon-folder-empty");
	t.css("color", "white");
	el.appendChild(t);
	var n = element(false, "span", "assetName");
	n.innerHTML = name;
	el.appendChild(n);
	return el;

}
function assetClick(e, el){
	var assets = $("#assetList").childs();
	if(e.e.shiftKey && !el.selected){
		el.selected = true;
		el.css("background", "#808080");
		var clickIndex = assets.indexOf(el);
		var selectBeforeIndex = clickIndex;
		for(var i=clickIndex-1;i>=0;i--){
			if(assets[i].selected){
				selectBeforeIndex = i;
				break;
			}
		}
		var selectAfterIndex = clickIndex;
		for(var i=clickIndex+1;i<assets.length;i++){
			if(assets[i].selected){
				selectAfterIndex = i;
				break;
			}
		}
		for(var j=selectBeforeIndex+1;j<selectAfterIndex;j++){
			assets[j].selected = true;
			assets[j].css("background", "#808080");
		}
	}else if(e.e.metaKey){
		log("met");
		el.selected = !el.selected;
		el.css("background", el.selected?"#808080":"none");
	}else{
		if(assets) for(var c=0;c<assets.length;c++){
			assets[c].css("background", "none");
			assets[c].selected = false;
		}
		el.selected = true;
		el.css("background", "#808080");
	}
	inspectAssets();
}