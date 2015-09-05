---
layout: post
title:  "Nice SQL pattern for when fixing data"
date:   2015-03-26 20:00:00
categories: blog
tags: 
- sql
- procedure
- reporting
---

I came up with a nice straightforward pattern recently to help fix data after a lengthy database refactor.
<!--break-->
Almost every release we perform has some sort of database migration, and often this will involve changing keys from one table to another, for example - occasionally we will need to change a 1 to many relationship to a many to many relationship. In other cases we are migrating data from one database to another.

After a release we need to monitor the data to ensure that all of the ways data gets input have been fixed. We've done our best to mitigate the risk, but there's always some rouge service that hasn't been documented making silent changes to the database on a nightly basis.

Here is the layout I like to use. In the example I will talk about a bunch of tables that had an Image linked to every User (Users had a column ImageID),  but we since decided to move that to a Many to Many relationship (New link table UserImages)

{% highlight sql %}

Create Procedure Report.FaultyUserImages
As
SELECT 'Users with no image', * 
FROM Users
    Inner Join Images 
    On User.ImageID = Images.ImageID
    Left Outer Join UserImages
    On UserImages.UserID = Users.UserID 
        And UserImages.ImageID = Images.ImageID 
Where UserImages.ImageID Is Null

{% endhighlight %}

This will output a report of all the missing rows from user images.

This is all very well, but it's still a manual process to fix it.

Here is the "Improved" version which includes an optional parameter to "AutoFix"

{% highlight sql %}


Create Procedure Report.FaultyUserImages
(@AutoFix = 0)
As
SELECT 'Missing data in UserImages table', * 
FROM Users
    Inner Join Images 
    On User.ImageID = Images.ImageID
    Left Outer Join UserImages
    On UserImages.UserID = Users.UserID 
        And UserImages.ImageID = Images.ImageID 
Where UserImages.ImageID Is Null

If @AutoFix = 1
Begin
    
    Insert Into UserImages
    (UserID, ImageID)
    
    SELECT UserID, ImageID 
    FROM Users
    Inner Join Images 
    On User.ImageID = Images.ImageID
    Left Outer Join UserImages
    On UserImages.UserID = Users.UserID 
        And UserImages.ImageID = Images.ImageID 
    Where UserImages.ImageID Is Null
End
{% endhighlight %}

Run that procedure, and you still get a report of the out.

Run it with @AutoFix = 1 and it will fix the output.

After complicated releases, we create a <code>Report.Faulty...</code> procedure for every data migration, which allows us to react quickly to any corrupted data - and then fix the problem area over the course of the next sprint.