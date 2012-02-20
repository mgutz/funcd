var Funcd, coffeescript, detectCallerPath, fs, path, templateFunction, templateFunction2;

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

templateFunction2 = function(file) {
  var callerPath, content, exports, sandbox, template;
  path = require("path");
  if (file.indexOf('/') !== 0) {
    callerPath = detectCallerPath(__filename, new Error);
    file = path.join(path.dirname(callerPath), file);
  }
  if (!file.match(/\.funcd$/)) file += ".funcd";
  content = require("fs").readFileSync(file, 'utf8');
  sandbox = {
    global: {},
    module: exports = {}
  };
  cs.run(content, {
    sandbox: sandbox
  });
  return template = sandbox.module.exports;
};

templateFunction = function(filename) {
  return require(filename);
};

module.exports = Funcd;
