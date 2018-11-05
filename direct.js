(function(win) {
    'use strict';

    var listeners = [],
    doc = win.document,
    MutationObserver = win.MutationObserver || win.WebKitMutationObserver,
    observer;
    
    function ready(selector, fn) {
        // Store the selector and callback to be monitored
        listeners.push({
            selector: selector,
            fn: fn
        });
        if (!observer) {
            // Watch for changes in the document
            observer = new MutationObserver(check);
            observer.observe(doc.documentElement, {
                childList: true,
                subtree: true
            });
        }
        // Check if the element is currently in the DOM
        check();
    }

    function check() {
        // Check the DOM for elements matching a stored selector
        for (var i = 0, len = listeners.length, listener, elements; i < len; i++) {
            listener = listeners[i];
            // Query for elements matching the specified selector
            elements = doc.querySelectorAll(listener.selector);
            for (var j = 0, jLen = elements.length, element; j < jLen; j++) {
                element = elements[j];
                // Make sure the callback isn't invoked with the
                // same element more than once
                if (!element.ready) {
                    element.ready = true;
                    // Invoke the callback with the element
                    listener.fn.call(element, element);
                }
            }
        }
    }

    // Expose `ready`
    win.ready = ready;

    ready('a', function(element) {
        // Second level more aggressive
        let updateElement = function() {
            let uri = cleanup();
            var clean = true;
            
            // Strip all the parameters in URL
            uri = new URL(uri);
            var domainfilter= ['facebook.com', 'facebookwww.onion'];
            domainfilter.forEach(function(element) {
                if (uri.hostname.toString().indexOf(element) === -1) {
                    clean = false;
                }
            });
            
            if (clean) {
                uri = uri.protocol + '//' + uri.hostname + uri.pathname;
                element.href = uri;
            }
        };

        // First level of cleanup
        let cleanup = function() {
            let uri = element.href;
            
            if (/^https?:\/\/lm?.facebook.com/i.test(uri)) {
                uri = uri.match(/u=([^&#$]+)/i)[1];
            }
            
            uri = decodeURIComponent(uri);
            uri = uri.replace(/&?fbclid=[^&#$/]*/gi, '');
            uri = uri.replace(/&?ref=[^&#$/]*/gi, '');
            uri = uri.replace(/&?ref_type=[^&#$/]*/gi, '');
            if (uri[uri.length -1] === '?') {
                uri = uri.substr(0, uri.length-1);
            }
            
            element.href = uri;
            element.setAttribute("data-lynx-uri", "");
            return uri;
        }
        
        var url = element.href.toString();
        var whitelist = ['#', '/profile.php', '/photo/download', '/groups', '/ad_campaign', '/pages'];
        var filter = true;
        whitelist.forEach(function(element) {
            if (url.indexOf(element) !== -1) {
                filter = false;
            }
        });
        
        if (filter) {
            element.onmousedown = updateElement;
            element.contextmenu = updateElement;
            element.ontouchstart = updateElement;
        } else {
            element.onmousedown = cleanup;
            element.contextmenu = cleanup;
            element.ontouchstart = cleanup;
        }
    });
})(this);
