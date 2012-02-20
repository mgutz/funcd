var Funcd, attributeList, cs, defaultAttributes, detectCallerPath, doctypes, elements, escapeHtml, htmlChars, mergeElements, mixinShortTag, mixinTag, replaceToken, templateFunction, tokensToReplace, _,
  __slice = Array.prototype.slice,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

if (typeof global !== "undefined" && global !== null) _ = require('underscore');

doctypes = {
  'default': '<!DOCTYPE html>',
  '5': '<!DOCTYPE html>',
  'xml': '<?xml version="1.0" encoding="utf-8" ?>',
  'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
  'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
  'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
  '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
  'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
  'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">',
  'ce': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "ce-html-1.0-transitional.dtd">'
};

elements = {
  full: 'a abbr address article aside audio b bdi bdo blockquote body button\
 canvas caption cite code colgroup datalist dd del details dfn div dl dt em\
 fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup\
 html i iframe ins kbd label legend li map mark menu meter nav noscript object\
 ol optgroup option output p pre progress q rp rt ruby s samp script section\
 select small span strong sub summary sup table tbody td textarea tfoot\
 th thead time title tr u ul video',
  short: 'area base br col command embed hr img input keygen link meta param\
 source track wbr',
  obsoleteFull: 'applet acronym bgsound dir frameset noframes isindex listing\
 nextid noembed plaintext rb strike xmp big blink center font marquee multicol\
 nobr spacer tt',
  obsoleteShort: 'basefont frame'
};

defaultAttributes = {
  script: {
    type: "text/javascript"
  }
};

mergeElements = function() {
  var arg, args, element, result, _i, _j, _len, _len2, _ref;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  result = [];
  for (_i = 0, _len = args.length; _i < _len; _i++) {
    arg = args[_i];
    _ref = arg.split(' ');
    for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
      element = _ref[_j];
      if (__indexOf.call(result, element) < 0) result.push(element);
    }
  }
  return result;
};

escapeHtml = function(value) {
  return value.replace(htmlChars, replaceToken);
};

tokensToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': "&quot;",
  "'": "&#39;"
};

replaceToken = function(token) {
  return tokensToReplace[token] || token;
};

htmlChars = /[&<>"']/g;

attributeList = function(tag, obj) {
  var attributes, list, name, val;
  if (obj == null) obj = {};
  attributes = defaultAttributes[tag] ? _.extend(_.clone(defaultAttributes[tag]), obj) : obj;
  list = '';
  for (name in attributes) {
    val = attributes[name];
    list += " " + name + "=\"" + (escapeHtml(val)) + "\"";
  }
  return list;
};

detectCallerPath = function(referencePath, err) {
  var i, match, path, _len, _ref;
  _ref = err.stack.match(/\(([^:]+).*\)$/mg);
  for (i = 0, _len = _ref.length; i < _len; i++) {
    match = _ref[i];
    path = match.match(/\(([^:]+)/)[1];
    if (path !== referencePath) return path;
  }
  return null;
};

templateFunction = function(file) {
  var callerPath, content, cs, path, sandbox, template;
  callerPath = detectCallerPath(__filename, new Error);
  cs = require("coffee-script");
  path = require("path");
  if (file.indexOf('.') === 0) file = path.join(path.dirname(callerPath), file);
  if (!file.match(/\.funcd$/)) file += ".funcd";
  content = require("fs").readFileSync(file, 'utf8');
  sandbox = {
    global: {},
    module: {
      exports: {}
    }
  };
  cs.eval(content, {
    sandbox: sandbox
  });
  return template = sandbox.module.exports;
};

Funcd = (function() {

  function Funcd(opts) {
    var fn, name, self, _fn, _ref, _ref2;
    if (opts == null) opts = {};
    this.pretty = (_ref = opts.pretty) != null ? _ref : false;
    self = this;
    if (opts.mixins) {
      _ref2 = opts.mixins;
      _fn = function(name, fn) {
        return self[name] = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return fn.apply(self, [self].concat(args));
        };
      };
      for (name in _ref2) {
        fn = _ref2[name];
        _fn(name, fn);
      }
    }
    this.lead = '';
    this.blocks = {};
    this.eol = this.pretty ? '\n' : '';
    this.buffers = [];
    this.buffer = "";
  }

  Funcd.prototype.block = function(name, attributes, inner) {
    var exists, options;
    this.buffers.push(this.buffer);
    this.buffer = "";
    options = {
      tag: null,
      parseBody: true,
      parseAttributes: false
    };
    this._outerHtml(options, attributes, inner);
    exists = this.blocks[name];
    this.blocks[name] = this.buffer;
    this.buffer = this.buffers.pop();
    if (exists == null) {
      return this.buffer += this.lead + ("___" + name + "___") + this.eol;
    }
  };

  Funcd.prototype.doctype = function(s) {
    return this.buffer += doctypes[s.toString()] + this.eol;
  };

  Funcd.prototype["extends"] = function(template) {
    if ((typeof global !== "undefined" && global !== null) && typeof template === "string") {
      template = templateFunction(template);
    }
    return template(this);
  };

  Funcd.mixin = function(mixins) {
    var fn, name, _results;
    _results = [];
    for (name in mixins) {
      fn = mixins[name];
      _results.push((function(name, fn) {
        return Funcd.prototype[name] = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return fn.apply(this, [this].concat(args));
        };
      })(name, fn));
    }
    return _results;
  };

  Funcd.prototype.raw = function(s) {
    return {
      __raw: s
    };
  };

  Funcd.prototype.render = function() {
    var args, template;
    template = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (typeof template === 'function') {
      return template.apply(null, [this].concat(__slice.call(args)));
    } else {
      return this.text(template.toString());
    }
  };

  Funcd.render = function() {
    var args, builder, first, options, template;
    options = arguments[0], template = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    args = Array.prototype.slice.call(arguments);
    first = args[0];
    if (_.isFunction(first)) {
      template = args[0];
      options = {};
      args = args.slice(1);
    } else if (_.isString(first)) {
      template = templateFunction(args[0]);
      options = {};
      args = args.slice(1);
    } else if (_.isObject(first)) {
      options = args[0];
      template = args[1];
      args = args.slice(2);
    }
    builder = new Funcd(options);
    template.apply(builder, [builder].concat(args));
    return builder.toHtml();
  };

  Funcd.prototype.text = function(s) {
    return this.buffer += escapeHtml(s);
  };

  Funcd.prototype.toHtml = function() {
    var innerHtml, k, _ref;
    _ref = this.blocks;
    for (k in _ref) {
      innerHtml = _ref[k];
      this.buffer = this.buffer.replace(RegExp("___" + k + "___", "g"), innerHtml);
    }
    return this.buffer;
  };

  Funcd.prototype._outerHtml = function(options, attrs, inner) {
    var arg, attributes, innerHtmlFn, innerText, parseAttributes, parseBody, tag, _i, _len, _ref;
    tag = options.tag, parseAttributes = options.parseAttributes, parseBody = options.parseBody;
    attributes = "";
    innerText = "";
    innerHtmlFn = null;
    _ref = [attrs, inner];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      arg = _ref[_i];
      switch (typeof arg) {
        case 'string':
          innerText += escapeHtml(arg);
          break;
        case 'number':
          innerText += escapeHtml(arg.toString());
          break;
        case 'function':
          innerHtmlFn = arg;
          break;
        case 'object':
          if (arg.__raw) {
            innerText = arg.__raw;
          } else {
            if (parseAttributes) {
              attributes += attributeList(tag, arg);
            } else if (arg) {
              innerText += arg.toString();
            }
          }
      }
    }
    if (parseAttributes && attributes === "" && defaultAttributes[tag]) {
      attributes += attributeList(tag);
    }
    if (tag) this.buffer += this.lead + ("<" + tag + attributes + ">" + this.eol);
    if (parseBody) {
      if (this.pretty) this.lead += '  ';
      if (innerText.length > 0) this.buffer += this.lead + innerText + this.eol;
      if (innerHtmlFn != null) innerHtmlFn.apply(this);
      if (this.pretty) this.lead = this.lead.slice(0, -2);
    }
    if (tag) return this.buffer += this.lead + ("</" + tag + ">" + this.eol);
  };

  Funcd.prototype._safeString = function(s) {
    if (s.__raw) {
      return s.__raw;
    } else {
      return s;
    }
  };

  return Funcd;

})();

if (typeof global !== "undefined" && global !== null) {
  cs = require("coffee-script");
  Funcd.prototype.coffeescript = function(options, inner) {
    var code, js;
    if (arguments.length === 1) {
      inner = options;
      options = null;
    }
    code = inner;
    if (typeof code === "function") code = inner();
    js = cs.compile(code, options);
    return this.script({
      type: "text/javascript"
    }, js);
  };
}

mixinTag = function(tag) {
  return Funcd.prototype[tag] = function(attributes, inner) {
    var options;
    options = {
      tag: tag,
      parseBody: tag !== 'textarea',
      parseAttributes: true
    };
    return this._outerHtml(options, attributes, inner);
  };
};

mixinShortTag = function(tag) {
  return Funcd.prototype[tag] = function(attributes) {
    var attrList;
    attrList = "";
    if (_.isObject(attributes)) attrList = attributeList(tag, attributes);
    return this.buffer += this.lead + ("<" + tag + attrList + "/>") + this.eol;
  };
};

(function() {
  var tag, _i, _j, _len, _len2, _ref, _ref2;
  _ref = mergeElements(elements.full, elements.obsoleteFull);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    tag = _ref[_i];
    mixinTag(tag);
  }
  _ref2 = mergeElements(elements.short, elements.obsoleteShort);
  for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
    tag = _ref2[_j];
    mixinShortTag(tag);
  }
  if (module && module.exports) {
    return module.exports = Funcd;
  } else {
    return window.Funcd = Funcd;
  }
})();
