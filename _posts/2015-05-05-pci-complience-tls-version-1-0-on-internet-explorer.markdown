---
layout: post
title:  "PCI Complience with TLS version 1.0 with Internet Explorer"
date:   2015-05-05 22:00:00
categories: blog
tags: 
- ie
- browser
- security
- iis
---

PCI Compliance is necessary on any site that takes credit card transactions. Trustkeeper is an example of a service you can use to scan your site and see if the site conforms to PCI (Payment Card Industry). To be PCI compliant you have to ensure with various security enhancements are present on your server. 

On Feb. 13, the PCI Security Standards Council declared that <a href="https://www.pcisecuritystandards.org/documents/Migrating_from_SSL_Early_TLS_Information%20Supplement_v1.pdf">TLSv1.0 is an unsafe protocol</a>, and now Trustkeeper deems it as a failure if you have TLSv1.0 on your site.
<!--break-->
Today I disabled TLSv1.0 from our site, ensured the site was still using TLSv1.1 and TLSv1.2 and then forgot about it.

Later that day I received correspondence that a number of users couldn't access their user profiles (served over SSL). It transpires that in Internet Explorer versions 7 to 10 (and older versions of Chorme, Firefox and mobile browsers) don't enable . This is because by default TLSv1.1 and 1.2 aren't even enabled in these browsers. Wikipedia shows <a href="http://en.wikipedia.org/wiki/Transport_Layer_Security#browsersTSL">all the browser support for TLSv1.1 and TLSv1.2</a>. It seems from research - <a href="https://zmap.io/sslv3/">this will affect 49% of the top 100 sites</a>. Looking at my own sites stats, it will affect about 50,000 sessions per month.

<a href="https://connect.microsoft.com/IE/feedbackdetail/view/1305639/">Microsoft have been made aware of the issue</a>, but I doubt that a fix will be put into place any time soon. Alternatively we could attempt to ask users to <a href="http://blogs.msdn.com/b/kaushal/archive/2011/10/02/support-for-ssl-tls-protocols-on-windows.aspx">manually enable TLSv1.1 and TLSv1.2 in Internet Explorer</a> - but this is unworkable at scale. Most of our users aren't very computer savvy.

The alternative is we put a message on pages before login visible to IE users that says that we can't support old IE, and show the user how to upgrade their browsers - but once again - large amount of our users are from enterprise and don'[t have the rights on their terminals to update their browsers.

Another alternative is to do payments on another sub site so rather than using "MyBrand.com" - we can instead have "MyBrand-Payments.com", but there is a considerable amount of work involved in unpicking the payment behaviour from our core site to allow payments to be taken from the new domain.

One point I will share - even <a href="https://www.ssllabs.com/ssltest/analyze.html?d=paypal.com">paypal themselves still serve SSL over TLSv1.0</a>.

I will research further alternatives but do you have any ideas on how to be PCI compliant but still support old browsers?


