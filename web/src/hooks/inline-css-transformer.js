"use strict";

const fs = require("fs");
const path = require("path");

module.exports = function transform(el, context) {
    let inlineCSSExpression = el.getAttributeValue("inline-css");
    /*
    inlineCSSExpression is an AST node that represents the attribute value parsed as a path to CSS file.
     */

    if (!inlineCSSExpression) {
        return;
    }

    el.removeAttribute("inline-css"); // This attribute is handled at compile time. We can just remove it now

    if (inlineCSSExpression.type === "Literal") {
        /*
        The path is a literal value that we can process at compile-time. Our goal is to set the style content
        to the contents of the file under the defined path.

        The AST for `"./marko-logo.png"` looks like the following:
        {
            type: 'Literal',
            value: './marko-logo.png'
        }
        */
        let cssPath = "";

        if(path.isAbsolute(inlineCSSExpression.value)){
            const appDir = path.resolve(__dirname, "../..");
            cssPath = path.normalize(appDir + inlineCSSExpression.value);
        }else{
            const templateDir = context.dirname;
            cssPath = path.resolve(templateDir, inlineCSSExpression.value);
        }

        let data = fs.readFileSync(cssPath);
        var style = context.builder.htmlElement("style", [], [context.builder.text(context.builder.literal(data.toString()))]);

        // el.setBody(builder.literal(data));
        el.replaceWith(style);

        // End result:
        // <img width=150 height=125 src="data:image/png;base64,...">
    } else {
        /*
        Otherwise, the attribute value is a dynamic JavaScript expression that can only be handled
        at runtime.

        Dont do anything for now in this case
        */
    }
};
