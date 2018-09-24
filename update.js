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
 * Also `spec` can be an object with field 'widget':
 * {
 *   widget: 'Foo', // widget name will be casted to string
 *   ...  // other fields are optional and specific for each widget
 * }
 * By convention widget name must start with capital letter A-Z.
 * Function with corresponding name must be defined in namespace `$`.
 * Widget function recives this object as argument and returns `spec`.
 *
 * Other values like string, numbers, etc. produce textNodes,
 */

(function(w) {
  var $ = w.$ = w.$ || {}, d = w.document, _;

  $.update = update;
  $.arr = arr;
  $.obj = obj;

  /* Any to array */
  function arr(a) { return Array.isArray(a) ? a : a == null ? [] : [a] }

  /* Any to object */
  function obj(o) { return o == null ? {} : o }

  /* Fall back option for non existent widgets */
  function error(model) { w.console.error('Widget not found', model) }

  /* Handle callback or empty spec */
  function update(spec, node, callback) {
    if (typeof callback === 'function') w.setTimeout(callback, 0);
    return spec == null ?
        textNode('', node) : handleWidget(spec, node, '' + spec.widget);
  }

  /* Handle cases when spec is widget or tag ot text */
  function handleWidget(spec, node, wn) {
    return wn[0] >= 'A' && wn[0] <= 'Z' ?
        spec.__ref = update(($[wn] || error)(spec), node) :
        spec.name ? updateNode(spec, node) : textNode('' + spec, node);
  }

  /* Process node, attributes, properties, etc. */
  function updateNode(next, node) {
    node = getOrCreate(next, node, ('' + next.name).toLowerCase());
    updateProps(node, next, obj(node.__spec));
    return node;
  }

  /* Create a new node with nodeName or return existent node */
  function getOrCreate(spec, node, nn) {
    return node && (node.nodeName.toLowerCase() === nn) ? node :
        spec.xmlns ? d.createElementNS(spec.xmlns, nn) : d.createElement(nn);
  }

  function updateProps(e, n, p) {
    attrs(e, obj(n.attrs), obj(p.attrs));
    nodes(e, arr(n.nodes), e.childNodes);
    props(e, obj(n.props), obj(p.props));
    events(e, obj(n.events), obj(p.events));
    e.__spec = n;
  }

  function attrs(e, n, p, k) {
    for (k in p) { if (n[k] === _) e.removeAttribute(k) }
    for (k in n) { if (n[k] !== p[k]) e.setAttribute(k, n[k]) }
  }

  function props(e, n, p, k) {
    for (k in p) { if (n[k] === _) e[k] = null }
    for (k in n) { if (n[k] !== p[k]) e[k] = n[k] }
  }

  function events(e, n, p, k) {
    for (k in p) { if (n[k] !== p[k]) e.removeEventListener(k, p[k]) }
    for (k in n) { if (n[k] !== p[k]) e.addEventListener(k, n[k]) }
  }

  function nodes(e, n, p, nn, i) {
    for (i = 0; i < n.length; i++) {
      nn = update(n[i], p[i]);
      if (nn !== p[i]) e.insertBefore(nn, p[i]);
    }
    while (p[i]) e.removeChild(p[i]);
  }

  function textNode(v, n) {
    return n && n.nodeType === 3 ?
        (n.nodeValue !== v && (n.nodeValue = v), n) : d.createTextNode(v);
  }
})(this);
