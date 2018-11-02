'use strict';

/**
 * Updates or creates DOM tree recursively from a tree of specifications.
 *
 * A specification is explicit description of DOM node:
 * {
 *   name:   string,           // tag name
 *   attrs:  {name: value},    // attributes
 *   props:  {name: value},    // properties
 *   events: {name: handler},  // event handlers
 *   xmlns:  string            // namespace for SVG, MATHML, etc.
 *   nodes:  any,              // specs for child nodes
 * }
 *
 * For convenience `spec` can be an object with field 'widget':
 * {
 *   widget: 'Foo', // widget name
 *   ...  // other fields are optional and specific for the widget
 * }
 *
 * By convention widget name starts with capital letter A-Z.
 * Function with corresponding name is expected in namespace `$`.
 * Widget function recives this object as argument and returns `spec`.
 *
 * Other values like strings, booleans, numbers, etc. produce textNodes.
 */

(function(w) {
  /* Namespace */
  var $ = w.$ = w.$ || {};

  /* Link to `document` */
  var d = w.document;

  /* Shorthand for `undefined` */
  var _;

  /* Export functions */
  $.update = external;
  $.arr = arr;
  $.obj = obj;

  /**
   * Handles external calls with optional callback.
   *
   * Implements call of `fn` after execution of all rendering.
   *
   * @param {Object} spec A description of the new element.
   *
   * @param {DOM Node} node A DOM node.
   *
   * @param {Function} fn An optional callback function.
   *
   * @return {DOM Node} A DOM node according to the `spec`.
   */
  function external(spec, node, fn) {
    if (typeof fn === 'function') w.setTimeout(after(fn), 0);
    return update(spec, node);
  }

  /**
   * Handles recursive internal calls to render subtree.
   *
   * @param {Object} spec A description of the new element.
   *
   * @param {DOM Node} node A DOM node.
   *
   * @return {DOM Node} A DOM node according to the `spec`.
   */
  function update(spec, node) {
    return spec == null ? text('', node) : widget(spec, node, str(spec.widget));
  }

  /**
   * Handles cases when spec is widget or tag ot text.
   *
   * @param {Object} spec A description of the new element.
   *
   * @param {DOM Node} node A DOM node.
   *
   * @param {String} name A widget name.
   *
   * @return {DOM Node} A DOM node according to the `spec`.
   */
  function widget(spec, node, name) {
    return name[0] >= 'A' && name[0] <= 'Z' ?
        spec.__ref = update(($[name] || error)(spec), node) :
        spec.name ? updateNode(spec, node) : text(str(spec), node);
  }

  /**
   * Updates a single node.
   *
   * @param {Object} next A spec for the new node.
   *
   * @param {DOM Node} node A DOM node.
   *
   * @return {DOM Node} A DOM node according to the `spec`.
   */
  function updateNode(next, node) {
    node = getOrCreate(node, str(next.name).toLowerCase(), next.xmlns);
    return updateProps(node, next, obj(node.__spec));
  }

  /**
   * Defines if we can reuse the existent node or create a new one.
   *
   * Existent HTML element can be reused if node exists and name of the node
   * is the same as name in the specification for new element.
   *
   * @param {DOM HTMLElement} node Existent DOM node.
   *
   * @param {String} nn Name in lowercase for the new node.
   *
   * @param {String} ns Namespace for the new node.
   *
   * @return {DOM HTMLElement} node to use.
   */
  function getOrCreate(node, nn, ns) {
    return node && (node.nodeName.toLowerCase() === nn) ? node : create(ns, nn);
  }

  /**
   * Creates an HTML Element with namespace if applicable.
   *
   * @param {String} ns A namespace, optional.
   *
   * @param {String} nn A node name.
   *
   * @return {DOM Node} DOM HTMLElement.
   */
  function create(ns, nn) {
    return ns ? d.createElementNS(ns, nn) : d.createElement(nn);
  }

  /**
   * Updates properties of an HTMLElement.
   *
   * It is important to update child nodes before properties
   * to handle cases like property `selectedIndex` of an `HTMLSelectElement`.
   *
   * @param {DOM HTMLElement} e An HTML element.
   *
   * @param {Object} n A next spec.
   *
   * @param {Object} p A previous spec.
   *
   * @return {DOM HTMLElement}
   */
  function updateProps(e, n, p) {
    attrs(e, obj(n.attrs), obj(p.attrs));
    nodes(e, arr(n.nodes), e.childNodes);
    props(e, obj(n.props), obj(p.props));
    events(e, obj(n.events), obj(p.events));
    e.__spec = n;
    return e;
  }

  /**
   * Updates attributes of an HTMLElement.
   *
   * Removes only attributes explicitly described in previous spec.
   *
   * @param {DOM HTMLElement} e An HTML element.
   *
   * @param {Object} n A next spec.
   *
   * @param {Object} p A previous spec.
   *
   * @param {void} k Used to iterate over object.
   *
   * @return {void}
   */
  function attrs(e, n, p, k) {
    for (k in p) { if (n[k] === _) e.removeAttribute(k) }
    for (k in n) { if (n[k] !== p[k]) e.setAttribute(k, n[k]) }
  }


  /**
   * Updates properties of an HTMLElement.
   *
   * Removes only properties explicitly described in previous spec.
   *
   * @param {DOM HTMLElement} e An HTML element.
   *
   * @param {Object} n A next spec.
   *
   * @param {Object} p A previous spec.
   *
   * @param {void} k Used to iterate over object.
   *
   * @return {void}
   */
  function props(e, n, p, k) {
    for (k in p) { if (n[k] === _) e[k] = null }
    for (k in n) { if (n[k] !== p[k]) e[k] = n[k] }
  }


  /**
   * Updates event listeners of an HTMLElement.
   *
   * Removes only listeners explicitly described in previous spec.
   *
   * @param {DOM HTMLElement} e An HTML element.
   *
   * @param {Object} n A next spec.
   *
   * @param {Object} p A previous spec.
   *
   * @param {void} k Used to iterate over object.
   *
   * @return {void}
   */
  function events(e, n, p, k) {
    for (k in p) { if (n[k] !== p[k]) e.removeEventListener(k, p[k]) }
    for (k in n) { if (n[k] !== p[k]) e.addEventListener(k, n[k]) }
  }


  /**
   * Updates child nodes of an HTMLElement.
   *
   * @param {DOM HTMLElement} e An HTML element.
   *
   * @param {Object} n A next spec.
   *
   * @param {Object} p A previous spec.
   *
   * @param {void} nn Used to hold the new node.
   *
   * @param {void} i Used to iterate through child nodes.
   *
   * @return {void}
   */
  function nodes(e, n, p, nn, i) {
    for (i = 0; i < n.length; i++) {
      nn = update(n[i], p[i]);
      if (nn !== p[i]) e.insertBefore(nn, p[i]);
    }
    while (p[i]) e.removeChild(p[i]);
  }

  /**
   * Updates or creates a DOM TextNode with the value.
   *
   * @param {any} v Any value.
   *
   * @param {DOM Node} n Optional existent node.
   *
   * @return {DOM TextNode} A DOM text node with value of v.
   */
  function text(v, n) {
    return n && n.nodeType === 3 ?
        (n.nodeValue !== v && (n.nodeValue = v), n) : d.createTextNode(v);
  }

  /**
   * Any to array.
   *
   * Converts any value to array.
   * May be used to unify case with single object vs array.
   *
   * @param {any} a Any value.
   *
   * @return {Array}
   */
  function arr(a) { return Array.isArray(a) ? a : a == null ? [] : [a] }

  /**
   * Any to object.
   *
   * Replaces `null` and `undefined` with empty object.
   * May be used to access properties without errors handling.
   *
   * @param {any} a Any value.
   *
   * @return {any} except `null` or `undefined`.
   */
  function obj(o) { return o === null || o === _ ? {} : o }

  /**
   * Any to string.
   *
   * @param {any} s Any object.
   *
   * @return {String} The string representing the object.
   */
  function str(s) { return '' + s }

  /**
   * Handles non existent widgets.
   *
   * @param {Object} model Any object.
   *
   * @return {void}
   */
  function error(model) { w.console.error('Widget not found', model) }

  /**
   * Calls a function after rendering ends.
   *
   * We call `d.body.clientWidth` before the function call to make sure
   * that browser has completed rendering of all elements.
   *
   * @param {Function} fn A function to call.
   *
   * @return {Function} Wrapper of the original function.
   */
  function after(fn) { return function() { d.body.clientWidth && fn() } }
})(this);
