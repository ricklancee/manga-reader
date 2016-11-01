// Util
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

window.addEventListener('load', _ => {
  loadScripts(window.polyfillsNeeded, _ => {
    if (window.waitForWebcomponents) {
      window.addEventListener('WebComponentsReady', function() {
        document.registerElement('manga-reader', MangaReader);
      });
      return;
    }

    document.registerElement('manga-reader', MangaReader);
  }, _ => {
    throw new Error('Failed to load polyfills');
  });
});
