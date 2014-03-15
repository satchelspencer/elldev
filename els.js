var positionData = ["centerx", "centery", "width", "height", "top", "left", "bottom", "right"];
var el = {};
el.setId = function(id){
	this.id = id;
	this.j.id = id;
}
el.setName= function(n){
	this.j.name = n;
}
el.destroy= function(){
	log("destroy!");
}
el.setCanvasProp = function(prop, val){
	if(!val && this.style[prop]){
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
el.setPosition = function(pos, overwrite){
	overwrite = overwrite || false;
	if(pos.type == "canvas" || this.j.position.type == "canvas"){
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
	}else if(pos.type == "sequence" || this.j.position.type == "canvas"){
		this.style.position = "static";
		log("sequence positioning");
	}
}
function canvas(o){
	r = extEl(element(o.id, "div", false));
	for(e in el) r[e] = el[e];
	r.j = o;
	r.setPosition(o.position);
	return r;	
}
function sequence(o){
	
}
function content(o){
	
}
function media(o){
	
}
function code(o){
	
}
