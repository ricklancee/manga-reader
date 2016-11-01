# [Manga Reader](https://ricklancee.github.io/manga-reader)

*Currently a W.I.P.*

![Manga reader preview](https://thumbs.gfycat.com/FrailArtisticAplomadofalcon-size_restricted.gif)

Navigate using the arrow keys or use the pagination.

### How it works

The reader is added to the html page.

```html
<manga-reader data="images/one/data.json"></manga-reader>
```

Pages are loaded with a supplied json file. The json file looks as follows:

```json
[
  {
    "image": "images/one/01.jpg",
    "panels": [
      {
        "x": 79.15,
        "y": 0,
        "width": 20.85,
        "height": 47.32,
        "path": "79.42 0,100 0,100 46.49,93.43 46.4,93.43 47.32,86.32 47.05,86.32 46.4,79.15 45.85"
      },
      {
        "x": 78.75,
        "y": 46.68,
        "width": 21.25,
        "height": 53.32,
        "path": "79.28 48.06,94.56 47.51,100 46.68,100 100,78.75 100"
      },
      {
        "x": 0,
        "y": 0,
        "width": 85.19,
        "height": 100,
        "path": "0 0,79.42 0,79.15 46.12,85.19 46.58,85.06 48.16,79.15 48.25,78.75 100,0 100"
      }
    ]
  }
]

```
*All values are in percentages relative to the page* 

Each panel had a set of coardinated `x` and `y` and dimensions `width` and `height`. These are the panel boundries. This tells the reader where the panel is on the page.

The `path` property is the clipping path of the panel.

![How clipping works](https://github.com/ricklancee/manga-reader/blob/master/clip-preview.jpg?raw=true)  

### Browser support
- Chrome  
- Firefox  
- Safari  
- Edge (not tested)  
- IE (not tested, propably not)

### Build source files
ES6 files need to be converted to ES5 in order to ensure maximum browser support.

1. Install NPM
2. install dependencies `npm install`
3. Build es5 files `./node_modules/.bin/babel --presets=es2015 ./*.js --out-dir es5`
4. Minifiy files (if needed) `./node_modules/.bin/uglifyjs es5/polyfills.js es5/reader.js es5/main.js --compress --mangle --output es5/reader.min.js`

### Todo
- Loading Spinner when pages and files are beign loaded
- Add Edge browser support
- Add click navigation
- Improve general navigation (i.e. when panels are bigger than the screen height)
- Add panel effects -> ?
- Refactor
- Refactor
- Refactor
