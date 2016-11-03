'use strict';

(() => {
  const loadScripts = (urls, succesCB, failCB) => {
    let count = urls.length;
    let errored = false;

    if (urls.length == 0) return succesCB();

    urls.forEach(function(url) {
      var script = document.createElement('script');
      script.onload = function() {
        if (errored) return;
        if (!--count) succesCB();
      };
      script.onerror = function() {
        if (errored) return;
        failCB();
        errored = true;
      };
      script.src = url;
      document.head.insertBefore(script, document.head.firstChild);
    });
  };

  const basePath = '../';
  const polyfillsNeeded = [];
  let waitForWebcomponents = false;

  if (!('Promise' in window)) {
    polyfillsNeeded.push(basePath+'polyfills/promise.js');
  }

  if(!('URL') in window) {

  }

  if (!('fetch' in window)) {
    polyfillsNeeded.push(basePath+'polyfills/fetch/fetch.js');
  }

  if (!('registerElement' in document)) {
    polyfillsNeeded.push(basePath+ 'polyfills/webcomponentsjs/CustomElements.min.js');
    waitForWebcomponents = true;
  }

  // Safari bug work around, safari sees HTMLElement
  // as an object not a function.
  if (typeof HTMLElement !== 'function') {
    const _HTMLElement = function() {};
    _HTMLElement.prototype = HTMLElement.prototype;
    HTMLElement = _HTMLElement;
  }

  const polyFillsLoadedEvent = new CustomEvent('polyFillsLoaded', {
    bubbles: true
  });

  // Load the polyfills
  loadScripts(polyfillsNeeded, () => {
    if (waitForWebcomponents) {
      window.addEventListener('WebComponentsReady', () => {
        requestAnimationFrame(() => {
          document.dispatchEvent(polyFillsLoadedEvent);
        });
      })
    } else {
      requestAnimationFrame(() => {
        document.dispatchEvent(polyFillsLoadedEvent);
      });
    }
  }, () => {
    throw new Error('Failed to load required polyfills');
  });
})();
