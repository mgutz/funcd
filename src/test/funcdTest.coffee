Funcd = require('..')
{assert} = require('chai')
fs = require('fs')

module.exports =

  "should have short tags": ->
    assert.equal "<br/>", Funcd.render(-> @br())

  "should allow css tyles": ->
    template = ->
        @style "color: red;"
    assert.equal '<style>color: red;</style>', Funcd.render(template)

  "should have full tags": ->
    assert.equal "<div>foo</div>", Funcd.render -> @div "foo"
    assert.equal "<textarea>foo</textarea>", Funcd.render -> @textarea "foo"

  "text should be escaped by default": ->
    assert.equal "<a>1 &lt; 2</a>", Funcd.render -> @a "1 < 2"

  "attributes should be escaped": ->
    assert.equal "<a href=\"&lt;\"></a>", Funcd.render -> @a href:"<"

  "should allow empty text": ->
    assert.equal '<i class="bar"></i>', Funcd.render -> @i class:"bar"
    assert.equal '<i></i>', Funcd.render -> @i()

  "should allow text nodes": ->
    assert.equal '<p>foo<em>bar</em></p>', Funcd.render ->
      @p ->
        @text "foo"
        @em "bar"

  "should be able to pass raw strings to any element": ->
    assert.equal "<a><i>apple</i></a>", Funcd.render -> @a @_raw("<i>apple</i>")

  "should output raw text": ->
    assert.equal "<i>apple</i>", Funcd.render -> @raw "<i>apple</i>"


  "should output raw": ->
    template = ->
      @a class:"btn", -> @raw "&raquo;"
    assert.equal "<a class=\"btn\">&raquo;</a>", Funcd.render template


  "should allow nesting": ->
    assert.equal "<html><head></head><body></body></html>", Funcd.render ->
      @html ->
        @head ->
        @body ->


  "should have doctype": ->
    assert.equal "<!DOCTYPE html>", Funcd.render -> @doctype 5


  "should allow layouts via extends": ->
    layout = (title) ->
      @html ->
        @head ->
          @title title
          @block 'styles', 'foo'
          @block 'scripts'

    page = ->
      @extends layout, 'example'
      @block 'scripts', ->
        @script "var one;"

    assert.equal "<html><head><title>example</title>foo<script>var one;</script></head></html>", Funcd.render page


  "should allow layouts via variable": ->
    layout = ->
      @html ->
        @head ->
          @block 'styles', 'foo'
          @block 'scripts'

    page = (lay) ->
      @extends lay
      @block 'scripts', 'bar'

    assert.equal "<html><head>foobar</head></html>", Funcd.render page, layout


  "should render from file": ->
    assert.equal "<body></body>", Funcd.renderFile "#{__dirname}/layout.coffee"


  "should have option to not cache files": ->
    fs.writeFileSync "#{__dirname}/temp.noext", "module.exports = -> @body()"
    assert.equal "<body></body>", Funcd.renderFile "#{__dirname}/temp.noext"
    fs.writeFileSync "#{__dirname}/temp.noext", "module.exports = -> @p()"
    assert.equal "<p></p>", Funcd.renderFile "#{__dirname}/temp.noext", {}, nocache: true


  "should render from file with variables": ->
    assert.equal "<p>foo San Diego</p>", Funcd.renderFile("#{__dirname}/variables.coffee", "foo", "San Diego")


  "should extend from file": ->
    template = ->
      @extends "#{__dirname}/layout.coffee"
      @block "content", ->
        @p "foo"
    assert.equal "<body><p>foo</p></body>", Funcd.render template


  "should render from file by compile": ->
    template = Funcd.compileFile("#{__dirname}/layout.coffee")
    assert.equal "<body></body>", Funcd.render template


  "should allow partials": ->
    partial = (first, last) ->
      @p first + last

    template = ->
      @div ->
        @render partial, "foo", "bar"

    assert.equal "<div><p>foobar</p></div>", Funcd.render template


  "should accept locals": ->
    para = (name) ->
      @p name
    assert.equal "<p>foo</p>", Funcd.render para, "foo"


  "should work with closures": ->
    sum = (a, b) -> a + b
    assert.equal "<p>42</p>", Funcd.render ->
      @p sum(40, 2)


#   "should play nice with objects": ->
#     class Foo
#       foo: 'bar'
#       bah: (t) ->
#         @foo + 'baz'
#       bleh: (t) =>
#         t.p  @foo
#     foo = new Foo
#     template = ->
#       @p foo.bah(t)
#       foo.bleh t

#     assert.equal "<p>barbaz</p><p>bar</p>", Funcd.render template


  "should create default attributes": ->
    assert.equal '<script>var foo;</script>', Funcd.render -> @script "var foo;"


  "should not escape script": ->
    html = Funcd.render -> @script "a < b"
    assert.ok html.indexOf("a < b") > 0


  "should handle short tags": ->
    assert.equal "<br/><img src=\"image.png\"/>", Funcd.render ->
      @br()
      @img src: "image.png"

  "longer example": ->
    layout = ->
      @doctype 5
      @html ->
        @head ->
          @script src: "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
          @block "page-scripts"
        @body ->
          @block "body"

    footer = (text) ->
      @div id: "footer", text

    page = (name) ->
      @extends layout
      @block "body", ->
        @h1 "Simple Page"
        @div "Hello #{name}"
        @render footer, "page1"

    html = Funcd.render page, "kitty!"
    assert.equal '<!DOCTYPE html><html><head><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script></head><body><h1>Simple Page</h1><div>Hello kitty!</div><div id="footer">page1</div></body></html>', html


  "should be able to mixin instance block functions": ->
    mixins =
      reddiv: (name, block) ->
        @div class: 'red', ->
          @text name
          @render block

      bluediv: (block) ->
        @div class: 'blue', block

    template = ->
      @reddiv "foo", "bar"
      @bluediv ->
        @p "bah"

    assert.equal "<div class=\"red\">foobar</div><div class=\"blue\"><p>bah</p></div>", Funcd.render mixins: mixins, template


  "should allow OOP style layouts": ->
    class Layout extends Funcd
      template: ->
        @html ->
          @head ->
          @body ->
            @content()

    class Page extends Layout
      content: ->
        @p "foo"

    page = new Page

    assert.equal "<html><head></head><body><p>foo</p></body></html>", page.template()


  "should be able to mixin into Funcd prototype": ->
    mixins =
      reddiv: (attrs, name, block) ->
        attrs.class = 'red'
        @div attrs, ->
          @text name
          @render block

      bluediv: (block) ->
        @div class: 'blue', block

    Funcd.mixin mixins

    template = ->
      @reddiv id: "item", "foo", "bar"
      @bluediv ->
        @p "bah"

    assert.equal "<div id=\"item\" class=\"red\">foobar</div><div class=\"blue\"><p>bah</p></div>", Funcd.render template

  "should convert coffeescript to javascript (server-side only)": ->
    template = ->
      @coffee "a = 0"

    s = Funcd.render(template)
    assert.ok s.indexOf('<script type="text/javascript">') == 0
    assert.ok s.indexOf('var a;') > 0
    assert.ok s.indexOf('a = 0') > 0

  "should use coffeescript options": ->
    template = ->
      @coffee bare:true, "a = 0"

    s = Funcd.render(template)
    assert.ok s.indexOf('function') < 0
    assert.ok s.indexOf('<script type="text/javascript">') == 0
    assert.ok s.indexOf('var a;') > 0
    assert.ok s.indexOf('a = 0') > 0
