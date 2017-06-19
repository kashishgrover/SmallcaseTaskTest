angular.module('SmallcaseTask.filter', [])

.filter('pagination', function() {
  return function(input, start) {
  	if (!input || !input.length) { return; }
    start = +start;
    return input.slice(start);
  };
});
