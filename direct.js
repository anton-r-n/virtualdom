'use strict';

(function(w) {
  /* Namespace, document, and undefined shortcuts */
  var $ = (w.$ = w.$ || {}), d = w.document, _;

  /* Export */
  $.direct = direct;

  /* Render elt recursively according to spec */
  function direct(elt, spec, fn) {
    elt = elt || 1;
    if (typeof fn === 'function') callback(fn);
    if (!spec) return text(elt, '');
    if (spec.widget) return widget(elt, spec);
    if (spec.name) return update(elt, spec, elt.__spec || 1);
    return text(elt, spec);
  }

  /* Call fn after rendering is done */
  function callback(fn) {
    w.setTimeout(function() {d.body.clientWidth, fn()});
  }

  /* Handle cases when spec is widget */
  function widget(elt, spec) {
    return (spec.__ref = direct(elt, ($[spec.widget] || err)(spec)));
  }

  /* Skip update if next spect is prev spec */
  function update(elt, next, prev) {
    return next === prev ? elt : element(elt, next, prev);
  }

  /* Render element node */
  function element(elt, next, prev) {
    elt = reuse(elt, next, prev);
    nodes(elt, arr(next.nodes), elt.childNodes);
    attrs(elt, next.attrs || 1, prev.attrs || 1);
    props(elt, next.props || 1, prev.props || 1);
    events(elt, next.events || 1, prev.events || 1);
    elt.__spec = next;
    return (next.__ref = elt);
  }

  /* Create or replace elt node */
  function reuse(elt, next, prev) {
    var name = (elt.nodeName || '').toLowerCase();
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
    for (k = 0; k < n.length; k++) elt.insertBefore(direct(p[k], n[k]), p[k]);
    while (p[k]) elt.removeChild(p[k]);
  }

  /* Update elt attrbutes */
  function attrs(elt, n, p, k) {
    for (k in p) if (n[k] == _) elt.removeAttribute(k);
    for (k in n) if (n[k] !== p[k]) elt.setAttribute(k, n[k]);
  }

  /* Update elt properties */
  function props(elt, n, p, k) {
    for (k in p) if (n[k] == _) elt[k] = n[k];
    for (k in n) if (n[k] !== p[k]) elt[k] = n[k];
  }

  /* Update elt event listeners */
  function events(elt, n, p, k) {
    for (k in p) if (n[k] !== p[k]) elt.removeEventListener(k, p[k]);
    for (k in n) if (n[k] !== p[k]) elt.addEventListener(k, n[k]);
  }

  /* Update or create a DOM TextNode with the value */
  function text(elt, v) {
    return elt && elt.nodeType === 3
      ? (elt.nodeValue !== v && (elt.nodeValue = v), elt)
      : d.createTextNode(v);
  }

  /* Any to array */
  function arr(a) { return a ? (Array.isArray(a) ? a : [a]) : 1 }

  /* Handles non existent widgets */
  function err(model) { w.console.error('Widget not found', model) }
})(this);
