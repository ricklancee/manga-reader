/**
 * MIT License
 *
 * Copyright (c) 2016 Rick Lancee @ricklancee
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

class Reader extends HTMLElement {

    createdCallback() {
        this.data = this.getAttribute('data');
        this.pages = null;
        this.canvasEl = null;
        this.canvas = null;

        if (!this.data) {
          return;
        }

        // options
        this.fitscreen = (this.hasAttribute('fitscreen') && this.getAttribute('fitscreen') !== 'false')
          || false;
        this.debug = (this.hasAttribute('debug') && this.getAttribute('debug') !== 'false')
          || false;

        // Page variables
        this.currentPageIndex = 0;
        this.currentPanelIndex = 0;

        // Init
        this._createCanvas();
        // TODO: Show spinner?

        // Data is loaded
        this._loadData().then(data => {
          this.pages = data;
          const imageUrl = this.pages[this.currentPageIndex].image;
          this._loadImage(imageUrl)
            .then(image => {
              console.log(image);
            });
        });
    }

    _loadData() {
      return new Promise((resolve, reject) => {
        fetch(this.data)
          .then(response => { return response.json() })
          .then(resolve)
          .catch(reject)
      });
    }

    _createCanvas() {
      if (this.canvasEl) {
        return;
      }

      const canvas = document.createElement('canvas');
      this.canvasEl = canvas;
      this.canvas = canvas.getContext('2d');
      this.appendChild(canvas);
    }

    _loadImage(url) {
      reutn new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve(img);
        };

        img.onerror = _ => {
          reject('failed to load image');
        };

        img.src = 'url';
      });
    }
}
