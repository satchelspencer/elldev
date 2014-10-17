function render(data, to, addr){
	to.clear();
	var addr = addr||[];
	for(var i in data.childs){
		var child = data.childs[i];
		var childEl = newEl(child, data.type, addr.concat(i));
		for(var p in child) childEl.setCss(p, child[p]);
		if(child.childs) render(child, childEl, childEl.addr);
		to.appendChild(childEl);
	}
}
function newEl(data, parentType, addr){
	var el = element(false, "div", data.type);
	el.addr = addr;
	el.set = function(prop, val){
		jsonByAddr(this.addr)[prop] = val;
		this.setCss(prop, val);
	};
	el.setCss = function(prop, val){
		if(this[prop]) this[prop].call(this, val);
	};
	el.position = function(data){
		if(parentType == "canvas") for(var d in data) this.css(d, data[d]+"px");
		else if(parentType == "sequence"){
			
		}
	};
	el.background = function(data){
		if(data.color) this.css("backgroundColor", "rgba("+data.color+")");
		if(data.image){
			this.css("backgroundImage", "url('../as"+data.image+"')");
			if(data.repeat) this.css("backgroundRepeat", data.repeat);
			if(data.size) this.css("backgroundSize", data.size);
		}
	};
	el.font = function(data){
		if(data.family) this.css("fontFamily", data.family);
		if(data.size) this.css("fontSize", data.family);
		if(data.color) this.css("fontSize", "rgba("+data.color+")");
		if(data.align) this.css("textAlign", data.align);
		if(data.bold) this.css("fontWeight", data.bold=="1"?"bold":"normal");
		if(data.underline) this.css("textDecoration", data.underline=="1"?"underline":"none");
		if(data.italic) this.css("fontStyle", data.italic=="1"?"italic":"normal");
	};
	el.border = function(data){
		var borderStyle = "";
		if(data.width) this.css("borderWidth", data.width+"px");
		var dirs = ["Top", "Left", "Bottom", "Right"];
		if(data.color) this.css("borderColor", "rgba("+data.color+")");
		if(data.radius) this.css("borderRadius", data.radius+"px");
		if(data.style && data.edges){
			for(var e in data.edges) this.css("border"+dirs[e]+"Style", data.edges[e] == "1"?data.style:"none");
		}
	};
	el.event("click", log);
	return el;
}
function jsonByAddr(addr){
	var r = openData;
	for(var i in addr) r = r.children[addr[i]];
	return r; 
}