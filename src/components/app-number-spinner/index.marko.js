// Compiled using marko@4.4.28 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_component = ({
    onInput: function (input) {
        var value = input.value || 0;
        this.state = { value: value };
    },
    handleIncrementClick: function (delta) {
        console.log();
        this.state.value += delta;
    },
    handleInputKeyUp: function (event, el) {
        var newValue = el.value;
        if (/^-?[0-9]+$/.test(newValue)) {
            this.state.value = parseInt(newValue, 10);
        }
    }
}),
    components_helpers = require("marko/src/components/helpers"),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/marko-webpack$1.0.0/src/components/app-number-spinner/index.marko", function() {
      return module.exports;
    }),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_attr = marko_helpers.a,
    marko_classAttr = marko_helpers.ca;

function getClassNameForValue(value) {
    if (value < 0) {
        return 'negative';
    } else if (value > 0) {
        return 'positive';
    }
};

function render(input, out, __component, component, state) {
  var data = input;

  var value=state.value;

  out.w("<div" +
    marko_classAttr([
      "number-spinner",
      getClassNameForValue(value)
    ]) +
    marko_attr("id", __component.id) +
    "><button type=\"button\"" +
    marko_attr("data-marko", {
      onclick: __component.d("handleIncrementClick", [
          -1
        ])
    }, false) +
    ">-</button><input type=\"text\"" +
    marko_attr("value", state.value) +
    " size=\"4\"" +
    marko_attr("data-marko", {
      onkeyup: __component.d("handleInputKeyUp")
    }, false) +
    "><button type=\"button\"" +
    marko_attr("data-marko", {
      onclick: __component.d("handleIncrementClick", [
          1
        ])
    }, false) +
    ">+</button></div>");
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
    ]
  };
