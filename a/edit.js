var currentPageData = false;
var currentPagePath = "/";
function editPage(path){
	$("urlField").innerHTML = path;
	currentPagePath = path;
	sendData({"pageinfo" : path}, function(d){
		currentPageData = JSON.parse(d);
		rid = 0;
		$("root").clear();
		for(x in currentPageData.els) $("root").appendChild(el(currentPageData.els[x]));
		selectEl($("root").children[0].id, true);
	});
}
var selectedElId = false;
var siblingListId = 0;
function selectEl(id, noshow){
	if(!noshow) showEl($(id));
	selectedElId = id;
	var j = $(id).j;
	var pType = $(id).parentNode.j ? $(id).parentNode.j.type : "canvas";
	var p = $(id).j.position;
	var rainbow = {"canvas":{height:165,props:[]},"sequence":{height:245,props:["sequenceproperties"]},"content":{height:210,props:["textproperties"]}};
	var c = $("toggleableproperties").children;
	$("properties").style.height = rainbow[$(id).j.type].height+"px";
	$("elements").style.top = rainbow[$(id).j.type].height+"px";
	if(pType == "canvas"){
		$("positioncanvas").show();
		$("positionsequence").hide();
		var i = {"nw":["top", "left"],"n":["top", "centerx"],"ne":["top", "right"],"w":["left","centery"],"c":["centerx", "centery"],"e":["right", "centery"],"sw":["bottom","left"],"s":["bottom","centerx"],"se":["bottom","right"]};
		for(x in i) $("position"+x).style.background = p[i[x][0]] && p[i[x][1]] ? "#575757" : "#474747";
		var o = {top : "nw", left : "sw", bottom : "se", right : "ne"};
		for(x in o){
			$("position"+x).style.display = (p[x]) ? "block" : "none";
			$("origin"+o[x]).style.background = (p[x]) ? isAbsolute(p[x]) ? "white" : "red" : "#373737";
			$(x+"label").innerHTML = p[x]+(isAbsolute(p[x]) ? "px" : "");
		}
	}else if(pType == "sequence"){
		$("positionsequence").show();
		$("positioncanvas").hide();
		$("beforelabel").innerHTML = ($(id).parentNode.j.props.margin || "0")+"px";
		for(var k=1,e=$(id);e=e.previousSibling;k++);
		$("positionorderbase").innerHTML = k;
		$("positionsuffix").innerHTML = k>10&&k<20?"th":k%10==1?"st":k%10==2?"nd":k%10==3?"rd":"th";
		$("afterlabel").innerHTML = ($(id).parentNode.j.props.margin || "0")+"px";
	}
	$("widthlabel").innerHTML = p.width ? p.width+(isAbsolute(p.width) ? "px" : "") : "auto&#8201;&#8201;<span class='uneditable'>"+$(id).getStyle("width")+"</span>";
	$("heightlabel").innerHTML = p.height ? p.height+(isAbsolute(p.height) ? "px" : "") : "auto&#8201;&#8201;<span class='uneditable'>"+$(id).getStyle("height")+"</span>";
	for(x=0;x<c.length;x++){
		var s = false;
		for(i in rainbow[$(id).j.type].props) if(rainbow[$(id).j.type].props[i] == c[x].id) s = true;
		c[x].style.display = s ? "block" : "none";
	}
	var siblings = $(id).parentNode.getChildren();
	var parents =  $(id).parentNode.id == "root" ? false : $(id).parentNode.parentNode.getChildren();
	$("elementsparent").clear();
	$("elementschildren").clear();
	siblingListId = 0;
	for(i=0;i<siblings.length;i++) $("elementschildren").appendChild(siblingListEl(siblings[i], siblings[i].id == selectedElId));
	if(parents) for(j=0;j<parents.length;j++) $("elementsparent").appendChild(parentListEl(parents[j], parents[j].id == $(selectedElId).parentNode.id));
}
function siblingListEl(el, selected){
	var e = element("sl"+siblingListId, "div", {"class" : "element"});
	if(selected) e.style.background = "#474747";
	var o = element("slorder"+siblingListId, "div", {"class" : "elementorder"});
	o.innerHTML = siblingListId+1;
	var b = element(false, "div", {"class" : "elementvbar"});
	var n = element("slname"+siblingListId, "div", {"class" : "elementname"});
	n.event("click", function(e){selectEl(el.id)});
	n.event("mouseover", function(e){showEl(el)});
	n.innerHTML = el.j.name;
	e.appendChild(o);
	e.appendChild(b);
	e.appendChild(n);
	if(el.j.children) if(el.j.children.length > 0){
		var a = element("slar"+siblingListId, "div", {"class" : "elementchildren"});
		a.innerHTML = "&rsaquo;"
		a.event("click", function(e){selectEl(el.children[0].id);});
		e.appendChild(a);
	}
	siblingListId++;
	return e;
}
function parentListEl(el, isParent){
	var e = element("pl"+siblingListId, "div", {"class" : "element"});
	var n = element("plname"+siblingListId, "div", {"class" : "elementnamep"});
	n.event("click", function(e){selectEl(el.id)});
	n.event("mouseover", function(e){showEl(el)});
	n.innerHTML = el.j.name;
	e.appendChild(n);
	if(isParent){
		var a = element("plc"+siblingListId, "div", {"class" : "elementparent"});
		e.appendChild(a);
	}else if(el.j.children) if(el.j.children.length > 0){
		var a = element("plar"+siblingListId, "div", {"class" : "elementchildren"});
		a.innerHTML = "&rsaquo;"
		a.event("click", function(e){selectEl(el.children[0].id);});
		e.appendChild(a);
	}
	siblingListId++;
	return e;
}
function showEl(el){
	$("outline").style.display = "block";
	$("outline").style.width = el.getStyle("width");
	$("outline").style.height = el.getStyle("height");
	$("outline").style.top = el.getPosition().y+"px";
	$("outline").style.left = el.getPosition().x+"px";
	var o = 0;
	var i = setInterval(function(){
		$("outline").style.opacity = o;
		o+=.05;
		if(o>=.3){
			clearInterval(i);
			var x = setInterval(function(){
				$("outline").style.opacity = o;
				o-=.05;
				if(o<=0){
					clearInterval(x);
					$("outline").style.opacity = 0;
					$("outline").style.display = "none";
				}
			},25);
		}
	}, 25);
}
function save(){
	sendData({"putpageinfo" : JSON.stringify(currentPageData), "path" : currentPagePath}, function(d){});
}