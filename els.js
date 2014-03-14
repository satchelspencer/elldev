function canvas(o){
	r = extEl(element(o.id, "div", false));
	r.setPosition = function(p){
		if(p.type == "canvas"){
			r.style.position = "absolute";
			
		}else if(p.type == "sequence"){
			r.style.position = "relative";
		}
	}
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
