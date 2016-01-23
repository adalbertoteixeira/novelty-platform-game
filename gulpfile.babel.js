'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect');
var babel = require("gulp-babel");
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Lint JavaScript
gulp.task('lint', () =>
  gulp.src('./js/**/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failOnError()))
);

// Optimize images
// gulp.task('images', () =>
//   gulp.src('app/images/**/*')
//     .pipe($.cache($.imagemin({
//       progressive: true,
//       interlaced: true
//     })))
//     .pipe(gulp.dest('dist/images'))
//     .pipe($.size({title: 'images'}))
// );

// Copy all files at the root level (app)
gulp.task('copy', () =>
  gulp.src([
    // 'app/*.html',
    'app/*.json',
    'app/phaser.min.js',
    'app/assets',
    'node_modules/requirejs/requirejs',
    // '!app/*.html',
    // 'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true,
  })
    .pipe(gulp.dest('.tmp'))
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
);

gulp.task('copy:images', () =>
  gulp.src(['app/assets/images/*.*'], {
    dot: true,
  })
    .pipe(gulp.dest('.tmp/assets/images'))
    .pipe(gulp.dest('dist/assets/images'))
);

gulp.task('copy:audio', () =>
  gulp.src(['app/assets/audio/*.*'], {
    dot: true,
  })
    .pipe(gulp.dest('.tmp/assets/audio'))
    .pipe(gulp.dest('dist/assets/audio'))
);

gulp.task('scripts', () => {
 gulp.src(["app/js/**/*.js"])
   // .pipe(babel())
   // .pipe(gulp.dest("dist"))
   // .pipe(connect.reload());
   // .pipe($.newer('.tmp/scripts'))
   .pipe($.babel())
   .pipe(gulp.dest('.tmp/scripts'))
   // .pipe($.concat('main.min.js'))
   // .pipe($.uglify({preserveComments: 'some'}))
   // Output files
   // .pipe($.size({title: 'scripts'}))
   .pipe(gulp.dest('dist/scripts'))
});

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10',
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    'app/styles/**/*.scss',
    'app/styles/**/*.css'
  ])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('connect', ['scripts', 'styles'], () => {
  // connect.server({
  //   root: '',
  //   livereload: true
  // });
  browserSync({
    // notify: false,
    open: false,
    // Customize the Browsersync console logging prefix
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app'],
    port: 3000,
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['lint', 'scripts']);
  gulp.watch(['app/js/**/*.js'], ['lint', 'scripts', reload]);
  gulp.watch(['app/images/**/*'], reload);
  gulp.watch(['app/**/*.json'], ['copy', reload]);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', () =>
  browserSync({
    open: false,
    notify: false,
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist',
    port: process.env.PORT || 5000,
  })
);

gulp.task('build', ['copy', 'copy:images', 'copy:audio', 'scripts', 'styles']);

gulp.task('default', ['copy', 'connect']);
