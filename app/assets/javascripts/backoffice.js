//= require jquery2
//= require jquery_ujs
//= require cocoon
//= require jquery.tagsinput/jquery.tagsinput
//= require featherlight
//= require underscore
//= require backbone
//= require_self
//= require views/tags_view
//= require views/box_select_view
//= require views/preview_image_view
//= require views/map_file_columns_view

'use strict';

(function(root) {

  var App = root.App = {
    View: {}
  };

  var Backoffice = Backbone.View.extend({

    events: {
      'click #saveBtn': 'submitForm'
    },

    initialize: function() {
      this.initTags();
      this.initBoxSelects();
      this.initPreviewImage();
      this.initMapFileColumns();
      this.setExitWithoutSavingConfirmation();
    },

    /**
     * Initializing tags plugin
     * @param {Object}
     */
    initTags: function() {
      new App.View.Tags({
        el: this.$el.find('.tags')
      });
    },

    /**
     * Initializing box selector
     * @param {Object}
     */
    initBoxSelects: function() {
      var boxSelects = this.el.getElementsByClassName('box-selector');
      if (boxSelects && boxSelects.length) {
        new App.View.BoxSelect({ el: boxSelects });
      }
    },

    initPreviewImage: function() {
      new App.View.PreviewImage({
        el: this.el.querySelectorAll('.file-image-input')
      });
    },

    initMapFileColumns: function() {
      new App.View.MapFileColumns({
        el: document.querySelectorAll('.file-map-input')
      });
    },

    submitForm: function(e) {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      this.submitted = true;
      this.$el.find('form').submit();
    },

    setExitWithoutSavingConfirmation: function(){
      var self = this;
      this.submitted = false;
      this.form = this.$("form.exit-saving");
      this.cleanForm = this.form.serialize();
      $(window).on('beforeunload', function(e){
        e = e || window.event;
        if(!self.submitted && self.cleanForm != self.form.serialize()) {
          // For IE and Firefox
          if (e) {
            e.returnValue = "You have unsaved changes.";
          }
          // For Safari
          return "You have unsaved changes.";
        }
      });
    }

  });

  function onReady() {
    new Backoffice({ el: document.body });
  }

  document.addEventListener('DOMContentLoaded', onReady);

})(window);
