(function(win) {
    'use strict';

    var listeners = [],
    mainDoc = win.document,
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
            observer.observe(mainDoc.documentElement, {
                childList: true,
                subtree: true
            });
        }
        // Check if the element is currently in the DOM
        check();
    }

    function check(mutationsList, observer, doc = mainDoc) {
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

    ready('a', function (element) {
        let cleanup = function() {
            let uri = element.href;

            if (/^https?:\/\/lm?.facebook.com/i.test(uri)) {
                uri = uri.match(/u=([^&#$]+)/i)[1];
            }

            uri = decodeURIComponent(uri);
            uri = uri.replace(/([&|?])fbclid=[^&#$/]*/gi, '$1');
            uri = uri.replace(/([&|?])fb_action_ids=[^&#$/]*/gi, '$1');
            uri = uri.replace(/([&|?])fb_action_types=[^&#$/]*/gi, '$1');
            uri = uri.replace(/([&|?])fb_source=[^&#$/]*/gi, '$1');
            uri = uri.replace(/([&|?])fb_ref=[^&#$/]*/gi, '$1');
            uri = uri.replace(/([&|?])ga_[^&#$/]*=[^&#$/]*/gi, '$1');
            uri = uri.replace(/([&|?])utm_[^&#$/]*=[^&#$/]*/gi, '$1');
            uri = uri.replace(/([&|?])ref=[^&#$/]*/gi, '$1');
            uri = uri.replace(/([&|?])__cft__\[0\]=[^&#$/]*/gi, '$1');
            uri = uri.replace(/([&|?])__tn__=[^&#$/]*/gi, '$1');
            uri = uri.replace(/([&|?])ref_type=[^&#$/]*/gi, '$1');

            // Additional `&` clean up
            uri = uri.replace(/([&|?])(&+)/gi, '$1');

            if (uri[uri.length -1] === '?' || uri[uri.length -1] === '&') {
                uri = uri.substr(0, uri.length-1);
            }

            element.href = uri;
        }

        let eventBlocker = function(evt) {
            cleanup();
            evt.stopImmediatePropagation();
        }

        var url = element.href.toString();
        if (url === '') return;

        var domainfilter= ['facebook.com', 'facebookwkhpilnemxj7asaniu7vnjjbiltxjqhye3mhbshg7kx5tfyd.onion'];
        var domain = (new URL(url)).hostname.toString()
                        .split('.').slice(-2).join('.');
        var trackerLinkRegex = /^https?:\/\/lm?.(facebook\.com|facebookwkhpilnemxj7asaniu7vnjjbiltxjqhye3mhbshg7kx5tfyd\.onion)\/l.php\?u=([^&#$]+)/i;

        if( !domainfilter.includes(domain) || trackerLinkRegex.test(url) ) { //external links
            element.addEventListener('click', eventBlocker);
            element.addEventListener('contextmenu', eventBlocker);
            element.addEventListener('touchstart', eventBlocker);
            element.addEventListener('mousedown', eventBlocker);
            element.addEventListener('mouseup', eventBlocker);
            cleanup();
        }
    });

    ready('iframe', function (iframe) {
        // A new observer for the iframe document
        var obs = null

        // Create a new observer and call check to update elements
        var startObserving = d => {
            obs = new MutationObserver(() => {
                check(null, null, d)
            })
            obs.observe(iframe.contentWindow.document, {childList: true, subtree: true})
            check(null, null, d)
        }

        /*
        Disconnect observer for that iframe
        but check if the window has been destroyed completely
        or has been recreated, if so, recreate also the observer
        */
        iframe.contentWindow.onunload = () => {
            if (obs) {
                obs.disconnect()
            }
            // wait for the window to be recreated
            setTimeout(() => {
                // If the window has been recreated recreate also the observer
                if (iframe.contentWindow) {
                    startObserving(iframe.contentWindow.document)
                }
            }, 0)
        }

        // Actually create the observer
        startObserving(iframe.contentWindow.document)
    })
})(this)
