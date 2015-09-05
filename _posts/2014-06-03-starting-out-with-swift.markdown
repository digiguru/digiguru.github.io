---
layout: post
title:  "Starting out with Swift"
date:   2014-06-04 20:00:00
categories: blog
tags: 
- swift
- cocoa
- mac
---

Apple had the unusual WWDC announcement this week, and definitely came out with something I wasn't expecting. A <a href="https://itunes.apple.com/gb/book/swift-programming-language/id881256329?mt=11">new programming language called swift</a>.

Chris Lattner (<a href="https://twitter.com/clattner_llvm">@clattner_llvm</a>) creator of the language a head of development tools at apple seems to have come up with the philosophy behind the language. On his personal site he <a href="http://www.nondot.org/sabre/">gives a nod</a> to Bret Victor (<a href="https://twitter.com/worrydream">@worrydream</a>) one of the best thinkers on the internet who I have ever had the pleasure of reading is <a href="http://worrydream.com/#!/LearnableProgramming">amazing interactive essays</a> on rich IDEs.

I've just started playing with the language, and Apple have supplied the playground. This is a tool that allows you to start playing with swift and get instant feedback on the code you write.

Here's my first demo in swift:

<a href="/images/2014-06-04-Monkies.playground.zip" download="download"><img src="/images/2014-06-04-swift-code.png" alt="some swift code" longdesc="
var monkies: String[] = []

let Mizaru = {SeeNoEvil}
let Kikazaru = {HearNoEvil}
let Iwazaru = {SpeakNoEvil}

monkies += Mizaru
monkies += Kikazaru
monkies += Iwazaru

for monkey in monkies {
    sleep(1)
    NSLog(monkey)
}
"></a>

It's certainly a fun language to write in, especially with the addition of the emoji characters. Imagine being able to return all your exceptions as a nice big fail whale!

I also like the way you get real time updates of whats going on in the code. If you look in the bottom right of the picture, you will see that there is a timeline. You can watch the console log elements happening in real time, and even rewind time and watch it again. It will be very exciting to see what gets build by developers.

What concerns me a bit is this line...

{% highlight java %}

var monkies: String[] = []

monkies += Mizaru
monkies += Kikazaru
monkies += Iwazaru

{% endhighlight %}

I had to specifically cast the list to a certain type, because the compiler couldn't work out what type of list it was going to be by the first add. Notice - if I had done the following it would have worked...

{% highlight java %}

var monkies = [Mizaru]

monkies += Kikazaru
monkies += Iwazaru

{% endhighlight %}

But this gives an error

{% highlight java %}

var monkies = []

monkies += Mizaru
monkies += Kikazaru
monkies += Iwazaru

//Playground execution failed: 
//error: <REPL>:9:9: 
//error: could not find an overload for '+=' that accepts the supplied arguments
//monkies += Mizaru
{% endhighlight %}

The very fact that you get this error while you write the code, with no visible build steps and real life output, is really amazing. I'm looking forward to see how this develops. Especially with the UIKit outputting animated canvas elements. It could mean a whole new dimension of testing tools.

You can find my <a href="/images/2014-06-04-Monkies.playground.zip" download="download">complete code sample here</a>.

Oh and by the way, Did Bret Victor work with Apple on the design of Swift Playground? <a href="http://www.quora.com/Did-Bret-Victor-work-with-Apple-on-the-design-of-Swift-Playground">No</a>.