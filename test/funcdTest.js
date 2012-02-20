(function() {
  var Funcd, assert,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Funcd = require('..');

  assert = require('chai').assert;

  module.exports = {
    "should have short tags": function() {
      return assert.equal("<br/>", Funcd.render(function(t) {
        return t.br();
      }));
    },
    "should have full tags": function() {
      return assert.equal("<div>foo</div>", Funcd.render(function(t) {
        return t.div("foo");
      }));
    },
    "text should be escaped by default": function() {
      return assert.equal("<a>1 &lt; 2</a>", Funcd.render(function(t) {
        return t.a("1 < 2");
      }));
    },
    "should allow text nodes": function() {
      return assert.equal('<p>foo<em>bar</em></p>', Funcd.render(function(t) {
        return t.p(function() {
          t.text("foo");
          return t.em("bar");
        });
      }));
    },
    "raw text should require some effort": function() {
      return assert.equal("<a><i>apple</i></a>", Funcd.render(function(t) {
        return t.a(t.raw("<i>apple</i>"));
      }));
    },
    "should allow nesting": function() {
      return assert.equal("<html><head></head><body></body></html>", Funcd.render(function(t) {
        return t.html(function() {
          t.head(function() {});
          return t.body(function() {});
        });
      }));
    },
    "should have doctype": function() {
      return assert.equal("<!DOCTYPE html>", Funcd.render(function(t) {
        return t.doctype(5);
      }));
    },
    "should allow layouts via extends": function() {
      var layout, page;
      layout = function(t) {
        return t.html(function() {
          return t.head(function() {
            t.block('styles', 'foo');
            return t.block('scripts');
          });
        });
      };
      page = function(t) {
        t["extends"](layout);
        return t.block('scripts', function() {
          return t.script("var one;");
        });
      };
      return assert.equal("<html><head>foo<script type=\"text/javascript\">var one;</script></head></html>", Funcd.render(page));
    },
    "should allow layouts via variable": function() {
      var layout, page;
      layout = function(t) {
        return t.html(function() {
          return t.head(function() {
            t.block('styles', 'foo');
            return t.block('scripts');
          });
        });
      };
      page = function(t, lay) {
        t["extends"](lay);
        return t.block('scripts', 'bar');
      };
      return assert.equal("<html><head>foobar</head></html>", Funcd.render(page, layout));
    },
    "should render from file": function() {
      return assert.equal("<body></body>", Funcd.render("" + __dirname + "/layout"));
    },
    "should render from file with variables": function() {
      return assert.equal("<p>foo San Diego</p>", Funcd.render("" + __dirname + "/variables", "foo", "San Diego"));
    },
    "should extend from file": function() {
      var template;
      template = function(t) {
        t["extends"]("" + __dirname + "/layout");
        return t.block("content", function() {
          return t.p("foo");
        });
      };
      return assert.equal("<body><p>foo</p></body>", Funcd.render(template));
    },
    "should render from file by compile": function() {
      var template;
      template = Funcd.compile("" + __dirname + "/layout");
      return assert.equal("<body></body>", template());
    },
    "should allow partials": function() {
      var partial, template;
      partial = function(t, first, last) {
        return t.p(first + last);
      };
      template = function(t) {
        return t.div(function() {
          return t.render(partial, "foo", "bar");
        });
      };
      return assert.equal("<div><p>foobar</p></div>", Funcd.render(template));
    },
    "should accept locals": function() {
      var para;
      para = function(t, name) {
        return t.p(name);
      };
      return assert.equal("<p>foo</p>", Funcd.render(para, "foo"));
    },
    "should work with functions": function() {
      var sum;
      sum = function(a, b) {
        return a + b;
      };
      return assert.equal("<p>42</p>", Funcd.render(function(t) {
        return t.p(sum(40, 2));
      }));
    },
    "should play nice with objects": function() {
      var Foo, foo, template;
      Foo = (function() {

        function Foo() {
          this.bleh = __bind(this.bleh, this);
        }

        Foo.prototype.foo = 'bar';

        Foo.prototype.bah = function(t) {
          return this.foo + 'baz';
        };

        Foo.prototype.bleh = function(t) {
          return t.p(this.foo);
        };

        return Foo;

      })();
      foo = new Foo;
      template = function(t) {
        t.p(foo.bah(t));
        return foo.bleh(t);
      };
      return assert.equal("<p>barbaz</p><p>bar</p>", Funcd.render(template));
    },
    "should create default attributes": function() {
      return assert.equal('<script type="text/javascript">var foo;</script>', Funcd.render(function(t) {
        return t.script("var foo;");
      }));
    },
    "should not escape script": function() {
      var html;
      html = Funcd.render(function(t) {
        return t.script("a < b");
      });
      return assert.ok(html.indexOf("a < b") > 0);
    },
    "should handle short tags": function() {
      return assert.equal("<br/><img src=\"image.png\"/>", Funcd.render(function(t) {
        t.br();
        return t.img({
          src: "image.png"
        });
      }));
    },
    "longer example": function() {
      var footer, html, layout, page;
      layout = function(t) {
        t.doctype(5);
        return t.html(function() {
          t.head(function() {
            t.script({
              src: "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
            });
            return t.block("page-scripts");
          });
          return t.body(function() {
            return t.block("body");
          });
        });
      };
      footer = function(t, text) {
        return t.div({
          id: "footer"
        }, text);
      };
      page = function(t, name) {
        t["extends"](layout);
        return t.block("body", function() {
          t.h1("Simple Page");
          t.div("Hello " + name);
          return t.render(footer, "page1");
        });
      };
      return html = Funcd.render({
        pretty: true
      }, page, "kitty!");
    },
    "should be able to mixin instance block functions": function() {
      var mixins, template;
      mixins = {
        reddiv: function(t, name, block) {
          return t.div({
            "class": 'red'
          }, function() {
            t.text(name);
            return t.render(block);
          });
        },
        bluediv: function(t, block) {
          return t.div({
            "class": 'blue'
          }, block);
        }
      };
      template = function(t) {
        t.reddiv("foo", "bar");
        return t.bluediv(function() {
          return t.p("bah");
        });
      };
      return assert.equal("<div class=\"red\">foobar</div><div class=\"blue\"><p>bah</p></div>", Funcd.render({
        mixins: mixins
      }, template));
    },
    "should allow OOP style layouts": function() {
      var Layout, Page, page;
      Layout = (function(_super) {

        __extends(Layout, _super);

        function Layout() {
          Layout.__super__.constructor.apply(this, arguments);
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
          Page.__super__.constructor.apply(this, arguments);
        }

        Page.prototype.content = function() {
          return this.p("foo");
        };

        return Page;

      })(Layout);
      page = new Page;
      return assert.equal("<html><head></head><body><p>foo</p></body></html>", page.template());
    },
    "should be able to mixin prototype block functions": function() {
      var mixins, template;
      mixins = {
        reddiv: function(t, attrs, name, block) {
          attrs["class"] = 'red';
          return t.div(attrs, function() {
            t.text(name);
            return t.render(block);
          });
        },
        bluediv: function(t, block) {
          return t.div({
            "class": 'blue'
          }, block);
        }
      };
      Funcd.mixin(mixins);
      template = function(t) {
        t.reddiv({
          id: "item"
        }, "foo", "bar");
        return t.bluediv(function() {
          return t.p("bah");
        });
      };
      return assert.equal("<div id=\"item\" class=\"red\">foobar</div><div class=\"blue\"><p>bah</p></div>", Funcd.render(template));
    },
    "should convert coffeescript to javascript (server-side only)": function() {
      var s, template;
      template = function(t) {
        return t.coffeescript("a = 0");
      };
      s = Funcd.render(template);
      assert.ok(s.indexOf('<script type="text/javascript">') === 0);
      assert.ok(s.indexOf('var a;') > 0);
      return assert.ok(s.indexOf('a = 0') > 0);
    },
    "should use coffeescript options": function() {
      var s, template;
      template = function(t) {
        return t.coffeescript({
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

}).call(this);
