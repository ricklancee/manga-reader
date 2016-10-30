'use strict';

class Plotter {

    constructor () {
        this.path = document.querySelector('svg path');
        this.page = document.querySelector('.plotter');

        this.pageDimensions = this.page.getBoundingClientRect();

        document.addEventListener('click', this._onPageClick.bind(this));
        window.addEventListener('resize', () => {
          this.pageDimensions = this.page.getBoundingClientRect();
        });

        this.line = '';
        this.log = [];
    }

    _onPageClick(event) {

      let x = event.pageX - 40;
      let y = event.pageY - 40;

      if (x < 0) {
        x = 0;
      }

      if (x > this.pageDimensions.width) {
        x = this.pageDimensions.width;
      }

      if (y < 0) {
        y = 0;
      }

      if (y > this.pageDimensions.height) {
        y = this.pageDimensions.height;
      }

      const percentageX = Math.round((x * 100) / this.pageDimensions.width * 100) / 100;
      const percentageY = Math.round((y * 100) / this.pageDimensions.height * 100) / 100;

      if (this.log.length == 0) {
        this.line += ` M${x} ${y} `;
      } else {
        this.line += ` L${x} ${y} `;
      }

      console.log(this.line);

      this.path.setAttribute('d', this.line + ' Z');
      this.log.push(`${percentageX}% ${percentageY}%`);

      console.log(this.log.join(','));
    }

}

window.addEventListener('load', _ => new Plotter);
