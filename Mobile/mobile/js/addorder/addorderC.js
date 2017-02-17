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

				if (storage.test(attrs.ngBack)) {
					storage.toPage(attrs.ngBack)
				} else if (!reg.test(referer) && !loginReg.test(referer)) {
					storage.toPage(referer);
					return false;
				} else {
					window.history.go(-1);
				};

			});
		}
	}
})
.controller("addsendC",function ($scope,orderS,storage,ngMessage) {	
	storage.init();
	
	//$scope.isDisplay = false;
	//var index = 1;	
	//var type= storage.queryField("type")||storage.getOnce("orderType")||0;      //getOnce

	var token = storage.get("token");
	if (!token) {
		storage.toPage("login");
	};
     
    $scope.canshu = function() { 
         $(".beijins").show();
         $("#showsel").animate({bottom: "0px"}, 1000 );
         //$scope.addressArea.getPr();
    };
     $scope.cancel=function(v){
	$("#showsel").animate({bottom: "-35%"},10);
	setTimeout(function(){
 	$(".beijins").hide();
 	}, 50)
 	if(v){
 		 for(i=0;i<$scope.addressArea.provice.length;i++){
						$scope.addressArea.provice[i].check=false;
					}
  		 $scope.addressArea.useProvice="请选择";
		 $scope.addressArea.provice_id=" ";
		}
	}
    
     $scope.canshus = function() { 
         $(".beijinss").show();
         $("#showsels").animate({bottom: "0px"}, 1000 );
         $scope.addressArea.getCi($scope.addressArea.provice_id);
    };
     $scope.cancels=function(v){
	$("#showsels").animate({bottom: "-35%"},10);
	setTimeout(function(){
 	$(".beijinss").hide();
 	}, 50)
  		if(v){
  		 for(i=0;i<$scope.addressArea.city.length;i++){
						$scope.addressArea.city[i].check=false;
					}
  		 $scope.addressArea.useCity="请选择";
		 $scope.addressArea.city_id=" ";
		}
	}
	 $scope.canshut = function() { 
         $(".beijinst").show();
         $("#showselt").animate({bottom: "0px"}, 1000 );
         $scope.addressArea.getCo($scope.addressArea.provice_id,$scope.addressArea.city_id);
    };
     $scope.cancelt=function(v){
	$("#showselt").animate({bottom: "-35%"},10);
	setTimeout(function(){
 	$(".beijinst").hide();
 	}, 50)
  		if(v){
  		 for(i=0;i<$scope.addressArea.county.length;i++){
						$scope.addressArea.county[i].check=false;
					}
  		 $scope.addressArea.useCounty="请选择";
		 $scope.addressArea.country_id=" ";
		}
	}
		 $scope.canshuts = function() { 
         $(".beijinsts").show();
         $("#showselts").animate({bottom: "0px"}, 1000 );
         $scope.addressArea.getto($scope.addressArea.provice_id,$scope.addressArea.city_id,$scope.addressArea.county_id);
    };
     $scope.cancelts=function(v){
	$("#showselts").animate({bottom: "-35%"},10);
	setTimeout(function(){
 	$(".beijinsts").hide();
 	}, 50)
  		if(v){
  		 for(i=0;i<$scope.addressArea.town.length;i++){
						$scope.addressArea.town[i].check=false;
					}
  		 $scope.addressArea.usetown="请选择";
		 $scope.addressArea.town_id=" ";
		}
	}
	$scope.checksel=function (v) {
		//if(v.number){
			//return
		//}else{
		for (var i = 0; i < $scope.addressArea.provice.length; i++) {
				$scope.addressArea.provice[i].check=false;
		};
		v.check = !v.check;
		$scope.addressArea.useProvice=v.provice_name;
		$scope.addressArea.provice_id=v.provice_id;
		//$scope.times=v.appoint_time;
	//}
	}
	$scope.checkshi=function (v) {
		//if(v.number){
			//return
		//}else{
		for (var i = 0; i < $scope.addressArea.city.length; i++) {
				$scope.addressArea.city[i].check=false;
		};
		v.check = !v.check;
		$scope.addressArea.useCity=v.city_name;
		$scope.addressArea.city_id=v.city_id;
		//$scope.times=v.appoint_time;
	//}
	}
		$scope.checkxian=function (v) {
		//if(v.number){
			//return
		//}else{
		for (var i = 0; i < $scope.addressArea.county.length; i++) {
				$scope.addressArea.county[i].check=false;
		};
		v.check = !v.check;
		$scope.addressArea.useCounty=v.county_name;
		$scope.addressArea.county_id=v.county_id;
		//$scope.times=v.appoint_time;
	//}
	}
		$scope.checktown=function (v) {
		//if(v.number){
			//return
		//}else{
		for (var i = 0; i < $scope.addressArea.town.length; i++) {
				$scope.addressArea.town[i].check=false;
		};
		v.check = !v.check;
		$scope.addressArea.usetown=v.town_name;
		$scope.addressArea.town_id=v.town_id;
		//$scope.times=v.appoint_time;
	//}
	}
	//新增/编辑地址管理
	$scope.addressArea={
		"username":"",
		"mobile":"",
		"address":"",
		"provice":[],
		"useProvice":"请选择",
		"city":[],
		"useCity":"请选择",
		"county":[],
		"useCounty":"请选择",
		"town":[],
		"usetown":"请选择",
		"isDefault":0,
		"getPr":function () {
			orderS.area({},function(res) {
				if (res) {
					$scope.addressArea.provice = res.data||[];
					for(i=0;i<$scope.addressArea.provice.length;i++){
						$scope.addressArea.provice[i].check=false;
					}
				};				
			});
			//$scope.addressArea.onChange()
		},
		"getCi":function (pid) {
			orderS.area({
				"pid":pid
			}, function(res) {
				if (res) {
					$scope.addressArea.city = res.data || [];
					for(i=0;i<$scope.addressArea.city.length;i++){
						$scope.addressArea.city[i].check=false;
					}
					/*
					if ($scope.recAddress.edit) {
						for (var i = 0; i < res.data.length; i++) {
							if (res.data[i].city_id == $scope.recAddress.edit.city) {
								$scope.addressArea.useCity = res.data[i];
								break;
							};
						};
					};
					*/
				};
			})
		},
		"getCo":function (pid,cid) {
			orderS.area({
				"pid":pid,
				"cid": cid
			}, function(res) {
				if (res) {
					$scope.addressArea.county = res.data || [];
					for(i=0;i<$scope.addressArea.county.length;i++){
						$scope.addressArea.county[i].check=false;
					}
					/*
					if ($scope.recAddress.edit) {
						for (var n = 0; n < res.data.length; n++) {
							if (res.data[n].county_id == $scope.recAddress.edit.county) {
								$scope.addressArea.useCounty = res.data[n];
								break;
							};
						};
					};
					*/
				};
			})
		},
		"getto":function (pid,cid,countyId) {
			orderS.area({
				"pid":pid,
				"cid": cid,
				"countyId":countyId,
			}, function(res) {
				if (res) {
					$scope.addressArea.town = res.data || [];
					for(i=0;i<$scope.addressArea.town.length;i++){
						$scope.addressArea.town[i].check=false;
					}
					/*
					if ($scope.recAddress.edit) {
						for (var n = 0; n < res.data.length; n++) {
							if (res.data[n].county_id == $scope.recAddress.edit.county) {
								$scope.addressArea.useCounty = res.data[n];
								break;
							};
						};
					};
					*/
				};
			})
		},
		"onChange":function () {
			var p = $scope.$watch("addressArea.useProvice", function(n, o) {
				$scope.addressArea.useCity=null;
				$scope.addressArea.useCounty=null;
				if (n) {
					$scope.addressArea.getCi(n.provice_id);
				};

			});
			var ci = $scope.$watch("addressArea.useCity", function(n, o) {
				$scope.addressArea.useCounty=null;
				if (n) {
					$scope.addressArea.getCo(n.province_id,n.city_id)
				};
			});
		},
		"add":function () {
			var data={
				"token":token,
				"mobile":$scope.addressArea.mobile,
				"provice":$scope.addressArea.provice_id||"",
				"city":$scope.addressArea.city_id||"",
				"county":$scope.addressArea.county_id||"",
				"town":$scope.addressArea.town_id,
				"address":$scope.addressArea.address,
				"name":$scope.addressArea.username,
				//"isDefault":$scope.addressArea.isDefault?1:0
			};
             //console.log(data);return false;
			if (!data.name) {
				ngMessage.showTip("请填写收件人！");
				return false
			};
//			if (data.name&&!/^[\u4e00-\u9fa5]{2,5}$/gi.test(data.name)) {
//				ngMessage.showTip("收件人只能2~5个汉字！");
//				return false
//			};
			if (data.name&&data.name.length<2) {
				ngMessage.showTip("收件人至少为两个字符！");
				return false
			};
			if (!data.mobile||!/^[1][35867][0-9]{9}$/.test(data.mobile)) {
				ngMessage.showTip("请输入有效的手机号！");
				return false
			};
			if (!data.provice) {
				ngMessage.showTip("请选择省份！");
				return false
			};
			if (!data.city) {
				ngMessage.showTip("请选择城市！");
				return false
			};
			if (!data.county) {
				ngMessage.showTip("请选择县区！");
				return false
			};
			if (!data.town) {
				ngMessage.showTip("请选择街道！");
				return false
			};
			if (!data.address) {
				ngMessage.showTip("请填写详细地址！");
				return false
			};
			if (data.address&&data.address.length<5||data.address.length>60) {
				ngMessage.showTip("详细地址应为5~60个字符！");
				return false
			};
			/*
			if ($scope.recAddress.edit&&$scope.recAddress.edit.id) {
				data.addressId = $scope.recAddress.edit.id;
				orderS.updateRecAddress(data,function(res) {
					if (res.resCode=="SUCCESS") {
						ngMessage.showTip(res.resMsg);
						$scope.switchLayout("index");
						$scope.recAddress.get(data.addressId);
					}else{
						res&&ngMessage.showTip(res.resMsg);
					}
				});
			}else{
			*/
				orderS.addRecAddress(data,function(res) {
					if (res.resCode=="SUCCESS") {
						ngMessage.showTip(res.resMsg,1200,function(){
							window.history.go(-1);
						});
						console.log(res);
						//$scope.switchLayout("index");
						//$scope.recAddress.get(res.addressId);
					}else{
						res&&ngMessage.showTip(res.resMsg);
					}
				});
			//}
		},
		"clear":function () {
			$scope.recAddress.edit = null;
			$scope.addressArea.username = "";
			$scope.addressArea.mobile = "";
			$scope.addressArea.address = "";
			$scope.addressArea.isDefault = 0;
			$scope.addressArea.useProvice = null;
			$scope.addressArea.useCity = null;
			$scope.addressArea.useCounty = null;
		},
		"del":function () {
			ngMessage.show("确定删除该收货地址！", function() {
				orderS.delRecAddress({
					"addressId": $scope.recAddress.edit.id,
					"token": token
				}, function(res) {
					res && ngMessage.showTip(res.resMsg);
					$scope.recAddress.get();
					$scope.switchLayout("index");
				})
			})
		},
		"setDefault":function () {
			if ($scope.recAddress.edit && $scope.recAddress.edit.id) {
				orderS.setDefault({
					"addressId": $scope.recAddress.edit.id,
					"token": token
				}, function(res) {
					if (res.resCode == "SUCCESS") {
						$scope.recAddress.get();
					};
				});
			};
		}
	}
	$scope.addressArea.getPr();
	

})

.controller("addfapiaoC",function ($scope,orderS,storage,ngMessage) {	
	storage.init();
	
	//$scope.isDisplay = false;
	//var index = 1;	
	//var type= storage.query\nField("type")||storage.getOnce("orderType")||0;      //getOnce

	var token = storage.get("token");
	if (!token) {
		storage.toPage("login");
	};
	 $scope.addinvoice=function(){
	 	var data={
			"token":token,
			"invoicePayee":$scope.fapiao,
		};
		if (!data.invoicePayee) {
			ngMessage.showTip("请填写发票抬头！");
			return false
		};
		if (data.invoicePayee&&(data.invoicePayee.length<2||data.invoicePayee.length>50)) {
			ngMessage.showTip("发票抬头应为2~50个字符！");
			return false
		};
    orderS.addinvoice(data, function(res) {
		if (res.resCode == "SUCCESS") {
            console.log(res);
            //$scope.dataslist=res;
            ngMessage.showTip(res.resMsg,1200,function(){
            	window.history.go(-1);
            });
		}else{
		   res && ngMessage.showTip(res.resMsg);
		}
	}
		)
    }

})

.controller('sendC',function($scope,storage,orderS,ngMessage){
	storage.init();
	var index = 1;
	var token = storage.get("token");
	var mark = false;
	if (!token) {
		storage.toPage("login");
	};

	$scope.toPage=function (page,key,value) {
		if (!token) {
			ngMessage.showTip("请先登录",2000,function(){
				storage.toPage("login");
			})
		};
		if (key&&value) {
			storage.set(key,value);
		};
	};
	$scope.page={
		showBackbtn:true,
		currentLayout:"index",
		prevLayout:"",
		ppLayout:""
	}
	$scope.layout={
		"index":{
			"show":true,
			"title":"常用地址",
			"back":true,
			"history":true
		},
		"add":{
			"show":false,
			"title":"添加常用地址",
			"back":true,
			"subTitle":"修改常用地址"
		},
	}
	
	$scope.switchLayout = function(layout,b) {
		if ($scope.layout.hasOwnProperty(layout)) {
			for (var i in $scope.layout) {
				if ($scope.layout.hasOwnProperty(i)) {
					$scope.layout[i].show = false;
				}
			}
			$scope.layout[layout].show = true;
			$scope.page.title = $scope.layout[layout].title+"";
			if (b) {
				$scope.page.title = $scope.layout[layout].subTitle+"";
			};	
			$scope.page.showBackbtn = $scope.layout[layout].back;
			$scope.page.ppLayout = $scope.page.prevLayout ;
			$scope.page.prevLayout = $scope.page.currentLayout;
			$scope.page.currentLayout = layout;
		};
	}
	
	if(mark){
		$scope.switchLayout("add");
//		$scope.addressArea.clear();
	}else{
		$scope.switchLayout("index");
	}
	

  $scope.canshu = function() {
   	$(".beijins").show();
   	$("#showsel").animate({
   		bottom: "0px"
   	}, 600);
     	$scope.addressArea.getPr();
  };
  $scope.cancel = function() {
   	$("#showsel").animate({
   		bottom: "-35%"
   	}, 10);
   	setTimeout(function() {
   		$(".beijins").hide();
   	}, 50)
  }

  $scope.canshus = function() {
   	$(".beijinss").show();
   	$("#showsels").animate({
   		bottom: "0px"
   	}, 600);
   	$scope.addressArea.getCi($scope.addressArea.provice_id);
// 	if ($scope.getSend.edit.provice){
// 		$scope.addressArea.getCi($scope.getSend.edit.provice);
// 	}else{
//	   	$scope.addressArea.getCi($scope.addressArea.provice_id);
// 	}
  };
  $scope.cancels = function() {
   	$("#showsels").animate({
   		bottom: "-35%"
   	}, 10);
   	setTimeout(function() {
   		$(".beijinss").hide();
   	}, 50)

  }
  $scope.canshut = function() {
   	$(".beijinst").show();
   	$("#showselt").animate({
   		bottom: "0px"
   	}, 600);
   	$scope.addressArea.getCo($scope.addressArea.provice_id, $scope.addressArea.city_id);
// 	if ($scope.getSend.edit.provice&&$scope.getSend.edit.city){
// 		$scope.addressArea.getCo($scope.getSend.edit.provice,$scope.getSend.edit.city);
// 	}else{
//	   	$scope.addressArea.getCo($scope.addressArea.provice_id, $scope.addressArea.city_id);
// 	}
  };
  $scope.cancelt = function() {
   	$("#showselt").animate({
   		bottom: "-35%"
   	}, 10);
   	setTimeout(function() {
   		$(".beijinst").hide();
   	}, 50)

  }
  $scope.canshuts = function() {
   	$(".beijinsts").show();
   	$("#showselts").animate({
   		bottom: "0px"
   	}, 600);
   	$scope.addressArea.getto($scope.addressArea.provice_id, $scope.addressArea.city_id, $scope.addressArea.county_id);
// 	if ($scope.getSend.edit.provice&&$scope.getSend.edit.city&&$scope.getSend.edit.county){
// 		$scope.addressArea.getto($scope.getSend.edit.provice,$scope.getSend.edit.city,$scope.getSend.edit.county);
// 	}else{
//	   	$scope.addressArea.getto($scope.addressArea.provice_id, $scope.addressArea.city_id, $scope.addressArea.county_id);
// 	}
  };
  $scope.cancelts = function() {
   	$("#showselts").animate({
   		bottom: "-35%"
   	}, 10);
   	setTimeout(function() {
   		$(".beijinsts").hide();
   	}, 50)

  }
	$scope.checksel=function (v) {
//		$scope.getSend.edit.provice = "";
//		$scope.getSend.edit.city = null;
//		$scope.getSend.edit.county = null;
		//if(v.number){
			//return
		//}else{
		for (var i = 0; i < $scope.addressArea.provice.length; i++) {
				$scope.addressArea.provice[i].check=false;
		};
		v.check = !v.check;
		$scope.addressArea.useProvice=v.provice_name;
		$scope.addressArea.provice_id=v.provice_id;
		$scope.addressArea.useCity = "请选择";
		$scope.addressArea.useCounty = "请选择";
		$scope.addressArea.usetown = "请选择";
		$scope.addressArea.city_id = "";
		$scope.addressArea.county_id = "";
		$scope.addressArea.town_id = "";
		//$scope.times=v.appoint_time;
	//}
//	$scope.addressArea.PrChange()
	}
	$scope.checkshi=function (v) {
//		$scope.getSend.edit.city = "";
//		$scope.getSend.edit.county = null;
		//if(v.number){
			//return
		//}else{
		for (var i = 0; i < $scope.addressArea.city.length; i++) {
				$scope.addressArea.city[i].check=false;
		};
		v.check = !v.check;
		$scope.addressArea.useCity=v.city_name;
		$scope.addressArea.city_id=v.city_id;
		$scope.addressArea.useCounty = "请选择";
		$scope.addressArea.usetown = "请选择";
		$scope.addressArea.county_id = "";
		$scope.addressArea.town_id = "";
		//$scope.times=v.appoint_time;
	//}
//	$scope.addressArea.CiChange()
	}
	$scope.checkxian=function (v) {
//		$scope.getSend.edit.county = "";
		//if(v.number){
			//return
		//}else{
		for (var i = 0; i < $scope.addressArea.county.length; i++) {
				$scope.addressArea.county[i].check=false;
		};
		v.check = !v.check;
		$scope.addressArea.useCounty=v.county_name;
		$scope.addressArea.county_id=v.county_id;
		$scope.addressArea.usetown = "请选择";
		$scope.addressArea.town_id = "";
		//$scope.times=v.appoint_time;
	//}
//	$scope.addressArea.CoChange()
	}
	$scope.checktown=function (v) {
		//if(v.number){
			//return
		//}else{
		for (var i = 0; i < $scope.addressArea.town.length; i++) {
				$scope.addressArea.town[i].check=false;
		};
		v.check = !v.check;
		$scope.addressArea.usetown=v.town_name;
		$scope.addressArea.town_id=v.town_id;
		//$scope.times=v.appoint_time;
	//}
	}
	
	//常用旅客列表
	$scope.getSend ={
		"eidt":"",
		"get":function () {
			orderS.addressRec({"token":token},function(res) {
				if (res) {
					$scope.info = res.recaddressList||[];
					if($scope.info.length){
						$scope.noSends = false;
						console.log(res)
					}else{
						$scope.noSends = true;
						console.log("noSends")
					}
				}
			});
		}
	} 
	$scope.getSend.get();
	//删除旅客
	$scope.deleteSend = function (v) {
		console.log(v)
		ngMessage.show("确定删除该旅客信息？", function() {
			orderS.delRecAddress({
				"addressId": v.id,
				"token": token
			}, function(res) {
				res && ngMessage.showTip(res.resMsg);
				$scope.getSend.get();
				$scope.switchLayout("index");
				$(".management").text("管理")
			})
		})
	};
		
	$scope.add = false;//add 状态
	$scope.edit = false;//edit 状态
		
	//添加旅客
	$scope.addressArea={
		"username":"",
		"mobile":"",
		"address":"",
		"provice":[],
		"provice_id":"",
		"useProvice":"请选择",
		"city":[],
		"city_id":"",
		"useCity":"请选择",
		"county":[],
		"county_id":"",
		"useCounty":"请选择",
		"town":[],
		"town_id":"",
		"usetown":"请选择",
//		"isDefault":0,
		"getPr":function () {
			orderS.area({},function(res) {
				if (res) {
					console.log(res);
					$scope.addressArea.provice = res.data||[];
					for(i=0;i<$scope.addressArea.provice.length;i++){
						$scope.addressArea.provice[i].check=false;
					}
//					if ($scope.getSend.edit) {
//						for (var n = 0; n < res.data.length; n++) {
//							if (res.data[n].provice_id == $scope.getSend.edit.provice) {
//								$scope.addressArea.provice[n].check=true;
//								break;
//							};
//						};
//					};
				};				
			});
//			$scope.addressArea.onChange()
		},
		"getCi":function (pid) {
			orderS.area({
				"pid":pid
			}, function(res) {
				if (res) {
					$scope.addressArea.city = res.data || [];
					for(var i=0;i<$scope.addressArea.city.length;i++){
						$scope.addressArea.city[i].check=false;
					}
					
//					if ($scope.getSend.edit) {
//						for (var n = 0; n < res.data.length; n++) {
//							if (res.data[n].city_id == $scope.getSend.edit.city) {
//								$scope.addressArea.city[n].check=true;
//								break;
//							};
//						};
//					};
					
				};
			});
		},
		"getCo":function (pid,cid) {
			orderS.area({
				"pid":pid,
				"cid": cid
			}, function(res) {
				if (res) {
					$scope.addressArea.county = res.data || [];
					for(var i=0;i<$scope.addressArea.county.length;i++){
						$scope.addressArea.county[i].check=false;
					}
//					if ($scope.getSend.edit) {
//						for (var n = 0; n < res.data.length; n++) {
//							if (res.data[n].county_id == $scope.getSend.edit.county) {
//								$scope.addressArea.county[n].check=true;
//								break;
//							};
//						};
//					};
				};
			});
		},
		"getto":function (pid,cid,countyId) {
			orderS.area({
				"pid":pid,
				"cid": cid,
				"countyId":countyId,
			}, function(res) {
				if (res) {
					$scope.addressArea.town = res.data || [];
					for(var i=0;i<$scope.addressArea.town.length;i++){
						$scope.addressArea.town[i].check=false;
					}
//					if ($scope.getSend.edit) {
//						for (var n = 0; n < res.data.length; n++) {
//							if (res.data[n].town_id == $scope.getSend.edit.town) {
//								$scope.addressArea.town[n].check=true;
//								break;
//							};
//						};
//					};
				};
			})
		},
		"setArea":function (v) {	//修改时先复制信息	
			console.log(v);
			$scope.add = false;
			$scope.edit = true;
			$scope.addressArea.addressId = v.id,
			$scope.addressArea.username = v.name;
			$scope.addressArea.mobile = v.mobile;
			$scope.addressArea.provice_id = v.provice;
			$scope.addressArea.city_id = v.city;
			$scope.addressArea.county_id = v.county;
			$scope.addressArea.town_id = v.town;
			var str = v.localtion_with_space.split(" ");
			console.log(str);
			$scope.addressArea.useProvice = str[0];
			$scope.addressArea.useCity = str[1];
			$scope.addressArea.useCounty = str[2];
			$scope.addressArea.usetown = v.town_name;
			$scope.addressArea.address = v.address;
//			$scope.addressArea.isDefault = 0;
			$scope.getSend.edit = v
//			$scope.addressArea.onChange()
		},
		"onChange":function () {
			var p = $scope.$watch("addressArea.useProvice", function(n, o) {
				$scope.addressArea.useCity="请选择";
				$scope.addressArea.useCounty="请选择";
				$scope.addressArea.usetown="请选择";
				console.log($scope.addressArea.provice);
				/*if (n) {
					for(var i=0;i<$scope.addressArea.provice.length;i++){
						if($scope.addressArea.provice[i].provice_name == n){
							$scope.addressArea.provice_id = $scope.addressArea.provice[i].provice_id;
							$scope.addressArea.getCi($scope.addressArea.provice[i].provice_id);
						}
					}
				};*/
			});
			var ci = $scope.$watch("addressArea.useCity", function(n, o) {
				$scope.addressArea.useCounty="请选择";
				$scope.addressArea.usetown="请选择";
			});
			var co = $scope.$watch("addressArea.useCounty", function(n, o) {
				$scope.addressArea.usetown="请选择";
			})
		},
		/*"CiChange":function () {
			var ci = $scope.$watch("addressArea.useCity", function(n, o) {
				$scope.addressArea.useCounty="请选择";
				$scope.addressArea.usetown="请选择";
				console.log($scope.addressArea.provice_id);
				console.log($scope.addressArea.city);
				if (n) {
					for(var i=0;i<$scope.addressArea.city.length;i++){
						if($scope.addressArea.city[i].city_name == n){
							$scope.addressArea.city_id = $scope.addressArea.city[i].city_id;
							$scope.addressArea.getCo($scope.addressArea.provice_id,$scope.addressArea.city[i].city_id);
						}
					}
				};
			});
		},
		"CoChange":function () {
			var co = $scope.$watch("addressArea.useCounty", function(n, o) {
				$scope.addressArea.usetown="请选择";
				console.log($scope.addressArea.provice_id);
				console.log($scope.addressArea.city_id);
				console.log($scope.addressArea.county);
				if (n) {
					for(var i=0;i<$scope.addressArea.county.length;i++){
						if($scope.addressArea.county[i].county_name == n){
							$scope.addressArea.county_id = $scope.addressArea.county[i].county_id;
							$scope.addressArea.getto($scope.addressArea.provice_id,$scope.addressArea.city_id,$scope.addressArea.county[i].county_id);
						}
					}
				};
			});
		},*/
		"add":function () {
			var data={
				"token":token,
				"mobile":$scope.addressArea.mobile,
				"provice":$scope.addressArea.provice_id||"",
				"city":$scope.addressArea.city_id||"",
				"county":$scope.addressArea.county_id||"",
				"town":$scope.addressArea.town_id,
				"address":$scope.addressArea.address,
				"name":$scope.addressArea.username,
				//"isDefault":$scope.addressArea.isDefault?1:0
			};
             //console.log(data);return false;
      if (!data.name) {
				ngMessage.showTip("请填写收件人！");
				return false
			};
//			if (data.name&&!/^[\u4e00-\u9fa5]{2,5}$/gi.test(data.name)) {
//				ngMessage.showTip("收件人只能2~5个汉字！");
//				return false
//			};
			if (data.name&&data.name.length<2) {
				ngMessage.showTip("收件人至少为两个字符！");
				return false
			};
			if (!data.mobile||!/^[1][35867][0-9]{9}$/.test(data.mobile)) {
				ngMessage.showTip("请输入有效的手机号！");
				return false
			};
			if (!data.provice) {
				ngMessage.showTip("请选择省份！");
				return false
			};
			if (!data.city) {
				ngMessage.showTip("请选择城市！");
				return false
			};
			if (!data.county) {
				ngMessage.showTip("请选择县区！");
				return false
			};
			if (!data.town) {
				ngMessage.showTip("请选择街道！");
				return false
			};
			if (!data.address) {
				ngMessage.showTip("请填写详细地址！");
				return false
			};
			if (data.address&&data.address.length<5||data.address.length>60) {
				ngMessage.showTip("详细地址应为5~60个字符！");
				return false
			};
			/*
			if ($scope.recAddress.edit&&$scope.recAddress.edit.id) {
				data.addressId = $scope.recAddress.edit.id;
				orderS.updateRecAddress(data,function(res) {
					if (res.resCode=="SUCCESS") {
						ngMessage.showTip(res.resMsg);
						$scope.switchLayout("index");
						$scope.recAddress.get(data.addressId);
					}else{
						res&&ngMessage.showTip(res.resMsg);
					}
				});
			}else{
			*/
				orderS.addRecAddress(data,function(res) {
					if (res.resCode=="SUCCESS") {
						ngMessage.showTip(res.resMsg);
						console.log(res);
						$scope.switchLayout("index");
						$scope.getSend.get();
						$(".management").text("管理")
						//$scope.recAddress.get(res.addressId);
					}else{
						res&&ngMessage.showTip(res.resMsg);
					}
				});
			//}
		},
		"edit":function () {
			var data={
				"token":token,
				"addressId":$scope.addressArea.addressId,
				"mobile":$scope.addressArea.mobile,
				"provice":$scope.addressArea.provice_id||"",
				"city":$scope.addressArea.city_id||"",
				"county":$scope.addressArea.county_id||"",
				"town":$scope.addressArea.town_id,
				"address":$scope.addressArea.address,
				"name":$scope.addressArea.username,
				//"isDefault":$scope.addressArea.isDefault?1:0
			};
			if (!data.name) {
				ngMessage.showTip("请填写收件人！");
				return false
			};
//			if (data.name&&!/^[\u4e00-\u9fa5]{2,5}$/gi.test(data.name)) {
//				ngMessage.showTip("收件人只能2~5个汉字！");
//				return false
//			};
			if (data.name&&data.name.length<2) {
				ngMessage.showTip("收件人至少为两个字符！");
				return false
			};
			if (!data.mobile||!/^[1][35867][0-9]{9}$/.test(data.mobile)) {
				ngMessage.showTip("请输入有效的手机号！");
				return false
			};
			if (!data.provice) {
				ngMessage.showTip("请选择省份！");
				return false
			};
			if (!data.city) {
				ngMessage.showTip("请选择城市！");
				return false
			};
			if (!data.county) {
				ngMessage.showTip("请选择县区！");
				return false
			};
			if (!data.town) {
				ngMessage.showTip("请选择街道！");
				return false
			};
			if (!data.address) {
				ngMessage.showTip("请填写详细地址！");
				return false
			};
			if (data.address&&(data.address.length<5||data.address.length>60)) {
				ngMessage.showTip("详细地址应为5~60个字符！");
				return false
			};
			/*
			if ($scope.recAddress.edit&&$scope.recAddress.edit.id) {
				data.addressId = $scope.recAddress.edit.id;
				orderS.updateRecAddress(data,function(res) {
					if (res.resCode=="SUCCESS") {
						ngMessage.showTip(res.resMsg);
						$scope.switchLayout("index");
						$scope.recAddress.get(data.addressId);
					}else{
						res&&ngMessage.showTip(res.resMsg);
					}
				});
			}else{
			*/
				orderS.updateRecAddress(data,function(res) {
					if (res.resCode=="SUCCESS") {
						ngMessage.showTip(res.resMsg);
						console.log(res);
						$scope.switchLayout("index");
						$scope.getSend.get();
						$(".management").text("管理")
						//$scope.recAddress.get(res.addressId);
					}else if(res.resCode=="DATA_MODIFICATIONS_FAIL"){
						ngMessage.showTip("你还没有做修改!");
					}else{
						res&&ngMessage.showTip(res.resMsg);
					}
				});
			//}
		},
		"clear":function () {
			$scope.add = true;
			$scope.edit = false;
			$scope.addressArea.username = "";
			$scope.addressArea.mobile = "";
			$scope.addressArea.address = "";
			$scope.addressArea.useProvice = "请选择";;
			$scope.addressArea.useCity = "请选择";
			$scope.addressArea.useCounty = "请选择";
			$scope.addressArea.usetown = "请选择";
//			$scope.addressArea.isDefault = 0;
		}
//		"setDefault":function () {
//			if ($scope.recAddress.edit && $scope.recAddress.edit.id) {
//				orderS.setDefault({
//					"addressId": $scope.recAddress.edit.id,
//					"token": token
//				}, function(res) {
//					if (res.resCode == "SUCCESS") {
//						$scope.recAddress.get();
//					};
//				});
//			};
//		}
};
//	$scope.addressArea.getPr();

	
	$scope.back=function () {
		$scope.add = false;
		$scope.edit = false;
		var layout = $scope.page.currentLayout;
		if ($scope.layout[layout].history||mark) {
			storage.toPage(-1);
		}else{	
			if ($scope.page.ppLayout!="index") {
				$scope.switchLayout('index');
			}else{
				$scope.switchLayout($scope.page.prevLayout);
			}
			
		}		
	}
	
})

.controller('fapiaoC',function($scope,storage,invoiceS,ngMessage){
	storage.init();
	var index = 1;
	var token = storage.get("token");
	var mark = false;
	if (!token) {
		storage.toPage("login");
	};

	$scope.toPage=function (page,key,value) {
		if (!token) {
			ngMessage.showTip("请先登录",2000,function(){
				storage.toPage("login");
			})
		};
		if (key&&value) {
			storage.set(key,value);
		};
	};
	$scope.page={
		showBackbtn:true,
		currentLayout:"index",
		prevLayout:"",
		ppLayout:""
	}
	$scope.layout={
		"index":{
			"show":true,
			"title":"发票抬头",
			"back":true,
			"history":true
		},
		"add":{
			"show":false,
			"title":"添加发票抬头",
			"back":true,
			"subTitle":"修改发票抬头"
		},
	}
	
	$scope.switchLayout = function(layout,b) {
		if ($scope.layout.hasOwnProperty(layout)) {
			for (var i in $scope.layout) {
				if ($scope.layout.hasOwnProperty(i)) {
					$scope.layout[i].show = false;
				}
			}
			$scope.layout[layout].show = true;
			$scope.page.title = $scope.layout[layout].title+"";
			if (b) {
				$scope.page.title = $scope.layout[layout].subTitle+"";
			};	
			$scope.page.showBackbtn = $scope.layout[layout].back;
			$scope.page.ppLayout = $scope.page.prevLayout ;
			$scope.page.prevLayout = $scope.page.currentLayout;
			$scope.page.currentLayout = layout;
		};
	}
	
	if(mark){
		$scope.switchLayout("add");
//		$scope.addressArea.clear();
	}else{
		$scope.switchLayout("index");
	}
	
	
	//常用旅客列表
	$scope.getFapiao ={
		"eidt":"",
		"get":function () {
			invoiceS.list({"token":token},function(res) {
				if (res) {
					$scope.info = res.invoiceList||[];
					if($scope.info.length){
						$scope.noFapiao = false;
						console.log(res)
					}else{
						$scope.noFapiao = true;
						console.log("noFapiao")
					}
				}
			});
		}
	} 
	$scope.getFapiao.get();
	//删除旅客
	$scope.deleteFapiao = function (v) {
		console.log(v)
		ngMessage.show("确定删除该发票信息？", function() {
			invoiceS.del({
				"invoiceId": v.id,
				"token": token
			}, function(res) {
				res && ngMessage.showTip(res.resMsg);
				$scope.getFapiao.get();
				$scope.switchLayout("index");
				$(".management").text("管理")
			})
		})
	};
		
	$scope.add = false;//add 状态
	$scope.edit = false;//edit 状态
		
	//添加旅客
	$scope.addFapiao={
		"invoicePayee":"",
//		"isDefault":0,
		"add":function () {
			var data={
				"token":token,
				"invoicePayee":$scope.addFapiao.invoicePayee,
			};
			if (!data.invoicePayee) {
				ngMessage.showTip("请填写发票抬头！");
				return false
			};
			if (data.invoicePayee&&(data.invoicePayee.length<2||data.invoicePayee.length>50)) {
				ngMessage.showTip("发票抬头应为2~50个字符！");
				return false
			};
				invoiceS.add(data,function(res) {
					if (res.resCode=="SUCCESS") {
						ngMessage.showTip(res.resMsg);
						console.log(res);
						$scope.switchLayout("index");
						$scope.getFapiao.get();
						$(".management").text("管理")
					}else{
						res&&ngMessage.showTip(res.resMsg);
					}
				});
			//}
		},
		"edit":function () {
			var data={
				"token":token,
				"invoiceId":$scope.addFapiao.invoiceId,
				"invoicePayee":$scope.addFapiao.invoicePayee,
				//"isDefault":$scope.addressArea.isDefault?1:0
			};
			if (!data.invoicePayee) {
				ngMessage.showTip("请填写发票抬头！");
				return false
			};
			if (data.invoicePayee&&(data.invoicePayee.length<2||data.invoicePayee.length>50)) {
				ngMessage.showTip("发票抬头应为2~50个字符！");
				return false
			};
				invoiceS.update(data,function(res) {
					if (res.resCode=="SUCCESS") {
						ngMessage.showTip(res.resMsg);
						$scope.switchLayout("index");
						$scope.getFapiao.get();
						$(".management").text("管理")
					}else if(res.resCode=="DATA_MODIFICATIONS_FAIL"){
						ngMessage.showTip("你还没有做修改!");
					}else{
						res&&ngMessage.showTip(res.resMsg);
					}
				});
		},
		"clear":function () {
			$scope.add = true;
			$scope.edit = false;
			$scope.addFapiao.invoicePayee = "";
//			$scope.addressArea.isDefault = 0;
		},
		"setFapiao":function (v) {	//修改时先复制信息	
			console.log(v);
			$scope.add = false;
			$scope.edit = true;
			$scope.addFapiao.invoiceId = v.id,
			$scope.addFapiao.invoicePayee = v.invoicePayee;
			$scope.getFapiao.edit = v
		},
//		"onChange":function () {
//			var p = $scope.$watch("addressArea.useProvice", function(n, o) {
//				$scope.addressArea.useCity="请选择";
//			});
//		}
//		"setDefault":function () {
//			if ($scope.recAddress.edit && $scope.recAddress.edit.id) {
//				orderS.setDefault({
//					"addressId": $scope.recAddress.edit.id,
//					"token": token
//				}, function(res) {
//					if (res.resCode == "SUCCESS") {
//						$scope.recAddress.get();
//					};
//				});
//			};
//		}
};
//	$scope.addressArea.getPr();

	
	$scope.back=function () {
		$scope.add = false;
		$scope.edit = false;
		var layout = $scope.page.currentLayout;
		if ($scope.layout[layout].history||mark) {
			storage.toPage(-1);
		}else{	
			if ($scope.page.ppLayout!="index") {
				$scope.switchLayout('index');
			}else{
				$scope.switchLayout($scope.page.prevLayout);
			}
			
		}		
	}
	
})

.controller('mailAddressC',function($scope,storage,orderS,ngMessage){
	storage.init();
	var token = storage.get("token");
	if (!token) {
		storage.toPage("login");
	};

	$scope.toPage=function (page,key,value) {
		if (!token) {
			ngMessage.showTip("请先登录",1200,function(){
				storage.toPage("login");
			})
		};
		if (key&&value) {
			storage.set(key,value);
		};
	};

  $scope.canshu = function() {
   	$(".beijins").show();
   	$("#showsel").animate({
   		bottom: "0px"
   	}, 600);
     	$scope.addressArea.getPr();
  };
  $scope.cancel = function() {
   	$("#showsel").animate({
   		bottom: "-35%"
   	}, 10);
   	setTimeout(function() {
   		$(".beijins").hide();
   	}, 50)
  }

  $scope.canshus = function() {
   	$(".beijinss").show();
   	$("#showsels").animate({
   		bottom: "0px"
   	}, 600);
   	$scope.addressArea.getCi($scope.addressArea.provice_id);
// 	if ($scope.getSend.edit.provice){
// 		$scope.addressArea.getCi($scope.getSend.edit.provice);
// 	}else{
//	   	$scope.addressArea.getCi($scope.addressArea.provice_id);
// 	}
  };
  $scope.cancels = function() {
   	$("#showsels").animate({
   		bottom: "-35%"
   	}, 10);
   	setTimeout(function() {
   		$(".beijinss").hide();
   	}, 50)

  }
  $scope.canshut = function() {
   	$(".beijinst").show();
   	$("#showselt").animate({
   		bottom: "0px"
   	}, 600);
   	$scope.addressArea.getCo($scope.addressArea.provice_id, $scope.addressArea.city_id);
// 	if ($scope.getSend.edit.provice&&$scope.getSend.edit.city){
// 		$scope.addressArea.getCo($scope.getSend.edit.provice,$scope.getSend.edit.city);
// 	}else{
//	   	$scope.addressArea.getCo($scope.addressArea.provice_id, $scope.addressArea.city_id);
// 	}
  };
  $scope.cancelt = function() {
   	$("#showselt").animate({
   		bottom: "-35%"
   	}, 10);
   	setTimeout(function() {
   		$(".beijinst").hide();
   	}, 50)

  }
  $scope.canshuts = function() {
   	$(".beijinsts").show();
   	$("#showselts").animate({
   		bottom: "0px"
   	}, 600);
   	$scope.addressArea.getto($scope.addressArea.provice_id, $scope.addressArea.city_id, $scope.addressArea.county_id);
// 	if ($scope.getSend.edit.provice&&$scope.getSend.edit.city&&$scope.getSend.edit.county){
// 		$scope.addressArea.getto($scope.getSend.edit.provice,$scope.getSend.edit.city,$scope.getSend.edit.county);
// 	}else{
//	   	$scope.addressArea.getto($scope.addressArea.provice_id, $scope.addressArea.city_id, $scope.addressArea.county_id);
// 	}
  };
  $scope.cancelts = function() {
   	$("#showselts").animate({
   		bottom: "-35%"
   	}, 10);
   	setTimeout(function() {
   		$(".beijinsts").hide();
   	}, 50)

  }
	$scope.checksel=function (v) {
//		$scope.getSend.edit.provice = "";
//		$scope.getSend.edit.city = null;
//		$scope.getSend.edit.county = null;
		//if(v.number){
			//return
		//}else{
		for (var i = 0; i < $scope.addressArea.provice.length; i++) {
				$scope.addressArea.provice[i].check=false;
		};
		v.check = !v.check;
		$scope.addressArea.useProvice=v.provice_name;
		$scope.addressArea.provice_id=v.provice_id;
		$scope.addressArea.useCity = "请选择";
		$scope.addressArea.useCounty = "请选择";
		$scope.addressArea.usetown = "请选择";
		$scope.addressArea.city_id = "";
		$scope.addressArea.county_id = "";
		$scope.addressArea.town_id = "";
		//$scope.times=v.appoint_time;
	//}
//	$scope.addressArea.PrChange()
	}
	$scope.checkshi=function (v) {
//		$scope.getSend.edit.city = "";
//		$scope.getSend.edit.county = null;
		//if(v.number){
			//return
		//}else{
		for (var i = 0; i < $scope.addressArea.city.length; i++) {
				$scope.addressArea.city[i].check=false;
		};
		v.check = !v.check;
		$scope.addressArea.useCity=v.city_name;
		$scope.addressArea.city_id=v.city_id;
		$scope.addressArea.useCounty = "请选择";
		$scope.addressArea.usetown = "请选择";
		$scope.addressArea.county_id = "";
		$scope.addressArea.town_id = "";
		//$scope.times=v.appoint_time;
	//}
//	$scope.addressArea.CiChange()
	}
	$scope.checkxian=function (v) {
//		$scope.getSend.edit.county = "";
		//if(v.number){
			//return
		//}else{
		for (var i = 0; i < $scope.addressArea.county.length; i++) {
				$scope.addressArea.county[i].check=false;
		};
		v.check = !v.check;
		$scope.addressArea.useCounty=v.county_name;
		$scope.addressArea.county_id=v.county_id;
		$scope.addressArea.usetown = "请选择";
		$scope.addressArea.town_id = "";
		//$scope.times=v.appoint_time;
	//}
//	$scope.addressArea.CoChange()
	}
	$scope.checktown=function (v) {
		//if(v.number){
			//return
		//}else{
		for (var i = 0; i < $scope.addressArea.town.length; i++) {
				$scope.addressArea.town[i].check=false;
		};
		v.check = !v.check;
		$scope.addressArea.usetown=v.town_name;
		$scope.addressArea.town_id=v.town_id;
		//$scope.times=v.appoint_time;
	//}
	}
	
	//添加旅客
	$scope.addressArea={
		"username":"",
		"mobile":"",
		"address":"",
		"provice":[],
		"provice_id":"",
		"useProvice":"请选择",
		"city":[],
		"city_id":"",
		"useCity":"请选择",
		"county":[],
		"county_id":"",
		"useCounty":"请选择",
		"town":[],
		"town_id":"",
		"usetown":"请选择",
//		"isDefault":0,
		"getPr":function () {
			orderS.area({},function(res) {
				if (res) {
					console.log(res);
					$scope.addressArea.provice = res.data||[];
					for(i=0;i<$scope.addressArea.provice.length;i++){
						$scope.addressArea.provice[i].check=false;
					}
				};				
			});
//			$scope.addressArea.onChange()
		},
		"getCi":function (pid) {
			orderS.area({
				"pid":pid
			}, function(res) {
				if (res) {
					$scope.addressArea.city = res.data || [];
					for(var i=0;i<$scope.addressArea.city.length;i++){
						$scope.addressArea.city[i].check=false;
					}
				};
			});
		},
		"getCo":function (pid,cid) {
			orderS.area({
				"pid":pid,
				"cid": cid
			}, function(res) {
				if (res) {
					$scope.addressArea.county = res.data || [];
					for(var i=0;i<$scope.addressArea.county.length;i++){
						$scope.addressArea.county[i].check=false;
					}
				};
			});
		},
		"getto":function (pid,cid,countyId) {
			orderS.area({
				"pid":pid,
				"cid": cid,
				"countyId":countyId,
			}, function(res) {
				if (res) {
					$scope.addressArea.town = res.data || [];
					for(var i=0;i<$scope.addressArea.town.length;i++){
						$scope.addressArea.town[i].check=false;
					}
				};
			})
		},
		"onChange":function () {
			var p = $scope.$watch("addressArea.useProvice", function(n, o) {
				$scope.addressArea.useCity="请选择";
				$scope.addressArea.useCounty="请选择";
				$scope.addressArea.usetown="请选择";
				console.log($scope.addressArea.provice);
			});
			var ci = $scope.$watch("addressArea.useCity", function(n, o) {
				$scope.addressArea.useCounty="请选择";
				$scope.addressArea.usetown="请选择";
			});
			var co = $scope.$watch("addressArea.useCounty", function(n, o) {
				$scope.addressArea.usetown="请选择";
			})
		},
		"add":function () {
			var data={
				"token":token,
				"phone":$scope.addressArea.mobile,
				"provice":$scope.addressArea.useProvice,
				"city":$scope.addressArea.useCity,
				"county":$scope.addressArea.useCounty,
				"town":$scope.addressArea.usetown,
				"address":$scope.addressArea.address,
				"receive_person":$scope.addressArea.username,
				"receive_address":$scope.addressArea.useProvice+$scope.addressArea.useCity+$scope.addressArea.useCounty+$scope.addressArea.usetown+$scope.addressArea.address
			};
      if (!data.receive_person) {
				ngMessage.showTip("请填写收件人！");
				return false
			};
//			if (data.name&&!/^[\u4e00-\u9fa5]{2,5}$/gi.test(data.name)) {
//				ngMessage.showTip("收件人只能2~5个汉字！");
//				return false
//			};
			if (data.receive_person&&data.receive_person.length<2) {
				ngMessage.showTip("收件人至少为两个字符！");
				return false
			};
			if (!data.phone||!/^[1][35867][0-9]{9}$/.test(data.phone)) {
				ngMessage.showTip("请输入有效的手机号！");
				return false
			};
			if (!data.provice||(data.provice == "请选择")) {
				ngMessage.showTip("请选择省份！");
				return false
			};
			if (!data.city||(data.city == "请选择")) {
				ngMessage.showTip("请选择城市！");
				return false
			};
			if (!data.county||(data.county == "请选择")) {
				ngMessage.showTip("请选择县区！");
				return false
			};
			if (!data.town||(data.town == "请选择")) {
				ngMessage.showTip("请选择街道！");
				return false
			};
			if (!data.address) {
				ngMessage.showTip("请填写详细地址！");
				return false
			};
			if (data.address&&data.address.length<5||data.address.length>60) {
				ngMessage.showTip("详细地址应为5~60个字符！");
				return false
			};
			console.log(data)
				orderS.submitInfo(data,function(res) {
						console.log(res)
					if (res.resCode=="SUCCESS") {
						ngMessage.showTip(res.resMsg,1200,function(){
							storage.toPage("membershipGrade");
						});
					}else{
						res&&ngMessage.showTip(res.resMsg);
					}
				});
		},
		"clear":function () {
			$scope.addressArea.username = "";
			$scope.addressArea.mobile = "";
			$scope.addressArea.address = "";
			$scope.addressArea.useProvice = "请选择";;
			$scope.addressArea.useCity = "请选择";
			$scope.addressArea.useCounty = "请选择";
			$scope.addressArea.usetown = "请选择";
		}
	}

})

