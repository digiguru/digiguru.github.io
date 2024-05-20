# _plugins/filters.rb
module Jekyll
    module URLFilter
        def urlify(name)
            name.downcase.strip.gsub(/[ ']/, '-').gsub(/[^\w-]/, '') + ".html"
        end
      end
    end
  end
  Liquid::Template.register_filter(Jekyll::URLFilter)