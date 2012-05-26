o = require("shelljs")

task "build", "Builds the project", ->
  o.exec "coffee --lint -c -o . src/"
  writeHtml "src/test/index.funcd", "test/index.html"

task "test", "runs tests", ->
  o.exec "mocha -u exports --compilers coffee:coffee-script src/test/funcdTest.coffee"

writeHtml = (file, out) ->
  # lazily require because funcd may not compile cleanly while developing
  Funcd = require(".")
  Funcd.renderToFile file, out

