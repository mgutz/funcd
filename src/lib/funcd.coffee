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

DATA_FUNCD_ASYNC = 'data-funcd'

requireEx = (mod, nocache=false) ->
  # node.js caches includes
  if nocache
    delete require.cache[require.resolve(mod)]
  require(mod)


idSequence = 0
nextId = ->
  idSequence += 1
  "funcd-async-" + idSequence


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

rawContentElements = ['script']


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
  return "" if !value
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


mixinTag = (tag) ->
  Funcd::[tag] = (attributes, inner) ->
    options = tag: tag, parseBody: true, parseAttributes: true
    @_outerHtml options, attributes, inner


mixinShortTag = (tag) ->
  Funcd::[tag] = (attributes) ->
    attrList = ""
    if _.isObject(attributes)
      attrList = attributeList(tag, attributes)
    @buffer += @lead + "<#{tag}#{attrList}/>" + @eol



class Funcd
  constructor: (opts = {}) ->
    @pretty = opts.pretty ? false
    @options = opts

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
    @asyncCallbacks = []

    @buffer = ""


  applyAsyncCallbacks: ($parent) ->
    return unless @asyncCallbacks
    for pair in @asyncCallbacks
      pair.lambda jQuery('#'+pair.id)

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
    if typeof template is "string" and require?
      template = requireEx(template, @options.nocache)
    template @

  @mixin = (mixins) ->
    for name, fn of mixins
      do (name, fn) ->
        Funcd::[name] = (args...) ->
          # mixin's first argument is this object
          fn.apply @, [@].concat(args)

  _raw: (s) ->
    __raw: s


  # Renders a template function.
  #
  # @param {Object|Function|String} template
  render: (template, args...) ->
    if typeof template == 'function'
      template @, args...
    else
      @text template.toString()

  # Renders a template function. Class method.
  #
  # @param {object} options The otpions to pass to Funcd.
  # @param {Function} template
  @renderBuilder: (options, template, args...) ->
    args = [].slice.call(arguments)
    first = args[0]

    if _.isFunction(first.main)
      template = first.main
      options = {}
      args = args.slice(1)

    else if _.isFunction(first)
      template = first
      options = {}
      args = args.slice(1)

    else if _.isString(first)
      template = requireEx(first)
      if typeof template.main is "function"
        template = template.main
      options = {}
      args = args.slice(1)

    else if _.isObject(first)
      options = first
      template = if _.isFunction(args[1]) then args[1] else requireEx(args[1], options.nocache)
      if typeof template.main is "function"
        template = template.main
      args = args.slice(2)


    builder = new Funcd(options)
    template.apply builder, [builder].concat(args)
    builder


  @render: (args...) ->
    builder = @renderBuilder args...
    builder.toHtml()

  # Add unescaped or raw text.
  raw: (s) ->
    @buffer += s

  # text element
  text: (s) ->
    @buffer += escapeHtml(s)

  toHtml: ->
    # replace all blocks
    for k, innerHtml of @blocks
      @buffer = @buffer.replace(///___#{k}___///g, innerHtml)
    if @asyncCallbacks
      that = @
      setTimeout ->
        that.applyAsyncCallbacks()
      , 1

    @buffer

  @compile: (filenameOrObject) ->
    (args...) ->
      Funcd.render filenameOrObject, args...


  #////////////// Protected methods
  _outerHtml: (options, attrs, inner) ->
    {tag, parseAttributes, parseBody} = options
    attributes = ""
    innerText = ""
    innerHtmlFn = null

    for arg in [attrs, inner]
      switch typeof arg
        when 'string'
          if rawContentElements.indexOf(tag) < 0
            innerText += escapeHtml(arg)
          else
            innerText += arg
        when 'number'
          innerText += escapeHtml(arg.toString())
        when 'function'
          innerHtmlFn = arg
        when 'object'
          if arg.__raw
            innerText = arg.__raw
          else
            if parseAttributes
              if arg[DATA_FUNCD_ASYNC]
                asyncfn = arg[DATA_FUNCD_ASYNC]
                delete arg[DATA_FUNCD_ASYNC]
                unless arg.id
                  arg.id = nextId()
                @asyncCallbacks.push lambda:asyncfn, id:arg.id
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


#//// JQUERY (must be installed)
if jQuery?
  jQuery.fn.funcd = (template, args) ->
    @each ->
      $obj = jQuery(this)
      builder = Funcd.renderBuilder(template)
      $obj.html builder.toHtml()

# Code to run
do ->
  for tag in mergeElements(elements.full, elements.obsoleteFull)
    mixinTag tag

  for tag in mergeElements(elements.short, elements.obsoleteShort)
    mixinShortTag tag

  if global?
    module.exports = Funcd
  else
    window.Funcd = Funcd
