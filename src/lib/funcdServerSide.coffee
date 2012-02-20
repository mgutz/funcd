Funcd = require("./funcd")

coffeescript = require("coffee-script")
fs = require("fs")
path = require("path")
require.extensions['.funcd'] = (module, filename) ->
  content = coffeescript.compile(fs.readFileSync(filename, 'utf8'), filename: filename)
  module._compile(content, filename);

Funcd::coffeescript = (options, inner) ->
  self = @
  if arguments.length == 1
    inner = options
    options = null

  code = inner
  if typeof code == "function"
    code = inner()

  jscode = coffeescript.compile(code, options)
  @script type:"text/javascript", jscode


Funcd.renderToFile = (sourceFilename, outFilename) ->
  content = Funcd.render(sourceFilename)
  fs.writeFileSync outFilename, content


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

templateFunction2 = (file) ->
  #console.log "TEMPLATEFUNCTION=#{file}"
  path = require("path")

  # compute absolute paths relative to caller not this file
  if file.indexOf('/') != 0
    callerPath = detectCallerPath(__filename, new Error)
    #console.log "CALLERPATH=#{callerPath}"
    file = path.join(path.dirname(callerPath), file)

  file += ".funcd" unless file.match(/\.funcd$/)
  content = require("fs").readFileSync(file, 'utf8')
  sandbox = 
    global: {}
    module:
      exports = {}
  cs.run content, sandbox:sandbox
  template = sandbox.module.exports


templateFunction = (filename) ->
  require filename


module.exports = Funcd