---
layout: post
title:  "How I like to format SQL"
date:   2013-09-30 23:27:34
categories: blog
tags: 
- sql
- formatting
- code
---

I've seem lots of SQL coding styles over my time. Here are three most common formatting options.

ANSI 89 Equals Syntax
=====================

{% highlight sql %}

    Select *
    From customers,
        invoice,
        invoice_item,
    Where customers.id = invoice.customerid
    And invoice.id = invoice_item.invoiceid
    And invoice.isPaid = false

{% endhighlight %}

I hate seeing this written. Firstly you bulk up your "Where" clause area, so it's hard to see what is filtering the data. The more tables that get added to the query the harder it is to see. It's also very hard to convert this sort of join to a Left, Right or Full join because it's all hidden in there where clause. I would always advise people at the very minimum to convert it to the following.

ANSI 92 Join Syntax
===================

{% highlight sql %}

    Select *
    From customers
    Inner Join invoice          on invoice.customerid = customers.id 
    Inner Join invoice_item     on invoice.id         = invoice_item.invoiceid 
    Where invoice.isPaid = false 

{% endhighlight %}

This query is significantly better. You can easily see that the where clause has one filter, and thats to get only paid invoices. What the authoer has also done is aligned the joins along with each other. It makes it nice to scan down the line and see the join criteria. I however still think this doesn't show the nesting of the joins clearly. Can you swap the join for invoice_item and invoice around? The formatting hints that you can, but it would create an error. Here's my preferred solution...

ANSI 92 Nesting Syntax
======================

{% highlight sql %}

    Select *
    From customers
        Inner join invoice_item
            Inner join invoice
            on invoice.id = invoice_item.invoiceid 
        on invoice.customerid = customers.id 
    Where invoice.isPaid = false 
        
{% endhighlight %}

You can see with this join that there is a clear structure to the query, and by moving the joins around it would break the flow of the query. When you put more joins in a query like this you find it very easy to see where things are nested and it often leads to spotting performance optimizations.