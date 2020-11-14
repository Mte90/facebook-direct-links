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
    // First level of cleanup
    let cleanup = function() {
        let uri = element.href;

        if (/^https?:\/\/lm?.facebook.com/i.test(uri)) {
            uri = uri.match(/u=([^&#$]+)/i)[1];
        }

        uri = decodeURIComponent(uri);
        uri = uri.replace(/&?fbclid=[^&#$/]*/gi, '');
        uri = uri.replace(/&?ref=[^&#$/]*/gi, '');
        uri = uri.replace(/&?__cft__\[0\]=[^&#$/]*/gi, '');
        uri = uri.replace(/&?__tn__=[^&#$/]*/gi, '');
        uri = uri.replace(/&?ref_type=[^&#$/]*/gi, '');
        if (uri[uri.length -1] === '?') {
            uri = uri.substr(0, uri.length-1);
        }

        element.href = uri;
        return uri;
    }

    var url = element.href.toString();
    if (url === '') return;

    var whitelist = ['#', '/profile.php', '/photo/download', '/groups', '/ad_campaign', '/pages', '&notif_t', '/photos/', '/photo/'];
    var filter = true;
    whitelist.forEach(function(element) {
      if (url.indexOf(element) !== -1) {
        filter = false;
      }
    });
    
    let fbclick = function(event) { 
        event.stopPropagation();
        uri = cleanup();
        var domainfilter= ['facebook.com', 'facebookwww.onion'];
        var ovverride = false;
        domainfilter.forEach(function(url) {
            if (uri.indexOf(url) === -1) {
                ovverride = true;
            }
        });
        
        if (override) {
            window.open(uri, '_blank');
            return false;
        }
    }

    if (filter) {
      element.onmousedown = cleanup;
      element.contextmenu = cleanup;
      element.ontouchstart = cleanup;
      element.onclick = fbclick;
    } else {
      element.onmousedown = cleanup;
      element.contextmenu = cleanup;
      element.ontouchstart = cleanup;
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
