'use strict';

(function(App) {

  App.View = App.View ||  {};

  App.View.MapFileCategories = Backbone.View.extend({

    defaults: {
      rasterColumn: 'the_raster_webmercator'
    },

    events: {
      'click .raster-color-ftlight' : 'clickFeatherRaster'
    },

    initialize: function(params) {
      this.options = _.extend({}, this.defaults, params || {});
      this.data = this._getAppData();
      this.layer = _.findWhere(this.data.page.data_layers, {id: parseInt(this.options.layerId)});
      this.rasterType = this.el.getElementsByClassName('raster-type')[0];
      this.rasterCategory = this.el.getElementsByClassName('raster-category')[0];
      this.columnsContainer = this.el.getElementsByClassName('content')[0];
      this.customColumsInput = this.el.getElementsByClassName('custom_columns_colors')[0];
      this.rasterColorInput = this.el.getElementsByClassName('raster_color_input')[0];
      this.palette = App.CartoCSS['Theme' + this.data.caseStudy.template].palette1;
      this.opacity = App.CartoCSS['Theme' + this.data.caseStudy.template]['default-p1']['polygon-opacity'];
      this.analyzed = this.checkAnalyzed();
      this.featherRaster = this.el.getElementsByClassName('raster-color-ftlight')[0];
      this.setFeatherlight();
      this.initialized = false;
    },

    setFeatherlight: function() {
      $(this.featherRaster).featherlight();
    },

    clickFeatherRaster: function() {
      var self = this;
      var saveFormBtn = document.getElementsByClassName('-saveform')[0];
      var closeFormBtn = document.getElementsByClassName('-closeform')[0];
      self.setFeatherlightListeners();
      saveFormBtn.style.display = 'block';
      closeFormBtn.classList.add('-alt');
      self.setRasterColorInput();
      saveFormBtn.onclick = function() {
        self.rasterColorInput.value = self.currentRasterInput.value;
        document.getElementById('saveBtn').click();
      };
    },

    setFeatherlightListeners: function() {
      var self = this;
      this.palettesBox = $('.featherlight-content .item.-palette');
      this.rasterColorInputModal = $('.featherlight-content .raster_color_input');
      this.rasterColorInputModal.on('change', function(e) {
        self.rasterColorInput.value = e.currentTarget.value;
      });
      this.palettesBox.on('click', function(e) {
        var targetValue = e.currentTarget.getAttribute('data-value');
        var cartoCss = App.CartoCSS['Theme' + self.data.caseStudy.template];
        var defaultCarto = cartoCss['default-p'+targetValue];
        self.paletteSelected = cartoCss['palette'+targetValue];
        self.paletteSelected = _.map(self.paletteSelected, function(color) { return App.Helper.hexToRgba(color, defaultCarto['polygon-opacity']*100);});
        var $item = $(e.currentTarget);
        var item = $item.parents('.raster-color').find('.raster_color_input')[0];
        item.classList.remove('border-animate');
        setTimeout(function(){
          item.classList.add('border-animate');
        }.bind(this),100);
        self.setRasterColorInput(item,self.paletteSelected);
      });
    },

    start: function(column) {
      var self = this,
          promise,
          categoriesObject,
          categories;
      var table = this.el.getAttribute('data-table');
      column = column || this.el.getAttribute('data-column');

      this.isRaster = column === this.options.rasterColumn;
      if (this.analyzed && !self.initialized) {
        categoriesObject = App.Helper.deserialize(this.layer.raster_categories);
        categories = _.map(categoriesObject, function(item, key){
          return self.isRaster ? {'category': parseFloat(key) } : {'category': key };
        });

        categories = _.sortBy(categories, 'category');
        this.refreshCategories(categories);
        this.initialized = true;

      } else if (table && column) {
        self.openFeedback();
        if (this.isRaster) {
          var prePromise = self.isRasterHighRes(table, column);
          promise = prePromise.then(function(highRes) {
            if (highRes) {
              return self.getRasterHighResCategories(table, column);
            } else {
              return self.getRasterCategories(table, column);
            }
          });
        } else {
          promise = self.getCategories(table, column);
        }

        promise.then(function(categories) {
          self.closeFeedback();
          self.refreshCategories(categories);
        });
        promise.fail(function(error) {
          self.closeFeedback();
          self.handleCategoriesError(error);
        });

      } else {
        self.columnsContainer.innerHTML = '<label class="error">Please choose a table column</label>';
      }
    },

    checkAnalyzed: function() {
      if ( (!this.layer.raster_type && this.layer.layer_column) ||
            (this.layer.raster_type && this.layer.raster_categories) ) {
        return true;
      } else {
        return false;
      }
    },

    openFeedback: function() {
      this.feedback = $.featherlight(
        $('#feedbackAnalyzing'),
        {
          closeOnClick: false,
          closeOnEsc: false,
          afterContent:function(){}
        }
      );
    },

    closeFeedback: function() {
      this.feedback.close();
    },

    initColorPicker: function() {
      this.colorPickers = this.$('.colorpicker');
    },

    startColorPicker: function() {
      var self = this;
      this.colorPickers.each(function(index, item) {
        var $item = $(item),
          borderColor;
        $item.spectrum({
          showAlpha: true,
          showInput: true,
          showInitial: true,
          showPalette: true,
          showSelectionPalette: true,
          maxSelectionSize: 10,
          preferredFormat: 'rgba',
          palette: self.palette
        });
        borderColor = $(item).spectrum('get').toHex();
        $(item).siblings('.sp-replacer').css('border', '1px solid #' + borderColor);

        $(item).on('change.spectrum', function(e, color) {
          var borderContainer = e.currentTarget.parentElement.getElementsByClassName('sp-replacer')[0];
          borderContainer.style.border = '1px solid #' + color.toHex();
          self.updateColumnsColor();
        });
      });
    },

    getCategories: function(table, column) {
      var self = this;
      var query;
      var defer = new $.Deferred();
      var sql = new cartodb.SQL({
        user: this.data.cartodbUser
      });
      var queryOpt = {
        column: column,
        table: table,
        limit: 30
      };

      query = 'SELECT DISTINCT {{column}} AS CATEGORY FROM {{table}} WHERE {{column}} IS NOT NULL ORDER BY {{column}} LIMIT {{limit}}';

      sql.execute(query, queryOpt)
        .done(function(data) {
          if (data.rows.length) {
            defer.resolve(data.rows);
          } else {
            defer.reject('there are not categories');
          }
        })
        .error(function() {
          defer.reject('fail getting categories');
        });

      return defer;
    },

    isRasterHighRes: function(table) {
      var query;
      var defer = new $.Deferred();
      var sql = new cartodb.SQL({
        user: this.data.cartodbUser
      });
      var queryOpt = {
        table: table,
      };

      query = 'SELECT (ST_SummaryStatsAgg(the_raster_webmercator,true, 1 )).* FROM {{table}}';

      sql.execute(query, queryOpt)
        .done(function(data) {

          if (data.rows[0].count > 1000000){
            defer.resolve(true);
          } else {
            defer.resolve(false);
          }
        })
        .error(function(error) {
          defer.reject(error);
        });

      return defer;
    },

    getRasterCategories: function(table, column) {
      var self = this;
      var query;
      var defer = new $.Deferred();
      var sql = new cartodb.SQL({
        user: this.data.cartodbUser
      });
      var queryOpt = {
        column: column,
        table: table,
        limit: 30
      };

      query = 'SELECT distinct (ST_ValueCount(the_raster_webmercator,1,true)).value FROM {{table}} order by value asc LIMIT {{limit}}';

      sql.execute(query, queryOpt)
        .done(function(data) {
          if (data.rows.length > 20) {
            //is a continous type raster and needs a new query
            self.getRasterContinousCat(table)
              .done(function(data) {
                defer.resolve(data);
              })
              .fail(function(error){
                defer.reject(error);
              });
          } else {
            //is a category type raster
            self.setRasterType('category');
            // self.setRasterCategories(_.map(data.rows, function(item){ return item.value; }));
            var categories = _.map(data.rows, function(item){ return {'category':item.value}; });
            defer.resolve(categories);
          }
        })
        .error(function(error) {
          defer.reject(error);
        });

      return defer;

    },

    getRasterHighResCategories: function(table) {
      var self = this;
      var query;
      var defer = new $.Deferred();
      var sql = new cartodb.SQL({
        user: this.data.cartodbUser
      });
      var queryOpt = {
        table: table
      };

      query = 'SELECT (ST_Histogram(st_union(the_raster_webmercator),1,true,7,false)).*, ST_BandNoDataValue(the_raster_webmercator, 1) as noDataValue FROM {{table}} group by noDataValue'

      sql.execute(query, queryOpt)
        .done(function(data) {
          var rasterInfo = {categories:[]};
          rasterInfo.noDataValue = data.rows[0].nodatavalue;
          rasterInfo.min = data.rows[0].min;

          _.each(data.rows, function(item){
            rasterInfo.categories.push(item.max);
          });

          defer.resolve(self.setRasterContinous(rasterInfo));
        })
        .error(function(err) {
          defer.reject(err);
        });

      return defer;
    },

    getRasterContinousCat: function(table) {
      var self = this;
      var query;
      var defer = new $.Deferred();
      var sql = new cartodb.SQL({
        user: this.data.cartodbUser
      });
      var queryOpt = {
        table: table,
      };

      query = 'with r as ( SELECT ST_ValueCount(the_raster_webmercator) As pvc, ST_BandNoDataValue(the_raster_webmercator, 1) as noDataValue FROM {{table}} ) SELECT CDB_JenksBins(array_agg((pvc).value::numeric), 7), min((pvc).value::numeric), noDataValue  FROM r group by noDataValue';
      // query = 'with r as ( SELECT ST_ValueCount(the_raster_webmercator) As pvc, ST_BandNoDataValue(the_raster_webmercator, 1) FROM {{table}} ) SELECT CDB_JenksBins(array_agg((pvc).value::numeric), 7), min((pvc).value::numeric)  FROM r';

      sql.execute(query, queryOpt)
        .done(function(data) {
          if (data.rows[0].cdb_jenksbins.length) {

            var rasterInfo = {
              categories: data.rows[0].cdb_jenksbins,
              noDataValue: data.rows[0].nodatavalue,
              min: data.rows[0].min
            };

            defer.resolve(self.setRasterContinous(rasterInfo));

          } else {
            defer.reject('there are not categories');
          }
        })
        .error(function() {
            defer.reject('fail getting raster continous categories');
        });

      return defer;
    },

    setRasterContinous: function(data) {
      this.setRasterType('continous');

      var categoriesArray = data.categories;
      var noDataValue = data.noDataValue;
      var minDataValue = data.min;
      if (typeof noDataValue === 'undefined' || noDataValue < minDataValue) {
        categoriesArray.unshift(minDataValue);
      }
      // this.setRasterCategories(categoriesArray);

      return _.map(categoriesArray, function(item){ return {'category':item}; });
    },

    setRasterType: function(type) {
      this.rasterType.value = type;
    },

    setRasterCategories: function() {
      if (this.rasterCategory){
        this.rasterCategory.value = this.rasterCategoryNames.serialize();
      }
    },

    setRasterColorInput: function(item, palette) {
      var self = this;
      self.palette = palette;
      item = item || this.rasterColorInput;
      this.currentRasterInput = item;
      var line = function() {
        var lines = self.el.querySelectorAll('.columns-container .item.-color');
        var text = '';
        var count = 0;
        var paletteLenght = self.palette ? self.palette.length:0;
        for (var i = 0; i < lines.length; i++) {
          if (self.palette) {
            if (count > paletteLenght - 1) {
              count = 0;
            }
            text += self.palette[count];
            count++;
          } else {
            text += lines[i].querySelectorAll('input')[0].value;
          }
          text += '-';
          text += lines[i].querySelectorAll('input')[0].name.trim();
          text += '\n';
        }
        return (text.length > 0) ? text : '';
      };
      if (item) {
        item.value = line();
      }
      //
      // // firefox hack
      // var rasterInputs = document.getElementsByClassName('raster_color_input');
      // if (rasterInputs.length > 1) {
      //   rasterInputs[rasterInputs.length-1].value = item.value;
      // }
    },

    refreshCategories: function(columns) {
      var self = this;
      this.colors;
      this.palette = App.CartoCSS['Theme' + this.data.caseStudy.template].palette1;

      if (this.rasterCategory && this.rasterCategory.value) {
        var names = App.Helper.deserialize(this.rasterCategory.value);
      }
      if (this.rasterColorInput && this.rasterColorInput.value) {
        // Step over current given values with the ones pasted in the CartoCSS formated file
        this.colors = App.Helper.switchInputColors(this.rasterColorInput.value);
      } else {
        this.colors = App.Helper.deserialize(this.customColumsInput.value);
      }
      var paletteLenght = this.palette.length;
      var count = 0;
      var boxTemplate = '';

      this.columnsContainer.innerHTML = '';
      boxTemplate = '<div class="unordered-list">'+
                      '<div class="list-header row">'+
                        '<div class="grid-sm-1"> <span> color </span> </div>'+
                        '<div class="grid-sm-5"> <span> category </span> </div>' +
                        '<div class="grid-sm-6"> <span> name </span> </div>'+
                      '</div>' +
                      '<div class="list-content"></div>'+
                    '</div>';

      self.columnsContainer.insertAdjacentHTML('afterbegin', boxTemplate);
      var listContainer = self.columnsContainer.getElementsByClassName('list-content')[0];

      _.each(columns, function(element) {
        var category = {
          value: element.category,
          color: '',
          name: ''
        };
        if (self.colors && self.colors[element.category]) {
          category.color = self.colors[element.category];
        } else {
          if (count > paletteLenght - 1) {
            count = 0;
          }
          category.color = App.Helper.hexToRgba(self.palette[count], self.opacity*100);
          count++;
        }
        if (names && names[element.category]) {
          category.name = names[element.category];
        } else {
          category.name = element.category;
        }

        category = self.getCategory(category);
        listContainer.insertAdjacentHTML('beforeend', category);
      });
      this.initColorPicker();
      this.startColorPicker();
      this.rasterCategoryNames = this.$('.raster-cat-name');
      this.rasterCategoryNames.on('change', function(){
        self.setRasterCategories();
      });
      this.setRasterCategories(columns);
      this.updateColumnsColor();
      this.featherRaster.classList.remove('_hidden');
    },

    getCategory: function(category) {
      return this._categoryTemplate()(category);
    },

    _categoryTemplate: function() {
      return _.template('<div class="item -color row" >' +
        '<div class="grid-sm-1">'+
          '<input type="text" class="colorpicker" name="<%= value %>" value="<%= color %>"> ' +
        '</div>'+
        '<div class="grid-sm-5">'+
          '<span> <%= value %> </span> ' +
        '</div>'+
        '<div class="grid-sm-6">'+
          '<input type="text" class="raster-cat-name -centered" name="<%= value %>" value="<%= name %>"> ' +
        '</div>');
    },

    handleCategoriesError: function() {
      this.columnsContainer.innerHTML = '<label class="error">There was an error analyzing the data, please contact us</label>';
    },

    updateColumnsColor: function(palette) {
      var self = this;
      if (palette) {
        var count = 0;
        var paletteLenght = palette.length;
        _.each(this.colorPickers, function(colorPicker){
          if (count > paletteLenght - 1) {
            count = 0;
          }
          colorPicker.value = palette[count];
          $(colorPicker).spectrum('set', palette[count]);
          count++;
        });
      } else {
        self.setRasterColorInput();
      }
      _.each(this.colorPickers, function(colorPicker){
        colorPicker.value = $(colorPicker).spectrum('get').toRgbString();
      });
      this.customColumsInput.value = this.colorPickers.serialize();
      this.setRasterColorInput();
    },

    _getAppData: function() {
      var data = {};

      if (gon)  {
        if (gon.cartodb_user)  {
          data.cartodbUser = gon.cartodb_user;
        }
        if (gon.case_study)  {
          data.caseStudy = JSON.parse(gon.case_study);
        }
        if (gon.page)  {
          data.page = JSON.parse(gon.page);
        }
      }

      return data;
    },

  });

})(window.App ||  {});
