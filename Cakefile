task "build", "Builds the project", ->
  run "coffee --lint -c -b -o . src/"
  
task "html", "", ->
  writeHtml "src/test/index.funcd", "test/index.html"

task "test", "runs tests", ->
  run "mocha -u exports src/test/funcdTest.coffee"


writeHtml = (file, out) ->
  # lazily require because funcd may not compile cleanly while developing
  Funcd = require(".")
  Funcd.renderToFile file, out


cp = require("child_process")
run = (command) ->
  cp.exec command, (error, stdout, stderr) ->
    console.log stdout
    console.log stderr if stderr?.length > 0
    console.log "exec error: #{error}" if error?.length > 0
