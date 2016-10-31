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

window.addEventListener('load', _ => new Reader([
  {
    image: 'images/one/01.jpg',
    panels: [
      {x: 79.15, y: 0, width: 20.85, height: 47.32, path: "79.42% 0%,100% 0%,100% 46.49%,93.43% 46.4%,93.43% 47.32%,86.32% 47.05%,86.32% 46.4%,79.15% 45.85%"},
      {x: 78.75, y: 46.68, width: 21.25, height: 53.32, path: "79.28% 48.06%,94.56% 47.51%,100% 46.68%,100% 100%,78.75% 100%"},
       {x: 0, y: 0, width: 85.19, height: 100, path: "0% 0%,79.42% 0%,79.15% 46.12%,85.19% 46.58%,85.06% 48.16%,79.15% 48.25%,78.75% 100%,0% 100%"}
    ]
  },
  {
    image: 'images/one/02.jpg',
    panels: [
      {x: 6.07, y: 0, width: 93.93, height: 34.05, path: "6.41% 0%,100% 0%,100% 34.05%,6.07% 34.01%"},
      {x: 5.85, y: 35.08, width: 89.1, height: 26.26, path: "6.19% 35.27%,94.95% 35.08%,93.87% 61.34%,5.85% 60.95%"},
      {x: 38.2, y: 62.17, width: 61.8, height: 37.83, path: "38.82% 62.17%,100% 62.77%,100% 100%,38.2% 100%"},
      {x: 5.9, y: 63.28, width: 32.47, height: 36.72, path: "6.47% 63.28%,38.37% 63.44%,38.08% 100%,5.9% 100%"}
    ]
  },
  {
    image: 'images/one/03.jpg',
    panels: [
      {x: 0, y: 0, width: 99.8, height: 100, path: "0% 0%,94.03% 0%,93.96% 96.04%,99.8% 96.22%,99.67% 100%,0% 100%"}
    ]
  },
  {
    image: 'images/one/04.jpg',
    panels: [
      {x: 5.84, y: 0, width: 94.16, height: 38.18, path: "5.84% 0%,100% 0%,100% 36.76%,49.67% 36.63%,49.67% 38.18%,5.97% 37.95%"},
      {x: 50, y: 36.72, width: 50, height: 27.95, path: "50% 36.72%,100% 37.04%,100% 64.57%,52.36% 64.67%"},
      {x: 53.35, y: 64.71, width: 46.65, height: 35.29, path: "53.35% 64.71%,100% 64.76%,100% 100%,55.45% 100%"},
      {x: 5.58, y: 38.22, width: 49.14, height: 61.78, path: "6.17% 38.22%,28.41% 38.5%,28.74% 39.64%,50.2% 39.87%,54.72% 100%,5.58% 100%"}
    ]
  }
]));
