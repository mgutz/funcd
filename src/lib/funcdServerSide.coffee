Funcd = require("./funcd")

coffeescript = require("coffee-script")
fs = require("fs")
path = require("path")
require.extensions['.funcd'] = (module, filename) ->
  content = coffeescript.compile(fs.readFileSync(filename, 'utf8'), filename: filename)
  module._compile(content, filename)

Funcd::coffee = (options, inner) ->
  self = @
  if arguments.length == 1
    inner = options
    options = null

  code = inner
  if typeof code == "function"
    code = inner()

  jscode = coffeescript.compile(code, options)
  @script type:"text/javascript", jscode


# Compiles a funcd template
Funcd.compile = (source, filename='') ->
  js = coffeescript.compile(source, filename: filename, bare: true)

  _exports = {}
  _module = exports: _exports
  fn = new Function('exports', 'require', 'module', js)
  fn _exports, null, _module
  _module.exports


# Compiles a funcd template
Funcd.compileFile = (filename) ->
  source = fs.readFileSync(filename, 'utf8')
  Funcd.compile source, filename


# Renders a template to a file.
#
# @param {String} sourceFilename
# @param {String} outFilename
Funcd.renderFile = (filename, args...) ->
  template = Funcd.compileFile(filename)
  throw new Error('File did not module.exports a single function') if typeof template isnt 'function'
  text = Funcd.render(template, args...)

# Detects the path of the calling function.
#
# Example
#   path = detectCallerPath(__filename, new Error)
#
# @param {String} referencePath Pass `__filename` as this argument.
# @param {Error} err Pass `new Error` as this argument.
detectCallerPath = (referencePath, err) ->
  #console.log err.stack
  for match, i in err.stack.match(/\(([^:]+).*\)$/mg)
    path = match.match(/\(([^:]+)/)[1]
    #console.log "PATH=#{path}"
    if path != referencePath
      return path
  null

module.exports = Funcd
