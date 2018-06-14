'use strict';

(function(w) {
  var $ = w.$ = w.$ || {};
  var root = w.document.querySelector('.Todo');

  var todoModel = {
    widget: 'TodoWidget',
    data: [
      {title: 'Clean up code', done: true},
      {title: 'Add LICENSE', done: false},
      {title: 'Add README', done: false},
    ],
  };

  $.TodoWidget = function(model) {
    model = $.obj(model);
    model.data = $.arr(model.data);

    /* This function doesn't need any binding because it is defined
       in the same scope as model and has access to model properties. */
    function submit(e) {
      e.preventDefault();
      var input = e.target.querySelector('input');
      if (input.value) {
        /* Add new item to model */
        model.data.push({title: input.value});
        /* Update DOM using .__ref as link to DOM node */
        $.update(model, model.__ref);
        input.value = '';
      }
    }

    /* This function doesn't need any binding because it is defined
       in the same scope as model and has access to model properties. */
    function click(e) {
      if (e && e.target && e.target.hasOwnProperty('idx')) {
        e.preventDefault();
        var item = $.obj(model.data[+e.target.idx]);
        item.done = !item.done;
        $.update(model, model.__ref);
      }
    }


    return {
      name: 'div',
      attrs: {'class': 'Todo'},
      nodes: [
        {
          name: 'h1',
          nodes: 'Todo App',
        },
        {
          name: 'form',
          events: {submit: submit},
          nodes: {
            name: 'input',
            attrs: {placeholder: "Add task"},
          },
        },
        {
          name: 'ol',
          events: {click: click},
          nodes: model.data.map(item),
        },
      ],
    };
  };

  /* This function is pure so we can put definintion out of TodoWidget. */
  function item(task, idx) {
    task = $.obj(task);
    return {
      name: 'li',
      nodes: task.title,
      props: {idx: idx},
      attrs: {'class': task.done ? 'done': ''},
    };
  }

  $.update(todoModel, root);
})(this);
