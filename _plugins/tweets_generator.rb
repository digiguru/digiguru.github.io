# _plugins/tweets_generator.rb
module Jekyll
  class TweetsGenerator < Generator
    safe true
    priority :normal

    def generate(site)
      # Load YAML data from file (e.g., _data/tweets.yml)
      data = site.data['tweets'] # Adjust the path and filename as necessary
      # Iterate over periods and create pages
      data.each do |period|
        site.pages << TweetPage.new(site, site.source, period)
      end
    end
  end

  # A new Page subclass specific for Tweets
  class TweetPage < Page
    def initialize(site, base, period)
      @site = site
      @base = base
      @dir  = "tweets/" # Directory where the pages should be generated
      @name = period['name'].downcase.gsub(' ', '-') + '.html'

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'tweet.html')
      self.data['title'] = "Most Popular tweets for #{period['name']}"
      self.data['tweets'] = period['tweets']
      
      

    end
  end
end
  