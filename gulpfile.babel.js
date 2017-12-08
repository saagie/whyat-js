import gulp from 'gulp';
import babel from 'gulp-babel';

gulp.task('build:es', () => {
  gulp.src('src/**/*.js')
    .pipe(babel({
      babelrc: false,
      presets: [
        ['env', { modules: false }],
      ],
    }))
    .pipe(gulp.dest('lib/es'));
});
