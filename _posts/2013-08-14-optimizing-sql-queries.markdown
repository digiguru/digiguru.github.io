---
layout: post
title:  "Optimizing SQL Queries"
date:   2008-08-14
categories: archive
tags: 
- sql
- code
---

I was working on some code when I came across a behemoth of an inline SQL query nestled in the code behind of a page.

{% highlight sql %}
Select 
    a.list_id, 
    a.company_name, 
    a.company_description, 
    a.url,
    (  case when (
        Select upper(County_Name) 
        from tbl_County 
        where County_id=a.County_id
    ) is null then (
        Select upper(Country_Name) 
        from tbl_description_Country 
        where Country_id= a.Country_id
    ) else (
        Select upper(County_Name) from tbl_County where County_id= a.County_id) 
    end     ) as County_name,
    b.review_approval,
    ( case when (
        Select county_id 
        from tbl_County 
        where County_id = a.County_id
    ) = 0 then (
        Select Country_id 
        from tbl_description_Country 
        where Country_id = a.Country_id
    ) else (
        Select county_id 
        from tbl_County 
        where County_id= a.County_id
    ) end ) as CountryID,
    dbo.funcGetRatingSum (a.list_id) as ratingSum,
    dbo.funcGetRatingCount (a.list_id) as totalCount,
    ( Select case when ( 
        select top 1 banner_path 
        from tbl_banners 
        where list_id = a.list_id 
        and a.subscription_id = 2
    ) is null then ''
    else ( 
        select top 1 banner_path 
        from tbl_banners 
        where list_id = a.list_id 
        and a.subscription_id = 2
    ) end ) as bannerpath
from 
    tbl_directorylisting a, 
    tbl_preferences as b ,
    tbl_companymaster c 
where a. status = 1 
and ( a.company_id = b.company_id And a.status = 1) 
and c.category_id= @CategoryID
and a.company_id= c.company_id and a.subscription_id in (2,3) 
and subscription_date >= (dateadd(year,-1,getdate()))
Order by county_name, a.subscription_id asc, a.date_fee_paid
{% endhighlight %}

Actually it was within several lines of concatenated text values, and had no formatting whatsoever!. My first intention was try to make it a stored procedure, but doing so I couldn't help but try to optimize it a little. Here's my attempt....

{% highlight sql %}
Select
    listing.list_id,
    listing.company_name,
    listing.company_description,
    listing.url,
    Coalesce(county.County_name, country.Country_Name) As County_name,
    prefs.review_approval,
    listing.Country_ID,
    dbo.funcGetRatingSum (listing.list_id) as ratingSum,
    dbo.funcGetRatingCount (listing.list_id) as totalCount,
    Coalesce((
        select top 1 banner_path 
        from tbl_banners 
        where list_id = listing.list_id 
        and listing.subscription_id = 2), ''
    ) as bannerpath
FROM
    tbl_directorylisting listing
    Inner Join tbl_companymaster company
        Inner Join tbl_preferences prefs
        On listing.company_id = prefs.company_id
    On listing.company_id = company.company_id
    Left Outer Join tbl_county county
        Inner Join tbl_country country
        On listing.country_id = country.country_id
    On listing.county_id = county.county_id
where listing.status = 1
    And company.category_id= @CategoryID
    and listing.subscription_id in (2,3)
    and listing.subscription_date >= (dateadd(year,-1,getdate()))
Order by county_name, listing.subscription_id asc, listing.date_fee_paid
{% endhighlight %}

Firstly you'll notice the second query is far easier to read (hopefully). I dont stand for the old skool method of joining tables, join with a join and it's obvious what is going on, plus it prepares isolation of results for the where clause afterwards.

Secondly there are fewer joins in the Column definition part of the select. I have included one of the original selects, because when optimizing the stored procedure it was siginificantly fast enough to use select top 1 ... than it was to Left Outer Join. I did however Coalesce so that the case statement didn't repeat iteself.

What do you think? Is that better or worse?