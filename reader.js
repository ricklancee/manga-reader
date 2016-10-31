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

class MangaReader extends HTMLElement {

    createdCallback() {
        this.data = this.getAttribute('data');
        this.pages = null;
        this.canvasEl = null;
        this.canvas = null;

        if (!this.data) {
          return;
        }

        // options
        this._fitscreen = (this.hasAttribute('fitscreen') && this.getAttribute('fitscreen') !== 'false')
          || false;
        this._pagination = true;
        this._opacity = 0.05;

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
        this._loadData().then(data => {
          this.pages = data;

          this._createPagination();

          const hashPagination = this._getPaginationFromHash();
          if (hashPagination) {
            this.currentPageIndex = hashPagination[0];
            this.currentPanelIndex = hashPagination[1];
          }

          this._setPage(this.currentPageIndex)
            .then(_ => {
              this._recalcPage();
              this._drawPanels(this.currentPanelIndex);
              this._setPaginationHash();
              this._setActivePagination();
              this._positionView();
            });
        });
    }

    _getPaginationFromHash() {
      let match = window.location.hash.match(/(\d+)-(\d+)/);

      if (!match)
        return false;

      const pageIndex = Math.min(
        Math.max(parseInt(parseInt(match[1]) - 1), 0), this.pages.length - 1);

      const maxPanels = this.pages[pageIndex].panels.length - 1;
      const panelIndex = Math.min(
        Math.max(parseInt(parseInt(match[2]) - 1), 0), maxPanels);

      return [pageIndex, panelIndex];
    }

    _setPaginationHash() {
      let currentPage = this.currentPageIndex + 1;
      let currentPanel = this.currentPanelIndex + 1;

      if (currentPage < 10)
        currentPage = '0' + currentPage;

      if (currentPanel < 10)
        currentPanel = '0' + currentPanel;

      window.location.hash = currentPage + '-' + currentPanel;
    }

    _setActivePagination() {
      this.querySelectorAll('.pagination a').forEach(link => link.classList.remove('active'));
      this.querySelectorAll('.pagination a[data-index="'+this.currentPageIndex+'"]')
      .forEach(link => link.classList.add('active'));
    }

    _addEventListeners() {
      window.addEventListener('resize', _ => {
        this._recalcPage();
      });

      window.addEventListener('keydown', event => {
        if (event.keyCode === 39) { // right
          this.nextPanel();
          event.preventDefault();
        }
        if (event.keyCode === 37) { // left
          this.previousPanel();
          event.preventDefault();
        }
      });

      this.addEventListener('click', event => {
        if (event.target.classList.contains('pagination-link')) {
          window.location.reload();
        }
      });
    }

    _recalcPage() {
      if (this._fitscreen) {
        this.fitscreen();
      } else if (this.pages[this.currentPageIndex].fitscreen) {
        this.fitscreen();
      } else {
        this.fitscreenOff();
      }

      const BCR = this.canvasEl.getBoundingClientRect();

      this.screenHeight = window.innerHeight;
      this.screenWidth = window.innerWidth;

      this.pageDimensions = {
        top: BCR.top + window.scrollY,
        left: BCR.left + window.scrollX,
        width: BCR.width,
        height: BCR.height,
      };
    }

    fitscreen() {
      this.canvasEl.style.height = this.screenHeight + 'px';
      this.canvasEl.style.width = 'auto';
    }

    fitscreenOff() {
      this.canvasEl.style.height = '';
      this.canvasEl.style.width = '';
    }

    _loadData() {
      return new Promise((resolve, reject) => {
        fetch(this.data)
          .then(response => { return response.json() })
          .then(resolve)
          .catch(reject)
      });
    }

    _createCanvas() {
      if (this.canvasEl) {
        return;
      }

      const canvas = document.createElement('canvas');
      this.canvasEl = canvas;
      this.canvas = canvas.getContext('2d');
      this.appendChild(canvas);
    }

    _createPagination() {
      const list = document.createElement('ol');
      list.classList.add('pagination');

      const maxPages = this.pages.length;

      for (var i = 0; i < maxPages; i++) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        let page = (i + 1 < 10) ? '0' + (i + 1) : i + 1;
        a.innerHTML = page;
        a.classList.add('pagination-link');
        a.setAttribute('data-index', i);
        a.href = '#'+page+'-01';

        li.appendChild(a);
        list.appendChild(li);
      }

      this.insertBefore(list, this.firstChild);

      this.lastChild.parentNode.insertBefore(list.cloneNode(true), this.lastChild.nextSibling);
    }

    _loadImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          resolve(img);
        };

        img.onerror = _ => {
          reject('failed to load image');
        };

        img.src = url;
      });
    }

    _setPage(index) {
        const imageUrl = this.pages[index].image;

        // Clear the canvas;
        this.canvas.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);

        return new Promise(resolve => {

          this._loadImage(imageUrl)
            .then(image => {
              this.currentImage = image;
              this._drawPage(image);
              resolve();
            });
        });
    }

    _drawPage(image) {
      this.canvas.save();
      this.canvasEl.width = image.width;
      this.canvasEl.height = image.height;
      this.canvas.globalAlpha = this._opacity;
      this.canvas.drawImage(image, 0, 0);
      this.canvas.globalAlpha = 1;
      this.canvas.restore();
    }

    _drawPanels(to) {
      const max = this.pages[this.currentPageIndex].panels.length;
      const len = Math.min(Math.max(parseInt(to + 1), 0), max);

      for (var i = 0; i < len; i++) {
        this._drawPanel(i);
      }
    }

    _drawPanel(index) {
      const path = this.pages[this.currentPageIndex].panels[index].path.split(',');
      const len = path.length;

      this.canvas.save();
      this.canvas.beginPath();
      for (var i = 0; i < len; i++) {
        const coards = path[i].split(' ');

        const x = coards[0] * this.canvasEl.width / 100;
        const y = coards[1] * this.canvasEl.height / 100;

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

    nextPanel() {
      const max = this.pages[this.currentPageIndex].panels.length - 1;

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

    previousPanel() {
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

    nextPage() {
      this.currentPageIndex++;
      this.currentPanelIndex = 0;

      if (this.currentPanelIndex > this.pages.length - 1) {
        this.currentPageIndex = this.pages.length - 1;
        console.log('last page');
        return;
      }

      this._setPage(this.currentPageIndex).then(_ => {
        this._recalcPage();
        this._drawPanels(this.currentPanelIndex);
        this._setPaginationHash();
        this._setActivePagination();
        this._positionView();
      });
    }

    previousPage() {
      this.currentPageIndex--;
      this.currentPanelIndex = this.pages[this.currentPageIndex].panels.length - 1;

      if (this.currentPanelIndex < 0) {
        this.currentPageIndex = 0;
        console.log('First Page');
        return;
      }

      this._setPage(this.currentPageIndex).then(_ => {
        this._recalcPage();
        this._drawPanels(this.currentPanelIndex);
        this._setPaginationHash();
        this._setActivePagination();
        this._positionView();
      });
    }

    _positionView() {
      const currentPanel = this.pages[this.currentPageIndex].panels[this.currentPanelIndex];

      const offsetY = this.pageDimensions.top - 15;
      const offsetX = this.pageDimensions.left - 15;
      const panelY = (currentPanel.y * this.pageDimensions.height / 100) + offsetY;
      const panelX = (currentPanel.x * this.pageDimensions.width / 100) + offsetX;

      window.scrollTo(panelX, panelY);
    }
}
