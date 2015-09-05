---
layout: post
title:  "Starting out with Calibash"
date:   2015-03-07 20:00:00
categories: blog
tags: 
- testing
- iOS
- mobile
- calabash 
---

We are about to release a new version of one of our mobile apps at work, and until now we have had no budget for QA. I am however just about to enter in a conversation with a team that is actively running calabash. I decided that it was important to try it out. I decided to invest my evening into getting the project setup with calabash, and following are the results of that experimentation.

Start by installing calabash gem
================================

I fire up my bash script (by dragging the folder I am working on to terminal) and run the following... 
{% highlight bash %}
$ gem install calabash-cucumber
{% endhighlight %}

D'oh - I get a permission error - I need to use the correct version of ruby installed on my computer rather than the locked down old version that apple provides. Luckily I already have RVM, so....

{% highlight bash %}
$ rvm use 2.1.2
$ gem install calabash-cucumber
{% endhighlight %}

This takes about 15mins on a dodgy internet connection. Now I have everything I need.

{% highlight bash %}
$ calabash-ios setup
{% endhighlight %}

This outputs the following...

{% highlight bash %}
Checking if Xcode is running...
Found Project: Scrapbook
Found several *.pbxproj files in dir Scrapbook.xcodeproj.
Found: project.pbxproj
project.pbxproj.BACKUP.2509.pbxproj
project.pbxproj.BASE.2509.pbxproj
project.pbxproj.LOCAL.2509.pbxproj
project.pbxproj.REMOTE.2509.pbxproj
We don't yet support this. Please setup calabash manually.
{% endhighlight %}


Oh - I've done something wrong :(. I decide that these 'several' projects all look like some sort of helpful backup that xcode is doing on my behalf, but I read online these aren't necessary and should not be checked in with the solution, so I decide to delete them. 

I Right Mouse on my xcodeproj and "Show package contents", and then just remove these strange pbxproj BASE, BACKUP, LOCAL, REMOTE files using finder.

Run the command again...

{% highlight bash %}
$ calabash-ios setup
{% endhighlight %}

I get the following warnings 

{% highlight bash %}
The domain/default pair of (/Users/digiguru/Library/Application Support/iPhone Simulator/6.1/Library/Preferences/com.apple.Accessibility.plist, ApplicationAccessibilityEnabled) does not exist
{% endhighlight %}

(nad then repeated again for 6.1, 7.0.3, 7.1, and 7.1-64). I assume this is old emulators that aren't working in Xcode 6+ so I decide to ignore them for now.

However below these warnings I also get the following...

{% highlight bash %}
----------Setup done----------
Please validate by running the -cal target
from Xcode.
When starting the iOS Simulator using the
new -cal target, you should see:

  "Started LPHTTP server on port 37265"

in the application log in Xcode.
{% endhighlight %}

Hmm - I guess it's time to open xcode.

Open up the project - hmm pods aren't there as this has been a fresh checkout, so I close xcode and run pod install

{% highlight bash %}
$ pod install
{% endhighlight %}

Now re-open xcode and have a look - I have a new scheme. Originally there was my app "Scrapbook", but now I have a second "Scrapbook-cal". I open this scheme and hit RUN!

Indeed when it's running the debugger logs the following...
{% highlight bash %}
Creating the server: <LPHTTPServer: 0x7fbc98555600>
Calabash iOS server version: CALABASH VERSION: 0.13.0
Started LPHTTP server on port 37265
{% endhighlight %}

Looks good. Time to generate the default test....

{% highlight bash %}
$ calabash-ios gen
{% endhighlight %}

I get a nice approval that everything is working, re-run the app in simulator and then do..

{% highlight bash %}
$ cucumber
{% endhighlight %}

This didn't work :(

{% highlight bash %}
Unable to auto detect APP_BUNDLE_PATH.
  Have you built your app for simulator?
  Searched dir: /Users/digiguru/Library/Developer/Xcode/DerivedData/Scrapbook-cxpdqqgzvhnwdpdjcafrfpyqpozg/Build/Products
{% endhighlight %}

Instead of finding the project there, I attempt to find it manually. To hack the APP_BUNDLE_PATH I read you can run a line. Originally I think I've found it here...

{% highlight bash %}
/digiguru/Library/Developer/CoreSimulator/Devices/EB826B69-7054-446D-A681-3A85E0F6BC9D/data/Applications/27481CF3-2B7C-4D6C-9B62-9A78C729718B
{% endhighlight %}

I'm sure someone smarter than me can figure out the right way of doing this, but I decide to hack it as follows...

{% highlight bash %}
*** WARNING! Do not do this - I later found out I was in the wrong location...
$ export APP_BUNDLE_PATH="/digiguru/Library/Developer/CoreSimulator/Devices/EB826B69-7054-446D-A681-3A85E0F6BC9D/data/Applications/27481CF3-2B7C-4D6C-9B62-9A78C729718B/My Wedding.app"
$ cucmber
{% endhighlight %}

This stopped or crashed the simulator, and I got errors.
{% highlight bash %}

plist '/digiguru/Library/Developer/CoreSimulator/Devices/EB826B69-7054-446D-A681-3A85E0F6BC9D/data/Applications/27481CF3-2B7C-4D6C-9B62-9A78C729718B/My Wedding.app/Info.plist' does not exist - could not read (RuntimeError)

{% endhighlight %}

I do some more digging and find that I was in the wrong directory entirely. Now I try the following...

{% highlight bash %}
$ export APP_BUNDLE_PATH="/Users/digiguru/Library/Developer/Xcode/DerivedData/Scrapbook-dzdljgesgcsjepftybotvqlbttmt/Build/Products/Debug-iphonesimulator/My Wedding.app"
$ cucumber
{% endhighlight %}

The iOS simulator starts up. I watch as the commands start to run without any input.

The tests complete, and I even get a screenshot in the project's root directory. I have run my first calabash test! Tomorrow I intend to write my first custom test.