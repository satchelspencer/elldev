var dirs = ["Top", "Left", "Bottom", "Right"];
function render(data, to, addr, callback){
	to.clear();
	var addr = addr||[];
	for(var i in data.childs){
		var child = data.childs[i];
		var childEl = newEl(child, addr.concat(i));
		to.appendChild(childEl);
		if(child.childs) render(child, childEl, childEl.addr);
		for(var p in child) if(p != "childs") childEl.disp(p, child[p]);
	}
	if(callback) callback();
}
function newEl(data, addr){
	var el = element(false, "div", data.type);
	el.addr = addr;
	el.event("click", elClick);
	el.event("scroll", elScroll);
	return extcEl(el);
}
function extcEl(el){
	for(var x in elex) el[x] = elex[x];
	return el;
}
function val2int(s){
	return parseInt(s.replace(/(-?\d+)\D?/, '$1'));
}
function valunit(s){
	return s.replace(/-?\d+(\D?)/, '$1')||"px";
}
function val2css(s){
	return val2int(s)+valunit(s);
}
var elex = {};
elex.data = function(){
	return getData(this.addr);
};
elex.parent = function(){
	return extcEl(this.parentNode);
}
elex.childs = function(index){
	if(index !== undefined) return this.children?extEl(this.children[index]):undefined;
	else if(this.firstChild){
		var r = [];
		var c = this.firstChild;
		while(c){
			if(c.nodeType == 1) r.push(extcEl(extEl(c)));
			c = c.nextSibling;
		}
		return extLi(r);
	}else return undefined;
}
elex.dclone = function(){
	var nel = extcEl(this.clone());
	nel.addr = this.addr;
	nel.event("click", elClick);
	nel.event("scroll", elScroll);
	return nel;
}
elex.setAddr = function(addr){
	this.addr = addr;
	var cs = this.childs();
	if(cs) for(var i=0;i<cs.length;i++){
		cs[i].setAddr(addr.concat(String(i)));
	}
};
elex.set = function(type, prop, val){
	var dat = this.data();
	dat[type] = dat[type]||{};
	if(!defaults[type]) dat[type][prop] = val;
	else{
		var def = defaults[type](this.addr);
		if(def[prop] == val){
			delete dat[type][prop];
			var empty = true;
			for(var i in dat[type]) empty = false;
			if(empty) delete dat[type];
		}else dat[type][prop] = val;
	}
	this.disp(type, dat[type]);
	redrawSelection();
	return dat[type];
}
elex.showset = function(type, prop, val){
	this.set(type, prop, val);
	displayProps(selectedAddr);
}
elex.disp = function(prop, val){
	if(this[prop]) this[prop].call(this, val);
};
elex.position = function(dat){
	var parent = this.parent().data();
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
		var el = this;
		setTimeout(function(){
			for(var z in parent.overflow){
				var wh = z=="X"?"width":"height";
				if(parent.overflow[z] == "expand"){
					var offsetlt = (z=="X"?el.offsetLeft:el.offsetTop);
					var offsetrb = offsetlt+el.cssn(wh)-el.parent().cssn(wh);
					sizeOffset = (offsetlt<0?Math.abs(offsetlt):0)+offsetrb;
					var bound = parent.position.hasOwnProperty(z=="X"?"left":"top") && parent.position.hasOwnProperty(z=="X"?"right":"bottom");
					if(sizeOffset > 0 && !bound) el.parent().set("position", wh, String(val2int(parent.position[wh])+sizeOffset));
				}
			}
		},0);
	}else if(parent.type == "sequence"){
		this.css("position", "relative");
		var pdprops = {"top" : "marginTop", "left" : "marginLeft", "bottom" : "marginBottom", "right" : "marginRight", "height" : "height"};
		for(var d in pdprops) this.css(pdprops[d], val2css(dat[d]||"0"));
		var el = this.parent().last();
		setTimeout(function(){
			if(parent.overflow.Y == "expand"){
				var elh = el.offsetTop+el.cssn("height")+el.cssn("margin-bottom");
				var bound = parent.position.hasOwnProperty("top") && parent.position.hasOwnProperty("bottom");
				if(!bound) el.parent().set("position", "height", String(elh));
			}
		},0);
	}
};
elex.padding = function(dat){
	for(var i in dirs) this.css("padding"+dirs[i], dat[i]+"px");
}
elex.overflow = function(dat){
	dat = dat||defaults.overflow();
	var ocss = {"expand" : "hidden"};
	for(var z in dat) this.css("overflow"+z, ocss[dat[z]]||dat[z]);
}
elex.background = function(dat){
	if(dat.color) this.css("backgroundColor", "rgba("+dat.color+")");
	if(dat.image){
		this.css("backgroundImage", "url('../as"+dat.image+"')");
		this.css("backgroundRepeat", dat.repeat||"no-repeat");
		this.css("backgroundPosition", "center");
		if(dat.size){
			var sizes = ["auto", "contain", "cover"];
			if(sizes.indexOf(dat.size) != -1) this.css("backgroundSize", dat.size);
			else this.css("backgroundSize", parseInt(dat.size)+"%");
		}
	}
};
elex.font = function(dat){
	if(dat.family) this.css("fontFamily", dat.family);
	if(dat.size) this.css("fontSize", dat.size+"px");
	if(dat.color) this.css("color", "rgba("+dat.color+")");
	if(dat.align) this.css("textAlign", dat.align);
	if(dat.bold) this.css("fontWeight", dat.bold=="true"?"bold":"normal");
	if(dat.underline) this.css("textDecoration", dat.underline=="true"?"underline":"none");
	if(dat.italic) this.css("fontStyle", dat.italic=="true"?"italic":"normal");
	this.css("lineHeight", dat.height?dat.height+"px":"normal");
};
elex.border = function(dat){
	if(dat.width) this.css("borderWidth", dat.width+"px");
	if(dat.color) this.css("borderColor", "rgba("+dat.color+")");
	if(dat.radius) this.css("borderRadius", dat.radius+"px");
	if(dat.style && dat.edges){
		for(var e in dat.edges) this.css("border"+dirs[e]+"Style", dat.edges[e]?dat.style:"none");
	}
};
elex.content = function(content){
	this.innerHTML = content;
}