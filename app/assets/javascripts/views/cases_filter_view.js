'use strict';

(function(App) {

  App.View = App.View || {};

  App.View.CasesFilter = Backbone.View.extend({

    defaults: {
      filterName: 'tags[]'
    },

    initialize: function(options) {
      this.options = _.extend({}, this.defaults, options || {});
      this.filterName = this.options.filterName;
      this.casesContainer = document.getElementById('casesArticles');
      this.casesOriginal = document.getElementById('casesArticles').innerHTML;

      this._initSearchBox();
      this._setListeners();

    },

    /**
     * Function to initialize the searchBox
     */
    _initSearchBox: function() {
      this.search = this.$('#searchBox');
      this.search.select2();
    },

    /**
     * Function to set searchBox event listeners
     */
    _setListeners: function() {
      this.search.on("select2:close", _.bind(this._getCases,this));
    },

    /**
     * Function to get the filtered by tag study cases
     */
    _getCases: function() {
      console.log('get');
      var self = this;
      $.ajax({
        dataType: "json",
        url: '',
        data: this.search.val()? this.filterName+'='+this.search.val(): ''
      }).done( function(data) {
        self._refreshCases(data.landing);
      }).fail( function(error) {
        console.log('There was an error getting cases');
      });
    },

    /**
     * Function to paint the filtered study cases
     */
    _refreshCases: function(studyCases) {
      var self = this;
      self.casesContainer.innerHTML = '';
      _.each(studyCases,function(studyCase){
        self.casesContainer.insertAdjacentHTML("beforeend", self._caseTemplate(studyCase));
      });
    },

    /**
     * Function to get the case with template
     */
    _caseTemplate: function(studyCase) {
      return '<article class="grid-xs-12 grid-sm-6 grid-md-4">'+
                '<a class="case" style="background-image: url('+ studyCase.cover_path + '" href="'+ studyCase.case_path+'">'+
                  '<div class="caption">'+
                    '<h2>'+studyCase.title+'</h2>'+
                  '</div>'+
                '</a>'+
              '<article>';
    },


  });

})(window.App || {});