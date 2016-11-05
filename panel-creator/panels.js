'use strict';

class Panels {

    constructor () {
      this.container = document.querySelector('.plotbox');
      this.pageImage = document.querySelector('.plotbox .image');
      this.svg = document.querySelector('svg');
      this.resultsContainer = document.querySelector('.results');

      // Buttons
      this.clearButton = document.querySelector('.clear-button');
      this.zoomInButton = document.querySelector('.zoom-in');
      this.zoomOutButton = document.querySelector('.zoom-out');
      this.fileUploadButton = document.querySelector('.upload-files');

      // Variables
      this.pages = [];
      this.currentPageIndex = null;
      this.loadedImages = [];
      this.currentPanels = [];
      this.currentPath = [];
      this.currentPathEl = null;
      this.currentPathString = '';
      this.currentlyDrawing = false;

      this.shiftModifier = false;
      this.zoom = 1;
      this.noPanelText = 'No panels drawn.';

      this._addEventListeners();

      this.pageImage.style.width = this.pageImage.width + 'px';
      this.originalPageWidth = this.pageImage.width;
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
            this.currentPanels.push(panel);

            this._updatePagesData();
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
          if (!this.currentlyDrawing && event.target.nodeName === 'path') {

            const index = parseInt(event.target.getAttribute('data-index'));

            this.currentPanels.splice(index, 1);
            event.target.remove();
            this._resetPathIndexes();
            this._updatePlotpoints();
            event.stopPropagation();
          }
        }
      });


      this.container.addEventListener('click', this._onPageClick.bind(this));
      window.addEventListener('resize', () => {
        this._recalc();
        this._setSvgDimensionsToImage();
      });

      var clipboard = new Clipboard('.copy-button', {
        text: (trigger) => {
          return JSON.stringify(this.pages, null, 2);
        }
      });

      clipboard.on('success', function(e) {
          const text = e.trigger.innerHTML;
          e.trigger.innerHTML = 'copied!';
          setTimeout(() => {
            e.trigger.innerHTML = text;
          }, 2000);

          e.clearSelection();
      });

      this.clearButton.addEventListener('click', this._clearAllCurrentPanels.bind(this));
      this.zoomInButton.addEventListener('click', this._zoomIn.bind(this));
      this.zoomOutButton.addEventListener('click', this._zoomOut.bind(this));
      this.fileUploadButton.addEventListener('change', this._handleFileSelect.bind(this));

      window.addEventListener('click', (event) => {
        const closestContainer = this._closest(event.target, 'result');

        // If we clicked on a new page link
        if (
          closestContainer &&
          parseInt(closestContainer.getAttribute('data-index'), 10) !== this.currentPageIndex
        ) {

          const image = this._getImageByFilename(closestContainer.getAttribute('data-filename'));

          if (image) {
            const index = this.loadedImages.indexOf(image);
            this._setImage(index);
            this._redrawCurrentPanelPaths();
          }
        }
      });
    }

    _closest(el, className) {
      while (!el.classList.contains(className)) {
        // Increment the loop to the parent node
        el = el.parentNode;
        if (!el || el === document.body) {
          return null;
        }
      }

      return el;
    }

    _setZoom() {
      this.pageImage.style.width = (this.originalPageWidth * this.zoom) + 'px';

      this._recalc();
      this._setSvgDimensionsToImage();
    }

    _zoomIn() {
      this.zoom += 0.2;
      this.pageImage.style.width = (this.originalPageWidth * this.zoom) + 'px';

      this._recalc();
      this._setSvgDimensionsToImage();
    }

    _zoomOut() {
      this.zoom -= 0.2;

      if (this.zoom <= 0.5) {
        this.zoom = 0.5;
      }
      this.pageImage.style.width = (this.originalPageWidth * this.zoom) + 'px';


      this._recalc();
      this._setSvgDimensionsToImage();
    }

    _clearAllCurrentPanels() {
      this.svg.querySelectorAll('path').forEach(pathEl => {
        pathEl.remove();
      });

      this.currentPanels = [];
      this._updatePlotpoints();
      this._updatePagesData();
    }

    _recalc() {
      const BCR = this.pageImage.getBoundingClientRect();
      this.pageImageDimensions = {
        top: BCR.top + this.container.scrollTop,
        left: BCR.left + this.container.scrollLeft,
        width: BCR.width,
        height: BCR.height
      }
    }

    _setSvgDimensionsToImage() {
      this.svg.style.width = this.pageImageDimensions.width + 'px';
      this.svg.style.height = this.pageImageDimensions.height + 'px';
    }

    _onPageClick(event) {
      if (this.currentlyDrawing && this.shiftModifier) {
        const reversed = this.currentPathString.split("").reverse().join("");
        this.currentPathString = reversed.replace(/^(.*?L)/, '').split("").reverse().join("");
        this.currentPathEl.setAttribute('d', this.currentPathString);
        this.currentPath.pop();
        return;
      }

      const pageX = event.pageX - this.pageImageDimensions.left + this.container.scrollLeft;
      const pageY = event.pageY - this.pageImageDimensions.top  + this.container.scrollTop;

      const x = Math.min(Math.max(pageX, 0), this.pageImageDimensions.width);
      const y = Math.min(Math.max(pageY, 0), this.pageImageDimensions.height);

      const percentageX = Math.round((x * 100) / this.pageImageDimensions.width * 100) / 100;
      const percentageY = Math.round((y * 100) / this.pageImageDimensions.height * 100) / 100;


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
      this.currentPathEl.setAttribute('data-index', this.currentPanels.length);
      this.currentPathEl.classList.add('active', 'path');

      this.svg.appendChild(this.currentPathEl);
    }

    _redrawCurrentPanelPaths() {
      if (this.currentlyDrawing) {
        this._closeCurrentPath();
      }

      for (var i = 0; i < this.currentPanels.length; i++) {
        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        const path = this.currentPanels[i].path.split(', ').map((coards, index) => {
          let xy = coards.split(' ');

          if (index === 0) {
            return `M${xy[0]} ${xy[1]}`;
          }

          return `L${xy[0]} ${xy[1]}`;
        }).join(' ');

        pathEl.setAttribute('d', path + ' Z');
        pathEl.setAttribute('data-index', i);
        this.svg.appendChild(pathEl);
      }
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

      let data;
      if (this.currentPanels.length > 0) {
        data = JSON.stringify(this.currentPanels, null, 2);
      } else {
        data = this.noPanelText;
      }

      const container = document.querySelector('.result[data-index="'+this.currentPageIndex+'"] code');
      container.innerHTML = data;
    }

    _setImage(index) {
      this.currentPageIndex = index;

      if (
        !this.pages[this.currentPageIndex] ||
        this.pages[this.currentPageIndex].panels.length === 0
      ) {
        this.currentPanels = [];
      } else {
        this.currentPanels = this.pages[this.currentPageIndex].panels;
      }

      const image = this.loadedImages[index];

      this._loadImage(image.data);
      document.querySelector('.result.active').classList.remove('active');
      document.querySelector('.result[data-index="'+index+'"]').classList.add('active');

      this._setZoom();
    }

    _updatePagesData() {
      console.log(this.currentPageIndex);

      if (!this.pages[this.currentPageIndex]) {
        const filename = this.loadedImages[this.currentPageIndex].filename;
        this.pages.push({
          image: filename,
          panels: []
        });
      }

      this.pages[this.currentPageIndex].panels = this.currentPanels;

      this._sortPages();
      console.log(this.pages);
    }

    _loadImage(image) {
      this.pageImage.src = image;

      this.svg.querySelectorAll('path').forEach(pathEl => {
        pathEl.remove();
      });

      this.pageImage.style.width = '';
      this._recalc();
      this.originalPageWidth = this.pageImageDimensions.width;
      this._setSvgDimensionsToImage();
    }

    _handleFileSelect(event) {
      this.resultsContainer.innerHTML = '';
      this.loadedImages = [];

      const files = event.target.files; // FileList object

      const promises = [];

      // Loop through the FileList
      for (var i = 0, f; f = files[i]; i++) {

        // Only process image files.
        if (!f.type.match('image.*')) {
          continue;
        }

        const reader = new FileReader();

        // Closure to capture the file information.
        const promise = new Promise((resolve, reject) => {
          reader.onload = ((theFile) => {
            return (e) => {
              this.loadedImages.push({
                filename: theFile.name,
                data: e.target.result
              });

              resolve();
            };
          })(f);
        });

        promises.push(promise);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
      }

      // Wait for all promises to resolve
      Promise.all(promises).then(() => {
        console.log('all images were loaded');
        this.loadedImages = this._sortImage(this.loadedImages);
        this._loadImageData();
      });
    }

    _loadImageData() {

      for (var i = 0; i < this.loadedImages.length; i++) {
        if (!this.pages[i]) {
          this.pages.push({
            image: this.loadedImages[i].filename,
            panels: []
          })
        }
      }

      this._fillResultsContainer(this.loadedImages);
      // load first image
      this._setImage(0);
    }

    _sortImage(images) {
      images.sort((a, b) => {
        const filenameA = parseInt(
          a.filename.replace(/\.(gif|jpg|jpeg|tiff|png)$/i, ''), 10
        );
        const filenameB = parseInt(
          b.filename.replace(/\.(gif|jpg|jpeg|tiff|png)$/i, ''), 10
        );

        if (filenameA < filenameB) {
          return -1;
        }

        if (filenameA > filenameB) {
          return 1;
        }
        return 0;
      });

      return images;
    }

    _sortPages() {
      this.pages.sort((a, b) => {
        const imageA = parseInt(
          a.image.replace(/\.(gif|jpg|jpeg|tiff|png)$/i, ''), 10
        );
        const imageB = parseInt(
          b.image.replace(/\.(gif|jpg|jpeg|tiff|png)$/i, ''), 10
        );

        if (imageA < imageB) {
          return -1;
        }

        if (imageA > imageB) {
          return 1;
        }

        return 0;
      });
    }

    _getImageByFilename(filename) {
      const index = this.loadedImages.findIndex(element => {
        if (element.filename === filename) {
          return true;
        }
        return false;
      });

      if (index === -1) {
        return false
      }

      return this.loadedImages[index];
    }

    _fillResultsContainer(sorted) {
      const len = sorted.length;
      const resultDivTemplate = this._createResultContainer();


      for (let i = 0; i < len; i++) {
        const container = resultDivTemplate.cloneNode(true);
        const title = container.querySelector('label > span:first-child');
        title.innerHTML = sorted[i].filename;
        container.setAttribute('data-filename', sorted[i].filename);
        container.setAttribute('data-index', i);
        container.id = 'page-' + sorted[i].filename;

        if (i === 0) {
          container.classList.add('active');
        }

        this.resultsContainer.appendChild(container);

      }
    }

    _createResultContainer() {
      const div = document.createElement('div');
      const label = document.createElement('label');
      const spanTitle = document.createElement('span');
      const spanButton = document.createElement('span');
      const pre = document.createElement('pre');
      const code = document.createElement('code');

      div.classList.add('result');
      spanTitle.innerHTML = '';
      spanButton.innerHTML = '';

      label.appendChild(spanTitle);
      label.appendChild(spanButton);
      code.innerHTML = this.noPanelText;

      pre.appendChild(code);

      div.appendChild(label);
      div.appendChild(pre);

      return div;
    }
}

window.addEventListener('load', _ => new Panels);
