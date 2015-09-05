---
layout: post
title:  "Don't use an OR statement in your join clause"
date:   2015-03-12 20:00:00
categories: blog
tags: 
- sql
- join
- performance
---

Found an interesting little problem recently. We had a query we wanted to upgrade for the next release, and added an OR statement to allow us to pre-release the functionality for the new code drop. This had a really big impact on performance and caused lots of issues.

When we investigated it turns out that OR queries in a join are really expensive. Consider the following statement.
<!--break-->
{% highlight sql %}
Select 
    child.FirstName,
    child.Surname,
    parent.FirstName,
    parent.Surname
From Children child
    Inner Join Parents parent
    On child.MothersOriginalSurname = parent.MaidenName
    Or child.Surname = parent.Surname
{% endhighlight %}

The sql query analyser can't do anything to optimize this query, and effectively runs the following...

{% highlight sql %}
Select 
    child.FirstName,
    child.Surname,
    parent.FirstName,
    parent.Surname
From Children child
    Inner Join Parents parent
    On child.MothersOriginalSurname = parent.MaidenName
Union 
Select 
    child.FirstName,
    child.Surname,
    parent.FirstName,
    parent.Surname
From Children child
    Inner Join Parents parent
    On child.Surname = parent.Surname
{% endhighlight %}

If you want to squeeze performance out of it - consider the following alternative...

{% highlight sql %}
Select 
    child.FirstName,
    child.Surname,
    Coalesce(father.FirstName, mother.FirstName) As Firstname,
    Coalesce(father.Surname, mother.Surname) As Surname
From Children child
    Left Outer Join Parents mother
    On child.MothersOriginalSurname = mother.MaidenName
    Left Outer Join Parents father
    On child.Surname = mother.Surname
{% endhighlight %}

This runs more quickly.

Obviously the most ideal scenario is you refactor the data and add a proper key!

{% highlight sql %}
Select 
    child.FirstName,
    child.Surname,
    Coalesce(father.FirstName, mother.FirstName) As Firstname,
    Coalesce(father.Surname, mother.Surname) As Surname
From Children child
    Left Outer Join Parents father
    On child.FatherID = father.ID
    Left Outer Join Parents mother
    On child.MotherID = mother.ID
{% endhighlight %}
