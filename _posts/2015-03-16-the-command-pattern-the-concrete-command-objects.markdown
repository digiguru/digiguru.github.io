---
layout: post
title:  "The Command Pattern - the concrete command objects"
date:   2015-03-16 20:00:00
categories: blog
tags: 
- javascript
- design-patterns
- testing
---
In the last post I introduced the command pattern and showed an example of a command object. In this post I am going into more detail on the concrete command objects and showing how it's important to design the arguments up front so that you can use one command for both redo and undo events.

Firstly I will list out all the basic commands I identified in the app that a user can perform.
<!--break-->
- "AddTable" - You can add a new table <code>{table}</code>
- "AddGuest" - You can add a new guest to the app <code>{guest}</code>
- "MoveTable" - Move table to a new location <code>{table,location}</code>
- "PlaceGuestOnSeat" - allows guests to be placed on an existing seat. <code>{guest,seat}</code>
- "AddSeatAtPosition" - You can increase the number of chairs at a table. <code>{table,seatMarker}</code>

So every time a user perform one of these, we want to store the event to a list of actions in the application. One of the advantages of the CommandPattern is it allows us to create Undo activities in our application.

To do this, we would need to be able to generate an Undo behaviour for each command.

- "UndoAddTable" - Should remove the table from the app <code>{table}</code>
- "UndoAddGuest" - Should remove the guest from the app <code>{guest}</code>
- "UndoMoveTable" - Should move the table back to the original position <code>{table,originalLocation}</code>
- "UndoPlaceGuestOnSeat" - removes a guest from a seat <code>{guest,seat}</code>
- "UndoAddSeatAtPosition" - Remove a specified chair from a table <code>{table,seat}</code>

Now - for those paying attention - the arguments for some of these commands are actually slightly different to the parameters going into the original event. (UndoMoveTable & UndoAddSeatAtPosition). How do we deal with these?

The easiest way is to include in the arguments object enough data for both the redo and the undo action - so now the arguments are as follows...


{% highlight javascript %}
//AddTable
{
    id,type,x,y,seatCount
}
//AddGuest
{
    id,name,x,y
}
//MoveTable
{
    table,
    previous: {x,y},
    current: {x,y}
}
//PlaceGuestOnSeat
{
    guest,seat,guestOriginalSeat
}
//AddSeatAtPosition
{
    table,seatNumber
}
{% endhighlight %}

Now I have defined the Concrete Command objects and understood how each one will Undo as well as redo, we can start to look at the API for the invoker object which I will do in a later post.
