// Gulp 3.9.1
// =====================================================================

// TODO:
// - setup Minify HTML settings
// - setup SVG settings
// - setup Watch files for Build

// Load plugins
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var minify = require('gulp-csso');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var pipeline = require('readable-stream').pipeline;
var rename = require('gulp-rename');
var del = require('del');
var imagemin = require('gulp-imagemin');
var webp = require('imagemin-webp');
var svgstore = require('gulp-svgstore');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');

// Dev Style
// Compile SASS into CSS, add Autoprefixer & auto-inject into browsers
gulp.task('devStyle', function () {
  return gulp.src("src/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(plumber.stop())
    .pipe(gulp.dest("src/css"))
    .pipe(browserSync.stream());
});

// Prod Style
// Compile SASS into CSS, add Autoprefixer, Minify CSS, Move to Build & auto-inject into browsers
gulp.task('prodStyle', function () {
  return gulp.src("src/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(plumber.stop())
    .pipe(gulp.dest("src/css"))
    .pipe(minify())
    .pipe(gulp.dest("build/css"))
    .pipe(browserSync.stream());
});

// TODO:
// Setup Minify HTML settings

// Minify HTML
gulp.task('html', function () {
  return gulp.src("src/*.html")
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest("build"));
});

// Minify JS
gulp.task('script', function () {
  return pipeline(
    gulp.src('src/js/*.js'),
    uglify(),
    gulp.dest('build/js')
  );
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src("src/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),

      // TODO:
      // - setup SVG settings (need Practice for Real Projects)
      imagemin.svgo({
        plugins: [{
          removeViewBox: false
        }]
      })
    ]))
    .pipe(gulp.dest("build/img"));
});

// Convert images to WebP
gulp.task('devWebp', function () {
  return gulp.src("src/img/**/*.{png,jpg}")
    .pipe(imagemin([
      webp({
        quality: 75
      })
    ]))
    .pipe(rename({
      extname: ".webp"
    }))
    .pipe(gulp.dest("src/img"));
});

// Convert images to WebP
gulp.task('prodWebp', function () {
  return gulp.src("src/img/**/*.{png,jpg}")
    .pipe(imagemin([
      webp({
        quality: 75
      })
    ]))
    .pipe(rename({
      extname: ".webp"
    }))
    .pipe(gulp.dest("build/img"));
});

// Delete Dev Webp files from Src
gulp.task('delDevWebp', function () {
  return del("src/img/**/*.webp");
});

// TODO:
// - setup SVG settings (need Practice for Real Projects)

// Dev Sprite - Combine SVG files into SVG Sprite
gulp.task('devSprite', function () {
  return gulp.src("src/img/svg-sprite/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("src/img"));
});

// TODO:
// - setup SVG settings (need Practice for Real Projects)

// Prod Sprite - Combine SVG files into SVG Sprite
gulp.task('prodSprite', function () {
  return gulp.src("build/img/svg-sprite/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

// Copy files
gulp.task('copy', function () {
  return gulp.src([
      "src/fonts/**/*.{woff,woff2}"
    ], {
      base: "src"
    })
    .pipe(gulp.dest("build"));
});

// Delete files
gulp.task('clean', function () {
  return del("build");
});

// Dev Server
gulp.task('devServer', function () {
  browserSync.init({
    server: "./src",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  // Watch files
  gulp.watch("src/sass/**/*.scss", ['devStyle']);
  gulp.watch("src/*.html")
    .on('change', browserSync.reload);
  gulp.watch("src/js/*.js")
    .on('change', browserSync.reload);
  gulp.watch("src/img/**/*.{png,jpg}", ['devWebp'])
    .on('change', browserSync.reload);
  gulp.watch("src/img/*.svg")
    .on('change', browserSync.reload);
  gulp.watch("src/img/svg-sprite/*.svg", ['devSprite'])
    .on('change', browserSync.reload);
});

// Prod Server
gulp.task('prodServer', function () {
  browserSync.init({
    server: "./build",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  // TODO:
  // Setup Watch files for Build

  // Watch files
  gulp.watch("src/sass/**/*.scss", ['prodStyle']);
  gulp.watch("src/*.html", ['html'])
    .on('change', browserSync.reload);
  gulp.watch("src/js/*.js", ['script'])
    .on('change', browserSync.reload);
});

// Complex Tasks
// gulp.task('default', ['devServer']);

// DEV
gulp.task('dev', function (done) {
  runSequence(
    "clean",
    "delDevWebp",
    "devStyle",
    "devWebp",
    "devSprite",
    done
  );
});

// PROD
gulp.task('build', function (done) {
  runSequence(
    "clean",
    "html",
    "prodStyle",
    "script",
    "images",
    "prodWebp",
    "prodSprite",
    "copy",
    done
  );
});
