{
  "name": "<%= appName %>",
  "description": "<%= appDescription %>",
  "version": "<%= appVersion %>",
  "main": "./gulpfile.js",
  "private": true,
  "author": {
    "name": "<%= authorName %>",
    "email": "<%= authorEmail %>"
  },
  "type": "module",
  "license": "MIT",
  "scripts": {
    "check": "biome check .",
    "format": "biome format --write .",
    "lint": "biome lint ."
  },
  "devDependencies": {
    "@biomejs/biome": "^2.2.4",
    "autoprefixer": "^10.4.21",
    "beeper": "^3.0.0",
    "browser-sync": "^3.0.4",
    "chalk": "^5.6.2",
    "cssnano": "^7.1.1",
    "del": "^8.0.1",
    "dotenv": "^17.2.2",
    "gulp": "^5.0.1",
    "gulp-cached": "^1.1.1",
    "gulp-changed": "^5.0.3",
    "gulp-flatmap": "^1.0.2",
    "gulp-inline-css": "^4.0.0",
    "gulp-inline-source": "^4.0.0",
    "gulp-notify": "^5.0.0",
    "gulp-nunjucks": "^6.1.0",
    "gulp-plumber": "^1.2.1",
    "gulp-postcss": "^10.0.0",
    "gulp-pxtorem": "^3.0.0",
    "gulp-rename": "^2.1.0",
    "gulp-replace": "^1.1.4",
    "gulp-sass": "^6.0.1",
    "gulp-size": "^5.0.0",
    "gulp-sourcemaps": "^3.0.0",
    "html-minifier-terser": "^7.2.0",
    "marked": "^16.3.0",
    "nunjucks": "^3.2.4",
    "nunjucks-markdown": "^2.0.1",
    "postcss": "^8.5.10",
    "sass": "^1.93.2",
    "sharp": "^0.34.0",
    "svgo": "^3.3.2"
  },
  "overrides": {
    "lodash.template": "^4.5.0",
    "nth-check": "^2.1.1",
    "terser": "^5.0.0",
    "uuid": "^11.1.1"
  }
}
