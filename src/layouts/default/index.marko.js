// Compiled using marko@4.4.28 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_loadTag = marko_helpers.t,
    include_tag = marko_loadTag(require("marko/src/taglibs/core/include-tag")),
    component_globals_tag = marko_loadTag(require("marko/src/components/taglib/component-globals-tag")),
    init_components_tag = marko_loadTag(require("marko/src/components/taglib/init-components-tag")),
    await_reorderer_tag = marko_loadTag(require("marko/src/taglibs/async/await-reorderer-tag"));

function render(input, out) {
  var data = input;

  out.w("<!doctype html><html lang=\"en\"><head><meta charset=\"UTF-8\"><title>");

  include_tag({
      _target: data.title
    }, out);

  out.w("</title>");

  include_tag({
      _target: data.styles
    }, out);

  out.w("</head><body>");

  component_globals_tag({}, out);

  out.w("<div class=\"container\"><h1>");

  include_tag({
      _target: data.title
    }, out);

  out.w("</h1><main id=\"main\">");

  include_tag({
      _target: data.body
    }, out);

  out.w("</main></div>");

  include_tag({
      _target: data.scripts
    }, out);

  out.w("<script>$_mod.ready();</script>");

  init_components_tag({}, out);

  await_reorderer_tag({}, out);

  out.w("</body></html>");
}

marko_template._ = render;

marko_template.meta = {
    deps: [
      "./style.css"
    ],
    tags: [
      "marko/src/taglibs/core/include-tag",
      "marko/src/components/taglib/component-globals-tag",
      "marko/src/components/taglib/init-components-tag",
      "marko/src/taglibs/async/await-reorderer-tag"
    ]
  };
