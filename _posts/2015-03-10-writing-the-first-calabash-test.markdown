---
layout: post
title:  "Writing the first calabash test"
date:   2015-03-10 20:00:00
categories: blog
tags: 
- calabash
- mobile
- iOS
---

Going through the stages of writing my first calabash test. Firstly I went to my project folder, and opened the following file <code>/features/login.feature</code>.


{% highlight cucumber %}
Feature: Login
  As a bride
  I want to be able to login
  So I can plan my wedding

Scenario: Bride can login
  Given I am on the login screen
  When I type in my username
  And I type in my password
  And click login
  Then I should be logged in
{% endhighlight %}

After running the following command in bash


{% highlight bash %}
  $ cucumber
{% endhighlight %}
 
I get the following output suggesting a skeleton for a new ruby file.
 
{% highlight ruby %}
Given(/^I am on the login screen$/) do
  pending # express the regexp above with the code you wish you had
end

When(/^I type in my username$/) do
  pending # express the regexp above with the code you wish you had
end

When(/^I type in my password$/) do
  pending # express the regexp above with the code you wish you had
end

When(/^click login$/) do
  pending # express the regexp above with the code you wish you had
end

Then(/^I should be logged in$/) do
  pending # express the regexp above with the code you wish you had
end
{% endhighlight %}

I then go in to start editing, but how do you write a test? The <a href="http://developer.xamarin.com/guides/testcloud/calabash/creating-calabash-tests/">calabash documentation</a> says to run the following command:

{% highlight bash %}
$ calabash-ios console
{% endhighlight %}

This creates a new command line <pre>irb(main):001:0></pre>, where we have to write the following:

{% highlight bash %}
start_test_server_in_background
{% endhighlight %}

That boots up the simulator. Once it's loaded you can check for objects that you are going to run, eg...

{% highlight bash %}
query "button"
{% endhighlight %}

Will show all the buttons currently available in the view in the simulator.

We want only the one that says skipped - and this query seems to work after a bit of trial and error.
{% highlight bash %}
query "button marked:'walkthrough iphone btn skip'"
{% endhighlight %}

It's best to wait for the elements to appear on the device - it is unlikely that they will appear straight away. The following command will wait for an element to appear on the page...

{% highlight ruby %}
wait_for(:timeout => 5) { element_exists("button marked:'walkthrough iphone btn skip'") }
{% endhighlight %}

Now we need to run the test. 

{% highlight bash %}
cucumber
{% endhighlight %}

SO let's write the tests....

{% highlight ruby %}
Given(/^I am on the login screen$/) do
    wait_for_elements_exist("button marked:'walkthrough iphone btn skip'", :timeout => 20)
    sleep(2)
    touch("button marked:'walkthrough iphone btn skip'")
    wait_for_elements_exist("* marked:'Email Address'", :timeout => 20)
    sleep(2)
end
{% endhighlight %}

The first line skips the walk-through. I noticed that an animation occurs to reveal the page, and you need to wait an extra timeout (2 seconds) to make sure you can start clicking the UI.

After touching the skip button we can now wait for the login page to open, and type in the necessary data.

{% highlight ruby %}
When(/^I type in my username$/) do
    touch("* marked:'Email Address'")
    wait_for_keyboard
    keyboard_enter_text("test@email.com")    
end
When(/^I type in my password$/) do
    touch("* marked:'Password'")
    wait_for_keyboard
    keyboard_enter_text("password1234")
end
{% endhighlight %}

This is fairly self-explanatory. I ran into troubles on the next line however. Initially I want the process to click the "Sing in" button. Doing this however didn't login, it seemed to just hit another character (v). After a while I realised the keyboard was above the button, so you either need to dismiss the keyboard before doing the button click, or (as I decided was more appropriate to the user) hit return.

{% highlight ruby %}
When(/^click login$/) do
    keyboard_enter_char("Return")
end
{% endhighlight %}

Now we need to make sure the user's details get loaded. This required us to test a string with an apostrophe. The following line allows you to do that...

{% highlight ruby %}
Then(/^I should be logged in$/) do
    quoted = escape_quotes("Adam's Wedding Planner")
    wait_for_elements_exist("* marked:'#{quoted}'", :timeout => 20)
end
{% endhighlight %}

After running this, it works, but then when I run again, it crashes. Why? In our app the UI requires the user to read a walk-through on first load. We need to skip it on first run but then you don't get the option again. We need to reset the simulator - otherwise you keep the state, and subsequent tests can't complete. The following line in bash will reset the test after each run.

{% highlight bash %}
 $ RESET_BETWEEN_SCENARIOS=1 cucumber
{% endhighlight %}

Now it passes every time. Nice!

Next I need to look at defining variables for the test and get some more complex scenarios.


