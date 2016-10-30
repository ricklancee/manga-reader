'use strict';

class Reader {

    constructor () {
        this.viewerEl = document.querySelector('.viewer');
        this.viewBox = document.querySelector('.view-box');
        this.panel = document.querySelector('.viewer .panel');
        this.page = document.querySelector('.viewer .page');

        this.pageDimensions = this._calculatePageDimensions();

        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;

        this.panels = [
          {
            x: 0,
            y: 0,
            width: 95,
            height: 28,
          }
        ];

        console.log(this.pageDimensions);

        this.panelIndex = 0;
        this.currentPanel = null;

        this._drawPanel(0);
        this._positionPage();

        this._addEventListeners();

        // stop initial flash.
        this.panel.classList.remove('hidden');
    }

    _addEventListeners() {
      window.addEventListener('resize', this._onWindowResize.bind(this));
    }

    _onWindowResize(event) {
      // Recalculate
      this._calculatePageDimensions();
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;

      // Redraw
      this._drawPanel(this.panelIndex);
      this._positionPage();
    }

    _calculatePageDimensions() {
      return this.page.getBoundingClientRect();
    }

    _drawPanel(index) {
      const nextPanel = this.panels[index];

      const top = nextPanel.x * this.page.width / 100;
      const left = nextPanel.y * this.page.height / 100;

      const width = nextPanel.width * this.page.width / 100;
      const height = nextPanel.height * this.page.height / 100;

      const right =  this.page.width - width;
      const bottom = this.page.height - height;

      this.currentPanel = {
        index,
        top,
        left,
        right,
        width,
        height,
        bottom
      };

      this.panel.setAttribute('style',
        `-webkit-clip-path: inset(${top}px ${right}px ${bottom}px ${left}px); clip-path: inset(${top}px ${right}px ${bottom}px ${left}px);`
      );
    }

    _positionPage() {

      if (this.currentPanel.height < this.screenHeight) { // Position it vertically
        const top = (this.screenHeight - this.currentPanel.height) / 2;
        const left = (this.screenWidth - this.currentPanel.width) / 2;

        // Position the viewbox
        this.viewBox.style.transform = `translate(
          ${left - this.pageDimensions.left}px,
          ${top - this.pageDimensions.top}px
        )`;
      }

    }


}

window.addEventListener('load', _ => new Reader());
