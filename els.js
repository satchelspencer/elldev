var positionData = ["centerx", "centery", "width", "height", "top", "left", "bottom", "right"];
function el(o){
	var r = extEl(element(o.id, "div", false));
	r.j = o;
	r.setId = function(id){
		this.id = id;
		this.j.id = id;
	}
	r.setName = function(n){
		this.j.name = n;
	}
	r.setCanvasProp = function(prop, val){
		if(val === false && this.style[prop]){
			this.style[prop] = "";
			return true;
		}else if(prop == "top" || prop == "bottom" || prop == "left" || prop == "right"){
			this.style[prop] = (val >= 0) ? val+"px" : "-"+val+"px";
		}else if(prop == "width" || prop == "height"){
			this.style[prop] = val+"px";
			if(this.j.position[prop == "width" ? "centerx" : "centery"]){
				this.style[prop == "width" ? "marginLeft" : "marginTop"] = "-"+val/2+"px";
			}
		}else if(prop == "centery" || prop == "centerx"){
			if(!val){
				this.style[prop == "centery" ? "top" : "left"] = "";
				this.style[prop == "centery" ? "marginTop" : "marginLeft"] = "";
			}else{
				this.style[prop == "centery" ? "top" : "left"] = "50%";
			}
		}
	}
	r.setPosition = function(pos, overwrite){
		overwrite = overwrite || false;
		var parent = this.parentNode || {j:{type:"canvas"}}
		if(parent.j.type == "canvas"){
			this.style.position = "absolute";
			if(overwrite){
				for(x in positionData) this.setCanvasProp(positionData[x], false);
				delete this.j.position;
				this.j.position = {};
			}
			for(x in pos){
				if(overwrite) this.j.position[x] = pos[x];
				this.setCanvasProp(x, pos[x]);
			}
		}else if(parent.j.type == "sequence"){
			for(var k=0,e=this;e=e.previousSibling;k++);
			this.style.position = "static";
			var vert = this.parentNode.j.props.vert;
			this.style[vert ? "width" : "height"] = "100%";
			this.style[vert ? "marginTop" : "marginLeft"] = k != 0 ? this.parentNode.j.props.margin+"px" : "0px";
			this.style[vert ? "height" : "width"] = pos.size+"px";
			//this.style.float = vert ? "" : "left";
			this.style.display = vert ? "block" : "inline-block";
		}
	}
	r.setProperties = function(props){
		for(x in props){
			if(x == "background") this.style.backgroundColor = props[x];
			else if(x == "innerMargin"){
				this.style.boxSizing = "border-box";
				var marginstr = "";
				for(i in props[x]) marginstr += props[x][i]+"px ";
				this.style.padding = marginstr;
			}else if(x == "vert"){
				this.style[props[x] ? "overflowY" : "overflowX"] = "scroll";
				this.style[props[x] ? "overflowX" : "overflowY"] = "hidden";
				this.style.whiteSpace = "nowrap";
			}
		}
	}
	r.addSibBefore = function(e){
		this.parentNode.insertBefore(this, e);
	}
	r.addSibAfter = function(e){
		this.parentNode.insertBefore(this, e.nextSibling);
	}
	r.moveTo = function(index){
		if(this.parentNode.type == "sequence") log("my mom");
		for(var k=0,e=this;e=e.previousSibling;k++);
		if(index == this.parentNode.childNodes.length-1) index = -1;
		if(k<index)index++;
		this.parentNode.insertChild(el(this.j), index);
		this.remove();
	}
	if(r.j.type == "canvas" || r.j.type == "sequence"){
		r.insertChild = function(e, index){
			if(index == -1) this.appendChild(e);
			else this.insertBefore(e, this.childNodes[index]);
		}
		for(x in o.children) r.insertChild(el(o.children[x]), -1);
		var i = 0;
		for(x in r.childNodes) if(r.childNodes[x].nodeType == 1){
			var e = r.childNodes[x];
			e.setPosition(o.children[i].position || false, false);
			e.setProperties(o.children[i].props);
			i++;
		}
		r.setPosition(o.position || false, false);
		r.setProperties(o.props);
	}
	
	return r;
}
