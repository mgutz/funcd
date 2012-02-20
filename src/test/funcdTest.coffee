Funcd = require('..')
{assert} = require('chai')

module.exports =

  "should have short tags": ->
    assert.equal "<br/>", Funcd.render (t) -> t.br()


  "should have full tags": ->
    assert.equal "<div>foo</div>", Funcd.render (t) -> t.div "foo"


  "text should be escaped by default": ->
    assert.equal "<a>1 &lt; 2</a>", Funcd.render (t) -> t.a "1 < 2"


  "should allow text nodes": ->
    assert.equal '<p>foo<em>bar</em></p>', Funcd.render (t) ->
      t.p ->
        t.text "foo"
        t.em "bar"

  "raw text should require some effort": ->
    assert.equal "<a><i>apple</i></a>", Funcd.render (t) -> t.a t.raw("<i>apple</i>")


  "should allow nesting": ->
    assert.equal "<html><head></head><body></body></html>", Funcd.render (t) ->
      t.html ->
        t.head ->
        t.body ->


  "should have doctype": ->
    assert.equal "<!DOCTYPE html>", Funcd.render (t) -> t.doctype 5


  "should allow layouts via extends": ->
    layout = (t) ->
      t.html ->
        t.head ->
          t.block 'styles', 'foo'
          t.block 'scripts'

    page = (t) ->
      t.extends layout
      t.block 'scripts', ->
        t.script "var one;"

    assert.equal "<html><head>foo<script type=\"text/javascript\">var one;</script></head></html>", Funcd.render page


  "should allow layouts via variable": ->
    layout = (t) ->
      t.html ->
        t.head ->
          t.block 'styles', 'foo'
          t.block 'scripts'


    page = (t, lay) ->
      t.extends lay
      t.block 'scripts', 'bar'

    assert.equal "<html><head>foobar</head></html>", Funcd.render page, layout


  "should render from file": ->
    assert.equal "<body></body>", Funcd.render "#{__dirname}/layout"

  "should render from file with variables": ->
    assert.equal "<p>foo San Diego</p>", Funcd.render("#{__dirname}/variables", "foo", "San Diego")

  "should extend from file": ->
    template = (t) ->
      t.extends "#{__dirname}/layout"
      t.block "content", ->
        t.p "foo"

    assert.equal "<body><p>foo</p></body>", Funcd.render template


  "should allow partials": ->
    partial = (t, first, last) ->
      t.p first + last

    template = (t) ->
      t.div ->
        t.render partial, "foo", "bar"

    assert.equal "<div><p>foobar</p></div>", Funcd.render template


  "should accept locals": ->
    para = (t, name) ->
      t.p name
    assert.equal "<p>foo</p>", Funcd.render para, "foo"


  "should work with functions": ->
    sum = (a, b) -> a + b
    assert.equal "<p>42</p>", Funcd.render (t) ->
      t.p sum(40, 2)


  "should play nice with objects": ->
    class Foo
      foo: 'bar'
      bah: (t) ->
        @foo + 'baz'
      bleh: (t) =>
        t.p  @foo
    foo = new Foo
    template = (t) ->
      t.p foo.bah(t)
      foo.bleh t

    assert.equal "<p>barbaz</p><p>bar</p>", Funcd.render template


  "should create default attributes": ->
    assert.equal '<script type="text/javascript">var foo;</script>', Funcd.render (t) -> t.script "var foo;"

  "should not escape script": ->
    html = Funcd.render (t) -> t.script "a < b"
    assert.ok html.indexOf("a < b") > 0

  "should handle short tags": ->
    assert.equal "<br/><img src=\"image.png\"/>", Funcd.render (t) ->
      t.br()
      t.img src: "image.png"


  "longer example": ->
    layout = (t) ->
      t.doctype 5
      t.html ->
        t.head ->
          t.script src: "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
          t.block "page-scripts"
        t.body ->
          t.block "body"

    footer = (t, text) ->
      t.div id: "footer", text

    page = (t, name) ->
      t.extends layout

      t.block "body", ->
        t.h1 "Simple Page"
        t.div "Hello #{name}"
        t.render footer, "page1"

    html = Funcd.render(pretty: true, page, "kitty!")


  "should be able to mixin instance block functions": ->
    mixins =
      reddiv: (t, name, block) ->
        t.div class: 'red', ->
          t.text name
          t.render block

      bluediv: (t, block) ->
        t.div class: 'blue', block

    template = (t) ->
      t.reddiv "foo", "bar"
      t.bluediv ->
        t.p "bah"

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


  "should be able to mixin prototype block functions": ->
    mixins =
      reddiv: (t, attrs, name, block) ->
        attrs.class = 'red'
        t.div attrs, ->
          t.text name
          t.render block

      bluediv: (t, block) ->
        t.div class: 'blue', block

    Funcd.mixin mixins

    template = (t) ->
      t.reddiv id: "item", "foo", "bar"
      t.bluediv ->
        t.p "bah"

    assert.equal "<div id=\"item\" class=\"red\">foobar</div><div class=\"blue\"><p>bah</p></div>", Funcd.render template



  "should convert coffeescript to javascript (server-side only)": ->
    template = (t) ->
      t.coffeescript "a = 0"

    s = Funcd.render(template)
    assert.ok s.indexOf('<script type="text/javascript">') == 0
    assert.ok s.indexOf('var a;') > 0
    assert.ok s.indexOf('a = 0') > 0

  "should use coffeescript options": ->
    template = (t) ->
      t.coffeescript bare:true, "a = 0"

    s = Funcd.render(template)
    assert.ok s.indexOf('function') < 0
    assert.ok s.indexOf('<script type="text/javascript">') == 0
    assert.ok s.indexOf('var a;') > 0
    assert.ok s.indexOf('a = 0') > 0
