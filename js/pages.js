var pageDir = [];
var sendingPageData = false;
function browserInit(){
	listPageDir([]);
	$("#browserBack").event("click", gotoParent);
	$("#parentPageName").event("click", gotoParent);
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
	
}
function sendPageData(data, callback){
	sendingPageData = true;
	sendData(data, function(d){
		sendingPageData = false;
		callback(d);
	});
}
function filesDelete(){
	var s = getSelectedPages();
	var toDelete = [];
	for(var i in s) toDelete.push(s[i].data.path);
	warn("delete "+toDelete.length+" page"+(toDelete.length>1?"s":"")+"?", function(){
		sendPageData({"delete" : JSON.stringify(toDelete)}, function(d){
			var h = 25;
			var a = setInterval(function(){
				h-=8;
				for(var i in s) s[i].css("height", h+"px");
				if(h<=0){
					clearInterval(a);
					for(var i in s) s[i].remove();
					deselectAllPages();
				}
			}, 30);
		});
	});
}
function gotoParent(){
	if(sendingPageData) return false;
	var d = pageDir;
	var prev = d.pop();
	listPageDir(d, function(){
		var els = $("#browserList").childs();
		for(var i=0;i<els.length;i++) if(els[i].data.title == prev) els[i].select();
		inspect();
	});
}
function getCurrentDir(dirArr){
	dirArr = dirArr || pageDir;
	return "/"+dirArr.join("/")+(dirArr.length > 0?"/":"");
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
function dispDirData(data, dirname){
	hideInspector();
	$("#parentPage").css("background", "none");
	$("#parentPageName").innerHTML = data.parent.title;
	$("#parentPageName").data = data.parent;
	$("#browserPathLabel").innerHTML = dirname;
	$("#browserList").clear();
	for(var i=0;i<data.children.length;i++){
		$("#browserList").appendChild(pageListItem(data.children[i]));
	}
}
function inspect(data){
	var sel = data?[{"data":data}]:getSelectedPages();
	var pages = $("#browserList").childs();
	if(pages) for(var c=0;c<pages.length;c++) pages[c].lastChild.css("display", "none");
	if(sel.length == 1){
		sel[0].lastChild.css("display", "block");
		var published = sel[0].data.published == "true";
		var k = sel[0].lastChild.children;
		for(var i in k) if(k[i].className == "published icon-ok") k[i].style.display = published?"block":"none";
	}
	if(sel.length <= 1) hideInspector();
	else{
		var published = true;
		for(var i in sel) if(sel[i].data.published != "true") published = false;
		$("#multiPublished").css("display", published?"block":"none");
		$("#browserInspectorLen").innerHTML = sel.length;
		showInspector();
	}
}
var inspectorOpen = false;
function showInspector(){
	if(inspectorOpen) return false;
	inspectorOpen = true;
	var b = 25;
	var a = setInterval(function(){
		$("#browserInspector").css("bottom", "-"+b+"px");
		$("#browserList").css("bottom", (25-b)+"px");
		if(Math.abs(b) < 2 || b < 0){
			clearInterval(a);
			$("#browserInspector").css("bottom", "0");
			$("#browserList").css("bottom", "25px");
		}
		b -= 10;
	}, 25);
}
function hideInspector(){
	if(!inspectorOpen) return false;
	inspectorOpen = false;
	var b = 0;
	var a = setInterval(function(){
		$("#browserInspector").css("bottom", "-"+b+"px");
		$("#browserList").css("bottom", (25-b)+"px");
		if(Math.abs(b-25) < 2 || b > 25){
			clearInterval(a);
			$("#browserInspector").css("bottom", "-25px");
			$("#browserList").css("bottom", "0");
		}
		b += 10;
	}, 25);
}
function getSelectedPages(){
	var r = [];
	var pages = $("#browserList").childs();
	if(pages) for(var c=0;c<pages.length;c++) if(pages[c].selected) r.push(pages[c]);
	return r;
}
function deselectAllPages(){
	var pages = $("#browserList").childs();
	if(pages){
		for(var c=0;c<pages.length;c++){
			pages[c].css("background", "none");
			pages[c].selected = false;
		}
		$("#parentPage").css("background", "none");
	}
	inspect();
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
		var h = 25;
		var a = setInterval(function(){
			h -= 5;
			if(h <= 0){
				newPageEl.css("height", "0");
				clearInterval(a);
				newPageEl.remove();
			}
			newPageEl.css("height", h+"px");
		}, 30);
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
		newPageEl.valid = input.innerHTML.match(/^[a-z0-9\-\_\.]{2,32}$/i);
		if(pages) for(var i=0;i<pages.length;i++) if(pages[i].innerHTML == input.innerHTML) newPageEl.valid = false;
		newPageEl.css("color", newPageEl.valid?"white":"red");
	});
	newPageEl.event("keydown", function(e){
		if(e.code === 13){
			if(newPageEl.valid){
				newPageEl.submitting = true;
				newPageEl.attr("contenteditable", "false");
				sendPageData({"newpage" : getCurrentDir()+input.innerHTML}, function(d){
					dispDirData(JSON.parse(d), getCurrentDir());
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
	el.innerHTML = data.title;
	el.selected = false;
	el.dragging = false;
	el.data = data;
	el.event("sclick", function(e){
		if(el.dragging){
			el.dragging = false;
		}else{
			var pages = $("#browserList").childs();
			if(e.shiftKey && !el.selected){
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
			}else if(e.metaKey){
				el.selected = !el.selected;
				el.css("background", el.selected?"#373737":"none");
			}else{
				for(var c=0;c<pages.length;c++){
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
				$("body").class("unselectable");
				$("body").css("cursor", "ns-resize");
				el.dragging = true;
				el.selected = true;
				pages = getSelectedPages();
				deselectAllPages();
				var h = 25;
				var ani = setInterval(function(){
					h -= 5;
					for(var p in pages) pages[p].css("height", h+"px");
					if(h <= 0){
						clearInterval(ani);
						for(var p in pages){
							pages[p].css("display", "none");
							pages[p].css("background", "none");
						}
					}
				}, 30);
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
				}else cancelDrop(pages)
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
	var opt = $("#browserListOptions").clone();
	el.appendChild(opt);
	return el;
}
function cancelDrop(pages){
	var h = 0;
	for(var p in pages) pages[p].css("display", "block");
	var ani = setInterval(function(){
		h += 5;
		for(var p in pages) pages[p].css("height", h+"px");
		if(h >= 25){
			clearInterval(ani);
			for(var p in pages) pages[p].css("height", "25px");
		}
	}, 30);
	setTimeout(function(){browserDragging = false;}, 300);
	for(var i=0;i<pages.length;i++){
		pages[i].select();
	}
	inspect();
}