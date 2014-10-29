function propsInit(){
	for(var p  in props) props[p].init();
}
var openPropData = false;
function displayProps(addr){
	openPropData = getData(addr);
	for(var p  in props) props[p].disp(openPropData[p]);
}
var props = {};
props.position = {
	"init" : function(){
		log("posinit");
	},
	"disp" : function(data){
		var dirs = ["top", "left", "bottom", "right"];
	}
};
props.overflow = {
	"init" : function(){
		log("ofinit");
	},
	"disp" : function(data){
	}
};
props.background = {
	"init" : function(){
		log("bginit");
	},
	"disp" : function(data){
	}
};
props.font = {
	"init" : function(){
		log("fntinit");
	},
	"disp" : function(data){
	}
};
props.border = {
	"init" : function(){
		log("borinit");
	},
	"disp" : function(data){
	}
};
