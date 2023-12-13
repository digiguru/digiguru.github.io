---
layout: post
title:  "The Walking Skeleton?"
date:   2022-11-09 22:00:00
categories: blog
tags:
- architecture
- agile
- feature flags
---

You've probably heard of [Zombie Scrum](https://www.scrum.org/resources/blog/zombie-scrum-symptoms-causes-and-treatment), but do you know about The Walking Skeleton?

![A Skeleton walking through a park](/assets/walking-skeleton-1.png)
<!--break-->

One of the most common problems I see in software development is when teams delay a release to production because of new architecture components or significant changes to existing architecture. The teams opt to complete a large amount of features so the architecture is fully realised. Sometimes the teams even push builds to a staging site, impressing their stakeholders and giving them the illusion of agility. However they haven't yet had a release to production.

![A Walking Skeleton leaving a waterfall](/assets/walking-skeleton-2.png))

Unwittingly they have chosen to adopt a waterfall approach.

## It doesn’t have to be this way
I prefer to see teams who focus on getting pieces of their intended architecture into production as early as possible. They should be breaking down the moving parts into slices that can be proven independently. This is sometimes called a Walking Skeleton.

> A Walking Skeleton is a tiny implementation of the system that performs a small end-to-end function. 

*Alistair Cockburn*

This is often the goal in agile projects, but teams get confused trying to make sure the whole platform is ready before pushing it to production they miss the fact they can design parts of the target architecture to be independent. Alistair continues...

> It need not use the final architecture, but it should link together the main architectural components.

A walking skeleton might be any number of things - some examples include

- An API endpoint that doesn't ever get called by the frontend BUT can be verified on production data in readiness for a frontend

- A new version of an existing database that is never read BUT is sent insert and update statements whenever the old database is edited to ensure the data mirrors the old style before it is expired

- A visual feature that is hidden from normal users BUT is being monitored to see how it effect page load times

Not a complete list but an idea of how we might break the components required down into the Walking Skeleton. The beautiful thing about the Walking Skeleton is the team behaviours that start to develop as a result.

## Focus on the pipeline first

If builds aren't easy and repeatable then the team is restricted from becoming high-performing. Focusing on CI/CD (an automated process to check code for issues and push it to production if it passes) at the start means the application is far quicker to update in the future. The worst time to find out that your production release process doesn't work is after months of promising all the stakeholders that it will be ready today.

## Brings the ops functions of an organisation in early

If you don't have the pleasure of working in a DevOps environment (one where the Dev team is responsible for development, build and operation) then you need to close the gap between the Dev team and the organisation's Ops team (sometimes called WebOps). Throwing them a release when there's a deadline approaching is a great way to alienate them. If you involve them earlier they can work with you to identify the key concerns they may have - for example

- Security implications of the new architecture
- The monitoring expectations they may require
- Who gets the alerts when errors start appearing in production

## Creates a smaller “first release”

There's no good time to find out assumptions you have made are wrong. However you're only likely to find out at the time of release. The smaller the changes, the better. If you have a-lot riding on the initial release then you are unlikely to admit it's not working. This is not a psychologically safe position to be in. Identify expensive architectural design mistakes early by creating a Walking Skeleton and change it as soon as you know it's not working.

## Focus on independence allowing for more team scaling

Creating a Walking Skeleton allows you to figure out where the boundaries are in a system. By knowing the boundaries you can start to understand how the teams can be split to focus on their areas within that boundary. 

> Any organization that designs a system (defined broadly) will produce a design whose structure is a copy of the organization's communication structure 

*Melvin Conway*

This is a powerful concept because as your architecture evolves you should evolve the team structures to mirror it. A Walking Skeleton allows you to set the teams up for success early and adapt them if you can spot issues in the way the teams communicate.

## Release to production earlier helps build confidence

There's nothing like a team "win" to get a feeling of momentum. Momentum builds motivation which builds momentum. Every release you do makes the act of releasing less scary. This means the team is more likely to think about how to make risky things safe. This builds confidence. This positive feedback loop will put the team in a great position to impress.

![A Walking Skeleton at dusk](/assets/walking-skeleton-3.png)

## In conclusion
Look at the teams you work with. If they haven't released anything to production in the last week consider sharing some articles on Walking Skeletons and evolutionary design and see if you can get into the habit of releasing to production.