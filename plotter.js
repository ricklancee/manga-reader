'use strict';

class Plotter {

    constructor () {
        this.page = document.querySelector('.plotter');
        this.pageDimensions = this.page.getBoundingClientRect();

        document.addEventListener('click', this._onPageClick.bind(this));
        window.addEventListener('resize', () => {
          this.pageDimensions = this.page.getBoundingClientRect();
        });

        this.log = [];
    }

    _onPageClick(event) {
      console.log(event);

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

      // 100 ?
      // 200 x
      const percentageX = (x * 100) / this.pageDimensions.width;
      const percentageY = (y * 100) / this.pageDimensions.height;

      console.log(percentageX, percentageY);
      this.log.push(`${percentageX}% ${percentageY}%`);

      console.log(this.log.join(','));
    }

}

window.addEventListener('load', _ => new Plotter);
