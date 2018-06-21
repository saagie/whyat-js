import gulp from 'gulp';
import babel from 'gulp-babel';
import browserify from 'browserify';
import babelify from 'babelify';
import fs from 'fs';

gulp.task('build:es', (done) => {
  gulp.src('src/**/*.js')
    .pipe(babel({
      babelrc: false,
      presets: [
        ['env', { modules: false }],
      ],
    }))
    .pipe(gulp.dest('lib/es'));
  done();
});

gulp.task('build:umd', (done) => {
  const babelifyOptions = {
    presets: [
      ['env'],
    ],
    plugins: [
      ['transform-runtime',
        {
          helpers: false,
          polyfill: false,
          regenerator: true,
          moduleName: 'babel-runtime',
        }],
    ],
  };

  browserify({ standalone: 'whyat' })
    .transform(babelify, babelifyOptions)
    .require(require.resolve('./src/tracker.js'), { entry: true })
    .bundle()
    .pipe(fs.createWriteStream('dist/whyat.js'));
  done();
});
