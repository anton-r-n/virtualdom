// prettier-ignore

'use strict';

(function(w) {
  /* Namespace, document, and undefined shortcuts */
  var $ = (w.$ = w.$ || {}), d = w.document, _;

  /* Export */
  $.direct = direct;

  /* Render elt recursively according to spec */
  function direct(elt, spec, fn) {
    if (typeof fn === 'function') callback(fn);
    if (spec == null) return text(elt, '');
    if (spec.widget) return widget(elt, spec, '' + spec.widget);
    if (spec.name) return element(elt, spec);
    return text(elt, spec);
  }

  /* Call fn after rendering is done */
  function callback(fn) {
    w.setTimeout(function() {d.body.clientWidth, fn()});
  }

  /* Handle a case when spec is widget */
  function widget(elt, spec, wn) {
    var fn = wn.substr(0, 6) === 'Widget' ? $[wn] : err;
    return (spec.__ref = direct(elt, (fn || err)(spec)));
  }

  /* Render element node */
  function element(elt, next, prev) {
    elt = reuse(elt, next);
    prev = elt.__spec || 1;
    nodes(elt, arr(next.nodes), elt.childNodes);
    attrs(elt, next.attrs, prev.attrs);
    props(elt, next.props, prev.props);
    events(elt, next.events, prev.events);
    return (elt.__spec = next), (next.__ref = elt);
  }

  /* Create or replace elt node */
  function reuse(elt, next) {
    var prev = elt ? elt.__spec || 1 : 1;
    var name = elt ? (elt.nodeName || '').toLowerCase() : '';
    var reuse = next.xmlns === prev.xmlns && next.name === name;
    return reuse ? elt : create(elt, next.name, next.xmlns);
  }

  /* Create and replace elt node */
  function create(elt, name, ns) {
    var e = ns ? d.createElementNS(ns, name) : d.createElement(name);
    return elt && elt.parentNode && elt.parentNode.replaceChild(e, elt), e;
  }

  /* Update child nodes */
  function nodes(elt, n, p, k) {
    for (k = 0; k < n.length; k++) insert(elt, direct(p[k], n[k]), p[k]);
    while (p[k]) elt.removeChild(p[k]);
  }

  /* Insert node if it's not equalt to previous */
  function insert(elt, next, prev) {
    if (next !== prev) elt.insertBefore(next, prev);
  }

  /* Update elt attrbutes */
  function attrs(elt, n, p, k) {
    for (k in p) if (!has(n, k)) elt.removeAttribute(k);
    for (k in n) if (!eq(n, p, k)) elt.setAttribute(k, n[k]);
  }

  /* Update elt properties */
  function props(elt, n, p, k) {
    for (k in p) if (!has(n, k)) elt[k] = _;
    for (k in n) if (!eq(n, p, k)) elt[k] = n[k];
  }

  /* Update elt event listeners */
  function events(elt, n, p, k) {
    for (k in p) if (!has(n, p)) elt.removeEventListener(k, p[k]);
    for (k in n) if (!eq(n, p, k)) elt.addEventListener(k, n[k]);
  }

  /* Update or create a DOM TextNode with the value */
  function text(elt, v) {
    return elt && elt.nodeType === 3
      ? (elt.nodeValue !== v && (elt.nodeValue = v), elt)
      : d.createTextNode(v);
  }

  /* Validate that object o has not null property p */
  function has(o, p) {
    return o && Object.prototype.hasOwnProperty.call(o, p) && o[p] != _;
  }

  /* If a and b are both not null objects and have the same prop k */
  function eq(a, b, k) {
    return has(a, k) && has(b, k) && a[k] === b[k];
  }

  /* Any to array */
  function arr(a) { return a ? (Array.isArray(a) ? a : [a]) : 1 }

  /* Handle non existent widgets */
  function err(model) { w.console.error('Widget not found', model) }
})(this);
