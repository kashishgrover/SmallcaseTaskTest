angular.module('SmallcaseTask.directive', [])
.directive("linearChart", function($window) {
  return {
    restrict: "EA",
    template: "<svg width='100%' height='100%'></svg>",
    link: function(scope, elem, attrs){

      // var margin = {top: 20, right: 20, bottom: 30, left: 50};
      var width = 280;//- margin.left - margin.right;
      var height = 120;// - margin.top - margin.bottom;

      var x = d3.time.scale()
        .range([0, width]);

      var y = d3.scale.linear()
        .range([height, 0]);
      
      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

      var parseDate = d3.time.format("%Y-%m-%d").parse;
      
      var data = null;
      
      var rawSvg=elem.find('svg');
      var svg = d3.select(rawSvg[0])

      scope.$watch('arrayToPlot', function(newVal, oldVal) {

        if (newVal !== oldVal) {

          d3.selectAll("svg > *").remove();

          arrData = scope.arrayToPlot;
          
          data = arrData.map(function(d) {
            // console.log(+parseDate(d[0]));
            // console.log(+d[1]);
            return {
               date : parseDate(d[0]),
               totalprice : +d[1]
            };            
          });
          // console.log(data);

          var line = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.totalprice); });

          var area = d3.svg.area()
            .x(function(d) { return x(d.date); })
            .y1(function(d) { return y(d.totalprice); });

          x.domain(d3.extent(data, function(d) { return d.date; }));
          y.domain(d3.extent(data, function(d) { return d.totalprice; }));
          area.y0(y(0));

          svg.append("g")
            .attr("class", "x axis")
            .call(xAxis)
            // .append("text")
            .attr("transform", "translate(0," + height + ")")
            // .attr("transform", "rotate(-180)")
            .attr("stroke", "black")
            .text("Time");

          svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Price (₹)");

          svg.append("path")
            .datum(data)
            .attr("fill", "#82afe4")
            .attr("opacity", "0.7")
            .attr("stroke", "#1d70ca")
            // .attr("class", "line")
            .attr("d", area);
        }
      });
    }
  };
});