function log(e){
	if(console.log) console.log(e);
	else alert(e);
}
function $(e){
	return e == "body" ? $t("body") : extEl(document.getElementById(e));
}
function $t(t){
	var list = document.getElementsByTagName(t);
	els = Array.prototype.slice.call(list, 0), ri = 0, r = new Array();
	for(var i=0;i<els.length;i++){
		r[ri] = extEl(els[i]);
		ri++;
	}
	if(t == "body"){
		r[0].id = "body";
		r = extBody(r[0]);
	}else r = extLi(r);
	return r;
}
function $c(cl){
	var els = $t('*'), i, ri = 0;
	var r = new Array();
	for(var i=0;i<els.length;i++){
		if(els[i]){
			if(els[i].className == cl){
				r[ri] = els[i];
				ri++;
			}
		} 
	}
	return extLi(r);	
}
function extEl(el){
	for(var e in ext){
		el[e] = ext[e];
	}
	return el;
}
function getExt(li, e){
	return function(){
		var a = Array.prototype.slice.call(arguments);
		for(var i = 0;i<li.length;i++){
			eval("li["+i+"]."+e+".apply(li[i], a)");
		}
	}
}
function extLi(li){
	for(var e in ext){
		li[e] = getExt(li, e);
	}
	return li;
}
function extEv(e){
	var r = {};
	r.e = e;
	e.target ? r.el = e.target : r.el = e.srcElement;
	if(r.el.nodeType == 3) r.el = e.el.parentNode;
	r.type = e.type;
	e.keyCode ? r.code = e.keyCode : r.code = e.which;
	r.char = String.fromCharCode(r.code);
	e.which ? r.rclick = (e.which == 3) : r.rclick = (e.button == 2);
	r.x = 0, r.y = 0;
	if(e.pageX || e.pageY){
		r.x = e.pageX;
		r.y = e.pageY;
	}else{
		r.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		r.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	return r;
}
function extBody(e){
	e.viewWidth = document.documentElement.clientWidth;
	e.viewHeight = document.documentElement.clientHeight;
	e.scrollX = (window.pageXOffset || document.documentElement.scrollLeft)-(document.documentElement.clientLeft || 0);
	e.scrollY = (window.pageYOffset || document.documentElement.scrollTop)-(document.documentElement.clientTop || 0);
	return e;
}
var evs = {};
var ext = {};
ext.event = function(ev, fu){
    var f = function(e){fu(extEv(e))};
	if(!eval("evs."+this.id)) eval("evs."+this.id+" = {};");
	eval("evs."+this.id+"."+ev+" = f");
   	e = this.addEventListener ? this.addEventListener(ev, eval("evs."+this.id+"."+ev), false) : this.attachEvent("on"+ev, eval("evs."+this.id+"."+ev));
}
ext.rmEvent = function(ev){
   	e = this.addEventListener ? this.removeEventListener(ev, eval("evs."+this.id+"."+ev), false) : this.detachEvent("on"+ev, eval("evs."+this.id+"."+ev));
   	eval("delete evs."+this.id+"."+ev);
}
ext.cEvent = function(ev, fu, c){
	this.event(ev, function(e){
		if(c())fu(e);
	});
}
ext.addClass = function(c){
	var classes = this.className.split(" ");
	for(x in classes) if(classes[x] == c) return false;
	classes.push(c);
	this.className = classes.join(" ");
	return true;
}
ext.rmClass = function(c){
	var classes = this.className.split(" ");
	var i = classes.indexOf(c);
	if(i == -1) return false;
	var newClasses = [];
	for(x=0;x<classes.length;x++) if(classes[x] != c) newClasses.push(classes[x]);
	this.className = newClasses.join(" ");
	return true;
}
ext.clearEvents = function(){
	if(this.id){
		if(evs[this.id]){
			for(x in evs[this.id]) this.rmEvent(x, evs[this.id][x]);
			delete evs[this.id];
			return true;
		}
	}
	return false;
}
ext.getChildren = function(r){
	if(this.children){
		var els = Array.prototype.slice.call(this.childNodes), arr = new Array();
		for(var i = 0;i<els.length;i++){
			arr[i] = extEl(els[i]);
			if(r && arr[i].getChildren(true)){
				var chi = arr[i].getChildren(true)
				for(var ri = 0;ri<chi.length;ri++){
					arr[i][ri] = chi;
				}
			}
		}
		return arr;
	}else{
		return false;
	}
}
ext.getPosition = function(){
	var x = 0, y = 0;
	var el = this;
	while(el){
		x += el.offsetLeft - el.scrollLeft;
		y += el.offsetTop - el.scrollTop;
		el = el.offsetParent;
	}
	return {x : x, y : y};
}
ext.getStyle = function(prop){
    if (this.currentStyle) var style = this.currentStyle[prop];
    else if(window.getComputedStyle) var style = document.defaultView.getComputedStyle(this,null).getPropertyValue(prop);
    return style;
}
ext.setAttributes = function(attr){
	for(a in attr) this.setAttribute(a, attr[a]);
}
ext.clone = function(){
	var el = extEl(this.cloneNode(false));
	return el;
}
ext.remove = function(){
	if(this.parentNode) this.parentNode.removeChild(this);
	this.clearEvents();
}
ext.clear = function(){
	var c = this.getChildren();
	if(c.length > 0){
		for(x=0;x<c.length;x++) this.removeChild(c[x]);
		return true;
	}else return false;
}
ext.show = function(){
	this.style.display = "block";
}
ext.hide = function(){
	this.style.display = "none";
}
function stripTags(html){
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText;
}
function element(id, tp, attr){
	var el = extEl(document.createElement(tp));
	if(id) el.id = id;
	if(attr) el.setAttributes(attr);
	return el;
}
function elementFromStr(str){
	var div = element(false, "div", false);
	div.innerHTML = str;
	return extEl(div.firstChild);
}
function ajax(url, data, prog, end){
	 if (window.XMLHttpRequest){
        xmlhttp=new XMLHttpRequest();
    }else{
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open("POST",url,true);
    if(prog) xmlhttp.upload.onprogress = prog;
 	xmlhttp.onreadystatechange  = function(){
        if (xmlhttp.readyState == 4){
            if(xmlhttp.status == 200){
                end(xmlhttp.responseText); 
            }
        }
    };
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    if(data instanceof Object){
   		var dataStr = "", ri = 0;
    	for(var i in data){
    		var dat = encodeURIComponent(data[i]);
    		if(ri != 0) dataStr += "&"+i+"="+dat;
    		else dataStr += i+"="+dat;
    		ri++;
    	}
    	xmlhttp.send(dataStr);
    }else if(Object.prototype.toString.call(data) == '[object String]') xmlhttp.send(encodeURIComponent(data));  
    else xmlhttp.send(data);
    
}