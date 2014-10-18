var dirs = ["Top", "Left", "Bottom", "Right"];
function render(data, to, addr){
	to.clear();
	var addr = addr||[];
	for(var i in data.childs){
		var child = data.childs[i];
		var childEl = newEl(child, data.type, addr.concat(i));
		for(var p in child) childEl.disp(p, child[p]);
		if(child.childs) render(child, childEl, childEl.addr);
		to.appendChild(childEl);
	}
}
function newEl(data, parentType, addr){
	var el = element(false, "div", data.type);
	var type = data.type;
	el.addr = addr;
	el.set = function(prop, val){
		jsonByAddr(this.addr)[prop] = val;
		this.disp(prop, val);
	};
	el.disp = function(prop, val){
		if(this[prop]) this[prop].call(this, val);
	};
	el.position = function(data){
		if(parentType == "canvas"){
			for(var d in data) this.css(d, data[d]+"px");
			if(!data.hasOwnProperty("top") && !data.hasOwnProperty("bottom")){
				this.css("top", "50%");
				this.css("marginTop", "-"+(data.height/2)+"px")
			}
			if(!data.hasOwnProperty("left") && !data.hasOwnProperty("right")){
				this.css("left", "50%");
				this.css("marginLeft", "-"+(data.width/2)+"px")
			}
			if(data.rotation) this.css("transform", "rotate("+data.rotation+"deg)")
		}else if(parentType == "sequence"){
			this.css("position", "static");
			var seqPos = {"top" : "marginTop", "left" : "marginLeft", "bottom" : "marginBottom", "right" : "marginRight", "size" : "height"};
			for(var d in data) this.css(seqPos[d], data[d]+"px");
		}
		if(type == "sequence") this.css("overflowY", "scroll");
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
		if(data.color) this.css("color", "rgba("+data.color+")");
		if(data.align) this.css("textAlign", data.align);
		if(data.bold) this.css("fontWeight", data.bold=="1"?"bold":"normal");
		if(data.underline) this.css("textDecoration", data.underline=="1"?"underline":"none");
		if(data.italic) this.css("fontStyle", data.italic=="1"?"italic":"normal");
		if(data.padding) for(var p in data.padding) this.css("padding"+dirs[p], data.padding[p]+"px");
	};
	el.border = function(data){
		var borderStyle = "";
		if(data.width) this.css("borderWidth", data.width+"px");
		if(data.color) this.css("borderColor", "rgba("+data.color+")");
		if(data.radius) this.css("borderRadius", data.radius+"px");
		if(data.style && data.edges){
			for(var e in data.edges) this.css("border"+dirs[e]+"Style", data.edges[e]?data.style:"none");
		}
	};
	el.content = function(content){
		this.innerHTML = content;
	}
	el.event("click", function(z){
		$("#selector").css("display", "block");
		$("#selector").css("top", z.el.y($("#canvas"))+"px");
		$("#selector").css("left", z.el.x($("#canvas"))+"px");
		$("#selector").css("width", z.el.cssn("width")+"px");
		$("#selector").css("height", z.el.cssn("height")+"px");
	});
	return el;
}
function getData(addr){
	var r = openData;
	for(var i in addr) r = r.childs[addr[i]];
	return r; 
}