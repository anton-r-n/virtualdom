'use strict';

(function(w) {
  var $ = w.$ = w.$ || {};
  var d = w.document;

  /* Static `spec` for node with nested elements */
  var text = {
      name: 'div',
      attrs: {'class': 'static'},
      nodes: {
        name: 'p',
        nodes: [
          'This div contains example of static content with ',
          {
            name: 'span',
            nodes: 'nested',
            attrs: {'style': 'font-family:monospace'},
          },
          ' elements.',
          {name: 'br'},
          'Table below updates every 5 second.'
        ],
      },
    };
  $.update(text, d.querySelector('.static'));
})(this);


(function(w) {
  var $ = w.$ = w.$ || {};
  var d = w.document;

  /* Widget `Table` */
  $.Table = function(model) {
    /* Create data for nested widgets */
    var nodes = $.arr(model.data).map(function(row) {
      return {widget: 'TableRow', data: row};
    });

    return {name: 'table', nodes: {name: 'tbody', nodes: nodes}};
  };

  /* Widget `TableRow` */
  $.TableRow = function(model) {
    var nodes = $.arr(model.data).map(function(cell) {
      return {name: 'td', nodes: cell};
    });

    return {name: 'tr', nodes: nodes};
  };

  /* Generate table with random data */
  function randomTable(size) {
    var i, j, matrix = [];
    for (i = 0; i < size; i++) {
      matrix[i] = [];
      for (j = 0; j < size; j++) {
        matrix[i][j] = Math.floor(Math.random() * 10.);
      }
    }
    return {widget: 'Table', data: matrix};
  }

  /* Measure rendering time */
  function callback() {
    var t0 = new Date();
    return function() {
      w.console.log('Render: %s s', (new Date() - t0) / 1e3);
    };
  }

  /* Update table with random size and random data */
  function randomUpdate() {
    var size = 2 + Math.round(Math.random() * 5.);
    var table = randomTable(size);
    $.update(table, d.querySelector('.table'), callback());
    if (++count < 10) {
      w.setTimeout(randomUpdate, 5000);
    }
  }

  var count = 0;
  w.setTimeout(randomUpdate, 5000);
})(this);
