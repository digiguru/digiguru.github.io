---
layout: post
title:  "The command pattern - invoker object"
date:   2015-03-18 20:00:00
categories: blog
tags: 
- javascript
- design-patterns
- command-pattern
---

When dealing with the command pattern, we have to identify an invoker object.

This object will process our concrete commands and store a list of events that have been applied. What does this invoker object look like. I identified the following interface. Firstly we know we want the ability to "undo" and "redo". 

{% highlight javascript %}
this.UndoActions = [];
this.RedoActions = [];
this.Undo = function Undo(callback) {
    var action = this.UndoActions.pop();
    this.RedoActions.push(action.Opposite());
    return action.Run();
};
this.Redo = function Redo(callback) {
    var action = this.RedoActions.pop();
    this.UndoActions.push(action.Opposite());
    return action.Run();
};
{% endhighlight %}

This is fairly straight forward. We store a list of undo actions, and redo actions. Every time you perform an Undo action, you need to record the opposite action in the Redo list, and then perform the action, the finally return a promise. (for those who like to pass in a callback, you can also do this as an optional parameter).

Okay - so given this, what does the action object look like? These are the concerete commands, so need to be assigned for each different command you have.

For all of the concrete commands you need a core object.

{% highlight javascript %}
this.reverse = false;
this.Run = function(callback) {
    if(reverse) {
        return this.forward(callback);
    } else {
        return this.backward(callback);
    }
};
this.Opposite = function () {
    reverse = !reverse;
};
{% endhighlight %}

But you need to also add the following functions to each concrete command. Here is an example for "moveTable".

{% highlight javascript %}
this.forward = function (callback) {
    var table = getTable(args.table);
    console.log("MoveTable", args);
    return table.animateTable(args.current, callback); 
};
this.backward = function (callback) {
    var table = getTable(args.table);
    console.log("UndoMoveTable", args);
    return table.animateTable(args.previous, callback);
};
{% endhighlight %}

This ends the description of the Undo / Redo functionality. In a later post we will put it all together and try creating some fully functional examples.