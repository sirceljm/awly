// Compiled using marko@4.4.28 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    components_helpers = require("marko/src/components/helpers"),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/marko-webpack$1.0.0/src/components/app-overlay/index.marko", function() {
      return module.exports;
    }),
    marko_component = require("./component"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_renderComponent = require("marko/src/components/taglib/helpers/renderComponent"),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_attr = marko_helpers.a,
    marko_loadTag = marko_helpers.t,
    include_tag = marko_loadTag(require("marko/src/components/taglib/include-tag")),
    marko_loadTemplate = require("marko/src/runtime/helper-loadTemplate"),
    app_button_template = marko_loadTemplate(require.resolve("../app-button")),
    app_button_tag = marko_loadTag(app_button_template),
    marko_styleAttr = marko_helpers.sa,
    marko_classAttr = marko_helpers.ca;

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<div" +
    marko_classAttr([
      "app-overlay",
      state.visible && "visible"
    ]) +
    marko_attr("id", __component.id) +
    "><div class=\"app-overlay-mask\"" +
    marko_attr("data-marko", {
      onclick: __component.d("handleMaskClick")
    }, false) +
    "></div><div class=\"app-overlay-container\"" +
    marko_styleAttr({
      width: state.width
    }) +
    ">");

  var __componentId0 = __component.elId("body");

  out.w("<div class=\"app-overlay-body\"" +
    marko_attr("id", __componentId0) +
    ">");

  include_tag({
      _target: state.body,
      _elId: __componentId0
    }, out);

  out.w("</div><div class=\"app-overlay-footer\">");

  marko_renderComponent(app_button_tag, {
      label: "Cancel",
      size: "large",
      variant: "secondary"
    }, out, [
    __component,
    "1[]",
    [
      [
        "click",
        "handleCancelButtonClick"
      ]
    ]
  ]);

  out.w(" &nbsp; ");

  marko_renderComponent(app_button_tag, {
      label: "Done",
      size: "large",
      variant: "primary"
    }, out, [
    __component,
    "2[]",
    [
      [
        "click",
        "handleDoneButtonClick"
      ]
    ]
  ]);

  out.w("</div></div></div>");
}

marko_template._ = marko_renderer(render, {
    type: marko_componentType
  }, marko_component);

marko_template.Component = marko_defineComponent(marko_component, marko_template._);

marko_template.meta = {
    deps: [
      "./style.less",
      {
          type: "require",
          path: "./"
        }
    ],
    tags: [
      "marko/src/components/taglib/include-tag",
      "../app-button"
    ]
  };
