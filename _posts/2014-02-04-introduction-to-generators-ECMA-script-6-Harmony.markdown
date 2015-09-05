---
layout: post
title:  "Introduction to generators - ECMA script 6 Harmony"
date:   2014-02-04 23:27:34
categories: blog
tags: 
- javascript
- generators
- code
---

I was just trying out the new formatting styles available in javascript, I was pretty stunned by the way the new Yeild iterator works.

A very simple yeild in javascript
=================================

{% highlight javascript %}

var yeildingFunction = function*() {
    yield "fred";
    yield "bob";
    return "sue";
},
    i = yeildingFunction();
console.log(i.next());
console.log(i.next());
console.log(i.next());
{% endhighlight %}

The output is as follows:

{% highlight javascript %}
//Object {value: "fred", done: false}
//Object {value: "bob", done: false}
//Object {value: "sue", done: true} 
{% endhighlight %}

This is interesting. The yeild statement effectively will halt execution inside a function and allow us to step through values.

Also of note if you try to iterte the function a further tiem after it is "done" you will see the following;

{% highlight javascript %}
console.log(i.next());
//Error: Generator has already finished
{% endhighlight %}

Okay - so it's probably best to loop through iterators until you see they are "done"...

{% highlight javascript %}
var yeildingFunction = function*() {
    yield "fred";
    yield "bob";
    return "sue";
},
    i = yeildingFunction(),
    next;
do {
    next = i.next();
    console.log(next.value);
} while(!next.done)

//fred
//bob
//sue
{% endhighlight %}

That's just a little exploration into generators. It's an interesting paradigm, and it will definitely open the door to useful ways of writing code.