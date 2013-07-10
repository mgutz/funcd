HEADER =
  """
  /**
   * Copyright (c) 2013 Mario Gutierrez <mario@mgutz.com>
   *
   * See the file LICENSE for copying permission.
   */
  """

exports.project = (pm) ->
  {f} = pm

  changeToRoot = f.tap (asset) ->
    asset.filename = asset.filename.slice(4)

  scripts:
    desc: 'Compile coffee scripts to JavaScript'
    files: 'src/**/*.coffee'
    dev: [
      f.coffee bare:true
      changeToRoot
      f.writeFile
    ]

  test:
    desc: 'Runs tests'
    files: 'src/test/funcdTest.coffee'
    dev: [
      f.mocha ui: 'exports'
    ]

  dist:
    desc: 'Compile client version ready for browser'
    files: 'src/lib/funcd.coffee'
    dev: [
      f.coffee
      f.addHeader text: HEADER
      f.writeFile _filename:  'dist/funcd.js'
    ]

    prod: [
      f.coffee
      f.uglify
      f.addHeader text: HEADER
      f.writeFile _filename:  'dist/funcd.min.js'
    ]

