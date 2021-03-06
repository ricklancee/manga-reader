/**
 * @license MIT License
 *
 * Copyright (c) 2016 Rick Lancee @ricklancee
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MangaReader = function (_HTMLElement) {
  _inherits(MangaReader, _HTMLElement);

  function MangaReader() {
    _classCallCheck(this, MangaReader);

    return _possibleConstructorReturn(this, (MangaReader.__proto__ || Object.getPrototypeOf(MangaReader)).apply(this, arguments));
  }

  _createClass(MangaReader, [{
    key: 'createdCallback',
    value: function createdCallback() {
      var _this2 = this;

      this.dataFileUri = this.getAttribute('data');

      if (!this.dataFileUri) {
        return;
      }

      this.basePath = this.dataFileUri.substring(0, this.dataFileUri.lastIndexOf('data.json'));

      this.data = null;
      this.pages = null;
      this.currentPageIndex = 0;
      this.currentPanelIndex = 0;

      // Elements
      this.canvasEl = null;
      this.canvas = null;

      // options
      this._fitscreen = false;
      this._opacity = 0.025;
      this._fitPanels = false;
      this._preloadPages = true;
      this._appendBasePath = true;

      // Dimensions
      this.pageDimensions = null;
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;

      // Events
      this.loadedEvent = new CustomEvent('loaded');

      this._createCanvas();
      this._addEventListeners();

      // Start a loadingSpinner after 300 milliseconds
      // to avoid an loader popping up even if the page
      // renders fast enogh.
      this._loadingTimer = window.setTimeout(this._showLoading.bind(this), 300);

      this._loadData(this.dataFileUri).then(function (data) {
        _this2.data = data;
        _this2.pages = _this2.data.pages;

        _this2._createPagination();

        // Check if there is a current page and panel pagination
        // in the location.hash.
        var hashPagination = _this2._getPaginationFromHash();
        if (hashPagination) {
          _this2.currentPageIndex = hashPagination[0];
          _this2.currentPanelIndex = hashPagination[1];
        }

        _this2._setPage(_this2.currentPageIndex).then(function (_) {
          _this2._drawPanels(_this2.currentPanelIndex);
          _this2._setPaginationHash();
          _this2._setActivePagination();
          _this2._positionView();

          if (_this2._preloadPages) {
            _this2._preloadNextPage();
          }

          // Clear the timer; If the above code executed below 300ms
          // the user won't see a loading spinner. Why? Because <300ms
          // can be seen as 'instant' for the user. Showing a spinner
          // might feel 'off'.
          if (_this2._loadingTimer) {
            window.clearTimeout(_this2._loadingTimer);
            _this2._hideLoading();
            _this2._loadingTimer = null;
          }

          // Dispatch the 'loaded' event on the element
          // the user might want to do something when the reader
          // has been loaded.
          _this2.dispatchEvent(_this2.loadedEvent);
        });
      });
    }
  }, {
    key: '_getPaginationFromHash',
    value: function _getPaginationFromHash() {
      var match = window.location.hash.match(/(\d+)-(\d+)/);

      if (!match) return false;

      var pageIndex = Math.min(Math.max(parseInt(parseInt(match[1]) - 1), 0), this.pages.length - 1);

      var maxPanels = this.pages[pageIndex].panels.length - 1;
      var panelIndex = Math.min(Math.max(parseInt(parseInt(match[2]) - 1), 0), maxPanels);

      return [pageIndex, panelIndex];
    }
  }, {
    key: '_setPaginationHash',
    value: function _setPaginationHash() {
      var currentPage = this.currentPageIndex + 1;
      var currentPanel = this.currentPanelIndex + 1;

      if (currentPage < 10) currentPage = '0' + currentPage;

      if (currentPanel < 10) currentPanel = '0' + currentPanel;

      window.history.replaceState({}, null, '#' + currentPage + '-' + currentPanel);
    }
  }, {
    key: '_setActivePagination',
    value: function _setActivePagination() {
      Array.from(this.querySelectorAll('.pagination a')).forEach(function (link) {
        return link.classList.remove('active');
      });
      Array.from(this.querySelectorAll('.pagination a[data-index="' + this.currentPageIndex + '"]')).forEach(function (link) {
        return link.classList.add('active');
      });
    }
  }, {
    key: '_addEventListeners',
    value: function _addEventListeners() {
      var _this3 = this;

      window.addEventListener('resize', function (_) {
        _this3._recalcPage();
      });

      this.canvasEl.addEventListener('click', function (event) {
        _this3.nextPanel();
      });

      window.addEventListener('keydown', function (event) {
        if (event.keyCode === 39) {
          // right
          _this3.nextPanel();
          event.preventDefault();
        }
        if (event.keyCode === 37) {
          // left
          _this3.previousPanel();
          event.preventDefault();
        }
      });

      window.addEventListener('hashchange', function (event) {
        window.location.reload();
      });
    }
  }, {
    key: '_showLoading',
    value: function _showLoading() {
      var spinner = document.createElement('div');
      spinner.classList.add('manga-reader__spinner');
      this.appendChild(spinner);
    }
  }, {
    key: '_hideLoading',
    value: function _hideLoading() {
      var spinner = document.querySelector('.manga-reader__spinner');
      if (spinner) {
        spinner.remove();
      }
    }
  }, {
    key: '_recalcPage',
    value: function _recalcPage() {
      this.screenHeight = window.innerHeight;
      this.screenWidth = window.innerWidth;

      var BCR = this.canvasEl.getBoundingClientRect();
      this.pageDimensions = {
        top: BCR.top + window.scrollY,
        left: BCR.left + window.scrollX,
        width: BCR.width,
        height: BCR.height
      };
    }
  }, {
    key: 'fitscreen',
    value: function fitscreen() {
      var on = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (on) {
        this.canvasEl.style.height = this.screenHeight + 'px';
        this.canvasEl.style.width = 'auto';
      } else {
        this.canvasEl.style.height = '';
        this.canvasEl.style.width = '';
      }
    }
  }, {
    key: '_loadData',
    value: function _loadData(uri) {
      return fetch(uri).then(function (response) {
        return response.json();
      });
    }
  }, {
    key: '_loadImage',
    value: function _loadImage(url) {

      // If the to be loaded image url is full url
      // load the image from there, otherwise use the url
      // relative to the data file.
      try {
        new URL(url);
      } catch (e) {
        if (this._appendBasePath) {
          url = this.basePath + url;
        }
      }

      return new Promise(function (resolve, reject) {
        var img = new Image();

        img.onload = function () {
          resolve(img);
        };

        img.onerror = function (_) {
          reject('Failed to load image with uri: "' + url + '"');
        };

        img.src = url;
      });
    }
  }, {
    key: '_preloadNextPage',
    value: function _preloadNextPage() {
      // Currently we only pre load next pages, so there
      // is no need to check if we are at the first page, only
      // the last.
      if (this.currentPageIndex == this.pages.length - 1) {
        return;
      }

      var nextPage = this.currentPageIndex + 1;
      var nextPageImage = this.pages[nextPage].image;

      this._loadImage(nextPageImage).then(function (_) {
        console.log('preloaded page: ' + (nextPage + 1));
      });
    }
  }, {
    key: '_createCanvas',
    value: function _createCanvas() {
      if (this.canvasEl) {
        return;
      }

      var canvas = document.createElement('canvas');
      this.canvasEl = canvas;
      this.canvas = canvas.getContext('2d');
      this.appendChild(canvas);
    }
  }, {
    key: '_createPagination',
    value: function _createPagination() {
      var list = document.createElement('ol');
      list.classList.add('pagination');

      var maxPages = this.pages.length;

      for (var i = 0; i < maxPages; i++) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        var page = i + 1 < 10 ? '0' + (i + 1) : i + 1;
        a.innerHTML = page;
        a.classList.add('pagination-link');
        a.setAttribute('data-index', i);
        a.href = '#' + page + '-01';

        li.appendChild(a);
        list.appendChild(li);
      }

      // Insert pagination as the first and last children of
      // the reader.
      this.insertBefore(list, this.firstChild);
      this.appendChild(list.cloneNode(true));
    }
  }, {
    key: '_setPage',
    value: function _setPage(index) {
      var _this4 = this;

      var imageUrl = this.pages[index].image;

      // Clear the canvas;
      this.canvas.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);

      return this._loadImage(imageUrl).then(function (image) {
        _this4.currentImage = image;
        _this4._drawPage(image);
        _this4._recalcPage();
      });
    }
  }, {
    key: '_drawPage',
    value: function _drawPage(image) {
      this.canvas.save();
      this.canvasEl.width = image.width;
      this.canvasEl.height = image.height;
      this.canvas.globalAlpha = this._opacity;
      this.canvas.drawImage(image, 0, 0);
      this.canvas.globalAlpha = 1;
      this.canvas.restore();
    }
  }, {
    key: '_drawPanels',
    value: function _drawPanels(to) {
      var max = this.pages[this.currentPageIndex].panels.length;
      var len = Math.min(Math.max(parseInt(to + 1), 0), max);

      // Because of the way canvas works we need all panels up
      // to and including the desired one.
      for (var i = 0; i < len; i++) {
        this._drawPanel(i);
      }
    }
  }, {
    key: '_drawPanel',
    value: function _drawPanel(index) {
      // The path needs to be split in order to work with it.
      var path = this.pages[this.currentPageIndex].panels[index].path.split(',');
      var len = path.length;

      this.canvas.save();

      // First we draw a clipping path for the panel
      this.canvas.beginPath();
      for (var i = 0; i < len; i++) {
        var coards = path[i].trim().split(' ');

        // The svg path's coardinates commands need to be in pixels
        // instead of percentages. Svg path do not work with %s.
        var x = coards[0] * this.canvasEl.width / 100;
        var y = coards[1] * this.canvasEl.height / 100;

        // The first element in the path needs to
        // be the M(ove) command/
        if (len == 0) {
          this.canvas.moveTo(x, y);
        } else {
          this.canvas.lineTo(x, y);
        }
      }
      this.canvas.closePath();
      this.canvas.clip();

      // And draw the image, which clipped by the clipping path.
      this.canvas.drawImage(this.currentImage, 0, 0);

      this.canvas.restore();
    }
  }, {
    key: 'nextPanel',
    value: function nextPanel() {
      var max = this.pages[this.currentPageIndex].panels.length - 1;

      this.currentPanelIndex++;
      if (this.currentPanelIndex > max) {

        if (this.currentPageIndex < this.pages.length - 1) {
          this.nextPage();
          console.log('Go to next page');
          return;
        }

        console.log('Last panel');
        this.currentPanelIndex = max;
        return;
      }

      // We need to redraw the entire page and all panels up to the
      // next one.
      this._drawPage(this.currentImage);
      this._drawPanels(this.currentPanelIndex);
      this._setPaginationHash();
      this._positionView();
    }
  }, {
    key: 'previousPanel',
    value: function previousPanel() {
      this.currentPanelIndex--;

      if (this.currentPanelIndex < 0) {

        if (this.currentPageIndex > 0) {
          this.previousPage();
          console.log('go to previous page');
          return;
        }

        console.log('First panel');
        this.currentPanelIndex = 0;
        return;
      }

      // This is duplication but not enough to refactor... propably.
      this._drawPage(this.currentImage);
      this._drawPanels(this.currentPanelIndex);
      this._setPaginationHash();
      this._positionView();
    }
  }, {
    key: 'nextPage',
    value: function nextPage() {
      var _this5 = this;

      // If we have reached the end return an empty promise
      // because it's 'then-able'.
      if (this.currentPageIndex === this.pages.length - 1) {
        return Promise.resolve();
      }

      this.currentPageIndex++;
      this.currentPanelIndex = 0;

      // Show a loading spinner if it takes too long.
      // Pages should have been preloaded if the option is set
      // but if it still takes too long then show a spinner.
      this._loadingTimer = window.setTimeout(this._showLoading.bind(this), 300);

      return this._setPage(this.currentPageIndex).then(function (_) {
        if (_this5._loadingTimer) {
          window.clearTimeout(_this5._loadingTimer);
          _this5._loadingTimer = null;
          _this5._hideLoading();
        }

        _this5._drawPanels(_this5.currentPanelIndex);
        _this5._setPaginationHash();
        _this5._setActivePagination();
        _this5._positionView();

        if (_this5._preloadPages) {
          _this5._preloadNextPage();
        }
      });
    }
  }, {
    key: 'previousPage',
    value: function previousPage() {
      var _this6 = this;

      if (this.currentPageIndex === 0) {
        return Promise.resolve();
      }

      this.currentPageIndex--;
      this.currentPanelIndex = this.pages[this.currentPageIndex].panels.length - 1;

      // The previous page is most likely in the cache
      // so we don't need to preload or show a spinner.
      return this._setPage(this.currentPageIndex).then(function (_) {
        _this6._drawPanels(_this6.currentPanelIndex);
        _this6._setPaginationHash();
        _this6._setActivePagination();
        _this6._positionView();
      });
    }
  }, {
    key: '_positionView',
    value: function _positionView() {
      var panel = this.pages[this.currentPageIndex].panels[this.currentPanelIndex];

      if (!panel) {
        return;
      }

      this._recalcPage();

      var offsetY = this.pageDimensions.top - 15;
      var offsetX = this.pageDimensions.left - 15;
      var panelY = panel.y * this.pageDimensions.height / 100 + offsetY;
      var panelX = panel.x * this.pageDimensions.width / 100 + offsetX;

      var panelHeight = panel.height * this.pageDimensions.height / 100;

      if (this._fitscreen) {
        this.fitscreen(true);
      } else if (this.pages[this.currentPageIndex].fitscreen) {
        this.fitscreen(true);
      } else if (this._fitPanels && panelHeight > this.screenHeight) {
        console.log('auto resize');
        var desiredHeight = this.screenHeight;
        var resizeTo = this.pageDimensions.height * ((this.screenHeight - this.pageDimensions.top) / panelHeight);
        this.canvasEl.style.height = resizeTo + 'px';
        this.canvasEl.style.width = 'auto';
      } else {
        this.canvasEl.style.height = '';
        this.canvasEl.style.width = '';
      }

      this._recalcPage();
      window.scrollTo(panelX, panelY);
    }
  }]);

  return MangaReader;
}(HTMLElement);