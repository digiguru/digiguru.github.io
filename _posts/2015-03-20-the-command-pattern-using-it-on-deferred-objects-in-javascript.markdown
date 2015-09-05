---
layout: post
title:  "The command pattern - using it on deferred objects in javascript"
date:   2015-03-20 20:00:00
categories: blog
tags: 
- javascript
- design-patterns
- command-pattern
---

In the previous article we created some commands an ran them through the system.

In this article I will show how easy it is to make these events wait for each other to complete.

It really is a case of making each function take a callback.

First we will make the log event take a few moments by performing a jquery slidedown.

{% highlight javascript %}

function Client() {
    this.log = function (msg, callback) {
        var $li = $("<li>" + msg + "</li>").hide();
        $li.appendTo($("#console")).slideDown(callback);
    };
}

{% endhighlight %}

Importantly we have added a second arguement, callback.

Now just assing up the callbacks...

{% highlight javascript %}

function Receiver() {
    this.data = 1;
    c.log("Data starts off with " + this.data);
    this.increase = function (callback) {
        this.data++;
        c.log("Increment. My data is now " + this.data, callback);
    };
    this.decrease = function (callback) {
        this.data--;
        c.log("Decrement. My data is now " + this.data, callback);
    };
}


function Invoker() {
    this.undoActions = [];
    this.redoActions = [];
    this.undo = function (callback) {
        var action = this.undoActions.pop();
        if (action) {
            this.redoActions.push(action.opposite());
            return action.run(callback);
        } else {
            c.log("can't undo - no more actions", callback);
        }

    };
    this.redo = function (callback) {
        var action = this.redoActions.pop();
        if (action) {
            this.undoActions.push(action.opposite());
            return action.run(callback);
        } else {
            c.log("can't redo - no more actions", callback);
        }
    };
    this.call = function (action, callback) {
        this.undoActions.push(action);
        return action.run(callback);
    };
}

function BaseCommand() {
    this.reverse = false;
}
BaseCommand.prototype.run = function (callback) {
    if (!this.reverse) {
        return this.forward(callback);
    } else {
        return this.backward(callback);
    }
};
BaseCommand.prototype.opposite = function () {
    this.reverse = !this.reverse;
    return this;
};

ExampleCommand.prototype = new BaseCommand();
ExampleCommand.prototype.constructor = ExampleCommand;

function ExampleCommand() {};

ExampleCommand.prototype.forward = function (callback) {
    r.increase(callback);
};
ExampleCommand.prototype.backward = function (callback) {
    r.decrease(callback);
};

{% endhighlight %}

So what effect does this have on the calls? I have a warning, it looks really nasty!

{% highlight javascript %}

var c = new Client();
var r = new Receiver();
var i = new Invoker();
i.call(new ExampleCommand(), function () {
    i.call(new ExampleCommand(), function () {

        i.undo(function () {
            i.undo(function () {
                i.undo(function () {
                    i.redo(function () {
                        i.redo(function () {
                            i.redo();
                        });
                    });
                });

            });
        });
    });
});
 
{% endhighlight %}

As you can see in <a href="http://codepen.io/digiguru/pen/embMLE" target="_blank">the callback example</a> all the commands are run in sequence. This is important so that the state of the UI is predictable.

In a future post we will look at making the commands run by user interaction.


