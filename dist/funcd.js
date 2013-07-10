/**
 * Copyright (c) 2013 Mario Gutierrez <mario@mgutz.com>
 *
 * See the file LICENSE for copying permission.
 */(function() {
  var Funcd, attributeList, defaultAttributes, doctypes, elements, escapeHtml, mergeElements, mixinShortTag, mixinTag, rawContentElements, tag, _, _i, _j, _len, _len1, _ref, _ref1,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (typeof global !== "undefined" && global !== null) {
    _ = require('underscore');
  } else {
    _ = window._;
  }

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
 select small span strong style sub summary sup table tbody td textarea tfoot\
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
    },
    style: {
      type: "text/css"
    }
  };

  rawContentElements = ['script', 'style'];

  mergeElements = function() {
    var arg, args, element, result, _i, _j, _len, _len1, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    result = [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      _ref = arg.split(' ');
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        element = _ref[_j];
        if (__indexOf.call(result, element) < 0) {
          result.push(element);
        }
      }
    }
    return result;
  };

  escapeHtml = function(txt) {
    if (typeof txt === 'string') {
      return txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    } else {
      return txt;
    }
  };

  attributeList = function(tag, obj) {
    var list, name, val;
    if (obj == null) {
      obj = {};
    }
    list = '';
    for (name in obj) {
      val = obj[name];
      list += " " + name + "=\"" + (escapeHtml(val)) + "\"";
    }
    return list;
  };

  mixinTag = function(tag) {
    return Funcd.prototype[tag] = function(attributes, inner) {
      var options;
      options = {
        tag: tag,
        parseBody: true,
        parseAttributes: true
      };
      return this._outerHtml(options, attributes, inner);
    };
  };

  mixinShortTag = function(tag) {
    return Funcd.prototype[tag] = function(attributes) {
      var attrList;
      attrList = "";
      if (_.isObject(attributes)) {
        attrList = attributeList(tag, attributes);
      }
      return this.buffer += "<" + tag + attrList + "/>";
    };
  };

  Funcd = (function() {
    function Funcd(opts) {
      var fn, name, self, _fn, _ref;
      if (opts == null) {
        opts = {};
      }
      this.options = opts;
      self = this;
      if (opts.mixins) {
        _ref = opts.mixins;
        _fn = function(name, fn) {
          return self[name] = function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return fn.apply(self, args);
          };
        };
        for (name in _ref) {
          fn = _ref[name];
          _fn(name, fn);
        }
      }
      this.blocks = null;
      this.buffers = [];
      this.buffer = "";
    }

    Funcd.prototype.block = function(name, attributes, inner) {
      var exists, options;
      if (this.blocks == null) {
        this.blocks = {};
      }
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
        return this.buffer += "___" + name + "___";
      }
    };

    Funcd.prototype.doctype = function(s) {
      return this.buffer += doctypes[s.toString()];
    };

    Funcd.prototype["extends"] = function() {
      var args, template;
      template = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (typeof template === "string" && (typeof global !== "undefined" && global !== null)) {
        template = Funcd.compileFile(template);
      }
      return template.apply(this, args);
    };

    Funcd.mixin = function(mixins) {
      var fn, name, _fn;
      _fn = function(name, fn) {
        return Funcd.prototype[name] = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return fn.apply(this, args);
        };
      };
      for (name in mixins) {
        fn = mixins[name];
        _fn(name, fn);
      }
    };

    Funcd.prototype._raw = function(s) {
      return {
        __raw: s
      };
    };

    Funcd.prototype.render = function() {
      var args, template;
      template = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (typeof template === 'function') {
        return template.apply(this, args);
      } else {
        return this.text(template.toString());
      }
    };

    Funcd.render = function() {
      var builder, locals, options, template;
      options = arguments[0], locals = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (typeof options === "function") {
        template = options;
        options = {};
      } else if (_.isObject(options)) {
        template = locals[0];
        locals = locals.slice(1);
      }
      if (typeof template !== "function") {
        throw new Error(template + 'is not a function');
      }
      builder = new Funcd(options);
      template.apply(builder, locals);
      return builder.toHtml();
    };

    Funcd.prototype.raw = function(s) {
      return this.buffer += s;
    };

    Funcd.prototype.text = function(s) {
      return this.buffer += escapeHtml(s);
    };

    Funcd.prototype.toHtml = function() {
      var innerHtml, k, _ref;
      if (this.blocks !== null) {
        _ref = this.blocks;
        for (k in _ref) {
          innerHtml = _ref[k];
          this.buffer = this.buffer.replace(RegExp("___" + k + "___", "g"), innerHtml);
        }
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
        if (arg === null) {
          continue;
        }
        switch (typeof arg) {
          case 'string':
            if (tag === "script" || tag === "style") {
              innerText += arg;
            } else {
              innerText += escapeHtml(arg);
            }
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
      if (tag) {
        this.buffer += "<" + tag + attributes + ">";
      }
      if (parseBody) {
        if (innerText.length > 0) {
          this.buffer += innerText;
        }
        if (innerHtmlFn !== null) {
          innerHtmlFn.apply(this);
        }
      }
      if (tag) {
        return this.buffer += "</" + tag + ">";
      }
    };

    return Funcd;

  })();

  _ref = mergeElements(elements.full, elements.obsoleteFull);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    tag = _ref[_i];
    mixinTag(tag);
  }

  _ref1 = mergeElements(elements.short, elements.obsoleteShort);
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    tag = _ref1[_j];
    mixinShortTag(tag);
  }

  if (typeof jQuery !== "undefined" && jQuery !== null) {
    jQuery.fn.funcd = function() {
      var locals, template;
      template = arguments[0], locals = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return this.each(function() {
        var $obj;
        $obj = jQuery(this);
        return $obj.html(Funcd.render.apply(Funcd, [template].concat(__slice.call(locals))));
      });
    };
  }

  if (typeof global !== "undefined" && global !== null) {
    module.exports = Funcd;
  } else {
    window.Funcd = Funcd;
  }

}).call(this);
