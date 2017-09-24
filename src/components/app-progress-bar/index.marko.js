// Compiled using marko@4.4.28 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    components_helpers = require("marko/src/components/helpers"),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/marko-webpack$1.0.0/src/components/app-progress-bar/index.marko", function() {
      return module.exports;
    }),
    marko_component = require("./component"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_forEachProp = require("marko/src/runtime/helper-forEachProperty"),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_loadTag = marko_helpers.t,
    include_tag = marko_loadTag(require("marko/src/components/taglib/include-tag")),
    marko_attr = marko_helpers.a,
    marko_classAttr = marko_helpers.ca;

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<div class=\"app-progress-bar\"" +
    marko_attr("id", __component.id) +
    ">");

  marko_forEachProp(state.steps, function(stepIndex, step) {
    out.w("<div" +
      marko_classAttr([
        "progress-step",
        (stepIndex === state.activeIndex) && "active"
      ]) +
      marko_attr("data-marko", {
        onclick: __component.d("handleStepClick", [
            stepIndex
          ])
      }, false) +
      "><a href=\"#\" class=\"progress-step\">");

    var __componentId1 = __component.elId("0[]");

    out.w("<span" +
      marko_attr("id", __componentId1) +
      ">");

    include_tag({
        _target: step.renderBody || step.label,
        _elId: __componentId1
      }, out);

    out.w("</span><div class=\"completion-icon\"></div></a><div class=\"progress-step-end\"><svg class=\"progress-step-end\" viewBox=\"0 0 125 100\" overflow=\"visible\" enable-background=\"new 0 0 100 100\" preserveAspectRatio=\"none\"><polygon points=\"0,0 25,0 125,50 25,100 0,100\" fill=\"white\"></polygon><polygon class=\"progress-step-end\" points=\"0,0 100,50 0,100\"></polygon></svg></div></div>");
  });

  out.w("</div>");
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
