---
layout: post
title:  "How to simulate ajax in qunit tests"
date:   2015-03-22 20:00:00
categories: blog
tags: 
- javascript
- qunit
- testing
---

When writing qUnit, it often gets hard trying to simulate an ajax operation.

Often you find yourself writing passing tests, but then breaking them when you actually have to provide the data service, or worse tightly coupling them to the actual ajax calls, or hack apart your javascript just to write tests. This doesn't have to happen.

I have written a short helper to allow us to test async.

{% highlight javascript %}

function resolveAfter (time, args) {
    var dfd = new $.Deferred();
    window.setTimeout(function () {
        dfd.resolve(args);
    }, time || 1000);
    return dfd.promise();
}
function failAfter (time, args) {
    var dfd = new $.Deferred();
    window.setTimeout(function () {
        dfd.reject(args);
    }, time || 1000);
    return dfd.promise();
}
 
{% endhighlight %}

How does it work?

Imagine you have a very simple bit of code that shows results from the data set 

{% highlight javascript %}


$.fn.examplePlugin = function() {
 
    return this.each(function() {
        
        var $this = $(this);
        $this.on("click", function() {
            Data.getData().
                then(function(d) {
                    $this.data("pass", true);
                    $this.html(d.message);
                    $this.trigger("update");
                }).
                fail(function(args) {
                    $this.data("pass", false);
                    $this.text("Could not get any data");
                    $this.trigger("update");
                });
        });
        
    });
 
};
{% endhighlight %}

Now we should be writing qUnit tests to assert that it works in all scenarios.

Here are two such tests:

{% highlight javascript %}
//Create a mock object ready for faking the getData call
var Data = {getData: function() {}};

test("Control updates after a passed getData call", function () {
    stop();
    
    //Setup the UI.
    var $div = $("<div></div>").appendTo("body");
    $div.examplePlugin();
    
    //Setup the data service
    Data.getData = function() {
        return resolveAfter(10, {message: "example data"});
    };
    
    //Test the functionality
    $div.trigger("click");
    $div.on("update", function() {
        start();
        ok($div.data("pass"), "Sucessful service sets pass to true");
        equal($div.html(), "example data", "Data returned updates the UI");
    });
});

test("Control updates after a failed getData call", function () {
    stop();
    
    //Setup the UI.
    var $div = $("<div></div>").appendTo("body");
    $div.examplePlugin();
    
    //Setup the data service
    Data.getData = function() {
        return failAfter(10, {message: "example data"});
    };
    
    $div.trigger("click");
    $div.on("update", function() {
        start();
        ok(!$div.data("pass"), "Failed data set pass to false");
        equal($div.text(), "Could not get any data", "Failed data message");
    });
});
{% endhighlight %}

As you can see, we can mock out data request really easily with the style of data service. You simulate an existing Data service and get reliable output so you can test every scenario. This means there is no excuse to write code for if your data services fail to return with a success message - it's a very simple task to write code to test for the failing data service scenarios.
