(function() {

document.addEventListener("DOMNodeInserted", function(e) {
	if(typeof e.srcElement.getElementsByTagName == "undefined") return;
        mousedown(e.srcElement.getElementsByTagName("A"));
}, false);

mousedown(document.getElementsByTagName("a"));


function mousedown(element) {
    for(var i=0; i<children.length; i++) {
	if(children[i].target == "_blank") {
		children[i].onmousedown = function() { return true; };
	}
    }
}

})();
