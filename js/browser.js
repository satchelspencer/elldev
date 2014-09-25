var pageDir = [];
function browserInit(){
	listPageDir([]);
	$("#browserBack").event("click", gotoParent);
	$("#parentPageName").event("dclick", gotoParent);
	$("#parentPageName").event("sclick", function(){
		inspect($("#parentPage").data);
		$("#parentPage").css("background", "#373737");
		if($("#browserList").childs()) $("#browserList").childs().css("background", "none");
		
	});
	$("#parentPageName").event("clickstart", function(){
		$("#parentPage").css("background", "#404040");
	});
	$("#browserAdd").event("click", addPage);
}
function gotoParent(){
	var d = pageDir;
	d.pop();
	listPageDir(d);
}
function listPageDir(dir){
	var dirname = "/"+dir.join("/")+(dir.length > 0?"/":"");
	ajax("io.php", {"opendir" : dirname}, false, function(d){
		pageDir = dir;
		$("#browserBack").css("color", pageDir.length>0?"white":"#676767");
		dispDirData(JSON.parse(d), dirname);
	});
}
function dispDirData(data, dirname){
	hideInspector();
	$("#parentPage").css("background", "none");
	$("#parentPageName").innerHTML = data.parent.title;
	$("#parentPage").data = data.parent;
	$("#browserPathLabel").innerHTML = dirname;
	$("#browserList").clear();
	for(var i=0;i<data.children.length;i++){
		$("#browserList").appendChild(pageListItem(data.children[i]));
	}
}
function inspect(data){
	var sel = data?[{"data":data}]:getSelectedPages();
	if(sel.length == 0) hideInspector();
	else if(sel.length == 1){
		$("#browserInspectorNameValue").innerHTML = sel[0].data.title;
		$("#browserInspectorDescValue").innerHTML = sel[0].data.desc;
		showInspector();
	}else{
		$("#browserInspectorNameValue").innerHTML = "multi";
	}
}
var inspectorOpen = false;
function showInspector(){
	if(inspectorOpen) return false;
	inspectorOpen = true;
	var b = 63;
	var a = setInterval(function(){
		$("#browserInspector").css("bottom", "-"+b+"px");
		$("#browserList").css("bottom", (63-b)+"px");
		if(Math.abs(b) < 2 || b < 0){
			clearInterval(a);
			$("#browserInspector").css("bottom", "0");
			$("#browserList").css("bottom", "63px");
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
		$("#browserList").css("bottom", (63-b)+"px");
		if(Math.abs(b-63) < 2 || b > 63){
			clearInterval(a);
			$("#browserInspector").css("bottom", "-63px");
			$("#browserList").css("bottom", "0");
		}
		b += 10;
	}, 25);
}
function getSelectedPages(){
	var r = [];
	var pages = $("#browserList").childs();
	for(var c=0;c<pages.length;c++) if(pages[c].selected) r.push(pages[c]);
	return r;
}
function deselectAllPages(){
	var pages = $("#browserList").childs();
	if(!pages) return false;
	for(var c=0;c<pages.length;c++){
		pages[c].css("background", "none");
		pages[c].selected = false;
	}
	$("#parentPage").css("background", "none");
	inspect();
}
var addingPage = false;
function addPage(){
	if(addingPage) return false;
	addingPage = true;
	deselectAllPages();
	var newPageEl = element(false, "div", "browserListEl");
	var input = element(false, "span", "newPageInput");
	newPageEl.appendChild(input);
	var cancel = element(false, "div", "icon browserListEnd");
	cancel.innerHTML = "&times;";
	cancel.event("click", function(){
		newPageEl.remove();
		addingPage = false;
	});
	newPageEl.appendChild(cancel);
	newPageEl.submitting = false;
	newPageEl.valid = false;
	newPageEl.event("click", function(){
		input.focus();
	});
	newPageEl.event("keyup", function(e){
		newPageEl.valid = input.innerHTML.match(/^[a-z0-9\-\_]{2,32}$/i);
		newPageEl.css("color", newPageEl.valid?"white":"red");
	});
	newPageEl.event("keydown", function(e){
		if(e.code === 13){
			if(newPageEl.valid){
				newPageEl.submitting = true;
				newPageEl.attr("contenteditable", "false");
				var dirname = "/"+pageDir.join("/")+(pageDir.length > 0?"/":"");
				ajax("io.php", {"newpage" : dirname+input.innerHTML}, false, function(d){
					dispDirData(JSON.parse(d), dirname);
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
function pageListItem(data){
	var el = element(false, "div", "browserListEl");
	el.innerHTML = data.title;
	el.selected = false;
	el.dragging = false;
	el.data = data;
	el.event("sclick", function(e){
		if(el.dragging){
			el.dragging = false;
			el.css("background", "none");
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
		listPageDir(pageDir.concat(data.title));
	});
	el.event("clickstart", function(e){
		el.css("background", "#404040");
		var starty = e.y;
		$("body").event("mousemove", function(e){
			if(Math.abs(starty-e.y) > 5 && !el.dragging){
				el.dragging = true;
				el.selected = true;
				hideInspector();
				log("drag");
				var pages = getSelectedPages();
				var h = 25;
				var ani = setInterval(function(){
					h = h-3;
					for(var p in pages) pages[p].css("height", h+"px");
					if(h <= 0){
						clearInterval(ani);
						for(var p in pages) pages[p].css("display", "none");
					}
				}, 30);
			}
			if(el.dragging){
			
			}
		});
		$("body").event("mouseup", function(e){
			if(el.dragging) log("drop");
			$("body").rmEvent("mousemove");
			$("body").rmEvent("mouseup");
		});
	});
	return el;
}