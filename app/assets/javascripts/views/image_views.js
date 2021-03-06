'use strict';

(function(App) {

  App.View = App.View || {};

  App.View.ImageViews = Backbone.View.extend({

    events: {
      'change input[type="file"]':'setBackgroundImage',
      'click .close':'cleanImage'
    },

    initialize: function() {

    },

    setBackgroundImage: function(e) {
      var self = this;
      var reader = new FileReader();
      var file = e.target.files[0];
      var parent = e.currentTarget.parentNode;
      reader.onload = function() {
        parent.parentNode.classList.add('_has_file');
        parent.style.backgroundImage = 'url(' + reader.result + ')';
      };
      if (file && file.type.match('image.*')) {
        reader.readAsDataURL(file);
      }
      parent.parentNode.getElementsByClassName('delete_image')[0].value = false;
    },

    loadBackgroundImage: function(id, imgSrc) {
      var element = document.getElementById('input-image-contact-'+id).parentNode;
      element.style.backgroundImage = 'url(' + imgSrc + ')';
      element.parentNode.classList.add('_has_file');
      element.parentNode.parentNode.getElementsByClassName('delete_image')[0].value = false;
    },

    cleanImage: function(e) {
      var self = this;
      self.cleanPreviewImage(e);
      self.emptyInput(e);
    },

    cleanPreviewImage: function(e) {
      var target = e.currentTarget.parentNode.querySelectorAll('.file')[0];
      target.style.backgroundImage = null;
    },

    emptyInput: function(e) {
      var target = e.currentTarget.parentNode;
      target.classList.remove('_has_file');
      target.querySelectorAll('input[type="file"]')[0].value = "";
      target.getElementsByClassName('delete_image')[0].value = true;
    },

    setLogo: function(id, data) {
      document.getElementById('contact-id-'+id).value = data.contactId;
      this.loadBackgroundImage(id, data.imgSrc);
    },

  });

})(window.App || {});
