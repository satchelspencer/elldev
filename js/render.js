var dirs = ["Top", "Left", "Bottom", "Right"];
function render(data, to, addr){
	to.clear();
	var addr = addr||[];
	for(var i in data.childs){
		var child = data.childs[i];
		var childEl = newEl(child, data, addr.concat(i));
		to.appendChild(childEl);
		if(child.childs) render(child, childEl, childEl.addr);
		for(var p in child) childEl.disp(p, child[p]);
	}
}
function newEl(data, parent, addr){
	var el = element(false, "div", data.type);
	var type = data.type;
	el.addr = addr;
	el.set = function(propTree, val){
		propTree = propTree.split(".");
		var dat = getData(this.addr);
		var prop = dat;
		for(var p=0;p<propTree.length-1;p++) prop = prop[propTree[p]];
		if(val) prop[propTree[p]] = val;
		else delete prop[propTree[p]];
		this.disp(propTree[0], dat[propTree[0]]);
	};
	el.disp = function(prop, val){
		if(this[prop]) this[prop].call(this, val);
	};
	el.position = function(dat){
		if(parent.type == "canvas"){
			for(var d in dat) this.css(d, val2css(dat[d]));
			if(!dat.hasOwnProperty("top") && !dat.hasOwnProperty("bottom")){
				this.css("top", "50%");
				this.css("marginTop", "-"+(val2int(dat.height)/2)+valunit(dat.height));
			}
			if(!dat.hasOwnProperty("left") && !dat.hasOwnProperty("right")){
				this.css("left", "50%");
				this.css("marginLeft", "-"+(val2int(dat.width)/2)+valunit(dat.width));
			}
			if(dat.rotation) this.css("transform", "rotate("+dat.rotation+"deg)");
			setTimeout(function(){
				for(var z in parent.overflow){
					var wh = z=="X"?"width":"height";
					if(parent.overflow[z] == "expand"){
						var offsetlt = (z=="X"?el.offsetLeft:el.offsetTop);
						var offsetrb = offsetlt+el.cssn(wh)-el.parent().cssn(wh);
						sizeOffset = (offsetlt<0?Math.abs(offsetlt):0)+offsetrb;
						var bound = parent.position.hasOwnProperty(z=="X"?"left":"top") && parent.position.hasOwnProperty(z=="X"?"right":"bottom");
						if(sizeOffset > 0 && !bound) el.parent().set("position."+(wh), (val2int(parent.position[wh])+sizeOffset)+valunit(parent.position[wh]));
					}
				}
			},1000);
		}else if(parent.type == "sequence"){
			this.css("position", "relative");
			this.css("width", "100%");
			var seqPos = {"top" : "marginTop", "left" : "marginLeft", "bottom" : "marginBottom", "right" : "marginRight", "size" : "height"};
			for(var d in dat) if(seqPos[d] && dat[d]) this.css(seqPos[d], val2css(dat[d]));
		}
		this.css("overflow", dat.overflow=="fit"?"hidden":dat.overflow);
	};
	el.overflow = function(dat){
		var ocss = {"expand" : "hidden", "contract" : "hidden"};
		if(type == "canvas") for(var z in dat) this.css("overflow"+z, ocss[dat[z]]||dat[z]);
		else if(type == "sequence"){
			var val = ocss[data.orient]||data.orient;
			this.css("overflowX", data.orient=="horiz"?val:"hidden");
			this.css("overflowY", data.orient=="vert"?val:"hidden");
		}
	}
	el.background = function(dat){
		if(dat.color) this.css("backgroundColor", "rgba("+dat.color+")");
		if(dat.image){
			this.css("backgroundImage", "url('../as"+dat.image+"')");
			if(dat.repeat) this.css("backgroundRepeat", dat.repeat);
			if(dat.size) this.css("backgroundSize", dat.size);
		}
	};
	el.font = function(dat){
		if(dat.family) this.css("fontFamily", dat.family);
		if(dat.size) this.css("fontSize", dat.family);
		if(dat.color) this.css("color", "rgba("+dat.color+")");
		if(dat.align) this.css("textAlign", dat.align);
		if(dat.bold) this.css("fontWeight", dat.bold=="1"?"bold":"normal");
		if(dat.underline) this.css("textDecoration", dat.underline=="1"?"underline":"none");
		if(dat.italic) this.css("fontStyle", dat.italic=="1"?"italic":"normal");
		if(dat.padding) for(var p in dat.padding) this.css("padding"+dirs[p], val2css(dat.padding[p]));
	};
	el.border = function(dat){
		var borderStyle = "";
		if(dat.width) this.css("borderWidth", val2css(dat.width));
		if(dat.color) this.css("borderColor", "rgba("+dat.color+")");
		if(dat.radius) this.css("borderRadius", val2css(dat.radius));
		if(dat.style && dat.edges){
			for(var e in dat.edges) this.css("border"+dirs[e]+"Style", dat.edges[e]?dat.style:"none");
		}
	};
	el.content = function(content){
		this.innerHTML = content;
	}
	el.event("click", elClick);
	return el;
}
function getData(addr){
	var r = openData;
	for(var i in addr) r = r.childs[addr[i]];
	return r; 
}
function val2int(s){
	return parseInt(s.replace(/(\d+)\D?/, '$1'));
}
function valunit(s){
	return s.replace(/\d+(\D?)/, '$1')||"px";
}
function val2css(s){
	return val2int(s)+valunit(s);
}