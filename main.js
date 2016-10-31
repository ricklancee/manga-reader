window.addEventListener('load', _ => {
  let polyfillsNeeded = [];

  const loadScripts = (urls, yeyCallback, neyCallback) => {
    let count = urls.length;
    let errored = false;

    if (urls.length == 0) return yeyCallback();

    urls.forEach(function(url) {
      var script = document.createElement('script');
      script.onload = function() {
        if (errored) return;
        if (!--count) yeyCallback();
      };
      script.onerror = function() {
        if (errored) return;
        neyCallback();
        errored = true;
      };
      script.src = url;
      document.head.insertBefore(script, document.head.firstChild);
    });
  };

  if (!('Promise' in window)) {
    polyfillsNeeded.push('polyfills/promise.js');
  }

  if (!window.fetch) {
    polyfillsNeeded.push('polyfills/fetch/fetch.js');
  }

  if (!('registerElement' in document)) {
    polyfillsNeeded.push('polyfills/webcomponentjs/CustomElements.min.js');
  }

  // Initialize
  loadScripts(polyfillsNeeded, _ => {
    document.registerElement('manga-reader', Reader);
  });
});
