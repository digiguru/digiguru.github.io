require 'liquid'
require 'date'
require_relative '../_plugins/filters'
require_relative '../_plugins/reading_time_filter'

SiteStub = Struct.new(:config)

class FilterHarness
  include Jekyll::DateFilter
  include Jekyll::URLFilter
  include ReadingTimeFilter

  def initialize(config = {})
    @context = Liquid::Context.new({}, {}, site: SiteStub.new(config))
  end
end

class TestRunner
  def initialize
    @passed = 0
    @failed = []
  end

  def test(name)
    yield
    @passed += 1
    puts "PASS #{name}"
  rescue StandardError => error
    @failed << [name, error]
    warn "FAIL #{name}: #{error.message}"
  end

  def assert_equal(expected, actual)
    return if expected == actual

    raise "expected #{expected.inspect}, got #{actual.inspect}"
  end

  def finish!
    if @failed.any?
      warn "\n#{@failed.length} Ruby plugin test(s) failed:"
      @failed.each { |name, error| warn "- #{name}: #{error.message}" }
      exit 1
    end

    puts "\n#{@passed} Ruby plugin tests passed."
  end
end

runner = TestRunner.new
filters = FilterHarness.new

runner.test('urlify normalises names for generated pages') do
  runner.assert_equal 'hello-world.html', filters.urlify('name' => ' Hello, World! ')
  runner.assert_equal 'rock--roll.html', filters.urlify('name' => 'Rock & Roll')
end

runner.test('urlify handles missing or blank names') do
  runner.assert_equal '', filters.urlify({})
  runner.assert_equal '', filters.urlify('name' => '   ')
end

runner.test('date_sort orders items by date') do
  items = [
    { 'date' => '02-01-2024', 'name' => 'later' },
    { 'date' => '31-12-2023', 'name' => 'earlier' },
    { 'date' => '01-01-2024', 'name' => 'middle' }
  ]

  runner.assert_equal %w[earlier middle later], filters.date_sort(items).map { |item| item['name'] }
end

runner.test('reading_time uses expected bands') do
  runner.assert_equal '30 seconds', filters.reading_time('short article')
  runner.assert_equal '1 minute', filters.reading_time(Array.new(90, 'word').join(' '))
  runner.assert_equal '2 minutes', filters.reading_time(Array.new(270, 'word').join(' '))
end

runner.test('reading_time ignores preformatted code') do
  input = "<pre>#{Array.new(500, 'code').join(' ')}</pre><p>normal words</p>"
  runner.assert_equal '30 seconds', filters.reading_time(input)
end

runner.test('reading_time honours configured labels') do
  configured_filters = FilterHarness.new(
    'reading_time' => {
      'second_plural' => 'secs',
      'minute_singular' => 'min',
      'minute_plural' => 'mins'
    }
  )

  runner.assert_equal '30 secs', configured_filters.reading_time('short')
  runner.assert_equal '1 min', configured_filters.reading_time(Array.new(90, 'word').join(' '))
  runner.assert_equal '2 mins', configured_filters.reading_time(Array.new(270, 'word').join(' '))
end

runner.finish!
