'use strict';

(function(w) {
  /* Namespace */
  var $ = w.$ = w.$ || {};

  /**
   * Model is plain object.
   * Field `widget` defines which widget will process this data.
   * Other fields are optional and may vary depend of data nature.
   */
  var todoModel = {
    widget: 'TodoApp',
    header: 'Todo App',
    data: [
      {title: 'Create repo', done: true},
      {title: 'Submit code', done: true},
      {title: 'Add LICENSE', done: false},
      {title: 'Add README', done: false},
    ],
  };

  /**
   * TodoApp returns HTMLDivElement with class 'Todo' and two child
   * nodes. Each of the child-nodes is another widget.
   */
  $.TodoApp = function(model) {
    return {
      name: 'div',
      attrs: {'class': 'Todo'},
      nodes: [
        {widget: 'Header', content: model.header},
        {widget: 'Form', tasks: model.data},
      ],
    };
  };

  /**
   * Header returns HTMLSectionHeading element with one child.
   * The child is TextNode with content
   */
  $.Header = function(model) {
    return {
      name: 'h1',
      nodes: model.content,
    };
  };

  /**
   * Form returns HTMLForm element with event listener and two child
   * nodes: HTMLInputElement and TaskList. The form element has event
   * listener for the submit event which adds new item to the tasks list.
   */
  $.Form = function(model) {
    function submit(e) {
      e.preventDefault();
      var input = e.target.querySelector('input');
      if (input.value) {
        /* Add new item to model */
        model.tasks.push({title: input.value});
        /* Update DOM using .__ref as link to DOM node */
        $.direct(model.__ref, model);
        /* Clean up input field */
        input.value = '';
        input.focus();
      }
    }
    var input = {name: 'input', attrs: {placeholder: 'Add task'}};
    var tasks = {widget: 'TaskList', tasks: model.tasks};
    return {
      name: 'form',
      nodes: [input, tasks],
      events: {submit: submit},
    };
  };

  /**
   * TaskList maps tasks to models for Task and returns
   * HTMLOrderedList element.
   */
  $.TaskList = function(model) {
    var nodes = model.tasks.map(
      function(task) {
        return {widget: 'Task', data: task};
      }
    );
    return {name: 'ol', nodes: nodes};
  };

  /**
   * Task returns HTMLListItem element with attached event listener.
   * The listener handles `click` event and toggles state of the task.
   */
  $.Task = function(model) {
    function click(e) {
      e.preventDefault();
      model.data.done = !model.data.done;
      $.direct(model.__ref, model);
    }
    var task = model.data;
    var cls = task.done ? 'done': '';
    return {
      name: 'li',
      nodes: task.title,
      attrs: {class: cls},
      events: {click: click},
    };
  };

  /* Select the root node for our application */
  var root = w.document.querySelector('.Todo');

  /* Start the application */
  $.direct(root, todoModel);
})(this);