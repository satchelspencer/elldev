var currentPageData = false;
function editPage(path){
	$("urlField").innerHTML = path;
	sendData({"pageinfo" : path}, function(d){
		currentPageData = JSON.parse(d);
		rid = 0;
		$("root").clear();
		for(x in currentPageData.els) $("root").appendChild(el(currentPageData.els[x]));
		selectEl($("root").children[0].id);
	});
}
var selectedElId = false;
function selectEl(id){
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
	
}