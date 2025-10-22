/**
 * ===========================
 *  gulpfile.js（移除 gulp-util）
 *  使用 fancy-log / ansi-colors / plugin-error 取代
 * ===========================
 */

"use strict";
const gulp = require('gulp'),
    bs = require('browser-sync').create(),
    sass = require('gulp-sass')(require('sass')),
    rename = require("gulp-rename"),
    autoprefixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    log = require('fancy-log') // ← 取代 gutil.log
    ,
    colors = require('ansi-colors') // ← 若要彩色輸出用（可選）
    ,
    cleanCSS = require('gulp-clean-css'),
    changed = require('gulp-changed'),
    imagemin = require('gulp-imagemin'),
    fileinclude = require('gulp-file-include'),
    debug = require('gulp-debug'),
    eslint = require('gulp-eslint-new');

const SRC = './src',
    DEST = '../',
    PATH = {
        SRC: {
            HTML: SRC + '/*.html',
            TPL: SRC + '/tpl/*.html',
            CSS: SRC + '/scss/**/*.scss',
            JS: SRC + '/js/**/*.js',
            IMG: SRC + '/img/**/*.{jpg,jpeg,png,gif,svg,ico,webp}'
        },
        DEST: {
            HTML: DEST,
            CSS: DEST + '/public/css/',
            JS: DEST + '/public/js/',
            IMG: DEST + '/public/img/'
        }
    };

// ====== Server ======
gulp.task('serve', function(cb) {
    bs.init({
        server: { baseDir: DEST, reloadDebounce: 3000 },
        // https: true,
        port: 1234,
        open: 'external'
    });
    cb && cb();
});

// ====== HTML ======
gulp.task('html', () => {
    return gulp.src(PATH.SRC.HTML)
        .pipe(fileinclude({ prefix: '@@', basepath: '@file', indent: true }))
        .pipe(changed(PATH.DEST.HTML, { hasChanged: changed.compareContents }))
        .pipe(debug({ title: 'Compile:' }))
        .pipe(gulp.dest(PATH.DEST.HTML))
        .pipe(bs.stream())
        .pipe(notify('html processed'));
});

// ====== Images ======
gulp.task('image', () => {
    log('Changes to', colors.cyan('IMAGE'), 'SRC files detected');
    return gulp.src(PATH.SRC.IMG)
        .pipe(plumber())
        .pipe(changed(PATH.DEST.IMG))
        .pipe(imagemin([
            require('imagemin-pngquant')(),
            require('imagemin-jpegtran')({ quality: 70 }),
            require('imagemin-gifsicle')()
        ], { verbose: true }))
        .pipe(gulp.dest(PATH.DEST.IMG))
        .pipe(bs.stream())
        .pipe(notify({ message: '`IMAGE` task complete: <%= file.relative %>', onLast: true }));
});

// ====== Styles (SCSS) ======
gulp.task('style', () => {
    log('Changes to', colors.cyan('STYLE'), 'SRC files detected');
    return gulp.src(PATH.SRC.CSS)
        .pipe(plumber())
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 1%', 'last 5 versions', 'Firefox >= 45', 'iOS >=8', 'Safari >=8', 'ie >= 10'],
            grid: true,
            cascade: false
        }))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename(function(path) { path.basename += ".min"; }))
        .pipe(debug({ title: 'Compile:' }))
        .pipe(gulp.dest(PATH.DEST.CSS))
        .pipe(bs.stream())
        .pipe(notify({ message: '`STYLE` task complete: <%= file.relative %>', onLast: true }));
});

// ====== Lint (ESLint) ======
gulp.task('lint', () => {
    return gulp.src([PATH.SRC.JS, '!**/*.min.js'])
        .pipe(plumber())
        .pipe(eslint())
        .pipe(eslint.format())
    // .pipe(eslint.failAfterError()) // 若要在錯誤時中斷任務，打開這行
});

// ====== Scripts （原樣複製 JS；先跑 Lint） ======
gulp.task('script', gulp.series('lint', function() {
    log('Changes to', colors.cyan('SCRIPT'), 'SRC files detected');
    return gulp.src(PATH.SRC.JS)
        .on('error', log) // ← 取代 .on('error', gutil.log)
        .pipe(plumber())
        .pipe(debug({ title: 'Compile:' }))
        .pipe(gulp.dest(PATH.DEST.JS))
        .pipe(bs.stream())
        .pipe(notify({ message: '`SCRIPT` task complete: <%= file.relative %>', onLast: true }));
}));

// ====== Watch ======
gulp.task('watch', function(cb) {
    gulp.watch(PATH.SRC.JS, gulp.series('script'));
    gulp.watch(PATH.SRC.CSS, gulp.series('style'));
    gulp.watch(PATH.SRC.IMG, gulp.series('image'));
    gulp.watch([PATH.SRC.HTML, PATH.SRC.TPL], gulp.series('html'));
    cb && cb();
});

// ====== Build / View / Default ======
gulp.task('build', gulp.series(
    gulp.parallel('script', 'style', 'image'),
    'html'
));
gulp.task('view', gulp.series('serve'));
gulp.task('default', gulp.series('serve', 'watch'));