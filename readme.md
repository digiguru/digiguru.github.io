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