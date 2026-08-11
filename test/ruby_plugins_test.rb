require 'minitest/autorun'
require 'liquid'
require 'date'
require_relative '../_plugins/filters'
require_relative '../_plugins/reading_time_filter'

class RubyPluginsTest < Minitest::Test
  SiteStub = Struct.new(:config)

  class FilterHarness
    include Jekyll::DateFilter
    include Jekyll::URLFilter
    include ReadingTimeFilter

    def initialize(config = {})
      @context = Liquid::Context.new({}, {}, site: SiteStub.new(config))
    end
  end

  def setup
    @filters = FilterHarness.new
  end

  def test_urlify_normalises_names_for_generated_pages
    assert_equal 'hello-world.html', @filters.urlify('name' => ' Hello, World! ')
    assert_equal 'rock--roll.html', @filters.urlify('name' => 'Rock & Roll')
  end

  def test_urlify_handles_missing_or_blank_names
    assert_equal '', @filters.urlify({})
    assert_equal '', @filters.urlify('name' => '   ')
  end

  def test_date_sort_orders_items_by_date
    items = [
      { 'date' => '02-01-2024', 'name' => 'later' },
      { 'date' => '31-12-2023', 'name' => 'earlier' },
      { 'date' => '01-01-2024', 'name' => 'middle' }
    ]

    assert_equal %w[earlier middle later], @filters.date_sort(items).map { |item| item['name'] }
  end

  def test_reading_time_uses_expected_bands
    assert_equal '30 seconds', @filters.reading_time('short article')
    assert_equal '1 minute', @filters.reading_time(Array.new(90, 'word').join(' '))
    assert_equal '2 minutes', @filters.reading_time(Array.new(270, 'word').join(' '))
  end

  def test_reading_time_ignores_preformatted_code
    input = "<pre>#{Array.new(500, 'code').join(' ')}</pre><p>normal words</p>"

    assert_equal '30 seconds', @filters.reading_time(input)
  end

  def test_reading_time_honours_configured_labels
    filters = FilterHarness.new(
      'reading_time' => {
        'second_plural' => 'secs',
        'minute_singular' => 'min',
        'minute_plural' => 'mins'
      }
    )

    assert_equal '30 secs', filters.reading_time('short')
    assert_equal '1 min', filters.reading_time(Array.new(90, 'word').join(' '))
    assert_equal '2 mins', filters.reading_time(Array.new(270, 'word').join(' '))
  end
end
