"use strict";

var gulp = require('gulp');
var connect = require('gulp-connect'); //Runs a local dev server
var open = require('gulp-open'); //Open a URL in a web browser
var browserify = require('browserify'); // Bundles JS
var reactify = require('reactify');  // Transforms React JSX to JS
var source = require('vinyl-source-stream'); // Use conventional text streams with Gulp
var concat = require('gulp-concat'); //Concatenates files
var lint = require('gulp-eslint'); //Lint JS files, including JSX
var inject = require('gulp-inject');

var config = {
	port: 9005,
	devBaseUrl: 'http://localhost',
	paths: {
		html: './src/*.html',
		js: './src/**/*.js',
        images: './src/images/*',
		css: [
      		'node_modules/bootstrap/dist/css/bootstrap.min.css',
      		'node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
            'node_modules/toastr/toastr.css'
    	],
		dist: './dist/prod',
		mainJs: './src/main.js'
	}
}

//Start a local development server
gulp.task('connect', function() {
	connect.server({
		root: ['dist/prod'],
		port: config.port,
		base: config.devBaseUrl,
		livereload: true
	});
});

gulp.task('open', ['connect'], function() {
	gulp.src('dist/prod/index.html')
		.pipe(open({ uri: config.devBaseUrl + ':' + config.port + '/'}));
});

gulp.task('html-prod', function() {
	gulp.src(config.paths.html)
		.on('error', console.error.bind(console))
		.pipe(gulp.dest(config.paths.dist))
		.pipe(connect.reload());
});

gulp.task('index-prod', ['html-prod'], function () {
  var target = gulp.src('./dist/prod/index.html'); 
  var jsSources = gulp.src(['./dist/prod/**/*.js'], {read: false});
  var cssSources = gulp.src('./dist/prod/**/*.css', {read: false});
 
  return target.pipe(inject(jsSources))
    .pipe(inject(cssSources))
    .pipe(gulp.dest('./dist/prod'));
});

gulp.task('js', function() {
	browserify(config.paths.mainJs)
		.transform(reactify)
		.bundle()
		.on('error', console.error.bind(console))
		.pipe(source('bundle.js'))
		.pipe(gulp.dest(config.paths.dist + '/scripts'))
		.pipe(connect.reload());
});

gulp.task('css', function() {
	gulp.src(config.paths.css)
		.pipe(concat('bundle.css'))
		.pipe(gulp.dest(config.paths.dist + '/css'));
});

gulp.task('images', function () {
    gulp.src(config.paths.images)
        .pipe(gulp.dest(config.paths.dist + '/images'))
        .pipe(connect.reload());
        
    gulp.src('./src/favicon.ico')
        .pipe(gulp.dest(config.paths.dist));
});

gulp.task('lint', function() {
	return gulp.src(config.paths.js)
		.pipe(lint({config: 'eslint.config.json'}))
		.pipe(lint.format());
});

gulp.task('watch', function() {
	gulp.watch(config.paths.html, ['html-prod']);
	gulp.watch(config.paths.js, ['js', 'lint']);
});

gulp.task('prod', ['html-prod', 'index-prod', 'js', 'css', 'images', 'lint', 'open', 'watch']);

//Dev server for debugging
var devconfig = {
	port: 9008,
	devBaseUrl: 'http://localhost',
	paths: {
		html: './src/*.html',
		js: './src/**/*.js',
        images: './src/images/*',
		css: [
      		'node_modules/bootstrap/dist/css/bootstrap.min.css',
      		'node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
            'node_modules/toastr/toastr.css'
    	],
		dist: './dist/dev',
		mainJs: './src/main.js'
	}
}

gulp.task('connect-dev', function() {
	connect.server({
		root: ['dist/dev'],
		port: devconfig.port,
		base: devconfig.devBaseUrl,
		livereload: true
	});
});

gulp.task('open-dev', ['connect-dev'], function() {
	gulp.src('dist/dev/index.html')
		.pipe(open({ uri: devconfig.devBaseUrl + ':' + devconfig.port + '/'}));
});

gulp.task('html-dev', function() {
	gulp.src(devconfig.paths.html)
		.on('error', console.error.bind(console))
		.pipe(gulp.dest(devconfig.paths.dist))
		.pipe(connect.reload());
});

gulp.task('js-dev', function() {        
    browserify(config.paths.mainJs, {debug:true})
		.transform(reactify)
		.bundle()
		.on('error', console.error.bind(console))
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('dist/dev/scripts'))
		.pipe(connect.reload());
});

gulp.task('css-dev', function() {
	gulp.src(devconfig.paths.css)
		.on('error', console.error.bind(console))
		.pipe(gulp.dest(devconfig.paths.dist + '/css'))
		.pipe(connect.reload());
});

gulp.task('index-dev', ['html-dev', 'js-dev', 'css-dev'], function () {
    gulp.src('./dist/dev/*.html')
        .pipe(inject(gulp.src('./dist/dev/**/*.css', {read: false}), {relative: true}))
        .pipe(gulp.dest('./dist/dev'));
});

gulp.task('images-dev', function () {
    gulp.src(devconfig.paths.images)
        .pipe(gulp.dest(devconfig.paths.dist + '/images'))
        .pipe(connect.reload());
        
    gulp.src('./src/favicon.ico')
        .pipe(gulp.dest(devconfig.paths.dist));
});

gulp.task('lint-dev', function() {
	return gulp.src(devconfig.paths.js)
		.pipe(lint({config: 'eslint.config.json'}))
		.pipe(lint.format());
});

gulp.task('watch-dev', function() {
	gulp.watch(devconfig.paths.html, ['html-dev', 'index-dev']);
	gulp.watch(devconfig.paths.js, ['js-dev', 'lint-dev']);
});

gulp.task('dev', ['html-dev', 'js-dev', 'css-dev', 'index-dev', 'images-dev', 'lint-dev', 'open-dev', 'watch-dev']);