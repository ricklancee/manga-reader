# [Manga Reader](https://ricklancee.github.io/manga-reader)

*Currently a W.I.P.*

![Manga reader preview](https://github.com/ricklancee/manga-reader/blob/master/reader-preview.gif?raw=true)

Navigate using the arrow keys or use the pagination.

### How it works

The reader is a custom HTML element which can be added to the page. 

```html
<manga-reader data="manga/one/data.json"></manga-reader>
```

The custom element does need to be registered with the browser first; Which can be done like so:

```js
document.registerElement('manga-reader', MangaReader);
```

Pages are loaded with a manga json file specified in the `data` attribute on the `<manga-reader>` element. The json file looks as follows:

```json
{
  "title": "One-Punch Man",
  "author": ["Yusuke Murata", "ONE"],
  "tags": ["action", "comedy", "parody", "sci-fi", "super power", "supernatural"],
  "pageCount": 4,
  "pages": [
    {
      "image": "01.jpg",
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
}
```

#### Properties
- **`title: (string)`** The title of the manga
- **`author: (string|array)`** The author(s) of the manga
- **`tags: (array)`** An array containg all the manga tags
- **`pageCount: (int)`** how many pages the manga has
- **`page: (array)`** An array containing page objects
- **`page:image: (string)`** The url of the page image; These should be relative to the json file, or full urls
- **`panels: (array)`** An array containing all the locations and dimensions of the page panels. The values are expressed in percentages proportional to the page.
- **`panels:x: (int|float)`** The x (left) position of the panel
- **`panels:y: (int|float)`** The y (top) position of the panel
- **`panels:width: (int|float)`** The width of the panel
- **`panels:height: (int|float)`** The height of the panel
- **`panels:path: (string)`** The path of the clipping mask of the panel. (x y, x y,...)

Each panel has a set of coardinates (`x` and `y`) and dimensions (`width` and `height`). These are the panel boundaries and tells the reader where the panel is on the page.

The `path` property is the clipping path of the panel.

![How clipping works](https://github.com/ricklancee/manga-reader/blob/master/clip-preview.jpg?raw=true)  

### Creating panels (WIP)
Creating the panels is easy with the *Panel Creator* app in [ricklancee/manga-panel-creator](https://github.com/ricklancee/manga-panel-creator). Load the images into the app and follow the instructions.

### Browser support
Polyfills for the WebComponents, Promise, URL and Fetch APIs are required for browsers that don't support them. Polyfills can be loaded with the `polyfills.js` file within the `polyfills/` directory. When using the polyfills you need to wait for the `polyfillsLoaded` event in order to initialize the reader (see `examples/basic/` for an example).

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
- Fix: Mobile issues
- Add: Getting started secting in the readme
- Feature: Side by side view (fitscreen/no-fitscreen view)
- Add: Option to disable 'panel by panel' mode in reader
- Add: chapter support
- Add: manga meta data example
- Fix: pagination example
- Add: autoview example
- Add: Edge browser support
- ?? -> Add: panel effects
- ?? -> Fix: Move out key event listeners, these should not be inside the class.
- ?? -> Feature: Use shadow dom for css and html
- ~~Loading Spinner when pages and files are beign loaded~~
- ~~Create an examples/ directory.~~
- ~~Preloading pages~~
- ~~Add click navigation~~
- See [issue 1#](https://github.com/ricklancee/manga-reader/issues/1): ~~Improve general navigation (i.e. when panels are bigger than the screen height)~~ 
- Refactor
- Refactor
- Refactor
