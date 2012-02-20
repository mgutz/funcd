#==============================================================================
# Copyright (c) 2012 Mario L Gutierrez, <mario@mgutz.com>
# http://mgutz.github.com
#
# MIT Licensed
#==============================================================================

_ = require('underscore') if global?


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
 select small span strong sub summary sup table tbody td textarea tfoot
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
escapeHtml = (value) ->
  value.replace htmlChars, replaceToken

tokensToReplace =
    '&': '&amp;'
    '<': '&lt;'
    '>': '&gt;'
    '"': "&quot;"
    "'": "&#39;"
replaceToken = (token) ->
    tokensToReplace[token] || token

htmlChars = /[&<>"']/g


# Builds the attribute list for a tag.
#
# Checks `defaultAttributes` for attributes.
attributeList = (tag, obj={}) ->
  attributes =
    if defaultAttributes[tag]
      _.extend(_.clone(defaultAttributes[tag]), obj)
    else
      obj

  list = ''
  for name, val of attributes
    list += " #{name}=\"#{escapeHtml(val)}\""
  list


class Funcd
  constructor: (opts = {}) ->
    @pretty = opts.pretty ? false

    self = @
    if opts.mixins
      for name, fn of opts.mixins
        do (name, fn) ->
          self[name] = (args...) ->
            # mixin's first argument is this object
            fn.apply self, [self].concat(args)

    # leading chars for indentation
    @lead = ''

    @blocks = {}
    @eol = if @pretty then '\n' else ''
    @buffers = []

    @buffer = ""



  block: (name, attributes, inner) ->
    @buffers.push @buffer
    @buffer = ""

    options = tag: null, parseBody: true, parseAttributes: false
    @_outerHtml options, attributes, inner

    exists = @blocks[name]

    @blocks[name] = @buffer
    @buffer = @buffers.pop()

    # mark the block in the string for replacment later
    @buffer += @lead + "___#{name}___" + @eol unless exists?

  doctype: (s) ->
    @buffer += doctypes[s.toString()] + @eol

  # Extend a layout template.
  #
  # @param {String|Object} template Path or object.
  extends: (template) ->
    if global? and typeof template is "string"
      template = require(template)
    template @

  @mixin = (mixins) ->
    for name, fn of mixins
      do (name, fn) ->
        Funcd::[name] = (args...) ->
          # mixin's first argument is this object
          fn.apply @, [@].concat(args)

  raw: (s) ->
    __raw: s

  # Renders a template function.
  #
  # @param {Function} template
  render: (template, args...) ->
    if typeof template == 'function'
      template @, args...
    else
      @text template.toString()

  # Renders a template function. Class method.
  #
  # @param {object} options The otpions to pass to Funcd.
  # @param {Function} template
  @render: (options, template, args...) ->
    args = Array.prototype.slice.call(arguments)
    type = typeof args[0]

    if type == 'function'
      template = args[0]
      options = {}
      args = args.slice(1)
    else if type  == 'object'
      options = args[0]
      template = args[1]
      args = args.slice(2)
    else
      console.log "HUH"

    builder = new Funcd(options)
    template.apply builder, [builder].concat(args)
    builder.toHtml()

  # text element
  text: (s) ->
    @buffer += escapeHtml(s)

  toHtml: ->
    # replace all blocks
    for k, innerHtml of @blocks
      @buffer = @buffer.replace(///___#{k}___///g, innerHtml)
    @buffer




  #////////////// Protected methods
  _outerHtml: (options, attrs, inner) ->
    {tag, parseAttributes, parseBody} = options


    attributes = ""
    innerText = ""
    innerHtmlFn = null

    for arg in [attrs, inner]
      switch typeof arg
        when 'string'
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
    if parseAttributes and attributes == "" and defaultAttributes[tag]
      attributes += attributeList(tag)

    @buffer += @lead + "<#{tag}#{attributes}>#{@eol}" if tag
    if parseBody
      @lead += '  ' if @pretty
      @buffer += @lead + innerText + @eol if innerText.length > 0
      innerHtmlFn?.apply @
      @lead = @lead[0...-2] if @pretty
    @buffer += @lead + "</#{tag}>#{@eol}" if tag

  _safeString: (s) ->
    if s.__raw then s.__raw else s

if global?
  cs = require("coffee-script")
  Funcd::coffeescript = (options, inner) ->
    if arguments.length == 1
      inner = options
      options = null

    code = inner
    if typeof code == "function"
      code = inner()

    js = cs.compile(code, options)
    @script type:"text/javascript", js


mixinTag = (tag) ->
  Funcd::[tag] = (attributes, inner) ->
    options = tag: tag, parseBody: tag != 'textarea', parseAttributes: true
    @_outerHtml options, attributes, inner


mixinShortTag = (tag) ->
  Funcd::[tag] = (attributes) ->
    attrList = ""
    if _.isObject(attributes)
      attrList = attributeList(tag, attributes)
    @buffer += @lead + "<#{tag}#{attrList}/>" + @eol


# Code to run
do ->
  for tag in mergeElements(elements.full, elements.obsoleteFull)
    mixinTag tag

  for tag in mergeElements(elements.short, elements.obsoleteShort)
    mixinShortTag tag

  if module && module.exports
    module.exports = Funcd
  else
    window.Funcd = Funcd