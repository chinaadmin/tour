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
.controller("orderC",function ($scope,orderS,storage,ngMessage) {	
	storage.init();
	
	$scope.isDisplay = false;
	var index = 1;	
	var type= storage.queryField("type")||storage.getOnce("orderType")||0;      //getOnce

	var token = storage.get("token");
	if (!token) {
		storage.toPage("login");
	};
	var resText=[
		"暂无订单",
		"暂无待支付订单",
		"暂无待收货订单",
		"暂无完成订单",
		"暂无取消订单",
		"暂无待发货订单"
	]
	$scope.hasMore = false;
	$scope.order=[];
	$scope.act=type;
	$scope.hasRes = true;
	$scope.noRes="";
	function getList() {	
		$scope.hasRes = true;	
		orderS.order({
			"token": storage.get("token") || "",
			"keyword": "",
			"type": type,
			"currentPage": index,
			"count": 10
		}, function(res) {
			if (res && res.resCode == "SUCCESS") {				
				if (res.lastPage == "1") {
					$scope.hasMore=true;
				}else{
					$scope.hasMore=false;
				};
				if (type == "2" || type =="3" ) {  
					$scope.isDisplay = true;
				} else {
					$scope.isDisplay = false;
				}
				
				if (index>1) {
					var tmp = angular.copy($scope.order);
					$scope.order = tmp.concat(res.orderList);
				}else{
					$scope.order = res.orderList;
				};
				if (!$scope.order.length) {
					$scope.hasRes = false;
					$scope.noRes = resText[type];
				};
			} else if (res) {
				ngMessage.showTip(res.Msg)
			};
		})
	};
	getList();

	$scope.switch = function (ty) {
		if (ty!=type) {
			type = ty;
			index=1;
			getList();
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
	//取消订单
	$scope.cancel = function (v) {

		ngMessage.show("取消该订单？", function() {
			orderS.cancel({
				"orderId": v.id,
				"token": token
			}, function(res) {
				if (res) {
					ngMessage.showTip(res.resMsg)
					$scope.reload();
				};
			})
		});
	};

	$scope.pay = function(v) {
		storage.set("orderItem", v);
		storage.toPage("payOrder");
	};
	//删除订单
	$scope.del = function(v) {
		ngMessage.show("删除该订单？", function() {
			orderS.del({
				"orderId": v.id,
				"token": token
			}, function(res) {
				if (res) {
					ngMessage.showTip(res.resMsg);
					$scope.reload();
				};
			})
		});
	};
	//确认订单
	$scope.sure = function (v) {

		ngMessage.show("确认收货？", function() {
			orderS.sure({
				"orderId": v.id,
				"token": token
			}, function(res) {
				if (res) {
					ngMessage.showTip(res.resMsg);
					setTimeout(function(){
						$scope.switch(3);
					}, 1500)
					$scope.reload();
				};
			})
		});		
	};
	$scope.reload = function () {
		index=1;
		getList();
	}
	//查看物流
	$scope.togtics = function (v) {
	    window.location.href=host+"html/messagePush/check.html?rec_id="+v;
	};
	//退款退货
	$scope.refund = function (v) {
		storage.set("orderId",v.recId);
		storage.toPage("request");
	}

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

.controller("checksC",function ($rootScope,$scope,orderS, invoiceS ,storage,ngMessage,ngWechat) {	
	storage.init();
	var ids = storage.get("cartId");
	var token = storage.get("token");
	var wx = storage.get("wx");
	if (!token) {
		storage.toPage("login")
	};
	var payPrice = $scope.payPrice= 0;
	var payPostData=null;
	var submitedData = null;


     $scope.canshu = function() { 
         $(".beijinss").show();
         $("#showsels").animate({bottom: "0px"}, 1000 );
    };

     $scope.cancel=function(){
	$("#showsels").animate({bottom: "-70%"},10);
	setTimeout(function(){
 	$(".beijinss").hide();
 	}, 50)
  		
	}
})

.controller("remenmddC",function ($rootScope,$window,$scope,orderS, invoiceS ,storage,ngMessage,ngWechat) {	
	storage.init();
	var ids = storage.get("cartId");
	var token = storage.get("token");
	var wx = storage.get("wx");
	/*
	if (!token) {
		storage.toPage("login")
	};
	*/
	var payPrice = $scope.payPrice= 0;
	var payPostData=null;
	var submitedData = null;


     $scope.canshu = function() { 
         $(".beijinss").show();
         $("#showsels").animate({bottom: "0px"}, 1000 );
    };

     $scope.cancel=function(){
	$("#showsels").animate({bottom: "-70%"},10);
	setTimeout(function(){
 	$(".beijinss").hide();
 	}, 50)
  		
	}


	$scope.cartBox = {
		"cacheShipment":0,//缓存普通快递运费
		"shipment":0,
		"goodsPrice":0,
		"payPrice":0,
		"money":0,
		"goodsList":[],
		"totalPrice":0,
		'queryShipment':false
	};
	$scope.bestCoin={		
		"maxBcoin":0,
		"bcoin":0,
		"coin":0,
		"usecoin":false,
		"use":function () {
			$scope.bestCoin.usecoin = !$scope.bestCoin.usecoin;
			if (!$scope.bestCoin.usecoin) {
				$scope.bestCoin.bcoin = 0;
			};
		},
		"init":function () {
			orderS.coin({
				token:token,
			},function (res) {
				if (res&&res.resCode=="SUCCESS") {
					$scope.bestCoin.maxBcoin = parseFloat(res.integral)
				};
			})
		}
	}

	//$scope.bestCoin.init();
	// init 初始化
	orderS.rementuijian({
		//"cartId": ids,
		//"token": token
	}, function(res) {
		if (res.resCode == "SUCCESS") {
			console.log(res);
			$scope.datalist=res.data;
		} else {
			// storage.toPage("cart");
			res && ngMessage.showTip(res.resMsg);
		}
		if (res.resCode == "UNKNOWN_ERROR") {
			setTimeout(function(){
				storage.toPage("cart");
			}, 1500)
		}
	});
	var payedMsg="订单已提交，请重新登录微信后再进行支付";
	$scope.page={
		title:"订单详情",
		showBackbtn:true,
		userfeedback:"",
		currentLayout:"index",
		prevLayout:"",
		ppLayout:"",
		pay:function () {
			
		},
		
		submited:false,
		submit:function() {
				if ($scope.page.submited) {
					window.setTimeout(function(){
						$scope.page.submited = false;
					}, 2400)
					return
				};
				// $scope.page.submited = true;
				if (!$scope.recAddress.default.id && $scope.psstyle.msg != "门店自提") {
					ngMessage.showTip("请填写收货地址");
					return false;
				};
				if (!$scope.psstyle.msg) {
					ngMessage.showTip("请选择配送方式");
					return false;
				};
				if (!$scope.payby.msg) {
					ngMessage.showTip("请选择支付方式");
					return false;
				};
				if($scope.page.submited == false) {
					$scope.page.submited = true;
					var post={
						shippingType:$scope.psstyle.page,
						addressId:$scope.recAddress.default.id, //
						storesId:$scope.psstyle.store.storesId, //
						storesTime:$scope.psstyle.uTime.TIME,
						invoiceId:$scope.invoice.default.uid, //
						invoicePayee:$scope.invoice.content,
						couponId:$scope.coupon.default.id, //券
						integral: $scope.bestCoin.bcoin,
						postscript:$scope.page.userfeedback,
						payType:($scope.payby.currentItem?'ACCOUNT':'WEIXIN'),
						cartIds:ids,
						token:token
					};
					if (post.shippingType!=0) {
						post.storesId = $scope.psstyle.sdid;
					};
					
					if (payPostData) {
						ngWechat.pay(payPostData, function(rs) {
							if (rs.success) {
								storage.toPage("paySuccess")
							} else {
								storage.toPage("payFailure")
							}
						})
						return
					};
					
					// ngMessage.showTip("正在提交订单，请稍等片刻...",3000);
					ngMessage.loading("正在提交订单，请稍等片刻...");
					if (submitedData) {
						ngMessage.showTip(submitedData.resMsg);
						if (post.payType == "WEIXIN" && submitedData.isPay == "1") {
							if (!wx || !wx.openid) {
								ngMessage.showTip(payedMsg);
								setTimeout(function() {
									storage.set("wxReferer","payOrder");
									storage.toPage("wxAuth");

								}, 1000);						
								return false;
							};
							orderS.pay({
								token: token,
								orderId: submitedData.orderId,
								openid: wx.openid
							}, function(dat) {
								if (dat.resCode == "SUCCESS") {
									payPostData = dat.data;
									ngWechat.pay(payPostData, function(rs) {
										if (rs.success) {
											storage.toPage("paySuccess")
										} else {
											storage.toPage("payFailure")
										}
									})
								};
							});
						} else { //使用余额支付
							storage.toPage("paySuccess")
						}
						return false
					};
					 
					orderS.submit(post,function (res) {
						$scope.page.submited = false;
						if (res&&res.resCode=="SUCCESS") {
							res.id = res.orderId;
							storage.set("orderItem",res);
							
							if (post.payType == "WEIXIN" && res.isPay == "1") {
								if (!wx || !wx.openid) {   //备注
									ngMessage.showTip(payedMsg);
									setTimeout(function() {
										storage.set("wxReferer","payOrder");
										storage.toPage("wxAuth");
									}, 1000);
									return false;
								};
								orderS.pay({
									token: token,//orderItem.id,
									orderId: res.orderId,
									openid: wx.openid
								}, function(dat) {
									if (dat.resCode == "SUCCESS") {
										submitedData = res;
										ngMessage.hide();
										ngWechat.pay(dat.data, function(rs) {
											storage.toPage("paySuccess")
										}, function() {
											storage.toPage("payFailure")
										})
									};
								});
							} else { //使用余额支付
								storage.toPage("paySuccess")
							}
						}else if (res) {
							ngMessage.showTip(res.resMsg);
						};
					})
				}else{
					return false;
				}
			
		}
	}

    $scope.back = function() {
		if ($window.history.length) {
			$window.history.go(-1);
		} else {
			storage.toPage("home");
		}

	}
	
	
	
})

.controller('detailC', function ($scope,orderS ,storage,ngMessage){
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
		"orderId":orderItem.id,
		"token":token
	},function (res) {
		$scope.detail = res;
		if (res.stores&&res.stores.name&&res.shippingType=='2') {
			res.stores.nameExt = "由"+res.stores.name+"配送"
		};
		$scope.statusM = false;
		if(res.goods.length>1){
			$scope.statusM = true;
		}
		
		 if(res.refundStatus || res.statusName=="待付款"){
		 	   $scope.refundSta = false;
		 	   $scope.refundStatusText = "退款/退款: "+refundMsg[parseInt(res.refundStatus)+1];
		 }
	});

	$scope.storesTips = function(){
		var res = $scope.detail;
		if (res.stores&&res.stores.name) {
			var msg =res.stores.name+"<br>"
				+ res.stores.mobile+"<br>"
				+res.stores.localtion +" \t "+ res.stores.address;
			ngMessage.showTip(msg,2400);
		};
	}
	$scope.refund = function (v) {
		storage.set("orderId",v.recId);
		storage.toPage("request");
	};
	$scope.refundAll = function (v) {
		storage.set("orderId",v.id);
		storage.toPage("requestAll");
	};
	
	
	
	
	$scope.refundItem = function(v){
		storage.set("refundItem",{"refundId":v.refundId});
		storage.toPage('refundDetail');
	}

		//取消订单
	$scope.cancel = function () {
		ngMessage.show("取消该订单？", function() {
			orderS.cancel({
				"orderId": orderItem.id,
				"token": token
			}, function(res) {
				if (res) {
					ngMessage.showTip(res.resMsg)
					$scope.reload();
				};
			})
		});
	};

	$scope.pay = function() {
		storage.toPage("payOrder");
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













