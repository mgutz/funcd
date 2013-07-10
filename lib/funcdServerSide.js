var Funcd, coffeescript, detectCallerPath, fs, path,
  __slice = [].slice;

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

Funcd.prototype.coffee = function(options, inner) {
  var code, jscode, self;
  self = this;
  if (arguments.length === 1) {
    inner = options;
    options = null;
  }
  code = inner;
  if (typeof code === "function") {
    code = inner();
  }
  jscode = coffeescript.compile(code, options);
  return this.script({
    type: "text/javascript"
  }, jscode);
};

Funcd.compile = function(source, filename) {
  var fn, js, _exports, _module;
  if (filename == null) {
    filename = '';
  }
  js = coffeescript.compile(source, {
    filename: filename,
    bare: true
  });
  _exports = {};
  _module = {
    exports: _exports
  };
  fn = new Function('exports', 'require', 'module', js);
  fn(_exports, null, _module);
  return _module.exports;
};

Funcd.compileFile = function(filename) {
  var source;
  source = fs.readFileSync(filename, 'utf8');
  return Funcd.compile(source, filename);
};

Funcd.renderFile = function() {
  var args, filename, template, text;
  filename = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  template = Funcd.compileFile(filename);
  if (typeof template !== 'function') {
    throw new Error('File did not module.exports a single function');
  }
  return text = Funcd.render.apply(Funcd, [template].concat(__slice.call(args)));
};

detectCallerPath = function(referencePath, err) {
  var i, match, _i, _len, _ref;
  _ref = err.stack.match(/\(([^:]+).*\)$/mg);
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    match = _ref[i];
    path = match.match(/\(([^:]+)/)[1];
    if (path !== referencePath) {
      return path;
    }
  }
  return null;
};

module.exports = Funcd;
