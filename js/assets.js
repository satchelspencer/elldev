var assetDir = [];
var sendingAssetData = false;
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
	return el;
}
function assetListDir(name){
	var el = element("false", "div", "assetListEl");
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