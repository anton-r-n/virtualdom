'use strict';

(function(w) {
  /* Namespace, document, and undefined shortcuts */
  var $ = (w.$ = w.$ || {}), d = w.document, _;

  /* Export */
  $.direct = direct;

  /* Entry point */
  function direct(elt, spec, fn) {
    if (typeof fn === 'function')
      w.setTimeout(function() { d.body.clientWidth, fn() });
    return replace(elt, element(elt || 1, spec == null ? '' : spec));
  }

  /* Render widget, node, or text */
  function element(e, s) {
    return (s.widget ? widget : Array.isArray(s) ? node : text)(e, s);
  }

  /* Handle case when spec is widget */
  function widget(elt, spec) {
    return (spec.__ref = direct(elt, ($[spec.widget] || err)(spec)));
  }

  /* Render node recursively */
  function node(elt, spec) {
    elt = reuse(elt, spec, elt.__spec || 1);
    return (elt.__spec === spec) ? elt : update(elt, spec, elt.__spec || 1);
  }

  /* Verify if we can reuse the elt DOM node */
  function reuse(elt, next, prev, name, reuse) {
    name = (elt.nodeName || '').toLowerCase();
    reuse = next[5] === prev[5] && next[0] === name;
    return reuse ? elt : create(next[0], next[5]);
  }

  /* Create and replace elt node */
  function create(name, ns) {
    return ns ? d.createElementNS(ns, name) : d.createElement(name);
  }

  /* Update elt recursively */
  function update(elt, next, prev) {
    if (typeof next[1] === 'string') next[1] = {class: next[1]};
    nodes(elt, arr(next[2]), elt.childNodes);
    attrs(elt, next[1] || 1, prev[1] || 1);
    props(elt, next[3] || 1, prev[3] || 1);
    events(elt, next[4] || 1, prev[4] || 1);
    return (elt.__spec = next, elt);
  }

  /* Update child nodes */
  function nodes(elt, n, p, k) {
    for (k = 0; k < n.length; k++) insert(elt, direct(p[k], n[k]), p[k]);
    while (p[k]) elt.removeChild(p[k]);
  }

  /* Insert node */
  function insert(elt, n0, n1) { if (n0 !== n1) elt.insertBefore(n0, n1) }

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

  /* Update or create a DOM TextNode with the value `v` */
  function text(elt, v) {
    elt = elt.nodeType === 3 ? elt : d.createTextNode(v);
    return elt.nodeValue !== v && (elt.nodeValue = v), elt;
  }

  /* Any to array */
  function arr(a) { return a == null ? 1 : (Array.isArray(a) ? a : [a]) }

  /* Replace the element if necessary */
  function replace(p, n, pn) {
    return p && (p !== n) && (pn = p.parentNode) && pn.replaceChild(n, p), n;
  }

  /* Handle missing widgets */
  function err(model) { w.console.error('Widget not found', model) }
})(this);
