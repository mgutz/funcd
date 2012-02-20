(function() {

  module.exports = function(t) {
    t.doctype(5);
    return t.html(function() {
      t.head(function() {});
      return t.body(function() {
        t.div({
          id: "content"
        });
        t.script({
          src: "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
        });
        t.script({
          src: "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.1/underscore-min.js"
        });
        t.script({
          src: "../lib/funcd.js"
        });
        return t.coffeescript("update = ($el) ->\n  setTimeout (-> \n    $el.funcd (t) -> t.div \"bar baby!\"\n  ), 2000\n\ntemplate = (t) ->\n  t.div style:\"background-color:#999; color:#000\", \"inserted via template\"\n  t.div \"data-funcd-async\":update, \"this will change in 2 seconds\"\n\n$ ->\n  $('#content').funcd template");
      });
    });
  };

}).call(this);
