function isInWeiXin() {
	var ua = window.navigator.userAgent.toLowerCase();
	if (ua.match(/MicroMessenger/i) == 'micromessenger') {
		return true;
	} else {
		return false;
	}
}
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
				// if (!reg.test(referer)&&!loginReg.test(referer)) {
				// 	storage.toPage(referer);
				// 	return false;
				// };
				if (storage.test(attrs.ngBack)) {
					storage.toPage(attrs.ngBack)
				} else {
					window.history.go(-1);
				};
			});
		}
	}
})
.directive('mychange',function(storage,ngMessage,userS,ngResizeImage){
	storage.init();
	return {
		restrict:'E',
		template:'<label><input type="file"   capture="camera" /></label>',
		link:function(scope, element, attrs){
			element.bind('change',function(e){
				var obj = e.target,file = obj.files[0];      
		        //判断类型是不是图片  
		        if(!/image\/\w+/.test(file.type)){     
		                ngMessage.showTip("请确保文件为图像类型");
		                return false;   
		        }
		        ngMessage.hide();
		        ngMessage.loading("图像正在上传...");
		        //找出后辍
		        ext = file.type.split('/')[1];
		        var reader = new FileReader();   
		        reader.readAsDataURL(file);
		        if(!storage.isInWeiXin() || true){
		        	 readerOnload = function(event){  
							ngResizeImage.resize(file,obj, function(src) {	
								userS.updAvatar({
									"base":src,
									"ext":"jpeg",
									"token":storage.get('token')
								},function(rtn){
									if(rtn.resCode == 'SUCCESS'){
				    					if(rtn.src){
				    						/*document.getElementById('image').setAttribute('src',rtn.src);
				    						$('#image').attr('src',rtn.src);*/
				    						angular.element(document.getElementById('image')).attr('src',rtn.src);
				    						ngMessage.hide();
				    					}else{
				    						location.reload();
				    					}
				    				}else{
				    					ngMessage.showTip("图像上传失败!");
				    				}
								})
							})	
				        }
		        }else{
			        readerOnload = function(event){
			        	var _self = this;
			        	userS.updAvatar({
							"base": _self.result,
							"ext":ext,
							"token":storage.get('token')
						},function(rtn){
							if(rtn.resCode == 'SUCCESS'){
		    					if(rtn.src){
		    						/*document.getElementById('image').setAttribute('src',rtn.src);
		    						$('#image').attr('src',rtn.src);*/
		    						angular.element(document.getElementById('image')).attr('src',rtn.src);
		    						ngMessage.hide();	
		    					}else{
		    						location.reload();
		    					}
		    				}else{
		    					ngMessage.showTip("图像上传失败!");
		    				}
						});
			        }
		        }
		        reader.onload = readerOnload;
			});
		}
	}
})

.controller('successC', function ($scope,storage,promotionS,ngMessage,ngWechat) {
            storage.init();
            var token = storage.get("token");
            if(!token){
	   	        storage.toPage('login')
	         }
	        var user = storage.get("user");
	        var wx = storage.get("wx");
	        var id=null;
         promotionS.getSuccess({
				//member_id:v,
				//openid:wechat.openid,//||{openid:"oo54huGZkeH8ECoVAB2IftXOS5EI"};
				//openid:"o-dL1wGxG_4oXy-4QMKXCyc68dn4",
				token:token
			},function(res){				
				if (res&&res.resCode=="SUCCESS") { 
				  res && ($scope.data=res.info);
                  console.log(res);
                  
                  id=$scope.data.cid;
                 }
                 else{
                     ngMessage.showTip(res.resMsg); 
                 }
               })


       $scope.value=true;
       $scope.check=function (v) {
		$scope.value = !v;
		//console.log(v)
		//if (!v.check) {
			//$scope.checks = v.check;
			//countPrice();
			//return false;
		//};
		/*
		$scope.checks = true;
		for (var i = 0; i < $scope.cart.length; i++) {
			if (!$scope.cart[i].check) {
				$scope.checks = $scope.cart[i].check;
				break;
			};
		};
		*/
		//countPrice();
		}
		$scope.submit = function(){
			if($scope.value){
				card_physical_type=1;
				if(!$scope.ren){
					//alert("请输入有效");
					ngMessage.showTip("收件人不能为空");return
				}else if(!($scope.phone&&/^[1][34578][0-9]{9}$/.test($scope.phone))){
					ngMessage.showTip("请输入有效的手机号码!");return
				}else if(!$scope.address){
					ngMessage.showTip("收货地址不能为空");return
				}

			}else{
				card_physical_type=2;
			}
			receive_person=$scope.ren;
			phone=$scope.phone;
			receive_address=$scope.address;

			promotionS.submitData({
             cardsale_cid:id,
             card_physical_type:card_physical_type,
             receive_person:receive_person,
             phone:phone,
             receive_address:receive_address
			},function(res){
				if (res.resCode == "SUCCESS") {
                res && ($scope.data=res);
                console.log($scope.data);
                storage.toPage("appxiazai");
           }else{
           	ngMessage.showTip(res.resMsg);
           	//storage.toPage("appxiazai");
           }
			})
		}
	

	})

.controller('hytgyC', function ($rootScope,$interval,$scope,storage,promotionS,tool,ngMessage,ngWechat) {
            storage.init();
            var token = storage.get("token");
	        var user = storage.get("user");
	        var wx = storage.get("wx");
            

            function isInWeiXin() {
		    var ua = window.navigator.userAgent.toLowerCase();
		    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
			return true;
		     } else {
			return false;
		    }
	        }

	        //获取用户微信信息并缓存start
	(function(){
		//ngMessage.showTip("请使用微信客户端");
		var authKey = storage.queryField("info");
		//ngMessage.showTip("请使用微信客户端");
		//ngMessage.showTip(authKey);
		if(isInWeiXin() && !sessionStorage.getItem('online')){
			authKey && promotionS.mauth({ // 根据key从后台获取用户缓存
				key: authKey
			}, function(res) {		
				storage.set("wx", res.info);
				//获取用户信息并缓存end
				 storage.init();
				 var token = storage.get("token");
				 var wechat = storage.get("wx");
				 var bind = storage.get("bind");	 	
				if (!wechat) {
					storage.toPage("wxAuth");
				} else {
					!bind&&promotionS.oauth({
						openId: wechat.openid,
						headPic: wechat.head,
						nick: wechat.nick,
						type: "wechat",
						unionid:wechat.unionid
					}, function(res) {
						// if (wechat.openid==res.openId) {
						// 	storage.clear()
							// storage.toPage("login")
						if (res) {
							storage.clear();
							if (res.data) {
								storage.set("bind", res.data.part);
							} else if (res.token) {
								var user = {
											"aliasname":res.aliasname
										};
								storage.set("token", res.token);
								storage.set("uid", res.uid);
								//登入成功测标志
								sessionStorage.setItem('online',1);
							};
						};
					});
				}
			}, function() {
					//storage.toPage(page)
			})
		}
	})()

     //var wechat = storage.get("wx");
     //console.log(wechat);
    //ngMessage.showTip(wechat);
    //ngMessage.showTip(wechat.openid);
			promotionS.getPromotions({
				//token:token
				//type:1,
			},function (res) {
				res && ($scope.data=res);
                console.log($scope.data);
                for(i=0;i<$scope.data.data.length;i++){
                	if($scope.data.data[i].member_id==2){
                		$scope.data.data[i].desc="享受首次旅游减免68元/人，消费得积分、免费旅游机会、生日礼物;";
                	}else if($scope.data.data[i].member_id==3){
                		$scope.data.data[i].desc="享受首次旅游减免168元/人、消费得积分、免费旅游机会、生日礼物、三人以上旅游其中一人可享有5折、6.8折、8.8折相应折扣;";
                	}
                }
			})

   
	$scope.blocked = function(){
		ngMessage.showTip("即将开通，敬请期待！")
	}
	
    $scope.charge=function(v){
        console.log(v);
        storage.set("mem_id",v);
        window.location.href=host+"html/hysj.html";
    }
    
})

.controller('hysjsC', function ($scope,storage,promotionS,ngMessage,ngWechat) {
     $scope.login = function(){
		storage.set("referer","memcenterss");			
			storage.toPage('login');
	}
	var rec_id = storage.getUrlParam('id');
	$scope.isLogin = false;
	storage.init();
	var token = storage.get("token");
	//var user = storage.get("user");
	//var wx = storage.get("wx");
	if (token) {
		$scope.isLogin = true;
	} else {
		$scope.isLogin = false;
        //storage.toPage('login');
		$scope.login();
	};
})

.controller('hysjC', function ($scope,$rootScope,storage,promotionS,ngMessage,ngWechat) {
	
	$scope.login = function(){
		storage.set("referer","memcenterss");			
			storage.toPage('login');
	}
	var rec_id = storage.getUrlParam('id');
	console.log(rec_id);
	storage.init();
	var mem_id = storage.get("mem_id");
	console.log(mem_id);
	$scope.isLogin = false;
	
	

    promotionS.getPromotions({
				//token:token
				//type:1,
			},function (res) {
				res && ($scope.data=res);
                console.log($scope.data);
                $scope.data.data.number=mem_id;
                if($scope.data.data.number==undefined){
                	$scope.data.data.number=6;
                }
                for(i=0;i<$scope.data.data.length;i++){
                	if($scope.data.data[i].member_id==2){
                		//$scope.data.data.number=
                		$scope.data.data[i].desc="享受首次旅游减免68元/人，消费得积分、免费旅游机会、生日礼物;";
                	}else if($scope.data.data[i].member_id==3){
                		$scope.data.data[i].desc="享受首次旅游减免168元/人、消费得积分、免费旅游机会、生日礼物、三人以上旅游其中一人可享有5折、6.8折、8.8折相应折扣;";
                	}

                }
			})
      
      function isInWeiXin() {
		    var ua = window.navigator.userAgent.toLowerCase();
		    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
			return true;
		     } else {
			return false;
		    }
	        }

	        //获取用户微信信息并缓存start
	(function(){
		var authKey = storage.queryField("info");
		if(isInWeiXin() && !sessionStorage.getItem('online')){
			authKey && promotionS.mauth({ // 根据key从后台获取用户缓存
				key: authKey
			}, function(res) {		
				storage.set("wx", res.info);
				//获取用户信息并缓存end
				 storage.init();
				 var token = storage.get("token");
				 var wechat = storage.get("wx");
				 var bind = storage.get("bind");	 	
				if (!wechat) {
					storage.toPage("wxAuth");
				} else {
					!bind&&promotionS.oauth({
						openId: wechat.openid,
						headPic: wechat.head,
						nick: wechat.nick,
						type: "wechat",
						unionid:wechat.unionid
					}, function(res) {
						// if (wechat.openid==res.openId) {
						// 	storage.clear()
							// storage.toPage("login")
						if (res) {
							storage.clear();
							if (res.data) {
								storage.set("bind", res.data.part);
							} else if (res.token) {
								var user = {
											"aliasname":res.aliasname
										};
								storage.set("token", res.token);
								storage.set("uid", res.uid);
								//登入成功测标志
								sessionStorage.setItem('online',1);
							};
						};
					});
				}
			}, function() {
					//storage.toPage(page)
			})
		}
	})()
   
   var token = storage.get("token");
	var user = storage.get("user");
	
	//ngMessage.showTip(wechat);
	//alert(wechat);
	if (token) {
		$scope.isLogin = true;
	} else {
		$scope.isLogin = false;
        //storage.toPage('login');
		$scope.login();
	};
	/*微信支付*/
	$scope.pay = {

		//"number":storage.queryField('number'),    传参数
		"pay":function (v) {
			var wechat = storage.get("wx");
			
			/*
			var number = parseFloat($scope.pay.number)||0;
			if (!number||number<=0) {
				ngMessage.showTip("无效金额！");
				return false
			};
			*/
		    /*
			if ($scope.pay.pay) {
				$scope.pay.pay = false;
			}
			*/
		   
			if (!wechat||!wechat.openid) {
				//ngMessage.showTip("请使用微信客户端进行充值！");
				setTimeout(function() {
					storage.set("wxReferers","hysjymy");
					storage.toPage("wxAuth");
				}, 1000);
				return
			};
			promotionS.UpgradeMember({
				member_id:v,
				openid:wechat.openid,//||{openid:"oo54huGZkeH8ECoVAB2IftXOS5EI"};
				//openid:"o-dL1wGxG_4oXy-4QMKXCyc68dn4",
				token:token
			},function(res){				
				if (res&&res.resCode=="SUCCESS") {
                    //ngMessage.showTip("升级进来了");
					ngWechat.pay(res.data, function(res) {
						if (res.success) {
						ngMessage.showTip("恭喜您，支付成功！"); 
						storage.toPage("success");
						}else{
						ngMessage.showTip("抱歉，支付失败！");	
						}
					}, function(res) {
						//jump = "fail";
						
					})
                    
				}else{
					
                     ngMessage.showTip(res.resMsg);     
				}
			});
			//$scope.switchLayout(jump);
		}
	}
    /*微信支付*/
    /*
	$scope.user={
		rname:"",
		aname:"",
		username:(user&&user.aliasname?user.aliasname:""),
		money:0,
		integral:0,
		image:""
	}
	$scope.page = {
		msg: false,
		msgBtn: function() {
			storage.toPage("login")
		}
	};
	*/
	$scope.toPage=function (page,key,value) {
		if (!token) {
			ngMessage.showTip("请先登录")
			$scope.isLogin = false;
			return false
		} else {
			$scope.isLogin = true;
		};
		if (key&&value) {
			storage.set(key,value);
		};
		storage.toPage(page);
		if (!$scope.user.image) {
			$scope.user.image = res.photo;
		};
	};
	
	$scope.blocked = function(){
		ngMessage.showTip("即将开通，敬请期待！")
	}

})

.controller('gradeC', function ($scope,$filter,storage,promotionS,ngMessage,ngWechat) {
	storage.init();
	var token = storage.get("token");
	if (!token) {
		storage.toPage("login");
	};
	promotionS.user({"token":token},function(res) {
		console.log(res);
		if (res.resCode=="SUCCESS") {
			$scope.user = res
		}
	})
	$scope.toPage=function (page,key,value) {
		if (!token) {
			storage.toPage("login");
			return 
		};
		if (key&&value) {
			storage.set(key,value);
		};
		storage.toPage(page);
	};
	$scope.getCard = function(){
		promotionS.getCard({"token":token},function(res) {
			console.log(res);
			if (res.resCode=="SUCCESS") {
				storage.toPage("mailAddress")
			}else{
				storage.toPage("mailMsg")
			}
		})
	};
	
	promotionS.getPromotions({},function (res) {
		res && ($scope.promotions=res.data);
        $scope.pay2 = $scope.promotions[0];
        $scope.pay3 = $scope.promotions[1];
        console.log($scope.pay2);
        console.log($scope.pay3);
//      $scope.data.data.number=mem_id;
//      if($scope.data.data.number==undefined){
//      	$scope.data.data.number=6;
//      }
//      for(i=0;i<$scope.data.data.length;i++){
//      	if($scope.data.data[i].member_id==2){
//      		//$scope.data.data.number=
//      		$scope.data.data[i].desc="享受首次旅游减免68元/人，消费得积分、免费旅游机会、生日礼物;";
//      	}else if($scope.data.data[i].member_id==3){
//      		$scope.data.data[i].desc="享受首次旅游减免168元/人、消费得积分、免费旅游机会、生日礼物、三人以上旅游其中一人可享有5折、6.8折、8.8折相应折扣;";
//      	}
//
//      }
	})
	/*微信支付*/
	$scope.pay = {
		//"number":storage.queryField('number'),    传参数
		"pay":function (v) {
			var wechat = storage.get("wx");
			/*
			var number = parseFloat($scope.pay.number)||0;
			if (!number||number<=0) {
				ngMessage.showTip("无效金额！");
				return false
			};
			*/
		    /*
			if ($scope.pay.pay) {
				$scope.pay.pay = false;
			}
			*/
			if (!wechat||!wechat.openid) {
				//ngMessage.showTip("请使用微信客户端进行充值！");
				setTimeout(function() {
					storage.set("wxReferers","membershipGrade");
					storage.toPage("wxAuth");
				}, 1000);
				return
			};
			promotionS.UpgradeMember({
				member_id:v,
				openid:wechat.openid,//||{openid:"oo54huGZkeH8ECoVAB2IftXOS5EI"};
//				openid:"o-dL1wGxG_4oXy-4QMKXCyc68dn4",
				token:token
			},function(res){				
				if (res&&res.resCode=="SUCCESS") {
                    console.log(res.data);
//                  ngMessage.showTip("升级进来了");
					ngWechat.pay(res.data, function(res) {
						if (res.success) {
							ngMessage.showTip("恭喜您，支付成功！",1200,function(){
								storage.toPage("membershipGrade");
							});
						}else{
							ngMessage.showTip("抱歉，支付失败！");
//							storage.toPage("membershipGrade");
						}
					})
				}else{
                    ngMessage.showTip(res.resMsg);     
				}
			});
			//$scope.switchLayout(jump);
		}
	}
    /*微信支付*/
})