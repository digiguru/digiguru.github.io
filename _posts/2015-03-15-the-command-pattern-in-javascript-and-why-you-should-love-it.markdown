---
layout: post
title:  "The Command Pattern in Javascript and why you should love it"
date:   2015-03-15 20:00:00
categories: blog
tags: 
- javascript
- design-patterns
- testing
---

One pattern that I love to use in rich javascript applications is the Command Pattern. By embracing it you unlike your program to the ability to have multi-undo events, macro recording, but more and more prevalent in the sort of sites you see today, the way to distribute events to multiple clients (browsers) at once. Another advantage is it makes you app really easy to test - you can fire the Commands at your app and do some very deep tests on rich interfaces.

The pattern is described by having the following objects...

- *Client* - Think of this as the page / browser window. You may decide to have multiple clients - thus being able to push events across multiple sessions. 
- *Command* - Think of this as an abstraction to perform a specific action on your page. If you could pass in the minimum data necessary - what would that need to be? I find it best to setup the command object to have a Name and an args object.
- *Receiver* - Think of this as an object in your page that knows how to do something. The command object will be running events in a receiver.
- *Invoker* - The object that needs to store the events as they pass in, which allows you to keep a log of them for recording macros, storing undo/redo events or pushing the events to other clients. 

So what does this look like in a real app? Following is an exampel command obejct that I use in a <a href="https://github.com/digiguru/dylanSeating">table planning library</a>.

{% highlight javascript %}
var invokr = myApp.getInvoker();
invokr.Call("AddGuest",
    {
        id: 1,
        name: "Test Guest",
        x: 10,
        y: 10
    });
invokr.Call("AddTable", 
    {
        id: 1,
        type: "table",
        x: 200,
        y: 200,
        seatCount: 5
    });
{% endhighlight %}

As you can see, the commands are easily serialized.

Now, if you have a rich UI I've found it best to make these return promises. Why? Then you can have short animations between commands, allowing you to fire up a load of commands in sequence but honouring any complciated behaviour your UI might have - making it easier to gurentee the UI doesn't go out of sync with the data.

As a result, my test classes can look like this...

{% highlight javascript %}
var invokr = myApp.getInvoker();
invokr.Call("AddGuest", {
    id: 1,
    name: "Test Guest",
    x: 10,
    y: 10
}).then(function() {
    invokr.Call("AddTable", 
    {
        id: 1,
        type: "table",
        x: 200,
        y: 200,
        seatCount: 5
    }).then(function() {
        //Ensure that the UI has updated
        // and the new Guest and Table 
        // have been added to the page.
    });
});
{% endhighlight %}

This is really nice, because the test is describing the actions fired but not having to reach into objects on the pages, clicking buttons and updating form elements - definately my preferred way to write a test.

This has given an overview of the command object, I intend to show examples of some of the other objects used to complete the command pattern in a future post.
