// Compiled using marko@4.5.6 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    components_helpers = require("marko/src/components/helpers"),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/awly$1.0.0/src/pages/home/template.marko", function() {
      return module.exports;
    }),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    default_template = require("src/layouts/default"),
    hasRenderBodyKey = Symbol.for("hasRenderBody"),
    app_template = require("../../components/app"),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_loadTag = marko_helpers.t,
    app_tag = marko_loadTag(app_template),
    include_tag = marko_loadTag(require("marko/src/taglibs/core/include-tag"));

function render(input, out, __component, component, state) {
  var data = input;

  include_tag({
      _target: default_template,
      styles: {
          renderBody: function renderBody(out) {
            out.w("<link href=\"/static/bundle.css\" media=\"all\" rel=\"stylesheet\">");
          }
        },
      scripts: {
          renderBody: function renderBody(out) {
            out.w("<script src=\"/static/bundle.js\"></script>");
          }
        },
      title: {
          renderBody: function renderBody(out) {
            out.w("Marko UI Components Playground!");
          }
        },
      body: {
          renderBody: function renderBody(out) {
            app_tag({}, out, __component, "7");
          }
        },
      [hasRenderBodyKey]: true
    }, out, __component, "0");
}

marko_template._ = marko_renderer(render, {
    ___implicit: true,
    ___type: marko_componentType
  });

marko_template.Component = marko_defineComponent({}, marko_template._);

marko_template.meta = {
    tags: [
      "src/layouts/default",
      "../../components/app",
      "marko/src/taglibs/core/include-tag"
    ]
  };


var createOut = require('marko/src/runtime/createOut');

function safeRender(renderFunc, finalData, finalOut, shouldEnd) {
    try {
        renderFunc(finalData, finalOut);

        if (shouldEnd) {
            finalOut.end();
        }
    } catch(err) {
        var actualEnd = finalOut.end;
        finalOut.end = function() {};

        setTimeout(function() {
            finalOut.end = actualEnd;
            finalOut.error(err);
        }, 0);
    }
    return finalOut;
}

function renderToString(template, data, callback) {
    var localData = data || {};
    var render = template._;
    var globalData = localData.$global;

    var out = createOut(globalData);

    out.global.template = template;

    if (globalData) {
        localData.$global = undefined;
    }

    out.on('finish', function () {
        callback(null, out.toString(), out);
    }).once('error', function(err){
        console.log(err);
    });

    return safeRender(render, localData, out, true);
}

renderToString(marko_template, {}, function(res, html, out) {
    resolve(html);
});
