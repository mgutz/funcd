module.exports = function(title) {
  this.doctype(5);
  return this.html(function() {
    this.head(function() {});
    return this.body(function() {
      this.div({
        id: "content"
      });
      this.script({
        src: "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
      });
      this.script({
        src: "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.1/underscore-min.js"
      });
      this.script({
        src: "../lib/funcd.js"
      });
      return this.coffeescript("template = ->\n  @div style:\"background-color:#999; color:#000\", \"inserted via template\"\n\n$ ->\n  $('#content').funcd template");
    });
  });
};
