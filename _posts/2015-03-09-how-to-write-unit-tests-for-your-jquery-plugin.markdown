---
layout: post
title:  "How to write a unit test for your jQuery plugin"
date:   2015-03-09 20:00:00
categories: blog
tags: 
- jQuery
- Testing
- javascript
---

I think alot of people think that javascript is untestable, even less write tests for the jQuery plugins.

This is a real shame, as there are libraries out there like qUnit that allow test classes to be written for your javascript plugins.

Firstly let's set up your environment. You can use various testing tools or libraries - but I myself prefer to use <a href="http://brackets.io">brackets</a>, and you'll find an extension called <a href="http://brackets-xunit.github.io/">Brackets xUnit</a> that allows you to test javascrit files simply by writing a test and hitting save!

Firstly you want to put the following at the top of your javascript file...


{% highlight javascript %}
/*jslint plusplus: true */
/*jslint nomen: true*/
/*global $, test, ok, equal, module */
/* brackets-xunit: qunit */
/* brackets-xunit: includes=include1.js,include2.js,myfile.js* */
{% endhighlight %}

Let's disect this line by line.

{% highlight javascript %}
/*jslint plusplus: true */
{% endhighlight %}

This allows you to have ++ in your file. Some people don't like code in this way, but I find unless i am including an underscore dependancy then I will often just write loops using

{% highlight javascript %}
for(var i=0, l=arr.length; i < l; i++) {
 ...
}
{% endhighlight %}

which will result in a JSLint error unless you use plusplus: true.

{% highlight javascript %}
/*jslint nomen: true*/
{% endhighlight %}

This actually allows you to use the underscore character in your javascript variables - specifically it allows _ to be used. Once again, feel free to drop it.

{% highlight javascript %}
/*global $, test, ok, equal, module */
{% endhighlight %}

Here we are defining objects that we will use in this file. I am assuming if you want to write a jquery plugin then $ is mandatory, and test, ok, equal, module are all references to methos in qUnit.

{% highlight javascript %}
/* brackets-xunit: qunit */
{% endhighlight %}

Tells the X-Unit plugin that we are writing a qUnit test. It will attempt to automatically detect it from the method names in the file, but there's no harm in telling the app what sort of test it is for sure.

{% highlight javascript %}
/* brackets-xunit: includes=jquery.js,dependancy1.js,dependancy2.js,myfile.js* */
{% endhighlight %}

These are listing out dependancy files. For example you may have a plugin called "Modal.js" and it has a dependancy on fancybox.js and jquery. In that case you should write the following...

{% highlight javascript %}
/* brackets-xunit: includes=jquery.js,fancybox.js,Modal.js* */
{% endhighlight %}

This will include those files in the qunit.html file before it runs the tests.

Notice the last bit...

{% highlight javascript %}
Modal.js*
{% endhighlight %}

The star is a useful helper, it tells the testing library to run code coverage on this file. You wouldn't want to put the star on any dependancy - could you imagine how many lines in jquery you don't use in your library? However it's useful to have on the file you are writing tests for.

Writing your first test
=======================

Okay, so you are all setup - let's add some skeleton code to get the test running.


{% highlight javascript %}
(function () {
    "use strict";     
    
    module("My First Tests");

    test("Works on a plugin", function () {
    
        var $modal = $("<div></div>");
        $("body").append($modal);
        
        $modal.modal();
        
        equal($modal.length, 1, "Has one node");
        equal($modal.data("modal"), true, "Has modal");
        
    });

})();
{% endhighlight %}

So it's a very simple test - our modal.js library is going to be tested on a brand new div added to the UI dynamically. 

Note the last line - we are making sure that there is a data attribute in the root element. This is a really fundamental thing I advise when writing plugins - try to show the state of the plugin in data attributes. The following line should be run inside the plugin to stamp the state on the root.

{% highlight javascript %}
    $(this).data("modal", true);
{% endhighlight %}

Whenever an interaction updates the state try to make sure data attriibutes are used to describe the state. It makes it easier to see what the plugin is doing, especially from a test class. As long as the parameters inside the library are described by data attributes, it will make it easy to find the changes and assert the new state.

You're now free to start writing a whole load of tests for your library. I suggest one of the things you make sure you test is applying the plugin to multiple nodes in the dom - this is often an oversight in many developments.

{% highlight javascript %}
    test("Open - trigger 2 nodes", function () {
        
        var $modal = $("<div class='multiple'></div>");
        $("body")
            .append($modal)
            .append($modal);
            
        $(".multiple").modal();
        
        equal($(".multiple").length, 2, "Has 2 nodes");
        $(".multiple").each(function(i, v) {
            equal($(v).data("modal"), true, "Has modal");
        });
    });
{% endhighlight %}

This is a fundamental test I always write. Expand it with as much behaviour is necessary to ensure the logic is working.

Now to go for some more detailed tests. You should try to consume all the API endpoints to your plugin - work out the entropy and write a test for it. Luckily we have code coverage so it soon tells you when you are missing logic in the test.

Let's write another test 

{% highlight javascript %}

    test("Show action", function () {
    
        var $modal = $("<div></div>");
        $("body").append($modal);
        
        $modal.modal();
        
        equal($modal.find(".popup:visible"), true, "Popup is visible");
        
        $modal.find(".show").click();
        
        equal($modal.find(".popup:visible"), true, "Popup is visible");
        
    });
    
{% endhighlight %}

There are a few things wrong with this test, and all of these items are a result of tight coupling. We have a needed to check inside the document element to find things to test against, and then to trigger behaviour. Anywhere you see <pre>.find()</pre> in a test you know you have a problem. Firstly let's change look at the plugin itself.

{% highlight javascript %}
    var $modal = $(this);
    
    $modal.find(".show").on("click", function() {
        $modal.find(".popup").show();
    });
{% endhighlight %}

When you are writing your plugin, try to expose any state changes as events that you can trigger, rather than through just interaction events from inside the library.

Consider the following alternative

{% highlight javascript %}
    var $modal = $(this);
    
    $modal.on("show", function() {
        $modal.find(".popup").show();
    });
    
    $modal.find(".show").on("click", function() {
        $modal.trigger("show");
    });
{% endhighlight %}

This is not only easier to consume for consumers of your plugin but also makes more sense in tests.

{% highlight javascript %}

    test("Show action", function () {
        var $modal = $("<div></div>");
        $("body").append($modal);
        
        $modal.modal();
        
        equal($modal.find(".popup:visible"), true, "Popup is visible");
        
        //$modal.find(".show").click();
        $modal.trigger("show");
        
        equal($modal.find(".popup:visible"), true, "Popup is visible");
        
    });
    
{% endhighlight %}

This is better. Now let's update the state so we don't have to reach inside the plugin to discover the state...

{% highlight javascript %}
    var $modal = $(this);
    $modal.data("isShowing", false);
    
    $modal.on("show", function() {
        $modal.find(".popup").show();
        $modal.data("isShowing", true);
    });
    
    $modal.find(".show").on("click", function() {
        $modal.trigger("show");
    });
{% endhighlight %}

Excellent - basically we've created an abstraction for what the state feels like. Now we can write a test that is based on state rather than implementation.

{% highlight javascript %}

    test("Works on a plugin", function () {
        var $modal = $("<div></div>");
        $("body").append($modal);
        
        $modal.modal();
        
        //equal($modal.find(".popup:visible"), false, "Popup is visible");
        equal($modal.data("isShowing"), false, "Starts not showing");
        
        $modal.trigger("show");
        
        //equal($modal.find(".popup:visible"), true, "Popup is visible");
        equal($modal.data("isShowing"), true, "Starts not showing");
    });
    
{% endhighlight %}

Much better.

Finally - by writing the tests in the way we did we are actually rendering the plugin in the test page for every test. If you drop in some CSS you should be able to view every permiatation of the UI listed out one after the other because we've just been dropping the elements into the page at the end of the body tag. This is really cool. If you load your qunit.html page you should see all the variations rendered out one after the other.

In Conclusion
=============

Once you've setup your environment - it's important to think about the following features when writing testable jquery plugins.

- Use data on the plugin element to help describe the state.
- Create custom events so they can be consumed outside your plugin.
- Use the API you have written and test every permiatation
- Use the qunit.html to display all the states in one go

