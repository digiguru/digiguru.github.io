---
layout: post
title:  "Using scss compilation and master CSS files"
date:   2016-05-31 22:00:00
categories: blog
tags: 
- scss
- gulp
- npm
---
We've been working on our Master CSS files. These are files that repsent a section of the site.

Historically we would dump a load of CSS files in a <code>MasterSiteAreaCSS.aspx</code> and it would look somethign like the following....

{% highlight aspx-vb %}
<%@ Page language="VB" ContentType="text/css" Inherits="BaseCompressedText"  %>
<!-- #Include virtual="~/Css/global.css" -->
<!-- #Include virtual="~/Css/tabs.css" -->
<!-- #Include virtual="~/Css/fancybox.css" -->
<!-- #Include virtual="~/SiteArea/Css/SearchResults.css" -->
<!-- #Include virtual="~/SiteArea/Css/Detail.css" -->
{% endhighlight %}

This has served it's purpose for years, but it's getting very tired. Firstly it relies on a nasty ASP Includes hack. It also doesn't allow us to do anything clever with the CSS files.

Our frontend dev is desperate to get on to playing with SCSS, so we decided to start playing with it to see what little changes we could make to our code to get a similar implementation using SCSS.

Here's our first attempt:

{% highlight scss %}
@import '/Css/global';
@import '/Css/tabs';
@import '/Css/fancybox';
@import '/SiteArea/Css/SearchResults.css';
@import '/SiteArea/Css/Detail.css';
{% endhighlight %}

This worked for files in the same directory, but we seemed to get errors when trying to get files off the route.

Eventually I worked out the correct syntax is to use <code>./</code> notation../

{% highlight scss %}
@import './Css/global';
@import './Css/tabs';
@import './Css/fancybox';
@import './SiteArea/Css/SearchResults.css';
@import './SiteArea/Css/Detail.css';
{% endhighlight %}

Which now seemed to work from an IDE, but had issues when talking to a build server. What we needed to do was add metadata to describe the compilation process for a build command to pick up.

We opted for <a href="http://gulpjs.com">Gulp</a>

## package.json
{% highlight json %}
{
    "name": "mywebsite",
    "version": "1.0.0",
    "description": "My Website dependencies",
    "devDependencies": {
        "gulp": "^3.9.1",
        "gulp-sass": "^2.3.1"
    }
} 
{% endhighlight %}

## gulpfile.js
{% highlight javascript %}
var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function () {
  return gulp.src('./**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./'));
});
{% endhighlight %}

This got us the behaviour we wanted. Time to go further, could we minify the css as well?

## package.json
{% highlight json %}
{
    "name": "mywebsite",
    "version": "1.0.0",
    "description": "My Website dependencies",
    "devDependencies": {
        "gulp": "^3.9.1",
        "gulp-sass": "^2.3.1",
        "gulp-clean-css": "^2.0.9",
        "gulp-sourcemaps": "^1.6.0"
    }
} 
{% endhighlight %}

## gulpfile.js
{% highlight javascript %}
var gulp = require('gulp');
var sass = require('gulp-sass');
var clean = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', function () {
    return gulp.src('./**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(filter)
    .pipe(sass({}).on('error', sass.logError))

    .pipe(clean({ compatibility: 'ie8' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
});
{% endhighlight %}

Looking good, but then we realised it was doing some compilation in areas we didn't want it to.

We decided to include gulp-filter to fix this.

## package.json
{% highlight json %}
{
    "name": "mywebsite",
    "version": "1.0.0",
    "description": "My Website dependencies",
    "devDependencies": {
        "gulp": "^3.9.1",
        "gulp-sass": "^2.3.1",
        "gulp-clean-css": "^2.0.9",
        "gulp-sourcemaps": "^1.6.0",
        "gulp-filter": "^4.0.0"
    }
} 
{% endhighlight %}

## gulpfile.js
{% highlight javascript %}
var gulp = require('gulp');
var sass = require('gulp-sass');
var clean = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var filters = require('gulp-filter');

gulp.task('sass', function () {
    var filter = filters(function (file) {
        return file.path.indexOf("exclude-folder") === -1 && file.path.indexOf("node_modules") === -1;
    });
    
    return gulp.src('./**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(filter)
    .pipe(sass({}).on('error', sass.logError))

    .pipe(clean({ compatibility: 'ie8' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
});
{% endhighlight %}

This seemed to work nicely. I wanted to get <code>gulp-filter</code> working without the function - there is a declaritive syntax, but I couldn't get it working.

Remeber to add <code>node_modules</code> to your <code>.gitignore</code> file.