(function() {

document.addEventListener("DOMNodeInserted", function(e) {
	if(typeof e.srcElement.getElementsByTagName == "undefined") return;
	var children = e.srcElement.getElementsByTagName("A");
	for(var i=0; i<children.length; i++) {
		if(children[i].target == "_blank") {
			children[i].onmousedown = function() { return true; };
		}
	}
}, false);

var children = document.getElementsByTagName("a");
for(var i=0; i<children.length; i++) {
	if(children[i].target == "_blank") {
		children[i].onmousedown = function() { return true; };
	}
}

})();
