'use strict';

class Reader {

    constructor () {
        this.viewerEl = document.querySelector('.viewer');
        this.viewBox = document.querySelector('.view-box');
        this.panel = document.querySelector('.viewer .panel');
        this.page = document.querySelector('.viewer .page');

        this.debugBox = document.querySelector('.debug-box');
        this.debug = false;

        this.pageDimensions = null;
        this._calculatePageDimensions();


        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.panels = [
          {
            x: 0,
            y: 0,
            width: 95,
            height: 28,
            path: [{x: 0, y: 0}, {x: 95, y: 0}, {x:95, y:28}, {x:0, y:27}]
          },
          {
            x: 52,
            y: 29,
            width: 43,
            height: 37,
            path: [{x: 53, y: 29}, {x: 95, y: 29}, {x:95, y:66}, {x:52, y:66}]
          },
          {
            x: 51,
            y: 67,
            width: 43,
            height: 33,
            path: [{x: 52, y: 67}, {x: 95, y: 67}, {x:95, y:100}, {x:51, y:100}]
          },

          {
            x: 0,
            y: 22,
            width: 53,
            height: 78,
            path: [{x: 0, y: 22}, {x: 53, y: 22}, {x:51, y:100}, {x:0, y:100}]
          }
        ];

        console.log(this.pageDimensions);

        this.currentPanelIndex = 0;

        this._drawPanel(this.currentPanelIndex);
        this._positionPageIfNeeded();

        this._addEventListeners();

        this.pageOffsetY = 0;

        // Display the panels after initial setup is complete
        this.page.classList.remove('hidden');
        this.panel.classList.remove('hidden');
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

      let path = panel.path.map(coardinate => {
        return `${coardinate.x}% ${coardinate.y}%`;
      }).join(',');

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
        // Panel is partially off screen.
        console.log('panel is off screen');

        // figure out by how many pixels it is off screen.
        this.pageOffsetY = (panelHeight + panelY) - this.screenHeight + 20// add some padding;
      }

      if (panelY < this.pageOffsetY) {
        // figure out by how much
        console.log('offset: panel offscreen');

        this.pageOffsetY = panelY;
      }

      this.viewerEl.scrollTop =this.pageOffsetY;
    }

    _nextPanel() {
      let index = this.currentPanelIndex + 1;

      if (index > this.panels.length - 1) {
        index = this.panels.length - 1;
      }

      this.currentPanelIndex = index;

      this._drawPanel(index);
      this._positionPageIfNeeded();
    }


    _previousPanel() {
      let index = this.currentPanelIndex - 1;

      if (index < 0) {
        index = 0;
      }

      this.currentPanelIndex = index;
      this._drawPanel(index);
      this._positionPageIfNeeded();
    }
}

window.addEventListener('load', _ => new Reader());
