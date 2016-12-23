(function() {

document.addEventListener("DOMNodeInserted", function(e) {
	if(typeof e.srcElement.getElementsByTagName == "undefined") return;
        mousedown(e.srcElement.getElementsByTagName("A"));
}, false);

mousedown(document.getElementsByTagName("a"));


function mousedown(element) {
    for(var i=0; i<element.length; i++) {
	if(element[i].target == "_blank") {
		element[i].onmousedown = function() { return true; };
	}
    }
}

})();
