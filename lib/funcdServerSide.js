(function() {
  var Funcd, coffeescript, detectCallerPath, fs, path;

  Funcd = require("./funcd");

  coffeescript = require("coffee-script");

  fs = require("fs");

  path = require("path");

  require.extensions['.funcd'] = function(module, filename) {
    var content;
    content = coffeescript.compile(fs.readFileSync(filename, 'utf8'), {
      filename: filename
    });
    return module._compile(content, filename);
  };

  Funcd.prototype.coffeescript = function(options, inner) {
    var code, jscode, self;
    self = this;
    if (arguments.length === 1) {
      inner = options;
      options = null;
    }
    code = inner;
    if (typeof code === "function") code = inner();
    jscode = coffeescript.compile(code, options);
    return this.script({
      type: "text/javascript"
    }, jscode);
  };

  Funcd.renderToFile = function(sourceFilename, outFilename) {
    var content;
    content = Funcd.render(sourceFilename);
    return fs.writeFileSync(outFilename, content);
  };

  detectCallerPath = function(referencePath, err) {
    var i, match, _len, _ref;
    _ref = err.stack.match(/\(([^:]+).*\)$/mg);
    for (i = 0, _len = _ref.length; i < _len; i++) {
      match = _ref[i];
      path = match.match(/\(([^:]+)/)[1];
      if (path !== referencePath) return path;
    }
    return null;
  };

  module.exports = Funcd;

}).call(this);
