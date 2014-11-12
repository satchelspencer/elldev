function $(e){
	var r = false;
	var m = e.match(/^\W/g);
	e = m?e.substr(1):e;
	if(!m) r = $t(e);
	else if(m == "*") r = $t("*");
	else if(m == "#") r = document.getElementById(e) ? extEl(document.getElementById(e)) : false;
	else if(m == ".") r = $c(e);
	if(!r) throw "no results for: " + m+e;
	return r.length ? r.length == 1 ? r[0] : extLi(r) : r;
}
function $t(t){
	var list = document.getElementsByTagName(t);
	var els = Array.prototype.slice.call(list, 0), ri = 0, r = [];
	for(var i=0;i<els.length;i++) r[ri++] = extEl(els[i]);
	return  r.length > 0 ? t == "body" ? extBody(r[0]) : r : false;
}
function $c(cl){
	var r = [];
	if(document.getElementsByClassName){
		var l = document.getElementsByClassName(cl);
		var els = Array.prototype.slice.call(l, 0), ri = 0;
		for(var i=0;i<els.length;i++) r[ri++] = extEl(els[i]);
	}else{
		var els = $t('*');
		for(var i in els) if(els[i].hasClass(cl)) r.push(els[i]);		
	}
	return r.length > 0 ? r : false;	
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
		var r = [];
		for(var i = 0;i<li.length;i++){
			var o = li[i][e].apply(li[i], a);
			if(Object.prototype.toString.call(o)==='[object Array]') for(var y=0;y<o.length;y++) r.push(o[y]);
			else if(o !== undefined) r.push(o);
		}
		return r.length > 0 ? r.length == 1 ? r[0] : extLi(r) : undefined;
	}
}
function extLi(li){
	for(var e in ext){
		li[e] = getExt(li, e);
	}
	return li;
}
function extEv(e){
	if(!e) return false;
	var r = {};
	r.e = e;
	e.target ? r.el = extEl(e.target) : r.el = extEl(e.srcElement);
	if(r.el.nodeType == 3) r.el = e.el.parentNode;
	r.type = e.type;
	e.keyCode ? r.code = e.keyCode : r.code = e.which;
	r.char = String.fromCharCode(r.code);
	e.which ? r.rclick = (e.which == 3) : r.rclick = (e.button == 2);
	r.x = 0, r.y = 0;
	r.stop = function(){
		this.e.stopPropagation();
		this.e.preventDefault();
	};
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
var ext = {};
ext.e = {};
ext.event = function(ev, f){
	var fu;
	if(ev == "sclick" || ev == "dclick" || ev == "clickstart"){
		var clicks = 0;
		var scf = ev == "sclick" ? f : this["sclick"] || function(){};
		var dcf = ev == "dclick" ? f : this["dclick"] || function(){};
		var stcf = ev == "clickstart" ? f : this["clickstart"] || function(){};
		this[ev] = f;
		fu = function(e){
			clicks++;
			stcf(e);
			var t;
			clearInterval(t);
			if(clicks > 1){
				dcf(e);
				clicks = 0;
			}
			var mu = function(e){
				e = extEv(e);
				t = setTimeout(function(){
					if(clicks == 1) scf(e);
					clicks = 0;
				}, 250);
			};
			if(clicks == 1) this.addEventListener ? this.addEventListener("mouseup", mu, false) : this.attachEvent("onmouseup", mu);
		};
		ev = "mousedown";
	}else fu = f;
	if(this[ev] !== undefined) this.rmEvent(ev);
	this[ev] = function(e){fu(extEv(e))};
   	this.addEventListener ? this.addEventListener(ev, this[ev], false) : this.attachEvent("on"+ev, this[ev]);
}
ext.rmEvent = function(ev){
	if(!this[ev]) return false;
	if(ev == "sclick" || ev == "dclick") this.event(ev, function(){});
   	else this.addEventListener ? this.removeEventListener(ev, this[ev], false) : this.detachEvent("on"+ev, this[ev]);
   	delete this[ev];
}
ext.cEvent = function(ev, fu, c){
	this.event(ev, function(e){
		if(c())fu(e);
	});
}
ext.clEvents = function(){
	this.e = {};
}
ext.css = function(p, v){
	if(v){
		var prefixes = ["webkitTransform", "MozTransform", "msTransform", "OTransform", "transform"];
		if(p == "transform") for(var i in prefixes) this.style[prefixes[i]] = v;
		if(p == "opcaity"){
			this.style.opacity = v;
			this.style.filter = "alpha(opacity="+(v*100)+")";
		}
		else this.style[p] = v;
	}else if(v === false) this.style.removeProperty(jprop2css(p));
	else return this.currentStyle ? this.currentStyle[p] : document.defaultView.getComputedStyle(this,null).getPropertyValue(p);
}
ext.cssn = function(p){
	var s = this.currentStyle ? this.currentStyle[p] : document.defaultView.getComputedStyle(this,null).getPropertyValue(p);
	return s?parseFloat(s.replace(/(-?\d+)\D*/i, '$1')):0;
}
ext.class = function(c){
	var cs = this.className.split(" ");
	var ncs = c.split(" ");
	for(var j in ncs) if(cs.indexOf(ncs[j]) != -1) return false;
	for(var i in ncs) cs.push(ncs[i]);
	this.className = cs.length > 1 ? cs.join(" ") : cs[0];
	return true;
}
ext.rmClass = function(c){
	if(!this.hasClass(c)) return false;
	var cs = this.className.split(" ");
	var ncs = c.split(" ");
	for(var i in ncs) cs.splice(cs.indexOf(ncs[i]), 1);
	this.className = cs.join(" ");
	return true;
}
ext.hasClass = function(c){
	if(!this.className) return false;
	var cs = c.split(" ");
	for(var i in cs) if(this.className.split(" ").indexOf(cs[i]) == -1) return false;
	return true;
}
ext.clClass = function(){
	this.className = "";
}
ext.parent = function(){
	return this.parentNode?extEl(this.parentNode):false;
}
ext.hasAncestor = function(el){
	var p = el.parent();
	while(p){
		if(p == el) return true;
		p = p.parent();
	}
	return false;
}
ext.childs = function(index){
	if(index !== undefined) return this.children?extEl(this.children[index]):undefined;
	else if(this.firstChild){
		var r = [];
		var c = this.firstChild;
		while(c){
			if(c.nodeType == 1) r.push(extEl(c));
			c = c.nextSibling;
		}
		return extLi(r);
	}else return undefined;
}
ext.siblings = function(){
	return this.parent().childs();
}
ext.first = function(){
	return extEl(this.children[0]);
}
ext.last = function(){
	return extEl(this.children[(this.children.length-1)]);
}
ext.next = function(){
	var r = this.nextSibling;
	while(r && r.nodeType != 1) r = r.nextSibling;
	return r?extEl(r):false;
}
ext.prev = function(){
	var r = this.previousSibling;
	while(r && r.nodeType != 1) r = r.previousSibling;
	return r?extEl(r):false;
}
ext.addBefore = function(el){
	this.parentNode.insertBefore(el, this);
}
ext.addAfter = function(el){
	this.next()?this.parentNode.insertBefore(el, this.next()):this.parentNode.appendChild(el);
}
ext.pos = function(stop){
	var x = 0, y = 0;
	var el = this;
	while(el){
		x += el.offsetLeft - (el.offsetParent?el.offsetParent.scrollLeft:0) + (el.offsetParent?extEl(el.offsetParent).cssn("border-left-width"):0);
		y += el.offsetTop - (el.offsetParent?el.offsetParent.scrollTop:0) + (el.offsetParent?extEl(el.offsetParent).cssn("border-top-width"):0);
		if(el == stop) break;
		el = el.offsetParent;
	}
	return {x : x, y : y};
}
ext.x = function(stop){
	return this.pos(stop).x;
}
ext.y = function(stop){
	return this.pos(stop).y;
}
ext.attr = function(attr, val){
	return val ? this.setAttribute(attr, val) : this.getAttribute(attr);
}
ext.clone = function(){
	var el = extEl(this.cloneNode(true));
	el.id = "";
	return el;
}
ext.remove = function(){
	if(this.parentNode) this.parentNode.removeChild(this);
}
ext.clear = function(){
	if(this.childs()) this.childs().remove();
}
function element(id, tp, cl){
	var el = extEl(document.createElement(tp));
	if(id) el.id = id;
	if(cl) el.className = cl;
	return el;
}
function ajax(url, data, prog, end){
	var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xmlhttp.open("POST",url,true);
    if(prog) xmlhttp.upload.onprogress = prog;
 	xmlhttp.onreadystatechange  = function(){
        if(xmlhttp.readyState == 4) if(xmlhttp.status == 200) end(xmlhttp.responseText); 
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
function log(e, w){
	if(console.log) w ? console.warn(e) : console.log(e);
	else alert(e);
}
function ani(start, finish, steps, call, callback){
	var step = (finish-start)/steps;
	var init = start;
	var a = setInterval(function(){
		call(start);
		if(init<finish?start>=finish:finish>=start){
			clearInterval(a);
			if(start != finish) call(finish);
			if(callback) callback();
			return false;
		}
		start += step;
	}, 30);
}
function jprop2css(jprop){
	var w = jprop.split(/(?=[A-Z])/);
	for(var i in w) w[i] = w[i].toLowerCase();
	return w.join("-");
}