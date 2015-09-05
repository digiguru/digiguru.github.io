---
layout: post
title:  "Writing Gherkin on an existing application"
date:   2015-03-29 20:00:00
categories: blog
tags: 
- gherkin
- bdd
- legacy
---

We've been supporting our codebase for many years, but we are starting to look into  describing our core site tests as a load of Gherkin features. This is the first step as we move to a more highly automated testing process.

Now - what is Gherkin? It's a way of describing what your application does in a way that anyone from the business can understand. The way the language has been designed it stands as a template that can be understood by testing frameworks.
<!--break-->
It looks like the following (this example is found on <a href="https://github.com/cucumber/cucumber/wiki/Feature-Introduction">the wiki description</a>:

{% highlight gherkin %}

Feature: Serve coffee
    Coffee should not be served until paid for
    Coffee should not be served until the button has been pressed
    If there is no coffee left then money should be refunded

  Scenario: Buy last coffee
    Given there are 1 coffees left in the machine
    And I have deposited 1$
    When I press the coffee button
    Then I should be served a coffee

{% endhighlight %}

The idea is to write these for core parts of the site.

Originally I thought it was an easy task. I have a list of core site tests, so I grabbed the list and started on the very first core feature.

{% highlight gherkin %}
* Standard registration
* Quick regsitration
{% endhighlight %}

That was all I needed to know what to test, but I can't hand that over to anyone who doesn't really understand the domain. The objective of writing these features is to make sure anyone can read these specs and understand how to test them, even an automation engine.

As I started to write the tests I realised that Gherkin is far more verbose. You need to describe the exact state in every scenario, look at this.

{% highlight gherkin %}
  Scenario: User should be able to register through quick registration
    Given I am not logged in
    And I am on a page describing the planning tool
    When I register with an email address that has never been used before
    Then I should be registered
    And I should be logged in
    And I should be on the planning tool
{% endhighlight %}

This was originally described as the concept

{% highlight gherkin %}
* Quick registration
{% endhighlight %}

But that's not enough - I also need to describe what "not" being logged in is...

{% highlight gherkin %}
Scenario: Unauthenticated users cannot access planning tool
    Given I am not logged in
    When I go to the Planning tool page
    Then I should see the introduction page
    And I should be asked to register or sign in to continue
{% endhighlight %}

Only once these two tests are satisfied.

As I started to look at all the different scenarios that the user can follow, it quickly escalated to a much more complicated set of scenarios. The problem is, the concept of Gherkin is BDD - Behaviour Driven Development (Or Design). As we haven't driven the development spec first, we are starting to pay the tax. BDD would have alerted us to all the crazy minor edge cases, and helped us simplify the design.

Where does it leave us? We need to do a lot of work writing our scenarios if we want to cover the core site areas, but there's no urgent need - we can evolve our existing regression tests into Gherkin over time. Anything we learn we can feed into future developments - ones in which we can start considering BDD upfront.