angular.module('app.controllers', [])
.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {    	
      element.bind('error', function() {      	
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);          
        }
      });
      if (attrs.$attr['ngSrc']&&!attrs.ngSrc) {
      	 attrs.$set('src', attrs.errSrc);  
      };

    }
  }
})

.directive('ngImagescale', function() {
  return {
    link: function(scope, element, attrs) {  
    	if (element[0].tagName=="IMG") {
			element.bind('load', function() {
				if (attrs.ngImagescale&&(attrs.ngImagescale.split(":")).length==2) {
					var size = attrs.ngImagescale.split(":");
					var w= parseInt(size[0])||0,
						h = parseInt(size[1])||0;
						if (w&&h) {
							element[0].height = element[0].width*h/w;							
						}else{
							element[0].height = element[0].width;
						}					
				} else {
					element[0].height = element[0].width;
				}
			});
    	};
    }
  }
})
.directive('ngBack', function(storage) {
	return {
		link: function(scope, element, attrs) {
			storage.init();
			var referer = storage.get("referer")||"";
			var url = location.href.replace(location.search,'');
			var reg = new RegExp(url,"img");
			var loginReg = /http[^?#=]+login.html/img
			element.bind('click', function() {
				/*
				if (!reg.test(referer)&&!loginReg.test(referer)) {
					storage.toPage(referer);
					return false;
				};
				*/
				if (storage.test(attrs.ngBack)) {
					storage.toPage(attrs.ngBack)
				} else {
					window.history.go(-1);
				};
			});
		}
	}
})

.directive('ngEnter', function () {
    return function (scope, element, attrs) {
    	element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                }); 
                event.preventDefault();
            }
        });
    };
})

.controller("travelC", function ($scope,listS,storage,ngMessage) {
    storage.init();
    var token = storage.get("token");
    var page=1;
    var cat_id=storage.getUrlParam('cat_id')||"";
    $scope.page={
		search : ""
	};
	$scope.category_search=function(v){
	 //alert("kkk");
	if(v){
		page=v;
	}
	listS.category_search({
		"page": page,
		"cat_id":cat_id,
		"search":$scope.page.search,

		//"token": token
	}, function(res) {  //精选推荐
		if (res.resCode == "SUCCESS") {
		page++;
		if (page>2) {
				//data.page++;
				var tmp = angular.copy($scope.datalist.data);
				$scope.datalist.data = tmp.concat(res.data)
				//$scope.showToTop = isLast ? true : false;
			}else{
				//data.page++;
				//$scope.showToTop = false;
				//$scope.list = res
				$scope.datalist = res;
			}
			for(var i=0;i<$scope.datalist.data.length;i++){
				$scope.datalist.data[i].price = parseFloat($scope.datalist.data[i].price);
			}
			console.log($scope.datalist.data);
		}else {
         res && ngMessage.showTip(res.resMsg);
		}
	});
    }
    $scope.category_search();
})

.controller("travellistC", function ($scope,listS,storage,ngMessage) {
    storage.init();
    var token = storage.get("token");
    var page=1;
    var cat_id=storage.getUrlParam('cat_id')||"";

    var dt_id=storage.getUrlParam('dt_id')||"";
    console.log(cat_id+"与"+dt_id);
    $scope.search_catid=cat_id;
    $scope.page={
		search : ""
	};
	$scope.more_base=function(){
		listS.more_base({
		 "page": page,

		//"token": token
	}, function(res) {  //精选推荐
		if (res.resCode == "SUCCESS") {
          //$scope.datas = res;
          page++;
		if (page>2) {
				//data.page++;
				var tmp = angular.copy($scope.datas.data);
				$scope.datas.data = tmp.concat(res.data)
				//$scope.showToTop = isLast ? true : false;
			}else{
				$scope.datas = res;
			}
			console.log($scope.datas);
		}else{
		  res && ngMessage.showTip(res.resMsg);
		}
	})
	}
	$scope.more_base();
	/*
	$scope.category_search=function(v){
	 //alert("kkk");
	if(v){
		page=v;
	}
	listS.category_search({
		"page": page,
		"cat_id":cat_id,
		"search":$scope.page.search,
        "dt_id":dt_id
		//"token": token
	}, function(res) {  //精选推荐
		if (res.resCode == "SUCCESS") {
		page++;
		if (page>2) {
				//data.page++;
				var tmp = angular.copy($scope.datalist.data);
				$scope.datalist.data = tmp.concat(res.data)
				//$scope.showToTop = isLast ? true : false;
			}else{
				//data.page++;
				//$scope.showToTop = false;
				//$scope.list = res
				$scope.datalist = res;
			}
		 //$scope.routes = res;
		console.log(res)
		}else {
         res && ngMessage.showTip(res.resMsg);
		}
	});
    }
    $scope.category_search();
    */
})

.controller("traveldetailC", function ($scope,listS,storage,ngMessage) {
    storage.init();
    var token = storage.get("token");
    var page=1;
    var base_id=storage.getUrlParam('gid')||"";
    var dt_id=storage.getUrlParam('dt_id')||"";
    var cat_id = storage.get("cat_id");
    console.log(cat_id+"与"+dt_id);
    $scope.search_catid=cat_id;
    $scope.page={
		search : ""
	};
	$scope.base_info=function(){
		listS.base_info({
		

		"base_id": base_id,
	}, function(res) {  //精选推荐
		if (res.resCode == "SUCCESS") {
          $scope.datas = res;
		}else{
		  res && ngMessage.showTip(res.resMsg);
		}
	})
	}
	$scope.base_info();
	/*
	$scope.category_search=function(v){
	 //alert("kkk");
	if(v){
		page=v;
	}
	listS.category_search({
		"page": page,
		"cat_id":cat_id,
		"search":$scope.page.search,
        "dt_id":dt_id
		//"token": token
	}, function(res) {  //精选推荐
		if (res.resCode == "SUCCESS") {
		page++;
		if (page>2) {
				//data.page++;
				var tmp = angular.copy($scope.datalist.data);
				$scope.datalist.data = tmp.concat(res.data)
				//$scope.showToTop = isLast ? true : false;
			}else{
				//data.page++;
				//$scope.showToTop = false;
				//$scope.list = res
				$scope.datalist = res;
			}
		 //$scope.routes = res;
		console.log(res)
		}else {
         res && ngMessage.showTip(res.resMsg);
		}
	});
    }
    $scope.category_search();
    */
})

.controller("travelindexC", function ($scope,listS,storage,ngMessage) {
    storage.init();
    var token = storage.get("token");
    var page=1;
    var cat_id=storage.getUrlParam('cat_id')||"";
    var dt_id=storage.getUrlParam('dt_id')||"";
    storage.set("cat_id", cat_id);
    console.log(cat_id+"与"+dt_id);
    $scope.search_catid=cat_id;
    $scope.page={
		search : ""
	};
	$scope.myshow=true;
	$scope.base_index=function(){
		listS.base_index({
		

		//"token": token
	}, function(res) {  //精选推荐
		if (res.resCode == "SUCCESS") {
          $scope.datas = res;
          if(!$scope.datas.data.length){
          	$scope.myshow=false;
          }
		}else{
		  res && ngMessage.showTip(res.resMsg);
		}
	})
	}
	$scope.base_index();
	$scope.category_search=function(v){
		 //alert("kkk");
		if(v){
			page=v;
		}
		listS.category_search({
			"page": page,
			"cat_id":cat_id,
			"search":$scope.page.search,
	        "dt_id":dt_id
			//"token": token
		}, function(res) {  //精选推荐
			if (res.resCode == "SUCCESS") {
			page++;
			if (page>2) {
					//data.page++;
					var tmp = angular.copy($scope.datalist.data);
					$scope.datalist.data = tmp.concat(res.data)
					//$scope.showToTop = isLast ? true : false;
				}else{
					//data.page++;
					//$scope.showToTop = false;
					//$scope.list = res
					$scope.datalist = res;
				}
				for(var i=0;i<$scope.datalist.data.length;i++){
				$scope.datalist.data[i].price = parseFloat($scope.datalist.data[i].price);
				}
				console.log($scope.datalist.data);
			 //$scope.routes = res;
			}else {
	         res && ngMessage.showTip(res.resMsg);
			}
		});
	};
	$scope.category_search();
	$scope.showdetail = function(id) {
		var href = "detail.html?gid="+id;
		window.location.href = href;
//		var historyhref = "domesticTravelindex.html?cat_id="+cat_id;
//		storage.set("referer",historyhref)
	};
	$scope.more = function(id) {
		var href = "aroundTravelt.html?cat_id="+id;
		window.location.href = href;
//		var historyhref = "domesticTravelindex.html?cat_id="+cat_id;
//		storage.set("referer",historyhref)
	};
})

.controller("travelsC", function ($scope,listS,storage,ngMessage) {
    storage.init();
    var token = storage.get("token");
    var page=1;
    var cat_id=storage.getUrlParam('cat_id')||"";
    var dt_id=storage.getUrlParam('dt_id')||"";
    console.log(cat_id+"与"+dt_id);
    $scope.search_catid=cat_id;
    $scope.page={
		search : ""
	};
	$scope.domestic_tour=function(){
		listS.domestic_tour({
		

		//"token": token
	}, function(res) {  //精选推荐
		if (res.resCode == "SUCCESS") {
          $scope.datas = res;
		}else{
		  res && ngMessage.showTip(res.resMsg);
		}
	})
	}
	$scope.domestic_tour();
	$scope.category_search=function(v){
	 //alert("kkk");
	if(v){
		page=v;
	}
	listS.category_search({
		"page": page,
		"cat_id":cat_id,
		"search":$scope.page.search,
        "dt_id":dt_id
		//"token": token
	}, function(res) {  //精选推荐
		if (res.resCode == "SUCCESS") {
		page++;
		if (page>2) {
				//data.page++;
				var tmp = angular.copy($scope.datalist.data);
				$scope.datalist.data = tmp.concat(res.data)
				//$scope.showToTop = isLast ? true : false;
			}else{
				//data.page++;
				//$scope.showToTop = false;
				//$scope.list = res
				$scope.datalist = res;
			}
			for(var i=0;i<$scope.datalist.data.length;i++){
			$scope.datalist.data[i].price = parseFloat($scope.datalist.data[i].price);
			}
			console.log($scope.datalist.data);
		 //$scope.routes = res;
		}else {
         res && ngMessage.showTip(res.resMsg);
		}
	});
    }
    $scope.category_search();
})

.controller("listC",function ($scope,listS,storage,ngMessage) {	
	storage.init();
	var index = 1;	
	var token = storage.get("token");
	var isLastPage = false;
	var data = {
		//currentPage: index,
		page: index,
		//count: 10
	};
	$scope.isLastPage = false;
	$scope.show= false;
	/*
	$scope.page={
		search : storage.getOnce("keyword")
	};
	*/
	var searchkey=storage.getUrlParam('searchkey')||"";
	$scope.page={
		search : searchkey
	};
	var oldKey = $scope.page.search; 
	var title = storage.queryField("title")||"";
		window.document.title = decodeURI(title)||"列表页"
	$scope.list = [];
	$scope.xclass="total"
	$scope.lastType = "total";
	var getList = storage.get("getList") || [];
	var tmp = [];
    for (var i = 0; i < getList.length; i++) {
		if (typeof(getList[i]) == "object") {
			tmp.push(getList[i]);
		};
	};

	$scope.load = function(orderType) {
		var tmp = oldKey;
		if(oldKey != $scope.page.search){
			oldKey = $scope.page.search;
			//新请求 初始化start
			 isLastPage = false;
			 data = {
				//currentPage: index,
		        page: index,
		        //count: 10
			};
			$scope.isLastPage = false;
			//新请求 初始化end			
		}
		if ($scope.lastType==orderType) {
			if (isLastPage) {
				//data.currentPage = data.currentPage;
				$scope.isLastPage = false;
			} else {
				//data.currentPage++;
				data.page++;
			}
		}else{
			isLastPage = false;
			$scope.isLastPage = true;
		}
	/*	if(data.currentPage == 1 && tmp == $scope.page.search && !orderType){
			return; //关键字未变化且不是翻页请求 
		}*/
		/*
		if (orderType == "price") {
			data.order = "price|desc";
			$scope.lastType = "price"
		} else if (orderType == "time") {
			data.order = "winsdate|desc"
			$scope.lastType = "time"
		} else {			
			data.order = "totalsales|desc"
			$scope.lastType = "total"
		};
		*/
		data.search = $scope.page.search;
		listS.goods_search(data, function(res,isLast) {
			console.log(res);
			isLastPage = isLast;
			$scope.isLastPage = !isLast;

			if (data.page>1) {
				data.page++;
				var tmp = angular.copy($scope.list.data);
				$scope.list.data = tmp.concat(res.data)
				$scope.showToTop = isLast ? true : false;
			}else{
				data.page++;
				$scope.showToTop = false;
				$scope.list = res
			};
			for(var i=0;i<$scope.list.data.length;i++){
			$scope.list.data[i].price = parseFloat($scope.list.data[i].price);
			}
			console.log($scope.list.data);
			console.log(data.page);
	    if($scope.list.data.length<((data.page-1)*10)){
	       $scope.isLastPagess=true;
	    }else{
	    	$scope.isLastPagess=false;
	    };
			if($scope.list.data.length>0){
				$scope.show= true;
			}
			/*
			for(i=0;i<$scope.list.data.length;i++){
				for(y=0;y<$scope.list.data[i].tag_name.length;y++){
				if($scope.list.data[i].tag_name[y].name=="精品养生"){

				}
			}
			}
			*/
			// if (res.lastPage == "0") {
			// 	$scope.hasMore = false;
			// 	alert(4)
			// } else {
			// 	$scope.hasMore = false;
			// 	alert(5)
			// };
		});
		return orderType;
	};
	//$scope.load();
    
 //    $scope.next = function(orderType) {
	// 	if ($scope.lastType==orderType) {
	// 		data.currentPage--;
	// 		// if (data.currentPage < 1) {
	// 		// 	alert(999)
	// 		// }
	// 		// console.log(data.currentPage)
	// 	}else{
	// 		isLastPage = false;
	// 		data.currentPage = 1;
	// 	}

	// 	window.scrollTo(0,document.body.scrollHeight); 
 //        window.scrollTo(0,0);

	// 	if (data.currentPage == 0) {
	// 		data.currentPage = 1;
	// 		ngMessage.showTip("已到第一页！");
	// 	}
	// 	if (orderType == "price") {
	// 		data.order = "price|desc";
	// 		$scope.lastType = "price"
	// 	} else if (orderType == "time") {
	// 		data.order = "winsdate|desc"
	// 		$scope.lastType = "time"
	// 	} else {			
	// 		data.order = "totalsales|desc"
	// 		$scope.lastType = "total"
	// 	};
	// 	data.key = $scope.page.search;
	// 	listS.getList(data, function(res,isLast) {
	// 		$scope.list = res;
	// 		isLastPage = isLast;
	// 	});
	// 	return orderType;
		
	// };

	// $scope.next();


	$scope.toPage = function (page) {
		storage.toPage(page)
	}

	$scope.toDetail = function(v){
		if (v.goods_id) {
			storage.toPage("detail","?gid="+v.goods_id)
		};
		
	}
	
	
	
	$scope.toTop = function(){
		window.scrollTo(0,0);
	}
})
.controller("brandC",function ($scope,listS,storage) {	
	storage.init();
	var isLastPage = false;
	var data = {
		currentPage: 1,
		count: 20
	};
	var title = storage.queryField("title")||"商品品牌"
	$scope.list = [];
	$scope.xclass="total";	
	$scope.title = window.document.title = decodeURI(title);
	$scope.lastType = "total";
	$scope.load = function(orderType) {		
		!isLastPage&&listS.getList(data, function(res,isLast) {
			var index=-1;
			for (var i = 0; i < res.length; i++) {
				if (i%2==0) {
					index++;
					$scope.list[index]=[];					
				};
				$scope.list[index].push(res[i])
			};

			isLastPage = isLast;
		});
		return orderType;
	};

	$scope.load();	

	$scope.toPage = function(page) {
		storage.toPage(page)
	}
})

.controller("listTimeC",function ($scope,listS,$interval,storage,ngMessage) {	
	storage.init();
	var token = storage.get("token");
	var activity = storage.get("activity");
    var tt = [];
	listS.getActivityList({
		"promotionId":storage.queryField('promotionId')
	},function(res){
		if(res.resCode == "UNKNOWN_ERROR") {
			alert(5555)
		}
		$scope.getActivityList = res;
		res = res.data;
	    
		if(res.type == 3 && res.timeType == 0){
    		var oDateNow = new Date();
    		$interval(upDate2, 1000, (res.endTime*1000 - oDateNow.getTime())/1000, null,res);	
    		return;
    	}
    	// console.log(res.type)
		for (var i=0;i<res.goods.length;i++) {
			var oDateNow = new Date();
	        $interval(upDate, 1000, (res.goods[i].endTime*1000 - oDateNow.getTime())/1000, null,res.goods[i],i);	
	    }

	})

	function upDate2(k) {
	    var oDateNow = new Date();
		var remain = (k.endTime*1000 - oDateNow.getTime())/1000;
		
		var t = remain%86400
		var iDay = parseInt(remain/86400);
			remain%=86400;
		var iHours = parseInt(remain/3600);
			remain%=3600;
		var iMinuter = parseInt(remain/60);
			remain%=60
		var iSeconds = parseInt(remain);

		function setDigit(mun, n) {
			var str = ''+mun;
			if (str.length<n) {
				str = "0"+str;
			}
			return str;
		}
		
       var h = setDigit(iHours,2);
       var m = setDigit(iMinuter,2);
       var s = setDigit(iSeconds,2);
       
		$scope.getActivityList.data.iHours = h;
		$scope.getActivityList.data.iMinuter = m;
		$scope.getActivityList.data.iSeconds = s;

		$scope.$applyAsync();
	} 

	function upDate(v,i) {
	    var oDateNow = new Date();
		var remain = (v.endTime*1000 - oDateNow.getTime())/1000;
		var t = remain%86400
            if (remain%86400 <= 0) {
            	$scope.getActivityList.data.goods[i].filter = false;
            	$scope.getActivityList.data.goods[i].option = true;
            }else{
            	$scope.getActivityList.data.goods[i].filter = true;
            	$scope.getActivityList.data.goods[i].option = false;
            }
		var iDay = parseInt(remain/86400);
			remain%=86400;
		var iHours = parseInt(remain/3600);
			remain%=3600;
		var iMinuter = parseInt(remain/60);
			remain%=60
		var iSeconds = parseInt(remain);

		function setDigit(mun, n) {
			var str = ''+mun;
			if (str.length<n) {
				str = "0"+str;
			}
			return str;
		}
		
       var h = setDigit(iHours,2);
       var m = setDigit(iMinuter,2);
       var s = setDigit(iSeconds,2);
		$scope.getActivityList.data.goods[i].iHours = h;
		$scope.getActivityList.data.goods[i].iMinuter = m;
		$scope.getActivityList.data.goods[i].iSeconds = s;

		$scope.$applyAsync();
	} 
})



