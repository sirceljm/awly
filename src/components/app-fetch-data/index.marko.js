// Compiled using marko@4.4.28 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_component = ({
    onInput: function (input) {
        var users = [];
        var pageIndex = -1;
        var usersData = input.usersData;
        if (usersData) {
            users = usersData.users;
            pageIndex = usersData.pageIndex;
        }
        this.state = {
            loading: false,
            users: users,
            pageIndex: pageIndex
        };
    },
    onMount: function () {
        this.fetchPromise = Promise.resolve();
        if (this.state.users.length === 0) {
            this.loadMore();
        }
    },
    loadMore: function () {
        this.state.loading = true;
        var state = this.state;
        this.fetchPromise = this.fetchPromise.then(function () {
            return getUsers({ pageIndex: ++state.pageIndex });
        }).then(function (usersData) {
            state.users = state.users.concat(usersData.users);
            state.loading = false;
        }).catch(function (e) {
            state.loading = false;
            console.log('Fetch failed:', e);
        });
    },
    handleLoadMoreClick: function () {
        this.loadMore();
    },
    onUpdate: function () {
        if (this.state.pageIndex > 0) {
            var tableContainer = this.getEl('tableContainer');
            tableContainer.scrollTop = tableContainer.scrollHeight;
        }
    }
}),
    components_helpers = require("marko/src/components/helpers"),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/marko-webpack$1.0.0/src/components/app-fetch-data/index.marko", function() {
      return module.exports;
    }),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_renderComponent = require("marko/src/components/taglib/helpers/renderComponent"),
    module_users_module = require("src/services/users"),
    users_module = module_users_module.default || module_users_module,
    getUsers = module_users_module.getUsers,
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_forEach = marko_helpers.f,
    marko_escapeXml = marko_helpers.x,
    marko_attr = marko_helpers.a,
    marko_loadTemplate = require("marko/src/runtime/helper-loadTemplate"),
    app_button_template = marko_loadTemplate(require.resolve("../app-button")),
    marko_loadTag = marko_helpers.t,
    app_button_tag = marko_loadTag(app_button_template),
    marko_classAttr = marko_helpers.ca;

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<div class=\"app-fetch-data\"" +
    marko_attr("id", __component.id) +
    "><div class=\"table-container\"" +
    marko_attr("id", __component.elId("tableContainer")) +
    ">");

  if (state.users.length) {
    out.w("<table class=\"pure-table\"><thead><tr><td>ID</td><td>Avatar</td><td>Name</td><td>Email</td></tr></thead><tbody>");

    marko_forEach(state.users, function(user) {
      out.w("<tr><td>" +
        marko_escapeXml(user.id) +
        "</td><td><img" +
        marko_attr("src", user.avatar) +
        " width=50 height=50></td><td>" +
        marko_escapeXml(user.firstName) +
        " " +
        marko_escapeXml(user.lastName) +
        "</td><td>" +
        marko_escapeXml(user.email) +
        "</td></tr>");
    });

    out.w("</tbody></table>");
  }

  out.w("</div>");

  marko_renderComponent(app_button_tag, {
      label: state.users.length ? "Load more users" : "Load users"
    }, out, [
    __component,
    "0[]",
    [
      [
        "click",
        "handleLoadMoreClick"
      ]
    ]
  ]);

  out.w("<span" +
    marko_classAttr([
      state.loading ? "loading" : null
    ]) +
    "></span></div>");
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
      "../app-button"
    ]
  };
