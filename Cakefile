asyncblock = require("asyncblock")

task "build", "Builds the project", ->
  run "coffee --lint -c -o . src/"
  writeHtml "src/test/index.funcd", "test/index.html"

task "test", "runs tests", ->
  run "mocha -u exports src/test/funcdTest.coffee"

writeHtml = (file, out) ->
  # lazily require because funcd may not compile cleanly while developing
  Funcd = require(".")
  Funcd.renderToFile file, out

cp = require("child_process")

run = (command) ->
  asyncblock (flow) ->
    cp.exec command, flow.add(['stdout', 'stderr'])
    results = flow.wait()
    console.log results.stdout if results.stdout?.length > 0
    console.error results.stderr if results.stderr?.length > 0
