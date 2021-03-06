var dirs = ["Top", "Left", "Bottom", "Right"];
var axis = {"X":"","Y":""};
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
	if(data.type == "content") el.attr("contenteditable", "true");
	el.event("click", elClick);
	el.event("scroll", elScroll);
	el.event("focus", function(){editingText = true;});
	el.event("blur", function(){editingText = false;});
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
elex.getnorm = function(type, prop){
	var dat = this.data();
	if(prop){
		if(dat[type] && dat[type][prop]) return dat[type][prop];
		else return defaults[type][prop];
	}else{
		var r = {};
		var d = dat[type]||{};
		var def = defaults[type](this.addr);
		for(var i in dat[type]) r[i] = dat[type][i];
		for(var j in def){
			r[j] = r[j]||def[j];
		}
		return r;
	}
}
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
}
elex.set = function(type, prop, val){
	var dat = this.data();
	dat[type] = dat[type]||{};
	if(!defaults[type]) dat[type][prop] = val;
	else{
		var def = defaults[type](this.addr);
		if(def[prop] == val || !val){
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
	val = val||{};
	if(this[prop]) this[prop].call(this, val);
};
elex.position = function(dat){
	var parent = this.parent().data();
	var pprops = ["top", "bottom", "left", "right", "width", "height"];
	if(parent.type == "canvas"){
		for(var d in pprops){
			if(dat.hasOwnProperty(pprops[d])) this.css(pprops[d], val2css(dat[pprops[d]]));
			else this.css(pprops[d], false);
		}
		if(!dat.hasOwnProperty("top") && !dat.hasOwnProperty("bottom")){
			this.css("top", "50%");
			this.css("marginTop", "-"+(val2int(dat.height)/2)+valunit(dat.height));
		}else this.css("marginTop", "0");
		if(!dat.hasOwnProperty("left") && !dat.hasOwnProperty("right")){
			this.css("left", "50%");
			this.css("marginLeft", "-"+(val2int(dat.width)/2)+valunit(dat.width));
		}else this.css("marginLeft", "0");
		if(dat.rotation) this.css("transform", "rotate("+dat.rotation+"deg)");
		var el = this;
		setTimeout(function(){
			for(var z in axis){
				var wh = z=="X"?"width":"height";
				if(parent.overflow && parent.overflow[z] == "expand") el.parent().fit(z);
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
elex.fit = function(axis){
	var childs = this.childs();
	if(!childs) return false;
	var anchor = false;
	var axisAnchors = {"X" : ["left", "right"], "Y" : ["top", "bottom"]};
	var axisAlts = {"X" : "width", "Y" : "height"};
	var propOpps = {"top" : "bottom", "bottom" : "top", "left" : "right", "right" : "left"};
	for(var x in axisAnchors[axis]) if(this.data().position.hasOwnProperty(axisAnchors[axis][x])) anchor = axisAnchors[axis][x];
	var max = false;
	var X = axis == "X";
	for(var i=0;i<childs.length;i++){
		if(childs[i].data().position.hasOwnProperty(anchor) && !childs[i].data().position.hasOwnProperty(propOpps[anchor])){
			var offset;
			var poff = childs[i]["offset"+(X?"Left":"Top")];
			if(anchor == "top" || anchor == "left"){
				offset = poff+childs[i].cssn(X?"width":"height");
			}else{
				offset = this.cssn(X?"width":"height")-poff;
			}
			if(offset > max) max = offset;
		}
	}
	if(max) this.css(axisAlts[axis], max+"px");
	else this.css(axisAlts[axis], this.overflow[axisAlts[axis]]);
	if(this.parent().data().overflow && this.parent().data().overflow[axis] == "expand") this.parent().fit(axis);
}
elex.padding = function(dat){
	dat = dat||{};
	for(var i in dirs) if(dirs[i]) this.css("padding"+dirs[i], (dat[dirs[i]]||defaults.padding()[dirs[i]])+"px");
}
elex.overflow = function(dat){
	dat = dat||defaults.overflow();
	var ocss = {"expand" : "hidden"};
	for(var z in axis) this.css("overflow"+z, ocss[dat[z]]||dat[z]);
}
elex.background = function(dat){
	dat = this.getnorm("background");
	if(dat.color) this.css("backgroundColor", "rgba("+dat.color+")");
	this.css("backgroundImage", dat.image=="none"?false:"url('../as"+dat.image+"')");
	this.css("backgroundRepeat", dat.repeat);
	this.css("backgroundPosition", "center");
	this.css("backgroundClip", dat.clip=="true"?"content-box":"border-box");
	if(dat.size){
		var sizes = ["auto", "contain", "cover"];
		if(sizes.indexOf(dat.size) != -1) this.css("backgroundSize", dat.size);
		else this.css("backgroundSize", parseInt(dat.size)+"%");
	}
};
elex.font = function(dat){
	var fpropscss = {"family" : "fontFamily", "size" : "fontSize", "color" : "color", "align" : "textAlign", "bold" : "fontWeight", "underline" : "textDecoration", "italic" : "fontStyle", "height" : "lineHeight"};
	if(dat.family) this.css("fontFamily", dat.family);
	if(dat.size) this.css("fontSize", dat.size+"px");
	if(dat.color) this.css("color", "rgba("+dat.color+")");
	if(dat.align) this.css("textAlign", dat.align);
	if(dat.bold) this.css("fontWeight", dat.bold=="true"?"bold":"normal");
	if(dat.underline) this.css("textDecoration", dat.underline=="true"?"underline":"none");
	if(dat.italic) this.css("fontStyle", dat.italic=="true"?"italic":"normal");
	if(dat.height )this.css("lineHeight", dat.height=="auto"?"normal":dat.height+"px");
	for(var i in defaults.font(this.addr)) if(!dat[i]) this.css(fpropscss[i], false);
};
elex.border = function(dat){
	dat = this.getnorm("border");
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