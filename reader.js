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
            path: '0% 0%,96.5183752417795% 0%,95.26112185686654% 27.62273457794669%,33.46228239845261% 27.16990286355412%,32.88201160541586% 26.97583212881445%,31.14119922630561% 25.35857600598385%,29.20696324951644% 24.12946135263259%,27.079303675048354% 23.288488168760676%,25.62862669245648% 23.288488168760676%,24.661508704061895% 23.02972718910778%,22.727272727272727% 22.641585719628434%,19.729206963249517% 22.70627596454166%,15.18375241779497% 23.482558903500347%,11.992263056092844% 24.64698331193838%,9.961315280464216% 25.811407720376415%,8.994197292069632% 26.911141883901227%,0% 26.911141883901227%'
          },
          {
            x: 52,
            y: 29,
            width: 43,
            height: 37,
            path: '53% 29%,95% 29%,95% 66%,52% 66%'
          },
          {
            x: 51,
            y: 67,
            width: 43,
            height: 33,
            path: '52% 67%,95% 67%,95% 100%,51% 100%'
          },

          {
            x: 0,
            y: 22,
            width: 53,
            height: 78,
            path: '0% 22%,53% 22%,51% 100%,0% 100%'
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
      window.addEventListener('resize', this._onWindowResize.bind(this));
      window.addEventListener('keydown', event => {
        if (event.keyCode === 39) { // right
          this._nextPanel();
        }
        if (event.keyCode === 37) { // left
          this._previousPanel();
        }
      });
    }

    _onWindowResize(event) {
      // Recalculate
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

      console.log(panelHeight);
      this.viewerEl.scrollTop =this.pageOffsetY;
    }

    _nextPanel() {
      let index = this.currentPanelIndex + 1;

      if (index !== this.panels.length) {
        const clone = this.panel.cloneNode();
        this.viewBox.appendChild(clone);
      }

      if (index > this.panels.length - 1) {
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
        index = 0;
      }

      this.currentPanelIndex = index;
      this._drawPanel(index);
      this._positionPageIfNeeded();
    }
}

window.addEventListener('load', _ => new Reader());
