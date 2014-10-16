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
			if(data.repeat){
				
			}
		}
	};
	el.font = function(data){
	
	};
	el.border = function(data){
	
	};
	return el;
}
function jsonByAddr(addr){
	var r = openData;
	for(var i in addr) r = r.children[addr[i]];
	return r; 
}