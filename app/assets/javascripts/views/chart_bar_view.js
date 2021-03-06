'use strict';

/**
 * Chart pie view
 * @param  {Object} App Global object
 */
(function(App) {

  App.View = App.View || {};

  App.View.ChartBar = Backbone.View.extend({

    events: {
    },

    defaults: {
      chartEl: '#bar-chart',
      barsRange: 0.7,
      animationType: 'linear',
      animationTime: 200,
      removeTimeout: 350,
      margin: {
        top: 0,
        right: 40,
        bottom: 20,
        left: 40
      }
    },

    /**
     * This function will be executed when the instance is created
     * @param  {Object} params
     */
    initialize: function(params) {
      this.options = _.extend({}, this.defaults, params || {});
      this.data = this.options.data;
      this.theme = this.options.theme;
      this.animate = this.options.animate;
      this.selectedYear = this.options.currentYear;
      this.chartEl = this.options.chartEl;
      this.legendEl = this.options.legendEl;
      this.margin = this.options.margin;
      this.barsRange = this.options.barsRange;
      this.animationType = this.options.animationType;
      this.animationTime = this.options.animationTime;
      this.removeTimeout = this.options.removeTimeout;

      this._render();
      this._setListeners();
    },

    /**
     * Set listeners
     */
    _setListeners: function() {
      $(this.legendEl).delegate('.action', 'click', this._filterByDate.bind(this));
    },

    /**
     * Unset listeners
     */
    _unsetListeners: function() {
      $(this.legendEl).undelegate('.action', 'click');
    },


    _render: function() {
      this._setUpGraph();
      this._parseData();
      this._setAxisScale();
      this._setDomain();
      this._checkParams();
      this._drawAxis();
      this._drawGraph();
      this._renderLegend();
    },

    _setUpGraph: function() {
      var el = this.el;
      var margin = this.margin;
      this.cWidth = el.clientWidth;
      this.cHeight = el.clientHeight;

      this.cWidth = this.cWidth - margin.left - margin.right;
      this.cHeight = this.cHeight - margin.top - margin.bottom;
      this.radius = Math.min(this.cWidth - this.outerRadius, this.cHeight - this.outerRadius) / 2;

      this.el.classList.add(this.theme.colorPalette === 2 ? '-palette2':'-palette1');

      this.svg = d3.select(el).append('svg')
        .attr('width', this.cWidth + margin.left + margin.right)
        .attr('height', this.cHeight + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    },

    _parseData: function() {
      var allData = this.data;

      if (this.selectedYear) {
        _.map(allData, function(d) {
          d.year = parseInt(d.year, 10);
        });

        this.chartData = _.where(allData, { year: this.selectedYear });
        this.years = _.uniq(_.pluck(allData, 'year'));
      } else {
        this.chartData = allData;
      }

      _.map(this.chartData, function(d) {
        d.x = d.category;
        d.y = d.value;
      });
    },

    _setAxisScale: function() {
      this.x = d3.scale.ordinal()
        .rangeRoundBands([0, this.cWidth], this.barsRange);

      this.y = d3.scale.linear()
        .range([this.cHeight, 0]);

      this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient('bottom')
        .ticks(5)
        .tickSize(0)
        .tickPadding(10)
        .tickFormat('');
    },

    _setDomain: function() {
      this.x.domain(this.chartData.map(function(d) { return d.x; }));
      this.y.domain([0, d3.max(this.chartData, function(d) { return d.y; })]);
    },

    _checkParams: function() {
      if (!this.animate) {
        this.animationTime = 0;
      }
    },

    _drawAxis: function() {
      this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.cHeight + ')')
        .call(this.xAxis);
    },

    _drawGraph: function() {
      var self = this;
      this.svg.selectAll('.bar')
        .data(this.chartData)
        .enter().append('rect')
          .attr('class', 'bar')
          .attr('data-category', function(d) {
            return d.category;
          })
          .style('fill', function(d) { return d.color; })
          .style('stroke', function(d) {
            var color = d.color;
            return color.indexOf('#') ? App.Helper.rgbaToHex(color) : color;
          })
          .attr('x', function(d) { return self.x(d.x); })
          .attr('width', this.x.rangeBand())
          .attr('height', function() {
            return 0;
          })
          .attr('y', function () {
            return self.cHeight;
          })
          .transition()
          .duration(self.animationTime)
          .ease(self.animationType)
          .attr('y', function(d) { return self.y(d.y); })
          .attr('height', function(d) { return self.cHeight - self.y(d.y); });
    },

    _renderLegend: function() {
      if (this.selectedYear) {
        var self = this;
        var years = this.years;
        var container = this.legendEl;

        container.innerHTML = '';

        years.forEach(function(year) {
          var itemEl = document.createElement('div');
          var itemText = document.createTextNode(year);
          itemEl.classList.add('action');
          itemEl.dataset.year = year;
          itemEl.appendChild(itemText);

          if (year === self.selectedYear) {
            itemEl.classList.add('selected');
          }

          container.appendChild(itemEl);
        });
      }
    },

    _resetLegend: function() {
      var container = this.legendEl;
      container.innerHTML = '';
    },

    _filterByDate: function(ev) {
      var element = ev.currentTarget;
      var selectedYear = element.dataset.year;
      var fullDate = new Date(selectedYear);
      var year = fullDate.getFullYear();

      this.trigger('timeline:change:year', year);
    },

    highlight: function(category) {
      // needs jquery because of .classList
      // does not have support on SVG or MathML elements in IE
      var elems = this.$('.bar');
      elems.each(function(index, current){
        var $current = $(current);
        var cat = $current.data('category');
        if ($current && cat) {
          if (category === '') {
            $current.removeClass('unHighLight');
          } else if (cat !== category) {
            $current.addClass('unHighLight');
          } else {
            $current.removeClass('unHighLight');
          }
        }
      });
    },

    prepareRemove: function() {
      var self = this;

      this.animationTime = this.defaults.animationTime;

      this.svg.selectAll('.bar')
        .transition()
        .duration(self.animationTime)
        .ease(self.animationType)
        .attr('y', function(d) { return self.cHeight; })
        .attr('height', function(d) { return 0; });

      if (this.removeTimer) {
        clearTimeout(this.removeTimer);
        this.removeTimer = null;
      }

      this.removeTimer = setTimeout(this.remove.bind(this), this.removeTimeout);
    },

    remove: function() {
      if(this.svg) {
        var svgContainer = this.el.querySelector('svg');

        this.svg.remove();
        this.svg = null;
        this.el.removeChild(svgContainer);
        this._resetLegend();

        this._unsetListeners();
        this.undelegateEvents();
      }
    }
  });

})(window.App || {});
