gulp = require('gulp')
watch = require('gulp-watch')
plumber = require('gulp-plumber')
coffee = require('gulp-coffee')
jasmine = require('gulp-jasmine')
istanbul = require('gulp-istanbul');
sourceFiles = ['./src/index.coffee']
libFiles = ['./lib/index.js']


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
  gulp.src('test/index.js')
    .pipe(jasmine({
      verbose: false,
      includeStackTrace: true
    }))
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
)

gulp.task('default', ['build', 'test']);