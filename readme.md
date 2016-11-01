# [Manga Reader](https://ricklancee.github.io/manga-reader)

*Currently a W.I.P.*

Navigate using the arrow keys or use the pagination


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
