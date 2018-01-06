/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 17);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = function extend(target, source) { //A simple function to copy properties from one object to another
    if (!target) { //Check if a target was provided, otherwise create a new empty object to return
        target = {};
    }

    if (source) {
        for (var propName in source) {
            if (source.hasOwnProperty(propName)) { //Only look at source properties that are not inherited
                target[propName] = source[propName]; //Copy the property
            }
        }
    }

    return target;
};

/***/ }),
/* 1 */
/***/ (function(module, exports) {

var FLAG_WILL_RERENDER_IN_BROWSER = 1;
// var FLAG_HAS_BODY_EL = 2;
// var FLAG_HAS_HEAD_EL = 4;

function nextComponentIdProvider(out) {
    var prefix = out.global.componentIdPrefix || 's'; // "s" is for server (we use "b" for the browser)
    var nextId = 0;

    return function nextComponentId() {
        return prefix + (nextId++);
    };
}

function attachBubblingEvent(componentDef, handlerMethodName, extraArgs) {
    if (handlerMethodName) {
        if (extraArgs) {
            var component = componentDef.___component;
            var eventIndex = component.___bubblingDomEventsExtraArgsCount++;

            // If we are not going to be doing a rerender in the browser
            // then we need to actually store the extra args with the UI component
            // so that they will be serialized down to the browser.
            // If we are rerendering in the browser then we just need to
            // increment ___bubblingDomEventsExtraArgsCount to keep track of
            // where the extra args will be found when the UI component is
            // rerendered in the browser

            if (!(componentDef.___flags & FLAG_WILL_RERENDER_IN_BROWSER)) {
                if (eventIndex === 0) {
                    component.___bubblingDomEvents = [extraArgs];
                } else {
                    component.___bubblingDomEvents.push(extraArgs);
                }
            }

            return handlerMethodName + ' ' + componentDef.id + ' ' + eventIndex;

        } else {
            return handlerMethodName + ' ' + componentDef.id;
        }
    }
}

exports.___nextComponentIdProvider = nextComponentIdProvider;
exports.___isServer = true;
exports.___attachBubblingEvent = attachBubblingEvent;
exports.___destroyComponentForNode = function noop() {};
exports.___destroyNodeRecursive = function noop() {};


/***/ }),
/* 2 */
/***/ (function(module, exports) {

var actualCreateOut;

function setCreateOut(createOutFunc) {
    actualCreateOut = createOutFunc;
}

function createOut(globalData) {
    return actualCreateOut(globalData);
}

createOut.___setCreateOut = setCreateOut;

module.exports = createOut;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(18);


/***/ }),
/* 4 */
/***/ (function(module, exports) {

var elTest = /[&<]/;
var elTestReplace = /[&<]/g;
var attrTest = /[&<\"\n]/;
var attrReplace = /[&<\"\n]/g;

var replacements = {
    '<': '&lt;',
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;',
    '\n': '&#10;' //Preserve new lines so that they don't get normalized as space
};

function replaceChar(match) {
    return replacements[match];
}

function escapeString(str, regexpTest, regexpReplace) {
    return regexpTest.test(str) ? str.replace(regexpReplace, replaceChar) : str;
}

function escapeXmlHelper(value, regexpTest, regexpReplace) {
    // check for most common case first
    if (typeof value === 'string') {
        return escapeString(value, regexpTest, regexpReplace);
    } else if (value == null) {
        return '';
    } else if (typeof value === 'object') {
        if (value.toHTML) {
            return value.toHTML();
        }
    } else if (value === true || value === false || typeof value === 'number') {
        return value.toString();
    }

    return escapeString(value.toString(), regexpTest, regexpReplace);
}

function escapeXml(value) {
    return escapeXmlHelper(value, elTest, elTestReplace);
}

function escapeXmlAttr(value) {
    return escapeXmlHelper(value, attrTest, attrReplace);
}

exports.escapeString = escapeString;
exports.escapeXml = escapeXml;
exports.escapeXmlAttr = escapeXmlAttr;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var AsyncStream = __webpack_require__(7);
var makeRenderable = __webpack_require__(30);
var stream = __webpack_require__(31);

class Readable extends stream.Readable {
    constructor(template, data, options) {
       super();
       this._t = template;
       this._d = data;
       this._shouldBuffer = !options || options.shouldBuffer !== false;
       this._rendered = false;
    }

    write(data) {
        if (data != null) {
            this.push(data);
        }
    }

    end() {
        this.push(null);
    }

    _read() {
        if (this._rendered) {
            return;
        }

        this._rendered = true;

        var template = this._t;
        var data = this._d;
        var globalData = data && data.$global;
        var shouldBuffer = this._shouldBuffer;
        var out = new AsyncStream(globalData, this, undefined, shouldBuffer);
        template.render(data, out);
        out.end();
    }
}

function Template(path, renderFunc, options) {
    this.path = path;
    this._ = renderFunc;
    this.___shouldBuffer = !options || options.shouldBuffer !== false;
    this.meta = undefined;
}

function createOut(globalData, writer, parentOut, buffer) {
    return new AsyncStream(globalData, writer, parentOut, buffer);
}

Template.prototype = {
    createOut: createOut,
    stream: function(data) {
        return new Readable(this, data, this._options);
    }
};

makeRenderable(Template.prototype);

module.exports = Template;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var EventEmitter = __webpack_require__(25);
var StringWriter = __webpack_require__(26);
var BufferedWriter = __webpack_require__(27);
var defaultDocument = typeof document != 'undefined' && document;
var RenderResult = __webpack_require__(28);
var attrsHelper = __webpack_require__(8);
var escapeXml = __webpack_require__(4).escapeXml;

var voidWriter = { write:function(){} };

function State(root, stream, writer, events) {
    this.root = root;
    this.stream = stream;
    this.writer = writer;
    this.events = events;

    this.finished = false;
}

function AsyncStream(global, writer, parentOut, shouldBuffer) {

    if (parentOut === null) {
        throw new Error('illegal state');
    }
    var finalGlobal = this.attributes = global || {};
    var originalStream;
    var state;

    if (parentOut) {
        state = parentOut._state;
        originalStream = state.stream;
    } else {
        var events = finalGlobal.events /* deprecated */ = writer && writer.on ? writer : new EventEmitter();

        if (writer) {
            originalStream = writer;
            if (shouldBuffer) {
                writer = new BufferedWriter(writer);
            }
        } else {
            writer = originalStream = new StringWriter();
        }

        state = new State(this, originalStream, writer, events);
    }

    this.global = finalGlobal;
    this.stream = originalStream;
    this._state = state;

    this._ended = false;
    this._remaining = 1;
    this._lastCount = 0;
    this._last = undefined; // Array
    this._parentOut = parentOut;

    this.data = {};
    this.writer = writer;
    writer.stream = this;

    this._sync = false;
    this._stack = undefined;
    this.name = undefined;
    this._timeoutId = undefined;

    this._node = undefined;

    this._elStack = undefined; // Array

    this.___components = null; // ComponentsContext

    this.___assignedComponentDef = null;
    this.___assignedKey = null;
    this.___assignedCustomEvents = null;
}

AsyncStream.DEFAULT_TIMEOUT = 10000;

/**
* If set to `true`, AsyncStream errors will include the full stack trace
*/
AsyncStream.INCLUDE_STACK =
    typeof process !== 'undefined' &&
    (!Object({"BUNDLE":"true"}).NODE_ENV ||
        Object({"BUNDLE":"true"}).NODE_ENV === 'development' ||
        Object({"BUNDLE":"true"}).NODE_ENV === 'dev');

AsyncStream.enableAsyncStackTrace = function() {
    AsyncStream.INCLUDE_STACK = true;
};

var proto = AsyncStream.prototype = {
    constructor: AsyncStream,
    ___document: defaultDocument,
    ___isOut: true,

    sync: function() {
        this._sync = true;
    },

    isSync: function() {
        return this._sync === true;
    },

    write: function(str) {
        if (str != null) {
            this.writer.write(str.toString());
        }
        return this;
    },

    ___getOutput: function() {
        return this._state.writer.toString();
    },

    /**
     * Legacy...
     */
    getOutput: function() {
        return this.___getOutput();
    },

    toString: function() {
        return this._state.writer.toString();
    },

    ___getResult: function() {
        this._result = this._result || new RenderResult(this);
        return this._result;
    },

    beginAsync: function(options) {
        if (this._sync) {
            throw new Error('beginAsync() not allowed when using renderSync()');
        }

        var state = this._state;

        var currentWriter = this.writer;

        /* ┏━━━━━┓               this
           ┃ WAS ┃               ↓↑
           ┗━━━━━┛  prevWriter → currentWriter → nextWriter  */

        var newWriter = new StringWriter();
        var newStream = new AsyncStream(this.global, currentWriter, this);

        this.writer = newWriter;
        newWriter.stream = this;

        newWriter.next = currentWriter.next;
        currentWriter.next = newWriter;

        /* ┏━━━━━┓               newStream       this
           ┃ NOW ┃               ↓↑              ↓↑
           ┗━━━━━┛  prevWriter → currentWriter → newWriter → nextWriter  */

       var timeout;
       var name;

       this._remaining++;

       if (options != null) {
           if (typeof options === 'number') {
               timeout = options;
           } else {
               timeout = options.timeout;

               if (options.last === true) {
                   if (timeout == null) {
                       // Don't assign a timeout to last flush fragments
                       // unless it is explicitly given a timeout
                       timeout = 0;
                   }

                   this._lastCount++;
               }

               name = options.name;
           }
       }

       if (timeout == null) {
           timeout = AsyncStream.DEFAULT_TIMEOUT;
       }

       newStream._stack = AsyncStream.INCLUDE_STACK ? new Error().stack : null;
       newStream.name = name;

       if (timeout > 0) {
           newStream._timeoutId = setTimeout(function() {
               newStream.error(new Error('Async fragment ' + (name ? '(' + name + ') ': '') + 'timed out after ' + timeout + 'ms'));
           }, timeout);
       }

       state.events.emit('beginAsync', {
           writer: newStream, // Legacy
           parentWriter: this, // Legacy
           out: newStream,
           parentOut: this
       });

       return newStream;
    },

    _doFinish: function() {
        var state = this._state;

        state.finished = true;

        if (state.writer.end) {
            state.writer.end();
        } else {
            state.events.emit('finish', this.___getResult());
        }
    },

    end: function(data) {
        if (this._ended === true) {
            return;
        }

        this._ended = true;

        var remaining = --this._remaining;

        if (data != null) {
            this.write(data);
        }

        var currentWriter = this.writer;

        /* ┏━━━━━┓  this            nextStream
           ┃ WAS ┃  ↓↑              ↓↑
           ┗━━━━━┛  currentWriter → nextWriter → futureWriter  */

        // Prevent any more writes to the current steam
        this.writer = voidWriter;
        currentWriter.stream = null;

        // Flush the contents of nextWriter to the currentWriter
        this._flushNext(currentWriter);

        /* ┏━━━━━┓    this        ╵  nextStream
           ┃     ┃    ↓           ╵  ↓↑
           ┃ NOW ┃    voidWriter  ╵  currentWriter → futureWriter
           ┃     ┃  ──────────────┴────────────────────────────────
           ┗━━━━━┛    Flushed & garbage collected: nextWriter  */

       var parentOut = this._parentOut;

       if (parentOut === undefined) {
           if (remaining === 0) {
               this._doFinish();
           } else if (remaining - this._lastCount === 0) {
               this._emitLast();
           }
       } else {
           var timeoutId = this._timeoutId;

           if (timeoutId) {
               clearTimeout(timeoutId);
           }

           if (remaining === 0) {
               parentOut._handleChildDone();
           } else if (remaining - this._lastCount === 0) {
               this._emitLast();
           }
       }

       return this;
    },

    _handleChildDone: function() {
        var remaining = --this._remaining;

        if (remaining === 0) {
            var parentOut = this._parentOut;
            if (parentOut === undefined) {
                this._doFinish();
            } else {
                parentOut._handleChildDone();
            }
        } else if (remaining - this._lastCount === 0) {
            this._emitLast();
        }
    },

    _flushNext: function(currentWriter) {
        // It is possible that currentWriter is the
        // last writer in the chain, so let's make
        // sure there is a nextWriter to flush.
        var nextWriter = currentWriter.next;
        if (nextWriter) {
            // Flush the contents of nextWriter
            // to the currentWriter
            currentWriter.write(nextWriter.toString());

            // Remove nextWriter from the chain.
            // It has been flushed and can now be
            // garbage collected.
            currentWriter.next = nextWriter.next;

            // It's possible that nextWriter is the last
            // writer in the chain and its stream already
            // ended, so let's make sure nextStream exists.
            var nextStream = nextWriter.stream;
            if (nextStream) {
                // Point the nextStream to currentWriter
                nextStream.writer = currentWriter;
                currentWriter.stream = nextStream;
            }
        }
    },

    on: function(event, callback) {
        var state = this._state;

        if (event === 'finish' && state.finished === true) {
            callback(this.___getResult());
        } else if (event === 'last') {
            this.onLast(callback);
        } else {
            state.events.on(event, callback);
        }

        return this;
    },

    once: function(event, callback) {
        var state = this._state;

        if (event === 'finish' && state.finished === true) {
            callback(this.___getResult());
        } else if (event === 'last') {
            this.onLast(callback);
        } else {
            state.events.once(event, callback);
        }

        return this;
    },

    onLast: function(callback) {
        var lastArray = this._last;

        if (lastArray === undefined) {
            this._last = [callback];
        } else {
            lastArray.push(callback);
        }

        return this;
    },

    _emitLast: function() {
        var lastArray = this._last;

        var i = 0;

        function next() {
            if (i === lastArray.length) {
                return;
            }
            var lastCallback = lastArray[i++];
            lastCallback(next);

            if (lastCallback.length === 0) {
                next();
            }
        }

        next();
    },

    emit: function(type, arg) {
        var events = this._state.events;
        switch(arguments.length) {
            case 1:
                events.emit(type);
                break;
            case 2:
                events.emit(type, arg);
                break;
            default:
                events.emit.apply(events, arguments);
                break;
        }
        return this;
    },

    removeListener: function() {
        var events = this._state.events;
        events.removeListener.apply(events, arguments);
        return this;
    },

    prependListener: function() {
        var events = this._state.events;
        events.prependListener.apply(events, arguments);
        return this;
    },

    pipe: function(stream) {
        this._state.stream.pipe(stream);
        return this;
    },

    error: function(e) {
        var stack = this._stack;
        var name = this.name;

        var message;

        if (name) {
            message = 'Render async fragment error (' + name + ')';
        } else {
            message = 'Render error';
        }

        message += '. Exception: ' + (e.stack || e);

        if (stack) {
            message += '\nCreation stack trace: ' + stack;
        }

        e = new Error(message);

        try {
            this.emit('error', e);
        } finally {
            // If there is no listener for the error event then it will
            // throw a new here. In order to ensure that the async fragment
            // is still properly ended we need to put the end() in a `finally`
            // block
            this.end();
        }

        if (console) {
            console.error(message);
        }

        return this;
    },

    flush: function() {
        var state = this._state;

        if (!state.finished) {
            var writer = state.writer;
            if (writer && writer.flush) {
                writer.flush();
            }
        }
        return this;
    },

    createOut: function() {
        return new AsyncStream(this.global);
    },

    element: function(tagName, elementAttrs, openTagOnly) {
        var str = '<' + tagName +
            attrsHelper(elementAttrs) +
            '>';

        if (openTagOnly !== true) {
            str += '</' + tagName + '>';
        }

        this.write(str);
    },

    beginElement: function(name, elementAttrs) {

        var str = '<' + name +
            attrsHelper(elementAttrs) +
            '>';

        this.write(str);

        if (this._elStack) {
            this._elStack.push(name);
        } else {
            this._elStack = [name];
        }
    },

    endElement: function() {
        var tagName = this._elStack.pop();
        this.write('</' + tagName + '>');
    },

    text: function(str) {
        this.write(escapeXml(str));
    },

    ___getNode: function(doc) {
        var node = this._node;
        var curEl;
        var newBodyEl;
        var html = this.___getOutput();

        if (!doc) {
            doc = this.___document;
        }

        if (!node) {
            if (html) {
                newBodyEl = doc.createElement('body');
                newBodyEl.innerHTML = html;
                if (newBodyEl.childNodes.length == 1) {
                    // If the rendered component resulted in a single node then just use that node
                    node = newBodyEl.childNodes[0];
                } else {
                    // Otherwise, wrap the nodes in a document fragment node
                    node = doc.createDocumentFragment();
                    while ((curEl = newBodyEl.firstChild)) {
                        node.appendChild(curEl);
                    }
                }
            } else {
                // empty HTML so use empty document fragment (so that we're returning a valid DOM node)
                node = doc.createDocumentFragment();
            }
            this._node = node;
        }
        return node;
    },

    then: function(fn, fnErr) {
        var out = this;
        var promise = new Promise(function(resolve, reject) {
            out.on('error', reject);
            out.on('finish', function(result) {
                resolve(result);
            });
        });

        return Promise.resolve(promise).then(fn, fnErr);
    },

    catch: function(fnErr) {
        return this.then(undefined, fnErr);
    },

    c: function(componentDef, key, customEvents) {
        this.___assignedComponentDef = componentDef;
        this.___assignedKey = key;
        this.___assignedCustomEvents = customEvents;
    }
};

// alias:
proto.w = proto.write;

module.exports = AsyncStream;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var attrHelper = __webpack_require__(9);

function attrs(arg) {
    if (typeof arg === 'object') {
        var out = '';
        for (var attrName in arg) {
            out += attrHelper(attrName, arg[attrName]);
        }
        return out;
    } else if (typeof arg === 'string') {
        return arg;
    }
    return '';
}

module.exports = attrs;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var escape = __webpack_require__(4);
var escapeString = escape.escapeString;
var escapeXmlAttr = escape.escapeXmlAttr;

var stringifiedAttrTest = /[&\'\n]/;
var stringifiedAttrReplace = /[&\'\n]/g;

function attr(name, value, shouldEscape) {
    shouldEscape = shouldEscape !== false;
    var type = typeof value;

    if (type === 'string') {
        return ' ' + name + '="' + (shouldEscape ? escapeXmlAttr(value) : value) + '"';
    } else if (value === true) {
        return ' ' + name;
    } else if (value == null || value === false) {
        return '';
    } else if (type === 'object') {
        value = JSON.stringify(value);
        if (shouldEscape) {
            value = escapeString(value, stringifiedAttrTest, stringifiedAttrReplace);
        }

        return ' ' + name + "='" + value + "'";
    } else {
        return ' ' + name + '=' + value; // number (doesn't need quotes)
    }
}

module.exports = attr;


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(33);

exports.r = __webpack_require__(38);

exports.c = function() { /* no op for defining a component on teh server */ };

// registerComponent is a no-op on the server.
// Fixes https://github.com/marko-js/marko-components/issues/111
exports.rc = function(typeName) { return typeName; };


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const markerKey = Symbol('warp10');
const isArray = Array.isArray;

class Marker {
    constructor(path, symbol) {
        this.path = path;
        this.symbol = symbol;
    }
}

function append(array, el) {
    var len = array.length;
    var clone = new Array(len+1);
    for (var i=0; i<len; i++) {
        clone[i] = array[i];
    }
    clone[len] = el;
    return clone;
}

class Assignment {
    constructor(lhs, rhs) {
        this.l = lhs;
        this.r = rhs;
    }
}

function handleProperty(clone, key, value, valuePath, serializationSymbol, assignments) {
    if (value.constructor === Date) {
        assignments.push(new Assignment(valuePath, { type: 'Date', value: value.getTime() }));
    } else if (isArray(value)) {
        const marker = value[markerKey];

        if (marker && marker.symbol === serializationSymbol) {
            assignments.push(new Assignment(valuePath, marker.path));
        } else {
            value[markerKey] = new Marker(valuePath, serializationSymbol);
            clone[key] = pruneArray(value, valuePath, serializationSymbol, assignments);
        }
    } else {
        const marker = value[markerKey];
        if (marker && marker.symbol === serializationSymbol) {
            assignments.push(new Assignment(valuePath, marker.path));
        } else {
            value[markerKey] = new Marker(valuePath, serializationSymbol);
            clone[key] = pruneObject(value, valuePath, serializationSymbol, assignments);
        }
    }
}

function pruneArray(array, path, serializationSymbol, assignments) {
    let len = array.length;

    var clone = new Array(len);

    for (let i=0; i<len; i++) {
        var value = array[i];
        if (value == null) {
            continue;
        }

        if (value && typeof value === 'object') {
            handleProperty(clone, i, value, append(path, i), serializationSymbol, assignments);
        } else {
            clone[i] = value;
        }
    }

    return clone;
}

function pruneObject(obj, path, serializationSymbol, assignments) {
    var clone = {};

    if (obj.toJSON && obj.constructor != Date) {
        obj = obj.toJSON();
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    // `Object.keys(...)` with standard for loop is faster than `for in` in v8
    var keys = Object.keys(obj);
    var len = keys.length;

    for (var i = 0; i < len; i++) {
        var key = keys[i];
        var value = obj[key];

        if (value === undefined) {
            continue;
        }

        if (value && typeof value === 'object') {
            handleProperty(clone, key, value, append(path, key), serializationSymbol, assignments);
        } else {
            clone[key] = value;
        }
    }

    return clone;
}

module.exports = function stringifyPrepare(obj) {
    if (!obj) {
        return obj;
    }

    /**
     * Performance notes:
     *
     * - It is faster to use native JSON.stringify instead of a custom stringify
     * - It is faster to first prune and then call JSON.stringify with _no_ replacer
     */
    var pruned;

    const assignments = []; // Used to keep track of code that needs to run to fix up the stringified object

    if (typeof obj === 'object') {
        if (obj.toJSON && obj.constructor != Date) {
            obj = obj.toJSON();
            if (!obj.hasOwnProperty || typeof obj !== 'object') {
                return obj;
            }
        }
        const serializationSymbol = Symbol(); // Used to detect if the marker is associated with _this_ serialization
        const path = [];

        obj[markerKey] = new Marker(path, serializationSymbol);

        if (obj.constructor === Date) {
            pruned = null;
            assignments.push(new Assignment([], { type: 'Date', value: obj.getTime() }));
        } else if (isArray(obj)) {
            pruned = pruneArray(obj, path, serializationSymbol, assignments);
        } else {
            pruned = pruneObject(obj, path, serializationSymbol, assignments);
        }
    } else {
        pruned = obj;
    }

    if (assignments.length) {
        return {
            o: pruned,
            $$: assignments
        };
    } else {
        return pruned;
    }
};


/***/ }),
/* 13 */
/***/ (function(module, exports) {

var isArray = Array.isArray;

function resolve(object, path, len) {
    var current = object;
    for (var i=0; i<len; i++) {
        current = current[path[i]];
    }

    return current;
}

function resolveType(info) {
    if (info.type === 'Date') {
        return new Date(info.value);
    } else {
        throw new Error('Bad type');
    }
}

module.exports = function finalize(outer) {
    if (!outer) {
        return outer;
    }

    var assignments = outer.$$;
    if (assignments) {
        var object = outer.o;
        var len;

        if (assignments && (len=assignments.length)) {
            for (var i=0; i<len; i++) {
                var assignment = assignments[i];

                var rhs = assignment.r;
                var rhsValue;

                if (isArray(rhs)) {
                    rhsValue = resolve(object, rhs, rhs.length);
                } else {
                    rhsValue = resolveType(rhs);
                }

                var lhs = assignment.l;
                var lhsLast = lhs.length-1;

                if (lhsLast === -1) {
                    object = outer.o = rhsValue;
                    break;
                } else {
                    var lhsParent = resolve(object, lhs, lhsLast);
                    lhsParent[lhs[lhsLast]] = rhsValue;
                }
            }
        }

        assignments.length = 0; // Assignments have been applied, do not reapply

        return object == null ? null : object;
    } else {
        return outer;
    }

};

/***/ }),
/* 14 */
/***/ (function(module, exports) {

 function KeySequence() {
    this.___lookup = {};
}

KeySequence.prototype = {
    ___nextKey: function(key) {
        // var len = key.length;
        // var lastChar = key[len-1];
        // if (lastChar === ']') {
        //     key = key.substring(0, len-2);
        // }
        var lookup = this.___lookup;

        var currentIndex = lookup[key]++;
        if (!currentIndex) {
            lookup[key] = 1;
            currentIndex = 0;
            return key;
        } else {
            return key + '_' + currentIndex;
        }


    }
};

module.exports = KeySequence;


/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = function copyProps(from, to) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
        var descriptor = Object.getOwnPropertyDescriptor(from, name);
        Object.defineProperty(to, name, descriptor);
    });
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var extend = __webpack_require__(0);

var STYLE_ATTR = 'style';
var CLASS_ATTR = 'class';

var escape = __webpack_require__(4);
var escapeXml = escape.escapeXml;
var escapeXmlAttr = escape.escapeXmlAttr;
var attrHelper = __webpack_require__(9);
var attrsHelper = __webpack_require__(8);

var classList;






/**
 * Internal method to escape special XML characters
 * @private
 */
exports.x = escapeXml;
/**
 * Internal method to escape special XML characters within an attribute
 * @private
 */
exports.xa = escapeXmlAttr;

/**
 * Escapes the '</' sequence in the body of a <script> body to avoid the `<script>` being
 * ended prematurely.
 *
 * For example:
 * var evil = {
 * 	name:  '</script><script>alert(1)</script>'
 * };
 *
 * <script>var foo = ${JSON.stringify(evil)}</script>
 *
 * Without escaping the ending '</script>' sequence the opening <script> tag would be
 * prematurely ended and a new script tag could then be started that could then execute
 * arbitrary code.
 */
var escapeEndingScriptTagRegExp = /<\/script/g;
exports.xs = function escapeScriptHelper(val) {
    return (typeof val === 'string') ? val.replace(escapeEndingScriptTagRegExp, '\\u003C/script') : val;
};

/**
 * Escapes the '</' sequence in the body of a <style> body to avoid the `<style>` being
 * ended prematurely.
 *
 * For example:
 * var color = '</style><script>alert(1)</script>';
 *
 * <style>#foo { background-color:${color} }</style>
 *
 * Without escaping the ending '</style>' sequence the opening <style> tag would be
 * prematurely ended and a script tag could then be started that could then execute
 * arbitrary code.
 */
var escapeEndingStyleTagRegExp = /<\/style/g;
exports.xc = function escapeScriptHelper(val) {
    return (typeof val === 'string') ? val.replace(escapeEndingStyleTagRegExp, '\\003C/style') : val;
};

/**
 * Internal method to render a single HTML attribute
 * @private
 */
exports.a = attrHelper;

/**
 * Internal method to render multiple HTML attributes based on the properties of an object
 * @private
 */
exports.as = attrsHelper;

/**
 * Internal helper method to handle the "style" attribute. The value can either
 * be a string or an object with style propertes. For example:
 *
 * sa('color: red; font-weight: bold') ==> ' style="color: red; font-weight: bold"'
 * sa({color: 'red', 'font-weight': 'bold'}) ==> ' style="color: red; font-weight: bold"'
 */

var dashedNames = {};

exports.sa = function(style) {
    if (!style) {
        return '';
    }

    var type = typeof style;

    if (type === 'string') {
        return attrHelper(STYLE_ATTR, style, false);
    } else if (type === 'object') {
        var styles = '';
        for (var name in style) {
            var value = style[name];
            if (value != null) {
                if (typeof value === 'number' && value) {
                    value += 'px';
                }
                var nameDashed = dashedNames[name];
                if (!nameDashed) {
                    nameDashed = dashedNames[name] = name.replace(/([A-Z])/g, '-$1').toLowerCase();
                }
                styles += nameDashed + ':' + value + ';';
            }
        }
        return styles ? ' ' + STYLE_ATTR + '="' + styles +'"' : '';
    } else {
        return '';
    }
};

/**
 * Internal helper method to handle the "class" attribute. The value can either
 * be a string, an array or an object. For example:
 *
 * ca('foo bar') ==> ' class="foo bar"'
 * ca({foo: true, bar: false, baz: true}) ==> ' class="foo baz"'
 * ca(['foo', 'bar']) ==> ' class="foo bar"'
 */
exports.ca = function(classNames) {
    if (!classNames) {
        return '';
    }

    if (typeof classNames === 'string') {
        return attrHelper(CLASS_ATTR, classNames, false);
    } else {
        return attrHelper(CLASS_ATTR, classList(classNames), false);
    }
};


function classList(arg) {
    var len, name, value, str = '';

    if (arg) {
        if (typeof arg === 'string') {
            if (arg) {
                str += ' ' + arg;
            }
        } else if (typeof (len = arg.length) === 'number') {
            for (var i=0; i<len; i++) {
                value = classList(arg[i]);
                if (value) {
                    str += ' ' + value;
                }
            }
        } else if (typeof arg === 'object') {
            for (name in arg) {
                value = arg[name];
                if (value) {
                    str += ' ' + name;
                }
            }
        }
    }

    return (str && str.slice(1)) || null;
}

var commonHelpers = __webpack_require__(46);
extend(exports, commonHelpers);
exports.cl = classList;


/**
 * Internal helper method to insert a script tag that assigns properties
 * to the dom node the precede it.
 */
var escapeScript = exports.xs;
var assignPropsFunction = `
    function ap_(p) {
        var s = document.currentScript;
        Object.assign(s.previousSibling, p);
        s.parentNode.removeChild(s);
    }
`.replace(/\s+/g, ' ')
 .replace(/([\W]) (.)/g, '$1$2')
 .replace(/(.) ([\W])/g, '$1$2')
 .trim();
exports.p = function propsForPreviousNode(props, out) {
    var cspNonce = out.global.cspNonce;
    var nonceAttr = cspNonce ? ' nonce='+JSON.stringify(cspNonce) : '';

    out.w('<script' + nonceAttr + '>');

    if (!out.global.assignPropsFunction) {
        out.w(assignPropsFunction);
        out.global.assignPropsFunction = true;
    }

    out.w('ap_(' + escapeScript(JSON.stringify(props)) + ');</script>');
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__filename) {
    promiseFn = function(resolve, reject){
// Compiled using marko@4.6.0 - DO NOT EDIT
"use strict";

var marko_template = module.exports = __webpack_require__(3).t(__filename),
    components_helpers = __webpack_require__(11),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/awly$1.0.0/src/pages/posts/index.marko", function() {
      return module.exports;
    }),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    default_template = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"src/layouts/default\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
    marko_helpers = __webpack_require__(16),
    marko_str = marko_helpers.s,
    hasRenderBodyKey = Symbol.for("hasRenderBody"),
    dynamodb_template = __webpack_require__(47),
    marko_loadTag = marko_helpers.t,
    dynamodb_tag = marko_loadTag(dynamodb_template),
    include_tag = marko_loadTag(__webpack_require__(54));

function render(input, out, __component, component, state) {
  var data = input;

  include_tag({
      _target: default_template,
      styles: {
          renderBody: function renderBody(out) {
            out.w(marko_str(input.injectCSS));
          }
        },
      scripts: {
          renderBody: function renderBody(out) {
            out.w(marko_str(input.injectJS));
          }
        },
      title: {
          renderBody: function renderBody(out) {
            out.w("MarkoJS Dynamodb GraphQL!");
          }
        },
      body: {
          renderBody: function renderBody(out) {
            dynamodb_tag({}, out, __component, "5");
          }
        },
      [hasRenderBodyKey]: true
    }, out, __component, "0");
}

marko_template._ = marko_renderer(render, {
    ___implicit: true,
    ___type: marko_componentType
  });

marko_template.Component = marko_defineComponent({}, marko_template._);

marko_template.meta = {
    tags: [
      "src/layouts/default",
      "../../components/dynamodb",
      "marko/src/taglibs/core/include-tag"
    ]
  };


var createOut = __webpack_require__(2);

function safeRender(renderFunc, finalData, finalOut, shouldEnd) {
    try {
        renderFunc(finalData, finalOut);

        if (shouldEnd) {
            finalOut.end();
        }
    } catch(err) {
        var actualEnd = finalOut.end;
        finalOut.end = function() {};

        setTimeout(function() {
            finalOut.end = actualEnd;
            finalOut.error(err);
        }, 0);
    }
    return finalOut;
}

function renderToString(template, data, callback) {
    var localData = data || {};
    var render = template._;
    var globalData = localData.$global;

    var out = createOut(globalData);

    out.global.template = template;

    if (globalData) {
        localData.$global = undefined;
    }

    out.on('finish', function () {
        callback(null, out.toString(), out);
    }).once('error', function(err){
        console.log(err);
    });

    return safeRender(render, localData, out, true);
}

renderToString(marko_template, {}, function(res, html, out) {
    resolve(html);
});

}

/* WEBPACK VAR INJECTION */}.call(exports, "/index.js"))

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Template;

/**
 * Method is for internal usage only. This method
 * is invoked by code in a compiled Marko template and
 * it is used to create a new Template instance.
 * @private
 */
exports.t = function createTemplate(path) {
     return new Template(path);
};

__webpack_require__(19);

var AsyncStream = __webpack_require__(7);
Template = __webpack_require__(6);

function createOut(globalData, parent, state, buffer) {
    return new AsyncStream(globalData, parent, state, buffer);
}

exports.createWriter = function(writer) {
    return new AsyncStream(null, writer);
};

exports.Template = Template;
exports.___createOut = createOut;
exports.AsyncStream = AsyncStream;
exports.enableAsyncStackTrace = AsyncStream.enableAsyncStackTrace;

__webpack_require__(2).___setCreateOut(createOut);


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__(20);

if (false) {
    if (process.env.MARKO_HOT_RELOAD) {
        require('./hot-reload').enable();
    }

    // If process was launched with browser refresh then automatically
    // enable browser-refresh
    require('./browser-refresh').enable();
}

function fixFlush() {
    try {
        var OutgoingMessage = __webpack_require__(10).OutgoingMessage;
        if (OutgoingMessage.prototype.flush && OutgoingMessage.prototype.flush.toString().indexOf('deprecated') !== -1) {
            // Yes, we are monkey-patching http. This method should never have been added and it was introduced on
            // the iojs fork. It was quickly deprecated and I'm 99% sure no one is actually using it.
            // See:
            // - https://github.com/marko-js/async-writer/issues/3
            // - https://github.com/nodejs/node/issues/2920
            //
            // This method causes problems since marko looks for the flush method and calls it found.
            // The `res.flush()` method is introduced by the [compression](https://www.npmjs.com/package/compression)
            // middleware, but, otherwise, it should typically not exist.
            delete __webpack_require__(10).OutgoingMessage.prototype.flush;
        }
    } catch(e) {}
}

fixFlush();

exports.createOut = __webpack_require__(2);
exports.load = __webpack_require__(32);


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var patch = __webpack_require__(21).patch;
var Template = __webpack_require__(6);
patch(Template);


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(5);
var defaultResolveFrom = __webpack_require__(22);
var env = Object({"BUNDLE":"true"}).NODE_ENV;
var production = !env || env !== 'development';

function getDeps(template, context) {
    if (!template.meta && template.template) {
        template = template.template;
    }

    if (typeof template.createOut !== 'function') {
        return [];
    }

    if (production && template.deps) {
        return template.deps;
    }

    var deps = template.deps = [];

    if (!template.meta) {
        console.error('Metadata not set for template at ', template.path);
        return [];
    }

    var meta = template.meta;
    var root = path.dirname(template.path);

    if (meta.deps) {
        deps.push.apply(deps, meta.deps.map(d => resolveDep(d, root, context)));
    }

    if (meta.tags) {
        meta.tags.forEach(tagPath => {
            var resolveFrom = context.resolveFrom || defaultResolveFrom;
            var tag = resolveFrom(root, tagPath);
            var ext = path.extname(tag);
            var req = context.require || !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());

            try {
                tag = req.resolve(tag.slice(0, 0 - ext.length) + '.js');
            } catch(e) {}

            var tagDeps = getDeps(req(tag), context);
            deps.push.apply(deps, tagDeps);
        });
    }

    template.deps = dedupeDeps(deps);

    return deps;
}

function resolveDep(dep, root, context) {
    if (typeof dep === 'string') {
        dep = parseDependencyString(dep);
    }

    if (dep.path) {
        var resolveFrom = (context && context.resolveFrom) || defaultResolveFrom;
        dep.path = resolveFrom(root, dep.path);

        if(dep.path && !dep.type) {
            dep.type = dep.path.slice(dep.path.lastIndexOf('.')+1);
        }
    }

    if (dep.virtualPath) {
        dep.virtualPath = path.resolve(root, dep.virtualPath);
    }

    return dep;
}

function parseDependencyString(string) {
    var match = /^(?:([\w-]+)(?:\:\s*|\s+))?(.*?(?:\.(\w+))?)$/.exec(string);
    return {
        type: match[1] || match[3],
        path: match[2]
    };
}

function dedupeDeps(deps) {
    return deps;
}

function patch(Template) {
    Template.prototype.getDependencies = function(context) {
        context = context || {};

        return getDeps(this, context);
    };
}

exports.getDeps = getDeps;
exports.resolveDep = resolveDep;
exports.patch = patch;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var path = __webpack_require__(5);
var Module = __webpack_require__(23);

module.exports = function (fromDir, moduleId) {
	if (typeof fromDir !== 'string' || typeof moduleId !== 'string') {
		throw new TypeError('Expected `fromDir` and `moduleId` to be a string');
	}

	fromDir = path.resolve(fromDir);

	var fromFile = path.join(fromDir, 'noop.js');

	try {
		return Module._resolveFilename(moduleId, {
			id: fromFile,
			filename: fromFile,
			paths: Module._nodeModulePaths(fromDir)
		});
	} catch (err) {
		return null;
	}
};


/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("module");

/***/ }),
/* 24 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 24;

/***/ }),
/* 25 */
/***/ (function(module, exports) {

/* jshint newcap:false */
var slice = Array.prototype.slice;

function isFunction(arg) {
    return typeof arg === 'function';
}

function checkListener(listener) {
    if (!isFunction(listener)) {
        throw TypeError('Invalid listener');
    }
}

function invokeListener(ee, listener, args) {
    switch (args.length) {
        // fast cases
        case 1:
            listener.call(ee);
            break;
        case 2:
            listener.call(ee, args[1]);
            break;
        case 3:
            listener.call(ee, args[1], args[2]);
            break;
            // slower
        default:
            listener.apply(ee, slice.call(args, 1));
    }
}

function addListener(eventEmitter, type, listener, prepend) {
    checkListener(listener);

    var events = eventEmitter.$e || (eventEmitter.$e = {});

    var listeners = events[type];
    if (listeners) {
        if (isFunction(listeners)) {
            events[type] = prepend ? [listener, listeners] : [listeners, listener];
        } else {
            if (prepend) {
                listeners.unshift(listener);
            } else {
                listeners.push(listener);
            }
        }

    } else {
        events[type] = listener;
    }
    return eventEmitter;
}

function EventEmitter() {
    this.$e = this.$e || {};
}

EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype = {
    $e: null,

    emit: function(type) {
        var args = arguments;

        var events = this.$e;
        if (!events) {
            return;
        }

        var listeners = events && events[type];
        if (!listeners) {
            // If there is no 'error' event listener then throw.
            if (type === 'error') {
                var error = args[1];
                if (!(error instanceof Error)) {
                    var context = error;
                    error = new Error('Error: ' + context);
                    error.context = context;
                }

                throw error; // Unhandled 'error' event
            }

            return false;
        }

        if (isFunction(listeners)) {
            invokeListener(this, listeners, args);
        } else {
            listeners = slice.call(listeners);

            for (var i=0, len=listeners.length; i<len; i++) {
                var listener = listeners[i];
                invokeListener(this, listener, args);
            }
        }

        return true;
    },

    on: function(type, listener) {
        return addListener(this, type, listener, false);
    },

    prependListener: function(type, listener) {
        return addListener(this, type, listener, true);
    },

    once: function(type, listener) {
        checkListener(listener);

        function g() {
            this.removeListener(type, g);

            if (listener) {
                listener.apply(this, arguments);
                listener = null;
            }
        }

        this.on(type, g);

        return this;
    },

    // emits a 'removeListener' event iff the listener was removed
    removeListener: function(type, listener) {
        checkListener(listener);

        var events = this.$e;
        var listeners;

        if (events && (listeners = events[type])) {
            if (isFunction(listeners)) {
                if (listeners === listener) {
                    delete events[type];
                }
            } else {
                for (var i=listeners.length-1; i>=0; i--) {
                    if (listeners[i] === listener) {
                        listeners.splice(i, 1);
                    }
                }
            }
        }

        return this;
    },

    removeAllListeners: function(type) {
        var events = this.$e;
        if (events) {
            delete events[type];
        }
    },

    listenerCount: function(type) {
        var events = this.$e;
        var listeners = events && events[type];
        return listeners ? (isFunction(listeners) ? 1 : listeners.length) : 0;
    }
};

module.exports = EventEmitter;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function StringWriter() {
    this.str = '';
}

StringWriter.prototype = {
    write: function(str) {
        this.str += str;
        return this;
    },

    /**
     * Converts the string buffer into a String.
     *
     * @returns {String} The built String
     */
    toString: function() {
        return this.str;
    }
};

module.exports = StringWriter;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Simple wrapper that can be used to wrap a stream
 * to reduce the number of write calls. In Node.js world,
 * each stream.write() becomes a chunk. We can avoid overhead
 * by reducing the number of chunks by buffering the output.
 */
function BufferedWriter(wrappedStream) {
    this._buffer = '';
    this._wrapped = wrappedStream;
}

BufferedWriter.prototype = {
    write: function(str) {
        this._buffer += str;
    },

    flush: function() {
        if (this._buffer.length !== 0) {
            this._wrapped.write(this._buffer);
            this._buffer = '';
            if (this._wrapped.flush) {
                this._wrapped.flush();
            }
        }
    },

    end: function() {
        this.flush();
        if (!this._wrapped.isTTY) {
            this._wrapped.end();
        }
    },

    clear: function() {
        this._buffer = '';
    }
};

module.exports = BufferedWriter;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var domInsert = __webpack_require__(29);

function getComponentDefs(result) {
    var componentDefs = result.___components;

    if (!componentDefs) {
        throw Error('No component');
    }
    return componentDefs;
}

function RenderResult(out) {
   this.out = this.___out = out;
   this.___components = undefined;
}

module.exports = RenderResult;

var proto = RenderResult.prototype = {
    getComponent: function() {
        return this.getComponents()[0];
    },
    getComponents: function(selector) {
        if (this.___components === undefined) {
            throw Error('Not added to DOM');
        }

        var componentDefs = getComponentDefs(this);

        var components = [];

        componentDefs.forEach(function(componentDef) {
            var component = componentDef.___component;
            if (!selector || selector(component)) {
                components.push(component);
            }
        });

        return components;
    },

    afterInsert: function(doc) {
        var out = this.___out;
        var componentsContext = out.___components;
        if (componentsContext) {
            this.___components = componentsContext.___initComponents(doc);
        } else {
            this.___components = null;
        }

        return this;
    },
    getNode: function(doc) {
        return this.___out.___getNode(doc);
    },
    getOutput: function() {
        return this.___out.___getOutput();
    },
    toString: function() {
        return this.___out.toString();
    },
    document: typeof document != 'undefined' && document
};

// Add all of the following DOM methods to Component.prototype:
// - appendTo(referenceEl)
// - replace(referenceEl)
// - replaceChildrenOf(referenceEl)
// - insertBefore(referenceEl)
// - insertAfter(referenceEl)
// - prependTo(referenceEl)
domInsert(
    proto,
    function getEl(renderResult, referenceEl) {
        return renderResult.getNode(referenceEl.ownerDocument);
    },
    function afterInsert(renderResult, referenceEl) {
        var isShadow = typeof ShadowRoot === 'function' && referenceEl instanceof ShadowRoot;
        return renderResult.afterInsert(isShadow ? referenceEl : referenceEl.ownerDocument);
    });


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var extend = __webpack_require__(0);
var componentsUtil = __webpack_require__(1);
var destroyComponentForNode = componentsUtil.___destroyComponentForNode;
var destroyNodeRecursive = componentsUtil.___destroyNodeRecursive;

function resolveEl(el) {
    if (typeof el == 'string') {
        var elId = el;
        el = document.getElementById(elId);
        if (!el) {
            throw Error('Not found: ' + elId);
        }
    }
    return el;
}

function beforeRemove(referenceEl) {
    destroyNodeRecursive(referenceEl);
    destroyComponentForNode(referenceEl);
}

module.exports = function(target, getEl, afterInsert) {
    extend(target, {
        appendTo: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            referenceEl.appendChild(el);
            return afterInsert(this, referenceEl);
        },
        prependTo: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            referenceEl.insertBefore(el, referenceEl.firstChild || null);
            return afterInsert(this, referenceEl);
        },
        replace: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            beforeRemove(referenceEl);
            referenceEl.parentNode.replaceChild(el, referenceEl);
            return afterInsert(this, referenceEl);
        },
        replaceChildrenOf: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);

            var curChild = referenceEl.firstChild;
            while(curChild) {
                var nextSibling = curChild.nextSibling; // Just in case the DOM changes while removing
                beforeRemove(curChild);
                curChild = nextSibling;
            }

            referenceEl.innerHTML = '';
            referenceEl.appendChild(el);
            return afterInsert(this, referenceEl);
        },
        insertBefore: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            referenceEl.parentNode.insertBefore(el, referenceEl);
            return afterInsert(this, referenceEl);
        },
        insertAfter: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            el = el;
            var nextSibling = referenceEl.nextSibling;
            var parentNode = referenceEl.parentNode;
            if (nextSibling) {
                parentNode.insertBefore(el, nextSibling);
            } else {
                parentNode.appendChild(el);
            }
            return afterInsert(this, referenceEl);
        }
    });
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var defaultCreateOut = __webpack_require__(2);
var extend = __webpack_require__(0);

function safeRender(renderFunc, finalData, finalOut, shouldEnd) {
    try {
        renderFunc(finalData, finalOut);

        if (shouldEnd) {
            finalOut.end();
        }
    } catch(err) {
        var actualEnd = finalOut.end;
        finalOut.end = function() {};

        setTimeout(function() {
            finalOut.end = actualEnd;
            finalOut.error(err);
        }, 0);
    }
    return finalOut;
}

module.exports = function(target, renderer) {
    var renderFunc = renderer && (renderer.renderer || renderer.render || renderer);
    var createOut = target.createOut || renderer.createOut || defaultCreateOut;

    return extend(target, {
        createOut: createOut,

        renderToString: function(data, callback) {
            var localData = data || {};
            var render = renderFunc || this._;
            var globalData = localData.$global;
            var out = createOut(globalData);

            out.global.template = this;

            if (globalData) {
                localData.$global = undefined;
            }

            if (callback) {
                out.on('finish', function() {
                       callback(null, out.toString(), out);
                   })
                   .once('error', callback);

                return safeRender(render, localData, out, true);
            } else {
                out.sync();
                render(localData, out);
                return out.toString();
            }
        },

        renderSync: function(data) {
            var localData = data || {};
            var render = renderFunc || this._;
            var globalData = localData.$global;
            var out = createOut(globalData);
            out.sync();

            out.global.template = this;

            if (globalData) {
                localData.$global = undefined;
            }

            render(localData, out);
            return out.___getResult();
        },

        /**
         * Renders a template to either a stream (if the last
         * argument is a Stream instance) or
         * provides the output to a callback function (if the last
         * argument is a Function).
         *
         * Supported signatures:
         *
         * render(data)
         * render(data, out)
         * render(data, stream)
         * render(data, callback)
         *
         * @param  {Object} data The view model data for the template
         * @param  {AsyncStream/AsyncVDOMBuilder} out A Stream, an AsyncStream/AsyncVDOMBuilder instance, or a callback function
         * @return {AsyncStream/AsyncVDOMBuilder} Returns the AsyncStream/AsyncVDOMBuilder instance that the template is rendered to
         */
        render: function(data, out) {
            var callback;
            var finalOut;
            var finalData;
            var globalData;
            var render = renderFunc || this._;
            var shouldBuffer = this.___shouldBuffer;
            var shouldEnd = true;

            if (data) {
                finalData = data;
                if ((globalData = data.$global)) {
                    finalData.$global = undefined;
                }
            } else {
                finalData = {};
            }

            if (out && out.___isOut) {
                finalOut = out;
                shouldEnd = false;
                extend(out.global, globalData);
            } else if (typeof out == 'function') {
                finalOut = createOut(globalData);
                callback = out;
            } else {
                finalOut = createOut(
                    globalData, // global
                    out, // writer(AsyncStream) or parentNode(AsyncVDOMBuilder)
                    undefined, // parentOut
                    shouldBuffer // ignored by AsyncVDOMBuilder
                );
            }

            if (callback) {
                finalOut
                    .on('finish', function() {
                        callback(null, finalOut.___getResult());
                    })
                    .once('error', callback);
            }

            globalData = finalOut.global;

            globalData.template = globalData.template || this;

            return safeRender(render, finalData, finalOut, shouldEnd);
        }
    });
};


/***/ }),
/* 31 */
/***/ (function(module, exports) {

module.exports = require("stream");

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

if (true) {
    // you cannot load templates dynamically within a bundle
    // all templates should be pre-compiled as part of the bundle
    module.exports = function(){};
} else {
    module.exports = require('./index-default');
}

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var warp10 = __webpack_require__(34);
var safeJSONRegExp = /<\/|\u2028|\u2029/g;


function safeJSONReplacer(match) {
    if (match === '<\/') {
        return '\\u003C/';
    } else {
        return '\\u' + match.charCodeAt(0).toString(16);
    }
}

function safeJSON(json) {
    return json.replace(safeJSONRegExp, safeJSONReplacer);
}

function addComponentsFromContext(componentsContext, componentsFinal, typesLookup, typesArray) {
    var nestedContexts = componentsContext.___nestedContexts;
    if (nestedContexts !== undefined) {
        // We want to initialize any UI components nested inside an async
        // fragment first so we will add components from nested contexts first
        nestedContexts.forEach(function(nestedContext) {
            addComponentsFromContext(nestedContext, componentsFinal, typesLookup, typesArray);
        });
    }

    var components = componentsContext.___components;
    var len;
    if ((len = components.length) === 0) {
        return;
    }

    // console.log('components:', components.map((componentDef) => {
    //     return { id: componentDef.id, type: componentDef.type};
    // }));

    for (var i = len - 1; i >= 0; i--) {
        var componentDef = components[i];
        var id = componentDef.id;
        var component = componentDef.___component;
        var flags = componentDef.___flags;

        var state = component.state;
        var input = component.input;
        var typeName = component.typeName;
        var customEvents = component.___customEvents;
        var scope = component.___scope;
        var bubblingDomEvents = component.___bubblingDomEvents;

        component.___state = undefined; // We don't use `delete` to avoid V8 deoptimization
        component.___input = undefined; // We don't use `delete` to avoid V8 deoptimization
        component.typeName = undefined;
        component.id = undefined;
        component.___customEvents = undefined;
        component.___scope = undefined;
        component.___bubblingDomEvents = undefined;
        component.___bubblingDomEventsExtraArgsCount = undefined;

        if (!typeName) {
            continue;
        }

        var typeIndex = typesLookup[typeName];
        if (typeIndex === undefined) {
            typeIndex = typesArray.length;
            typesArray.push(typeName);
            typesLookup[typeName] = typeIndex;
        }

        var hasProps = false;

        let componentKeys = Object.keys(component);
        for (let i=0, len=componentKeys.length; i<len; i++) {
            let key = componentKeys[i];

            if (component[key] !== undefined) {
                hasProps = true;
                break;
            }
        }

        var undefinedPropNames;

        if (state) {
            // Update state properties with an `undefined` value to have a `null`
            // value so that the property name will be serialized down to the browser.
            // This ensures that we add the proper getter/setter for the state property.

            let stateKeys = Object.keys(state);
            for (let i=0, len=stateKeys.length; i<len; i++) {
                let key = stateKeys[i];

                if (state[key] === undefined) {
                    if (undefinedPropNames) {
                        undefinedPropNames.push(key);
                    } else {
                        undefinedPropNames = [key];
                    }
                }
            }
        }

        var extra = {
            b: bubblingDomEvents,
            d: componentDef.___domEvents,
            e: customEvents,
            f: flags ? flags : undefined,
            p: customEvents && scope, // Only serialize scope if we need to attach custom events
            r: componentDef.___boundary,
            s: state,
            u: undefinedPropNames,
            w: hasProps ? component : undefined
        };

        componentsFinal.push([
            id,                  // 0 = id
            typeIndex,           // 1 = type
            input,               // 2 = input
            extra                // 3
        ]);
    }

    components.length = 0;
}

function getRenderedComponents(out) {
    var componentsContext = out.___components;
    if (componentsContext === null) {
        return;
    }

    var componentsFinal = [];
    var typesLookup = {};
    var typesArray = [];

    addComponentsFromContext(componentsContext, componentsFinal, typesLookup, typesArray);

    if (componentsFinal.length !== 0) {
        return {w: componentsFinal, t: typesArray};
    }
}

function writeInitComponentsCode(fromOut, targetOut, shouldIncludeAll) {
    var renderedComponents = getRenderedComponents(fromOut, shouldIncludeAll);
    if (renderedComponents === undefined) {
        return;
    }

    var cspNonce = targetOut.global.cspNonce;
    var nonceAttr = cspNonce ? ' nonce='+JSON.stringify(cspNonce) : '';

    targetOut.write('<script' + nonceAttr + '>' +
        '(function(){var w=window;w.$components=(w.$components||[]).concat(' +
        safeJSON(warp10.stringify(renderedComponents)) +
        ')||w.$components})()</script>');
}

exports.writeInitComponentsCode = writeInitComponentsCode;

/**
 * Returns an object that can be sent to the browser using JSON.stringify. The parsed object should be
 * passed to require('marko-components').initComponents(...);
 *
 * @param  {ComponentsContext|AsyncWriter} componentsContext A ComponentsContext or an AsyncWriter
 * @return {Object} An object with information about the rendered components that can be serialized to JSON. The object should be treated as opaque
 */
exports.getRenderedComponents = function(out) {
    var renderedComponents = getRenderedComponents(out, true);
    return warp10.stringifyPrepare(renderedComponents);
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.serialize = __webpack_require__(35);
exports.stringify = __webpack_require__(36);
exports.parse = __webpack_require__(37);
exports.finalize = __webpack_require__(13);
exports.stringifyPrepare = __webpack_require__(12);

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const markerKey = Symbol('warp10');
const safePropName = /^[$A-Z_][0-9A-Z_$]*$/i;
const isArray = Array.isArray;
const safeJSONRegExp = /<\/|\u2028|\u2029/g;

function safeJSONReplacer(match) {
    if (match === '<\/') {
        return '\\u003C/';
    } else {
        // No string in JavaScript can contain a literal U+2028 (Line separator) or a U+2029 (Paragraph separator)
        // more info: http://timelessrepo.com/json-isnt-a-javascript-subset
        return '\\u' + match.charCodeAt(0).toString(16);
    }
}

function safeJSON(json) {
    return json.replace(safeJSONRegExp, safeJSONReplacer);
}

class Marker {
    constructor(path, symbol) {
        this.path = path;
        this.symbol = symbol;
    }
}

function handleProperty(clone, key, value, valuePath, serializationSymbol, assignments) {
    if (value.constructor === Date) {
        assignments.push(valuePath + '=new Date(' + value.getTime() + ')');
    } else if (isArray(value)) {
        const marker = value[markerKey];

        if (marker && marker.symbol === serializationSymbol) {
            assignments.push(valuePath + '=' + marker.path);
        } else {
            value[markerKey] = new Marker(valuePath, serializationSymbol);
            clone[key] = pruneArray(value, valuePath, serializationSymbol, assignments);
        }
    } else {
        const marker = value[markerKey];
        if (marker && marker.symbol === serializationSymbol) {
            assignments.push(valuePath + '=' + marker.path);
        } else {
            value[markerKey] = new Marker(valuePath, serializationSymbol);
            clone[key] = pruneObject(value, valuePath, serializationSymbol, assignments);
        }
    }
}

function pruneArray(array, path, serializationSymbol, assignments) {
    let len = array.length;

    var clone = new Array(len);

    for (let i=0; i<len; i++) {
        var value = array[i];
        if (value == null) {
            continue;
        }

        if (value && typeof value === 'object') {
            let valuePath = path + '[' + i + ']';
            handleProperty(clone, i, value, valuePath, serializationSymbol, assignments);
        } else {
            clone[i] = value;
        }
    }

    return clone;
}

function pruneObject(obj, path, serializationSymbol, assignments) {
    var clone = {};

    for (var key in obj) {
        var value = obj[key];
        if (value === undefined) {
            continue;
        }

        if (value && typeof value === 'object') {
            let valuePath = path + (safePropName.test(key) ? '.' + key : '[' + JSON.stringify(key) + ']');
            handleProperty(clone, key, value, valuePath, serializationSymbol, assignments);
        } else {
            clone[key] = value;
        }
    }

    return clone;
}

function serializeHelper(obj, safe, varName, additive) {
    /**
     * Performance notes:
     *
     * - It is faster to use native JSON.stringify instead of a custom stringify
     * - It is faster to first prune and then call JSON.stringify with _no_ replacer
     */
    var pruned;

    const assignments = []; // Used to keep track of code that needs to run to fix up the stringified object

    if (typeof obj === 'object') {
        const serializationSymbol = Symbol(); // Used to detect if the marker is associated with _this_ serialization
        const path = '$';

        obj[markerKey] = new Marker(path, serializationSymbol);

        if (obj.constructor === Date) {
            return '(new Date(' + obj.getTime() + '))';
        } else if (isArray(obj)) {
            pruned = pruneArray(obj, path, serializationSymbol, assignments);
        } else {
            pruned = pruneObject(obj, path, serializationSymbol, assignments);
        }
    } else {
        pruned = obj;
    }

    let json = JSON.stringify(pruned);
    if (safe) {
        json = safeJSON(json);
    }

    if (varName) {
        if (additive) {
            let innerCode = 'var $=' + json + '\n';

            if (assignments.length) {
                innerCode += assignments.join('\n') + '\n';
            }

            let code = '(function() {var t=window.' + varName + '||(window.' + varName + '={})\n' + innerCode;

            for (let key in obj) {
                var prop;

                if (safePropName.test(key)) {
                    prop = '.' + key;
                } else {
                    prop = '[' + JSON.stringify(key) + ']';
                }
                code += 't' + prop + '=$' + prop + '\n';
            }

            return code + '}())';
        } else {
            if (assignments.length) {
                return '(function() {var $=' +
                    json + '\n' +
                    assignments.join('\n') +
                    '\nwindow.' + varName + '=$}())';
            } else {
                return 'window.' + varName + '=' + json;
            }
        }
    } else {
        if (assignments.length) {
            return '(function() {var $=' +
                json + '\n' +
                assignments.join('\n') +
                '\nreturn $}())';
        } else {
            return '(' + json + ')';
        }

    }
}

module.exports = function serialize(obj, options) {
    if (obj == null) {
        return 'null';
    }

    var safe;
    var varName;
    var additive;

    if (options) {
        safe = options.safe !== false;
        varName = options.var;
        additive = options.additive === true;
    } else {
        safe = true;
        additive = false;
    }

    return serializeHelper(obj, safe, varName, additive);
};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const stringifyPrepare = __webpack_require__(12);
const escapeEndingScriptTagRegExp = /<\//g;

module.exports = function stringify(obj, options) {
    var safe;

    if (options) {
        safe = options.safe === true;
    } else {
        safe = false;
    }

    var final = stringifyPrepare(obj);

    let json = JSON.stringify(final);
    if (safe) {
        json = json.replace(escapeEndingScriptTagRegExp, '\\u003C/');
    }

    return json;
};

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

var finalize = __webpack_require__(13);

module.exports = function parse(json) {
    if (json === undefined) {
        return undefined;
    }

    var outer = JSON.parse(json);
    return finalize(outer);
};

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

var componentsUtil = __webpack_require__(1);
var componentLookup = componentsUtil.___componentLookup;
var emitLifecycleEvent = componentsUtil.___emitLifecycleEvent;

var ComponentsContext = __webpack_require__(39);
var getComponentsContext = ComponentsContext.___getComponentsContext;
var registry = __webpack_require__(41);
var copyProps = __webpack_require__(15);
var isServer = componentsUtil.___isServer === true;
var beginComponent = __webpack_require__(43);
var endComponent = __webpack_require__(45);

var COMPONENT_BEGIN_ASYNC_ADDED_KEY = '$wa';

function resolveComponentKey(globalComponentsContext, key, parentComponentDef) {
    if (key[0] === '#') {
        return key.substring(1);
    } else {
        return parentComponentDef.id + '-' + parentComponentDef.___nextKey(key);
    }
}

function handleBeginAsync(event) {
    var parentOut = event.parentOut;
    var asyncOut = event.out;
    var componentsContext = parentOut.___components;

    if (componentsContext !== undefined) {
        // We are going to start a nested ComponentsContext
        asyncOut.___components = new ComponentsContext(asyncOut, componentsContext);
    }
    // Carry along the component arguments
    asyncOut.c(
        parentOut.___assignedComponentDef,
        parentOut.___assignedKey,
        parentOut.___assignedCustomEvents);
}

function createRendererFunc(templateRenderFunc, componentProps, renderingLogic) {
    renderingLogic = renderingLogic || {};
    var onInput = renderingLogic.onInput;
    var typeName = componentProps.___type;
    var isSplit = componentProps.___split === true;
    var isImplicitComponent = componentProps.___implicit === true;

    var shouldApplySplitMixins = isSplit;

    return function renderer(input, out) {
        var outGlobal = out.global;

        if (out.isSync() === false) {
            if (!outGlobal[COMPONENT_BEGIN_ASYNC_ADDED_KEY]) {
                outGlobal[COMPONENT_BEGIN_ASYNC_ADDED_KEY] = true;
                out.on('beginAsync', handleBeginAsync);
            }
        }

        var componentsContext = getComponentsContext(out);
        var globalComponentsContext = componentsContext.___globalContext;

        var component = globalComponentsContext.___rerenderComponent;
        var isRerender = component !== undefined;
        var id;
        var isExisting;
        var customEvents;
        var scope;
        var parentComponentDef;

        if (component) {
            // If component is provided then we are currently rendering
            // the top-level UI component as part of a re-render
            id = component.id; // We will use the ID of the component being re-rendered
            isExisting = true; // This is a re-render so we know the component is already in the DOM
            globalComponentsContext.___rerenderComponent = null;
        } else {
            // Otherwise, we are rendering a nested UI component. We will need
            // to match up the UI component with the component already in the
            // DOM (if any) so we will need to resolve the component ID from
            // the assigned key. We also need to handle any custom event bindings
            // that were provided.
            parentComponentDef = componentsContext.___componentDef;
            var componentDefFromArgs;
            if ((componentDefFromArgs = out.___assignedComponentDef)) {
                // console.log('componentArgs:', componentArgs);
                scope = componentDefFromArgs.id;
                out.___assignedComponentDef = null;

                customEvents = out.___assignedCustomEvents;
                var key = out.___assignedKey;

                if (key != null) {
                    id = resolveComponentKey(globalComponentsContext, key.toString(), componentDefFromArgs);
                } else {
                    id = componentDefFromArgs.___nextComponentId();
                }
            } else {
                id = globalComponentsContext.___nextComponentId();
            }
        }

        if (isServer) {
            // If we are rendering on the server then things are simplier since
            // we don't need to match up the UI component with a previously
            // rendered component already mounted to the DOM. We also create
            // a lightweight ServerComponent
            component = registry.___createComponent(
                renderingLogic,
                id,
                input,
                out,
                typeName,
                customEvents,
                scope);

            // This is the final input after running the lifecycle methods.
            // We will be passing the input to the template for the `input` param
            input = component.___updatedInput;

            component.___updatedInput = undefined; // We don't want ___updatedInput to be serialized to the browser
        } else {
            if (!component) {
                if (isRerender && (component = componentLookup[id]) && component.___type !== typeName) {
                    // Destroy the existing component since
                    component.destroy();
                    component = undefined;
                }

                if (component) {
                    isExisting = true;
                } else {
                    isExisting = false;
                    // We need to create a new instance of the component
                    component = registry.___createComponent(typeName, id);

                    if (shouldApplySplitMixins === true) {
                        shouldApplySplitMixins = false;

                        var renderingLogicProps = typeof renderingLogic == 'function' ?
                            renderingLogic.prototype :
                            renderingLogic;

                        copyProps(renderingLogicProps, component.constructor.prototype);
                    }
                }

                // Set this flag to prevent the component from being queued for update
                // based on the new input. The component is about to be rerendered
                // so we don't want to queue it up as a result of calling `setInput()`
                component.___updateQueued = true;

                if (customEvents !== undefined) {
                    component.___setCustomEvents(customEvents, scope);
                }

                if (isExisting === false) {
                    emitLifecycleEvent(component, 'create', input, out);
                }

                input = component.___setInput(input, onInput, out);

                if (isExisting === true) {
                    if (component.___isDirty === false || component.shouldUpdate(input, component.___state) === false) {
                        // We put a placeholder element in the output stream to ensure that the existing
                        // DOM node is matched up correctly when using morphdom. We flag the VElement
                        // node to track that it is a preserve marker
                        out.___preserveComponent(component);
                        globalComponentsContext.___renderedComponentsById[id] = true;
                        component.___reset(); // The component is no longer dirty so reset internal flags
                        return;
                    }
                }
            }

            component.___global = outGlobal;

            emitLifecycleEvent(component, 'render', out);
        }

        var componentDef =
          beginComponent(componentsContext, component, isSplit, parentComponentDef, isImplicitComponent);

        componentDef.___isExisting = isExisting;

        // Render the template associated with the component using the final template
        // data that we constructed
        templateRenderFunc(input, out, componentDef, component, component.___rawState);

        endComponent(out, componentDef);
        componentsContext.___componentDef = parentComponentDef;
    };
}

module.exports = createRendererFunc;

// exports used by the legacy renderer
createRendererFunc.___resolveComponentKey = resolveComponentKey;
createRendererFunc.___handleBeginAsync = handleBeginAsync;


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var GlobalComponentsContext = __webpack_require__(40);

function ComponentsContext(out, parentComponentsContext) {
    var globalComponentsContext;
    var componentDef;

    if (parentComponentsContext) {
        globalComponentsContext = parentComponentsContext.___globalContext;
        componentDef = parentComponentsContext.___componentDef;

        var nestedContextsForParent;
        if (!(nestedContextsForParent = parentComponentsContext.___nestedContexts)) {
            nestedContextsForParent = parentComponentsContext.___nestedContexts = [];
        }

        nestedContextsForParent.push(this);
    } else {
        globalComponentsContext = out.global.___components;
        if (globalComponentsContext === undefined) {
            out.global.___components = globalComponentsContext = new GlobalComponentsContext(out);
        }
    }

    this.___globalContext = globalComponentsContext;
    this.___components = [];
    this.___out = out;
    this.___componentDef = componentDef;
    this.___nestedContexts = undefined;
}

ComponentsContext.prototype = {
    ___initComponents: function(doc) {
        var componentDefs = this.___components;

        ComponentsContext.___initClientRendered(componentDefs, doc);

        this.___out.emit('___componentsInitialized');

        // Reset things stored in global since global is retained for
        // future renders
        this.___out.global.___components = undefined;

        return componentDefs;
    },
};

function getComponentsContext(out) {
    return out.___components || (out.___components = new ComponentsContext(out));
}

module.exports = exports = ComponentsContext;

exports.___getComponentsContext = getComponentsContext;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

var nextComponentIdProvider = __webpack_require__(1).___nextComponentIdProvider;
var KeySequence = __webpack_require__(14);

function GlobalComponentsContext(out) {
    this.___preservedEls = {};
    this.___preservedElBodies = {};
    this.___renderedComponentsById = {};
    this.___rerenderComponent = undefined;
    this.___nextComponentId = nextComponentIdProvider(out);
}

GlobalComponentsContext.prototype = {
    ___createKeySequence: function() {
        return new KeySequence();
    }
};

module.exports = GlobalComponentsContext;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const copyProps = __webpack_require__(15);
const SERVER_WIDGET_KEY = Symbol();
const BaseServerComponent = __webpack_require__(42);

function createServerComponentClass(renderingLogic) {
    var renderingLogicProps = typeof renderingLogic === 'function' ?
        renderingLogic.prototype :
        renderingLogic;

    class ServerComponent extends BaseServerComponent {
    }

    copyProps(renderingLogicProps, ServerComponent.prototype);

    return ServerComponent;
}
function createComponent(renderingLogic, id, input, out, typeName, customEvents, scope) {
    var ServerComponent = renderingLogic[SERVER_WIDGET_KEY];
    if (!ServerComponent) {
        ServerComponent = renderingLogic[SERVER_WIDGET_KEY] = createServerComponentClass(renderingLogic);
    }

    var component = new ServerComponent(id, input, out, typeName, customEvents, scope);
    return component;
}

exports.___isServer = true;
exports.___createComponent = createComponent;


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class ServerComponent {
    constructor(id, input, out, typeName, customEvents, scope) {
        this.id = id;
        this.___customEvents = customEvents;
        this.___scope = scope;
        this.___updatedInput = undefined;
        this.___input = undefined;
        this.___state = undefined;
        this.typeName = typeName;
        this.___bubblingDomEvents = undefined; // Used to keep track of bubbling DOM events for components rendered on the server
        this.___bubblingDomEventsExtraArgsCount = 0;

        if (this.onCreate !== undefined) {
            this.onCreate(input, out);
        }

        if (this.onInput !== undefined) {
            var updatedInput = this.onInput(input, out) || input;

            if (this.___input === undefined) {
                this.___input = updatedInput;
            }

            this.___updatedInput = updatedInput;
        } else {
            this.___input = this.___updatedInput = input;
        }

        if (this.onRender !== undefined) {
            this.onRender(out);
        }
    }

    set input(newInput) {
        this.___input = newInput;
    }

    get input() {
        return this.___input;
    }

    set state(newState) {
        this.___state = newState;
    }

    get state() {
        return this.___state;
    }

    get ___rawState() {
        return this.___state;
    }

    elId(scopedId, index) {
        var id = this.id;

        var elId = scopedId != null ? id + "-" + scopedId : id;

        if (index != null) {
            elId += "[" + index + "]";
        }

        return elId;
    }
}

ServerComponent.prototype.getElId = ServerComponent.prototype.elId;

module.exports = ServerComponent;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const ComponentDef = __webpack_require__(44);
const hasRenderBodyKey = Symbol.for("hasRenderBody");

var FLAG_WILL_RERENDER_IN_BROWSER = 1;
// var FLAG_HAS_BODY_EL = 2;
// var FLAG_HAS_HEAD_EL = 4;

function isInputSerializable(component) {
    var input = component.___input;

    if (!input) {
        return true;
    }

    if (input[hasRenderBodyKey] === true || input.renderBody !== undefined) {
        return false;
    } else {
        return true;
    }
}

module.exports = function beginComponent(componentsContext, component, isSplitComponent, parentComponentDef, isImplicitComponent) {
    var globalContext = componentsContext.___globalContext;

    var componentId = component.id;

    var componentDef = componentsContext.___componentDef = new ComponentDef(component, componentId, globalContext);

    // On the server
    if (parentComponentDef && (parentComponentDef.___flags & FLAG_WILL_RERENDER_IN_BROWSER)) {
        componentDef.___flags |= FLAG_WILL_RERENDER_IN_BROWSER;
        return componentDef;
    }

    if (isImplicitComponent === true) {
        // We don't mount implicit components rendered on the server
        // unless the implicit component is nested within a UI component
        // that will re-render in the browser
        return componentDef;
    }

    componentsContext.___components.push(componentDef);

    let out = componentsContext.___out;

    componentDef.___renderBoundary = true;

    if (isSplitComponent === false &&
        out.global.noBrowserRerender !== true &&
        isInputSerializable(component)) {
        componentDef.___flags |= FLAG_WILL_RERENDER_IN_BROWSER;
        out.w('<!--M#' + componentId + '-->');
    } else {
        out.w('<!--M^' + componentId + '-->');
    }

    return componentDef;
};


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var repeatedRegExp = /\[\]$/;
var componentUtil = __webpack_require__(1);
var attachBubblingEvent = componentUtil.___attachBubblingEvent;
var extend = __webpack_require__(0);
var KeySequence = __webpack_require__(14);

/*
var FLAG_WILL_RERENDER_IN_BROWSER = 1;
var FLAG_HAS_BODY_EL = 2;
var FLAG_HAS_HEAD_EL = 4;
*/

/**
 * A ComponentDef is used to hold the metadata collected at runtime for
 * a single component and this information is used to instantiate the component
 * later (after the rendered HTML has been added to the DOM)
 */
function ComponentDef(component, componentId, globalComponentsContext) {
    this.___globalComponentsContext = globalComponentsContext; // The AsyncWriter that this component is associated with
    this.___component = component;
    this.id = componentId;

    this.___domEvents = undefined;         // An array of DOM events that need to be added (in sets of three)

    this.___isExisting = false;

    this.___renderBoundary = false;
    this.___flags = 0;

    this.___nextIdIndex = 0; // The unique integer to use for the next scoped ID

    this.___keySequence = null;

    this.___preservedDOMNodes = null;
}

ComponentDef.prototype = {

    ___nextKey: function(key) {
        var keySequence = this.___keySequence || (this.___keySequence = new KeySequence());
        return keySequence.___nextKey(key);
    },

    ___preserveDOMNode: function(key, bodyOnly) {
        var lookup = this.___preservedDOMNodes || (this.___preservedDOMNodes = {});
        lookup[key] = bodyOnly ? 2 : 1;
    },

    /**
     * This helper method generates a unique and fully qualified DOM element ID
     * that is unique within the scope of the current component. This method prefixes
     * the the nestedId with the ID of the current component. If nestedId ends
     * with `[]` then it is treated as a repeated ID and we will generate
     * an ID with the current index for the current nestedId.
     * (e.g. "myParentId-foo[0]", "myParentId-foo[1]", etc.)
     */
    elId: function (nestedId) {
        var id = this.id;
        if (nestedId == null) {
            return id;
        } else {
            if (typeof nestedId == 'string' && repeatedRegExp.test(nestedId)) {
                return this.___globalComponentsContext.___nextRepeatedId(id, nestedId);
            } else {
                return id + '-' + nestedId;
            }
        }
    },
    /**
     * Registers a DOM event for a nested HTML element associated with the
     * component. This is only done for non-bubbling events that require
     * direct event listeners to be added.
     * @param  {String} type The DOM event type ("mouseover", "mousemove", etc.)
     * @param  {String} targetMethod The name of the method to invoke on the scoped component
     * @param  {String} elId The DOM element ID of the DOM element that the event listener needs to be added too
     */
     e: function(type, targetMethod, elId, extraArgs) {
        if (targetMethod) {
            // The event handler method is allowed to be conditional. At render time if the target
            // method is null then we do not attach any direct event listeners.
            (this.___domEvents || (this.___domEvents = [])).push([
                type,
                targetMethod,
                elId,
                extraArgs]);
        }
    },
    /**
     * Returns the next auto generated unique ID for a nested DOM element or nested DOM component
     */
    ___nextComponentId: function() {
        return this.id + '-c' + (this.___nextIdIndex++);
    },

    d: function(handlerMethodName, extraArgs) {
        return attachBubblingEvent(this, handlerMethodName, extraArgs);
    },

    get ___type() {
        return this.___component.___type;
    }
};

ComponentDef.___deserialize = function(o, types, globals, registry) {
    var id        = o[0];
    var typeName  = types[o[1]];
    var input     = o[2];
    var extra     = o[3];

    var state = extra.s;
    var componentProps = extra.w;

    var component = typeName /* legacy */ && registry.___createComponent(typeName, id);

    if (extra.b) {
        component.___bubblingDomEvents = extra.b;
    }

    // Preview newly created component from being queued for update since we area
    // just building it from the server info
    component.___updateQueued = true;

    if (state) {
        var undefinedPropNames = extra.u;
        if (undefinedPropNames) {
            undefinedPropNames.forEach(function(undefinedPropName) {
                state[undefinedPropName] = undefined;
            });
        }
        // We go through the setter here so that we convert the state object
        // to an instance of `State`
        component.state = state;
    }

    component.___input = input;

    if (componentProps) {
        extend(component, componentProps);
    }

    var scope = extra.p;
    var customEvents = extra.e;
    if (customEvents) {
        component.___setCustomEvents(customEvents, scope);
    }

    component.___global = globals;

    return {
        id: id,
        ___component: component,
        ___boundary: extra.r,
        ___domEvents: extra.d,
        ___flags: extra.f || 0
    };
};

module.exports = ComponentDef;


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function endComponent(out, componentDef) {
    if (componentDef.___renderBoundary) {
        out.w('<!--M/' + componentDef.id + '-->');
    }
};


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var isArray = Array.isArray;

function isFunction(arg) {
    return typeof arg == 'function';
}

function classList(arg, classNames) {
    var len;

    if (arg) {
        if (typeof arg == 'string') {
            if (arg) {
                classNames.push(arg);
            }
        } else if (typeof (len = arg.length) == 'number') {
            for (var i=0; i<len; i++) {
                classList(arg[i], classNames);
            }
        } else if (typeof arg == 'object') {
            for (var name in arg) {
                if (arg.hasOwnProperty(name)) {
                    var value = arg[name];
                    if (value) {
                        classNames.push(name);
                    }
                }
            }
        }
    }
}

function createDeferredRenderer(handler) {
    function deferredRenderer(input, out) {
        deferredRenderer.renderer(input, out);
    }

    // This is the initial function that will do the rendering. We replace
    // the renderer with the actual renderer func on the first render
    deferredRenderer.renderer = function(input, out) {
        var rendererFunc = handler.renderer || handler._ || handler.render;
        if (!isFunction(rendererFunc)) {
            throw Error('Invalid renderer');
        }
        // Use the actual renderer from now on
        deferredRenderer.renderer = rendererFunc;
        rendererFunc(input, out);
    };

    return deferredRenderer;
}

function resolveRenderer(handler) {
    var renderer = handler.renderer || handler._;

    if (renderer) {
        return renderer;
    }

    if (isFunction(handler)) {
        return handler;
    }

    // If the user code has a circular function then the renderer function
    // may not be available on the module. Since we can't get a reference
    // to the actual renderer(input, out) function right now we lazily
    // try to get access to it later.
    return createDeferredRenderer(handler);
}

var helpers = {
    /**
     * Internal helper method to prevent null/undefined from being written out
     * when writing text that resolves to null/undefined
     * @private
     */
    s: function strHelper(str) {
        return (str == null) ? '' : str.toString();
    },

    /**
     * Internal helper method to handle loops without a status variable
     * @private
     */
    f: function forEachHelper(array, callback) {
        if (isArray(array)) {
            for (var i=0; i<array.length; i++) {
                callback(array[i]);
            }
        } else if (isFunction(array)) {
            // Also allow the first argument to be a custom iterator function
            array(callback);
        }
    },

    /**
     * Helper to load a custom tag
     */
    t: function loadTagHelper(renderer, targetProperty, isRepeated) {
        if (renderer) {
            renderer = resolveRenderer(renderer);
        }

        return function wrappedRenderer(input, out, componentDef, key, customEvents) {
            out.c(componentDef, key, customEvents);
            renderer(input, out);
            out.___assignedComponentDef = null;
        };
    },

    /**
     * classList(a, b, c, ...)
     * Joines a list of class names with spaces. Empty class names are omitted.
     *
     * classList('a', undefined, 'b') --> 'a b'
     *
     */
    cl: function classListHelper() {
        var classNames = [];
        classList(arguments, classNames);
        return classNames.join(' ');
    }
};

module.exports = helpers;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__filename) {// Compiled using marko@4.5.6 - DO NOT EDIT


var marko_template = module.exports = __webpack_require__(3).t(__filename),
    components_helpers = __webpack_require__(11),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/awly$1.0.0/src/components/dynamodb/index.marko", function() {
      return module.exports;
    }),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_helpers = __webpack_require__(16),
    marko_escapeXml = marko_helpers.x,
    marko_forEach = marko_helpers.f,
    marko_loadTag = marko_helpers.t,
    await_tag = marko_loadTag(__webpack_require__(48));

var marko_template = module.exports = __webpack_require__(3).t(__filename);

// var apollo = require("apollo-server-lambda");
var runGraphQL = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"src/services/graphql\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

function render(input, out, __component, component, state) {
  var data = input;

  var postsPromise = [];
  var test = 'PANDEMIC';
  
  var postsPromise = new Promise((resolve, reject) => {
       runGraphQL(
           `query P{
             posts {
               id, title, bodyContent
             }
           }`, function(err, result){
               if(err) throw err;
               resolve(result.data.posts);
           }
       );
  });

  out.w("<div class=\"count\">dynamodb<br>" +
    marko_escapeXml(test));

  await_tag({
      _dataProvider: postsPromise,
      _name: "postsPromise",
      renderBody: function renderBody(out, posts) {
        marko_forEach(posts, function(post) {
          out.w("<div>" +
            marko_escapeXml(post.id) +
            " - " +
            marko_escapeXml(post.title) +
            " - " +
            marko_escapeXml(post.bodyContent) +
            "</div>");
        });
      }
    }, out, __component, "2");

  out.w("</div>");
}

marko_template._ = marko_renderer(render, {
    ___implicit: true,
    ___type: marko_componentType
  });

marko_template.Component = marko_defineComponent({}, marko_template._);

marko_template.meta = {
    deps: [
      {
          type: "css",
          code: ".count {\n        color:#09c;\n        font-size:3em;\n    }",
          virtualPath: "./index.marko.css",
          path: "./index.marko"
        }
    ],
    tags: [
      "marko/src/taglibs/async/await-tag"
    ]
  };

/* WEBPACK VAR INJECTION */}.call(exports, "/index.js"))

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var isClientReorderSupported = __webpack_require__(49).isSupported;
var AsyncValue = __webpack_require__(52);

function safeRenderBody(renderBody, targetOut, data) {
    try {
        renderBody(targetOut, data);
    } catch(err) {
        return err;
    }
}

function requestData(provider, args, thisObj, timeout) {
    var asyncValue = new AsyncValue();

    if (typeof provider === 'function') {
        var callback = function(err, data) {
            if (err) {
                asyncValue.___reject(err);
            } else {
                asyncValue.___resolve(data);
            }
        };

        var value = (provider.length === 1) ?
            // one argument so only provide callback to function call
            provider.call(thisObj, callback) :
            // two arguments so provide args and callback to function call
            provider.call(thisObj, args, callback);

        if (value !== undefined) {
            asyncValue.___resolve(value);
        }
    } else {
        // Assume the provider is a data object...
        asyncValue.___resolve(provider);
    }

    if (timeout == null) {
        timeout = 10000;
    }

    if (timeout > 0) {
        var timeoutId = setTimeout(function() {
            timeoutId = null;
            var error = new Error('Timed out after ' + timeout + 'ms');
            error.code = 'ERR_AWAIT_TIMEDOUT';
            asyncValue.___reject(error);
        }, timeout);

        asyncValue.___done(function(err, data) {
            if (timeoutId != null) {
                clearTimeout(timeoutId);
            }
        });
    }

    return asyncValue;
}

const LAST_OPTIONS = { last: true, name: 'await:finish' };

module.exports = function awaitTag(input, out) {

    var arg = input.arg || {};
    arg.out = out;

    var clientReorder = isClientReorderSupported && input.clientReorder === true && !out.isVDOM;

    var name = input.name || input._name;
    var scope = input.scope || this;
    var method = input.method;
    var timeout = input.timeout;
    var dataProvider = input._dataProvider;
    if (method) {
        dataProvider = dataProvider[method].bind(dataProvider);
    }

    var asyncValue = requestData(dataProvider, arg, scope, timeout);

    if (asyncValue.___settled) {
        // No point in using client-reordering if the data was fetched
        // synchronously
        clientReorder = false;
    }

    var asyncOut;
    var clientReorderContext;

    var awaitInfo = {
        name: name,
        clientReorder: clientReorder,
        dataProvider: dataProvider
    };

    if (clientReorder) {
        awaitInfo.after = input.showAfter;

        clientReorderContext = out.global.___clientReorderContext ||
            (out.global.___clientReorderContext = {
                instances: [],
                nextId: 0
            });

        var id = awaitInfo.id = input.name || (clientReorderContext.nextId++);
        var placeholderIdAttrValue = 'afph' + id;

        if (input.renderPlaceholder) {
            out.write('<span id="' + placeholderIdAttrValue + '">');
            input.renderPlaceholder(out);
            out.write('</span>');
        } else {
            out.write('<noscript id="' + placeholderIdAttrValue + '"></noscript>');
        }

        // If `client-reorder` is enabled then we asynchronously render the await instance to a new
        // "out" instance so that we can Write to a temporary in-memory buffer.
        asyncOut = awaitInfo.out = out.createOut();

        var oldEmit = asyncOut.emit;

        // Since we are rendering the await instance to a new and separate out,
        // we want to proxy any child events to the main AsyncWriter in case anyone is interested
        // in those events. This is also needed for the following events to be handled correctly:
        //
        // - await:begin
        // - await:beforeRender
        // - await:finish
        //
        asyncOut.emit = function(event) {
            if (event !== 'finish' && event !== 'error') {
                // We don't want to proxy the finish and error events since those are
                // very specific to the AsyncWriter associated with the await instance
                out.emit.apply(out, arguments);
            }

            oldEmit.apply(asyncOut, arguments);
        };

        if (clientReorderContext.instances) {
            clientReorderContext.instances.push(awaitInfo);
        }

        out.emit('await:clientReorder', awaitInfo);
    } else {
        asyncOut = awaitInfo.out =  out.beginAsync({
            timeout: 0, // We will use our code for controlling timeout
            name: name
        });
    }

    var beforeRenderEmitted = false;

    out.emit('await:begin', awaitInfo);

    function renderBody(err, data) {
        if (awaitInfo.finished) {
            return;
        }

        if (err) {
            awaitInfo.error = err;
        }

        if (!beforeRenderEmitted) {
            beforeRenderEmitted = true;
            out.emit('await:beforeRender', awaitInfo);
        }

        if (err) {
            if (err.code === 'ERR_AWAIT_TIMEDOUT' && input.renderTimeout) {
                input.renderTimeout(asyncOut);
            } else if (input.renderError) {
                console.error('Await (' + name + ') failed. Error:', (err.stack || err));
                input.renderError(asyncOut);
            } else {
                asyncOut.error(err);
            }
        } else {
            var renderBodyFunc = input.renderBody;
            if (renderBodyFunc) {
                var renderBodyErr = safeRenderBody(renderBodyFunc, asyncOut, data);
                if (renderBodyErr) {
                    return renderBody(renderBodyErr);
                }
            }
        }

        awaitInfo.finished = true;

        if (clientReorder) {
            asyncOut.end();
            out.flush();
        } else {
            // When using client reordering we want to delay
            // this event until after the code to move
            // the async fragment into place has been written
            var asyncLastOut = asyncOut.beginAsync(LAST_OPTIONS);
            asyncOut.onLast(function() {
                var oldWriter = asyncOut.writer;
                // We swap out the writer so that writing will happen to our `asyncLastOut`
                // even though we are still passing along the original `asyncOut`. We have
                // to pass along the original `asyncOut` because that has contextual
                // information (such as the rendered UI components)
                asyncOut.writer = asyncLastOut.writer;
                out.emit('await:finish', awaitInfo);
                asyncOut.writer = oldWriter;
                asyncLastOut.end();
                out.flush();
            });

            asyncOut.end();
        }
    }


    asyncValue.___done(renderBody);
};


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

var code;
var fs = __webpack_require__(50);

exports.isSupported = true;

exports.getCode = function() {
    if (!code) {
        code = fs.readFileSync(/*require.resolve*/(51), 'utf8');
        code = '<script type="text/javascript">' + code + '</script>';
    }
    return code;
};

/***/ }),
/* 50 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 51 */
/***/ (function(module, exports) {

function $af(d,a,e,l,g,h,k,b,f,c){c=$af;if(a&&!c[a])(c[a+="$"]||(c[a]=[])).push(d);else{e=document;l=e.getElementById("af"+d);g=e.getElementById("afph"+d);h=e.createDocumentFragment();k=l.childNodes;b=0;for(f=k.length;b<f;b++)h.appendChild(k.item(0));g.parentNode.replaceChild(h,g);c[d]=1;if(a=c[d+"$"])for(b=0,f=a.length;b<f;b++)c(a[b])}};

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

var nextTick = __webpack_require__(53);

function AsyncValue(options) {
    /**
     * The data that was provided via call to resolve(data).
     * This property is assumed to be public and available for inspection.
     */
    this.___value = undefined;

    /**
     * The data that was provided via call to reject(err)
     * This property is assumed to be public and available for inspection.
     */
    this.___error = undefined;

    /**
     * The queue of callbacks that are waiting for data
     */
    this.___callbacks = undefined;

    /**
     * The state of the data holder (STATE_INITIAL, STATE_RESOLVED, or STATE_REJECTED)
     */
    this.___settled = false;
}

function notifyCallbacks(asyncValue, err, value) {
    var callbacks = asyncValue.___callbacks;
    if (callbacks) {
        // clear out the registered callbacks (we still have reference to the original value)
        asyncValue.___callbacks = undefined;

        // invoke all of the callbacks and use their scope
        for (var i = 0; i < callbacks.length; i++) {
            // each callback is actually an object with "scope and "callback" properties
            var callback = callbacks[i];
            callback(err, value);
        }
    }
}

AsyncValue.prototype = {
    /**
     * Adds a callback to the queue. If there is not a pending request to load data
     * and we have a "loader" then we will use that loader to request the data.
     * The given callback will be invoked when there is an error or resolved data
     * available.
     */
    ___done: function(callback) {

        // Do we already have data or error?
        if (this.___settled) {
            // invoke the callback immediately
            return callback(this.___error, this.___value);
        }

        var callbacks = this.___callbacks || (this.___callbacks = []);
        callbacks.push(callback);
    },

    /**
     * This method will trigger any callbacks to be notified of rejection (error).
     * If this data holder has a loader then the data holder will be returned to
     * its initial state so that any future requests to load data will trigger a
     * new load call.
     */
    ___reject: function(err) {
        if (this.___settled) {
            return;
        }

        // remember the error
        this.___error = err;

        // Go to the rejected state if we don't have a loader.
        // If we do have a loader then return to the initial state
        // (we do this so that next call to done() will trigger load
        // again in case the error was transient).
        this.___settled = true;

        // always notify callbacks regardless of whether or not we return to the initial state
        notifyCallbacks(this, err, null);
    },

    /**
     * This method will trigger any callbacks to be notified of data.
     */
    ___resolve: function (value) {
        if (this.___settled) {
            return;
        }

        if (value && typeof value.then === 'function') {
            var asyncValue = this;

            var finalPromise = value
                .then(
                    function onFulfilled(value) {
                        nextTick(asyncValue.___resolve.bind(asyncValue, value));
                    },
                    function onRejected(err) {
                        nextTick(asyncValue.___reject.bind(asyncValue, err));
                    });

            if (finalPromise.done) {
                finalPromise.done();
            }
        } else {
            // remember the state
            this.___value = value;

            // go to the resolved state
            this.___settled = true;

            // notify callbacks
            notifyCallbacks(this, null, value);
        }
    }
};

module.exports = AsyncValue;


/***/ }),
/* 53 */
/***/ (function(module, exports) {

module.exports = process.nextTick;


/***/ }),
/* 54 */
/***/ (function(module, exports) {


function doInclude(input, out, throwError) {
    var target = input._target;
    var arg = input._arg || input;

    if (target) {
        if (typeof target === 'function') {
            return target(out, arg), true;
        } else if (typeof target === 'string') {
            return (target && out.text(target)), true;
        } else if (typeof target === 'object') {
            if (target.renderBody) {
                return target.renderBody(out, arg), true;
            } else if (target.renderer) {
                return target.renderer(arg, out), true;
            } else if (target.render) {
                return target.render(arg, out), true;
            } else if (target.safeHTML) {
                return out.write(target.safeHTML), true;
            } else {
                if (throwError) {
                    out.error('Invalid include target');
                }
            }
        }
    }
}

function includeTag(input, out) {
    doInclude(input, out, true);
}

includeTag.___doInclude = doInclude;

module.exports = includeTag;


/***/ })
/******/ ]);