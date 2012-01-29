# Func\`d

Template engine in the style of Builder, Markaby, Erector.

* No pre-compilation needed, just functions
* Layouts
* Partials
* Blocks
* Strings are escaped
* Mixin custom blocks

## Installation

    npm install funcd

## Features

Using

    Funcd = require("funcd")


Should had layouts and partials

    layout = (t) ->
      t.doctype 5
      t.html ->
        t.head ->
          t.script src: "js/jquery.js"
          t.block "page-scripts"
        t.body ->
          t.block "body"

    footer = (t, text) ->
      t.div id: "footer", text

    page = (name) ->
      t.extends layout

      t.block "body", ->
        t.h1 "Simple Page"
        t.div "Hello #{name}"
        t.render footer, "page1"

    html = Funcd.render(pretty: true, page, "kitty!")


Should allow mixins

    mixins =
      warning: (t, attrs, name, block) ->
        attrs.class = 'warning'
        t.div attrs, ->
          t.text name
          t.render block

      info: (t, block) ->
        t.div class: 'info', block

    template = (t) ->
      t.warning id: "item", "foo", "bar"
      t.info ->
        t.p "bah"

    html = Funcd.render(mixins: mixins, template)


Should escape by default

    assert.equal "<a>1 &lt; 2</a>", Funcd.render -> @a "1 < 2"
    assert.equal "<a><i>apple</i></a>", Funcd.render -> @a @raw("<i>apple</i>")


Should allow OOP style layouts

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
