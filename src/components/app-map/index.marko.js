// Compiled using marko@4.4.28 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_component = ({
    onMount: function () {
        var el = this.el;
        var google = window.google;
        var lat = this.input.lat;
        var lng = this.input.lng;
        if (google && google.maps && google.maps.Map) {
            var Map = google.maps.Map;
            var LatLng = google.maps.LatLng;
            this._map = new Map(el, {
                zoom: 8,
                center: new LatLng(lat, lng)
            });
        } else {
            this.innerHTML = 'Failed to load Google Maps API. Is your internet connection working?';
        }
    }
}),
    components_helpers = require("marko/src/components/helpers"),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/marko-webpack$1.0.0/src/components/app-map/index.marko", function() {
      return module.exports;
    }),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_classAttr = marko_helpers.ca,
    marko_styleAttr = marko_helpers.sa,
    marko_attr = marko_helpers.a;

function render(input, out, __component, component, state) {
  var data = input;

  var height=input.height

  var width=input.width

  out.w("<div" +
    marko_classAttr([
      "app-map",
      input["class"]
    ]) +
    marko_styleAttr({
      height: height,
      width: width
    }) +
    marko_attr("id", __component.id) +
    "></div>");
}

marko_template._ = marko_renderer(render, {
    type: marko_componentType
  }, marko_component);

marko_template.Component = marko_defineComponent(marko_component, marko_template._);

marko_template.meta = {
    deps: [
      {
          type: "require",
          path: "./"
        }
    ]
  };
