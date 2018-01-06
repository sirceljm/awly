// Compiled using marko@4.5.6 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    components_helpers = require("marko/src/components/helpers"),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/awly$1.0.0/src/layouts/default/index.marko", function() {
      return module.exports;
    }),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_loadTag = marko_helpers.t,
    include_tag = marko_loadTag(require("marko/src/taglibs/core/include-tag")),
    component_globals_tag = marko_loadTag(require("marko/src/components/taglib/component-globals-tag")),
    init_components_tag = marko_loadTag(require("marko/src/components/taglib/init-components-tag")),
    await_reorderer_tag = marko_loadTag(require("marko/src/taglibs/async/await-reorderer-tag"));

var marko_template = module.exports = require("marko/src/html").t(__filename);

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<!doctype html><html><head><meta charset=\"UTF-8\"><title>");

  include_tag({
      _target: data.title
    }, out, __component, "4");

  out.w("</title>");

  include_tag({
      _target: data.styles
    }, out, __component, "5");

  out.w("</head><body>");

  component_globals_tag({}, out);

  include_tag({
      _target: data.body
    }, out, __component, "7");

  include_tag({
      _target: data.scripts
    }, out, __component, "8");

  out.w("<script>$_mod.ready();</script>");

  init_components_tag({}, out);

  await_reorderer_tag({}, out, __component, "10");

  out.w("</body></html>");
}

marko_template._ = marko_renderer(render, {
    ___implicit: true,
    ___type: marko_componentType
  });

marko_template.Component = marko_defineComponent({}, marko_template._);

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
