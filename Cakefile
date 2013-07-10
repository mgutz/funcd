$ = require("projmate-shell")
Fs = require('fs')
Funcd = require(".")

task "build", "Builds the project", ->
  $.coffee "-c -o . src/"

task "test", "runs tests", ->
  $.run "#{$.which('mocha')} -u exports --compilers coffee:coffee-script src/test/funcdTest.coffee", ->

task "example", "Creates test/index.html", ->
  # lazily require because funcd may not compile cleanly while developing
  html = Funcd.renderFile('src/test/index.coffee')
  Fs.writeFileSync 'test/index.html', html

