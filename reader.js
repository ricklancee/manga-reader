'use strict';

class Reader {

    constructor () {
        this.viewerEl = document.querySelector('.viewer');
        this.viewBox = document.querySelector('.view-box');
        this.panel = document.querySelector('.viewer .panel');
        this.page = document.querySelector('.viewer .page');

        this.pageDimensions = null;
        this._calculatePageDimensions();

        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.panels = [
          {
            dimension: {
              x: 0,
              y: 0,
              width: 95,
              height: 28
            },
            path: [{x: 0, y: 0}, {x: 95, y: 0}, {x:95, y:28}, {x:0, y:27}]
          },
          {
            dimension: {
              x: 52,
              y: 29,
              width: 43,
              height: 37
            },
            path: [{x: 53, y: 29}, {x: 95, y: 29}, {x:95, y:66}, {x:52, y:66}]
          }
        ];

        console.log(this.pageDimensions);

        this.currentPanelIndex = 1;

        this._drawPanel(this.currentPanelIndex);

        this._addEventListeners();

        // stop initial flash.
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
        `-webkit-clip-path: polygon(${path}); clip-path: polygon(${path});`
      );
    }

    _nextPanel() {
      let index = this.currentPanelIndex + 1;

      if (index > this.panels.length - 1) {
        index = this.panels.length - 1;
      }

      this.currentPanelIndex = index;
      this._drawPanel(index);
    }


    _previousPanel() {
      let index = this.currentPanelIndex - 1;

      if (index < 0) {
        index = 0;
      }

      this.currentPanelIndex = index;
      this._drawPanel(index);
    }
}

window.addEventListener('load', _ => new Reader());
