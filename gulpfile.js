let project_folder = 'dist';
let source_folder = '#src';

let fs = require('fs')

let path = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/css/',
        js: project_folder + '/js/',
        img: project_folder + '/img/',
        fonts: project_folder + '/fonts/'
    },
    src: {
        html: source_folder + '/*.html',
        css: source_folder + '/scss/style.scss',
        js: source_folder + '/js/script.js',
        img: source_folder + '/img/**/*.{png,svg,jpg,gif,ico,webp}',
        fonts: source_folder + '/fonts/*.ttf'
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.{png,svg,jpg,gif,ico,webp}'
    },
    clean: './' + project_folder + '/'
};


let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include');
    del = require('del');
    scss = require('gulp-sass');
    autoprefixer = require('gulp-autoprefixer');
    cleanCss = require('gulp-clean-css');
    rename = require('gulp-rename');
    uglify = require('gulp-uglify-es').default;
    imagemin = require('gulp-imagemin');
    svgSprite = require('gulp-svg-sprite');
    ttf2woff = require('gulp-ttf2woff');
    ttf2woff2 = require('gulp-ttf2woff2');
    fonter = require('gulp-fonter')
function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: './' + project_folder + '/'
        },
        port: 3000,
        notify: false
    })
}

function handlerHtml() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}
function handlerJs() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}
function handlerImages() {
    return src(path.src.img)
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function handlerCss() {
    return src(path.src.css)
    .pipe(
        scss({
            outputStyle: 'expanded',
            allowEmpty: true
        })
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascad: true
            })
            )
        .pipe(dest(path.build.css))
        // .pipe(webp_css())
        .pipe(cleanCss())
        .pipe(
            rename({
                extname: ".min.css"
            })
            )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}
function watchFiles(params) {
    gulp.watch([path.watch.html], handlerHtml);
    gulp.watch([path.watch.css], handlerCss);
    gulp.watch([path.watch.js], handlerJs);
    gulp.watch([path.watch.img], handlerImages);
}
function handlerFonts(params){
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
  return   src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
}
function cleanDist() {
    return del(path.clean)
}

gulp.task('otf2ttf', function () {
  return src([source_folder + '/fonts/*.otf'])
  .pipe(fonter({
    formats: ['ttf']
  }))
  .pipe(dest(source_folder + '/fonts/'))
})

function connectFonts(params) {
  let file_content = fs.readFileSync(source_folder+'/scss/fonts.scss')
  if (file_content == '') {
    fs.writeFile(source_folder+'/scss/fonts.scss','',cb)
    return fs.readdir(path.build.fonts, function(err,items){
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];
          console.log(fontname);
          if (c_fontname != fontname) {
            fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb)
          }
          c_fontname = fontname
        }
      }
    })
  }
}

function cb() {

}

//Различные ф-ции которые должны выполнятся
let build = gulp.series(cleanDist, gulp.parallel(handlerCss, handlerHtml, handlerJs, handlerImages, handlerFonts), connectFonts);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = handlerHtml;
exports.css = handlerCss;
exports.js = handlerJs;
exports.fonts = handlerFonts;
exports.images = handlerImages;
exports.connectFonts = connectFonts;
exports.build = build;
exports.watch = watch;
exports.default = watch;
