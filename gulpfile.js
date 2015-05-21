var passthroughArgs = process.argv.slice(3);

require('source-map-support').install();

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sequence = require('gulp-sequence');
var nodemon = require('gulp-nodemon');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');

var fs = require('fs-extra');

gulp.task('dev', function (cb) {
    sequence('build', 'test', 'dev-watch-build')(cb);
});
gulp.task('dev-watch-build', function () {
    gulp.watch('./package.json', { debounceDelay: 2000 }, [ 'dev-build-core' ]);
    gulp.watch('./src/**/*.js', { debounceDelay: 2000 }, [ 'dev-build-lib' ]);
    gulp.watch('./src/data/**/*', { debounceDelay: 2000 }, [ 'dev-build-data' ]);
    // gulp.watch('./dist/**/*', { debounceDelay: 2000 }, [ 'dev-build-test' ]);
});
gulp.task('dev-build-core', function (cb) {
    sequence('build-core', 'test')(cb);
});
gulp.task('dev-build-lib', function (cb) {
    sequence('build-lib', 'test')(cb);
});
gulp.task('dev-build-data', function (cb) {
    sequence('build-data', 'test')(cb);
});
// gulp.task('dev-build-test', function (cb) {
//     sequence('test')(cb);
// });
gulp.task('dev-watch-run', function () {
    return nodemon({
        script: 'dist/app.js',
        ext: 'js',
        watch: 'dist',
        delay: 1000,
        args: passthroughArgs
    });
});

gulp.task('build', function (cb) {
    // sequence('build-clean', [ 'build-core', 'build-lib', 'build-data' ])(cb);
    sequence([ 'build-core', 'build-lib', 'build-data' ])(cb);
});
gulp.task('build-clean', function (cb) {
    fs.emptyDir('dist', cb);
});
gulp.task('build-core', function () {
    return gulp.src('./package.json')
        .pipe(gulp.dest('dist'));
});
gulp.task('build-lib', function () {
    return gulp.src('./src/**/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel({
            optional: [ 'runtime' ],
            // stage: 1
        }))
        // .pipe(concat('all.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});
gulp.task('build-data', function () {
    return gulp.src('./src/data/**')
        .pipe(gulp.dest('dist/data'));
});

gulp.task('test', function () {
    return gulp.src('./dist/test/**/*.js')
        .pipe(mocha({
            timeout: 5000
        }))
        // .pipe(eslint())
        // .pipe(eslint.format())
        .on('error', function (err) {
            console.error(err.stack);
            this.emit('end');
        });
});

gulp.task('default', function (cb) {
    sequence('build')(cb);
});