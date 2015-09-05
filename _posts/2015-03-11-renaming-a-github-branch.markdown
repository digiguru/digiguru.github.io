---
layout: post
title:  "Rename a git branch"
date:   2015-03-11 20:00:00
categories: blog
tags: 
- git
- bash
- dvcs
---

After moving our repos from svn to git, we've need to rename some of the branches - a simple way of grouping up logical branches.

We have the following naming conventions for our branches.
<!--break-->
- *master* - default branch. This will always have the last released working codebase.
- *develop* - this is the current QA version after any feature has been merged in. Anything in here is developer tested, and can be released to beta testers.
- *feature/{ticketName}* - holds all the changes associated to an individual ticket. If anything gets pushed back from beta testing, it should be fixed inside the feature branch before merging back into the develop branch.
- *protoype/{prototypeName}* - holds any prototypes being worked on that are to be shared in the team. Useful way to try things that are just proof of concept (and often will grow into a feature).

Effectively we use the <a href="https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow">gitflow worklow</a>, but with rigid naming conventions.

Sadly we are part way through the project and it comes with a lot of history, so we really should go back and fix all the branch names. To do this I am using the following process.

Synchronize the solution
========================

If I haven't already done so I need to synchronize the solution. In Github it's a simple case of hitting the "Clone on Desktop" button and letting the GUI do the hard work.

In command line I believe it's the following...

{% highlight bash %}
$ git clone git@github.com:path/repo.git
$ git pull origin master
{% endhighlight %}

Now we need to swap to the branch we want to rename.

{% highlight bash %}
$ git checkout MyBadlyNamedBranch
{% endhighlight %}

Now to rename the branch - firstly we (SHOCK!) delete the branch of the remote server. WHY? I hear you say - there is no concept of a rename, but git is a distrubted system - and you have a copy on your local computer. You are just about to push it up again, but under the new name.

Straight afterwards we will push the local branch up again, but this time with the new name

{% highlight bash %}
$ git push origin :MyBadlyNamedBranch
$ git push origin MyBadlyNamedBranch:MyBetterNamedBranch
{% endhighlight %}

The ouptut for these commands will be as follows - firstly...
{% highlight bash %}
To http://www.github.com/path/repo.git
 - [deleted]         MyBadlyNamedBranch
{% endhighlight %}

Eeek-  quickly run the second line...

{% highlight bash %}
Counting objects: 101, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (15/15), done.
Writing objects: 100% (33/33), 4.72 KiB | 0 bytes/s, done.
Total 33 (delta 25), reused 24 (delta 16)
To http://www.github.com/path/repo.git
 * [new branch]      MyBadlyNamedBranch -> MyBetterNamedBranch
{% endhighlight %}

Not quite out of the woods yet - technically everyone who consumes the repo needs to delete the old branch from their local repos. Quite frankly - it's up to them what they do. I do it because I just want to see branches that are current, but it's up to the individual.

{% highlight bash %}
$ git checkout Master
$ git branch -D MyBadlyNamedBranch
{% endhighlight %}

If you don't run the checkout command it will tell you...

{% highlight bash %}
error: Cannot delete the branch 'MyBadlyNamedBranch' which you are currently on.
{% endhighlight %}

There we go. Branches - renamed.