# [Manga Reader](https://ricklancee.github.io/manga-reader)

*Currently a W.I.P.*

![Manga reader preview](https://github.com/ricklancee/manga-reader/blob/master/reader-preview.gif?raw=true)

Navigate using the arrow keys or use the pagination.

### How it works

The reader is added to the html page.

```html
<manga-reader data="manga/one/data.json"></manga-reader>
```

Pages are loaded with a supplied json file. The json file looks as follows:

```json
[
  {
    "image": "manga/one/01.jpg",
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
*All values are in percentages relative to the page.* 

Each panel has a set of coardinates (`x` and `y`) and dimensions (`width` and `height`). These are the panel boundaries and tells the reader where the panel is on the page.

The `path` property is the clipping path of the panel.

![How clipping works](https://github.com/ricklancee/manga-reader/blob/master/clip-preview.jpg?raw=true)  

### Browser support
Polyfills for the WebComponents, Promise, URL and Fetch APIs are required for browsers that don't support them. Polyfills are loaded with the `polyfills.js` file.

- Chrome  
- Firefox  
- Safari  
- Edge (not tested)  
- IE (not tested, propably not)

### Build source files
ES6 files need to be converted to ES5 in order to ensure maximum browser support.

1. Install NPM
2. install dependencies `npm install`
3. Build es5 & minifiy files `npm run build`

### Todo
- Option to disable 'panel by panel' mode in reader
- Add manga meta data example
- Add pagination example
- Add autoview example
- Add Edge browser support
- Add click navigation
- Improve general navigation (i.e. when panels are bigger than the screen height)
- ?? -> Add panel effects
- ?? -> Move out key event listeners, these should not be inside the class.
- ~~Loading Spinner when pages and files are beign loaded~~
- ~~Create an examples/ directory.~~
- ~~Preloading pages~~
- Refactor
- Refactor
- Refactor
