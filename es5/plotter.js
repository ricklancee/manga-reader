'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Plotter = function () {
  function Plotter() {
    var _this = this;

    _classCallCheck(this, Plotter);

    this.path = document.querySelector('svg path');
    this.page = document.querySelector('.plotter');
    this.button = document.querySelector('button');

    var recalc = function recalc() {
      var BCR = _this.page.getBoundingClientRect();
      _this.pageDimensions = {
        top: BCR.top + window.scrollY,
        left: BCR.left + window.scrollX,
        width: BCR.width,
        height: BCR.height
      };
    };

    recalc();

    new Clipboard('button');
    document.addEventListener('click', this._onPageClick.bind(this));
    document.addEventListener('keydown', function (event) {
      if (event.keyCode == 13) {
        _this.button.setAttribute('data-clipboard-text', _this.data);
        event.stopPropagation();
        _this.button.click();
        console.log(_this.data);

        _this.log = [];
        _this.line = '';
        _this.path.setAttribute('d', '');
      }
    });

    window.addEventListener('resize', function () {
      recalc();
    });

    this.line = '';
    this.log = [];
  }

  _createClass(Plotter, [{
    key: '_onPageClick',
    value: function _onPageClick(event) {

      var x = event.pageX - this.pageDimensions.left;
      var y = event.pageY - this.pageDimensions.top;

      this.button.style.top = y + 'px';
      this.button.style.left = x + 'px';

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

      var percentageX = Math.round(x * 100 / this.pageDimensions.width * 100) / 100;
      var percentageY = Math.round(y * 100 / this.pageDimensions.height * 100) / 100;

      if (this.log.length == 0) {
        this.line += ' M' + x + ' ' + y + ' ';
      } else {
        this.line += ' L' + x + ' ' + y + ' ';
      }

      this.path.setAttribute('d', this.line + ' Z');
      this.log.push(percentageX + ' ' + percentageY);

      var panel = this.calculateRectangle(this.log);
      panel.path = this.log.join(',');

      this.data = JSON.stringify(panel);
    }
  }, {
    key: 'calculateRectangle',
    value: function calculateRectangle(panel) {

      var x = panel.map(function (coards) {
        coards = coards.split(' ');
        return parseFloat(coards[0]);
      });

      var y = panel.map(function (coards) {
        coards = coards.split(' ');
        return parseFloat(coards[1]);
      });

      var lowestX = Math.min.apply(Math, x);
      var lowestY = Math.min.apply(Math, y);
      var highestX = Math.max.apply(Math, x);
      var highestY = Math.max.apply(Math, y);

      return {
        x: lowestX,
        y: lowestY,
        width: Math.round((highestX - lowestX) * 100) / 100,
        height: Math.round((highestY - lowestY) * 100) / 100
      };
    }
  }]);

  return Plotter;
}();

window.addEventListener('load', function (_) {
  return new Plotter();
});