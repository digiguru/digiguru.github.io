---
layout: post
title:  "The command pattern - an example in javascript"
date:   2015-03-19 20:00:00
categories: blog
tags: 
- javascript
- design-patterns
- command-pattern
---

So in previous article I showed some examples of the command pattern, now I will detail a simple application.

Firstly let's create a simple bit of HTML to help us visualise what we are doing.

{% highlight html %}
<h3>Console</h3>
<ul id="console"></ul>
{% endhighlight %}

Now - let's build a simple Client. This client will have 1 responsibility - to update the HTML.

{% highlight javascript %}
function Client () {
    this.log = function(msg) {
        var c = document.getElementById("console"),
            li = document.createElement("li");
        li.innerHTML = msg;
        c.appendChild(li);
        console.log(msg);
    }
}
{% endhighlight %}

You can test it out right away by posting a log event.

{% highlight javascript %}
var c = new Client();
c.log("it works!");
c.log("See?");
{% endhighlight %}

See <a href="http://codepen.io/digiguru/pen/OPrpBg" target="_blank">the client object running</a> in a new window.

It outputs the following

- it works!
- See?

No surprises there, but it's great to see our client works 100% as expected. This is a beautiful example of separation of concerns. If the client is broken, we can test it's API directly to see what's broken and how to fix it.

Now onto the reciever...

{% highlight javascript %}
function Receiver () {
    this.data = 1;
    c.log("Data starts off with " + this.data);
  this.increase = function() {
    this.data++;
    c.log("Increment. My data is now " + this.data);
  }
  this.decrease = function() {
    this.data--;
    c.log("Decrement. My data is now " + this.data);
  }
}
{% endhighlight %}

It's very simple - all it does is increase and decrease it's data by one.

Let's test it...

{% highlight javascript %}
...
var r = new Receiver();
r.increase();
r.decrease();
{% endhighlight %}

And now you can see <a href="http://codepen.io/digiguru/pen/bNOqOa"  target="_blank">the reciever object can take actions and apply them to the client</a>.

The outputs the following

- Data starts off with 1
- Increment. My data is now 2
- Decrement. My data is now 1

Great - still easy. Now let's write the commands.

{% highlight javascript %}

function BaseCommand() {
    this.reverse = false;
}
BaseCommand.prototype.run = function() {
    if(!this.reverse) {
        return this.forward();
    } else {
        return this.backward();
    }
};
BaseCommand.prototype.opposite = function() {
    this.reverse = !this.reverse;
    return this;
};

ExampleCommand.prototype = new BaseCommand();
ExampleCommand.prototype.constructor = ExampleCommand;
function ExampleCommand(){};
ExampleCommand.prototype.forward = function() {
    r.increase();
};
ExampleCommand.prototype.backward = function() {
    r.decrease();
};
{% endhighlight %}

BaseCommand exposes a small number of functions, basically you can only run the command or flip the command the opposite way. You can see how the invoker will utualize it as follows...

{% highlight javascript %}
var example = new ExampleCommand();
example.run();
example.opposite().run();
{% endhighlight %}

This outputs 

- Data starts off with 1
- Increment. My data is now 2
- Decrement. My data is now 1

You can see the <a href="http://codepen.io/digiguru/pen/GgPWzW" target="_blank">ConcreteCommand implementation here</a>.

Now finally - how do we get the invoker working?

{% highlight javascript %}
function Invoker() {
    this.undoActions = [];
    this.redoActions = [];
    this.undo = function () {
        var action = this.undoActions.pop();
        if(action) {
            this.redoActions.push(action.opposite());
            return action.run();
        } else {
          c.log("can't undo - no more actions");
        }

    };
    this.redo = function () {
        var action = this.redoActions.pop();
        if(action) {
          this.undoActions.push(action.opposite());
            return action.run();
        } else {
          c.log("can't redo - no more actions");
        }
    };
    this.call = function (action) {
        this.undoActions.push(action);
        return action.run();
    }
}
{% endhighlight %}

It's very simple - it's sole responsibility is to push actions into it's list of undoable actions, and then process the opposite when we request an undo. So now we have the 4 very distinct objects, how do we put it all together?

{% highlight javascript %}
var c = new Client(),
    r = new Receiver(),
    i = new Invoker(); 
i.call(new ExampleCommand());
i.call(new ExampleCommand());
i.undo();
i.undo();
i.undo();
i.redo();
i.redo();
i.redo();
{% endhighlight %}

You can see the <a href="http://codepen.io/digiguru/pen/XJoMZO" target="_blank">output of the command pattern</a> below...

- Data starts off with 1
- Increment. My data is now 2
- Increment. My data is now 3
- Decrement. My data is now 2
- Decrement. My data is now 1
- can't undo - no more actions
- Increment. My data is now 2
- Increment. My data is now 3
- can't redo - no more actions

You push commands into the invoker one by one, but at any time you request the invoker to undo or redo an action. If it get's too far it will alert you.

In this post I've detailed very simplistic versions of the command pattern. In future posts I will focus on how you can use it to facilitate more complex behaviour.

