"use strict";

const fs = require("fs");
const path = require("path");
const SVGO = require("svgo");
const deasync = require("deasync");

function svgoOptimizeSync(svgo, content) {
    let res;
    svgo.optimize(content).then(result => res = result);
    deasync.loopWhile(() => !res);
    return res;
}

module.exports = function transform(el, context) {
    let inlineSVGExpression = el.getAttributeValue("inline-svg");
    let svgClasses = el.getAttributeValue("class") || {};

    const svgo = new SVGO({
        plugins: [{
            cleanupAttrs: true,
        }, {
            removeDoctype: true,
        },{
            removeXMLProcInst: true,
        },{
            removeComments: true,
        },{
            removeMetadata: true,
        },{
            removeTitle: true,
        },{
            removeDesc: true,
        },{
            removeUselessDefs: true,
        },{
            removeEditorsNSData: true,
        },{
            removeEmptyAttrs: true,
        },{
            removeHiddenElems: true,
        },{
            removeEmptyText: true,
        },{
            removeEmptyContainers: true,
        },{
            removeViewBox: false,
        },{
            cleanUpEnableBackground: true,
        },{
            convertStyleToAttrs: true,
        },{
            convertColors: true,
        },{
            convertPathData: true,
        },{
            convertTransform: true,
        },{
            removeUnknownsAndDefaults: true,
        },{
            removeNonInheritableGroupAttrs: true,
        },{
            removeUselessStrokeAndFill: true,
        },{
            removeUnusedNS: true,
        },{
            cleanupIDs: true,
        },{
            cleanupNumericValues: true,
        },{
            moveElemsAttrsToGroup: true,
        },{
            moveGroupAttrsToElems: true,
        },{
            collapseGroups: true,
        },{
            removeRasterImages: false,
        },{
            mergePaths: true,
        },{
            convertShapeToPath: true,
        },{
            sortAttrs: false,
        },{
            transformsWithOnePath: false,
        },{
            removeDimensions: true,
        },{
            removeAttrs: {attrs: "(stroke|fill)"},
        },{
            addClassesToSVGElement: {
                classNames: [svgClasses.value] // TODO warning if class is missing
            }
        }]
    });

    if (!inlineSVGExpression) {
        return;
    }

    el.removeAttribute("inline-svg"); // This attribute is handled at compile time. We can just remove it now

    if (inlineSVGExpression.type === "Literal") {
        let svgPath = "";

        if(path.isAbsolute(inlineSVGExpression.value)){
            const appDir = path.resolve(__dirname, "../..");
            svgPath = path.normalize(appDir + inlineSVGExpression.value);
        }else{
            const templateDir = context.dirname;
            svgPath = path.resolve(templateDir, inlineSVGExpression.value);
        }

        let data = fs.readFileSync(svgPath);
        let optimisedSVG = svgoOptimizeSync(svgo, data.toString());
        var svg = context.builder.htmlLiteral(optimisedSVG.data);

        el.replaceWith(svg);
    }
};
