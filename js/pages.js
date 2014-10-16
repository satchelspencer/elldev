var pageDir = [];
var sendingPageData = false;
function pagesInit(){
	listPageDir([]);
	$("#browserBack").event("click", gotoParent);
	$("#parentPageName").event("click", function(e){
		if(e.el.data.path == "/") inspectRoot(e.el.data);
		else gotoParent(e);
	});
	$("#parentPageName").event("clickstart", function(){
		$("#parentPage").css("background", "#404040");
	});
	$("#parentPageName").event("mouseover", function(e){
		if(browserDragging) $("#parentPage").css("background", "#373737");
	});
	$("#parentPageName").event("mouseout", function(e){
		if(browserDragging) $("#parentPage").css("background", "none");
	});
	$("#browserAdd").event("click", addPage);
	$("#browserList").event("click", function(e){
		if(e.el.id == "browserList" && !browserDragging) deselectAllPages();
	});
	$("#multiFileDelete").event("click", filesDelete);
	$("#pages").kevent(pageKeyUp);
	$("#inspectorEdit").event("click", editPage);
}
function pageKeyUp(e){
	if(e.code == 13 && !addingPage){
		if(!renamingPage && getSelectedPages().length == 1) renamePage();
	} 
}
var renamingPage = false;
function renamePage(){
	renamingPage = true;
	var s = getSelectedPages()[0];
	s.first().attr("contenteditable", "true");
	s.first().focus();
	s.first().event("blur", cancelRenamePage);
	s.first().event("keyup", function(e){
		s.valid = isValidPageName(s.first().innerHTML);
		s.first().css("color", s.valid?"white":"red");
	});
	s.first().event("keydown", function(e){
		if(e.code == 13){
			if(s.valid) sendPageData({"renamepage" : getCurrentDir()+s.data.title, "to" : getCurrentDir()+s.first().innerHTML}, function(d){
				s.first().attr("contenteditable", "false");
				s.first().rmEvent("blur");
				s.first().blur();
				dispDirData(JSON.parse(d), getCurrentDir(), function(){
					var pages = $("#browserList").childs();
					for(var i=0;i<pages.length;i++) if(pages[i].firstChild.innerHTML == s.first().innerHTML) pages[i].select();
					inspect();
					renamingPage = false;
				});
			});
			e.e.preventDefault();
			return false;
		}
	});
	document.execCommand('selectAll',false,null);
}
function cancelRenamePage(){
	renamingPage = false;
	var s = getSelectedPages()[0];
	s.first().attr("contenteditable", "false");
	s.first().innerHTML = s.data.title;
	s.first().rmEvent("blur");
	s.first().css("color", "white");
}
var loadAng = 0;
var loadAni;
function setLoadBright(c){
	c = Math.round(c);
	$("#browserLoad").css("color", "rgb("+c+","+c+","+c+")");
}
function sendPageData(data, callback){
	sendingPageData = true;
	var adone = false;
	ani(64, 150, 10, setLoadBright, function(){
		adone = true;
		if(!sendingPageData) ani(150, 64, 10, setLoadBright);
	});
	loadAni = setInterval(function(){
		$("#browserLoad").css("transform", "rotate("+loadAng+"deg)");
		loadAng = (loadAng+5)%360;
	},30);
	sendData(data, function(d){
		if(adone) ani(150, 64, 10, setLoadBright);
		clearInterval(loadAni);
		sendingPageData = false;
		callback(d);
	});
}
function filesDelete(e){
	var s = getSelectedPages();
	var toDelete = [];
	for(var i in s) toDelete.push(s[i].data.path);
	var w = e.el.next();
	var el = e.el;
	ani(41, 0, 7, function(r){
		w.css("marginRight", "-"+r+"px");
		el.css("marginRight", "-"+((41-r)*(18/41))+"px");
		el.css("transform", "rotate(-"+(2*(41-r))+"deg)");
	}, function(){
		$("body").event("click", function(e){
			$("body").rmEvent("click");
			if(e.el.className == "fileDeleteWarn"){
				for(var i in s) s[i].clEvents();
				ani(1, 0.5, 5, function(o){
					for(var i in s) s[i].css("opacity", o);
				});
				sendPageData({"delete" : JSON.stringify(toDelete)}, function(d){
					ani(25, 0, 4, function(h){
						for(var i in s) s[i].css("height", h+"px");
					}, function(){
						for(var i in s) s[i].remove();
						deselectAllPages();
					});
				});
			}
			if(e.el.className != "fileDeleteWarn" || e.el.id == "multiFileDeleteWarn"){
				ani(0, 41, 7, function(r){
					w.css("marginRight", "-"+r+"px");
					el.css("marginRight", "-"+((41-r)*(18/41))+"px");
					el.css("transform", "rotate(-"+(2*(41-r))+"deg)");
				});
			}
		});
	});
}
function gotoParent(){
	if(sendingPageData) return false;
	var d = pageDir;
	var prev = d.pop();
	listPageDir(d, function(){
		var els = $("#browserList").childs();
		if(els) for(var i=0;i<els.length;i++) if(els[i].data.title == prev) els[i].select();
		inspect();
	});
}
function listPageDir(dir, callback){
	var dirname = getCurrentDir(dir);
	sendPageData({"opendir" : dirname}, function(d){
		pageDir = dir;
		$("#browserBack").css("color", pageDir.length>0?"white":"#676767");
		dispDirData(JSON.parse(d), dirname);
		if(callback) callback();
	});
}
function dispDirData(data, dirname, callback){
	hideInspector();
	$("#parentPage").css("background", "none");
	$("#parentPageName").innerHTML = data.parent.title;
	$("#parentPageName").data = data.parent;
	$("#browserPathLabel").innerHTML = dirname;
	$("#browserList").clear();
	for(var i=0;i<data.children.length;i++){
		$("#browserList").appendChild(pageListItem(data.children[i]));
	}
	if(callback) callback();
}
function inspectRoot(data){
	deselectAllPages();
	$("#parentPage").selected = true;
	$("#parentPage").css("background", "#373737");
	$("#inspectMessage").innerHTML = data.title;
	$("#browserInspectorLen").css("display", "none");
	$("#multiFileDelete").css("display", "none");
	$("#multiFileDeleteWarn").css("display", "none");
	$("#inspectorEdit").css("display", "inline");
	var published = data.published == "true";
	$("#multiPublished").css("display", published?"inline-block":"none");
	showInspector();
}
function inspect(data){
	$("#parentPage").selected = false;
	var sel = data?[{"data":data}]:getSelectedPages();
	var pages = $("#browserList").childs();
	if(pages) for(var c=0;c<pages.length;c++) pages[c].lastChild.css("display", "none");
	if(sel.length == 1){
		sel[0].lastChild.css("display", "block");
		var published = sel[0].data.published == "true";
		var k = sel[0].lastChild.children;
		for(var i in k) if(k[i].className == "published icon-ok") k[i].style.display = published?"inline-block":"none";
	}
	if(sel.length <= 1) hideInspector();
	else{
		$("#inspectMessage").innerHTML = " pages selected";
		var published = true;
		for(var i in sel) if(sel[i].data.published != "true") published = false;
		$("#multiPublished").css("display", published?"inline-block":"none");
		$("#browserInspectorLen").css("display", "inline");
		$("#multiFileDelete").css("display", "inline");
		$("#multiFileDeleteWarn").css("display", "inline");
		$("#inspectorEdit").css("display", "none");
		$("#browserInspectorLen").innerHTML = sel.length;
		$("#multiFilePublish").event("click", function(){log("pub")});
		showInspector();
	}
}
var inspectorOpen = false;
function showInspector(){
	if(inspectorOpen) return false;
	inspectorOpen = true;
	ani(25, 0, 4, function(b){
		$("#browserInspector").css("bottom", "-"+b+"px");
		$("#browserList").css("bottom", (25-b)+"px");
	});
}
function hideInspector(){
	if(!inspectorOpen) return false;
	inspectorOpen = false;
	var b = 0;
	ani(0, 25, 4, function(b){
		$("#browserInspector").css("bottom", "-"+b+"px");
		$("#browserList").css("bottom", (25-b)+"px");
	});
}
function getSelectedPages(){
	var r = [];
	if($("#parentPage").selected) return [$("#parentPageName")];
	var pages = $("#browserList").childs();
	if(pages) for(var c=0;c<pages.length;c++) if(pages[c].selected) r.push(pages[c]);
	return r;
}
function deselectAllPages(){
	var pages = $("#browserList").childs();
	if(pages || $("#parentPage").selected){
		if(pages) for(var c=0;c<pages.length;c++){
			pages[c].css("background", "none");
			pages[c].selected = false;
		}
		$("#parentPage").css("background", "none");
		$("#parentPage").selected = false;
	}
	inspect();
}
function isValidPageName(name){
	var pages = $("#browserList").childs();
	var valid = name.match(/^[a-z0-9\-\_\.]{2,32}$/i);
	if(name == "as") valid = false;
	var c = 0;
	if(pages) for(var i=0;i<pages.length;i++) if(pages[i].firstChild.innerHTML == name) c++;
	if(c > 1) valid = false;
	return valid;
}
var addingPage = false;
function addPage(){
	if(addingPage || sendingPageData) return false;
	addingPage = true;
	deselectAllPages();
	var newPageEl = element(false, "div", "browserListEl");
	var input = element(false, "span", "newPageInput");
	newPageEl.appendChild(input);
	var cancel = element(false, "div", "icon browserListEnd");
	cancel.innerHTML = "&times;";
	newPageEl.cancel = function(){
		ani(25, 0, 4, function(h){
			newPageEl.css("height", h+"px");
		}, function(){
			newPageEl.remove();
		});
		addingPage = false;
	};
	input.event("blur", newPageEl.cancel);
	cancel.event("click", newPageEl.cancel);
	newPageEl.appendChild(cancel);
	newPageEl.submitting = false;
	newPageEl.valid = false;
	newPageEl.event("click", function(){
		input.focus();
	});
	var pages = $("#browserList").childs();
	newPageEl.event("keyup", function(e){
		newPageEl.valid = isValidPageName(input.innerHTML, pages);
		newPageEl.css("color", newPageEl.valid?"white":"red");
	});
	newPageEl.event("keydown", function(e){
		if(e.code === 13){
			if(newPageEl.valid){
				newPageEl.submitting = true;
				newPageEl.attr("contenteditable", "false");
				sendPageData({"newpage" : getCurrentDir()+input.innerHTML}, function(d){
					dispDirData(JSON.parse(d), getCurrentDir(), function(){
						pages = $("#browserList").childs();
						for(var i=0;i<pages.length;i++) if(pages[i].firstChild.innerHTML == input.innerHTML) pages[i].select();
						inspect();
					});
					addingPage = false;
				});
			}
			e.e.preventDefault();
			return false;
		}
	});
	input.attr("contenteditable", "true");
	if($("#browserList").childs()) $("#browserList").insertBefore(newPageEl, $("#browserList").firstChild);
	else $("#browserList").appendChild(newPageEl);
	newPageEl.css("background", "#373737");
	input.focus();
}
var browserDragging = false;
function pageListItem(data){
	var el = element(false, "div", "browserListEl");
	el.selected = false;
	el.dragging = false;
	el.data = data;
	el.event("sclick", function(e){
		if(el.dragging){
			el.dragging = false;
		}else{
			var pages = $("#browserList").childs();
			if(e.e.shiftKey && !el.selected){
				el.selected = true;
				el.css("background", "#373737");
				var clickIndex = pages.indexOf(el);
				var selectBeforeIndex = clickIndex;
				for(var i=clickIndex-1;i>=0;i--){
					if(pages[i].selected){
						selectBeforeIndex = i;
						break;
					}
				}
				var selectAfterIndex = clickIndex;
				for(var i=clickIndex+1;i<pages.length;i++){
					if(pages[i].selected){
						selectAfterIndex = i;
						break;
					}
				}
				for(var j=selectBeforeIndex+1;j<selectAfterIndex;j++){
					pages[j].selected = true;
					pages[j].css("background", "#373737");
				}
			}else if(e.e.metaKey){
				el.selected = !el.selected;
				el.css("background", el.selected?"#373737":"none");
			}else{
				if(pages) for(var c=0;c<pages.length;c++){
					pages[c].css("background", "none");
					pages[c].selected = false;
				}
				el.selected = true;
				el.css("background", "#373737");
			}
			inspect();
			$("#parentPage").css("background", "none");
		}
	});
	el.event("dclick", function(){
		if(!sendingPageData && !addingPage) listPageDir(pageDir.concat(data.title));
	});
	var pages;
	el.event("clickstart", function(e){
		if(!el.selected) el.css("background", "#404040");
		var starty = e.y;
		var offset = el.y()-e.y;
		$("body").event("mousemove", function(e){
			if(Math.abs(starty-e.y) > 5 && !el.dragging){
				browserDragging = true;
				if(renamingPage) cancelRenamePage();
				$("body").class("unselectable");
				$("body").css("cursor", "ns-resize");
				el.dragging = true;
				el.selected = true;
				pages = getSelectedPages();
				deselectAllPages();
				ani(25, 0, 4, function(h){
					for(var p in pages){
						pages[p].css("height", h+"px");
						pages[p].css("opacity", h/25);
					}
				}, function(){
					for(var p in pages){
						pages[p].css("display", "none");
						pages[p].css("background", "none");
					}
				});
				$("#browserListDrag").css("display", "block");
				$("#browserListDrag").innerHTML = pages.length>1?pages.length+" pages":pages[0].data.title;
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
				if(e.el.data && e.el.data.path != "/" && !sendingPageData && !addingPage){
					var toMove = [];
					for(var p in pages) toMove.push(pages[p].data.path);
					var moveTo = e.el.className?getCurrentDir()+e.el.data.title+"/":getCurrentDir(pageDir.slice(0, pageDir.length-1));
					var newDir =  e.el.className?pageDir.concat(e.el.data.title):pageDir.slice(0, pageDir.length-1);
					sendPageData({"movepages" : JSON.stringify({"from" : toMove, "to" : moveTo})}, function(d){
						var data = JSON.parse(d);
						if(data.error){
							cancelDrop(pages);
							warn("<u>"+data.error+"</u> already exists");
						}else{
							browserDragging = false;
							listPageDir(newDir, function(){
								var els = $("#browserList").childs();
								for(var i=0;i<els.length;i++){
									for(var p in pages){
										if(els[i].data.title == pages[p].data.title) els[i].select();
									}
								}
								inspect();
							});
						}
					});
				}else cancelDrop(pages);
				$("#browserListDrag").css("display", "none");
			}
			$("body").rmEvent("mousemove");
			$("body").rmEvent("mouseup");
		});
	});
	el.event("mouseover", function(e){
		if(browserDragging) el.css("background", "#373737");
	});
	el.event("mouseout", function(e){
		if(browserDragging) el.css("background", "none");
	});
	el.select = function(){
		this.selected = true;
		this.css("background", "#373737");	
	};
	var n = element(false, "span", "pageName");
	n.innerHTML = data.title;
	el.appendChild(n);
	var opt = $("#browserListOptions").clone();
	opt.childs()[0].event("click", editPage);
	opt.childs()[1].event("click", function(){});
	opt.childs()[2].event("click", filesDelete);
	el.appendChild(opt);
	return el;
}
function cancelDrop(pages){
	var h = 0;
	for(var p in pages) pages[p].css("display", "block");
	ani(0, 25, 4, function(h){
		for(var p in pages){
			pages[p].css("height", h+"px");
			pages[p].css("opacity", h/25);
		}
	});
	setTimeout(function(){browserDragging = false;}, 300);
	for(var i=0;i<pages.length;i++){
		pages[i].select();
	}
	inspect();
}