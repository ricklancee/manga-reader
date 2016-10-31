'use strict';

class Reader {

    constructor (data) {
        this.viewerEl = document.querySelector('.viewer');
        this.viewBox = document.querySelector('.view-box');
        this.panel = document.querySelector('.viewer .panel');
        this.page = document.querySelector('.viewer .page');

        this.debug = false;
        this.fitScreen = false;

        this.pageDimensions = null;
        this.pageOffsetY = 0;
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;

        this.currentPageIndex = 0;
        this.currentPanelIndex = 0;
        this._setPageHash();

        this.pages = data;

        this._addEventListeners();

        this._loadImage(this.pages[this.currentPageIndex].image).then(_ => {
          if (this.fitScreen) {
            this.viewerEl.classList.add('fitscreen');
          }

          this._calculatePageDimensions();

          if (this.fitScreen) {
            this.viewerEl.style.width = this.pageDimensions.width + 'px';
          }

          this._drawPanel(this.currentPanelIndex);
          this._positionPageIfNeeded();

          if (this.debug) {
            this._drawDebugPanels();
          }

          // Display the panels after initial setup is complete
          this.page.classList.remove('hidden');
          this.panel.classList.remove('hidden');
        });
    }

    _loadImage(url) {
      return new Promise((resolve, reject) => {
        this.panel.src = url;
        this.page.src = url;

        this.panel.onload = function() {
          resolve();
        }
      });
    }

    _addEventListeners() {
      window.addEventListener('resize', this._recalc.bind(this));
      window.addEventListener('keydown', event => {
        if (event.keyCode === 39) { // right
          this._nextPanel();
        }
        if (event.keyCode === 37) { // left
          this._previousPanel();
        }
      });
    }

    _recalc() {
      this._calculatePageDimensions();
      if (this.fitScreen) {
        this.viewerEl.style.width = this.pageDimensions.width + 'px';
      }

      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
      this._positionPageIfNeeded();
      if (this.debug) {
        this._drawDebugPanels();
      }
    }

    _calculatePageDimensions() {
      this.pageDimensions = this.page.getBoundingClientRect();
    }

    _drawPanel(index) {
      const panel = this.pages[this.currentPageIndex].panels[index];

      const path = panel.path;

      this.panel.setAttribute('style',
        `-webkit-clip-path: polygon(${path}); clip-path: polygon(${path});
        clip-path: polygon(${path}); clip-path: polygon(${path});`
      );
    }

    _drawDebugPanels() {
      document.querySelectorAll('.debug-box').forEach(node => node.remove());

      const box = document.createElement('div');
      box.classList.add('debug-box');

      const panels = this.pages[this.currentPageIndex].panels;
      for (var i = 0; i < panels.length; i++) {
        const clone = box.cloneNode();

        // 15 = page margin
        clone.style.left = (panels[i].x * this.pageDimensions.width / 100) + 15 + 'px';
        clone.style.top = (panels[i].y * this.pageDimensions.height / 100) + this.pageDimensions.top + 'px';
        clone.style.width = panels[i].width * this.pageDimensions.width / 100 + 'px';
        clone.style.height = panels[i].height * this.pageDimensions.height / 100 + 'px';

        this.viewerEl.appendChild(clone);
      }
    }

    _positionPageIfNeeded() {
      const panel = this.pages[this.currentPageIndex].panels[this.currentPanelIndex];

      // Figure out the Panel position on the page in pixels.
      const panelY = panel.y * this.pageDimensions.height / 100;
      const panelX = panel.x * this.pageDimensions.width / 100;
      const panelWidth = panel.width * this.pageDimensions.width / 100;
      const panelHeight = panel.height * this.pageDimensions.height / 100;

      // Check if panel is off screen.
      if ((panelHeight + panelY) - this.pageOffsetY > this.screenHeight - this.pageDimensions.top) {
        // calculate where to scoll
        console.log('offscreen');
        this.pageOffsetY = panelY;
      }

      if (panelY < this.pageOffsetY) {
        // reset scroll to panel
        this.pageOffsetY = panelY;
      }

      this.viewerEl.scrollTop = this.pageOffsetY;
    }

    _setPageHash() {
      let currentPage = this.currentPageIndex + 1;
      let currentPanel = this.currentPanelIndex + 1;

      if (currentPage < 10)
        currentPage = '0' + currentPage;

      if (currentPanel < 10)
        currentPanel = '0' + currentPanel;

      window.location.hash = currentPage + '-' + currentPanel;
    }

    _nextPanel() {
      let index = this.currentPanelIndex + 1;

      if (index !== this.pages[this.currentPageIndex].panels.length) {
        const clone = this.panel.cloneNode();
        this.viewBox.appendChild(clone);
      }

      if (index > this.pages[this.currentPageIndex].panels.length - 1) {
        // last slide

        if (this.currentPageIndex < this.pages.length - 1) {
          console.log('goToNextPage');
          this._nextPage();
          return;
        }

        console.log('last slide');
        index = this.pages[this.currentPageIndex].panels.length - 1;
      }


      this.currentPanelIndex = index;
      this._setPageHash();
      this._drawPanel(index);
      this._positionPageIfNeeded();
    }

    _previousPanel() {
      let index = this.currentPanelIndex - 1;

      if (index >= 0) {
        this.viewBox.lastChild.remove();
      }

      if (index < 0) {

        if (this.currentPageIndex > 0) {
          console.log('go to previous page');
          this._previousPage();
          return;

        }

        console.log('first slide');
        index = 0;
      }

      this.currentPanelIndex = index;
      this._setPageHash();
      this._drawPanel(index);
      this._positionPageIfNeeded();
    }

    _nextPage() {
      this.currentPageIndex++;
      this.currentPanelIndex = 0;

      if (this.currentPageIndex > this.pages.length - 1)
        this.currentPageIndex = this.pages.length - 1;

      this._setPageHash();
      this._loadPage(this.currentPageIndex);
    }

    _previousPage() {
      this.currentPageIndex--;
      this.currentPanelIndex = 0;

      if (this.currentPageIndex == 0)
        this.currentPageIndex = 0;

      this._setPageHash();
      this._loadPage(this.currentPageIndex);
    }

    _loadPage(index) {
      this.viewerEl.scrollTop = 0;

      this.page.classList.add('hidden');
      this.panel.classList.add('hidden');

      this.viewBox.innerHTML = '';

      this.panel.removeAttribute('style');
      this.page.removeAttribute('style');

      this.page.src = '';
      this.panel.src = '';
      this.viewBox.appendChild(this.page);
      this.viewBox.appendChild(this.panel);

      this._loadImage(this.pages[index].image).then(_ => {
        this._calculatePageDimensions();

        if (this.fitScreen) {
          this.viewerEl.style.width = this.pageDimensions.width + 'px';
        }

        this._drawPanel(0);
        this._positionPageIfNeeded();

        if (this.debug) {
          this._drawDebugPanels();
        }

        this.page.classList.remove('hidden');
        this.panel.classList.remove('hidden');
      });
    }
}
