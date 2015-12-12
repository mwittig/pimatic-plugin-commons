gulp = require('gulp')
watch = require('gulp-watch')
plumber = require('gulp-plumber')
coffee = require('gulp-coffee')
sourceFiles = ['./src/index.coffee']

gulp.task('default', ->
  return gulp.src(sourceFiles)
    .pipe(watch(sourceFiles, verbose: true))
    .pipe(plumber())
    .pipe(coffee(bare: yes))
    .pipe(gulp.dest('./lib'))
)