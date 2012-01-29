var FuncdUp, attributeList, defaultAttributes, doctypes, elements, escapeHtml, mergeElements, mixinShortTag, mixinTag, tag, _, _i, _j, _len, _len2, _ref, _ref2,
  __slice = Array.prototype.slice,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

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
  return value.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split('"').join("&quot;").split("'").join("&#39;");
};

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

FuncdUp = (function() {

  function FuncdUp(opts) {
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
          return fn.apply(self, args);
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

  FuncdUp.prototype.block = function() {
    var body, exists, name, options;
    name = arguments[0], body = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    this.buffers.push(this.buffer);
    this.buffer = "";
    options = {
      tag: null,
      parseBody: true,
      parseAttributes: false
    };
    this._outerHtml.apply(this, [options].concat(__slice.call(body)));
    exists = this.blocks[name];
    this.blocks[name] = this.buffer;
    this.buffer = this.buffers.pop();
    if (exists == null) {
      return this.buffer += this.lead + ("___" + name + "___") + this.eol;
    }
  };

  FuncdUp.prototype.doctype = function(s) {
    return this.buffer += doctypes[s.toString()] + this.eol;
  };

  FuncdUp.prototype["extends"] = function(lambda) {
    return lambda.apply(this);
  };

  FuncdUp.mixin = function(mixins) {
    var fn, name, _results;
    _results = [];
    for (name in mixins) {
      fn = mixins[name];
      _results.push((function(name, fn) {
        return FuncdUp.prototype[name] = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return fn.apply(this, args);
        };
      })(name, fn));
    }
    return _results;
  };

  FuncdUp.prototype.raw = function(s) {
    return {
      __raw: s
    };
  };

  FuncdUp.prototype.render = function() {
    var args, template;
    template = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (typeof template === 'function') {
      return template.apply(this, args);
    } else {
      return this.text(template.toString());
    }
  };

  FuncdUp.render = function() {
    var args, builder, options, t, template, type, _i, _len;
    options = arguments[0], template = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    args = Array.prototype.slice.call(arguments);
    type = typeof args[0];
    if (type === 'function' || type === 'array') {
      template = args[0];
      options = {};
      args = args.slice(1);
    } else if (type === 'object') {
      options = args[0];
      template = args[1];
      args = args.slice(2);
    } else {
      console.log("HUH");
    }
    builder = new FuncdUp(options);
    if (typeof template === 'array') {
      console.log("ARRAY");
      for (_i = 0, _len = template.length; _i < _len; _i++) {
        t = template[_i];
        t.apply(builder, args);
      }
    } else {
      template.apply(builder, args);
    }
    return builder.toHtml();
  };

  FuncdUp.prototype.reset = function(html) {
    if (html == null) html = '';
    return this.buffer = html;
  };

  FuncdUp.prototype.t = function(s) {
    return this.buffer += escapeHtml(s);
  };

  FuncdUp.prototype.text = function(s) {
    return this.buffer += escapeHtml(s);
  };

  FuncdUp.prototype.toHtml = function() {
    var innerHtml, k, _ref;
    _ref = this.blocks;
    for (k in _ref) {
      innerHtml = _ref[k];
      this.buffer = this.buffer.replace(RegExp("___" + k + "___", "g"), innerHtml);
    }
    return this.buffer;
  };

  FuncdUp.prototype._outerHtml = function() {
    var arg, args, attributes, innerHtmlFn, innerText, options, parseAttributes, parseBody, tag, _i, _len;
    options = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    tag = options.tag, parseAttributes = options.parseAttributes, parseBody = options.parseBody;
    attributes = "";
    innerText = "";
    innerHtmlFn = null;
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
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
            } else {
              innerText += arg.toString();
            }
          }
          break;
        default:
          innerText += arg.toString();
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

  FuncdUp.prototype._safeString = function(s) {
    if (s.__raw) {
      return s.__raw;
    } else {
      return s;
    }
  };

  return FuncdUp;

})();

mixinTag = function(tag) {
  return FuncdUp.prototype[tag] = function() {
    var args, options;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    options = {
      tag: tag,
      parseBody: tag !== 'textarea',
      parseAttributes: true
    };
    return this._outerHtml.apply(this, [options].concat(__slice.call(args)));
  };
};

mixinShortTag = function(tag) {
  FuncdUp.prototype[tag] = function(attributes) {
    var attrList;
    console.log("tag=" + (JSON.stringify(tag)));
    attrList = "";
    if (_.isObject(attributes)) attrList = attributeList(tag, attributes);
    return console.log("attrList=" + (JSON.stringify(attrList)));
  };
  return this.buffer += this.lead + ("<" + tag + attrList + "/>") + this.eol;
};

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

module.exports = FuncdUp;
