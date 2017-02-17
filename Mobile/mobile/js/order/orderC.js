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
					//storage.set("selectBox","");
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
.controller("orderC",function ($scope,$filter,orderS,storage,ngMessage) {	
	storage.init();
	
	$scope.isDisplay = false;
	var index = 1;	
	var type= storage.queryField("type")||storage.getOnce("orderType")||null;      //getOnce

	var token = storage.get("token");
	if(token){
		$scope.isLogin = true
	}else{
		$scope.isLogin = false
	};
	var resText=[
		"暂无待支付订单",
		"暂无待出行订单",
		"暂无已完成订单",
		"暂无申请退款订单",
	]
	$scope.hasMore = false;
	$scope.order=[];
	$scope.act=null;
	$scope.hasRes = true;
	$scope.noRes="";
  
	function getList() {	
		$scope.hasRes = true;	
		orderS.order({
			"token": storage.get("token") || "",
			"type": type,
			"page": index,
		}, function(res) {
			if (res && res.resCode == "SUCCESS") {		
				console.log(res);
				if (res.orderList.length < 10) {
					$scope.hasMore=false;
				}else{
					$scope.hasMore=true;
				};
				for(var i=0;i<res.orderList.length;i++){ //时间格式修改
					res.orderList[i].startTime = $filter("date")(res.orderList[i].start_time*1000, "yyyy-MM-dd");
					res.orderList[i].expireTime = $filter("date")(res.orderList[i].expire_time*1000, "yyyy-MM-dd HH:mm:ss");
					res.orderList[i].order_amount = parseFloat(res.orderList[i].order_amount);
				};
				if (index>1) {
					var tmp = angular.copy($scope.order);
					$scope.order = tmp.concat(res.orderList);
				}else{
					$scope.order = res.orderList;
				};
				if (!$scope.order.length) {
					$scope.hasRes = false;
					if(type == null){
						$scope.noRes = "暂无订单";
					}else{
						$scope.noRes = resText[type];
					}
				};
			}
//			else if (res) {
//				ngMessage.showTip(res.Msg)
//			};
		})
	};
	getList();

	$scope.cancelOrder = function (v) { //取消订单
		console.log(v)
		ngMessage.show("确定取消该订单？", function() {
			orderS.cancel({
				"token": token,
				"order_id": v.order_id
			}, function(res) {
				res && ngMessage.showTip(res.resMsg);
				$scope.switch(type);
			})
		})
	};
	
	$scope.refundOrder = function (v) { //申请退款
		ngMessage.show("确定申请退款？", function() {
			orderS.refund({
				"token": token,
				"order_id": v.order_id
			}, function(res) {
				$scope.switch(type);
				res && ngMessage.showTip(res.resMsg);
			})
		})
	};
	
	$scope.payOrder = function(v) {
		storage.set("orderItem", v);
		storage.toPage("checknext");
	};
	
	$scope.switch = function (ty) {
		if (ty!=type) {
			type = ty;
			index=1;
			getList();
		}else{
			getList()
		};
		$scope.act = ty;
	};
	$scope.more=function () {
		if ($scope.hasMore) {
			index++;
			getList();
		};
	}

	$scope.toMin = function () {
		storage.toPage("home")
	}
	$scope.detail = function (v) {
		 storage.set("orderItem",v);
		 storage.toPage("orderDetail");
	}

	
	$scope.reload = function () { //刷新
		index=1;
		getList();
	}
	//查看物流
	$scope.togtics = function (v) {
	    window.location.href=host+"html/messagePush/check.html?rec_id="+v;
	};

	//  待评论
	$scope.comments = function (v) {
		storage.set("orderId",v.recId);
		storage.toPage("comments", "?type=6");
	};
	// 评论
	$scope.commentsChild = function (orderId,src,goodsId) {
	    storage.set("goods_order",{'orderId':orderId,'goods_src':src,'goodsId':goodsId});
		storage.toPage("commentsChild");
	};

	$scope.toPage=function (page,key,value) {
		if (key&&value) {
			storage.set(key,value);
		};
		storage.toPage(page);
	};
	$scope.back = function(){
		var referer = storage.get("referer")||"";
		if (referer&&!/orderDetail.html/.test(referer)) {
			storage.toPage(referer);
		} else {
			storage.toPage("personalCenter")
		};
	}
})

.controller("commentsC",function ($scope,orderS,storage,ngMessage) {	
	storage.init();

	var token = storage.get("token");

	var goods_order = storage.get("goods_order");
	$scope.goods_order = goods_order;

	// goods_order && orderS.commitComment({
	// 	"orderId":goods_order.orderId,
	// 	"goodsId":goods_order.goodsId,
	// 	"token":token
	// },function (res) {
	// 	console.log(res)
	// });

	matchStart = '';
	sellerStart = '';
	logisticsStart = '';
	$scope.content = '';

	$scope.descr = {
		'index0':"/images/wuxin.png",
		'index1':"/images/wuxin.png",
		'index2':"/images/wuxin.png",
		'index3':"/images/wuxin.png",
		'index4':"/images/wuxin.png"
	};
	$scope.sellerStart = {
		'index0':"/images/wuxin.png",
		'index1':"/images/wuxin.png",
		'index2':"/images/wuxin.png",
		'index3':"/images/wuxin.png",
		'index4':"/images/wuxin.png"
	};
	$scope.logisticsStart = {
		'index0':"/images/wuxin.png",
		'index1':"/images/wuxin.png",
		'index2':"/images/wuxin.png",
		'index3':"/images/wuxin.png",
		'index4':"/images/wuxin.png"
	};
	$scope.option = function(type,num) {
		if(type == 1){
			matchStart = num;
			for (var i = 0; i <= num; i++) {
				if($scope.descr['index'+num] == "/images/wuxin-color.png" && num <= 3 && $scope.descr['index'+(num+1)] == "/images/wuxin-color.png"){
					continue;
				}	
				if($scope.descr['index'+num] == "/images/wuxin-color.png"){
					$scope.descr['index'+i] = "/images/wuxin.png";
				}else{
					$scope.descr['index'+i] = "/images/wuxin-color.png"
				}
			}
			for (var i = num + 1; i <= 4; i++) {
				$scope.descr['index'+i]  = "/images/wuxin.png";
			}
		}
		if(type == 2){
			sellerStart = num;
			for (var i = 0; i <= num; i++) {
				if($scope.sellerStart['index'+num] == "/images/wuxin-color.png" && num <= 3 && $scope.sellerStart['index'+(num+1)] == "/images/wuxin-color.png"){
					continue;
				}	
				if($scope.sellerStart['index'+num] == "/images/wuxin-color.png"){
					$scope.sellerStart['index'+i] = "/images/wuxin.png";
				}else{
					$scope.sellerStart['index'+i] = "/images/wuxin-color.png"
				}
			}
			for (var i = num + 1; i <= 4; i++) {
				$scope.sellerStart['index'+i]  = "/images/wuxin.png";
			}
		}
		if(type == 3){
			logisticsStart = num;
			for (var i = 0; i <= num; i++) {
				if($scope.logisticsStart['index'+num] == "/images/wuxin-color.png" && num <= 3 && $scope.logisticsStart['index'+(num+1)] == "/images/wuxin-color.png"){
					continue;
				}	
				if($scope.logisticsStart['index'+num] == "/images/wuxin-color.png"){
					$scope.logisticsStart['index'+i] = "/images/wuxin.png";
				}else{
					$scope.logisticsStart['index'+i] = "/images/wuxin-color.png"
				}
			}
			for (var i = num + 1; i <= 4; i++) {
				$scope.logisticsStart['index'+i]  = "/images/wuxin.png";
			}
		}
	}
	

	$scope.submit = function() {
		var data = {
			matchStart:matchStart+1,
			sellerStart:sellerStart+1,
			logisticsStart:logisticsStart+1,
			content:$scope.content,
			"orderId":goods_order.orderId,
			"goodsId":goods_order.goodsId,
			"token":token
		};
		if (!matchStart&&matchStart!==0) {
		    ngMessage.showTip("请给商品描述评论一番吧！")
		    return
	    };
	    if ($scope.content=="") {
		    ngMessage.showTip("请对该商品进行评论！")
		    return
	    };
	    if (!sellerStart&&sellerStart!==0) {
		    ngMessage.showTip("请给卖家服务点个赞吧！")
		    return
	    };
	    if (!logisticsStart&&logisticsStart!==0) {
		    ngMessage.showTip("请给物流服务点个赞吧！")
		    return
	    };
	   
		goods_order && orderS.commitComment(data,function (res) {
			if(res.resCode == "SUCCESS"){
				ngMessage.showTip(res.resMsg,2000);
				setTimeout(function(){
					storage.toPage("memcenter");
				}, 2000)
			}else{
				ngMessage.showTip(res.resMsg);
			}
		});
	}
	
		

})
.controller("checkCs",function ($rootScope,$scope,$filter,orderS, invoiceS ,storage,ngMessage,ngWechat) {	
  storage.init();
  var token = storage.get("token");
  var wx = storage.get("wx");
  var orderItem =storage.get("orderItem");
  console.log(orderItem);
  $scope.unClick = false;
	$scope.mess = "";
  if (!token) {
		storage.toPage("login")
	};
	$scope.show=true;

	//改变页面显示高度
	$scope.isshow=false;
	$scope.message="订单详情 ▼";
	$scope.chargeheight=function(){
		//alert("kk");
       $scope.isshow=!$scope.isshow;
       if($scope.isshow){
       	$scope.message="收起 ▲";
       }else{
       	$scope.message="订单详情 ▼";
       }
	}
	//去往忘记支付密码页面
	$scope.forget=function(){
		storage.set("forReferer","checknext");
		storage.set("orderItem",orderItem);
		storage.toPage("bindPhone");
	}
    //获取该用户余额
  $scope.availableIntegral=function(){
    orderS.availableIntegral({
       "token":token,
       "type":0,
	},function(res){
		if (res.resCode == "SUCCESS") {
            console.log(res);
            $scope.datas=res;
            $scope.datas.data.credits = parseFloat($scope.datas.data.credits);
            console.log($scope.datas.data.credits);
            
		}else{
		   res && ngMessage.showTip(res.resMsg);
		}
	})
   //console.log($scope.datas.data.credits); 
   	orderS.orderDetail({
       "token":token,
       "order_id":orderItem.order_id,
	},function(res){
		if (res.resCode == "SUCCESS") {
            $scope.data=res;
            $scope.data.money_paid = parseFloat($scope.data.money_paid);
            console.log($scope.data);
            if(!$scope.data.receive_address){
            	$scope.show=false;
            }
//          console.log($scope.data.money_paid);
//          console.log($scope.datas.data.credits);
            var money = parseFloat($scope.datas.data.credits)||0; //余额
						var payPrice = parseFloat($scope.data.money_paid)||0; //应付金额
						if(!payPrice){
							$scope.unWinx = true;
							$scope.unClick = false;
							$scope.mess = "";
						}else if (money<payPrice) {
							$scope.unClick = false;
							$scope.mess = "余额为 ¥"+$scope.datas.data.credits+" 不足以支付该订单，请充值！";
						};
						//获取该用户是否设置支付密码
						orderS.PaymentPWD({
							"token": token,
						}, function(res) {
							if(res.resCode == "SUCCESS") {
								console.log(res);
								$scope.datat = res;
								if($scope.datat.state==0){
									$scope.unClick = true;
									$scope.mess = "若需使用会员卡，请先设置支付密码！"
								}
							} else {
								res && ngMessage.showTip(res.resMsg);
							}
						})
		}else{
		   res && ngMessage.showTip(res.resMsg);
		}
	})
 }
   $scope.availableIntegral();  
   //console.log($scope.datas);
    //支付方式选择
	$scope.payby={
		"msg":"微信安全支付",
		"currentItem":0,
		"get":function(index,noUserOpera) {		
			if (index) {
				var money = parseFloat($scope.datas.data.credits)||0; //余额
				var payPrice = parseFloat($scope.data.money_paid)||0; //应付金额
				if($scope.datat.state==0){
					return false;
				}else if(!payPrice){ //订单为0，可支付
					$scope.canshu();
					$scope.payby.msg="账户余额支付"
					$scope.payby.currentItem = 1;
				}else if (money<payPrice&&!noUserOpera) {
					$scope.canshuy();
				}else{
					$scope.payby.msg="账户余额支付"
					$scope.payby.currentItem = 1;
				};
			}else{
				$scope.payby.msg="微信安全支付"
				$scope.payby.currentItem = 0;
			};
		},
		"onSwitch":function () {
//			$scope.payby.get($scope.payby.currentItem)
		}
	};
	//console.log($scope.datas.data.credits);
	
	
  $scope.canshu = function() { //支付密码 输入框
   	$(".beijinss").show();
   	$("#showsels").animate({
   		bottom: "0px"
   	}, 300);
   };

   $scope.cancel = function() {
   	$("#showsels").animate({
   		bottom: "-35%"
   	}, 10);
   	setTimeout(function() {
   		$(".beijinss").hide();
   	}, 50)
   }

   $scope.canshut = function() { //支付密码错误 提示框
   	$(".beijinss").hide();
   	$(".beijinsst").show();
   	$("#showselst").animate({
   		bottom: "0px"
   	}, 300);
   };

   $scope.cancelt = function() { //重试
   	$("#showselst").animate({
   		bottom: "-35%"
   	}, 10);
   	setTimeout(function() {
   		$(".beijinsst").hide();
   	}, 50);
   	$scope.canshu();
   	$scope.password.old = "";
   }
   
   $scope.canshuy = function() { //余额不足 提示框
   	$(".beijinssy").show();
   	$("#showselsy").animate({
   		bottom: "0px"
   	}, 300);
   };

   $scope.cancely = function() { //取消
   	$("#showselsy").animate({
   		bottom: "-35%"
   	}, 10);
   	setTimeout(function() {
   		$(".beijinssy").hide();
   	}, 50);
   };
   //去往充值页面
	$scope.recharge=function(){
		storage.set("forReferer","checknext");
		storage.toPage("recharge");
	}
   
   $scope.password={
		"old":"",
		"newa":"",
		"newb":""
	}

	$scope.tijiaos = function() {
		if($scope.password.old.length == 6) {
			orderS.verifyPaymentPWD({
				"token": token,
				"payment_pass": $scope.password.old
			}, function(res) {
				if(res.resCode == "SUCCESS") {
					orderS.apay({
						"token": token,
						"orderId": orderItem.order_id,
					}, function(res) {
						if(res.resCode == "SUCCESS") {
							console.log(res);
							storage.toPage("paySuccess")
								//$scope.data=res;
						} else {
							storage.toPage("payFailure")
								//res && ngMessage.showTip(res.resMsg);
						}
					})
						//$scope.step =2;
				} else {
					//ngMessage.showTip("支付密码输入错误！");
					$scope.canshut();
				}
			})
		} else {
			ngMessage.showTip("请输入6位原支付密码！");
		}
	};

	$scope.pays = function() {

	if($scope.payby.msg == "微信安全支付") {
		if(!wx || !wx.openid) {
			//ngMessage.showTip("请使用微信客户端进行充值！");
			setTimeout(function() {
				storage.set("wxReferers", "checknext");
				storage.toPage("wxAuth");
			}, 1000);
			return
		};
		orderS.pay({
			token: token, //orderItem.id,
			order_id: orderItem.order_id,
			openid: wx.openid
				//openid:"o-dL1wOP3xPjG6WQDRW0FPszOcys",
		}, function(dat) {
			if(dat.resCode == "SUCCESS") {
				//submitedData = res;
				ngMessage.hide();
				console.log(dat);

				ngWechat.pay(dat.data, function(rs) {
					//console.log(rs);
					storage.toPage("paySuccess")
				}, function(rs) {
					//ngMessage.showTip(rs);
					storage.toPage("payFailure")
				})
			} else {
				ngMessage.showTip(dat.resMsg);
			};
		});
	} else {
		$scope.canshu();
		/*
	   orderS.accountPay({
          "token":token,
          "orderId":orderItem.order_id,
	   },function(res){
	   	if (res.resCode == "SUCCESS") {
            console.log(res);
            storage.toPage("paySuccess")
            //$scope.data=res;
            
		}else{
			storage.toPage("payFailure")
		   //res && ngMessage.showTip(res.resMsg);
		}
	   })
       */
	}
}
	
})

.controller("checkC", function($rootScope, $scope, $filter, orderS, invoiceS, storage, ngMessage, ngWechat) {
	storage.init();
	//var goods_id=storage.getUrlParam('gid')||"";
	var goods_id = storage.get("gid") || "";
	var bind = storage.get("bind") || "";

	var ids = storage.get("cartId");
	var token = storage.get("token");
	var selectBoxth = [];
	selectBoxth = storage.get("selectBox") || "";
	var wx = storage.get("wx");
	var adultNum = storage.get("adultNum");
	var childNum = storage.get("childNum");
	$scope.realname = storage.get("realname") || "";
	$scope.phone = storage.get("phone") || "";
	var totalnum = adultNum + childNum;
	var shennum = 0;
	storage.set("totalnum", totalnum);
	var gotime = storage.get("gotime");
	//console.log(gotime);
	gotime = Date.parse(new Date(gotime));

	//gotime=gotime.replace(/-/g,'/'); 
	//gotime=new Date(gotime);
	gotime = $filter("date")(gotime, "yyyy-MM-dd");
	var adultPrice = storage.get("adultPrice");
	var childPrice = storage.get("childPrice");
	console.log(adultNum + "与" + childNum + "与" + gotime + "与" + adultPrice + "与" + childPrice);
	//alert(adultNum+"与"+childNum+"与"+gotime+"与"+adultPrice+"与"+childPrice);
	console.log(selectBoxth);
	//初始价格
	$scope.staprice = parseFloat(adultPrice) * parseInt(adultNum) * 1 + parseFloat(childPrice) * parseInt(childNum) * 1;
	//console.log($scope.staprice);
	//Math.round(n*100)/100;
	if(!token) {
		storage.toPage("login")
	};
	$scope.senddata = {
		"adultNum": adultNum,
		"childNum": childNum,
		"childPrice": childPrice,
		"adultPrice": adultPrice,
		"goods_id": goods_id,
		"totalnum": totalnum,
		"token": token,
		"dateTime": gotime,
	}
    
	
	var payPrice = $scope.payPrice = 0;
	var payPostData = null;
	var submitedData = null;
	//产品信息
	$scope.get_info = function() {
		orderS.get_info({
			"goods_id": goods_id,
		}, function(res) {
			if(res.resCode == "SUCCESS") {
				console.log(res);
				$scope.data = res;
				$scope.data.data.price = parseFloat(res.data.price);
			} else {
				res && ngMessage.showTip(res.resMsg);
			}
		})
	}
	//保险费用
	$scope.getInsurance = function() {
		orderS.getInsurance({
			"token": token,
			"goods_id": goods_id,
		}, function(res) {
			if(res.resCode == "SUCCESS") {
				console.log(res);
				$scope.datas = res;
				$scope.hasInsurance = res.data.length; //判断有无保险
				if(!$scope.hasInsurance){
					$scope.payby.mess = "无可选保险";
				};
				for(i = 0; i < $scope.datas.data.length; i++) {
					$scope.datas.data[i].check = false;
				}
			} else {
				res && ngMessage.showTip(res.resMsg);
			}
		})
	}
	
	//可用积分
	$scope.mess = "当前未选择优惠";
	$scope.availableIntegral = function() {
		orderS.availableIntegral({
			"token": token,
			"type": 1,
			//"adult":adultNum,
			//"time":gotime,
			// "goods_id": goods_id,
		}, function(res) {
			if(res.resCode == "SUCCESS") {
				console.log(res);
				$scope.dataslist = res;
				$scope.credits = parseFloat($scope.dataslist.data.credits) || 0;
				$scope.creditsnum = $scope.credits;
				$scope.deductible = $scope.dataslist.data.deductible;
				console.log($scope.hasDiscount);
				console.log($scope.credits);
				if((!$scope.hasDiscount)&&(!$scope.credits)){
					$scope.hasNOdiscount = true;
					console.log($scope.hasNOdiscount)
					$scope.mess = "当前无可用优惠";
				};
			} else {
				res && ngMessage.showTip(res.resMsg);
			}
		})
	}
	//可优惠价格
	$scope.getDiscountPrice = function() {
		orderS.getDiscountPrice({
			"token": token,
			"child": childNum,
			"adult": adultNum,
			"time": gotime,
			"goods_id": goods_id,
		}, function(res) {
			if(res.resCode == "SUCCESS") {
				console.log(res);
				$scope.datalist = res;
				$scope.hasDiscount = res.data.length; //判断有无优惠
				console.log($scope.hasDiscount);
				console.log($scope.credits);
				if((!$scope.hasDiscount)&&(!$scope.credits)){
					$scope.hasNOdiscount = true;
					console.log($scope.hasNOdiscount)
					$scope.mess = "当前无可用优惠";
				};

				for(i = 0; i < $scope.datalist.data.length; i++) {
					$scope.datalist.data[i].check = false;
				}
			} else {
				res && ngMessage.showTip(res.resMsg);
			}
		})
	}
	//发票列表
	$scope.getinvoice = function() {
		orderS.getinvoice({
			"token": token,
		}, function(res) {
			if(res.resCode == "SUCCESS") {
				console.log(res);
				$scope.datat = res;
				for(i = 0; i < $scope.datat.invoiceList.length; i++) {
					$scope.datat.invoiceList[i].check = false;
				}
			} else {
				res && ngMessage.showTip(res.resMsg);
			}
		})
	}

	//收货地址
	$scope.getrecaddress = function() {
		orderS.getrecaddress({
			"token": token,
		}, function(res) {
			if(res.resCode == "SUCCESS") {
				console.log(res);
				$scope.datatlist = res;
				for(i = 0; i < $scope.datatlist.recaddressList.length; i++) {
					$scope.datatlist.recaddressList[i].check = false;
				}
			} else {
				res && ngMessage.showTip(res.resMsg);
			}
		})
	}
	$scope.my_passenger = {
		"mess": "当前未选择旅客",
	}
	//旅客列表
	var lenhh=totalnum;
	var kks=1;
	$scope.my_passenger = function() {
		orderS.my_passenger({
			"token": token,
		}, function(res) {
			if(res.resCode == "SUCCESS") {
				console.log(res);
				$scope.info = res.data || [];
				for(i = 0; i < $scope.info.length; i++) {
					for(y = 0; y < selectBoxth.length; y++) {
						if($scope.info[i].pe_id == selectBoxth[y]) {
							$scope.info[i].check = true;
							$scope.info[i].num_index=kks;
							$scope.my_passenger.mess = "选择旅客";
							kks++;
						}
					}
				}
			} else {
				res && ngMessage.showTip(res.resMsg);
			}
		})
	}
$scope.my_passenger();
    if(selectBoxth.length < totalnum) {
		shennum = totalnum - selectBoxth.length;
	}

	$scope.shens = {
		//"data":[{"name":"1234","id":"12",},{"name":"1234","id":"12",}],
		"data": [],
		//"value":"12",
	}
    
	for(h = 0; h < shennum; h++) {
		$scope.shens.data[h] = {
//			"name": "1234",
			"id": lenhh,
		}
		lenhh--;
	}
   console.log($scope.shens.data);



	//旅客信息 。匹配手机号码
	$scope.getInfo = function() {
		orderS.getInfo({
			"token": token,
		}, function(res) {
			if(res.resCode == "SUCCESS") {
				$scope.usermess = res;
				console.log($scope.usermess.mobile);
				if(!$scope.phone) {
					$scope.phone = parseInt($scope.usermess.mobile);
				}
			} else {
				res && ngMessage.showTip(res.resMsg);
			}
		})
	}

	$scope.getInfo();
	
	$scope.getrecaddress();
	$scope.getinvoice();
	$scope.availableIntegral();
	$scope.getDiscountPrice();
	$scope.get_info();
	$scope.getInsurance();
	//console.log($scope.usermess);
	//console.log($scope.info);

	$scope.topage = function(page) {
		//window.location.href="http://m.m.com/html/user/passengersel.html";
		storage.toPage(page)
	}
	//去选择 旅客，发票，优惠，保险 信息
	$scope.topaget = function(page) {
		if($scope.realname) {
			storage.set("realname", $scope.realname);
		}
		if($scope.phone) {
			storage.set("phone", $scope.phone);
		}
		storage.toPage(page)
	}
	
	//初始化各种金额
	$scope.bxprice = 0; //保险价格
//	$scope.creditsnum = 0;//可用于抵扣的积分相对的金额
	$scope.proportion = 1; //积分兑换比例
	$scope.countPrice = 0; //优惠价格
	
	//保险选择
	$scope.baoxian = false;
	$scope.payby = {
		"msg": "",
		"mess": "当前未选择保险",
		"selectBoxt": [],
		"check": function(v) {
			v.check = !v.check;
			if(v.check) {
				$scope.payby.selectBoxt.push(v.id);
				$scope.bxprice += parseFloat(v.costs) * parseInt(totalnum);
				pricesum();
			} else {
				var index = $scope.payby.selectBoxt.indexOf(v.id);
				if(index > -1) {
					$scope.payby.selectBoxt.splice(index, 1);
					$scope.bxprice -= parseFloat(v.costs) * parseInt(totalnum);
					pricesum();
				}
			}
			if(!$scope.hasInsurance){
				$scope.payby.mess = "无保险可选";
			}else if($scope.payby.selectBoxt.length) {
				$scope.payby.mess = "选择保险";
				$scope.baoxian = true;
			} else {
				$scope.payby.mess = "当前未选择保险";
				$scope.baoxian = false;
			}
			console.log($scope.bxprice);
			console.log($scope.priceSum);
			console.log($scope.payby.selectBoxt);
		},
		"onSwitch": function() {
		}
	}
	
	//选择积分抵扣
	$scope.ison = false;
	$scope.checks = function() { 
		$scope.ison = !$scope.ison;
//		$scope.creditsnum = $scope.credits / $scope.proportion;
		countPrice();
		pricesum(); //计算应支付总额
	}
	//优惠选择
	$scope.paybys = {
		"msg": "",
		"mess": "当前未选择优惠",
		"selectBox": [], //已选优惠
		"check" : function(v) { //优惠选择
			v.check = !v.check;
			if(v.check) {
				$scope.paybys.selectBox.push(v.type);//添加项
				for(i = 0; i < $scope.datalist.data.length; i++) { //修改状态
					if($scope.datalist.data[i].type == index) {
						$scope.datalist.data[i].check = true;
					}
				};
				countPrice(); //计算优惠总额
				pricesum(); //计算应支付总额
			} else {
				var index = $scope.paybys.selectBox.indexOf(v.type);
				if(index > -1) {
					$scope.paybys.selectBox.splice(index, 1); //删除项
					for(i = 0; i < $scope.datalist.data.length; i++) { //修改状态
						if($scope.datalist.data[i].type == index) {
							$scope.datalist.data[i].check = false;
						}
					};
					countPrice();//计算优惠总额
					pricesum();//计算应支付总额
				}
			};
			if($scope.hasNOdiscount){
				$scope.mess = "当前无可用优惠";
//				console.log($scope.hasNOdiscount)
			}else if($scope.paybys.selectBox.length||$scope.ison) { //选了优惠 || 选了积分抵扣
				$scope.mess = "选择优惠";
			} else {
				$scope.mess = "当前未选择优惠";
			}
			console.log($scope.datalist.data);
			console.log($scope.paybys.selectBox);
		},
		"onSwitch": function() {
		}
	}
	
	function countPrices() { //计算积分抵扣
		if($scope.ison) {
			if($scope.credits <= $scope.priceSum) {
				$scope.creditsnum = $scope.credits / $scope.proportion;
				$scope.myall = true;
				$scope.priceSum = Math.round(($scope.priceSum - parseFloat($scope.credits)) * 100) / 100;
			} else {
				if($scope.priceSum < 0) {
					$scope.creditsnum = 0;
				} else {
					$scope.creditsnum = parseInt($scope.priceSum);
				}
				$scope.priceSum = 0;
			}
		} else {
			$scope.creditsnum = 0;
			if($scope.priceSum < 0) {
				$scope.priceSum = 0;
			}
		}
		console.log($scope.priceSum);
	};

	function countPrice() { //计算优惠金额
		$scope.countPrice = 0;
		for(i = 0; i < $scope.datalist.data.length; i++) {
			if($scope.datalist.data[i].check == true) {
				$scope.countPrice += parseFloat($scope.datalist.data[i].price);
			}
		};
		console.log($scope.countPrice);
		
		if($scope.credits){//如果有积分
			//此时应重新计算一下需要抵扣的积分
			var lestPrice = parseInt(parseFloat($scope.staprice) + parseFloat($scope.bxprice) - parseFloat($scope.countPrice));
			if($scope.credits <= lestPrice){
				$scope.creditsnum = $scope.credits;
			}else{
				$scope.creditsnum = lestPrice;
				if(lestPrice<0){
					$scope.creditsnum = 0;
				}
			}
		};
		
		if($scope.ison) { //如果选择 积分抵扣
			$scope.countPrice += $scope.creditsnum;
		}else{
			$scope.creditsnum = $scope.credits;
		};
		
		console.log($scope.countPrice);
	};

	function pricesum() {  //计算应支付总额
		$scope.priceSum = Math.round((parseFloat($scope.staprice) * 1 + parseFloat($scope.bxprice) * 1 - parseFloat($scope.countPrice)*1) * 100) / 100;
		if($scope.priceSum<0){
			$scope.priceSum = 0;
		};
		console.log($scope.staprice);
		console.log($scope.bxprice);
		console.log($scope.countPrice);
		console.log($scope.priceSum);
	};
	pricesum();

	var postData = {
		"contact": $scope.realname,
		"mobile": $scope.phone,
		"source": bind ? 2 : 3 //1登录源--微信客户端登录	2登录源--手机客户端登录
	};
	$scope.canshu = function() {
		$(".beijinss").show();
		$("#showsels").animate({
			bottom: "49px"
		}, 300);
	};

	$scope.cancel = function() {
		$("#showsels").animate({
			bottom: "-35%"
		}, 10);
		setTimeout(function() {
			$(".beijinss").hide();
		}, 50)

	}

	$scope.tijiao = function() {
		var postdata = {
			"adult_num": $scope.senddata.adultNum,
			"child_num": $scope.senddata.childNum,
			//"childPrice":$scope.senddata.childPrice,
			//"adultPrice":$scope.senddata.adultPrice,
			"goods_id": $scope.senddata.goods_id,
			//"totalnum":$scope.senddata.totalnum,
			"token": $scope.senddata.token,
			"dateTime": $scope.senddata.dateTime,
		};
		if($scope.needs_invoice) {
			if(!$scope.paybyt.invoice_payee) {
				ngMessage.showTip("请选择发票抬头");
				return false;
			}
			if(!$scope.paybyq.receive_name) {
				ngMessage.showTip("请选择发票收件人信息");
				return false;
			}
			postdata.invoice_payee = $scope.paybyt.invoice_payee;
			postdata.receive_name = $scope.paybyq.receive_name;
			postdata.receive_phone = $scope.paybyq.receive_phone;
			postdata.receive_address = $scope.paybyq.receive_address;
		};
		postdata.needs_invoice = $scope.needs_invoice;
		if(!$scope.realname) {
			ngMessage.showTip("请填写订单联系人姓名");
			return false;
		}else if($scope.realname&&$scope.realname.length<2){
			ngMessage.showTip("联系人姓名应不少于2个字符");
			return false;
		};
		if(!$scope.phone || !/^[1][35867][0-9]{9}$/.test($scope.phone)) {
			ngMessage.showTip("请填写有效的手机号！");
			return false;
		};
		if(selectBoxth.length != totalnum) {
			ngMessage.showTip("旅客人数不足");
			return false;
		};
		postdata.contact = $scope.realname;
		postdata.mobile = $scope.phone;
		postdata.source = bind ? 2 : 3 //1登录源--微信客户端登录	2登录源--手机客户端登录
		var normss = $scope.paybys.selectBox.join(",");
		postdata.type = normss;
		if($scope.ison){
			postdata.integral = $scope.creditsnum / $scope.deductible;
		};
		postdata.insu_id = $scope.payby.selectBoxt;
		postdata.travellerList = [];
		for(i = 0; i < $scope.info.length; i++) {
			for(y = 0; y < selectBoxth.length; y++) {
				if($scope.info[i].pe_id == selectBoxth[y]) {
					//$scope.info[i].check=true;
					//for(u=0;u<$scope.info[i].)
					postdata.travellerList[y] = {
						"travellerName": $scope.info[i].pe_name,
						"documentName": $scope.info[i].certificates[0].ce_name,
						"cardNumber": $scope.info[i].certificates[0].ce_number,
						"pe_id": $scope.info[i].pe_id,
					}
				}
			}
		}
		console.log(postdata);
		orderS.single(postdata, function(res) {
			if(res.resCode == "SUCCESS") {
				storage.set("selectBox", "");
				storage.set("realname", "");
				storage.set("phone", "");
				storage.set("orderItem", res);
				storage.toPage("checknext");
				console.log(res);
			} else {
				res && ngMessage.showTip(res.resMsg);
			}
		})
	}

	var payedMsg = "订单已提交，请重新登录微信后再进行支付";
	$scope.page = {
		title: "订单详情",
		showBackbtn: true,
		userfeedback: "",
		currentLayout: "index",
		prevLayout: "",
		ppLayout: "",
		pay: function() {
		},
		submited: false,
	}

	$scope.layout = {
		"index": {
			"show": true,
			"title": "填写出行信息",
			"back": true,
			"history": true
		},
		"payby": {
			"show": false,
			"title": "选择保险",
			"back": true
		},
		"paybys": {
			"show": false,
			"title": "选择优惠",
			"back": true
		},
		"paybyt": {
			"show": false,
			"title": "选择发票抬头",
			"back": true
		},
		"paybyq": {
			"show": false,
			"title": "选择收件人",
			"back": true
		}
	}

	$scope.switchLayout = function(layout, b) {
		if($scope.layout.hasOwnProperty(layout)) {
			for(var i in $scope.layout) {
				if($scope.layout.hasOwnProperty(i)) {
					$scope.layout[i].show = false;
				}
			}
			$scope.layout[layout].show = true;
			$scope.page.title = $scope.layout[layout].title + "";
			if(b) {
				$scope.page.title = $scope.layout[layout].subTitle + "";
			};
			$scope.page.showBackbtn = $scope.layout[layout].back;
			$scope.page.ppLayout = $scope.page.prevLayout;
			$scope.page.prevLayout = $scope.page.currentLayout;
			$scope.page.currentLayout = layout;
		};
	}
	$scope.switchLayout("index");

	
	//是否需要发票
	$scope.bestCoin = false;
	$scope.needs_invoice = 0;
	$scope.checkuse = function() {
		$scope.bestCoin = !$scope.bestCoin;
		if($scope.bestCoin) {
			$scope.needs_invoice = 1;
		} else {
			$scope.needs_invoice = 0;
		}
	}

	//发票抬头选择
	$scope.paybyt = {
		"msg": "",
		"invoice_payee": "",
		"currentItem": 0,
		"check": function(v) {
			//console.log(v);return false;
			if(!v.check) {
				for(i = 0; i < $scope.datat.invoiceList.length; i++) {
					$scope.datat.invoiceList[i].check = false;
				}
				$scope.paybyt.invoice_payee = v.invoicePayee;
			} else {
				$scope.paybyt.invoice_payee = "";
			}
			v.check = !v.check;
		},
		"onSwitch": function() {
		}
	}

	//收件人选择
	$scope.paybyq = {
		"msg": "",
		"receive_name": "",
		"receive_phone": "",
		"receive_address": "",
		"currentItem": 0,
		"check": function(v) {
			//console.log(v);return false;	
			if(!v.check) {
				for(i = 0; i < $scope.datatlist.recaddressList.length; i++) {
					$scope.datatlist.recaddressList[i].check = false;
				}
				$scope.paybyq.receive_name = v.name;
				$scope.paybyq.receive_phone = v.mobile;
				$scope.paybyq.receive_address = v.localtion + v.town_name + v.address;
			} else {
				$scope.paybyq.receive_name = "";
				$scope.paybyq.receive_phone = "";
				$scope.paybyq.receive_address = "";
			}
			v.check = !v.check;
			console.log($scope.paybyq);
		},
		"onSwitch": function() {
		}
	}
	

	$scope.back = function() {
		var layout = $scope.page.currentLayout;
		if($scope.layout[layout].history) {
			storage.set("selectBox", "");
			storage.set("realname", "");
			storage.set("phone", "");
			window.history.go(-1);
//			window.location.href = "../commodity/dateChoose.html?gid="+goods_id;
//			storage.toPage(../commodity/dateChoose.html?gid=4);
		} else {
			if($scope.page.ppLayout != "index") {
				$scope.switchLayout('index');
			} else {
				$scope.switchLayout($scope.page.prevLayout);
			}
		}
	}

	orderS.wxsdk({
		url: window.location.href
	}, function(res) {
		if(res && res.resCode == "SUCCESS") {
			ngWechat && ngWechat.init({
				"appId": res.jssdk.appId,
				"timestamp": res.jssdk.timestamp,
				"nonceStr": res.jssdk.nonceStr,
				"signature": res.jssdk.signature
			})
		};
	});
})

.controller('detailC', function ($scope,orderS,storage,ngMessage){
	storage.init();
	var token = storage.get("token");
	if (!token) {
		storage.toPage("login");
	};
	var orderItem = storage.get("orderItem");
	$scope.detail={
		"delivery":{},
		"goods":{}
	};
	$scope.checkRefundBtn = function(v){
		return v&&$scope.detail.btnReturns=="1"&&v.isRefund=="0";
	}
	$scope.statusName="退款/退款";
	$scope.btnReturns = false;
  $scope.refundSta = true;
	$scope.checkFun = true;
	var refundMsg=["审核未通过","待审核","待退款","售后中","已退款","退款失败","待退货","取消退款"]
	orderItem&&orderS.detail({
		"order_id":orderItem.order_id,
		"token":token
	},function (res) {
		switch(res.status){
			case "0":
				res.statusN = "待支付";
				break;
			case "1":
				res.statusN = "待出行";
				break;
			case "2":
				res.statusN = "已完成";
				break;
			case "3":
				res.statusN = "待退款";
				break;
			case "4":
				res.statusN = "拒绝退款";
				break;
			case "5":
				res.statusN = "退款完成";
				break;
			case "6":
				res.statusN = "已取消";
				break;
		};
		res.order_amount = parseFloat(res.order_amount);
		res.add_time = formatDate(res.add_time);
		res.start_time = formatDate(res.start_time).split(" ")[0];
		res.adultPrice = parseFloat(res.adultPrice);
		res.order_type = parseFloat(res.order_type);
		res.childPrice = parseFloat(res.childPrice);
		res.child_num = parseFloat(res.child_num);
		res.discount = parseFloat(res.discount);
		for(var i=0;i<res.insuList.length;i++){
			res.insuList[i].price = parseFloat(res.insuList[i].price);
		};
		$scope.hasdiscount = false;
		for(var i=0;i<res.activity.length;i++){
			res.activity[i].price = parseFloat(res.activity[i].price);
			if(res.activity[i].price){
				$scope.hasdiscount = true;
			}
		};
		$scope.detail = res;
		console.log(res)
	});
	
	function formatDate(date){  //时间戳转换成 (2016-12-12 11:11:11)
		var now = new Date(date*1000);
  	var y =now.getFullYear();     
  	var m =now.getMonth()+1;     
  	var d =now.getDate();     
  	var h = now.getHours();
		var mm = now.getMinutes();
		var s = now.getSeconds();
    return   y+"-"+m+"-"+d+" "+h+":"+mm+":"+s;     
  };
  
	$scope.storesTips = function(){
		var res = $scope.detail;
		if (res.stores&&res.stores.name) {
			var msg =res.stores.name+"<br>"
				+ res.stores.mobile+"<br>"
				+res.stores.localtion +" \t "+ res.stores.address;
			ngMessage.showTip(msg,2400);
		};
	}
	
	$scope.refund = function () {
		ngMessage.show("申请退款？", function() {
			orderS.refund({
				"token": token,
				"order_id": orderItem.order_id
			}, function(res) {
				if (res) {
					ngMessage.showTip(res.resMsg)
					storage.toPage("order");
				};
			})
		})
	};
	

		//取消订单
	$scope.cancel = function () {
		ngMessage.show("取消该订单？", function() {
			orderS.cancel({
				"token": token,
				"order_id": orderItem.order_id
			}, function(res) {
				if (res) {
					ngMessage.showTip(res.resMsg)
					storage.toPage("order");
				};
			})
		});
	};

	$scope.pay = function() {
		storage.set("orderItem",orderItem);
		storage.toPage("checknext");
	};
	
	$scope.reload = function(){
		orderItem && orderS.detail({
			"orderId": orderItem.id,
			"token": token
		}, function(res) {
			$scope.detail = res;
		});
	}
	
	$scope.checkRefundBtn = function(v){
		return v&&$scope.detail.btnReturns=="1"&&v.isRefund=="0";
	}

})
.controller('payC', function ($scope,orderS ,storage,ngMessage,ngWechat){
	storage.init();
	var wx = storage.get("wx");
	console.log(wx)
	var token = storage.get("token");
	if (!token) {
		storage.toPage("login");
	};
	var orderItem = storage.get("orderItem");
	$scope.coin = {
		num:0,
		text:"( ￥0 )",
		check:function(price){
			var price = parseFloat(price)||0;
			return this.num>=price
		}
	};
	$scope.detail={
		"delivery":{},
		"goods":{}
	}
	orderS.detail({
		"orderId":orderItem.id,
		"token":token
	},function (res) {
		if (res.resCode=="SUCCESS") {
			$scope.detail = res;
		}else {
			ngMessage.showTip(res.resMsg);
			storage.toPage("login");
		};

	});
	orderS.coin({
				token:token,
			},function (res) {
				if (res&&res.resCode=="SUCCESS") {
					$scope.coin.num = parseFloat(res.money);
					$scope.coin.text = "( ￥"+res.money+" )";
				};
			})


	$scope.refund = function () {
		storage.set("orderId",$scope.detail.id);
		storage.toPage("request");
	}
		//支付方式选择
	$scope.payby={
		"msg":"",
		"currentItem":0,
		"get":function(index) {			
			if (index) {
				if ($scope.coin.check($scope.detail.price)) {
					$scope.payby.msg="账户余额支付"
				}else{
					ngMessage.showTip("余额不足以支付该订单，请选择其他方式支付！");
					return false;
				}
				
			}else{
				$scope.payby.msg="微信安全支付"
			}
			$scope.payby.currentItem = index;
		},
		"onSwitch":function () {
			$scope.payby.get($scope.payby.currentItem)
		},
		pay:function() {
			if ($scope.detail.btnPay=="0") {
				ngMessage.showTip($scope.detail.statusName);
				return
			};
			if ($scope.payby.pay) {
				$scope.payby.pay = false;
			}
			if ($scope.payby.currentItem) {
				//使用余额支付
				orderS.apay({
					token: token,
					orderId: orderItem.id
				}, function(dat) {
					if (dat.resCode == "SUCCESS") {
						storage.toPage("paySuccess");
					}else{
						storage.toPage("payFailure")
					}
				});
			} else {
				if (!wx) {
					ngMessage.showTip("请使用微信登陆");
					return false
				};
				orderS.pay({
					token: token,
					orderId: orderItem.id,
					openid: wx.openid //"oo54huGZkeH8ECoVAB2IftXOS5EI"//
				}, function(dat) {
					  
					if (dat.resCode == "SUCCESS") {
						ngWechat.pay(dat.data, function(rs) {
							storage.toPage("paySuccess")
						}, function() {
							storage.toPage("payFailure")
						})
					};
				});
			}


		}
	}
})













