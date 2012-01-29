task "build", "Builds the project", ->
  run "coffee --lint -c -b -o . src/"

task "test", "runs tests", ->
  run "mocha -u exports src/test/funcdTest.coffee"


cp = require("child_process")
run = (command) ->
  cp.exec command, (error, stdout, stderr) ->
    console.log stdout
    console.log stderr if stderr?.length > 0
    console.log "exec error: #{error}" if error?.length > 0
