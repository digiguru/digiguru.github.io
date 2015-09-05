---
layout: post
title:  "Querystring helpers in .NET"
date:   2015-03-24 20:00:00
categories: blog
tags: 
- vb
- csharp
- net
- querstring
---

Often we have pages that have multiple optional querystrings. Here is a simple function that allows developers to write really clear code to get parameters from the querystring (or any other object that derives from NameValueCollection.
<!--break-->
{% highlight csharp %}

public static class QuerystringHelper
{
	[Extension()]
	public static int? GetNullableInt(
        NameValueCollection querystring, 
        string param)
	{
		string str = querystring(param);
		int result = 0;
		if (!string.IsNullOrWhiteSpace(str) && int.TryParse(str, result)) {
			return result;
		}
		return null;
	}
}

{% endhighlight %}
or in vb...
{% highlight vbnet %}

Public Module QuerystringHelper

    <Extension()>
    Public Function GetNullableInt(
        querystring As NameValueCollection, 
        param As String) As Integer?
        Dim str As String = querystring(param)
        Dim result As Integer
        If Not String.IsNullOrWhiteSpace(str) AndAlso 
            Integer.TryParse(str, result) Then
            Return result
        End If
        Return Nothing
    End Function

End Module
{% endhighlight %}

To use it you simply use the following syntax:
VB
{% highlight csharp %}
int? categoryID = default(int?);
categoryID = Request.Querystring.GetNullableInt("CategoryID");
if (categoryID.HasValue) {
	//Filter by categoryID
}
{% endhighlight %}
CSharp
{% highlight vbnet %}
Dim categoryID As Integer?
categoryID = Request.Querystring.GetNullableInt("CategoryID")
If categoryID.HasValue Then
  'Filter by categoryID
End If
{% endhighlight %}

Another quite common thing we do from querystring params is cast them to an enum.

I use the following helper to cast it to an enum, or default it to a patciular type.

Csharp
{% highlight csharp %}

public static class QuerystringHelper
{


	[Extension()]
	public static T GetEnumOrDefault<T>(
        NameValueCollection querystring, 
        string param, 
        T defaultEnum) where T : struct
	{
		T myEnum = default(T);
		if (Enum.TryParse(querystring(param), myEnum)) {
			return myEnum;
		} else {
			return defaultEnum;
		}
	}

}

{% endhighlight %}
VB
{% highlight vbnet %}
Imports System.Runtime.CompilerServices

Public Module QuerystringHelper

    <Extension> _
	Public Shared Function GetEnumOrDefault(Of T As Structure)(
        querystring As NameValueCollection, 
        param As String, 
        defaultEnum As T) As T
		Dim myEnum As T = Nothing
		If [Enum].TryParse(querystring(param), myEnum) Then
			Return myEnum
		Else
			Return defaultEnum
		End If
	End Function
  
End Module
{% endhighlight %}

This is awesome, because we can use even less code - and I think it's really clear code to read.

CSharp
{% highlight csharp %}
enum Category {Javascript, dotNet, html};
Category a = Request.QueryString.
    GetEnumOrDefault<Category>("CategoryType", Category.Javascript);
{% endhighlight %}
VB
{% highlight vbnet %}
Public Enum Category
	Javascript
	dotNet
	html
End Enum
Dim a As Category = Request.QueryString.
    GetEnumOrDefault(Of Category)("Category", Category.Javascript)
{% endhighlight %}
             
