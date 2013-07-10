module.exports = (title) ->
  @doctype 5
  @html ->
    @head ->
    @body ->
      @div id:"content"

      @script src:"https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
      @script src:"http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.1/underscore-min.js"
      @script src:"../lib/funcd.js"
      @coffeescript """
        template = ->
          @div style:"background-color:#999; color:#000", "inserted via template"

        $ ->
          $('#content').funcd template
      """
