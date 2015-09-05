---
layout: post
title:  "How to output mustache templates in a jekyll site"
date:   2015-03-31 22:00:00
categories: blog
tags: 
- templates
- mustache
- server
- liquid
---

I was having difficulty rendering a mustache template out as a code sample.

Here was my code sample...

<!--break-->
{% highlight html %}
{% raw %}
{{#.}}

<p>Hello, my name is {{name}}.</p>
<p>I am from {{hometown}}.</p>
<p>I have {{kids.length}} kids:</p>
<ul>
{{#kids}}
    <li>{{name}} is {{age}}</li>
{{/kids}}
</ul>
{{#.}}

{% endraw %}
{% endhighlight %}

So you write the above in a markdown file, and try wrapping it in <code>{% raw %} {% highlight html %} {% endraw %}</code>


{% highlight html %}
{% raw %}
{% highlight html %} 
...
{% endhighlight %}
{% endraw %}
{% endhighlight %}

And the output looks on the page as follows...

{% highlight html %}
{{#.}}

<p>Hello, my name is {{name}}.</p>
<p>I am from {{hometown}}.</p>
<p>I have {{kids.length}} kids:</p>
<ul>
{{#kids}}
    <li>{{name}} is {{age}}</li>
{{/kids}}
</ul>
{{#.}}
{% endhighlight %}

Hmm - not right. Perhaps I need a different highlighter - mustache?

{% highlight html %}
{% raw %}
{% highlight mustache %} 
...
{% endhighlight %}
{% endraw %}
{% endhighlight %}

But there was no change. 

After a bit of research I discovered the <code>raw</code> blocks, so wrapping the code in raw it output like this...

{% raw %}
{{#.}}

<p>Hello, my name is {{name}}.</p>
<p>I am from {{hometown}}.</p>
<p>I have {{kids.length}} kids:</p>
<ul>
{{#kids}}
    <li>{{name}} is {{age}}</li>
{{/kids}}
</ul>
{{#.}}

{% endraw %}

Almost - but there's no code tag wrapped around it. How about if we just add the code tag around it in the markdown file...

{% raw %}
<code>{{#.}}

<p>Hello, my name is {{name}}.</p>
<p>I am from {{hometown}}.</p>
<p>I have {{kids.length}} kids:</p>
<ul>
{{#kids}}
    <li>{{name}} is {{age}}</li>
{{/kids}}
</ul>
{{#.}}
</code>
{% endraw %}

No - the code black only works on the first line before it's auto closed by the browser.

I tried various methods of outputting it until I finally realised I need to wrap the original code script with.


{% highlight html %}
{{ "{% highlight html "}}%}
{{ "{% raw "}}%}
...
{{ "{% endraw "}}%}
{{ "{% endhighlight "}}%}
{% endhighlight %}

And this works!

{% highlight html %}
{% raw %}
{{#.}}

<p>Hello, my name is {{name}}.</p>
<p>I am from {{hometown}}.</p>
<p>I have {{kids.length}} kids:</p>
<ul>
{{#kids}}
    <li>{{name}} is {{age}}</li>
{{/kids}}
</ul>
{{#.}}
{% endraw %}
{% endhighlight %}

Excellent!

But... you think that's crazy? - it gets even weirder when you see what I had to write to make jekyll output the wrapper script I described above...

{% highlight html %}
{% raw %}
{{ "{% highlight html "}}%}
{{ "{% raw "}}%}
...
{{ "{% endraw "}}%}
{{ "{% endhighlight "}}%}
{% endraw %}
{% endhighlight %}

Basically I am using escaped code to output the "raw" tag. If I don't do that then liquid templates attempt to compile the interior as raw text, and get's a bit confused by opening and closing tags.


