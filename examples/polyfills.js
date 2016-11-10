'use strict';

(function() {
  var waitForWebcomponents = false;
  var basePath = '/examples/bower_components';

  if (!('Promise' in window)) {
    polyfill.addPolyfill(basePath + '/promise-polyfill/promise.js');
  }

  if (!('URL' in window)) {
    polyfill.addPolyfill(basePath + '/URL/url.js');
  }

  if (!('fetch' in window)) {
    polyfill.addPolyfill(basePath + '/fetch/fetch.js');
  }

  if (!('registerElement' in document)) {
    polyfill.addPolyfill(basePath + '/webcomponentsjs/CustomElements.min.js');
    waitForWebcomponents = true;
  }

  // Shim for a Safari bug work around, safari sees HTMLElement
  // as an object not a function.
  if (typeof HTMLElement !== 'function') {
    var _HTMLElement = function _HTMLElement() {};
    _HTMLElement.prototype = HTMLElement.prototype;
    HTMLElement = _HTMLElement;
  }

  polyfill.load(function() {
    if (waitForWebcomponents) {
      console.log('delay event');
      polyfill.delayEvent();

      window.addEventListener('WebComponentsReady', function() {
        console.log('fire event');
        polyfill.fireEvent();
      });
    }
  });
})();
