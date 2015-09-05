---
layout: post
title:  "Working with ruby on OSX"
date:   2015-03-01 20:00:00
categories: blog
tags: 
- ruby
- bash
- mac
- osx
---

I've been trying to get my head around how to be productive on OSX. I often come along script commands to facilitate the development process and take alot of the menial tasks off to a short script in a command line. However I'm often stumbling around in the dark. An example of this is using jekyll to compile my blog.

Every time I come to write a blog post (once every 3 months going by history) I have to re-rememeber how to compile. Inevitably I think "How do I compile the site?" and type "Jeckyll" into google (Yes my spelling is atrocious).
<!--break-->
Then I realise it's a simple case of putting the directory into the command window and running the following 

{% highlight bash %}
$ jekyll
{% endhighlight %}

Which of course tells me

{% highlight bash %}
-bash: jekyll: command not found
{% endhighlight %}

Sigh - Did I uninstall it? Let's install again then.

{% highlight bash %}
$ gem install jekyll
{% endhighlight %}

Tells me
{% highlight bash %}
ERROR:  While executing gem ... (Gem::FilePermissionError)
    You don't have write permissions for the 
    /Users/.../.rvm/gems/ruby-2.0.0-p247/bin directory.
{% endhighlight %}

Oh yes - I remeber I have a weird ruby setup - it's installed using sudo - but I have another one in there...

{% highlight bash %}
$ rvm use 2.1.2

Using /Users/digiguru/.rvm/gems/ruby-2.1.2

$ gem install jekyll
{% endhighlight %}

This then fires off the install again. Phew. 

NB - If you don't have rvm installed than I suggest the <a href="https://rvm.io">RVM site</a>.

The jekyll command is now recognised - great time to build the site.

{% highlight bash %}

$ jekyll build
Deprecation: The 'pygments' configuration option has been renamed to 'highlighter'.
Please update your config file accordingly. 
The allowed values are 'rouge', 'pygments' or null.
{% endhighlight %}

Oh yes - I forgot. Every time you install software a fresh you run the risk of important pieces being depricated. Let's try again after renaming the property in the _config.yml file.

{% highlight bash %}
 Generating... 
                    done.
{% endhighlight %}

Probably best to test it...
{% highlight bash %}
jekyll serve
{% endhighlight %}

And now I can publish my next blog post the post you've just read.