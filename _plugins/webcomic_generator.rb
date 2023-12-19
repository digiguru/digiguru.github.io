# _plugins/tweets_generator.rb
module Jekyll
    class ComicsGenerator < Generator
      safe true
      priority :normal
  
      def generate(site)
        # Load YAML data from file (e.g., _data/tweets.yml)
        comics_data = site.data['comics'] # Adjust the path and filename as necessary
        # Iterate over periods and create pages
        first_comic = comics_data.first
        last_comic = comics_data.last
        
        comics_data.each_with_index do |comic, index|
            comic["first_comic"] = first_comic if index > 0
            comic["last_comic"] = last_comic  if index < comics_data.length - 1
            comic["prev_comic"] = comics_data[index - 1] if index > 0
            comic["next_comic"] = comics_data[index + 1] if index < comics_data.length - 1
            comic["image"] = comic["url"]
            comic["index"] = index+1
            
            site.pages << ComicPage.new(site, site.source, comic)
        end
        

        #data.each do |period|
        #  site.pages << TweetPage.new(site, site.source, period)
        #end
      end
    end
  
    # A new Page subclass specific for Tweets
    class ComicPage < Page
      def initialize(site, base, comic)
        @site = site
        @base = base
        @dir  = "comics/" # Directory where the pages should be generated
        @name = formatURL(comic)

        self.process(@name)
        self.read_yaml(File.join(base, '_layouts'), 'comic.html')
        self.data['title'] = "Comics for #{comic['name']}"
        self.data['image'] = comic['image']
        self.data['index'] = comic['index']
        
        #self.data['tweets'] = comic['tweets']
        
        self.data["prev_comic_url"] = comic["prev_comic"] ? formatURL(comic["prev_comic"]) : nil
        self.data["next_comic_url"] = comic["next_comic"] ? formatURL(comic["next_comic"]) : nil
        self.data["first_comic_url"] = comic["first_comic"] ? formatURL(comic["first_comic"]) : nil
        self.data["last_comic_url"] = comic["last_comic"] ? formatURL(comic["last_comic"]) : nil
        pp self.inspect
      end
      def formatURL(node)
        node["name"].downcase.strip.gsub(/[ ']/, '-').gsub(/[^\w-]/, '') + ".html"
      end
    end
  end
    