# Func'd

Template engine in the style of Builder, Markaby, Erector.

* Blocks
* Layouts
* Mixins
* Just functions
* Partials
* Safe HTML
* jQuery asynchronous element updates

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
    Funcd.render (t) -> t.a "1 < 2"

    # <a><i>apple</i></a>
    Funcd.render (t) -> t.a t.raw("<i>apple</i>")


Render from files

    # test.funcd
    module.exports = (t, name, city) ->
      t.div name + " " + city

    # <div>foo San Diego</div>
    Funcd.render "./test", "foo", "San Diego" 


jQuery Asynchronous updates

    module.exports = (t) ->
      t.html ->
        t.body ->
          t.div id:"content"

          t.coffeescript """
            update = ($el) ->
              setTimeout (-> 
                $el.funcd (t) -> t.div "bar baby!"
              ), 2000

            template = (t) ->
              t.div style:"background-color:#999; color:#000", "inserted via template"
              t.div "data-funcd-async":update, "this will change in 2 seconds"

            $ ->
              $('#content').funcd template
          """


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
