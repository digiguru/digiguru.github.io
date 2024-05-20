# _plugins/filters.rb
module Jekyll
  module DateFilter
      require 'date'
      def date_sort(collection)
        collection.sort_by do |el|
        Date.parse(el['date'], '%d-%m-%Y')
      end
    end
  end
  module URLFilter
      def urlify(item)
        if item['name'].nil? || item['name'].strip.empty?
          ""
        else
          item['name'].downcase.strip.gsub(/[ ']/, '-').gsub(/[^\w-]/, '') + ".html"
        end
      end
  end
end
Liquid::Template.register_filter(Jekyll::DateFilter)
Liquid::Template.register_filter(Jekyll::URLFilter)
