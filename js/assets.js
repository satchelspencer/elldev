var assetDir = [];
var sendingAssetData = false;
var assetDragging = false;
var addingAssetFolder = false;
var assetLoadAng = 0;
var assetLoadAni;
var uploadingFiles = [];
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
	$("#assetBack").event("sclick", gotoAssetParent);
	$("#parentFolderName").event("sclick", gotoAssetParent);
	$("#parentFolderName").event("clickstart", function(){
		$("#parentFolder").css("background", "#909090");
	});
	$("#parentFolder").event("mouseover", function(e){
		if(assetDragging) $("#parentFolder").css("background", "#808080");
	});
	$("#parentFolder").event("mouseout", function(e){
		if(assetDragging) $("#parentFolder").css("background", "none");
	});
	$("#folderAdd").event("click", addFolder);
	$("#assetDelete").event("click", assetDelete);
	$("body").event("dragenter", stopEvent);
	$("body").event("dragexit", stopEvent);
	$("body").event("dragover", stopEvent);
	$("body").event("drop", stopEvent);
	$("#assetList").event("drop", listFileDrop);
}
function listFileDrop(e){
	e.stop();
	var fs = e.e.dataTransfer.files;
	for(i=0;i<fs.length;i++){
		ajax("io.php", {"uploadquery" : getCurrentDir(assetDir)+fs[i].name, "size" : fs[i].size}, false, function(d){
			var data = d==""?false:JSON.parse(d);
			if(data.error) warn(data.error);
			else{
				var u = uploadHandler(uploadingFiles.length);
				u.send(fs[i]);
				var el = assetListUpload(fs[i].name);
				u.dispEl = el;
				$("#assetList").insertBefore(el, $("#assetList").firstChild);
				uploadingFiles.push(u);
			}
		});
	}
}
function uploadHandler(index){
		var r = {};
		r.prog = 0;
		r.name = "";
		r.dir = [];
		r.index = index;
		r.send = function(file){
			var fd = new FormData();
			fd.append("file", file);
			r.name = file.name;
			r.dir = getCurrentDir(assetDir);
			fd.append("path", r.dir);
			var xhr = new XMLHttpRequest();
			xhr.onload = function(e){
				log(this.responseText);
				uploadingFiles.splice(r.index, 1);
				if(r.dispEl){
					r.dispEl.removeChild(r.dispEl.firstChild);
					r.dispEl.rmClass("uploadEl");
				}
			};
			xhr.upload.onprogress = function(e){
				r.prog = e.loaded/e.total;
				if(r.dispEl) r.dispEl.dispProg(r.prog);
			}
			xhr.open("POST", "io.php");
			xhr.send(fd);
		};
		r.dispEl = false;
		return r;	
}
function assetListUpload(name){
	var el = assetListFile(name);
	el.class("uploadEl");
	var prog = element("false", "div", "uploadProg");
	el.insertBefore(prog, el.firstChild);
	el.dispProg = function(frac){
		prog.css("width", (frac*100)+"%");
	}
	return el;
}
function dispAssetDirData(data, dirname, callback){
	$("#assetPathLabel").innerHTML = "/<span style='color:#ffffff;margin-right:1px;'>as</span>"+dirname;
	$("#assetList").clear();
	for(var i in data){
		var el = data[i].type == "file"?assetListFile(data[i].name):assetListDir(data[i].name);
		$("#assetList").appendChild(el);
	}
	for(var j in uploadingFiles){
		if(uploadingFiles[j].dir == dirname){
			if(!uploadingFiles[j].dispEl){
				var d = assetListUpload(uploadingFiles[j].name);
				d.dispProg(uploadingFiles[j].prog);
				$("#assetList").insertBefore(d, $("#assetList").firstChild);
				uploadingFiles[j].dispEl = d;
			}
		}else uploadingFiles[j].dispEl = false;
	}
	if(callback) callback();
}
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
function gotoAssetParent(){
	if(sendingAssetData || !assetDir.length) return false;
	var d = assetDir;
	var prev = d.pop();
	deselectAllAssets();
	listAssetDir(d);
}
function listAssetDir(dir, callback){
	var dirname = getCurrentDir(dir);
	sendAssetData({"openassetdir" : dirname}, function(d){
		assetDir = dir;
		$("#assetBack").css("color", assetDir.length>0?"white":"#676767");
		dispAssetDirData(JSON.parse(d), dirname);
		$("#parentFolderName").innerHTML = dir.length?dir[dir.length-1]:"assets";
		$("#parentFolderName").dire = dir.length?"true":"false";
		$("#parentFolder").css("background", "none");
		if(callback) callback();
	});
}
function assetDelete(e){
	var s = getSelectedAssets();
	var toDelete = [];
	for(var i in s) toDelete.push(getCurrentDir(assetDir)+s[i].name);
	var w = e.el.next();
	var el = e.el;
	ani(41, 0, 7, function(r){
		w.css("marginRight", "-"+r+"px");
		el.css("marginRight", "-"+((41-r)*(18/41))+"px");
		el.css("transform", "rotate(-"+(2*(41-r))+"deg)");
	}, function(){
		$("body").event("click", function(e){
			$("body").rmEvent("click");
			if(e.el.className == "assetDeleteWarn"){
				for(var i in s) s[i].clEvents();
				ani(1, 0.5, 5, function(o){
					for(var i in s) s[i].css("opacity", o);
				});
				sendAssetData({"deleteasset" : JSON.stringify(toDelete)}, function(d){
					ani(25, 0, 4, function(h){
						for(var i in s) s[i].css("height", h+"px");
					}, function(){
						for(var i in s) s[i].remove();
						deselectAllAssets();
					});
				});
			}
			ani(0, 41, 7, function(r){
				w.css("marginRight", "-"+r+"px");
				el.css("marginRight", "-"+((41-r)*(18/41))+"px");
				el.css("transform", "rotate(-"+(2*(41-r))+"deg)");
			});
		});
	});
}
function addFolder(){
	if(addingAssetFolder || sendingAssetData) return false;
	addingAssetFolder = true;
	deselectAllAssets();
	var newFolderEl = element(false, "div", "assetListEl");
	var input = element(false, "span", "newPageInput");
	newFolderEl.appendChild(input);
	var cancel = element(false, "div", "icon browserListEnd");
	cancel.innerHTML = "&times;";
	newFolderEl.cancel = function(){
		ani(25, 0, 4, function(h){
			newFolderEl.css("height", h+"px");
		}, function(){
			newFolderEl.remove();
		});
		addingAssetFolder = false;
	};
	input.event("blur", newFolderEl.cancel);
	cancel.event("click", newFolderEl.cancel);
	newFolderEl.appendChild(cancel);
	newFolderEl.submitting = false;
	newFolderEl.valid = false;
	newFolderEl.event("click", function(){
		input.focus();
	});
	var assets = $("#assetList").childs();
	newFolderEl.event("keyup", function(e){
		newFolderEl.valid = input.innerHTML.match(/^[a-z0-9\-\_\.]{2,32}$/i);
		if(input.innerHTML == "as") valid = false;
		if(assets) for(var i=0;i<assets.length;i++) if(assets[i].childs()[1].innerHTML == input.innerHTML) newFolderEl.valid = false;
		newFolderEl.css("color", newFolderEl.valid?"white":"red");
	});
	newFolderEl.event("keydown", function(e){
		if(e.code === 13){
			if(newFolderEl.valid){
				newFolderEl.submitting = true;
				newFolderEl.attr("contenteditable", "false");
				sendAssetData({"newfolder" : getCurrentDir(assetDir)+input.innerHTML}, function(d){
					log(d);
					dispAssetDirData(JSON.parse(d), getCurrentDir(assetDir), function(){
						assets = $("#assetList").childs();
						for(var i=0;i<assets.length;i++) if(assets[i].childs()[1].innerHTML == input.innerHTML) assets[i].select();
						inspectAssets();
					});
					addingAssetFolder = false;
				});
			}
			e.e.preventDefault();
			return false;
		}
	});
	input.attr("contenteditable", "true");
	if($("#assetList").childs()) $("#assetList").insertBefore(newFolderEl, $("#assetList").firstChild);
	else $("#assetList").appendChild(newFolderEl);
	newFolderEl.css("background", "#575757");
	input.focus();
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
		$("#assetInspectorLabel").innerHTML = sel.length+" item"+(sel.length>1?"s":"");
	}
}
function deselectAllAssets(){
	var assets = $("#assetList").childs();
	if(assets){
		for(var c=0;c<assets.length;c++){
			if(!assets[c].hasClass("uploadEl")){
				assets[c].css("background", "none");
				assets[c].selected = false;
			}
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
	ani(0, 25, 4, function(b){
		$("#assetInspector").css("bottom", "-"+b+"px");
		$("#assetList").css("bottom", (25-b)+"px");
	});
}
function assetListFile(name){
	var el = element("false", "div", "assetListEl");
	el.selected = false;
	el.dragging = false;
	el.name = name;
	var ext = name.match(/\..+$/i);
	extIcon = false;
	if(ext) for(var e in extTable){
		if(name.match(extTable[e])){
			extIcon = e;
			break;
		}
	}
	if(!extIcon) extIcon = "doc";
	var t = element(false, "span", "assetListType icon icon-"+extIcon);
	el.appendChild(t);
	var n = element(false, "span", "assetName");
	n.innerHTML = name;
	el.appendChild(n);
	el.event("sclick", function(e){
		assetClick(e, el);
	});
	el.event("clickstart", function(e){
		assetClickStart(e, el);
	});
	el.select = function(){
		this.selected = true;
		this.css("background", "#808080");
	}
	return el;
}
function assetListDir(name){
	var el = element(false, "div", "assetListEl");
	el.selected = false;
	el.dragging = false;
	el.name = name;
	el.dire = "true";
	var t = element(false, "span", "assetListType icon icon-folder-empty");
	t.css("color", "white");
	el.appendChild(t);
	var n = element(false, "span", "assetName");
	n.innerHTML = name;
	el.appendChild(n);
	el.event("sclick", function(e){
		assetClick(e, el);
	});
	el.event("clickstart", function(e){
		assetClickStart(e, el);
	});
	el.event("dclick", function(e){
		if(!sendingAssetData && !addingAssetFolder) listAssetDir(assetDir.concat(name));
	});
	el.event("mouseover", function(e){
		if(assetDragging) el.css("background", "#808080");
	});
	el.event("mouseout", function(e){
		if(assetDragging) el.css("background", "none");
	});
	el.select = function(){
		this.selected = true;
		this.css("background", "#808080");
	}
	return el;
}
var draggedAssets;
function assetClickStart(e, el){
	if(!el.selected) el.css("background", "#909090");
	var starty = e.y;
	var offset = el.y()-e.y;
	$("body").event("mousemove", function(e){
		if(Math.abs(starty-e.y) > 5 && !el.dragging){
			assetDragging = true;
			$("body").class("unselectable");
			$("body").css("cursor", "ns-resize");
			el.dragging = true;
			el.selected = true;
			draggedAssets = getSelectedAssets();
			deselectAllAssets();
			ani(25, 0, 4, function(h){
				for(var p in draggedAssets){
					draggedAssets[p].css("height", h+"px");
					draggedAssets[p].css("opacity", h/25);
				}
			}, function(){
				for(var p in draggedAssets){
					draggedAssets[p].css("display", "none");
					draggedAssets[p].css("background", "none");
				}
			});
			$("#browserListDrag").css("display", "block");
			$("#browserListDrag").innerHTML = draggedAssets.length>1?draggedAssets.length+" items":draggedAssets[0].name;
		}
		if(el.dragging){
			var top = e.y-$("#browser").y()+offset;
			$("#browserListDrag").css("top", top+"px");
		}
	});
	$("body").event("mouseup", function(e){
		if(el.dragging){
			$("body").rmClass("unselectable");
			$("body").css("cursor", "default");
			if(e.el.dire == "true" && !sendingAssetData && !addingAssetFolder){
				var toMove = [];
				for(var p in draggedAssets) toMove.push(getCurrentDir(assetDir)+draggedAssets[p].name);
				var moveTo = e.el.name?getCurrentDir()+e.el.name+"/":getCurrentDir(assetDir.slice(0, assetDir.length-1));
				var newDir =  e.el.name?assetDir.concat(e.el.name):assetDir.slice(0, assetDir.length-1);
				sendAssetData({"moveassets" : JSON.stringify({"from" : toMove, "to" : moveTo})}, function(d){
					var data = JSON.parse(d);
					if(data.error){
						cancelAssetDrop(draggedAssets);
						warn("<u>"+data.error+"</u> already exists");
					}else{
						assetDragging = false;
						listAssetDir(newDir, function(){
							var els = $("#assetList").childs();
							for(var i=0;i<els.length;i++){
								for(var p in draggedAssets){
									if(els[i].name == draggedAssets[p].name) els[i].select();
								}
							}
							inspectAssets();
						});
					}
				});
			}else cancelAssetDrop(draggedAssets);
			$("#parentFolder").css("background", "none");
			$("#browserListDrag").css("display", "none");
		}
		$("body").rmEvent("mousemove");
		$("body").rmEvent("mouseup");
	});
}
function assetClick(e, el){
	if(el.dragging){
		el.dragging = false;
	}else{
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
			el.selected = !el.selected;
			el.css("background", el.selected?"#808080":"none");
		}else{
			if(assets) for(var c=0;c<assets.length;c++){
				if(!assets[c].hasClass("uploadEl")){
					assets[c].css("background", "none");
					assets[c].selected = false;
				}
			}
			el.selected = true;
			el.css("background", "#808080");
		}
	inspectAssets();	
	}	
}
function cancelAssetDrop(assets){	
	var h = 0;
	for(var p in assets) assets[p].css("display", "block");
	ani(0, 25, 4, function(h){
		for(var p in assets){
			assets[p].css("height", h+"px");
			assets[p].css("opacity", h/25);
		}
	});
	setTimeout(function(){assetDragging = false;}, 300);
	for(var i=0;i<assets.length;i++){
		assets[i].select();
	}
	inspectAssets();
}