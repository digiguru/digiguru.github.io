# Getting started

How to compile the site.

```bash
jekyll build
```

Things arn't working?

```bash
gem install bundler jekyll
bundle add webrick
```

or with brew...

```bash
brew install brew-gem
brew gem install bundler
brew gem install jekyll
```

then

```bash
bundle update
```

Finally

```bash
bundle exec jekyll serve
```


Want to grab a tweet and turn it into a YML node?

You need the tweet ID and a date.

To do that do to a tweet page and run this function

```
let data = {
    id: $("[property='al:ios:url']").attributes["content"].value.split("=")[1],
    date: $("time").attributes["datetime"].value.split("T")[0]
}
let text = `
  - id: ${data.id}
    date: ${data.date}`
copy(text)
console.log("Copied" + text);
```

To find relevant tweets use this url
https://twitter.com/search?q=(from%3Athedigiguru)%20until%3A2023-03-01%20since%3A2023-02-01&src=typed_query

```
(from:thedigiguru)  until:2023-05-01 since:2023-04-01 min_faves:20
```