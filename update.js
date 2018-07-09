'use strict';

/**
 * Update or create DOM tree recursively from spec
 *
 * The `spec` is explicit description of DOM node:
 * {
 *   name:   string,           // tag name
 *   attrs:  {name: value},    // attributes
 *   props:  {name: value},    // properties
 *   events: {name: handler},  // event handlers
 *   xmlns:  string            // namespace for SVG, MATHML etc.
 *   nodes:  any,              // specs for child nodes
 * }
 *
 * Also `spec` can be plain object with field 'widget':
 * {
 *   widget: 'Foo', // widget name will be casted to string
 *   ...            // other fields are optional and specific for widget
 * }
 * By convention widget name must start with capital letter A-Z.
 * Function with corresponding name must be defined in namespace `$`.
 * Widget function recives this object as argument and returns `spec`.
 *
 * Other values like string, numbers, etc. produce textNodes,
 */

(function(w) {
  var $ = w.$ = w.$ || {};
  var d = w.document;
  $.update = update;
  $.arr = arr;
  $.obj = obj;

  /* Any to array */
  function arr(a) {return Array.isArray(a) ? a : a == null ? [] : [a]}

  /* Any to object */
  function obj(o) {return o == null ? {} : o}

  /* Fall back option for non existent widgets */
  function error(model) {w.console.error('Widget not found', model)}

  /* Update or create node from spec */
  function update(spec, node, callback) {
    if (typeof callback === 'function') {
      w.setTimeout(callback, 0);
    }
    if (spec == null) {
      return text('', node);
    }
    var wn = '' + spec.widget;
    if (wn[0] >= 'A' && wn[0] <= 'Z') {
      return spec.__ref = update(($[wn] || error)(spec), node);
    }
    if (spec.name) {
      return updateNode(spec, node);
    }
    return text('' + spec, node);
  };

  function updateNode(next, node) {
    var prev = {};
    var nodeName = ('' + next.name).toLowerCase();

    if (node && (node.nodeName.toLowerCase() === nodeName)) {
      prev = $.obj(node.__spec);
    } else {
      node = next.xmlns ?
          d.createElementNS(next.xmlns, nodeName) :
          d.createElement(nodeName);
    }

    attributes(node, obj(next.attrs), obj(prev.attrs));
    childNodes(node, arr(next.nodes), node.childNodes);
    properties(node, obj(next.props), obj(prev.props));
    nodeEvents(node, obj(next.events), obj(prev.events));
    node.__spec = next;
    return node;
  };

  function attributes(elt, nextAttrs, prevAttrs) {
    var name;
    for (name in prevAttrs) if (nextAttrs[name] === void 0) {
      elt.removeAttribute(name);
    }
    for (name in nextAttrs) if (nextAttrs[name] !== prevAttrs[name]) {
      elt.setAttribute(name, nextAttrs[name]);
    }
  }

  function properties(elt, nextProps, prevProps) {
    var name;
    for (name in prevProps) if (nextProps[name] === void 0) {
      elt[name] = null;
    }
    for (name in nextProps) {
      elt[name] = nextProps[name];
    }
  }

  function nodeEvents(elt, nextEvents, prevEvents) {
    var name;
    for (name in prevEvents) if (nextEvents[name] !== prevEvents[name]) {
      elt.removeEventListener(name, prevEvents[name]);
    }
    for (name in nextEvents) if (nextEvents[name] !== prevEvents[name]) {
      elt.addEventListener(name, nextEvents[name]);
    }
  }

  function childNodes(elt, nextNodes, nodes) {
    var i, node;
    for (i = 0; i < nextNodes.length; i++) {
      node = update(nextNodes[i], nodes[i]);
      if (node !== nodes[i]) elt.insertBefore(node, nodes[i]);
    }
    while (nodes[i]) {
      elt.removeChild(nodes[i]);
    }
  }

  function text(str, node) {
    if (node && node.nodeType === 3) {
      if (node.nodeValue !== str) node.nodeValue = str;
      return node;
    }
    return d.createTextNode(str);
  }
})(this);
