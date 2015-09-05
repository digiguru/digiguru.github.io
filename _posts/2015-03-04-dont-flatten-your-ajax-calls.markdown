---
layout: post
title:  "Don't flatten your ajax calls"
date:   2015-03-04 20:00:00
categories: blog
tags: 
- javascript
- jquery
- async
---

A massive anti-pattern when dealing with Ajax calls in javacript is to send in a success parameter into the ajax options.

{% highlight javascript %}
function getInfoByID(id) {
    $.ajax({
        url: "/my-service/data",
        data: { rowID: id },
        success: function(data) {
            console.log("I've just got some data:", data);
        }
    });
}
getInfoByID(1);
{% endhighlight %}

Of course a better way would be to move the callback to another function (reusable).

{% highlight javascript %}
function getInfoByID(id) {
    $.ajax({
        url: "/my-service/data",
        data: { rowID: id },
        success: getInfoCallback
    });
}
function getInfoCallback(data) {
    console.log("I've just got some data:", data);
}
getInfoByID(1);
{% endhighlight %}

But this is still hard to read - your callback is now hidden as a one liner. I myself prefer to use the done function in ajax callbacks (added in version 1.5)

{% highlight javascript %}
function getInfoByID(id) {
    $.ajax({
        url: "/my-service/data",
        data: { rowID: id }
    }).done(getInfoCallback);
}
function getInfoCallback(data) {
    console.log("I've just got some data:", data);
}
getInfoByID(1);
{% endhighlight %}

It's still not really any better, we only really deal with the callback from inside the data call code. What I prefer to do is return the deferred.

{% highlight javascript %}
function getInfoByID(id) {
    return $.ajax({
        url: "/my-service/data",
        data: { rowID: id }
    });
}
function getInfoCallback(data) {
    console.log("I've just got some data:", data);
}
getInfoByID(1).done(getInfoCallback);
{% endhighlight %}

For me this code reads much nicer, done is now near the code we requested the data, and not in the "plumbing class" that actually deals with the ajax call.

Whenever there are async events in my javascript I far prefer to see the code that runs after the data comes back in closer proximity to the code that actually calls it.
