---
layout: post
title:  "A seperation of concerns"
date:   2015-03-05 20:00:00
categories: blog
tags: 
- javascript
- css
- html
- antipattern
---


Another antipattern I come across in legacy codebases is  a lack of a separation of concern.

{% highlight html %}
<div id="main" style="width: 330px; border: 1px #ccc solid">
    <h1 onclick="loadList()">Top 5 girls name</h1>
    <ul style="display: none;">
        <li onclick="clickName('Sophia');" 
        style="border-top: 1px #ccc solid; border-left: 1px #ccc solid; border-right: 1px #ccc solid;">Sophia</li>
        <li onclick="clickName('Emma');" 
        style="background-color: #eee; border-left: 1px #ccc solid; border-right: 1px #ccc solid;">Emma</li>
        <li onclick="clickName('Olivia');" 
        style="border-left: 1px #ccc solid; border-right: 1px #ccc solid;">Olivia</li>
        <li onclick="clickName('Ava');" 
        style="background-color: #eee; border-left: 1px #ccc solid; border-right: 1px #ccc solid;">Ava</li>
        <li onclick="clickName('Isabella');" 
        style="border-left: 1px #ccc solid; border-right: 1px #ccc solid; border-bottom: 1px #ccc solid;">Isabella</li>
    </ul>
</div>
{% endhighlight %}

Here we have a few issues, but lets sweep through them one by one. Firstly CSS. Sadly the developer that did this sweep didn't really understand what you can do with CSS so offered this solution.

{% highlight css %}
#main { width: 330px; border: 1px #ccc solid; }
ul { display: none }
.firstListItem { border-top: 1px #ccc solid; border-left: 1px #ccc solid; border-right: 1px #ccc solid; }
.evenListItem { background-color: #eee; border-left: 1px #ccc solid; border-right: 1px #ccc solid; }
.oddListItem { border-left: 1px #ccc solid; border-right: 1px #ccc solid; }
.lastListItem { border-left: 1px #ccc solid; border-right: 1px #ccc solid; border-bottom: 1px #ccc solid; }
{% endhighlight %}

And the HTML 

{% highlight html %}
<div id="main">
    <h1 onclick="loadList()">Top 5 girls name</h1>
    <ul>
        <li class="firstListItem" onclick="clickName('Sophia');">Sophia</li>
        <li class="evenListItem" onclick="clickName('Emma');">Emma</li>
        <li class="oddListItem" onclick="clickName('Olivia');">Olivia</li>
        <li class="evenListItem" onclick="clickName('Ava');">Ava</li>
        <li class="lastListItem" onclick="clickName('Isabella');">Isabella</li>
    </ul>
</div>
{% endhighlight %}

The developer is asked what happens if we decide to have another name added - it dawns on them they need to create a new rule...

{% highlight css %}
.lastListItemEven { background-color: #eee; border-left: 1px #ccc solid; border-right: 1px #ccc solid; border-bottom: 1px #ccc solid; }
{% endhighlight %}

By now the developer is firefighting. What's better? here's a solution...

{% highlight css %}
#main { width: 330px; border: 1px #ccc solid; }
ul { display: none }
li { border-left: 1px #ccc solid; border-right: 1px #ccc solid; }
.first { border-top: 1px #ccc solid; }
.even { background-color: #eee; }
.last { border-bottom: 1px #ccc solid; }
{% endhighlight %}

With 

{% highlight html %}
<div id="main">
    <h1 onclick="loadList()">Top 5 girls name</h1>
    <ul>
        <li class="first odd" onclick="clickName('Sophia');">Sophia</li>
        <li class="even" onclick="clickName('Emma');">Emma</li>
        <li class="odd" onclick="clickName('Olivia');">Olivia</li>
        <li class="even" onclick="clickName('Ava');">Ava</li>
        <li class="last odd" onclick="clickName('Isabella');">Isabella</li>
    </ul>
</div>
{% endhighlight %}

Some developers seem scared to put multiple class names in one HTML element, but it's perfectly fine if you ask me - and in fact reads far better.

It's okay - but it does rely on the developer keeping the HTML up to date. One last sweep...

{% highlight html %}
<div id="main">
    <h1 onclick="loadList()">Top 5 girls name</h1>
    <ul>
        <li onclick="clickName('Sophia');">Sophia</li>
        <li onclick="clickName('Emma');">Emma</li>
        <li onclick="clickName('Olivia');">Olivia</li>
        <li onclick="clickName('Ava');">Ava</li>
        <li onclick="clickName('Isabella');">Isabella</li>
    </ul>
</div>
{% endhighlight %}

And

{% highlight css %}
#main { width: 330px; border: 1px #ccc solid; }
ul { display: none }
li { border-left: 1px #ccc solid; border-right: 1px #ccc solid; }
li:first-child { border-top: 1px #ccc solid; }
li:last-child { border-bottom: 1px #ccc solid; }
li:nth-child(odd) { background-color: #eee; }
{% endhighlight %}

Starting to feel good about the CSS. Now for the javascript. Let's assume we have javascript, but it very simple to write the code in vanilla JS as well.

{% highlight javascript %}
function clickName(name) {
  alert(name);
}
function loadList() {
    $("ul").show();
}
{% endhighlight %}


This relies on the html knowing the function names, but it turns into a maintinence nightmare if you ever use the JS in multiple files.

Here's how we solve it.
{% highlight html %}
<div id="main">
    <h1>Top 5 girls name</h1>
    <ul>
        <li>Sophia</li>
        <li>Emma</li>
        <li>Olivia</li>
        <li>Ava</li>
        <li>Isabella</li>
    </ul>
</div>
{% endhighlight %}
And

{% highlight javascript %}
$(document).ready(function() {
    $("h1").on("click", function() {
        loadList();
    });
    $("li").on("click", function() {
        var text = $(this).text();
        clickName(text);
    });
});
function clickName(name) {
  console.log(name);
}
function loadList() {
    $("ul").slideDown();
}
{% endhighlight %}

Not quite finished yet - let's honour the closure...

{% highlight javascript %}
$(document).ready(function() {
    function clickName(name) {
      console.log(name);
    }
    function loadList() {
        $("ul").slideDown();
    }
    $("h1").on("click", function() {
        loadList();
    });
    $("li").on("click", function() {
        var text = $(this).text();
        clickName(text);
    });
});
{% endhighlight %}

or

{% highlight javascript %}
$(document).ready(function() {
    $("h1").on("click", function() {
        $("ul").slideDown();
    });
    $("li").on("click", function() {
        console.log(name);
    });
});
{% endhighlight %}

Now one more cleanup - looks like we have a bit of div-iteous - let's clean up that div element by changing it to a more semantic one.

{% highlight css %}
article { width: 330px; border: 1px #ccc solid; }
ul { display: none }
li { border-left: 1px #ccc solid; border-right: 1px #ccc solid; }
li:first-child { border-top: 1px #ccc solid; }
li:last-child { border-bottom: 1px #ccc solid; }
li:nth-child(odd) { background-color: #eee; }
{% endhighlight %}

Finally the HTML

{% highlight html %}
<article>
    <h1>Top 5 girls name</h1>
    <ul>
        <li>Sophia</li>
        <li>Emma</li>
        <li>Olivia</li>
        <li>Ava</li>
        <li>Isabella</li>
    </ul>
</article>
{% endhighlight %}


Now we have HTML that simply structures some kind of data, CSS that styles the data into a document and javascript that enhances the data with some kind of behaviour. It's far more simple. Have another look at what it was before...

{% highlight html %}
<div id="main" style="width: 330px; border: 1px #ccc solid">
    <h1 onclick="loadList()">Top 5 girls name</h1>
    <ul style="display: none;">
        <li onclick="clickName('Sophia');" 
        style="border-top: 1px #ccc solid; border-left: 1px #ccc solid; border-right: 1px #ccc solid;">Sophia</li>
        <li onclick="clickName('Emma');" 
        style="background-color: #eee; border-left: 1px #ccc solid; border-right: 1px #ccc solid;">Emma</li>
        <li onclick="clickName('Olivia');" 
        style="border-left: 1px #ccc solid; border-right: 1px #ccc solid;">Olivia</li>
        <li onclick="clickName('Ava');" 
        style="background-color: #eee; border-left: 1px #ccc solid; border-right: 1px #ccc solid;">Ava</li>
        <li onclick="clickName('Isabella');" 
        style="border-left: 1px #ccc solid; border-right: 1px #ccc solid; border-bottom: 1px #ccc solid;">Isabella</li>
    </ul>
</div>
{% endhighlight %}

I know which I would prefer to upkeep.