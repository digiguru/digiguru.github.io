---
layout: post
title:  "Fecth API - one more dependency out of your javascript code"
date:   2015-03-14 20:00:00
categories: blog
tags: 
- javascript
- fetch
- es6
---
Ajax requests have been one of the brightest things to happen to the web. It enabled richer applications. Finally the web consortium has agreed on an API to simplify the activity of getting data into a document after it has loaded.

Back in the day we used <code>XMLHttpRequest()</code> - but different browsers had different implementations.
<!--break-->
jQuery then suggested an API to get data from the server, and we had <code>$.ajax()</code>.

This worked well, but every day jQuery is falling out of favour, as it's a library to make browsers behave the same, but most use cases use a fraction of the codebase. This gave rise to Sizzle, the selector engine in jQuery being branched off, and others following suite like <code>Zepto.js</code> - even the browsers added querying with <code>document.querySelectorAll</code>

You can find alot of these micro libraries at <a href="http://microjs.com/">http://microjs.com/</a>.

Now the browsers and the standard agencies are looking at moving alot of this functionality to the browser. Finally the web standard for ajax has arrived - and it's in the form of <code>Fetch</code>.

Here is what we use to do in jQuery ajax.
{% highlight javascript %}
$.ajax("/api/getData").then(function(d) {
    if(d.statusCode() >= 200 && d.statusCode() < 300 ) {
        console.log("I got some data", d.data);
    }
});
{% endhighlight %}


Here it is using the new fetch api.

Here is what we use to do in jQuery ajax.
{% highlight javascript %}
fetch("/api/getData").then(function(d) {
    if (response.status >= 200 && response.status < 300) {  
        console.log("I got some data", d.json());
    }
});
{% endhighlight %}

Looks very similar huh? But this one doesn't come with a large dependency.

SO is it ready to use in production? Well, no, but you can polyfill while browsers catch up, but I'd much prefer to move as many dependant libraries out of my code so I can focus on adding new functionality.
