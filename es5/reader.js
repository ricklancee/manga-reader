/**
 * MIT License
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

      this.data = this.getAttribute('data');
      this.pages = null;
      this.canvasEl = null;
      this.canvas = null;

      if (!this.data) {
        return;
      }

      // options
      this._fitscreen = this.hasAttribute('fitscreen') && this.getAttribute('fitscreen') !== 'false' || false;
      this._pagination = true;
      this._opacity = 0.025;

      this.currentPageIndex = 0;
      this.currentPanelIndex = 0;

      this.pageDimensions = null;
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
      this.pageOffsetY = 0;

      // Init
      this._createCanvas();

      // TODO: Show spinner?

      this._addEventListeners();

      // When data is loaded save it
      this._loadData().then(function (data) {
        _this2.pages = data;

        _this2._createPagination();

        var hashPagination = _this2._getPaginationFromHash();
        if (hashPagination) {
          _this2.currentPageIndex = hashPagination[0];
          _this2.currentPanelIndex = hashPagination[1];
        }

        _this2._setPage(_this2.currentPageIndex).then(function (_) {
          _this2._recalcPage();
          _this2._drawPanels(_this2.currentPanelIndex);
          _this2._setPaginationHash();
          _this2._setActivePagination();
          _this2._positionView();
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

      window.history.pushState({}, null, '#' + currentPage + '-' + currentPanel);
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
    key: '_recalcPage',
    value: function _recalcPage() {
      if (this._fitscreen) {
        this.fitscreen();
      } else if (this.pages[this.currentPageIndex].fitscreen) {
        this.fitscreen();
      } else {
        this.fitscreenOff();
      }

      var BCR = this.canvasEl.getBoundingClientRect();

      this.screenHeight = window.innerHeight;
      this.screenWidth = window.innerWidth;

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
      this.canvasEl.style.height = this.screenHeight + 'px';
      this.canvasEl.style.width = 'auto';
    }
  }, {
    key: 'fitscreenOff',
    value: function fitscreenOff() {
      this.canvasEl.style.height = '';
      this.canvasEl.style.width = '';
    }
  }, {
    key: '_loadData',
    value: function _loadData() {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        fetch(_this4.data).then(function (response) {
          return response.json();
        }).then(resolve).catch(reject);
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

      this.insertBefore(list, this.firstChild);

      this.lastChild.parentNode.insertBefore(list.cloneNode(true), this.lastChild.nextSibling);
    }
  }, {
    key: '_loadImage',
    value: function _loadImage(url) {
      return new Promise(function (resolve, reject) {
        var img = new Image();

        img.onload = function () {
          resolve(img);
        };

        img.onerror = function (_) {
          reject('failed to load image');
        };

        img.src = url;
      });
    }
  }, {
    key: '_setPage',
    value: function _setPage(index) {
      var _this5 = this;

      var imageUrl = this.pages[index].image;

      // Clear the canvas;
      this.canvas.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);

      return new Promise(function (resolve) {

        _this5._loadImage(imageUrl).then(function (image) {
          _this5.currentImage = image;
          _this5._drawPage(image);
          resolve();
        });
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

      for (var i = 0; i < len; i++) {
        this._drawPanel(i);
      }
    }
  }, {
    key: '_drawPanel',
    value: function _drawPanel(index) {
      var path = this.pages[this.currentPageIndex].panels[index].path.split(',');
      var len = path.length;

      this.canvas.save();
      this.canvas.beginPath();
      for (var i = 0; i < len; i++) {
        var coards = path[i].split(' ');

        var x = coards[0] * this.canvasEl.width / 100;
        var y = coards[1] * this.canvasEl.height / 100;

        if (len == 0) {
          this.canvas.moveTo(x, y);
        } else {
          this.canvas.lineTo(x, y);
        }
      }
      this.canvas.closePath();
      this.canvas.clip();

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

      this._drawPage(this.currentImage);
      this._drawPanels(this.currentPanelIndex);
      this._setPaginationHash();
      this._positionView();
    }
  }, {
    key: 'nextPage',
    value: function nextPage() {
      var _this6 = this;

      this.currentPageIndex++;
      this.currentPanelIndex = 0;

      if (this.currentPanelIndex > this.pages.length - 1) {
        this.currentPageIndex = this.pages.length - 1;
        console.log('last page');
        return;
      }

      this._setPage(this.currentPageIndex).then(function (_) {
        _this6._recalcPage();
        _this6._drawPanels(_this6.currentPanelIndex);
        _this6._setPaginationHash();
        _this6._setActivePagination();
        _this6._positionView();
      });
    }
  }, {
    key: 'previousPage',
    value: function previousPage() {
      var _this7 = this;

      this.currentPageIndex--;
      this.currentPanelIndex = this.pages[this.currentPageIndex].panels.length - 1;

      if (this.currentPanelIndex < 0) {
        this.currentPageIndex = 0;
        console.log('First Page');
        return;
      }

      this._setPage(this.currentPageIndex).then(function (_) {
        _this7._recalcPage();
        _this7._drawPanels(_this7.currentPanelIndex);
        _this7._setPaginationHash();
        _this7._setActivePagination();
        _this7._positionView();
      });
    }
  }, {
    key: '_positionView',
    value: function _positionView() {
      var currentPanel = this.pages[this.currentPageIndex].panels[this.currentPanelIndex];
      if (!currentPanel) {
        return;
      }
      var offsetY = this.pageDimensions.top - 15;
      var offsetX = this.pageDimensions.left - 15;
      var panelY = currentPanel.y * this.pageDimensions.height / 100 + offsetY;
      var panelX = currentPanel.x * this.pageDimensions.width / 100 + offsetX;

      window.scrollTo(panelX, panelY);
    }
  }]);

  return MangaReader;
}(HTMLElement);