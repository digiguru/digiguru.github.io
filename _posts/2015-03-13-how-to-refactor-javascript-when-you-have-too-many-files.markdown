---
layout: post
title:  "How to refactor javascript when you have too many files"
date:   2015-03-13 20:00:00
categories: blog
tags: 
- javascript
- refactor
- closures
---

You know what I hate? Having to maintain a codebase of thousands of inter-connected javascript files that have layers upon layers of dependencies. Somewhere along the line we thought "It's good to separate concerns" - but I guess not everyone understood what "separate" means.

You know what I love? Refactoring.

Here is my step by step list of refactoring just one javascript file in a sea of interconnected files.

Firstly I will show an example javascript file.

{% highlight javascript %}
//ImageWrap.js
var imageCount = 0,
    imageList = [],
    lastId;

function addImage(id) {
    imageList.push(id);
    count++;
    lastId = id;
}

function getLastId() {
    return lastId;
}
{% endhighlight %}

Add a closure
=============

It's really hard to see in this function which functions are being used and where.

The very first thing I always do is wrap the whole file into a closure.


{% highlight javascript %}
//ImageWrap.js
(function( ImageWrap ) {

    var imageCount = 0,
        imageList = [],
        lastId;

    function addImage(id) {
        imageList.push(id);
        imageCount++;
        lastId = id;
    }

    function getLastId() {
        return lastId;
    }
    
}( window.ImageWrap = window.ImageWrap || {} ));
{% endhighlight %}

Now if you put this through jsHint it will tell you that none of the functions are being used, and can all be removed. So either this file is not needed (unlikely) or we need to search all the other files for missing javascript variable.

Search for each object in the global scope
==========================================

Firstly, let's move everything back into the global scope and move them in one by one.

{% highlight javascript %}
//ImageWrap.js

var imageCount = 0,
    imageList = [],
    lastId;

function addImage(id) {
    imageList.push(id);
    imageCount++;
    lastId = id;
}

function getLastId() {
    return lastId;
}

(function( ImageWrap ) {

}( window.ImageWrap = window.ImageWrap || {} ));
{% endhighlight %}


You need to select each global variable and function. First is "imageCount". This is not found in any other files, we can safely delete all references.

Searching for imageList gets found in another file "imageProcessing.js"...

{% highlight javascript %}

function displayImages() {
    for(var i=0;i<imageList.length;i++) {
        display(i);
    }
}

{% endhighlight %}

So to "fix" this, let's expose it as a function in the closure.

{% highlight javascript %}
//ImageWrap.js
var imageList = [],
    lastId;

function addImage(id) {
    imageList.push(id);
    lastId = id;
}

function getLastId() {
    return lastId;
}

(function( ImageWrap ) {
    
    ImageWrap.getImageList = function() {
        return imageList;
    }
    
}( window.ImageWrap = window.ImageWrap || {} ));

//imageProcessing.js
function displayImages() {
    for(var i=0;i<ImageWrap.getImageList().length;i++) {
        display(i);
    }
}

{% endhighlight %}

Run your pages - everything should still work. Yes - some things are still in the global scope, but we will move them when we are ready. Next, search for lastId. This too isn't found, but getLastId() is, so do the same refactor...


{% highlight javascript %}
//ImageWrap.js
var imageList = [],
    lastId;

function addImage(id) {
    imageList.push(id);
    lastId = id;
}

(function( ImageWrap ) {
    ImageWrap.getLastId = function() {
        return lastId;
    }
    ImageWrap.getImageList = function() {
        return imageList;
    }
    
}( window.ImageWrap = window.ImageWrap || {} ));
{% endhighlight %}

Next - we search for addImage(). We discover it hidden in a click event of an html anchor tag.

{% highlight html %}
<div>
    <a href="javascript:void(0);" onclick="addImage(1)">Add first image</a>
    <a href="javascript:void(0);" onclick="addImage(2)">Add second image</a>
    <a href="javascript:void(0);" onclick="addImage(3)">Add third image</a>
    <a href="javascript:void(0);" onclick="addImage(4)">Add fourth image</a>
</div>
{% endhighlight %}

We can easily clean this up... HTML needs just the data

{% highlight html %}
<div class="add-image">
    <a href="javascript:void(0);" data-id="1">Add first image</a>
    <a href="javascript:void(0);" data-id="2">Add second image</a>
    <a href="javascript:void(0);" data-id="3">Add third image</a>
    <a href="javascript:void(0);" data-id="4">Add fourth image</a>
</div>
{% endhighlight %}

And bind the event in the javascript...

{% highlight javascript %}
//ImageWrap.js
var imageList = [],
    lastId;
    
(function( ImageWrap ) {
    $(document).ready(function() {
        $(".add-image").click(function() {
            var id = $(this).data("id");
            imageList.push(id);
            lastId = id;
        });
    });
    ImageWrap.getLastId = function() {
        return lastId;
    }
    ImageWrap.getImageList = function() {
        return imageList;
    }
    
}( window.ImageWrap = window.ImageWrap || {} ));
{% endhighlight %}

And now everything is inside the closure, we can move the objects in.

{% highlight javascript %}
//ImageWrap.js
    
(function( ImageWrap ) {
    var imageList = [],
        lastId;

    $(document).ready(function() {
        $(".add-image").click(function() {
            var id = $(this).data("id");
            imageList.push(id);
            lastId = id;
        });
    });
    ImageWrap.getLastId = function() {
        return lastId;
    }
    ImageWrap.getImageList = function() {
        return imageList;
    }
}( window.ImageWrap = window.ImageWrap || {} ));
{% endhighlight %}

Done.