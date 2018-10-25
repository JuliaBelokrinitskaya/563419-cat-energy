'use strict';

var gulp = require('gulp');
var del = require('del');
var rename = require('gulp-rename');
var newer = require('gulp-newer');
var plumber = require('gulp-plumber');

var webp = require('gulp-webp');

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var mozjpeg = require('imagemin-mozjpeg');

var svgmin = require('gulp-svgmin');
var svgstore = require('gulp-svgstore');

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var csso = require('gulp-csso');

var uglify = require('gulp-uglify');

var htmlmin = require('gulp-htmlmin');

var server = require('browser-sync').create();

gulp.task('clean', function() {
  return del('build');
});

gulp.task('copy', function() {
  return gulp.src([
      'source/fonts/**/*.{woff,woff2}',
      'source/js/**'
    ], {
      base: 'source'
    })
    .pipe(gulp.dest('build'));
});

gulp.task('webp', function() {
  return gulp.src('source/img/**/!(bg-|icon-)*.{png,jpg}')
    .pipe(newer('build/img'))
    .pipe(webp({
      quality: 85
    }))
    .pipe(gulp.dest('build/img/webp'));
});

gulp.task('images', function () {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(newer('build/img'))
    .pipe(imagemin([
      pngquant({
        speed: 1,
        quality: '70-90'
      }),
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      mozjpeg({
        quality: 90
      }),
      imagemin.svgo({
        plugins: [{
          removeViewBox: false
        }]
      })
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('sprite', function() {
  return gulp.src('build/img/sprite/*.svg')
    .pipe(svgmin({
      plugins: [{
        removeViewBox: false
      }, {
        removeAttrs: {
          attrs: 'fill'
        }
      }]
    }))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('css', function () {
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('scripts', function() {
  return gulp.src('source/js/*.js')
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('build/js'));
});

gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('refresh', function (done) {
  server.reload();
  done();
});

gulp.task('build', gulp.series(
  'clean',
  'copy',
  'webp',
  'images',
  'sprite',
  'css',
  'scripts',
  'html'
));

gulp.task('server', function () {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/img/**/*.{png,jpg}', gulp.series('webp', 'images', 'refresh'));
  gulp.watch('source/img/*.svg', gulp.series('images', 'refresh'));
  gulp.watch('source/img/sprite/*.svg', gulp.series('images', 'sprite', 'refresh'));
  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('css'));
  gulp.watch('source/js/.js', gulp.series('scripts', 'refresh'));
  gulp.watch('source/*.html', gulp.series('html', 'refresh'));
});

gulp.task('start', gulp.series('build', 'server'));
