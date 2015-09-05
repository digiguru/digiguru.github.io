---
layout: post
title:  "The boy scout rule - Leave the Campground Cleaner then when you found it"
date:   2015-03-17 20:00:00
categories: blog
tags: 
- xcode
- naming
- icons
- refactor
---

I was uploading a release for an app tonight, but I got a warning on the submission process explaining that I was missing a recommended icon 120x120 pixels.

I thought this should be an easy thing to fix, all I need to do is drop in another icon. Firstly I open the Images.xcassets file to investigate...

<img src="/images/2015-03-17-an-example-of-a-missing-icon.png" alt="an example of a missing icon" longdesc="An xcode image asset library file with 17 icons, but one is missing.">

There's the missing image. The job is simple, I just have to rescale the laregest icon down to the right size. Next I open up the file hierarchy to find the larest of the assets, so I can scale it down...

<img src="/images/2015-03-17-badly-named-icons.png" alt="badly named icons" longdesc="Directory listing the following file names
144x144-6.png
144x144-10.png
Contents.json
Icon-40.png
Icon-40@2x-1.png
Icon-40@2x.png
Icon-72.png
Icon-76.png
Icon-76@2x.png
Icon-Small-1.png
Icon-Small-50.png
Icon-Small-50@2x.png
Icon-Small.png
Icon-small@2x-1.png
Icon-Small@2x.png
Icon.png
Icon@2x.png">

Wow - the developer that last added to this folder should be ashamed. How did they know which is the biggest copy? Is it <code>144x144-6.png</code> or <code>144x144-10.png</code> (actually it's <code>Icon-76@2x.png</code> - but finding that is a pain).

So a sigh, a beer and a few spare moments later I have organised the file structure...

<img src="/images/2015-03-17-badly-named-icons.png" alt="badly named icons" longdesc="Directory listing the following file names
Contents.json
Icon-29@1x.png
Icon-29@2x.png
Icon-29@3x.png
Icon-40@1x.png
Icon-40@2x.png
Icon-40@3x.png
Icon-50@1x.png
Icon-50@2x.png
Icon-57@1x.png
Icon-57@2x.png
Icon-60@2x.png
Icon-60@3x.png
Icon-72@1x.png
Icon-72@2x.png
Icon-76@1x.png
Icon-76@2x.png">

Question... How does it ever come to this? Is the developer just blindly dropping in assets into the GUI without a care to the naming? I far prefer to have well named files, as it helps me identify bugs and inconsistencies. This is why you should check over your file changes on every commit. Does this commit look clean? If so... commit!
