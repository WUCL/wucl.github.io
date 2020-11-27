"use strict";
const gulp = require('gulp')
    , bs = require('browser-sync').create()
    , sass = require('gulp-sass')
    , rename = require("gulp-rename")
    , autoprefixer = require('gulp-autoprefixer')
    , uglify = require('gulp-uglify')
    // , cache = require('gulp-cache')
    , plumber = require('gulp-plumber')
    , notify = require('gulp-notify')
    , gutil = require('gulp-util')
    , cleanCSS = require('gulp-clean-css')
    , jshint = require('gulp-jshint')
    , changed = require('gulp-changed')
    , imagemin = require('gulp-imagemin')
    , fileinclude = require('gulp-file-include')
    , debug = require('gulp-debug')
    // , del = require('del')
    ;

const SRC = './src'
    , DEST = '../'
    , PATH = {
        SRC: {
            HTML: SRC + '/*.html'
            , TPL: SRC + '/tpl/**/*.html'
            , CSS: SRC + '/scss/**/*.scss'
            , JS: SRC + '/js/**/*.js'
            , IMG: SRC + '/img/**/*.{jpg,jpeg,png,gif,svg,ico}'
        }
        , DEST: {
            HTML: DEST
            , CSS: DEST + '/public/css/'
            , JS: DEST + '/public/js/'
            , IMG: DEST + '/public/img/'
        }
    };

// let reload = bs.reload;

gulp.task('serve', function(cb) {
    bs.init({
        server: {
            baseDir: DEST
            , reloadDebounce: 3000
        }
        // , https: true
        , port: 1234
        , open: 'external'
    });
    cb && cb();
});

/* html */
gulp.task('html', () => {
    return gulp.src(PATH.SRC.HTML)
    .pipe(fileinclude({
        prefix: '@@'
        , basepath: '@file'
        , indent: true
    }))
    .pipe(changed(PATH.DEST.HTML, { hasChanged: changed.compareContents }))
    .pipe(debug({ title: 'Compile:' }))
    .pipe(gulp.dest(PATH.DEST.HTML))
    .pipe(bs.stream())
    .pipe(notify('html processed'))
});

/* script */
gulp.task('script', function () {
    gutil.log('Changes to `SCRIPT` SRC files detected');
    return gulp.src(PATH.SRC.JS)
    .on('error', gutil.log)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish', { verbose: true }))
    .pipe(debug({ title: 'Compile:' }))
    // .pipe(uglify())
    .pipe(gulp.dest(PATH.DEST.JS))
    .pipe(bs.stream())
    .pipe(notify({
        message: '`SCRIPT` task complete: <%= file.relative %>',
        onLast: true
    }));
});

/* style */
gulp.task('style', ()=> {
    gutil.log('Changes to `STYLE` SRC files detected');
    return gulp.src(PATH.SRC.CSS)
    .pipe(plumber())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer({
        overrideBrowserslist: ['> 1%', 'last 5 versions', 'Firefox >= 45', 'iOS >=8', 'Safari >=8', 'ie >= 10']
        , grid: true
        , cascade: false
    }))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename(function (path) { // Updates the object in-place// path.dirname += "/ciao";// path.extname = ".css";
        path.basename += ".min";
    }))
    .pipe(debug({ title: 'Compile:' }))
    .pipe(gulp.dest(PATH.DEST.CSS))
    .pipe(bs.stream())
    .pipe(notify({
        message: '`STYLE` task complete: <%= file.relative %>',
        onLast: true
    }));
});

/* image */
gulp.task('image', ()=>{
    gutil.log('Changes to `IMAGE` SRC files detected');
    return gulp.src(PATH.SRC.IMG)
    .pipe(plumber())
    .pipe(changed(PATH.DEST.IMG))

    // ver.1
    .pipe(imagemin([
        require('imagemin-pngquant')()
        , require('imagemin-jpegtran')({ quality: 70 })
        , require('imagemin-gifsicle')()
    ], { verbose: true }))

    // ver.2
    // .pipe(imagemin([
    //     imagemin.gifsicle({interlaced: true}),
    //     imagemin.mozjpeg({quality: 75, progressive: true}),
    //     imagemin.optipng({optimizationLevel: 5}),
    //     imagemin.svgo({
    //         plugins: [
    //             {removeViewBox: true},
    //             {cleanupIDs: false}
    //         ]
    //     })
    // ], { verbose: true }))

    // ver.3
    // .pipe(imagemin({
    //     interlaced: true,
    //     progressive: true,
    //     optimizationLevel: 5,
    //     svgoPlugins: [
    //         {
    //             removeViewBox: true
    //         }
    //     ],
    //     verbose: true })
    // )

    .pipe(gulp.dest(PATH.DEST.IMG))
    .pipe(bs.stream())
    .pipe(notify({
        message: '`IMAGE` task complete: <%= file.relative %>',
        onLast: true
    }));
});

/* watch */
gulp.task('watch', function (cb) {
    gulp.watch(PATH.SRC.JS, gulp.series('script'));
    gulp.watch(PATH.SRC.CSS, gulp.series('style'));
    gulp.watch(PATH.SRC.IMG, gulp.series('image'));

    gulp.watch([PATH.SRC.HTML, PATH.SRC.TPL], gulp.series('html'))
    // .on('change', gulp.series(
    //     'clearCache'
    //     , reload
    // ));

    cb && cb();
});

// test
// gulp.task('clearCache', function (cb) {
//     return cache.clearAll(cb);
// });

gulp.task('build',
    gulp.series(
        gulp.parallel(
            'script'
            , 'style'
            , 'image'
        )
        , 'html'
    )
);
gulp.task('view',
    gulp.series(
        'serve'
    )
);
gulp.task('default',
    gulp.series(
        'serve'
        , 'watch'
    )
);