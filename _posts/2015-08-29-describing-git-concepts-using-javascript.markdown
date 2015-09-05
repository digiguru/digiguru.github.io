---
layout: post
title:  "Describing git concepts using javascript visualizations"
date:   2015-08-29 22:00:00
categories: blog
tags: 
- javascript
- git
- visualizations
---

<script src="/examples/gitgraph/gitgraph.js"></script>
<link rel="stylesheet" href="/examples/gitgraph/gitgraph.css">


The other day I was trying to describe some branching and merging strategies over distributed repositories to a remote coworker. Sadly I'm fairly new to complex git branching behaviour, so I had a hard time describing what I was trying to say.

I realised the best thing to do was to try and share some diagrams. Now being clued up on javascript, and having a few minutes spare I researched to see if there is anything I could use to generate descriptive diagrams for me.

Luckily I stumbled across <a href="http://gitgraphjs.com/">Git Graph JS</a>. It's a really simple library for showing git concepts. Without further ado - let's see some code.
<!--break-->
First we setup some objects...

{% highlight javascript %}
var gitgraph = new GitGraph(orientation: "vertical"),
    
    masterBranch,
    uatBranch,
    developmentBranch,

    userMaster = "@Digiguru",
    userUAT = "@UAT",
    userDEV = "@Dev";
{% endhighlight %}


Now let's visualise the first commit in the master branch

{% highlight javascript %}
masterBranch = gitgraph.branch("Master");
masterBranch.commit({
    message: "Initial Release",
    author: userMaster
});
{% endhighlight %}

<canvas id="example1"></canvas>
<script>
(function() {
var gitgraph = new GitGraph({elementId : "example1", orientation: "vertical"}),
    
    masterBranch,
    uatBranch,
    developmentBranch,

    userMaster = "@Digiguru",
    userUAT = "@UAT",
    userDEV = "@Dev";
    
masterBranch = gitgraph.branch("Master");
masterBranch.commit({
    message: "Initial Release",
    author: userMaster
});
}());
</script>

Now I wanted to describe our UAT area should be branched from master...

{% highlight javascript %}
uatBranch = masterBranch.branch("UAT"); 

uatBranch.commit({
    message: "Branch for UAT area",
    author: userMaster
});
{% endhighlight %}

<canvas id="example2"></canvas>
<script>
(function() {
var gitgraph = new GitGraph({elementId : "example2", orientation: "vertical"}),
    
    masterBranch,
    uatBranch,
    developmentBranch,

    userMaster = "@Digiguru",
    userUAT = "@UAT",
    userDEV = "@Dev";
    
masterBranch = gitgraph.branch("Master");
masterBranch.commit({
    message: "Initial Release",
    author: userMaster
});
uatBranch = masterBranch.branch("UAT"); 

uatBranch.commit({
    message: "Branch for UAT area",
    author: userMaster
});
}());
</script>
Now features should be worked on in their separate feature branches that are taken off UAT. This allows us to keep the UAT area clean from volatility while the sprints are underway.

{% highlight javascript %}
developmentBranch = uatBranch.branch("Feature");
developmentBranch.commit({
    message: "Supplier feature being worked on",
    author: userDEV
});

developmentBranch.commit({
    message: "Feature nearing compeltion",
    author: userDEV
});
developmentBranch.commit({
    message: "Ready for UAT",
    author: userDEV
});
{% endhighlight %}
<canvas id="example3"></canvas>
<script>
(function() {
var gitgraph = new GitGraph({elementId : "example3", orientation: "vertical"}),
    
    masterBranch,
    uatBranch,
    developmentBranch,

    userMaster = "@Digiguru",
    userUAT = "@UAT",
    userDEV = "@Dev";
    
masterBranch = gitgraph.branch("Master");
masterBranch.commit({
    message: "Initial Release",
    author: userMaster
});
uatBranch = masterBranch.branch("UAT"); 

uatBranch.commit({
    message: "Branch for UAT area",
    author: userMaster
});
developmentBranch = uatBranch.branch("Feature");
developmentBranch.commit({
    message: "Supplier feature being worked on",
    author: userDEV
});

developmentBranch.commit({
    message: "Feature nearing compeltion",
    author: userDEV
});
developmentBranch.commit({
    message: "Ready for UAT",
    author: userDEV
});
}());
</script>
Eventually we have to get the branch back into UAT. When we are there we notice a bug, and make a fix. Notice you "Push" merges from the feature into the UAT branch.

{% highlight javascript %}
developmentBranch.merge(uatBranch, {
    message: "Merge Supplier feature into UAT",
    author: userUAT
});

uatBranch.commit({
    message: "Bugfix from UAT",
    author: userUAT
});
{% endhighlight %}
<canvas id="example4"></canvas>
<script>
(function() {
var gitgraph = new GitGraph({elementId : "example4", orientation: "vertical"}),
    
    masterBranch,
    uatBranch,
    developmentBranch,

    userMaster = "@Digiguru",
    userUAT = "@UAT",
    userDEV = "@Dev";
    
masterBranch = gitgraph.branch("Master");
masterBranch.commit({
    message: "Initial Release",
    author: userMaster
});
uatBranch = masterBranch.branch("UAT"); 

uatBranch.commit({
    message: "Branch for UAT area",
    author: userMaster
});
developmentBranch = uatBranch.branch("Feature");
developmentBranch.commit({
    message: "Supplier feature being worked on",
    author: userDEV
});

developmentBranch.commit({
    message: "Feature nearing compeltion",
    author: userDEV
});
developmentBranch.commit({
    message: "Ready for UAT",
    author: userDEV
});
developmentBranch.merge(uatBranch, {
    message: "Merge Supplier feature into UAT",
    author: userUAT
});
uatBranch.commit({
    message: "Bugfix from UAT",
    author: userUAT
});
}());
</script>
Finally commit to master

{% highlight javascript %}
uatBranch.merge(masterBranch, {
    message: "Release 1",
    author: userMaster
});
{% endhighlight %}
<canvas id="example5"></canvas>
<script>
(function() {
var gitgraph = new GitGraph({elementId : "example5", orientation: "vertical"}),
    
    masterBranch,
    uatBranch,
    developmentBranch,

    userMaster = "@Digiguru",
    userUAT = "@UAT",
    userDEV = "@Dev";
    
masterBranch = gitgraph.branch("Master");
masterBranch.commit({
    message: "Initial Release",
    author: userMaster
});
uatBranch = masterBranch.branch("UAT"); 

uatBranch.commit({
    message: "Branch for UAT area",
    author: userMaster
});
developmentBranch = uatBranch.branch("Feature");
developmentBranch.commit({
    message: "Supplier feature being worked on",
    author: userDEV
});

developmentBranch.commit({
    message: "Feature nearing compeltion",
    author: userDEV
});
developmentBranch.commit({
    message: "Ready for UAT",
    author: userDEV
});
developmentBranch.merge(uatBranch, {
    message: "Merge Supplier feature into UAT",
    author: userUAT
});
uatBranch.commit({
    message: "Bugfix from UAT",
    author: userUAT
});
uatBranch.merge(masterBranch, {
    message: "Release 1",
    author: userMaster
});
}());
</script>

Bonus
=====

Thanks to these visualizations being in javascript you can easily amend properties, like rotating them and applying arrows.

{% highlight javascript %}
var gitgraph = new GitGraph({orientation: "horizontal", template: "blackarrow"}),
{% endhighlight %}

<canvas id="example6"></canvas>
<script>
(function() {
var gitgraph = new GitGraph({elementId : "example6", orientation: "horizontal", template: "blackarrow"}),
    
    masterBranch,
    uatBranch,
    developmentBranch,

    userMaster = "@Digiguru",
    userUAT = "@UAT",
    userDEV = "@Dev";
    
masterBranch = gitgraph.branch("Master");
masterBranch.commit({
    message: "Initial Release",
    author: userMaster
});
uatBranch = masterBranch.branch("UAT"); 

uatBranch.commit({
    message: "Branch for UAT area",
    author: userMaster
});
developmentBranch = uatBranch.branch("Feature");
developmentBranch.commit({
    message: "Supplier feature being worked on",
    author: userDEV
});

developmentBranch.commit({
    message: "Feature nearing compeltion",
    author: userDEV
});
developmentBranch.commit({
    message: "Ready for UAT",
    author: userDEV
});
developmentBranch.merge(uatBranch, {
    message: "Merge Supplier feature into UAT",
    author: userUAT
});
uatBranch.commit({
    message: "Bugfix from UAT",
    author: userUAT
});
uatBranch.merge(masterBranch, {
    message: "Release 1",
    author: userMaster
});
}());
</script>

<a href="http://gitgraphjs.com/">Git Graph JS</a> is a really good library and super simple to use. If you want to visualise git commits, then this is worth a look.
