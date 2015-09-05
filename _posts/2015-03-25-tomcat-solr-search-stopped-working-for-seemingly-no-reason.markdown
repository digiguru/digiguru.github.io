---
layout: post
title:  "Tomcat/Solr search stopped working for seemingly no reason"
date:   2015-03-25 22:00:00
categories: blog
tags: 
- java
- solr
- tomcat
---

Our solr search decided to stop working.

It was unusual as it had been working, and there was no known changes in the application to make it stop. 

I went into the relevant server and immediately saw the TopCat service had been stopped.

I clicked on the icon and chose the "start service" activity and watched a progress bar go green. - everything back to normal? Not quite - I looked at TomCat and it had stopped again.

My next port of call was to open up the Apache Tomcat Properties window and try to find out more information. I found the "logging" tab and inside the log path.

This showed me a directory overflowing with log files. I sorted by date and found the following log file lines...

{% highlight bash %}
[2015-03-25 12:00:56] [info]  [25576] Running 'Tomcat7' Service...
[2015-03-25 12:00:56] [info]  [24308] Starting service...
[2015-03-25 12:00:56] [error] [24308] Failed creating java 
C:\Program Files\Java\jre1.8.0_25\bin\server\jvm.dll
[2015-03-25 12:00:56] [error] [24308] The system cannot find the path specified.
{% endhighlight %}

Okay - we are getting there... I tried to hit find the jvm.dll and discovered it wasn't on the server - at least not in that directory.

I assume that in a security update an older java version was deleted. The short term fix is to change the directory to a newer version of the jvm.dll. I think a long term solution is to create an environment variable and to set the java version in there.
