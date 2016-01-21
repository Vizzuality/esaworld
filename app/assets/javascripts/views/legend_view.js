'use strict';

/**
 * Legend view
 * @param  {Object} App Global object
 */
(function(App) {

  App.View = App.View || {};

  App.View.Legend = Backbone.View.extend({

    defaults: {

    },

    events: {
      'mouseleave .legend-content': '_clearFilter'
    },

    /**
     * This function will be executed when the instance is created
     * @param  {Object} params
     */
    initialize: function(params) {
      this.options = _.extend({}, this.defaults, params || {});

      this._render();
      this._setListeners();
    },

    /**
     * Set listeners
     */
    _setListeners: function() {
      this.$el.delegate('.item', 'mouseenter', this._filter.bind(this));
    },

    /**
     * Unset listeners
     */
    _unsetListeners: function() {
      this.$el.undelegate('.item', 'mouseenter');
    },

    /**
     * Updates the data for the list
     * @param {Object} data for the view
     * @param {Object} layer data
     */
    update: function(data, layer) {
      this.data = data;

      this._updateList();
    },

    /**
     * Renders the view container
     */
    _render: function() {
      var container = this.el.querySelector('.list');
      container.classList.add('_is-loading');
    },

    /**
     * Updates the list with the stored data
     */
    _updateList: function() {
      var categories = this.data.currentLayer.categories;
      var groups = this.data.currentLayer.groups;

      if (categories) {
        this._renderList(categories, groups);
      }
    },

    /**
     * Renders the list
     * @param {Object} categories raw data
     * @param {Object} groupped categories with their data
     */
    _renderList: function(categories, groups) {
      var container = this.el.querySelector('.list');
      container.innerHTML = '';

      categories.forEach(function(cat) {
        var group = groups[cat.category][0];

        var itemContainer = document.createElement('li');
        itemContainer.dataset.category = cat.category;
        itemContainer.classList.add('item');

        var iconBgEl = document.createElement('span');
        iconBgEl.style.background = group.color;
        iconBgEl.classList.add('icon-bg');

        var iconEl = document.createElement('span');
        iconEl.style.borderColor = group.color;
        iconEl.classList.add('icon-legend');
        iconEl.appendChild(iconBgEl);

        var itemEl = document.createElement('span');
        var itemText = document.createTextNode(cat.category);
        itemEl.appendChild(itemText);
        itemEl.classList.add('description');

        var itemValueEl = document.createElement('span');
        var itemValueText = document.createTextNode(cat.value);
        itemValueEl.appendChild(itemValueText);
        itemValueEl.classList.add('value');
        
        itemContainer.appendChild(iconEl);
        itemContainer.appendChild(itemEl);
        itemContainer.appendChild(itemValueEl);

        container.appendChild(itemContainer);
      });

      container.classList.remove('_is-loading');
    },

    /** 
     * Filters the data by a category
     * @param {Object} event
     */
    _filter: function(ev) {
      var current = ev.currentTarget;
      var category = current.dataset.category;

      this.trigger('legend:filter', category);
    },

    /**
     * Clears the filtered content
     */
    _clearFilter: function() {
      this.trigger('legend:filter', '');
    },

    /**
     * Removes the view content and unsets the listeners
     */
    remove: function() {
      var container = this.el.querySelector('.list');
      container.innerHTML = '';

      this._unsetListeners();
      this.undelegateEvents();
    }

  });

})(window.App || {});