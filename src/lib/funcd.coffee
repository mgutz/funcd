#==============================================================================
# Copyright (c) 2012 Mario L Gutierrez, <mario@mgutz.com>
# http://mgutz.github.com
#
# MIT Licensed
#==============================================================================

if global?
  _ = require('underscore')
else
  _ = window._

doctypes =
  'default': '<!DOCTYPE html>'
  '5': '<!DOCTYPE html>'
  'xml': '<?xml version="1.0" encoding="utf-8" ?>'
  'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
  'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
  'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">'
  '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">'
  'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">'
  'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
  'ce': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "ce-html-1.0-transitional.dtd">'

elements =
  full: 'a abbr address article aside audio b bdi bdo blockquote body button
 canvas caption cite code colgroup datalist dd del details dfn div dl dt em
 fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup
 html i iframe ins kbd label legend li map mark menu meter nav noscript object
 ol optgroup option output p pre progress q rp rt ruby s samp script section
 select small span strong style sub summary sup table tbody td textarea tfoot
 th thead time title tr u ul video'

  short: 'area base br col command embed hr img input keygen link meta param
 source track wbr'

  obsoleteFull: 'applet acronym bgsound dir frameset noframes isindex listing
 nextid noembed plaintext rb strike xmp big blink center font marquee multicol
 nobr spacer tt'

  obsoleteShort: 'basefont frame'

defaultAttributes =
  script:
    type: "text/javascript"
  style:
    type: "text/css"

rawContentElements = ['script', 'style']


mergeElements = (args...) ->
  result = []
  for arg in args
    for element in arg.split ' '
      result.push element unless element in result
  result



# Safely escapes HTML per
#
# Read http://www.squarefree.com/securitytips/web-developers.html
#
# @param {String} value
# escapeHtml = (value) ->
#   return "" if !value
#   value.replace htmlChars, replaceToken

# tokensToReplace =
#     '&': '&amp;'
#     '<': '&lt;'
#     '>': '&gt;'
#     '"': "&quot;"
#     "'": "&#39;"
# replaceToken = (token) ->
#     tokensToReplace[token] || token

# htmlChars = /[&<>"']/g

escapeHtml = (txt) ->
  if typeof txt == 'string'
    txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  else
    txt

# Builds the attribute list for a tag.
#
# Checks `defaultAttributes` for attributes.
attributeList = (tag, obj={}) ->
  list = ''
  for name, val of obj
    list += " #{name}=\"#{escapeHtml(val)}\""
  list


mixinTag = (tag) ->
  Funcd::[tag] = (attributes, inner) ->
    options = tag: tag, parseBody: true, parseAttributes: true
    @_outerHtml options, attributes, inner


mixinShortTag = (tag) ->
  Funcd::[tag] = (attributes) ->
    attrList = ""
    if _.isObject(attributes)
      attrList = attributeList(tag, attributes)
    @buffer += "<#{tag}#{attrList}/>"


class Funcd
  constructor: (opts = {}) ->
    @options = opts

    self = @
    if opts.mixins
      for name, fn of opts.mixins
        do (name, fn) ->
          self[name] = (args...) ->
            # mixin's first argument is this object
            fn.apply self, args

    # leading chars for indentation

    @blocks = null
    @buffers = []
    @buffer = ""


  block: (name, attributes, inner) ->
    @blocks ?= {}
    @buffers.push @buffer
    @buffer = ""

    options = tag: null, parseBody: true, parseAttributes: false
    @_outerHtml options, attributes, inner

    exists = @blocks[name]

    @blocks[name] = @buffer
    @buffer = @buffers.pop()

    # mark the block in the string for replacment later
    @buffer += "___#{name}___" unless exists?


  doctype: (s) ->
    @buffer += doctypes[s.toString()]


  # Extend a layout template.
  #
  # @param {String|Object} template Path or object.
  extends: (template, args...) ->
    if typeof template is "string" and global?
      template = Funcd.compileFile(template)
    template.apply @, args

  @mixin = (mixins) ->
    for name, fn of mixins
      do (name, fn) ->
        Funcd::[name] = (args...) ->
          # mixin's first argument is this object
          fn.apply @, args
    return

  _raw: (s) ->
    __raw: s


  # Renders a template function.
  #
  # @param {Object|Function|String} template
  render: (template, args...) ->
    if typeof template is 'function'
      template.apply @, args
    else
      @text template.toString()


  # Renders a template function. Class method.
  #
  # @param {object} options The options to pass to Funcd.
  # @param {Function} template
  @render: (options, locals...) ->

    # Funcd.render template, 'hello', 1
    if typeof options is "function"
      template = options
      options = {}

    else if _.isObject(options)
      template = locals[0]
      locals = locals.slice(1)

    if typeof template isnt "function"
      throw new Error(template + 'is not a function')
    builder = new Funcd(options)
    template.apply builder, locals
    builder.toHtml()


  # Add unescaped or raw text.
  raw: (s) ->
    @buffer += s

  # text element
  text: (s) ->
    @buffer += escapeHtml(s)

  toHtml: ->
    if @blocks != null
      # replace all blocks
      for k, innerHtml of @blocks
        @buffer = @buffer.replace(///___#{k}___///g, innerHtml)

    @buffer

  # @compile: (filenameOrObject) ->
  #   (args...) ->
  #     Funcd.render filenameOrObject, args...


  #////////////// Protected methods
  _outerHtml: (options, attrs, inner) ->
    {tag, parseAttributes, parseBody} = options
    attributes = ""
    innerText = ""
    innerHtmlFn = null

    for arg in [attrs, inner]
      continue if arg is null
      switch typeof arg
        when 'string'
          if tag is "script" or tag is "style"
            innerText += arg
          else
            innerText += escapeHtml(arg)
        when 'number'
          innerText += escapeHtml(arg.toString())
        when 'function'
          innerHtmlFn = arg
        when 'object'
          if arg.__raw
            innerText = arg.__raw
          else
            if parseAttributes
              attributes += attributeList(tag, arg)
            else if arg
              innerText += arg.toString()

    # use default attributes if no attributes were passed
    @buffer += "<#{tag}#{attributes}>" if tag
    if parseBody
      @buffer += innerText if innerText.length > 0
      if innerHtmlFn != null
        innerHtmlFn.apply @
    @buffer += "</#{tag}>" if tag

# Code to run
for tag in mergeElements(elements.full, elements.obsoleteFull)
  mixinTag tag

for tag in mergeElements(elements.short, elements.obsoleteShort)
  mixinShortTag tag

#//// JQUERY (must be installed)
if jQuery?
  jQuery.fn.funcd = (template, locals...) ->
    @each ->
      $obj = jQuery(this)
      $obj.html Funcd.render(template, locals...)

if global?
  module.exports = Funcd
else
  window.Funcd = Funcd
