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

class MangaReader extends HTMLElement {

    createdCallback() {
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

        this._loadData(this.dataFileUri).then(data => {
            this.data = data;
            this.pages = this.data.pages;

            this._createPagination();

            // Check if there is a current page and panel pagination
            // in the location.hash.
            const hashPagination = this._getPaginationFromHash();
            if (hashPagination) {
                this.currentPageIndex = hashPagination[0];
                this.currentPanelIndex = hashPagination[1];
            }

            this._setPage(this.currentPageIndex)
                .then(_ => {
                    this._drawPanels(this.currentPanelIndex);
                    this._setPaginationHash();
                    this._setActivePagination();
                    this._positionView();

                    if (this._preloadPages) {
                        this._preloadNextPage();
                    }

                    // Clear the timer; If the above code executed below 300ms
                    // the user won't see a loading spinner. Why? Because <300ms
                    // can be seen as 'instant' for the user. Showing a spinner
                    // might feel 'off'.
                    if (this._loadingTimer) {
                        window.clearTimeout(this._loadingTimer);
                        this._hideLoading();
                        this._loadingTimer = null;
                    }

                    // Dispatch the 'loaded' event on the element
                    // the user might want to do something when the reader
                    // has been loaded.
                    this.dispatchEvent(this.loadedEvent);
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

        window.history.replaceState({}, null, '#' + currentPage + '-' + currentPanel);
    }

    _setActivePagination() {
        Array.from(this.querySelectorAll('.pagination a'))
            .forEach(link => link.classList.remove('active'));
        Array.from(this.querySelectorAll('.pagination a[data-index="' + this.currentPageIndex + '"]'))
            .forEach(link => link.classList.add('active'));
    }

    _addEventListeners() {
        window.addEventListener('resize', _ => {
            this._recalcPage();
        });

        this.canvasEl.addEventListener('click', event => {
            this.nextPanel();
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

        window.addEventListener('hashchange', event => {
            window.location.reload();
        });
    }

    _showLoading() {
        const spinner = document.createElement('div');
        spinner.classList.add('manga-reader__spinner');
        this.appendChild(spinner);
    }

    _hideLoading() {
        const spinner = document.querySelector('.manga-reader__spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    _recalcPage() {
        this.screenHeight = window.innerHeight;
        this.screenWidth = window.innerWidth;

        const BCR = this.canvasEl.getBoundingClientRect();
        this.pageDimensions = {
            top: BCR.top + window.scrollY,
            left: BCR.left + window.scrollX,
            width: BCR.width,
            height: BCR.height,
        };
    }

    fitscreen(on = true) {
        if (on) {
            this.canvasEl.style.height = this.screenHeight + 'px';
            this.canvasEl.style.width = 'auto';
        } else {
            this.canvasEl.style.height = '';
            this.canvasEl.style.width = '';
        }
    }

    _loadData(uri) {
        return fetch(uri)
            .then(response => response.json())
    }

    _loadImage(url) {

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

        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                resolve(img);
            };

            img.onerror = _ => {
                reject(`Failed to load image with uri: "${url}"`);
            };

            img.src = url;
        });
    }

    _preloadNextPage() {
        // Currently we only pre load next pages, so there
        // is no need to check if we are at the first page, only
        // the last.
        if (this.currentPageIndex == this.pages.length - 1) {
            return;
        }

        const nextPage = this.currentPageIndex + 1;
        const nextPageImage = this.pages[nextPage].image;

        this._loadImage(nextPageImage).then(_ => {
            console.log('preloaded page: ' + (nextPage + 1));
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
            a.href = '#' + page + '-01';

            li.appendChild(a);
            list.appendChild(li);
        }

        // Insert pagination as the first and last children of
        // the reader.
        this.insertBefore(list, this.firstChild);
        this.appendChild(list.cloneNode(true));
    }

    _setPage(index) {
        const imageUrl = this.pages[index].image;

        // Clear the canvas;
        this.canvas.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);

        return this._loadImage(imageUrl)
            .then(image => {
                this.currentImage = image;
                this._drawPage(image);
                this._recalcPage();
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

        // Because of the way canvas works we need all panels up
        // to and including the desired one.
        for (var i = 0; i < len; i++) {
            this._drawPanel(i);
        }
    }

    _drawPanel(index) {
        // The path needs to be split in order to work with it.
        const path = this.pages[this.currentPageIndex].panels[index].path.split(',');
        const len = path.length;

        this.canvas.save();

        // First we draw a clipping path for the panel
        this.canvas.beginPath();
        for (var i = 0; i < len; i++) {
            const coards = path[i].trim().split(' ');

            // The svg path's coardinates commands need to be in pixels
            // instead of percentages. Svg path do not work with %s.
            const x = coards[0] * this.canvasEl.width / 100;
            const y = coards[1] * this.canvasEl.height / 100;

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

        // We need to redraw the entire page and all panels up to the
        // next one.
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

        // This is duplication but not enough to refactor... propably.
        this._drawPage(this.currentImage);
        this._drawPanels(this.currentPanelIndex);
        this._setPaginationHash();
        this._positionView();
    }

    nextPage() {
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

        return this._setPage(this.currentPageIndex).then(_ => {
            if (this._loadingTimer) {
                window.clearTimeout(this._loadingTimer);
                this._loadingTimer = null;
                this._hideLoading();
            }

            this._drawPanels(this.currentPanelIndex);
            this._setPaginationHash();
            this._setActivePagination();
            this._positionView();

            if (this._preloadPages) {
                this._preloadNextPage();
            }
        });
    }

    previousPage() {
        if (this.currentPageIndex === 0) {
            return Promise.resolve();
        }

        this.currentPageIndex--;
        this.currentPanelIndex = this.pages[this.currentPageIndex].panels.length - 1;

        // The previous page is most likely in the cache
        // so we don't need to preload or show a spinner.
        return this._setPage(this.currentPageIndex).then(_ => {
            this._drawPanels(this.currentPanelIndex);
            this._setPaginationHash();
            this._setActivePagination();
            this._positionView();
        });
    }

    _positionView() {
        const panel = this.pages[this.currentPageIndex].panels[this.currentPanelIndex];

        if (!panel) {
            return;
        }

        this._recalcPage();

        const offsetY = this.pageDimensions.top - 15;
        const offsetX = this.pageDimensions.left - 15;
        const panelY = (panel.y * this.pageDimensions.height / 100) + offsetY;
        const panelX = (panel.x * this.pageDimensions.width / 100) + offsetX;

        const panelHeight = panel.height * this.pageDimensions.height / 100;

        if (this._fitscreen) {
            this.fitscreen(true);
        } else if (this.pages[this.currentPageIndex].fitscreen) {
            this.fitscreen(true);
        } else if (this._fitPanels && panelHeight > this.screenHeight) {
            console.log('auto resize');
            const desiredHeight = this.screenHeight;
            const resizeTo = this.pageDimensions.height * ((this.screenHeight - this.pageDimensions.top) / panelHeight);
            this.canvasEl.style.height = resizeTo + 'px';
            this.canvasEl.style.width = 'auto';
        } else {
            this.canvasEl.style.height = '';
            this.canvasEl.style.width = '';
        }

        this._recalcPage();
        window.scrollTo(panelX, panelY);
    }
}