/**
 * ===========================
 *  gulpfile.js
 *  —— 只在檔案最上面補了說明與分類備註 ——
 *
 * 你現在有哪些任務？
 * - serve    ：啟動 BrowserSync 靜態伺服器（根目錄 DEST），port=1234
 * - html     ：處理 src/*.html，支援 @include（gulp-file-include），輸出到 DEST
 * - image    ：壓縮 img/（pngquant/jpegtran/gifsicle），輸出到 public/img
 * - script   ：原樣複製 src/js/** → public/js（含 jshint 與 debug），不做打包/壓縮
 * - style    ：編譯 SCSS → autoprefixer → cleanCSS → *.min.css，輸出到 public/css
 * - watch    ：監聽 JS/CSS/IMG/HTML 變更後，分別觸發對應任務與自動重新整理
 * - build    ：一次跑 script/style/image，最後跑 html（給發佈前打包用）
 * - view     ：只啟動 serve（不 watch）
 * - default  ：serve + watch（開發時直接跑這個）
 *
 * 重要路徑：
 * - SRC  ：./src
 *   - SRC.HTML => src/*.html
 *   - SRC.TPL  => src/tpl/*.html（for file-include）
 *   - SRC.CSS  => src/scss\/**\/*.scss
 *   - SRC.JS   => src/js\/**\/*.js
 *   - SRC.IMG  => src/img/**\/*.{jpg,jpeg,png,gif,svg,ico,webp}
 * - DEST ：../（上層專案根目錄）
 *   - DEST.HTML => ../
 *   - DEST.CSS  => ../public/css/
 *   - DEST.JS   => ../public/js/
 *   - DEST.IMG  => ../public/img/
 *
 * 使用方式：
 *   開發：   gulp             （= serve + watch）
 *   單次建置：gulp build
 *   僅開伺服器：gulp view
 *
 * 後續大優化（下一步才做，不在本版改動）：
 *   - JS 打包（concat + terser + sourcemaps），單檔 app.min.js 或分組輸出
 *   - 生產環境旗標（--prod / NODE_ENV）控制壓縮與 sourcemap
 *   - ESLint 取代 jshint（可選）
 * ===========================
 */

"use strict";
const gulp = require('gulp')
    , bs = require('browser-sync').create()
    , sass = require('gulp-sass')(require('sass'))
    , rename = require("gulp-rename")
    , autoprefixer = require('gulp-autoprefixer')
    // , uglify = require('gulp-uglify')
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
    ;

const SRC = './src'
    , DEST = '../'
    , PATH = {
        SRC: {
            HTML: SRC + '/*.html'
            , TPL: SRC + '/tpl/*.html'
            , CSS: SRC + '/scss/**/*.scss'
            , JS: SRC + '/js/**/*.js'
            , IMG: SRC + '/img/**/*.{jpg,jpeg,png,gif,svg,ico,webp}'
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
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(changed(PATH.DEST.HTML, { hasChanged: changed.compareContents }))
        .pipe(debug({ title: 'Compile:' }))
        .pipe(gulp.dest(PATH.DEST.HTML))
        .pipe(bs.stream())
        .pipe(notify('html processed'));
});

/* image */
gulp.task('image', ()=>{
    gutil.log('Changes to `IMAGE` SRC files detected');

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
        .pipe(notify({
            message: '`IMAGE` task complete: <%= file.relative %>',
            onLast: true
        }));
});

/* script（原樣複製 JS，不做打包/壓縮） */
gulp.task('script', function () {
    gutil.log('Changes to `SCRIPT` SRC files detected');

    return gulp.src(PATH.SRC.JS)
        .on('error', gutil.log)
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', {
            verbose: true
        }))
        .pipe(debug({ title: 'Compile:' }))
        // .pipe(gulpUglify())                     // 將 JavaScript 做最小化
        // .pipe(gulp.dest('javascript/minify'));  // 指定最小化後的 JavaScript 檔案目錄
        .pipe(gulp.dest(PATH.DEST.JS))
        .pipe(bs.stream())
        .pipe(notify({
            message: '`SCRIPT` task complete: <%= file.relative %>',
            onLast: true
        }));
});

/* style（SCSS → autoprefixer → cleanCSS → *.min.css） */
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

/* watch（監聽變更） */
gulp.task('watch', function (cb){
    gulp.watch(PATH.SRC.JS, gulp.series('script') );
    gulp.watch(PATH.SRC.CSS, gulp.series('style') );
    gulp.watch(PATH.SRC.IMG, gulp.series('image') );
    gulp.watch([PATH.SRC.HTML, PATH.SRC.TPL], gulp.series('html'));
    cb && cb();
});

// gulp.task('clean', function () {
//     pump([
//         gulp.src(PATH.DEST.JS),
//         uglify(),
//         gulp.dest('dist')
//     ])
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