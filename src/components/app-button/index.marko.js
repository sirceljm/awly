// Compiled using marko@4.4.28 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_component = {
        onInput: function(input) {
          return {
              size: input.size || "normal",
              variant: input.variant || "primary",
              body: input.label || input.renderBody,
              className: input["class"]
            };
        },
        handleClick: function(event) {
          this.emit("click", {
              event: event
            });
        }
      },
    components_helpers = require("marko/src/components/helpers"),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/marko-webpack$1.0.0/src/components/app-button/index.marko", function() {
      return module.exports;
    }),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_loadTag = marko_helpers.t,
    include_tag = marko_loadTag(require("marko/src/components/taglib/include-tag")),
    marko_attr = marko_helpers.a,
    marko_classAttr = marko_helpers.ca,
    marko_attrs = marko_helpers.as;

function render(input, out, __component, component, state) {
  var data = input;

  var variantClassName = (input.variant !== 'primary' && 'app-button-' + input.variant);

  var sizeClassName = (input.size !== 'normal' && 'app-button-' + input.size);

  out.w("<button" +
    marko_classAttr([
      "app-button",
      variantClassName,
      sizeClassName,
      input.className
    ]) +
    marko_attr("id", __component.id) +
    marko_attr("data-marko", {
      onclick: __component.d("handleClick")
    }, false) +
    marko_attrs(input["*"]) +
    ">");

  var __componentId1 = __component.elId("0[]");

  out.w("<span" +
    marko_attr("id", __componentId1) +
    ">");

  include_tag({
      _target: input.body,
      _elId: __componentId1
    }, out);

  out.w("</span></button>");
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
      "marko/src/components/taglib/include-tag"
    ]
  };
