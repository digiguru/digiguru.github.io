---
layout: post
title:  "Tracking scroll depth of elements in javascript"
date:   2015-03-23 20:00:00
categories: blog
tags: 
- javascript
- tracking
- scroll
- jquery
---

I wanted to make a plug that looked at what elements the user had scrolled into view for tracking purposes. Firstly we need to be able to capture when a user is scrolling on the page.

{% highlight javascript %}
(function() {
    var x =0;
    $(window).on("scroll", function() {
        x++;
        console.log("Scroll has been called " + x + " times");
    });
}());
{% endhighlight %}

Run this in a console window on any page with jQuery and the event fires thousands of times (every frame where jquery realises the user is scrolling)

If we add a throttle function to the page, like <a href="http://benalman.com/projects/jquery-throttle-debounce-plugin/
">Throttle / Debounce from Ben Alman</a> then we can fire the event every so often so the javascript isn't overrun.


{% highlight javascript %}
(function() {
    var x = 0;
    $(window).on("scroll", $.throttle( 1000, function() { 
        x++;
        console.log("Scroll has been called " + x + " times");
    }));
}());
{% endhighlight %}

Now we can test every second how far the user has scrolled - but we only trigger it if the user has continued scrolling. Now we should determine how far down the page the user has scrolled.


{% highlight javascript %}
(function() {
    var $window = $(window),
        docHeight = $(document).height(),
        winHeight = window.innerHeight || $window.height();
    $window.on("scroll", $.throttle( 1000, function() { 
        var scrollDistance = $window.scrollTop() + winHeight;
        x++;
        console.log(" scroll is at  " + scrollDistance);
    }));
}());
{% endhighlight %}

But we needn't log every time we scroll - only when we get further down the page.

{% highlight javascript %}
(function() {
    var maxScrollDistnace = 0,
        $window = $(window),
        docHeight = $(document).height(),
        winHeight = window.innerHeight || $window.height();
    $window.on("scroll", $.throttle( 1000, function() { 
        var scrollDistance = $window.scrollTop() + winHeight;
        if(scrollDistance > maxScrollDistnace) {
            maxScrollDistnace = scrollDistance;
            console.log("scroll got as far down as... " + maxScrollDistnace);
        }
    }));
}());
{% endhighlight %}

Now we want to check against a list of elements to see if they have become visible in the page. It's probably best at this moment to make this a jquery plugin, as we need to pass in a selector element.

{% highlight javascript %}

(function ( $ ) {
    $.fn.scrollLog = function(options) {
        var $window = $(window),
            docHeight = $(document).height(),
            winHeight = window.innerHeight || $window.height(),
            maxScrollDistnace = 0,
            selector = (options && options.selector) || "article",
            onLog = $.isFunction(options.onLog) ? options.onLog : function(e) {
                console.log("Scrolled to " + $(e).attr("class"));
            },
            elements = $(selector);
        $window.on("scroll", $.throttle( 1000, function() { 
            var scrollDistance = $window.scrollTop() + winHeight;
            if(scrollDistance > maxScrollDistnace) {
                maxScrollDistnace = scrollDistance;
                $.each(elements, function(index, e) {
                    if(!$(e).data("hasBeenSeen")) {
                        if ( scrollDistance >= $(e).offset().top ) {
                            $(e).data("hasBeenSeen", true);
                            onLog(e);
                        }
                    }
                });


            }
        }));
    };
}( jQuery ));
{% endhighlight %}

Now apply this to any page using the following line:

{% highlight javascript %}
$.fn.scrollLog();
{% endhighlight %}

And it will tell you in console.log every time you scroll one of your "article" html elements into the view.

Other examples would be, if you wanted fire an ajax call to record the id every time you got scrolled a list item of type SearchResult into view, you can use this...

{% highlight javascript %}
$.fn.scrollLog({
    selector:"li.searchResult",
    onLog:function(e) {
        var id = $(e).id;
        $.ajax("/user/viewed/" + id);
    }
});
{% endhighlight %}

This script could probably do with some enhancements - ie - what if the user resizes the window? If so it'd probably be best to reset the <code>docHeight</code>, <code>winHeight</code> & <code>maxScrollDistnace</code> parameters to make sure we reset where the user has got to for responsive layouts.

I have done a little bit of research and it seems there are some interesting examples of similar work online, like <a href="http://scrolldepth.parsnip.io/">Scrolldepth</a> which is intended for Google Analytics tracking.
             
