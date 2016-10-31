'use strict';

class Plotter {

    constructor () {
        this.path = document.querySelector('svg path');
        this.page = document.querySelector('.plotter');

        const recalc = () => {
          const BCR = this.page.getBoundingClientRect();
          this.pageDimensions = {
            top: BCR.top + window.scrollY,
            left: BCR.left + window.scrollX,
            width: BCR.width,
            height: BCR.height
          }
        }

        recalc();

        document.addEventListener('click', this._onPageClick.bind(this));
        window.addEventListener('resize', () => {
          recalc();
        });

        this.line = '';
        this.log = [];
    }

    _onPageClick(event) {

      let x = event.pageX - this.pageDimensions.left;
      let y = event.pageY - this.pageDimensions.top;

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

      this.path.setAttribute('d', this.line + ' Z');
      this.log.push(`${percentageX}% ${percentageY}%`);

      let panel = this.calculateRectangle(this.log);
      panel.path = this.log.join(',');

      console.log(JSON.stringify(panel));
    }

    calculateRectangle(panel) {

      var x = panel.map(coards => {
        coards = coards.replace('%', '');
        coards = coards.split(' ');
        return parseFloat(coards[0]);
      });

      var y = panel.map(coards => {
        coards = coards.replace('%', '');
        coards = coards.split(' ');
        return parseFloat(coards[1]);
      });

      const lowestX = Math.min.apply(Math, x);
      const lowestY = Math.min.apply(Math, y);
      const highestX = Math.max.apply(Math, x);
      const highestY = Math.max.apply(Math, y);

      return {
        x: lowestX,
        y: lowestY,
        width:  Math.round((highestX - lowestX) * 100) / 100,
        height: Math.round((highestY - lowestY) * 100) / 100
      }

    }

}

window.addEventListener('load', _ => new Plotter);
