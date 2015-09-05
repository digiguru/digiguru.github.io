---
layout: post
title:  "The holy grail of javascript loaders"
date:   2015-03-03 20:00:00
categories: blog
tags: 
- javascript
- requirejs
- commonjs
- es6
---

So I've been watching the world of module loaders in javascript over the past few year, too nervous to jump in to either <a href="http://www.commonjs.org/">CommonJS</a> or <a href="http://requirejs.org/docs/whyamd.html">RequireJS</a> in fear of getting it wrong.

Just as we started to feel like making the jump, ES6 modules seemed to take the world by storm, offering a fresh new and elegant solution. The fear is - es6 modules are not baked into the browsers yet, so is it too risky to jump into ES6 already?

My answer is no!

The reason I can confidently start looking into es6 is because I know there are tools out there that can help me during the transition. Many projects are looking into creating ES6 transpilers that take ES6 as a source and output raw javascript for backwards compatibility. Projects like <a href="https://github.com/esnext/es6-module-transpiler">the es6 module transpiler</a> are a perfect example.

Here is a very simple ES6 module.

{% highlight javascript %}
export var test = 'Hello';
export class MyClass {
  constructor() {
    console.log('ES6 Class!');
  }
};
{% endhighlight %}

If I drop that into a folder with the following gruntfile...



{% highlight javascript %}
module.exports = function(grunt) {

  grunt.initConfig({
     transpile: {
        cjs: {
          type: "cjs", // or "amd" or "yui"
          files: [{
            expand: true,
            src: ['**/*.js'],
            dest: 'output/cjs/'
          }]
        },
        amd: {
          type: "amd", // or "amd" or "yui"
          files: [{
            expand: true,
            src: ['**/*.js'],
            dest: 'output/amd/'
          }]
        }
    }
  });

  grunt.loadNpmTasks('grunt-es6-module-transpiler');

  grunt.registerTask('default', ['transpile:amd','transpile:cjs']);

};
{% endhighlight %}

(Of course I have to make sure I have grunt instaleld along with the relevant plugin

{% highlight bash %}

$ npm install -g grunt-cli
$ npm install grunt-es6-module-transpiler --save-dev

{% endhighlight %}

Now I just run the grunt task...
{% highlight bash %}
$ grunt
{% endhighlight %}

And voila - it outputs some beutiful module code in both AMD and CommonJS...

{% highlight javascript %}
// amd/app.js
define("example", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var test = 'Hello';
    __exports__.test = test;export class MyClass {
      constructor() {
        console.log('ES6 Class!');
      }
    };
  });


// cjs/app.js
"use strict";
var test = 'Hello';
exports.test = test;export class MyClass {
  constructor() {
    console.log('ES6 Class!');
  }
};

{% endhighlight %}

Nice! Now I can defer the decision until later.