"use strict";

//------------------------------------------------------------
//notify
//------------------------------------------------------------
(function (e) {
  var t = {},
      a = {},
      o = function o(t) {
    return "string" == e.type(t) && (t = {
      message: t
    }), arguments[1] && (t = e.extend(t, "string" == e.type(arguments[1]) ? {
      status: arguments[1]
    } : arguments[1])), new r(t).show();
  },
      n = function n(e, t) {
    if (e) for (var o in a) {
      e === a[o].group && a[o].close(t);
    } else for (var o in a) {
      a[o].close(t);
    }
  },
      r = function r(o) {
    this.options = e.extend({}, r.defaults, o), this.uuid = "ID" + new Date().getTime() + "RAND" + Math.ceil(1e5 * Math.random()), this.element = e(['<div class="uk-notify-message alert-dismissable">', '<a class="close">&times;</a>', "<div>" + this.options.message + "</div>", "</div>"].join("")).data("notifyMessage", this), this.options.status && (this.element.addClass("alert alert-" + this.options.status), this.currentstatus = this.options.status), this.group = this.options.group, a[this.uuid] = this, t[this.options.pos] || (t[this.options.pos] = e('<div class="uk-notify uk-notify-' + this.options.pos + '"></div>').appendTo("body").on("click", ".uk-notify-message", function () {
      e(this).data("notifyMessage").close();
    }));
  };

  return e.extend(r.prototype, {
    uuid: !1,
    element: !1,
    timout: !1,
    currentstatus: "",
    group: !1,
    show: function show() {
      if (!this.element.is(":visible")) {
        var e = this;
        t[this.options.pos].show().prepend(this.element);
        var a = parseInt(this.element.css("margin-bottom"), 10);
        return this.element.css({
          opacity: 0,
          "margin-top": -1 * this.element.outerHeight(),
          "margin-bottom": 0
        }).animate({
          opacity: 1,
          "margin-top": 0,
          "margin-bottom": a
        }, function () {
          if (e.options.timeout) {
            var t = function t() {
              e.close();
            };

            e.timeout = setTimeout(t, e.options.timeout), e.element.hover(function () {
              clearTimeout(e.timeout);
            }, function () {
              e.timeout = setTimeout(t, e.options.timeout);
            });
          }
        }), this;
      }
    },
    close: function close(e) {
      var o = this,
          n = function n() {
        o.element.remove(), t[o.options.pos].children().length || t[o.options.pos].hide(), delete a[o.uuid];
      };

      this.timeout && clearTimeout(this.timeout), e ? n() : this.element.animate({
        opacity: 0,
        "margin-top": -1 * this.element.outerHeight(),
        "margin-bottom": 0
      }, function () {
        n();
      });
    },
    content: function content(e) {
      var t = this.element.find(">div");
      return e ? (t.html(e), this) : t.html();
    },
    status: function status(e) {
      return e ? (this.element.removeClass("alert alert-" + this.currentstatus).addClass("alert alert-" + e), this.currentstatus = e, this) : this.currentstatus;
    }
  }), r.defaults = {
    message: "",
    status: "normal",
    timeout: 2000,
    group: null,
    pos: "top-center"
  }, e.notify = o, e.notify.message = r, e.notify.closeAll = n, o;
})(jQuery, window, document);