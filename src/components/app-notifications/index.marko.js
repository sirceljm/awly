// Compiled using marko@4.4.28 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    components_helpers = require("marko/src/components/helpers"),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/marko-webpack$1.0.0/src/components/app-notifications/index.marko", function() {
      return module.exports;
    }),
    marko_component = require("./component"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_renderComponent = require("marko/src/components/taglib/helpers/renderComponent"),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_forEach = marko_helpers.f,
    marko_loadTemplate = require("marko/src/runtime/helper-loadTemplate"),
    app_notification_template = marko_loadTemplate(require.resolve("../app-notification")),
    marko_loadTag = marko_helpers.t,
    app_notification_tag = marko_loadTag(app_notification_template),
    marko_attr = marko_helpers.a;

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<div class=\"app-notifications\"" +
    marko_attr("id", __component.id) +
    ">");

  marko_forEach(state.notifications, function(notification) {
    marko_renderComponent(app_notification_tag, notification, out, [
      __component,
      notification.id
    ]);
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
      "../app-notification"
    ]
  };
