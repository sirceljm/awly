// Compiled using marko@4.4.28 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_loadTemplate = require("marko/src/runtime/helper-loadTemplate"),
    default_template = marko_loadTemplate(require.resolve("src/layouts/default")),
    hasRenderBodyKey = Symbol.for("hasRenderBody"),
    dynamodb_template = marko_loadTemplate(require.resolve("../../components/dynamodb")),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_loadTag = marko_helpers.t,
    dynamodb_tag = marko_loadTag(dynamodb_template),
    app_template = marko_loadTemplate(require.resolve("../../components/app")),
    app_tag = marko_loadTag(app_template),
    include_tag = marko_loadTag(require("marko/src/taglibs/core/include-tag"));

function render(input, out) {
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
            out.w("Marko UI Components Playground CCCCCCCCCCC!");
          }
        },
      body: {
          renderBody: function renderBody(out) {
            dynamodb_tag({}, out);

            app_tag({}, out);
          }
        },
      [hasRenderBodyKey]: true
    }, out);
}

marko_template._ = render;

marko_template.meta = {
    tags: [
      "src/layouts/default",
      "../../components/dynamodb",
      "../../components/app",
      "marko/src/taglibs/core/include-tag"
    ]
  };
