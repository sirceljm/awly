'use strict';

const mime = require('mime');
const fs = require('fs');
const path = require('path');

module.exports = function transform(el, context) {
    let inlineJSExpression = el.getAttributeValue('inline-js');
    /*
    inlineCSSExpression is an AST node that represents the attribute value parsed as a path to CSS file.
     */

    if (!inlineJSExpression) {
        return;
    }

    let builder = context.builder;

    el.removeAttribute('inline-js'); // This attribute is handled at compile time. We can just remove it now

    if (inlineJSExpression.type === 'Literal') {
        /*
        The path is a literal value that we can process at compile-time. Our goal is to set the style content
        to the contents of the file under the defined path.

        The AST for `"./marko-logo.png"` looks like the following:
        {
            type: 'Literal',
            value: './marko-logo.png'
        }
        */
        let jsPath = "";

        if(path.isAbsolute(inlineJSExpression.value)){
            const appDir = path.resolve(__dirname, '../..');
            jsPath = path.normalize(appDir + inlineJSExpression.value);
        }else{
            const templateDir = context.dirname;
            jsPath = path.resolve(templateDir, inlineJSExpression.value);
        }

        let data = fs.readFileSync(jsPath);
        var script = context.builder.htmlElement('script', [], [context.builder.text(context.builder.literal(data.toString()))]);

        // el.setBody(builder.literal(data));
        el.replaceWith(script);

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
