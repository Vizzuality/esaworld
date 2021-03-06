'use strict';

(function(App) {

  App.View = App.View ||  {};

  App.View.MapFileColumns = Backbone.View.extend({

    defaults: {
      ignoredColumns: [
        'cartodb_id',
        'the_geom',
        'the_geom_webmercator',
        'updated_at',
        'created_at',
        'year'
      ],
      rasterColumn: 'the_raster_webmercator'
    },

    columns: [],

    events: {
      'click .item': 'onClickItem',
      'click .remove_fields': 'checkRemoveNewItem',
      'cocoon:after-insert': 'onAddNewItem',
      'cocoon:after-remove': 'onRemoveNewItem'
    },

    initialize: function(params) {
      this.options = _.extend({}, this.defaults, params || {});

      this.data = this._getAppData();
      this.ignoredColumns = this.options.ignoredColumns;
      this.rasterColumn = this.options.rasterColumn;
      this.rastertitle = document.getElementById('page_title');

      this.isRaster = false;
      if (this.el.querySelectorAll('#layerId')[0]) {
        this.layerId = this.el.querySelectorAll('#layerId')[0].getAttribute('data-layerid');
      }

      if (this.el.querySelectorAll('[data-filename]').length) {
        this.list = this.el.querySelectorAll('[data-filename]')[0];
        this.fileName = this.list.getAttribute('data-filename');
        this.columnsContainer = this.list.getElementsByClassName('box-list')[0];
        this.init();
      }

    },

    init: function() {
      var self = this;
      this.category = new App.View.MapFileCategories({
        el: document.getElementById('custom-column-layer-' + this.layerId),
        layerId: this.layerId
      });

      var promise = self.getColumns(this.fileName);
      promise.done(function(columns) {
        self.refreshColumns(columns);
        if (self.isRaster) {
          self.category.start(self.rasterColumn);
          if (self.columnsContainer){
            self.columnsContainer.remove();
          }
        } else {
          self.category.start();
        }
      });
      promise.fail(function(error) {
        self.handleColumnsError(error);
      });

    },

    getColumns: function(name) {
      var self = this;
      var columns = [];
      var defer = new $.Deferred();
      var sql = new cartodb.SQL({
        user: this.data.cartodbUser
      });
      var queryOpt = {
        table: name,
        limit: 30
      };
      sql.execute('SELECT * FROM {{table}} WHERE false LIMIT {{limit}}', queryOpt)
        .done(function(data) {
          $.each(data.fields, function(item) {
            if (item === self.rasterColumn) {
              self.isRaster = true;
              document.getElementById('column-input-' + self.layerId).value = item;
            } else if (!_.contains(self.ignoredColumns, item)) {
              columns.push(item);
            }
          });
          if (self.isRaster || columns.length) {
            defer.resolve(columns);
          } else {
            defer.reject('there are not columns');
          }
        })
        .error(function() {
          defer.reject('fail getting columns');
        });

      return defer;
    },

    refreshColumns: function(columns) {
      var self = this;
      var valueSelected = this.list.querySelectorAll('input')[0].value;
      if (!this.isRaster) {
        this.columnsContainer.innerHTML = '';
        _.each(columns, function(element) {
          self.columnsContainer.insertAdjacentHTML('afterbegin', self.getColummn(element, valueSelected));
        });
        this.columnsContainer.classList.remove('_is-loading');
      }
    },

    getColummn: function(element, valueSelected) {
      var column = {
        value: element,
        selectedClass: (element === valueSelected) ? '_selected' : ''
      };
      return this._columnTemplate()(column);
    },

    _columnTemplate: function() {
      return _.template('<div class="item <%= selectedClass %>" data-value="<%= value %>" >' +
        '<span> <%= value %> </span> ' +
        ' </div>');
    },

    handleColumnsError: function(error) {
      console.log(error);
    },

    _fileTemplate: function() {
      return _.template('<div class="row file"> <div class="name grid-xs-12"> <p> <%= fileName %> </p> <span class="close"> ×</span> </div> </div>');
    },

    onAddNewItem: function(e) {
      if (!! e.currentTarget.getElementsByClassName('add_fields')[0])
        e.currentTarget.getElementsByClassName('add_fields')[0].classList.add('_hidden');
    },

    onRemoveNewItem: function(e) {
      if (!! e.currentTarget.getElementsByClassName('add_fields')[0])
        e.currentTarget.getElementsByClassName('add_fields')[0].classList.remove('_hidden');
    },

    onClickItem: function(e) {
      this.currentItem = e.currentTarget;
      this.selectCurrent(e);
      this.updateValue(e);

      this.category.start(e.currentTarget.getAttribute('data-value'));
    },

    selectCurrent: function(e) {
      var el = this.currentItem;
      var siblings = [].filter.call(el.parentNode.children, function(child) {
        return child.localName == 'div' && child !== el;
      });
      el.classList.add('_selected');
      siblings.forEach(function(e) {
        e.classList.remove('_selected');
      });
    },

    updateValue: function(e) {
      var target = e.currentTarget;
      document.getElementById('column-input-' + this.layerId)
        .value = e.currentTarget.getAttribute('data-value');
    },

    _getAppData: function() {
      var data = {};

      if (gon && gon.cartodb_user)  {
        data.cartodbUser = gon.cartodb_user;
      }

      if (gon && gon.page)  {
        data.page = JSON.parse(gon.page);
      }

      return data;
    },

    _confirmRemove: function(name) {
      if (window.confirm("Following dataset will be completely erased: "+ name + ", do you want to continue?")) {
        this._doRemoveRaster();
        var target = this.el.querySelectorAll('.-delete.remove_fields')[0];
        target.classList.add('_confirmed');
        target.click();
      }
    },
    _doRemoveRaster: function() {
      $.ajax({
          url: '/backoffice/data-layers/' + this.layerId,
          type: 'DELETE',
          success: function() {
            Backbone.Events.trigger('refresh:force');
          }
      });
    },

    checkRemoveNewItem: function(e) {
      if (!! e.target.classList.contains('_confirmed')) {
        e.target.classList.remove('_confirmed');
        var el = document.querySelector('#custom-column-layer-'+this.layerId).parentNode;
        el.parentNode.removeChild(el);
        this.remove();
        return;
      }
      if (!! this.el.classList.contains('file-map-input')) {
        e.stopPropagation();
        this._confirmRemove(this.el.querySelector('.name p').innerHTML.trim());
      }
    }
  });

})(window.App ||  {});
