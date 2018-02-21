gulp = require('gulp')
watch = require('gulp-watch')
plumber = require('gulp-plumber')
coffee = require('gulp-coffee')
jasmine = require('gulp-jasmine')
istanbul = require('gulp-istanbul')
sourceFiles = ['./src/index.coffee']
libFiles = ['./lib/index.js']
coveralls = require('gulp-coveralls')
markdox = require("gulp-markdox")
coffeelint = require('gulp-coffeelint')

gulp.task('develop', ->
  gulp.src(sourceFiles)
    .pipe(watch(sourceFiles, verbose: true))
    .pipe(plumber())
    .pipe(coffee(bare: yes))
    .pipe(gulp.dest('./lib'))
)

gulp.task('build', ->
  gulp.src(sourceFiles)
    .pipe(plumber())
    .pipe(coffee(bare: yes))
    .pipe(gulp.dest('./lib'))
)

gulp.task('pre-test', ['build'], ->
  gulp.src(libFiles)
    .pipe(plumber())
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
)

gulp.task('test', ['pre-test'], ->
  gulp.src(['test/index.js'])
  .pipe(plumber())
  .pipe(jasmine({
      verbose: false,
      includeStackTrace: true
    }))
    .pipe(istanbul.writeReports({
      dir: './coverage',
      reporters: [ 'lcov', 'json', 'text', 'text-summary' ],
      reportOpts: { dir: './coverage' }
    }))
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
)

gulp.task('coveralls', ->
  gulp.src('./coverage/**/lcov.info')
    .pipe(coveralls())
)

gulp.task('doc', ->
  gulp.src(sourceFiles)
    .pipe(markdox({ concat: 'API.md', output: 'API.md' }))
    .pipe(gulp.dest("./"));
)

gulp.task('lint', ->
  gulp.src(sourceFiles)
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
)

gulp.task('default', ['build', 'test', 'doc'])