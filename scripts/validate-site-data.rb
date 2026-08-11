require 'date'
require 'set'
require 'uri'
require 'yaml'

ROOT = File.expand_path('..', __dir__)
DATA_DIR = File.join(ROOT, '_data')

errors = []

def load_yaml(name, errors)
  path = File.join(DATA_DIR, name)
  YAML.safe_load(File.read(path), permitted_classes: [Date], aliases: false)
rescue StandardError => error
  errors << "#{name}: could not parse YAML: #{error.message}"
  nil
end

def require_array(value, label, errors)
  return true if value.is_a?(Array)

  errors << "#{label}: expected an array, got #{value.class}"
  false
end

def nonblank_string?(value)
  value.is_a?(String) && !value.strip.empty?
end

def generated_comic_url(name)
  name.downcase.strip.gsub(/[ ']/, '-').gsub(/[^\w-]/, '') + '.html'
end

def generated_tweet_url(name)
  name.downcase.gsub(' ', '-') + '.html'
end

def validate_unique(value, seen, label, errors)
  if seen.include?(value)
    errors << "#{label}: duplicate value #{value.inspect}"
  else
    seen << value
  end
end

comics = load_yaml('comics.yml', errors)
if require_array(comics, 'comics.yml', errors)
  names = Set.new
  urls = Set.new

  comics.each_with_index do |comic, index|
    label = "comics.yml item #{index + 1}"
    unless comic.is_a?(Hash)
      errors << "#{label}: expected a mapping"
      next
    end

    name = comic['name']
    image = comic['url']

    unless nonblank_string?(name)
      errors << "#{label}: name must be a non-empty string"
      next
    end

    validate_unique(name.strip, names, "#{label} name", errors)
    validate_unique(generated_comic_url(name), urls, "#{label} generated URL", errors)

    unless nonblank_string?(image)
      errors << "#{label}: url must be a non-empty string"
      next
    end

    image_path = File.join(ROOT, 'comics', image)
    errors << "#{label}: referenced image does not exist: comics/#{image}" unless File.file?(image_path)
  end
end

tweet_periods = load_yaml('tweets.yml', errors)
if require_array(tweet_periods, 'tweets.yml', errors)
  names = Set.new
  urls = Set.new

  tweet_periods.each_with_index do |period, period_index|
    label = "tweets.yml period #{period_index + 1}"
    unless period.is_a?(Hash)
      errors << "#{label}: expected a mapping"
      next
    end

    name = period['name']
    if nonblank_string?(name)
      validate_unique(name.strip, names, "#{label} name", errors)
      validate_unique(generated_tweet_url(name), urls, "#{label} generated URL", errors)

      begin
        Date.strptime(name.strip, '%b %Y')
      rescue Date::Error
        errors << "#{label}: name must use abbreviated month and four-digit year, got #{name.inspect}"
      end
    else
      errors << "#{label}: name must be a non-empty string"
    end

    tweets = period['tweets']
    next unless require_array(tweets, "#{label} tweets", errors)

    tweets.each_with_index do |tweet, tweet_index|
      tweet_label = "#{label} tweet #{tweet_index + 1}"
      unless tweet.is_a?(Hash)
        errors << "#{tweet_label}: expected a mapping"
        next
      end

      id = tweet['id']
      errors << "#{tweet_label}: id must be a positive integer" unless id.is_a?(Integer) && id.positive?
    end
  end
end

images = load_yaml('images.yml', errors)
if require_array(images, 'images.yml', errors)
  names = Set.new
  urls = Set.new

  images.each_with_index do |image, index|
    label = "images.yml item #{index + 1}"
    unless image.is_a?(Hash)
      errors << "#{label}: expected a mapping"
      next
    end

    name = image['name']
    url = image['url']

    if nonblank_string?(name)
      validate_unique(name.strip, names, "#{label} name", errors)
    else
      errors << "#{label}: name must be a non-empty string"
    end

    unless nonblank_string?(url)
      errors << "#{label}: url must be a non-empty string"
      next
    end

    validate_unique(url, urls, "#{label} url", errors)

    begin
      parsed = URI.parse(url)
      errors << "#{label}: url must use HTTP or HTTPS: #{url}" unless %w[http https].include?(parsed.scheme) && parsed.host
    rescue URI::InvalidURIError
      errors << "#{label}: invalid URL #{url.inspect}"
    end
  end
end

if errors.any?
  warn "Site data validation failed with #{errors.length} error(s):"
  errors.each { |error| warn "- #{error}" }
  exit 1
end

puts "Validated #{comics.length} comics, #{tweet_periods.length} tweet periods and #{images.length} image records."
