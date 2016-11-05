'use strict';

class Panels {

    constructor () {
      this.container = document.querySelector('.plotbox');
      this.page = document.querySelector('.plotbox .image');
      this.svg = document.querySelector('svg');
      this.plotpoints = document.querySelector('.plotpoints code');

      this.clearButton = document.querySelector('.clear-button');
      this.zoomInButton = document.querySelector('.zoom-in');
      this.zoomOutButton = document.querySelector('.zoom-out');

      this.fileUploadButton = document.querySelector('.upload-files');

      this.pageObject = {};
      this.panels = [];
      this.filename = '';

      this.currentPath = [];
      this.currentPathEl = null;
      this.currentPathString = '';
      this.currentlyDrawing = false;

      this.shiftModifier = false;
      this.zoom = 1;

      this._addEventListeners();

      this.page.style.width = this.page.width + 'px';
      this.originalPageWidth = this.page.width;
      this._recalc();
      this._setSvgDimensionsToImage();
    }

    _addEventListeners() {
      window.addEventListener('keydown', (event) => {

        if (event.keyCode === 187 && event.shiftKey) { // +
          this._zoomIn();
        }

        if (event.keyCode === 189 && event.shiftKey) { // -
          this._zoomOut();
        }

        if (event.keyCode === 16) {
          event.preventDefault();
          this.shiftModifier = true;
        }
        if (event.keyCode === 13) {
          event.preventDefault();

          if (this.currentlyDrawing) {
            this._closeCurrentPath();

            const path = this.currentPath;
            const panel = this._calculateRectangle(path);
            panel.path = path.join(', ');
            this.panels.push(panel);
            this._updatePlotpoints();
          }

        }
      });

      window.addEventListener('keyup', event => {
        if (event.keyCode === 16) {
          event.preventDefault();
          this.shiftModifier = false;
        }
      })

      this.svg.addEventListener('click', (event) => {
        if (this.shiftModifier) {
          if (event.target.nodeName === 'path') {

            const index = parseInt(event.target.getAttribute('data-index'));
            const currentIndex = parseInt(this.currentPathEl.getAttribute('data-index'));

            if (index !== currentIndex) {
              this.panels.splice(index, 1);
              event.target.remove();
              this._resetPathIndexes();
              this._updatePlotpoints();
              event.stopPropagation();
            }
          }
        }
      });


      this.container.addEventListener('click', this._onPageClick.bind(this));
      window.addEventListener('resize', () => {
        this._recalc();
        this._setSvgDimensionsToImage();
      });

      var clipboard = new Clipboard('.copy-button');

      clipboard.on('success', function(e) {
          const text = e.trigger.innerHTML;
          e.trigger.innerHTML = 'copied!';
          setTimeout(() => {
            e.trigger.innerHTML = text;
          }, 2000);

          e.clearSelection();
      });

      this.clearButton.addEventListener('click', this._clearAllPanels.bind(this));
      this.zoomInButton.addEventListener('click', this._zoomIn.bind(this));
      this.zoomOutButton.addEventListener('click', this._zoomOut.bind(this));

      this.fileUploadButton.addEventListener('change', this._handleFileSelect.bind(this));
    }

    _zoomIn() {
      this.zoom += 0.1;
      this.page.style.width = (this.originalPageWidth * this.zoom) + 'px';

      this._recalc();
      this._setSvgDimensionsToImage();
    }

    _zoomOut() {
      this.zoom -= 0.1;

      if (this.zoom <= 0.5) {
        this.zoom = 0.5;
      }
      this.page.style.width = (this.originalPageWidth * this.zoom) + 'px';


      this._recalc();
      this._setSvgDimensionsToImage();
    }

    _clearAllPanels() {
      this.plotpoints.innerHTML = 'No panels plotted.';
      this.panels = [];
      this.svg.querySelectorAll('path').forEach(pathEl => {
        pathEl.remove();
      });
    }

    _recalc() {
      const BCR = this.page.getBoundingClientRect();
      this.pageDimensions = {
        top: BCR.top + this.container.scrollTop,
        left: BCR.left + this.container.scrollLeft,
        width: BCR.width,
        height: BCR.height
      }
    }

    _setSvgDimensionsToImage() {
      this.svg.style.width = this.pageDimensions.width + 'px';
      this.svg.style.height = this.pageDimensions.height + 'px';
    }

    _onPageClick(event) {
      if (this.currentlyDrawing && this.shiftModifier) {
        const reversed = this.currentPathString.split("").reverse().join("");
        this.currentPathString = reversed.replace(/^(.*?L)/, '').split("").reverse().join("");
        this.currentPathEl.setAttribute('d', this.currentPathString);
        this.currentPath.pop();
        return;
      }

      const pageX = event.pageX - this.pageDimensions.left + this.container.scrollLeft;
      const pageY = event.pageY - this.pageDimensions.top  + this.container.scrollTop;

      const x = Math.min(Math.max(pageX, 0), this.pageDimensions.width);
      const y = Math.min(Math.max(pageY, 0), this.pageDimensions.height);

      const percentageX = Math.round((x * 100) / this.pageDimensions.width * 100) / 100;
      const percentageY = Math.round((y * 100) / this.pageDimensions.height * 100) / 100;


      if (!this.currentlyDrawing) {
        this._startNewPath();
      }

      if (this.currentPath.length == 0) {
        this.currentPathString += `M${percentageX} ${percentageY}`;
      } else {
        this.currentPathString += ` L${percentageX} ${percentageY}`;
      }

      this.currentPathEl.setAttribute('d', this.currentPathString);
      this.currentPath.push(`${percentageX} ${percentageY}`);
    }

    _startNewPath() {
      this.currentlyDrawing = true;

      this.currentPath = [];
      this.currentPathString = '';

      this.currentPathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      this.currentPathEl.setAttribute('d', '');
      this.currentPathEl.setAttribute('data-index', this.panels.length);
      this.currentPathEl.classList.add('active', 'path');

      this.svg.appendChild(this.currentPathEl);
    }

    _resetPathIndexes() {
      let index = 0;
      this.svg.querySelectorAll('path').forEach(pathEl => {
        pathEl.setAttribute('data-index', index);
        index++;
      });
    }

    _closeCurrentPath() {
      this.currentlyDrawing = false;
      this.currentPathEl.setAttribute('d', this.currentPathString + ' Z');
      this.currentPathEl.classList.remove('active');
    }

    _calculateRectangle(path) {
      var x = path.map(coards => {
        coards = coards.split(' ');
        return parseFloat(coards[0]);
      });

      var y = path.map(coards => {
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

    _updatePlotpoints() {
      this.pageObject.image = this.filename;
      this.pageObject.panels = this.panels;
      if (this.panels.length > 0) {
        var json = JSON.stringify(this.pageObject, null, 2);
        this.plotpoints.innerHTML = this.pageObject;
      } else {
        this.plotpoints.innerHTML = 'No panels plotted.';
      }
    }

    _setImage(image) {
      this._clearAllPanels();

      this.page.src = image;

      setTimeout(() => {
        this.page.style.width = '';

        this._recalc();
        this.originalPageWidth = this.pageDimensions.width;
        this._setSvgDimensionsToImage();
      }, 200);

    }

    _handleFileSelect(event) {
      const files = event.target.files; // FileList object

      // Loop through the FileList and render image files as thumbnails.
      for (var i = 0, f; f = files[i]; i++) {

        // Only process image files.
        if (!f.type.match('image.*')) {
          continue;
        }

        const reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = ((theFile) => {
          return (e) => {
            this._setImage(e.target.result);
            this.filename = theFile.name;
          };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
      }
    }
}

window.addEventListener('load', _ => new Panels);
