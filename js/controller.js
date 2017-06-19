angular.module('SmallcaseTask.controller', [])

.controller('stocksController', function($scope, $http) {

	$scope.stockPageSize = 8;
	$scope.currentPage = 0;
	$scope.portfolioArray = new Array();
	$scope.portfolioDict = {};
	$scope.netWorth = 0;
    $scope.graphArray = [];
    $scope.arrayToPlot = [];

	var isDropping = true;

	$http.get('data/data.json').success(function(data) {
		$scope.stockPrices = getArray(data.price);
		$scope.totalStocks = $scope.stockPrices.length;
    	$scope.numberOfPages = numberOfPages($scope.stockPrices, $scope.stockPageSize);
		$scope.stockEPSobj = data.eps;
		// console.log("Stock EPS",$scope.stockEPSobj);
		$scope.stockHistoricals = data.historical;
        $scope.formattedArray = getFormattedHistoricalArray($scope.stockHistoricals);
        // $scope.arrayToPlot = $scope.formattedArray[0][1];
	});

    $scope.onDropComplete=function(data,evt) {
    	isDropping = true;
        $scope.portfolioDict[data] = ($scope.portfolioDict[data] || 0) + 1;
        $scope.portfolioArray = getArray($scope.portfolioDict);
        $scope.netWorth = calculateNetWorth($scope.portfolioArray);
        $scope.arrayToPlot = getArrayToPlot($scope.formattedArray, $scope.portfolioArray);
    }

    $scope.onClick=function(data) {
    	if (isDropping) 
    		isDropping = false;
    	else {
	        $scope.portfolioDict[data] = ($scope.portfolioDict[data] || 0) + 1;
	        $scope.portfolioArray = getArray($scope.portfolioDict);
	        $scope.netWorth = calculateNetWorth($scope.portfolioArray);
            $scope.arrayToPlot = getArrayToPlot($scope.formattedArray, $scope.portfolioArray);
    	}
    }

    $scope.incrementShareCount = function(element) {
        $scope.portfolioDict[element[0]] = ($scope.portfolioDict[element[0]] || 0) + 1;        
        $scope.portfolioArray = getArray($scope.portfolioDict);
        $scope.netWorth = calculateNetWorth($scope.portfolioArray);
        $scope.arrayToPlot = getArrayToPlot($scope.formattedArray, $scope.portfolioArray);
    }

    $scope.decrementShareCount = function(element) {
    	if($scope.portfolioDict[element[0]] == 1) {
    		delete $scope.portfolioDict[element[0]];
        	$scope.portfolioArray = getArray($scope.portfolioDict);
        	$scope.netWorth = calculateNetWorth($scope.portfolioArray);
            $scope.arrayToPlot = getArrayToPlot($scope.formattedArray, $scope.portfolioArray);
    	}
    	else {
    		$scope.portfolioDict[element[0]] = ($scope.portfolioDict[element[0]] || 0) - 1;
        	$scope.portfolioArray = getArray($scope.portfolioDict);
        	$scope.netWorth = calculateNetWorth($scope.portfolioArray);          
            $scope.arrayToPlot = getArrayToPlot($scope.formattedArray, $scope.portfolioArray);
    	}
    }

    $scope.getWeightage = function(element) {
    	// Weightage = (Stock Price * Shares Held)/Net Worth
    	var price = element[0].split(",")[1];
    	var shareCount = element[1];
    	var weightage = (price * shareCount) / $scope.netWorth * 100;
    	return weightage.toFixed(2);
    }

    $scope.getPERatio = function() {
    	// Portfolio P/E Ratio = Net Worth/Sum(Stock EPS * Shares Held)
    	var netWorth = $scope.netWorth;
    	var array = $scope.portfolioArray;

    	if (array.length === 0) {
    		return 0;
    	}

    	var stockEPSobj = $scope.stockEPSobj;

    	var sum = 0;
		for (var i = 0; i < array.length; i++) {
			var stockName = array[i][0].split(",")[0];
			var stockEPS = stockEPSobj[stockName];
			var stockSharesHeld = array[i][1];
			sum += (stockEPS * stockSharesHeld);
		}

		return (netWorth/sum).toFixed(2);
    }
})

function getArray (obj) {
	var array = new Array();
	angular.forEach(obj, function(price, name) {
		array.push([name,price]);
  	});
  	return array;
}

function countProperties(obj) {
    var count = 0;
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }
    return count;
}

function numberOfPages(dataArray, pageSize) {
	return Math.ceil(dataArray.length / pageSize);
}

function calculateNetWorth(array) {
	var arrayLength = array.length;
	var netWorth = 0;
	for (var i = 0; i < arrayLength; i++) {
		var price = array[i][0].split(",")[1];
		var count = array[i][1];
		netWorth += (price * count);
	}
	return netWorth.toFixed(2);
}

function getFormattedHistoricalArray(obj) {

    var formattedArray = [];

    for (var key in obj) {
      var properties = obj[key];

      if (typeof properties === "object") {
        var array = [];

        for(var propKey in properties) {
          array.push([properties[propKey]]);
        }

        var nameArray = getNameArray(array[1]);

        formattedArray.push([String(array[0]),nameArray]);
      }
    }
    // console.log(formattedArray);
    return formattedArray;
}

function getNameArray(array) {
    var nameArray = [];

    for (var i = 0; i<array.length; i++) {
      for (key in array[i]) {
        // nameArray.push(array[i][key]["date"]+ "***"+ array[i][key]["price"]);
        var date = array[i][key]["date"].split("T")[0];
        var price = array[i][key]["price"];
        nameArray.push([date,price]);
      }
    }

    return nameArray;
}

function getArrayToPlot(formattedArray, portfolioArray) {
    // console.log(formattedArray);

    var historyNetWorthList = [];
    var historyDateList = [];

    var historySize = formattedArray[0][1].length;
    // console.log("historySize: ",historySize)

    //Get Historical Dates
    // console.log(formattedArray[0][1]);
    for (var i=0; i<historySize; i++) {
        historyDateList.push(formattedArray[0][1][i][0]);
    }

    //Initialize History Networth List
    for (var i=0; i<historySize; i++) {
        historyNetWorthList[i] = 0;
    }

    //Calculate Historical networth
    for (var i=0; i<portfolioArray.length; i++)
    {
        var count = portfolioArray[i][1];
        var name = portfolioArray[i][0].split(",")[0];        
        // console.log("Name:" + name, "Count:" + count);

        for (var j=0; j<formattedArray.length; j++) {
            if (formattedArray[j][0] === name) {
                // console.log(formattedArray[j][0])
                // console.log(count);
                for (var k=0; k<historySize; k++) {
                    // console.log(formattedArray[j][1][k][1]);
                    historyNetWorthList[k] = historyNetWorthList[k] + formattedArray[j][1][k][1] * count;
                    // console.log(historyNetWorthList[k]);
                }
                // console.log(formattedArray[j][1][0])
            }
        }
    }

    //Refactor the array to have format as ["date", value]

    var arrayToPlot = [];

    for (var i=0; i<historySize; i++) {
        // arrayToPlot[i] = [String(historyDateList[i]), Math.floor(historyNetWorthList[i])];
        arrayToPlot[i] = [historyDateList[i], historyNetWorthList[i]];
    }

    // console.log([historyNetWorthList, historyDateList]) //To be returned
    // console.log(arrayToPlot);
    return arrayToPlot;
}