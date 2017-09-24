// Compiled using marko@4.4.28 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_forEach = marko_helpers.f,
    marko_escapeXml = marko_helpers.x,
    marko_escapeXmlAttr = marko_helpers.xa,
    marko_attr = marko_helpers.a,
    marko_loadTag = marko_helpers.t,
    include_tag = marko_loadTag(require("marko/src/taglibs/core/include-tag"));

function getAnchorName(section) {
    if (!section.anchorName) {
        section.anchorName = section.title.replace(/[^a-zA-Z]+/g, '-');
    }

    return section.anchorName;
};

function render(input, out) {
  var data = input;

  out.w("<div class=\"app-sections\"><div class=\"tableOfContents\"><ul>");

  marko_forEach(data.sections, function(section) {
    out.w("<li><a href=\"#" +
      marko_escapeXmlAttr(getAnchorName(section)) +
      "\">" +
      marko_escapeXml(section.title) +
      "</a></li>");
  });

  out.w("</ul></div><div class=\"sections-ctr\">");

  marko_forEach(data.sections, function(section) {
    out.w("<div class=\"section\"><h2" +
      marko_attr("id", getAnchorName(section)) +
      ">" +
      marko_escapeXml(section.title) +
      "</h2><div class=\"section-body\">");

    include_tag({
        _target: section
      }, out);

    out.w("</div></div>");
  });

  out.w("</div></div>");
}

marko_template._ = render;

marko_template.meta = {
    deps: [
      "./style.less"
    ],
    tags: [
      "marko/src/taglibs/core/include-tag"
    ]
  };
