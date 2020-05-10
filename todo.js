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
    widget: 'WidgetTodoApp',
    header: 'Todo App',
    data: [
      {title: 'Create repo', done: true},
      {title: 'Submit code', done: true},
      {title: 'Add LICENSE', done: false},
      {title: 'Add README', done: false},
    ],
  };

  /**
   * WidgetTodoApp returns HTMLDivElement with class 'Todo' and two child
   * nodes. Each of the child-nodes is another widget.
   */
  $.WidgetTodoApp = function(model) {
    return {
      name: 'div',
      attrs: {'class': 'Todo'},
      nodes: [
        {widget: 'WidgetHeader', content: model.header},
        {widget: 'WidgetForm', tasks: model.data},
      ],
    };
  };

  /**
   * WidgetHeader returns HTMLSectionHeading element with one child.
   * The child is TextNode with content
   */
  $.WidgetHeader = function(model) {
    return {
      name: 'h1',
      nodes: model.content,
    };
  };

  /**
   * WidgetForm returns HTMLForm element with event listener and two child
   * nodes: HTMLInputElement and WidgetTaskList. The form element has event
   * listener for the submit event which adds new item to the tasks list.
   */
  $.WidgetForm = function(model) {
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
      }
    }
    var input = {name: 'input', attrs: {placeholder: 'Add task'}};
    var tasks = {widget: 'WidgetTaskList', tasks: model.tasks};
    return {
      name: 'form',
      nodes: [input, tasks],
      events: {submit: submit},
    };
  };

  /**
   * WidgetTaskList maps tasks to models for WidgetTask and returns
   * HTMLOrderedList element.
   */
  $.WidgetTaskList = function(model) {
    var nodes = model.tasks.map(
      function(task) {
        return {widget: 'WidgetTask', data: task};
      }
    );
    return {name: 'ol', nodes: nodes};
  };

  /**
   * WidgetTask returns HTMLListItem element with attached event listener.
   * The listener handles `click` event and toggles state of the task.
   */
  $.WidgetTask = function(model) {
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
