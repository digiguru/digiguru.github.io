---
layout: post
title:  "How to fix GSAM Battery Monitor in Android Nougat (Using OSX)"
date:   2016-11-24 22:00:00
categories: blog
tags: 
- android
- battery
- adb
---

I've been used to <a href="https://play.google.com/store/apps/details?id=com.gsamlabs.bbm&hl=en">GSAM's excellent battery monitor tool</a> on android for a year or so, but recently after upgrading to Nougat I've noticed that it's stopped reporting accuratly for most applciations.

There is an Android Root companion that is supposed to fix the issue, but Nougat is unable to run it (thanks to better security built in to the mobile OS).

GSAM kidly request that <a href="https://code.google.com/p/android/issues/detail?id=211629">you star an Issue on the open source issue tracker</a> BUT DO NOT COMMENT ON IT. This can help Android offer users the choice to allow apps to access the Battery APIs built in to the OS.

Until this request is brought into the OS (I don't think it will be any time soon) there IS actually a way to enable the functionality. It's hidden in comment number #27 on the page...

{% highlight bash %}
 > #27 rjkmadi...
 > In the interim, you can give permissions through an adb shell.
 > pm grant com.gsamlabs.bbm android.permission.BATTERY_STATS
 > or pm grant com.gsamlabs.bbm.pro android.permission.BATTERY_STATS
 > 
 > (Thanks for flindaman on Reddit.)
 > Oct 3, 2016
{% endhighlight %}

Excellent! But what does that even mean?

Well - let's try it out. Before I begin a disclaimer.

{% highlight bash %}
adb
{% endhighlight %}

First let's see if we have adb...

{% highlight bash %}
adb
{% endhighlight %}

For me I didn't. Rather than installing the android development studio, I just want ADB, so I decided to install the minimum bits I needed.

This means getting the "Safe way to install things" using brew. Let's see if brew is on the machine...

{% highlight bash %}
brew
{% endhighlight %}

If not - follow <a href="http://brew.sh/">the instructions here</a>

If you do have it then make sure it's working

{% highlight bash %}
brew doctor
{% endhighlight %}

Since upgrading OSX I had to run an extra command to get Xcode tools working...

{% highlight bash %}
xcode-select --install
{% endhighlight %}

Now I was ready to install the android-sdk.

{% highlight bash %}
brew install android-platform-tools
{% endhighlight %}

Now plug in your android and ensure it is connected using PKP connection (the picture communication connection from the menu on your device when you plug it into your mac).

Next let's ensure we can see the device...

{% highlight bash %}
adb devices
{% endhighlight %}

It should display your device in a list. Awesome!

Now let's find the application name installed on the device..

{% highlight bash %}
adb shell pm list packages
{% endhighlight %}

Somewhere in the list you will see GSAM like <code>com.gsamlabs.bbm</code> or <code>com.gsamlabs.bbm.pro</code>

Take that text and run this next line to enable the hidden permission for this app to monitor battery information.

{% highlight bash %}
pm grant com.gsamlabs.bbm android.permission.BATTERY_STATS
{% endhighlight %}

Then next time you restart your Android, GSAM Battery monitor will have what it needs to monitor all the apps running on your device.
