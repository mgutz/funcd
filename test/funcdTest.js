var Funcd, assert, fs,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Funcd = require('..');

assert = require('chai').assert;

fs = require('fs');

module.exports = {
  "should have short tags": function() {
    return assert.equal("<br/>", Funcd.render(function() {
      return this.br();
    }));
  },
  "should allow css tyles": function() {
    var template;
    template = function() {
      return this.style("color: red;");
    };
    return assert.equal('<style>color: red;</style>', Funcd.render(template));
  },
  "should have full tags": function() {
    assert.equal("<div>foo</div>", Funcd.render(function() {
      return this.div("foo");
    }));
    return assert.equal("<textarea>foo</textarea>", Funcd.render(function() {
      return this.textarea("foo");
    }));
  },
  "text should be escaped by default": function() {
    return assert.equal("<a>1 &lt; 2</a>", Funcd.render(function() {
      return this.a("1 < 2");
    }));
  },
  "attributes should be escaped": function() {
    return assert.equal("<a href=\"&lt;\"></a>", Funcd.render(function() {
      return this.a({
        href: "<"
      });
    }));
  },
  "should allow empty text": function() {
    assert.equal('<i class="bar"></i>', Funcd.render(function() {
      return this.i({
        "class": "bar"
      });
    }));
    return assert.equal('<i></i>', Funcd.render(function() {
      return this.i();
    }));
  },
  "should allow text nodes": function() {
    return assert.equal('<p>foo<em>bar</em></p>', Funcd.render(function() {
      return this.p(function() {
        this.text("foo");
        return this.em("bar");
      });
    }));
  },
  "should be able to pass raw strings to any element": function() {
    return assert.equal("<a><i>apple</i></a>", Funcd.render(function() {
      return this.a(this._raw("<i>apple</i>"));
    }));
  },
  "should output raw text": function() {
    return assert.equal("<i>apple</i>", Funcd.render(function() {
      return this.raw("<i>apple</i>");
    }));
  },
  "should output raw": function() {
    var template;
    template = function() {
      return this.a({
        "class": "btn"
      }, function() {
        return this.raw("&raquo;");
      });
    };
    return assert.equal("<a class=\"btn\">&raquo;</a>", Funcd.render(template));
  },
  "should allow nesting": function() {
    return assert.equal("<html><head></head><body></body></html>", Funcd.render(function() {
      return this.html(function() {
        this.head(function() {});
        return this.body(function() {});
      });
    }));
  },
  "should have doctype": function() {
    return assert.equal("<!DOCTYPE html>", Funcd.render(function() {
      return this.doctype(5);
    }));
  },
  "should allow layouts via extends": function() {
    var layout, page;
    layout = function(title) {
      return this.html(function() {
        return this.head(function() {
          this.title(title);
          this.block('styles', 'foo');
          return this.block('scripts');
        });
      });
    };
    page = function() {
      this["extends"](layout, 'example');
      return this.block('scripts', function() {
        return this.script("var one;");
      });
    };
    return assert.equal("<html><head><title>example</title>foo<script>var one;</script></head></html>", Funcd.render(page));
  },
  "should allow layouts via variable": function() {
    var layout, page;
    layout = function() {
      return this.html(function() {
        return this.head(function() {
          this.block('styles', 'foo');
          return this.block('scripts');
        });
      });
    };
    page = function(lay) {
      this["extends"](lay);
      return this.block('scripts', 'bar');
    };
    return assert.equal("<html><head>foobar</head></html>", Funcd.render(page, layout));
  },
  "should render from file": function() {
    return assert.equal("<body></body>", Funcd.renderFile("" + __dirname + "/layout.coffee"));
  },
  "should have option to not cache files": function() {
    fs.writeFileSync("" + __dirname + "/temp.noext", "module.exports = -> @body()");
    assert.equal("<body></body>", Funcd.renderFile("" + __dirname + "/temp.noext"));
    fs.writeFileSync("" + __dirname + "/temp.noext", "module.exports = -> @p()");
    return assert.equal("<p></p>", Funcd.renderFile("" + __dirname + "/temp.noext", {}, {
      nocache: true
    }));
  },
  "should render from file with variables": function() {
    return assert.equal("<p>foo San Diego</p>", Funcd.renderFile("" + __dirname + "/variables.coffee", "foo", "San Diego"));
  },
  "should extend from file": function() {
    var template;
    template = function() {
      this["extends"]("" + __dirname + "/layout.coffee");
      return this.block("content", function() {
        return this.p("foo");
      });
    };
    return assert.equal("<body><p>foo</p></body>", Funcd.render(template));
  },
  "should render from file by compile": function() {
    var template;
    template = Funcd.compileFile("" + __dirname + "/layout.coffee");
    return assert.equal("<body></body>", Funcd.render(template));
  },
  "should allow partials": function() {
    var partial, template;
    partial = function(first, last) {
      return this.p(first + last);
    };
    template = function() {
      return this.div(function() {
        return this.render(partial, "foo", "bar");
      });
    };
    return assert.equal("<div><p>foobar</p></div>", Funcd.render(template));
  },
  "should accept locals": function() {
    var para;
    para = function(name) {
      return this.p(name);
    };
    return assert.equal("<p>foo</p>", Funcd.render(para, "foo"));
  },
  "should work with closures": function() {
    var sum;
    sum = function(a, b) {
      return a + b;
    };
    return assert.equal("<p>42</p>", Funcd.render(function() {
      return this.p(sum(40, 2));
    }));
  },
  "should create default attributes": function() {
    return assert.equal('<script>var foo;</script>', Funcd.render(function() {
      return this.script("var foo;");
    }));
  },
  "should not escape script": function() {
    var html;
    html = Funcd.render(function() {
      return this.script("a < b");
    });
    return assert.ok(html.indexOf("a < b") > 0);
  },
  "should handle short tags": function() {
    return assert.equal("<br/><img src=\"image.png\"/>", Funcd.render(function() {
      this.br();
      return this.img({
        src: "image.png"
      });
    }));
  },
  "longer example": function() {
    var footer, html, layout, page;
    layout = function() {
      this.doctype(5);
      return this.html(function() {
        this.head(function() {
          this.script({
            src: "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
          });
          return this.block("page-scripts");
        });
        return this.body(function() {
          return this.block("body");
        });
      });
    };
    footer = function(text) {
      return this.div({
        id: "footer"
      }, text);
    };
    page = function(name) {
      this["extends"](layout);
      return this.block("body", function() {
        this.h1("Simple Page");
        this.div("Hello " + name);
        return this.render(footer, "page1");
      });
    };
    html = Funcd.render(page, "kitty!");
    return assert.equal('<!DOCTYPE html><html><head><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script></head><body><h1>Simple Page</h1><div>Hello kitty!</div><div id="footer">page1</div></body></html>', html);
  },
  "should be able to mixin instance block functions": function() {
    var mixins, template;
    mixins = {
      reddiv: function(name, block) {
        return this.div({
          "class": 'red'
        }, function() {
          this.text(name);
          return this.render(block);
        });
      },
      bluediv: function(block) {
        return this.div({
          "class": 'blue'
        }, block);
      }
    };
    template = function() {
      this.reddiv("foo", "bar");
      return this.bluediv(function() {
        return this.p("bah");
      });
    };
    return assert.equal("<div class=\"red\">foobar</div><div class=\"blue\"><p>bah</p></div>", Funcd.render({
      mixins: mixins
    }, template));
  },
  "should allow OOP style layouts": function() {
    var Layout, Page, page, _ref, _ref1;
    Layout = (function(_super) {
      __extends(Layout, _super);

      function Layout() {
        _ref = Layout.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Layout.prototype.template = function() {
        return this.html(function() {
          this.head(function() {});
          return this.body(function() {
            return this.content();
          });
        });
      };

      return Layout;

    })(Funcd);
    Page = (function(_super) {
      __extends(Page, _super);

      function Page() {
        _ref1 = Page.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Page.prototype.content = function() {
        return this.p("foo");
      };

      return Page;

    })(Layout);
    page = new Page;
    return assert.equal("<html><head></head><body><p>foo</p></body></html>", page.template());
  },
  "should be able to mixin into Funcd prototype": function() {
    var mixins, template;
    mixins = {
      reddiv: function(attrs, name, block) {
        attrs["class"] = 'red';
        return this.div(attrs, function() {
          this.text(name);
          return this.render(block);
        });
      },
      bluediv: function(block) {
        return this.div({
          "class": 'blue'
        }, block);
      }
    };
    Funcd.mixin(mixins);
    template = function() {
      this.reddiv({
        id: "item"
      }, "foo", "bar");
      return this.bluediv(function() {
        return this.p("bah");
      });
    };
    return assert.equal("<div id=\"item\" class=\"red\">foobar</div><div class=\"blue\"><p>bah</p></div>", Funcd.render(template));
  },
  "should convert coffeescript to javascript (server-side only)": function() {
    var s, template;
    template = function() {
      return this.coffee("a = 0");
    };
    s = Funcd.render(template);
    assert.ok(s.indexOf('<script type="text/javascript">') === 0);
    assert.ok(s.indexOf('var a;') > 0);
    return assert.ok(s.indexOf('a = 0') > 0);
  },
  "should use coffeescript options": function() {
    var s, template;
    template = function() {
      return this.coffee({
        bare: true
      }, "a = 0");
    };
    s = Funcd.render(template);
    assert.ok(s.indexOf('function') < 0);
    assert.ok(s.indexOf('<script type="text/javascript">') === 0);
    assert.ok(s.indexOf('var a;') > 0);
    return assert.ok(s.indexOf('a = 0') > 0);
  }
};
