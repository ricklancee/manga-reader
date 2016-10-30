'use strict';

class Reader {

    constructor () {
        this.viewerEl = document.querySelector('.viewer');
        this.viewBox = document.querySelector('.view-box');
        this.panel = document.querySelector('.viewer .panel');
        this.page = document.querySelector('.viewer .page');

        this.panel.src = 'images/manga/01.jpg';
        this.page.src = 'images/manga/01.jpg';

        this.debugBox = document.querySelector('.debug-box');
        this.debug = false;

        this.pageDimensions = null;

        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;

        this.panels = [
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
        ];

        this.currentPanelIndex = 0;
        this.pageOffsetY = 0;


        this.panel.onload = () => {
          this._calculatePageDimensions();

          this._drawPanel(this.currentPanelIndex);
          this._positionPageIfNeeded();

          this._addEventListeners();


          // Display the panels after initial setup is complete
          this.page.classList.remove('hidden');
          this.panel.classList.remove('hidden');
        }

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
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
      this._positionPageIfNeeded();
    }

    _calculatePageDimensions() {
      this.pageDimensions = this.page.getBoundingClientRect();
    }

    _drawPanel(index) {
      const panel = this.panels[index];

      const path = panel.path;


      this.panel.setAttribute('style',
        `-webkit-clip-path: polygon(${path}); clip-path: polygon(${path});
        clip-path: polygon(${path}); clip-path: polygon(${path});`
      );
    }

    _positionPageIfNeeded() {
      const panel = this.panels[this.currentPanelIndex];

      // Figure out the Panel position on the page in pixels.
      const panelY = panel.y * this.pageDimensions.height / 100;
      const panelX = panel.x * this.pageDimensions.width / 100;
      const panelWidth = panel.width * this.pageDimensions.width / 100;
      const panelHeight = panel.height * this.pageDimensions.height / 100;

      if (this.debug) {
        this.debugBox.style.top = panelY + 'px';
        this.debugBox.style.left = panelX + 'px';
        this.debugBox.style.width = panelWidth + 'px';
        this.debugBox.style.height = panelHeight + 'px';
      }

      // Check if panel is off screen.
      if ((panelHeight + panelY) - this.pageOffsetY > this.screenHeight) {
        // calculate where to scoll
        this.pageOffsetY = (panelHeight + panelY) - this.screenHeight + 20// add some padding;
      }

      if (panelY < this.pageOffsetY) {
        // reset scroll to panel
        this.pageOffsetY = panelY;
      }

      this.viewerEl.scrollTop =this.pageOffsetY;
    }

    _nextPanel() {
      let index = this.currentPanelIndex + 1;

      if (index !== this.panels.length) {
        const clone = this.panel.cloneNode();
        this.viewBox.appendChild(clone);
      }

      if (index > this.panels.length - 1) {
        // last slide
        console.log('last slide');

        index = this.panels.length - 1;
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
        console.log('first slide')
        index = 0;
      }

      this.currentPanelIndex = index;
      this._drawPanel(index);
      this._positionPageIfNeeded();
    }
}

window.addEventListener('load', _ => new Reader());
