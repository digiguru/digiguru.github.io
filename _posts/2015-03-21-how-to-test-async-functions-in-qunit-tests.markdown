---
layout: post
title:  "How to test async functions in qUnit"
date:   2015-03-21 20:00:00
categories: blog
tags: 
- javascript
- qunit
- testing
---

Writing a qUnit test is fairly straight forward. The syntax is as follows:

{% highlight javascript %}

test("Here is a test", function() {
    ok(true, "A passing test.");
});

{% endhighlight %}

It doesn't work when you have anything that replies on async behaviour (ajax, settimeout, animation ect...).

{% highlight javascript %}
test("This won't work", function() {
    window.setTimeout(function () {
        ok(true, "This won't get associated with the test.");
    }, 1000);
});
{% endhighlight %}

The output is as follows:

<code>Expected at least one assertion, but none were run - call expect(0) to accept zero assertions.</code>

And then finds an assertion outside the test flow.

<code>Uncaught Error: ok() assertion outside test context</code>

If you want to write an asynchronous test, you will have to stop the test runner and tell it when to continue testing. This is the sytax to do so...

{% highlight javascript %}
test("Here is an async", function() {
    stop();
    window.setTimeout(function () {
        start();
        ok(true, "A passing test.");
    }, 1000);
});
{% endhighlight %}

If you don't like the concept of having to stop the test runner, there's a shorthand way to write this test.

{% highlight javascript %}
asyncTest("Another async test", function() {
    window.setTimeout(function () {
        start();
        ok(true, "Didn't have to say 'stop()'.");
    }, 1000);
});
{% endhighlight %}

This has been a primer for writing async tests in qUnit. In a later post, I will show a helper to help simulate ajax calls.


