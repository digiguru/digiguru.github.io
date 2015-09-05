---
layout: post
title:  "ASP Repeater helper to output class names on every Nth item"
date:   2014-02-06 20:00:00
categories: blog
tags: 
- vb
- net
- code
---

I came across a need to output a "clear" class to every 5th item in an asp:repeater. Here's an over-simplified example of the code that was written.

{% highlight aspx-vb %}
<ul>
<asp:Repeater runat='server'>
    <ItemTemplate>
        <li class='<%# If((Container.DataItemIndex + 1 Mod 5).Equals(0), "clear", "") %>'>
            <%# Container.DataItem.Title %>
        </li>
    </ItemTemplate>
</asp:Repeater>
</ul>
{% endhighlight %}

I say we could to better. First - let's work out what we want to say. Every 5th item output a new class. 
To determine if we are the fith item, we need to know the currentIndex and add 1 as it's 0 based.

So let's write pseudo code of what we actually want:

{% highlight aspx-vb %}
<li class='<%# Container.Every5thItem("clear") %>'>...</li>
{% endhighlight %}

Okay - that feels better, but I think we could improve it by having '5' as a parameter, I know that we might decide to change the width of this repeater later, and thus need to change which item clears.

{% highlight aspx-vb %}
<li class='<%# Container.Every(5).Output("clear") %>'>...</li>
{% endhighlight %}

Nice - that's a descriptive way of outputting a the "clear" class on every 5th item, and allows us to change the params depending on our needs. But how do we write the code?

{% highlight vbnet  %}
Public Module RepeaterHelper
    <System.Runtime.CompilerServices.Extension()>
    Public Function Every(container As IDataItemContainer, nthItem As Integer) As ...
        
    End Function
End Module
{% endhighlight %}

So this is the skeleton that allows us to extend the "Container" object in a repeater, adding "Every" as a function to any IDataItemContainer in your project. Now we need to return an object that exposes an Output function...

{% highlight vbnet  %}
Public Module RepeaterHelper

    <System.Runtime.CompilerServices.Extension()>
    Public Function Every(container As IDataItemContainer, nthItem As Integer) As Itemiser
        Return New Itemiser(container.DataItemIndex, nthItem)
    End Function


    Public Class Itemiser
        Public Sub New(ByVal currentIndex As Integer, ByVal item As Integer)
            Me.ItemCount = item
            Me.CurrentIndex = currentIndex
        End Sub
        Property ItemCount As Integer
        Property CurrentIndex As Integer
        Public Function Output(ByVal text As String) As String
            Return If(((CurrentIndex + 1) Mod 5).Equals(0), text, "")
        End Function
    End Class

End Module
{% endhighlight %}

ANd that's it - outputting a class on every 5th item in a repeater.