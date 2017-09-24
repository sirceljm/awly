// Compiled using marko@4.4.28 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    components_helpers = require("marko/src/components/helpers"),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/marko-webpack$1.0.0/src/components/app/index.marko", function() {
      return module.exports;
    }),
    marko_component = require("./component"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_renderComponent = require("marko/src/components/taglib/helpers/renderComponent"),
    marko_loadTemplate = require("marko/src/runtime/helper-loadTemplate"),
    app_button_template = marko_loadTemplate(require.resolve("../app-button")),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_loadTag = marko_helpers.t,
    app_button_tag = marko_loadTag(app_button_template),
    hasRenderBodyKey = Symbol.for("hasRenderBody"),
    app_checkbox_template = marko_loadTemplate(require.resolve("../app-checkbox")),
    app_checkbox_tag = marko_loadTag(app_checkbox_template),
    marko_forEachProp = require("marko/src/runtime/helper-forEachProperty"),
    marko_escapeXml = marko_helpers.x,
    app_notifications_template = marko_loadTemplate(require.resolve("../app-notifications")),
    app_notifications_tag = marko_loadTag(app_notifications_template),
    w_preserve_tag = marko_loadTag(require("marko/src/components/taglib/preserve-tag")),
    app_overlay_template = marko_loadTemplate(require.resolve("../app-overlay")),
    app_overlay_tag = marko_loadTag(app_overlay_template),
    app_tabs_template = marko_loadTemplate(require.resolve("../app-tabs")),
    app_tabs_tag = marko_loadTag(app_tabs_template),
    marko_loadNestedTag = require("marko/src/runtime/helper-loadNestedTag"),
    app_tabs_tab_nested_tag = marko_loadNestedTag("tabs", 1),
    marko_mergeNestedTagsHelper = require("marko/src/runtime/helper-mergeNestedTags"),
    app_progress_bar_template = marko_loadTemplate(require.resolve("../app-progress-bar")),
    app_progress_bar_tag = marko_loadTag(app_progress_bar_template),
    app_number_spinner_template = marko_loadTemplate(require.resolve("../app-number-spinner")),
    app_number_spinner_tag = marko_loadTag(app_number_spinner_template),
    app_state_select_template = marko_loadTemplate(require.resolve("../app-state-select")),
    app_state_select_tag = marko_loadTag(app_state_select_template),
    marko_attr = marko_helpers.a,
    app_fetch_data_template = marko_loadTemplate(require.resolve("../app-fetch-data")),
    app_fetch_data_tag = marko_loadTag(app_fetch_data_template),
    app_map_template = marko_loadTemplate(require.resolve("../app-map")),
    app_map_tag = marko_loadTag(app_map_template),
    app_sections_template = marko_loadTemplate(require.resolve("../app-sections")),
    app_sections_tag = marko_loadTag(app_sections_template);

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<div" +
    marko_attr("id", __component.id) +
    ">");

  app_sections_tag({
      sections: [
        {
            title: "Buttons",
            renderBody: function renderBody(out) {
              out.w("<table><tr><td><b>Primary: </b></td><td>");

              app_button_tag({
                  label: "small",
                  size: "small",
                  variant: "primary"
                }, out);

              app_button_tag({
                  label: "normal",
                  size: "normal",
                  variant: "primary"
                }, out);

              app_button_tag({
                  label: "large",
                  size: "large",
                  variant: "primary"
                }, out);

              out.w("</td></tr><tr><td><b>Secondary:&nbsp;</b></td><td>");

              app_button_tag({
                  label: "small",
                  size: "small",
                  variant: "secondary"
                }, out);

              app_button_tag({
                  label: "normal",
                  size: "normal",
                  variant: "secondary"
                }, out);

              app_button_tag({
                  label: "large",
                  size: "large",
                  variant: "secondary"
                }, out);

              out.w("</td></tr></table><div>");

              marko_renderComponent(app_button_tag, {
                  label: "Change Button Size - " + state.buttonSize,
                  size: state.buttonSize,
                  variant: "primary"
                }, out, [
                __component,
                "0[]",
                [
                  [
                    "click",
                    "handleChangeButtonSizeClick"
                  ]
                ]
              ]);

              marko_renderComponent(app_button_tag, {
                  label: "Change Button Variant - " + state.buttonVariant,
                  variant: state.buttonVariant
                }, out, [
                __component,
                "1[]",
                [
                  [
                    "click",
                    "handleChangeButtonVariantClick"
                  ]
                ]
              ]);

              out.w("</div>");
            }
          },
        {
            title: "Checkboxes",
            renderBody: function renderBody(out) {
              out.w("<p>");

              marko_renderComponent(app_checkbox_tag, {
                  label: "Foo",
                  data: {
                      name: "foo"
                    },
                  checked: state.checked.foo
                }, out, [
                __component,
                "2[]",
                [
                  [
                    "toggle",
                    "handleCheckboxToggle"
                  ]
                ]
              ]);

              marko_renderComponent(app_checkbox_tag, {
                  label: "Bar",
                  data: {
                      name: "bar"
                    },
                  checked: state.checked.bar
                }, out, [
                __component,
                "3[]",
                [
                  [
                    "toggle",
                    "handleCheckboxToggle"
                  ]
                ]
              ]);

              marko_renderComponent(app_checkbox_tag, {
                  label: "Baz",
                  data: {
                      name: "baz"
                    },
                  checked: state.checked.baz
                }, out, [
                __component,
                "4[]",
                [
                  [
                    "toggle",
                    "handleCheckboxToggle"
                  ]
                ]
              ]);

              out.w("</p><p>");

              marko_renderComponent(app_checkbox_tag, {
                  label: "Bar",
                  data: {
                      name: "bar"
                    },
                  checked: state.checked.bar
                }, out, [
                __component,
                "5[]",
                [
                  [
                    "toggle",
                    "handleCheckboxToggle"
                  ]
                ]
              ]);

              out.w("</p><p><b>Checked</b>: <ul>");

              marko_forEachProp(state.checked, function(key, value) {
                if (value) {
                  out.w("<li>" +
                    marko_escapeXml(key) +
                    "</li>");
                }
              });

              out.w("</ul></p><p>");

              marko_renderComponent(app_checkbox_tag, {
                  label: "Foo",
                  checked: true,
                  data: {
                      name: "foo"
                    }
                }, out, [
                __component,
                "toggleCheckbox"
              ]);

              marko_renderComponent(app_button_tag, {
                  label: "Toggle Checkbox",
                  size: "small",
                  variant: "primary"
                }, out, [
                __component,
                "6[]",
                [
                  [
                    "click",
                    "handleToggleCheckboxButtonClick"
                  ]
                ]
              ]);

              out.w("</p>");
            }
          },
        {
            title: "Overlays",
            renderBody: function renderBody(out) {
              marko_renderComponent(app_button_tag, {
                  label: "Show Overlay",
                  variant: "primary"
                }, out, [
                __component,
                "7[]",
                [
                  [
                    "click",
                    "handleShowOverlayButtonClick"
                  ]
                ]
              ]);

              marko_renderComponent(app_button_tag, {
                  label: "Show Notification",
                  variant: "primary"
                }, out, [
                __component,
                "8[]",
                [
                  [
                    "click",
                    "handleShowNotificationButtonClick"
                  ]
                ]
              ]);

              var __componentId9 = __component.elId("notifications");

              w_preserve_tag({
                  id: __componentId9,
                  renderBody: function renderBody(out) {
                    marko_renderComponent(app_notifications_tag, {}, out, [
                      __component,
                      "#" + __componentId9
                    ]);
                  }
                }, out);

              marko_renderComponent(app_overlay_tag, {
                  visible: state.overlayVisible,
                  renderBody: function renderBody(out) {
                    out.w("<h2>Overlay Demo</h2> This is an overlay!");
                  }
                }, out, [
                __component,
                "overlay",
                [
                  [
                    "ok",
                    "handleOverlayOk"
                  ],
                  [
                    "cancel",
                    "handleOverlayCancel"
                  ],
                  [
                    "hide",
                    "handleOverlayHide"
                  ],
                  [
                    "show",
                    "handleOverlayShow"
                  ]
                ]
              ]);
            }
          },
        {
            title: "Tabs",
            renderBody: function renderBody(out) {
              out.w("<h3>Static tabs</h3>");

              app_tabs_tag({
                  tabs: [
                    {
                        label: "Home",
                        renderBody: function renderBody(out) {
                          out.w("Content for Home");
                        }
                      },
                    {
                        label: "Profile",
                        renderBody: function renderBody(out) {
                          out.w("Content for Profile");
                        }
                      },
                    {
                        label: "Messages",
                        renderBody: function renderBody(out) {
                          out.w("Content for Messages");
                        }
                      }
                  ],
                  [hasRenderBodyKey]: true
                }, out);

              out.w("<h3>Dynamic tabs</h3>");

              app_tabs_tag(marko_mergeNestedTagsHelper({
                  renderBody: function renderBody(out, app_tabs0) {
                    marko_forEachProp(state.dynamicTabs, function(tabIndex, tab) {
                      app_tabs_tab_nested_tag({
                          label: "Tab " + tabIndex,
                          renderBody: function renderBody(out) {
                            out.w("Content for tab " +
                              marko_escapeXml(tabIndex) +
                              ": " +
                              marko_escapeXml(tab.timestamp));
                          }
                        }, app_tabs0);
                    });
                  },
                  [hasRenderBodyKey]: true
                }), out);

              marko_renderComponent(app_button_tag, {
                  label: "Add Tab"
                }, out, [
                __component,
                "10[]",
                [
                  [
                    "click",
                    "handleAddTabButtonClick"
                  ]
                ]
              ]);
            }
          },
        {
            title: "Miscellaneous",
            renderBody: function renderBody(out) {
              app_progress_bar_tag({
                  steps: [
                    {
                        name: "contact-info",
                        renderBody: function renderBody(out) {
                          out.w("Contact Info");
                        }
                      },
                    {
                        name: "interests",
                        renderBody: function renderBody(out) {
                          out.w("Interests");
                        }
                      },
                    {
                        name: "family",
                        renderBody: function renderBody(out) {
                          out.w("Family");
                        }
                      }
                  ],
                  [hasRenderBodyKey]: true
                }, out);

              out.w("<br>");

              app_number_spinner_tag({}, out);

              out.w("<br>");

              app_state_select_tag({}, out);
            }
          },
        {
            title: "Client-side Rendering",
            renderBody: function renderBody(out) {
              marko_renderComponent(app_button_tag, {
                  label: "Render a button"
                }, out, [
                __component,
                "11[]",
                [
                  [
                    "click",
                    "handleRenderButtonClick"
                  ]
                ]
              ]);

              marko_renderComponent(app_button_tag, {
                  label: "Render a checkbox"
                }, out, [
                __component,
                "12[]",
                [
                  [
                    "click",
                    "handleRenderCheckboxButtonClick"
                  ]
                ]
              ]);

              marko_renderComponent(app_button_tag, {
                  label: "Render a progress bar"
                }, out, [
                __component,
                "13[]",
                [
                  [
                    "click",
                    "handleRenderProgressBarButtonClick"
                  ]
                ]
              ]);

              var __componentId14 = __component.elId("renderTarget");

              out.w("<div class=\"render-target\"" +
                marko_attr("id", __componentId14) +
                ">");

              w_preserve_tag({
                  bodyOnly: true,
                  id: __componentId14
                }, out);

              out.w("</div>");
            }
          },
        {
            title: "Fetch data",
            renderBody: function renderBody(out) {
              var __componentId16 = __component.elId("15[]");

              w_preserve_tag({
                  id: __componentId16,
                  renderBody: function renderBody(out) {
                    marko_renderComponent(app_fetch_data_tag, {}, out, [
                      __component,
                      "#" + __componentId16
                    ]);
                  }
                }, out);
            }
          },
        {
            title: "Maps",
            renderBody: function renderBody(out) {
              var __componentId18 = __component.elId("17[]");

              w_preserve_tag({
                  id: __componentId18,
                  renderBody: function renderBody(out) {
                    marko_renderComponent(app_map_tag, {
                        width: "400px",
                        height: "400px",
                        lat: "37.774929",
                        lng: "-122.419416"
                      }, out, [
                      __component,
                      "#" + __componentId18
                    ]);
                  }
                }, out);
            }
          },
        {
            title: "Markdown",
            renderBody: function renderBody(out) {
              out.w("<hr>\n<blockquote>\n<p>This section demonstrates Markdown in Marko</p>\n</blockquote>\n<h2 id=\"marko-features\">Marko Features</h2>\n<ul>\n<li>High performance</li>\n<li>Small</li>\n<li>Intuitive</li>\n</ul>\n<h1 id=\"h1\">H1</h1>\n<h2 id=\"h2\">H2</h2>\n<h3 id=\"h3\">H3</h3>\n<h4 id=\"h4\">H4</h4>\n<h5 id=\"h5\">H5</h5>\n<h6 id=\"h6\">H6</h6>\n<p><a href=\"http://markojs.com/\">markojs.com</a></p>\n<p><em>emphasis</em>\n<strong>strong</strong></p>\n<hr>\n");
            }
          }
      ],
      [hasRenderBodyKey]: true
    }, out);

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
      "../app-button",
      "../app-checkbox",
      "../app-notifications",
      "marko/src/components/taglib/preserve-tag",
      "../app-overlay",
      "../app-tabs",
      "../app-progress-bar",
      "../app-number-spinner",
      "../app-state-select",
      "../app-fetch-data",
      "../app-map",
      "../app-sections"
    ]
  };
