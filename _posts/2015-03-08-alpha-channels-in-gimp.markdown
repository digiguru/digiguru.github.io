---
layout: post
title:  "Alpha Channels in GIMP"
date:   2015-03-08 20:00:00
categories: blog
tags: 
- gimp
- photo 
---

I have recently been asked to cut some photos up for a friend and put the subjects into new photos.

This is a common request that is often though of as easy. Sadly it's not that straightforward, but one I've been known to do in Photoshop using Alpha Channels.

An alpha channel is amazing because you can literally paint a selection by using a white brush, and then "undo" it by using a black brush. If your undo went too far you can paint it back in with white. Shades of grey represent the transparency / opacity of the layer - so you can even paint shadows into the photos. It's very cool.

To do this in GIMP do the following.

Step 1 - Duplicate the layer.
=============================

Use the double photo icon at the bottom (Between Green arrow and anchor)

Step 2 - Cut around an object
=============================

Find the scissors tool - click the newly duplicated image layer and then click on the image to choose the first "cut corner". Unlike other programs, you don't drag a selection, instead you click on every corner or edge. Carry on clicking around the object you want to cut out - be as rough as you like because you can smarten it up later. When you complete the object hit Enter to complete the selection

Step 3 - Add layer mask
=======================

Now go to the Menu at the top and choose Layer > Mask > Add layer mask. The menu will ask what you want to use as a starting point. Choose "Selection" in the menu that pops up. Now the selected area is "White" for your alpha channel (As in opaque) and the remainder of the image is "Black" (as in transparent).

I suggest you preview this now by clicking the Eye icon on the layer below the one you have just cut out. You should witness the background suddenly turns into a chequered pattern. That's the object you just cut out. You can smarten up the edges by ensuring you have selected the quick-mask layer in layer window, and using the airbrush tool - white will fill the image in, black will remove the image. 

It's easy to undo an over-zelous cut by just painting the quick mask back in.


Step 4 - Move the layers
========================

Now that you have created an object you need to Link the mask to the image - you do this by clicking the empty box next to the image. Now you can move the layers together. If you don't do this you will only move either the image or the mask and weird things will happen.

Now drag the object to a new position, or copy it into a new picture.

Other ideas
===========

- If you want to put an object from one image into another file, copy it into the photo before you do it - I can't find a way to copy a masked layer into another GIMP file yet.
- Use rubber stamp to remove areas
- Select an area where you want to "pull a background" across and use smudge to pull background across an area without it bleeding into anything else.
- Use 1 to zoom to the whole pic, and 5 to zoom into 1600% zoom


