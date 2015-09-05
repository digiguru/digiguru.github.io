---
layout: post
title:  "Move a repository from svn to git"
date:   2015-03-02 20:00:00
categories: blog
tags: 
- bash
- svn
- git
---

After recent company changes, it is becoming clear we are migrating some of our SVN repos to git. A collegues was kind enough to push the current codebase up to the shared git space, but sadly the import process lost the full history. 

I was sure this should already be a solved problem and after a little research I found <a href="https://github.com/nirvdrum/svn2git">svn2git</a>.

{% highlight bash %}
$ gem install svn2git
{% endhighlight %}

This allows a really simple syntax - just navigate to a fresh folder and run the following

{% highlight bash %}
svn2git http://svn.myserver.com/path-to-root/ --trunk Trunk --branches Branches --tags Tags
{% endhighlight %}

and watch your solution - every part of it - every commit gets streamed into the folder.

Then I started to process of uploading the lot. AFter setting up the repo on the new git remote server (blank of course) I added it to my local git directory

{% highlight bash %}
$ git remote add origin http://git.newserver.com/new/path.git
{% endhighlight %}

And then pushed to the new repo.
{% highlight bash %}
$ git push --all origin
{% endhighlight %}

Looks good - until 20mins later I get an error. 

{% highlight bash %}
Unable to rewind rpc post data - try increasing http.postBuffer
{% endhighlight %}

It seems my full repo is over 100meg. It seems it didn't want to work - so I tried the following....

{% highlight bash %}
$ git config http.postBuffer 209715200
$ git push origin --all
{% endhighlight %}

But I got the error again: 
{% highlight bash %}
fatal: The remote end hung up unexpectedly
{% endhighlight %}

It seems that between the server and the network I was using - somethign was stopping the repo being uploaded. I realised that the repo wasn't paticularly clean. Someone had been checking in IPAs, Zip files, PNGs - alot of dirty files that shouldn't be there. I theorized that if I just fremove those files then it will allow me to commit - but it's not a case of just swiping the files out. Git actually keeps a history of any file, so that it can be distrubuted with every instance of git. To wipe from the history I decided to use the <a href="https://rtyley.github.io/bfg-repo-cleaner/">BFG-Repo-Cleaner</a>.

Drop the jar file into the solution folder and run it as follows.
{% highlight bash %}
$ java -jar bfg.jar --delete-files .ipa
{% endhighlight %}

Which helpfully told me...

{% highlight bash %}
Cleaning
--------

Found 63 commits
Cleaning commits:       100% (63/63)
Cleaning commits completed in 334 ms.
{% endhighlight %}

Helpful. I ran this a few more times with various zip files, pngs that were never used, a storyboard that I didn't need the history on and the pods directory (to do a directory use this:)

{% highlight bash %}
$ java -jar bfg.jar --delete-folders Pods
{% endhighlight %}

Eventually I got it under 70Meg and I tried once again to upload the git repo. This time I got a nice message telling me all the branches had been uploaded.

