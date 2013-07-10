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

    layout = ->
      @doctype 5
      @html ->
        @head ->
          @script src: "js/jquery.js"
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
        @render footer "page1"

    html = Funcd.render(page, "kitty!")


Mixins

    mixins =
      info: (block) ->
        @div class: 'info', block

    template = ->
      @info ->
        @div "bah"

    # <div class="info"><div>bah</div></div>
    Funcd.render mixins: mixins, template


Safe HTML

    # <a>1 &lt; 2</a>
    Funcd.render -> @a "1 < 2"

    # <a><i>apple</i></a>
    Funcd.render -> @a @raw("<i>apple</i>")


Render from files

    # test.coffee
    module.exports = (name, city) ->
      @div name + " " + city

    # <div>foo San Diego</div>
    Funcd.renderFile "#{__dirname}/test.coffee", "foo", "San Diego"

### Licensed Under MIT License

See the file LICENSE 
