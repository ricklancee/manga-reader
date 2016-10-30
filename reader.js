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
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;

        this.currentPageIndex = 0;
        this.currentPanelIndex = 0;
        this.pageOffsetY = 0;

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

        console.log(panels[i].x * this.pageDimensions.width / 100);

        clone.style.left = panels[i].x * this.pageDimensions.width / 100 + 'px';
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
      this._drawPanel(index);
      this._positionPageIfNeeded();
    }

    _nextPage() {
      this.currentPageIndex++;
      this.currentPanelIndex = 0;

      if (this.currentPageIndex > this.pages.length - 1)
        this.currentPageIndex = this.pages.length - 1;

      this._loadPage(this.currentPageIndex);
    }

    _previousPage() {
      this.currentPageIndex--;
      this.currentPanelIndex = 0;

      if (this.currentPageIndex == 0)
        this.currentPageIndex = 0;

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
    image: 'images/manga/01.jpg',
    panels: [
      {
        x: 0,
        y: 0,
        width: 95,
        height: 28,
        path: '0% 0%,95.92% 0.04%,95.58% 28.48%,33.67% 27.58%,32.86% 27.04%,31.66% 25.74%,29.38% 24.27%,26.84% 23.24%,25.7% 23.24%,25.03% 23.06%,23.29% 22.65%,21.55% 22.61%,19.48% 22.7%,17.27% 22.97%,15.19% 23.42%,11.85% 24.54%,9.1% 27.04%,0% 27.13%'
      },
      {
        x: 52,
        y: 29,
        width: 43,
        height: 37,
        path: '52.88% 28.74%,86.81% 29.1%,94.71% 28.92%,95.98% 32.86%,94.91% 65.91%,86.41% 65.82%,85.74% 65.59%,85.68% 65.28%,84.61% 64.2%,82.2% 62.82%,78.78% 62.73%,77.58% 63.35%,77.24% 63.67%,76.17% 64.43%,75.64% 65.32%,75.23% 65.73%,52.07% 65.32%,52.14% 54.89%,51.54% 55.34%,49.87% 56.32%,48.59% 56.1%,46.92% 55.07%,45.38% 57.04%,44.44% 57.22%,43.78% 56.68%,43.78% 55.74%,46.39% 53.46%,47.72% 51.62%,46.05% 51.85%,44.85% 51.35%,44.51% 50.37%,45.25% 50.1%,47.05% 50.19%,48.73% 49.83%,49.4% 48.22%,48.53% 47.68%,49% 46.92%,50.54% 46.92%,51.67% 48.8%,52.34% 48.62%'
      },
      {
        x: 51,
        y: 67,
        width: 43,
        height: 33,
        path: '52.14% 67.11%,65.46% 66.8%,74.77% 65.59%,75.57% 65.55%,75.64% 65.14%,76.44% 63.53%,77.11% 63.67%,77.38% 63.22%,80.79% 62.23%,83.07% 63.08%,85.07% 64.38%,85.68% 65.37%,85.74% 65.64%,89.16% 66.89%,95.18% 67.56%,94.85% 100%,51.34% 99.98%'
      },
      {
        x: 0,
        y: 22,
        width: 53,
        height: 78,
        path: '0% 27.62%,8.43% 27.85%,9.84% 26.15%,10.78% 25.16%,11.11% 24.85%,12.25% 24.45%,14.73% 23.51%,16.2% 23.19%,17.67% 22.92%,19.08% 22.88%,20.88% 22.74%,22.42% 22.57%,24.9% 23.06%,25.44% 23.24%,26.57% 23.24%,28.51% 23.77%,31.06% 25.16%,32.8% 26.86%,33.87% 28.52%,52.74% 28.88%,52.41% 47.91%,52.14% 60.26%,51.47% 91.34%,51.54% 100%,0% 100%'
      }
    ]
  },
  {
    image: 'images/manga/02.jpg',
    panels: [
      {
        x: 63.86,
        y: 0,
        width: 36.14,
        height: 60.17,
        path: "63.86% 0%,100% 0%,100% 60.04%,66.47% 60.17%"
      },
      {
        x: 4.87,
        y: 0,
        width: 59.79,
        height: 21.21,
        path: "4.87% 0%,63.6% 0%,64.66% 21.21%,4.92% 21.14%"
      },
      {
        x: 5.02,
        y: 22.66,
        width: 61.5,
        height: 37.68,
        path: "5.02% 22.73%,64.76% 22.66%,66.52% 60.24%,5.42% 60.34%"
      },
      {
        x: 5.27,
        y: 61.69,
        width: 94.73,
        height: 38.31,
        path: "5.27% 61.69%,99.85% 61.76%,100% 100%,5.52% 100%"
      }
    ]
  }
]));
