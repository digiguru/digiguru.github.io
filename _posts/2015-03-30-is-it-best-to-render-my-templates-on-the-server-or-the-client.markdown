---
layout: post
title:  "Is it best to render my templates on the server or the client?"
date:   2015-03-30 22:00:00
categories: blog
tags: 
- templates
- mustache
- server
- client
---

A question that I sometimes get asked is "Should I render my templates on the client or the server?". The trick answer is "Both".

The best thing I've done in the past year is to make some code that would render my templates on the server in exactly the same way that they would be rendered if they happened to be on the client as well. Why is this? Well firstly - the most important thing for any application is ...

Does your site content appear for every user?
=============================================

There is no excuse. Make sure your users recieve the content. That is HTML marking up the words you wanted to display them. This is useful for Acceessibility. It's useful for robots. It's useful for mobile. It's useful for everyone just downlaod the data to them as HTML.

Consider the following UserControl.

{% highlight aspx-vb %}

<asp:Repeater>
    <ItemTemplate>
        <p>Hello, my name is <%# Container.DataItem.Name %></p>
        <p>I am from <%# Container.DataItem.Hometown %>.</p>
        <p>I have <%# Container.DataItem.Kids.Count %> kids:</p>
        <ul>
        <asp:Repeater>
            <ItemTemplate>
                <li><%# Container.DataItem.Name %> 
                is 
                <%# Container.DataItem.Age %></li>
            </%#>ItemTemplate>
        </asp:Repeater> 
        </ul>
    </ItemTemplate>
</asp:Repeater> 

{% endhighlight %}

I alos write a load of Binding data in the back end in VB or cSharp, and eventually I have fulfilled the first requirement to ouptut the data on the server.

Do you have rich content?
=========================

Next you want to be able to make the site sing when you are dealing with a browser that is capable of javascript, AJAX and rich content. Do you have the ability to enhance the experience for the user? The only way I can get to do that is to rewrite the above code in a way javascript will understand. There are many templating libraries in javascript but Mustache seems to be the lowest common denominator between most of them.


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

The best thing about the above code, is it requires almost no plumbing to work - just send in some JSON and it will render.

Does this mean you need to have a separate UserControl and mustache template for anything on your site?

No!

If you use a library like <a href="https://github.com/jdiamond/Nustache">Nustache</a> you can actually render the mustache templates server side as you would client side. It also does something far more powerful in my opinion - it abstracts away your server side programming language.

By using Mustache templates I am saying "It doesn't matter if I decide to do away with .NET on the server, I can find any of the <a href="http://mustache.github.io/">other languages that support it</a> (36 at the time of writing) so that I can always send server requests to another app - and even optimize the server depending on the best performance.

