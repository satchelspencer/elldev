var assetDir = [];
var sendingAssetData = false;
var assetDragging = false;
var addingAssetFolder = false;
var assetLoadAng = 0;
var assetLoadAni;
var uploadingFiles = [];
var renamingAsset = false;
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
	$("#assetBack").event("dclick", gotoAssetParent);
	$("#parentFolderName").event("sclick", gotoAssetParent);
	$("#parentFolderName").event("dclick", gotoAssetParent);
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
	$("#assetDownload").event("click", function(){
		var s = getSelectedAssets()[0];
		window.location = "io.php?dl="+getCurrentDir(assetDir)+s.name;
	});
	$("#assetOpen").event("click", function(){
		var s = getSelectedAssets();
		window.open("../as"+getCurrentDir(assetDir)+(s.length>1?"":s[0].name));
	});
	$("#assets").kevent(assetsKeyUp);
}
function assetsKeyUp(e){
	if(e.code == 13 && !addingAssetFolder){
		if(!renamingAsset && getSelectedAssets().length == 1) renameAsset();
	} 
}
function renameAsset(){
	renamingAsset = true;
	var s = getSelectedAssets()[0];
	s.childs()[1].attr("contenteditable", "true");
	s.childs()[1].focus();
	s.childs()[1].event("blur", cancelRenameAsset);
	s.childs()[1].event("keyup", function(e){
		s.valid = isValidAssetName(s.childs()[1].innerHTML);
		s.childs()[1].css("color", s.valid?"#373737":"red");
	});
	s.childs()[1].event("keydown", function(e){
		if(e.code == 13){
			if(s.valid) sendAssetData({"renameasset" : getCurrentDir(assetDir)+s.name, "to" : getCurrentDir(assetDir)+s.childs()[1].innerHTML}, function(d){
				s.childs()[1].attr("contenteditable", "false");
				s.childs()[1].rmEvent("blur");
				s.childs()[1].blur();
				dispAssetDirData(JSON.parse(d), getCurrentDir(assetDir), function(){
					var assets = $("#assetList").childs();
					for(var i=0;i<assets.length;i++){
						if(assets[i].name == s.childs()[1].innerHTML) assets[i].select();
					}
					inspectAssets();
					renamingAsset = false;
				});
			});
			e.e.preventDefault();
			return false;
		}
	});
	document.execCommand('selectAll',false,null);
}
function cancelRenameAsset(){
	renamingAsset = false;
	var s = getSelectedAssets()[0];
	s.childs()[1].attr("contenteditable", "false");
	s.childs()[1].innerHTML = s.name;
	s.childs()[1].rmEvent("blur");
	s.childs()[1].css("color", "#373737");
}
function insertAssetAlpha(asset){
	var a = $("#assetList").childs();
	if(!a) $("#assetList").appendChild(asset);
	else{
		var names = [asset.name];
		for(var i=0;i<a.length;i++) names.push(a[i].name);
		names.sort();
		$("#assetList").insertBefore(asset, a[names.indexOf(asset.name)]);
	}
}
function listFileDrop(e){
	e.stop();
	var fs = e.e.dataTransfer.files;
	for(i=0;i<fs.length;i++){
		(function(file){
			ajax("io.php", {"uploadquery" : getCurrentDir(assetDir)+file.name, "size" : file.size}, false, function(d){
				var data = d==""?{}:JSON.parse(d);
				for(var p in uploadingFiles){
					if(uploadingFiles[p].dir+uploadingFiles[p].name == getCurrentDir(assetDir)+file.name){
						data.error = file.name+" is already uploading";
						break;
					}
				}
				if(data.error) warn(data.error);
				else{
					var u = uploadHandler(assetDir);
					u.send(file);
					var el = assetListUpload(file.name);
					u.dispEl = el;
					insertAssetAlpha(el);
					uploadingFiles.push(u);
				}
			});
		})(fs[i]);
	}
}
function uploadHandler(dir){
		var r = {};
		r.prog = 0;
		r.name = "";
		r.dir = "";
		r.dirar = dir;
		r.xhr;
		r.send = function(file){
			var fd = new FormData();
			fd.append("file", file);
			r.name = file.name;
			r.dir = getCurrentDir(assetDir);
			fd.append("path", r.dir);
			r.xhr = new XMLHttpRequest();
			r.xhr.onload = function(e){
				uploadingFiles.splice(uploadingFiles.indexOf(r), 1);
				if(r.dispEl){
					r.dispEl.rmClass("uploadEl");
					r.dispEl.removeChild(r.dispEl.lastChild);
					if(r.dispEl.ani) clearInterval(r.dispEl.ani);
					ani(r.dispEl.firstChild.cssn("width"), 337, 5, function(w){
						r.dispEl.firstChild.css("width", w+"px");
					}, function(){
						r.dispEl.removeChild(r.dispEl.firstChild);
						ani(0, -13, 10, function(t){
							r.dispEl.childs()[0].css("top", (3+t)+"px");
							r.dispEl.childs()[0].css("opacity", (13+t)/13);	
						}, function(){
							r.dispEl.removeChild(r.dispEl.firstChild);
						});
					});
				}else notify("<span style='color:#272727;'>"+r.name+"</span> finished uploading", "ok", 6, function(){
					listAssetDir(r.dirar, function(){
						assets = $("#assetList").childs();
						for(var i=0;i<assets.length;i++) if(assets[i].childs()[1].innerHTML == r.name) assets[i].select();
						inspectAssets();
					});
				});
			};
			r.xhr.upload.onprogress = function(e){
				r.prog = e.loaded/e.total;
				if(r.dispEl) r.dispEl.dispProg(r.prog);
				clearTimeout(r.timeout);
			};
			r.xhr.open("POST", "io.php");
			r.xhr.send(fd);
		};
		r.fail = function(){
			if(r.dispEl) r.dispEl.remove();
			uploadingFiles.splice(r.index, 1);
			warn(r.name+" failed to upload");
		};
		r.dispEl = false;
		return r;	
}
function assetListUpload(name){
	var el = assetListFile(name);
	el.class("uploadEl");
	var up = element(false, "div", "icon uploadIcon icon-up");
	el.insertBefore(up, el.firstChild);
	var prog = element(false, "div", "uploadProg");
	el.insertBefore(prog, el.firstChild);
	el.ani = false;
	el.dispProg = function(frac){
		if(!el.ani){
			el.ani = true;
			ani(prog.cssn("width"), frac*337, 20, function(w){
				prog.css("width", w+"px");
			}, function(){
				el.ani = false;
			});
		}
	};
	el.snapProg = function(frac){
		prog.css("width", (frac*337)+"px");
	};
	var cancel = element(false, "div", "icon browserListEnd");
	cancel.innerHTML = "&times;";
	cancel.css("pointerEvents", "all");
	cancel.event("click", function(e){
		for(var x in uploadingFiles){
			if(uploadingFiles[x].dispEl == el){
				uploadingFiles[x].xhr.abort();
				uploadingFiles.splice(x, 1);
				break;
			}
		}
		ani(25, 0, 5, function(h){
			el.css("height", h+"px");
		}, function(){
			el.remove();
		})
	});
	el.appendChild(cancel);
	return el;
}
function dispAssetDirData(data, dirname, callback){
	$("#assetPathLabel").innerHTML = "/<span style='color:#ffffff;margin-right:1px;'>as</span>"+dirname;
	$("#assetList").clear();
	for(var j in uploadingFiles) uploadingFiles[j].dispEl = false;
	for(var i in data){
		var el = data[i].type == "file"?assetListFile(data[i].name):assetListDir(data[i].name);
		$("#assetList").appendChild(el);
	}
	for(var j in uploadingFiles){
		if(uploadingFiles[j].dir == dirname){
			if(!uploadingFiles[j].dispEl){
				var d = assetListUpload(uploadingFiles[j].name);
				d.snapProg(uploadingFiles[j].prog);
				insertAssetAlpha(d);
				uploadingFiles[j].dispEl = d;
			}
		}else if(uploadingFiles[j].dispEl){
			uploadingFiles[j].dispEl.remove();
			uploadingFiles[j].dispEl = false;
		}
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
	if(sendingAssetData) return false;
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
function isValidAssetName(name){
	var assets = $("#assetList").childs();
	var valid = name.match(/^[a-z0-9\-\_\.]{2,32}$/i);
	if(name == "as") valid = false;
	var c = 0;
	if(assets) for(var i=0;i<pages.length;i++) if(pages[i].childs()[1].innerHTML == name) c++;
	if(c > 1) valid = false;
	return valid;
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
		newFolderEl.valid = isValidAssetName(input.innerHTML);
		newFolderEl.css("color", newFolderEl.valid?"white":"red");
	});
	newFolderEl.event("keydown", function(e){
		if(e.code === 13){
			if(newFolderEl.valid){
				newFolderEl.submitting = true;
				newFolderEl.attr("contenteditable", "false");
				sendAssetData({"newfolder" : getCurrentDir(assetDir)+input.innerHTML}, function(d){
					dispAssetDirData(JSON.parse(d), getCurrentDir(assetDir), function(){
						assets = $("#assetList").childs();
						for(var i=0;i<assets.length;i++) if(assets[i].childs()[1].innerHTML == input.innerHTML && !assets[i].hasClass("uploadEl")) assets[i].select();
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
		$("#assetDownload").css("display", (sel.length<2 && sel[0].dire!="true")?"inline":"none");
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
	var el = element(false, "div", "assetListEl");
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
		if(!el.hasClass("uploadEl")) assetClick(e, el);
	});
	el.event("clickstart", function(e){
		if(!el.hasClass("uploadEl")) assetClickStart(e, el);
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
			if(renamingAsset) cancelRenameAsset();
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
			log(e.el);
			if((e.el.dire == "true" || e.el.parentNode.dire == "true") && !sendingAssetData && !addingAssetFolder){
				e.el = e.el.dire == "true"?e.el:e.el.parentNode;
				var toMove = [];
				for(var p in draggedAssets) toMove.push(getCurrentDir(assetDir)+draggedAssets[p].name);
				var moveTo = e.el.name?getCurrentDir(assetDir)+e.el.name+"/":getCurrentDir(assetDir.slice(0, assetDir.length-1));
				var newDir =  e.el.name?assetDir.concat(e.el.name):assetDir.slice(0, assetDir.length-1);
				sendAssetData({"moveassets" : JSON.stringify({"from" : toMove, "to" : moveTo})}, function(d){
					log(d);
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