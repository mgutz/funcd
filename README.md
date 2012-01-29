# Func'd

Template engine in the style of Builder, Markaby, Erector.

* Blocks
* Layouts
* Mixins
* Just functions
* Partials
* Safe HTML

## Installation

    npm install funcd

## Features

Using

    Funcd = require("funcd")

Layouts and partials

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
        footer t, "page1"

    html = Funcd.render(page, "kitty!")


Mixins

    mixins =
      info: (t, block) ->
        t.div class: 'info', block

    template = (t) ->
      t.info ->
        t.div "bah"

    # <div class="info"><div>bah</div></div>
    Funcd.render mixins: mixins, template


Safe HTML

    # <a>1 &lt; 2</a>
    Funcd.render -> @a "1 < 2"

    # <a><i>apple</i></a>
    Funcd.render -> @a @raw("<i>apple</i>")


OOP if you prefer

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

    # <html><head></head><body><p>foo</p></body></html>
    page.template()
