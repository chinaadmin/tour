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
.directive('mychange',function(storage,ngMessage,userS){
	storage.init();
	return {
		restrict:'E',
		template:'<label><input type="file"   capture="camera"  ng-show="isLogin"/></label>',
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
		        reader.readAsDataURL(file);//将文件作为图片
//				console.log(reader);
	        	reader.onload = function(event){  
	        	 	var src = event.target.result; //获取base64Code格式
        			console.log(src);
					userS.updAvatar({
						"type":2,
						"baseData":src,
						"ext":"jpeg",
						"token":storage.get('token')
					},function(rtn){
						if(rtn.resCode == 'SUCCESS'){
	    					if(rtn.result){
	    						/*document.getElementById('image').setAttribute('src',rtn.src);
	    						$('#image').attr('src',rtn.src);*/
	    						angular.element(document.getElementById('image')).attr('src',rtn.result.photo);
	    						ngMessage.hide();
	    					}else{
	    						ngMessage.showTip("图像为空!");
	    					}
    						location.reload();
	    				}else{
	    					ngMessage.showTip("图像上传失败!");
	    				}
					})
		        }
			});
		}
	}
})
.directive('stringToNumber', function() { //string 转 number
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value);
      });
    }
  };
})

.controller("loginC",function ($scope,$interval,loginS,storage,ngMessage) {	
	storage.init();
	var token = storage.get("token");
	var Referer = storage.getOnce("referer")||"";
//	var Referer = storage.get("referer");
	storage.set("oncereferer",Referer);	
	var bind = storage.get("bind")||"";
	if (token) {
		storage.toPage("personalCenter");
	};
	$scope.user={
		mobile:"",
		password:"",
		isWx:bind ? true : false,
		code:"",
		sendSMS:false,
		text:"获取验证码",
	};
	$scope.toPage=function (page) {
		storage.toPage(page)
	};
	$scope.myKeyup = function (ev) {
		var keycode = window.event?ev.keyCode:ev.which;
		if (keycode == 13) {
			$scope.login();
		};
	};
	
	var theClock=null;
	function clockEnd() {
		theClock = null;
		$scope.user.text = "获取验证码";
		$scope.user.sendSMS = false;
	};
	function clock (time) {
		$scope.user.text = "剩余59秒";
		$scope.user.sendSMS = true;
		var i = 59;
		theClock = $interval(function () {
			i--;
			$scope.user.text = "剩余"+i+"秒";
			if (i==0) {
				clockEnd();
			};
			
		},1000,59)
	};
	
	(function(){  //清空密码 或 验证码
		$("#type1").click(function(){
			$scope.user.code = ""
		});
		$("#type2").click(function(){
			$scope.user.password = ""
		});
	})();
  		
	var mark = false;
	$scope.login=function () {
//		console.log(mark,$scope.user.password);
		$scope.checkMobile();
		if(mark){return false};
		if ($scope.user.mobile&&$scope.user.password) { //会员登录
			var postData= {
				"username":$scope.user.mobile,
				"password":$scope.user.password,
				"source": bind ? 1 : 2 //1登录源--微信客户端登录	2登录源--手机客户端登录
			};
//           console.log(postData);return false;
			if (bind) {
				postData.isPart = 1;
				postData.part = JSON.stringify(bind);
			};
            /*
			ngMessage.showTip(postData);
			ngMessage.showTip(postData.part);
			return false;
			*/
			loginS.login(postData,function (data) {
				if (data.resCode=="SUCCESS") {
//					console.log(11111);
					data.mobile = $scope.user.mobile;
					storage.set("user", data);
					storage.set("token", data.token);
					storage.set("uid", data.uid);
//					console.log(data);return false;
					
					$scope.myVal = isInWeiXin()?false:true;
//					if (data.accountStatus == "1"){
//						storage.toPage("collection");	
//					}else 
					if(Referer) {
						if (/http.+personalCenter.html/.test(Referer)||/http.+login.html/.test(Referer)) {
							storage.toPage("personalCenter");
						};
						storage.toPage(Referer);
					}else {
						storage.toPage("personalCenter");
					}
										
				}else{
					ngMessage.showTip(data.resMsg)
				}
				
			})
			
		}else if ($scope.user.mobile&&$scope.user.code) { //短信验证码登录
//			console.log(短信验证码登录);
			var postData= {
				"mobile":$scope.user.mobile,
				"code":$scope.user.code,
				"source": 1,
			};
//           console.log(postData);return false;
			if (bind) {
				postData.isPart = 1;
				postData.part = JSON.stringify(bind);
			};
			
			loginS.mobileLogin(postData,function (data) {
				if (data.resCode=="NEW_NAME") { //返回是新用户
//					console.log(33333);return false;
					data.mobile = $scope.user.mobile;
					storage.set("user", data);
					storage.set("token", data.token);
					storage.set("uid", data.uid);
					$scope.myVal = isInWeiXin()?false:true;
//					if (data.accountStatus\n == "1"){
//						storage.toPage("collection");					
//					}else 
					if(Referer) {
						if (/http.+personalCenter.html/.test(Referer)||/http.+login.html/.test(Referer)) {
							storage.toPage("setPassword");
							return
						};
						storage.toPage(Referer);
					} else {
						storage.toPage("setPassword");
					}
				}else if (data.resCode=="SUCCESS") { //返回是 成功
//					console.log(22222);return false;
					data.mobile = $scope.user.mobile;
					storage.set("user", data);
					storage.set("token", data.token);
					storage.set("uid", data.uid);
					$scope.myVal = isInWeiXin()?false:true;
//					if (data.accountStatus == "1"){
//						storage.toPage("collection");					
//					}else 
					if(Referer) {
						if (/http.+login.html/.test(Referer)||/http.+login.html/.test(Referer)) {
							storage.toPage("personalCenter");
							return
						};
						storage.toPage(Referer);
					} else {
						storage.toPage("personalCenter");
					}
					ngMessage.showTip(data.resMsg)
				}else{
					ngMessage.showTip(data.resMsg)
				}
				
			})
			
		}else{
			ngMessage.showTip("请填写完整信息！")
		}
	}	
	
	$scope.checkMobile = function () {		
		if ($scope.user.mobile&&/^[1][34578][0-9]{9}$/.test($scope.user.mobile)){
			mark = false;}
		else{
			ngMessage.showTip("请输入有效的手机号码!");
			mark = true;
		}
	}
	
	$scope.code = function () {		//发送验证码
		if ($scope.user.mobile&&/^[1][34578][0-9]{9}$/.test($scope.user.mobile) && !$scope.user.sendSMS) {
			clock();
			loginS.regCode({
				type:"2",
				mobile:$scope.user.mobile
			},function (errMsg) {				
				ngMessage.showTip(errMsg);
				if (theClock) {
					$scope.$applyAsync();
					$interval.cancel(theClock);
					clockEnd();
				};	
						
			},function(){
				$scope.tips = true;
			})
		}else if ($scope.user.mobile&&/^[1][34578][0-9]{9}$/.test($scope.user.mobile) && $scope.user.sendSMS){
			ngMessage.showTip("验证码已发送!");
		}else{
			ngMessage.showTip("请输入有效的手机号码!");
		}
	}

})
.controller('registerC', function ($scope ,$interval,storage, registerS,ngMessage){
	storage.init(true);
	var referer = storage.get("referer");
	var bind = storage.get("bind");
	var token = storage.get("token");
//	if (token) {
//		storage.toPage("memcenter");
//		storage.set("token","");
//	};
	$scope.user={
		name:"",
		password:"",
		type:"1",
		code:"",
		sendSMS:false,
		text:"获取验证码",
		invite_code:''
	}
	var theClock=null;
	function clockEnd() {
		theClock = null;
		$scope.user.text = "获取验证码";
		$scope.user.sendSMS = false;
	};
	function clock (time) {
		$scope.user.text = "剩余59秒";
		$scope.user.sendSMS = true;
		var i = 59;
		theClock = $interval(function () {
			i--;
			$scope.user.text = "剩余"+i+"秒";
			if (i==0) {
				clockEnd();
			};
			
		},1000,59)
	}

	$scope.tips = false;
	$scope.init = false;
	setTimeout(function(){
		$scope.init = true;
	}, 2400);
	$scope.register = function() {
//		$scope.code();
		if (!$scope.init) {
			return false
		};
		if ($scope.user.name && $scope.user.code && $scope.user.password) {
			var postData = {
				"mobile": $scope.user.name,
				"password": $scope.user.password,
				//"type": $scope.user.type,
				"invite_code": $scope.user.code,
				"source":1,
				//"invite_code":$scope.user.invite_code,
			};
			console.log($scope.user.name+$scope.user.password+$scope.user.code)
			if (bind) {
				postData.isPart = 1;
				postData.part = JSON.stringify(bind);
			};
			registerS.register(postData, function(res) {
				if (res.resCode == "SUCCESS") {
					storage.set("token",res.token);
					storage.set("uid",res.uid);
					ngMessage.showTip("注册成功！ 自动登录中...", 1200, function () {
			           		storage.toPage("personalCenter");
					});
					
//					setTimeout(function() {
//						var onceReferer = storage.getOnce('oncereferer');
//						if(onceReferer){
//							location.href = onceReferer;
//						}else if(/login.html/.test(referer)) {
//							storage.toPage("hysjymy"); //用户中心
//						}
//						
//						else if (window.history.length > 1) {
//						window.history.go(-1); //退到上一页
//						} 
//                   
//						else {
//							storage.toPage("hysjymy"); //退到上一页
//						}
//					}, 1200);					


				} else {
					ngMessage.showTip(res.resMsg)
				}
			})
		}else{
			ngMessage.showTip("请将注册消息填写完整！")
		}

	};

	$scope.code = function () {		
		if ($scope.user.name&&/^[1][34578][0-9]{9}$/.test($scope.user.name) && !$scope.user.sendSMS) {
			clock();
			registerS.regCode({
				type:"1",
				mobile:$scope.user.name
			},function (errMsg) {				
				ngMessage.showTip(errMsg);
				if (theClock) {
					$scope.$applyAsync();
					$interval.cancel(theClock);
					clockEnd();
				};	
						
			},function(){
				$scope.tips = true;
			})
		}else if($scope.user.name&&/^[1][34578][0-9]{9}$/.test($scope.user.name) && $scope.user.sendSMS){
			ngMessage.showTip("验证码已发送!");
		}else{
			ngMessage.showTip("请输入有效的手机号码!");
		}
	}

})
.controller('accountBindC', function ($scope , storage,$interval, registerS,ngMessage){
	storage.init(true);
	var referer = storage.get("referer");
	var bind = storage.get("bind");
	var token = storage.get("token");
	$scope.user={
		name:"",
		password:"",
		type:"1",
		code:"",
		sendSMS:false,
		text:"获取验证码"
	}
	var theClock=null;
	function clockEnd() {
		theClock = null;
		$scope.user.text = "获取验证码";
		$scope.user.sendSMS = false;
	};
	function clock (time) {
		$scope.user.text = "剩余59秒";
		$scope.user.sendSMS = true;
		var i = 59;
		theClock = $interval(function () {
			i--;
			$scope.user.text = "剩余"+i+"秒";
			if (i==0) {
				clockEnd();
			};
			
		},1000,59)
	}

	$scope.tips = false;
	$scope.init = false;
	setTimeout(function(){
		$scope.init = true;
	}, 2400);
	$scope.register = function() {
		if (!$scope.init) {
			return false
		};
		if ($scope.user.name && $scope.user.code && $scope.user.password) {
			var postData = {
				"username": $scope.user.name,
				"password": $scope.user.password,
				"type": $scope.user.type,
				"code": $scope.user.code,
				"source":1,
				"token":token
			};
			if (bind) {
				postData.isPart = 1;
				postData.part = JSON.stringify(bind);
			};
			registerS.accountBind(postData, function(res) {
				if (res.resCode == "SUCCESS") {
					storage.set("token",res.token);
					storage.set("uid",res.uid);
					ngMessage.showTip("补充成功！");
					setTimeout(function() {
						if (/login.html/.test(referer)) {
							storage.toPage("memcenter"); //退到上一页
						} else if (window.history.length > 1) {
							window.history.go(-1); //退到上一页
						} else {
							storage.toPage("memcenter"); //退到上一页
						}
					}, 1200);					
				} else {
					ngMessage.showTip(res.resMsg)
				}
			})
		}else{
			ngMessage.showTip("请将补充消息填写完整！")
		}

	};

	$scope.code = function () {		
		if ($scope.user.name&&/^[1][34578][0-9]{9}$/.test($scope.user.name) && !$scope.user.sendSMS) {
			clock();
			registerS.regCode({
				type:"1",
				mobile:$scope.user.name
			},function (errMsg) {				
				ngMessage.showTip(errMsg);
				if (theClock) {
					$scope.$applyAsync();
					$interval.cancel(theClock);
					clockEnd();
				};	
						
			},function(){
				$scope.tips = true;
			})
		}else{
			ngMessage.showTip("请输入有效的手机号码!");
		}
	}

})
.controller('ucenterC', function ($scope,storage) {
	storage.init();
	var token = storage.get("token");
	$scope.secLevel = "低";
	
	$scope.toPage=function (page) {
		if (!token) {
			storage.toPage("login")
		}else{
			storage.toPage(page)
		}
	};
	//$scope.myVal = true;
    $scope.myVal = isInWeiXin()?false:true;
	$scope.logout =function () {
		storage.clear();
		storage.toPage("memcenter");
	};

})
.controller('userC', function ($scope,$filter,storage,userS,ngResizeImage,ngMessage) {
	storage.init();
	var token = storage.get("token");
	if(token){
		$scope.isLogin = true
	}else{
		$scope.isLogin = false
	}
//	if (!token) {
//		storage.toPage("login");
//	};
	var old={
		rname:"",
		aname:""
	}
	$scope.image = "";
	$scope.user={
		rname:"",
		aname:"",
		sex:{},
		list:[
			{"name":"男","value":1},
			{"name":"女","value":0}
		],
		image:""
	};
	$scope.num = "";
	//$scope.user.sex = $scope.user.list[0];

	$scope.anameEditing = false;
	$scope.anameEdit=function () {
		$scope.anameEditing = !$scope.anameEditing;
		if (!$scope.anameEditing) {

		};
	};

	$scope.rnameEditing = false;
	$scope.rnameEdit=function () {
		$scope.rnameEditing = !$scope.rnameEditing;
		if (!$scope.rnameEditing) {

		};
	};
	function user () {
		if (token) {
			userS.user({
				"token":token
			},function(res) {
				console.log(res);
				if (res.resCode=="SUCCESS") {
					$scope.user.mobile = res.mobile;
					$scope.user.mobile = $scope.user.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
					$scope.user.real_name = res.real_name;
					$scope.user.aname = res.aliasname;
					$scope.user.sex = res.sex;
					$scope.user.vip = res.vip;
					$scope.user.vipNum = res.vipNum;
					$scope.user.cardName = res.certificates.name;
					$scope.user.number = res.certificates.ce_number;
//					$scope.user.number = $scope.user.number.replace(/(\d{1})\d{16}(\d{1})/, '$1****************$2');
					$scope.user.number = $scope.user.number.replace(/^(.).+(.)$/g, '$1********$2')
					$scope.user.bir = res.user_birthday;
//					if(res.user_birthday==""){
//				    	console.log('no bir');
//						$scope.user.bir="";
//						$scope.num=1;
//					}else{
//						$scope.num=2;
//					}
                    $scope.today = new Date;
					$scope.date=new Date($scope.user.bir*1000);
					$scope.birthday = $filter("date")($scope.date, "yyyy-MM-dd");
					if($scope.birthday == "1970-01-01"){
						$scope.birthday = "";
					}
					console.log($scope.date)
//					if (!$scope.user.rname) {
//						$scope.user.rname = res.aliasname;
//					};
					$scope.user.headAttr = res.headAttr;
//					if (!$scope.user.image) {
//						$scope.user.image = res.headAttr;
//					};
				}else{
					ngMessage.showTip(res.resMsg,1200,function(){
						storage.clear();
						storage.toPage('login')
					});
				}
			})
		};
		
	}
	user();
	
	
	function formatDate(){  //转换成 (2016-12-12 11:11:11)
		var now = new Date();
	  	var y =now.getFullYear();     
	  	var m =now.getMonth()+1;     
	  	var d =now.getDate();     
	  	var h = now.getHours();
		var mm = now.getMinutes();
		var s = now.getSeconds();
	    return   y+"-"+m+"-"+d+" "+h+":"+mm+":"+s;     
	 };
	$scope.Now = formatDate().split(" ")[0];  // (2016-12-12) 格式
	console.log($scope.Now)
	$scope.changeSex = function(){
		userS.updateSex({
			"token":token,
			"sex":$scope.user.sex
		},function(res){
			if (res.resCode=="SUCCESS") {
				ngMessage.showTip('性别修改成功！');
				}else{
					ngMessage.showTip(res.resMsg);
				}
		});
	};
	
	$scope.changeBir =function () {
//			if($scope.date.valueOf() > $scope.today.valueOf()){
//				ngMessage.showTip('生日填写错误，请重新填写');
//				return false;
//			};
			userS.updateBirthday({
				"token":token,
				"birthday":$filter("date")($scope.date, "yyyy-MM-dd")
			},function (res) {
				if (!res) {
					ngMessage.showTip('网络错误，修改失败！');
					return false;
				};
				if (res.resCode=="SUCCESS") {
//					$scope.num = 2;
					ngMessage.showTip('生日修改成功！');
					window.location.reload();
				}else{
					ngMessage.showTip(res.resMsg);
				}
			})
	}
//	$scope.birblocked = function(){
//		var time=$filter("date")($scope.date, "yyyy-MM-dd");
//		console.log(time)
//		if(!(time=="Invalid Date")){
//			ngMessage.showTip('生日只能修改一次！');
//		}
//	}
	//查询是否有支付密码
	userS.PaymentPWD({"token":token},function(res){
		$scope.state = res.state*1;
	})
	//查询余额
	userS.availableIntegral({"token":token,"type":0},function(res){
		if(res.resCode == "SUCCESS"){
			$scope.balance = parseFloat(res.data.credits);
		}
	})
	//查询积分
	userS.availableIntegral({"token":token,"type":1},function(res){
		if(res.resCode == "SUCCESS"){
			$scope.integral = res.data.credits;
		}
	})
	$scope.toPage=function (page,key,value) {
		if (!token&&(page == "order")) {
			storage.toPage("order");
			return 
		}else if (!token&&(page == "home")) {
			storage.toPage("home");
			return 
		}else if(!token){
			storage.toPage("login");
			return 
		};
		if (key&&value) {
			storage.set(key,value);
		};
		storage.toPage(page);
//		if (!$scope.user.image) {
//			$scope.user.image = res.headAttr;
//		};
	};
	$scope.clear = function(){
		storage.clear();
		storage.toPage("personalCenter")
	};
	$scope.bindPayPassword = function(){
		if($scope.state){
			storage.toPage("bindPassword");
		}else{
			ngMessage.showTip("您未设置支付密码，暂不可用!")
		}
	}
	/*$scope.$watch('image', function(n, old, scope) {
		if (/base64/img.test(n)) {
			userS.updAvatar({
				"base":n,
				"ext":"jpeg",
				"token":token
			},function(res){
			})
		};
	});*/
})
.controller('balanceC', function ($scope,$filter,storage,userS,ngResizeImage,ngMessage) {
	storage.init();
	var token = storage.get("token");
	if (!token) {
		storage.toPage("login");
	};
	//查询余额
	userS.availableIntegral({"token":token,"type":0},function(res){
		$scope.balance = parseFloat(res.data.credits);
	})
	//查询会员卡号
	userS.getVipInfo({"token":token},function(res){
		$scope.card = res.data;
	})
	//查询余额明细
	var index = 1;
	var stopEnd = false;
	$scope.balanceDetail = [];
	$scope.load = function() {
		if(stopEnd){
			return false;
		};
		console.log(index);
		userS.getIntegral({
			"token":token,
			"credits_type":0,
			"page":index
		},function(res) {
			console.log(res)
			index++;
			if(res.next == "0"){
				stopEnd = true;
				$scope.isLastPage = true;
			}else{
				$scope.isLastPage = false;
			};
			var tmp = angular.copy($scope.balanceDetail);
			$scope.balanceDetail = tmp.concat(res.data);
		})
	};
	$scope.load();
	
	$(window).scroll(function(){  //滚轮
	 	if($(window).scrollTop() >= $(document).height() - $(window).height()){ //内容到达最底部
	 		$scope.bottom = true;
	 	}else{
	 		$scope.bottom = false;
	 	}
	});
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
})
.controller('integralC', function ($scope,$filter,storage,userS,ngResizeImage,ngMessage) {
	storage.init();
	var token = storage.get("token");
	if (!token) {
		storage.toPage("login");
	};
	//查询积分
	userS.availableIntegral({"token":token,"type":1},function(res){
		$scope.integral = res.data.credits;
	})
	//查询积分明细
	var index = 1;
	var stopEnd = false;
	$scope.integralDetail = [];
	$scope.load = function() {
		if(stopEnd){
			return;
		};
		console.log(index);
		userS.getIntegral({
			"token":token,
			"credits_type":1,
			"page":index
		},function(res) {
			console.log(res)
			index++;
			if(res.next == "0"){
				stopEnd = true;
				$scope.isLastPage = true;
			}else{
				$scope.isLastPage = false;
			};
			var tmp = angular.copy($scope.integralDetail);
			$scope.integralDetail = tmp.concat(res.data);
		})
	};
	$scope.load();
	
	$(window).scroll(function(){  //滚轮
	 	if($(window).scrollTop() >= $(document).height() - $(window).height()){ //内容到达最底部
	 		$scope.bottom = true;
	 	}else{
	 		$scope.bottom = false;
	 	}
	});
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
})
.controller("rechargeC",function ($scope,userS,storage,ngMessage,ngWechat) {	
	storage.init();
//	var ids = storage.get("cartId");
	var token = storage.get("token");
	var wx = storage.get("wx")//||{openid:"oo54huGZkeH8ECoVAB2IftXOS5EI"};
//	var Urltoken= storage.getUrlParam('token');
	var forReferer = storage.get("forReferer")||'';
	var index = 1;
	if (!token) {
		storage.toPage("login")
	};
	
	//查询余额
	userS.availableIntegral({"token":token,"type":0},function(res){
		$scope.balance = parseFloat(res.data.credits);
	})
	userS.user({"token":token},function(res) {
		$scope.user = res.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
	})
	$scope.layout = {
		"index": {
			"show": false ,
			"title": "充值",
			"history":true
		},
		"success": {
			"show": false,
			"title": "充值成功"
		},
		"fail": {
			"show": false,
			"title": "充值失败"
		},
	}

	$scope.page={
		title:"充值",
		currentLayout:"index",
		prevLayout:"",
		ppLayout:"",
//		submit:function() {
//			console.log('submit');
//		}
	}


	$scope.switchLayout = function(layout) {
		if ($scope.layout.hasOwnProperty(layout)) {
			for (var i in $scope.layout) {
				if ($scope.layout.hasOwnProperty(i)) {
					$scope.layout[i].show = false;
				}
			}

			$scope.layout[layout].show = true;
			$scope.page.title = $scope.layout[layout].title+"";
			$scope.page.showBackbtn = $scope.layout[layout].back;
			$scope.page.ppLayout = $scope.page.prevLayout ;
			$scope.page.prevLayout = $scope.page.currentLayout;
			$scope.page.currentLayout = layout;
			$scope.page.history = $scope.layout[layout].history;
		};
	};
	$scope.switchLayout("index");

	$scope.back = function() {
		var layout = $scope.page.currentLayout;
		if ($scope.layout[layout].history) {
			storage.toPage("balance");
		} else {
			if ($scope.page.ppLayout != "index") {
				$scope.switchLayout('index');
			} else {
				$scope.switchLayout($scope.page.prevLayout);
			}
		}
	}

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
	$scope.pay = function(){
		//ngMessage.showTip("我准备好了");
		
		var number = parseFloat($scope.number)||0;
		if (!number||number<=0) {
			ngMessage.showTip("无效金额！");
			return false
		};
		//ngMessage.showTip("我准备支付了");
        
		if (!wx||!wx.openid) {
			//ngMessage.showTip("请使用微信客户端进行充值！");
			setTimeout(function() {
				storage.set("wxReferers","recharge");
				storage.toPage("wxAuth");
			}, 1000);
			return
		};
		
//		ngMessage.showTip("我开始支付了");
//		ngMessage.showTip(wx.openid);
		userS.recharge({
			amount:number,
			openid:wx.openid,
			//openid:"o-dL1wOP3xPjG6WQDRW0FPszOcys",
			token:token
		},function(res){	
			if (res&&res.resCode=="SUCCESS") {
				console.log(res.data);
//			    ngMessage.showTip("支付进来了");
				ngWechat.pay(res.data, function(res) {
					if (res.success) {
						ngMessage.showTip("恭喜您，充值成功！",1200,function(){
//							$scope.switchLayout("success");
							if(forReferer == "checknext"){
								window.history.go(-1);
							}else{
								storage.toPage('personalCenter')
							}
						});
					}else{
						ngMessage.showTip("抱歉，充值失败！",1200,function(){
//							$scope.switchLayout("fail");
						});
					}
				})
			}else{
				ngMessage.showTip(res.resMsg, function(res) {
//					$scope.switchLayout("fail");      
				})
			}
		});
	}
	$scope.ok = function(){
		storage.toPage("recharge");
	}
	$scope.$watch('number', function(newValue, oldValue, scope) {
		
		if (oldValue!=newValue&&newValue) {
			if (/\d+\.$/.test(newValue)) {
				newValue = newValue+"";
			};
			newValue = newValue+"";
			//newValue = newValue.replace(/\./," ");
			newValue = newValue.replace(/\.+/,".");

			var t = newValue.match(/^\d{0,6}\.*(\d{1,2}|\d{0,1})/)[0]||" ";
			//var m = /(^\.)/;
			if (t&&t.length) {
				$scope.number = t;
			};
			for (var i=0; i<t.length; i++) {
				if (t[0] == '.') {
					//alert(111)
					return false;
				}
			}
			
		};		
		if (parseInt(newValue) && newValue[0] == 0) {
			 $scope.number = newValue.replace(/^0+/," ");
		};
	});
	
})
.controller('memCenterC', function ($scope,storage,userS,ngMessage) {
	$scope.isLogin = false;
	storage.init();
	var token = storage.get("token");
	var user = storage.get("user");
	if (token) {
		$scope.isLogin = true;
	} else {
		$scope.isLogin = false;
	};

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
	$scope.share =function () {
		//分享吉途旅游APP
		// wechat.share.qq(....)
	};
	$scope.login = function(){
		storage.set("referer","memcenter");			
			storage.toPage('login')
	}
	$scope.toCart = function () {		
		if (!$scope.isLogin) {
			$scope.set("referer","cart")			
			$scope.toPage('login')
		}else{
			$scope.toPage('cart')
		}
	}

	function userMethod () {
		if (token) {
			userS.i({
				"token":token
			},function(res) {
				if (res.resCode=="SUCCESS") {
					$scope.user.money = res.money;
					$scope.user.integral = res.integral;				
				}else{
					ngMessage.showTip(res.resMsg);
				}
			});

			userS.user({
				token:token
			},function (res) {
				console.log(res);
//				$scope.user = res;
				if (!$scope.user.real_name) {
					$scope.user.real_name = res.aliasname;
				};
				if (!$scope.user.image) {
					$scope.user.image = res.photo;
				};
			})
		};
		
	};
	userMethod();

	$scope.blocked = function(){
		ngMessage.showTip("即将开通，敬请期待！")
	}

})
.controller('bindPhoneC',function ($scope,$interval,storage,ngMessage,loginS){
	storage.init();
	var codeType = 3;//0:设置支付密码 1:注册 2:手机登陆 3:忘记密码
	$scope.phone={
		"mobile":"",
		"code":""
	};
	var token = storage.get("token");
	var referer = storage.get("referer");
	var user = storage.get("user");
//	var isBindNew = storage.queryField("bind");
	$scope.title = "找回密码";
	$scope.placeholder = "请输入手机号"
	if (/phoneChangeType.html/.test(referer)){
		$scope.title = "修改手机号";
		$scope.placeholder = "请输入原手机号";
		codeType = 4;
	}else if (/keywordsManagement.html/.test(referer)){
		$scope.title = "验证绑定手机";
		$scope.placeholder = "请输入手机号";
		codeType = 4;
	}else if (/checknext.html/.test(referer)){
		$scope.title = "验证绑定手机";
		$scope.placeholder = "请输入手机号";
		codeType = 4;
	};
	$scope.show =false;
	$scope.user={
		text: "获取验证码",
		sendSMS:false,
		active:''
	};
	var theClock=null;
	function clockEnd() {
		theClock = null;
		$scope.user.text = "获取验证码";
		$scope.user.sendSMS = false;
	};
	function clock (time) {
		$scope.user.text = "剩余59秒";
		$scope.user.sendSMS = true;
		// $scope.user.active = "active";
		var i = 59;

		theClock = $interval(function () {
			i--;
			$scope.user.text = "剩余"+i+"秒";
			$scope.$applyAsync();
			if (i==0) {
				clockEnd();
			};
			$scope.user.active = "active";			
		},1000,59)
	}


	//获取验证码
	$scope.getCodeForg = function() {
		$scope.show = true;
		if($scope.phone.mobile && /^[1][34578][0-9]{9}$/.test($scope.phone.mobile)){
				console.log(111)
			if (!$scope.user.sendSMS) {
				clock();
				console.log(codeType);
				loginS.regCode({
					type: codeType,
					mobile: $scope.phone.mobile
				}, function(errMsg) {
					ngMessage.showTip(errMsg);
					if (theClock) {
						$scope.$applyAsync();
						$interval.cancel(theClock);
						clockEnd();
					};
				});
			}else{
				ngMessage.showTip("验证码已发送!");
			};
		}else{
			ngMessage.showTip("请输入有效的手机号码!");
		}
	};
	//下一步（手机验证）
	$scope.bindSubmit=function () {
		if (!$scope.phone.mobile && !$scope.phone.code){
			ngMessage.showTip("所有输入框都必填！")
		}
		else if($scope.phone.mobile && !(/^[1][34578][0-9]{9}$/.test($scope.phone.mobile))){
			ngMessage.showTip("请输入有效的手机号码!");
		}
		else if(!$scope.phone.code){
			ngMessage.showTip("请输入短信验证码！")
		}else if ($scope.phone.mobile && $scope.phone.code) {
			loginS.verifyPhone({
				"mobile": $scope.phone.mobile,
				"code": $scope.phone.code,
			}, function(res) {
				if (res.resCode == "SUCCESS") {
					storage.set("token",res.token);
					if($scope.title == "找回密码"){
						storage.set("pwd","change");
						storage.toPage("changePassword");
					}else if($scope.title == "修改手机号"){
						storage.toPage("changePhone");
					}else if($scope.title == "验证绑定手机"){
						storage.toPage("setPayPassword");
					}
				} else {
					ngMessage.showTip(res.resMsg)
				}
			})
		}
	};
	//设置新手机号码（手机验证）
	$scope.setNewPhone=function () {
		if (!$scope.phone.mobile && !$scope.phone.code){
			ngMessage.showTip("所有输入框都必填！")
		}
		else if($scope.phone.mobile && !(/^[1][34578][0-9]{9}$/.test($scope.phone.mobile))){
			ngMessage.showTip("请输入有效的手机号码!");
		}
		else if(!$scope.phone.code){
			ngMessage.showTip("请输入短信验证码！")
		}else if ($scope.phone.mobile && $scope.phone.code) {
			loginS.updateMobile({
				"token":token,
				"mobile": user.mobile,
				"newmobile": $scope.phone.mobile,
				"code": $scope.phone.code,
			}, function(res) {
				if (res.resCode == "SUCCESS") {
					ngMessage.showTip(res.resMsg,1200,function(){
						storage.toPage("user");
					})
				} else {
					ngMessage.showTip(res.resMsg)
				}
			})
		}
	}

})
.controller('bindPasswordC',function ($scope,userS,storage,ngMessage){
	storage.init();
	var token = storage.get("token");
	//提交验证
	$scope.bindSubmit = function() {
		if (!$scope.password) {
			ngMessage.showTip("请输入支付密码！");
			return false
		}else if($scope.password.length < 6){
			ngMessage.showTip("请输入6位支付密码！");
			return false
		};
		var data={
			"token": token,
			"payment_pass": $scope.password
		};
		userS.verifyPaymentPWD(data, function(res) {
			if (res) {
				if (res.resCode == "SUCCESS") {
					ngMessage.showTip("支付密码验证成功！",1200,function(){
						storage.toPage("changePhone");
					});
				}else{
					ngMessage.showTip(res.resMsg);
				}				
			} else {
				ngMessage.showTip("网络问题,支付密码验证失败！")
			}
		})

	}
})
.controller('changePasswordC',function ($scope,userS,storage,ngMessage){
	storage.init();
	$scope.password={
		"old":"",
		"newa":"",
		"newb":""
	}
	$scope.show =false;
	$scope.hide=false;
	storage.get("pwd")=="change"&&($scope.hide=true);
	console.log($scope.hide);
	//提交验证
	$scope.submit = function() {
		if ($scope.password.newa != $scope.password.newb) {
			ngMessage.showTip("新密码不一致！");
			return false
		};
		if ((!$scope.password.old &&!$scope.hide)|| !$scope.password.newa || !$scope.password.newb) {

			ngMessage.showTip("所有密码框都必填！");
			return false
		};
		var data={
			"newPass": $scope.password.newa,
			"newRepass": $scope.password.newb,
			"token": storage.get("token")
		};
		if (!$scope.hide) {
			data["oldPass"] = $scope.password.old;
		};
		userS.updatePassword(data, function(res) {
			if (res) {
				if (res.resCode == "SUCCESS") {
//					if ($scope.hide){
						ngMessage.showTip("密码修改成功！",2000,function(){
							storage.del("pwd");
							storage.toPage("personalCenter");
							return
						});
//					}else{
//						ngMessage.showTip("密码修改成功！请重新登录！",2000,function(){
//							storage.clear();
//				            storage.toPage("login");
//							return	
//						});
//					}
				}else{
					ngMessage.showTip(res.resMsg);
				}				
			} else {
				ngMessage.showTip("网络问题,密码修改失败！")
			}
		})

	}
})
.controller('changeNameC',function ($scope,userS,storage,ngMessage){
	storage.init();
	var referer = storage.get("referer");
	console.log(referer)
	var token = storage.get("token");
	userS.user({"token":token},function(res) {
		if (res.resCode=="SUCCESS") {
			$scope.realName = res.real_name;
		}
	})
	$scope.submit = function() {
		var data={
			"token": token,
			"real_name":$scope.realName
		};
		if ($scope.realName&&!/^[\u4e00-\u9fa5]{2,5}$/gi.test($scope.realName)) {
				ngMessage.showTip("只能2~5个汉字！");
				return false
		};
		userS.updateRealname(data, function(res) {
			console.log(res)
			if (res) {
				if (res.resCode == "SUCCESS") {
					ngMessage.showTip("真实姓名设置成功！",1200,function(){
						if(referer){
							location.href = referer;
						}
			            storage.toPage("user");
						return	
					});
				}else if(res.resCode=="UNKNOWN_ERROR"){
					ngMessage.showTip("你还没有做修改!");
				}else{
					ngMessage.showTip(res.resMsg);
				}				
			} else {
				ngMessage.showTip("网络问题,真实姓名修改失败！")
			}
		})

	}
})
.controller('changeUsernameC',function ($scope,userS,storage,ngMessage){
	storage.init();
	var referer = storage.get("referer");
	console.log(referer)
	var token = storage.get("token");
	userS.user({"token":token},function(res) {
		if (res.resCode=="SUCCESS") {
			$scope.userName = res.aliasname;
		}
	})
	$scope.submit = function() {
		var data={
			"token": token,
			"nickname":$scope.userName
		};
		if ($scope.userName&&($scope.userName.length<2||$scope.userName.length>15)) {
				ngMessage.showTip("只能2~15个字符！");
				return false
			};
		userS.updateUsername(data, function(res) {
			if (res) {
				if (res.resCode == "SUCCESS") {
					ngMessage.showTip("昵称修改成功！",1200,function(){
						if(referer){
							location.href = referer;
						}
			            storage.toPage("user");
						return	
					});
				}else if(res.resCode=="DATA_MODIFICATIONS_FAIL"){
					ngMessage.showTip("你还没有做修改!");
				}else{
					ngMessage.showTip(res.resMsg);
				}				
			} else {
				ngMessage.showTip("网络问题,昵称设置失败！")
			}
		})

	}
})
.controller('setPasswordC',function ($scope,loginS,storage,ngMessage){
	storage.init();
	var referer = storage.get("referer");
	var bind = storage.get("bind");
	var token = storage.get("token");
	var uid = storage.get("uid");
	var user = storage.get("user");
	$scope.password={
		"newa":"",
		"newb":""
	};
	$scope.submit = function() {
		if ($scope.password.newa != $scope.password.newb) {
			ngMessage.showTip("新密码不一致！");
			return false
		};
		if (!$scope.password.newa || !$scope.password.newb) {
			ngMessage.showTip("所有密码框都必填！");
			return false
		};
		var data={
			"mobile":user.mobile,
			"pass": $scope.password.newa,
			"password": $scope.password.newb,
			"source": 1
		};
		loginS.setPassword(data, function(res) {
			if (res) {
				console.log(1111);
				if (res.resCode == "SUCCESS") {
					storage.set("pwd","change");
					storage.set("user", res);
					storage.set("token", res.token);
					storage.set("uid", res.uid);
					ngMessage.showTip("密码设置成功！自动登陆中……",3000,function(){
						if(referer){
							location.href = referer;
						}
			            storage.toPage("personalCenter");
						return	
					});
				}else{
					ngMessage.showTip(res.resMsg);
				}				
			} else {
				ngMessage.showTip("网络问题,密码修改失败！")
			}
		})

	}
})
.controller('setPayPasswordC',function ($scope,userS,storage,ngMessage){
	storage.init();
	var token = storage.get("token");
	var forReferer = storage.get("forReferer")||"";
	$scope.password={
		"newa":"",
		"newb":""
	}
	$scope.hide =false;
	$scope.next = function(){
		if($scope.password.newa.length == 6){
			$scope.hide =true;
			$scope.password.newb = ""
		}else{
			ngMessage.showTip("请输入6位数字密码！");
		} 
	};
	$scope.prev = function(){
		$scope.hide =false;
		$scope.password.newa = ""
	}
	//提交验证
	$scope.submit = function() {
		if ($scope.password.newa != $scope.password.newb) {
			ngMessage.showTip("新密码不一致！");
			return false
		};
		var data={
			"payment_pass": $scope.password.newa,
			"token": token
		};
		userS.setPatPassword(data, function(res) {
			if (res) {
				if (res.resCode == "SUCCESS") {
					if(forReferer){
						storage.toPage(forReferer);
					}
					ngMessage.showTip("设置支付密码成功！",1200,function(){
		            storage.toPage("keywordsManagement");
					return	
					});
				}else{
					ngMessage.showTip(res.resMsg);
				}				
			} else {
				ngMessage.showTip("网络问题,密码设置失败！")
			}
		})

	};
})
.controller('changePayPasswordC',function ($scope,userS,storage,ngMessage){
	storage.init();
	var token = storage.get("token");
	$scope.password={
		"old":"",
		"newa":"",
		"newb":""
	}
	$scope.step =1;
	$scope.toNew1 = function(){
		if($scope.password.old.length == 6){
			userS.verifyPaymentPWD({
				"token":token,
				"payment_pass":$scope.password.old
			},function(res){
				if (res.resCode == "SUCCESS") {
					$scope.step =2;
				}else{
					ngMessage.showTip("原支付密码输入错误！");
				}
			})
		}else{
			ngMessage.showTip("请输入6位原支付密码！");
		}
	};
	$scope.toNew2 = function(){
		if($scope.password.newa.length == 6){
			$scope.step =3;
		}else{
			ngMessage.showTip("请输入6位数字密码！");
		} 
	};
	$scope.backOld = function(){
		$scope.step =1;
		$scope.password.old = ""
	};
	$scope.backNew1 = function(){
		$scope.step =2;
		$scope.password.newa = ""
	};
	//提交验证
	$scope.submit = function() {
		if ($scope.password.newa != $scope.password.newb) {
			ngMessage.showTip("新密码不一致！");
			return false
		};
		var data={
			"payment_pass": $scope.password.newa,
			"token": token
		};
		userS.setPatPassword(data, function(res) {
			if (res) {
				if (res.resCode == "SUCCESS") {
					ngMessage.showTip("设置支付密码成功！",1200,function(){
		            storage.toPage("keywordsManagement");
					return	
					});
				}else{
					ngMessage.showTip(res.resMsg);
				}				
			} else {
				ngMessage.showTip("网络问题,密码设置失败！")
			}
		})

	}
})
.controller('certificatesC',function($scope,storage,userS,$rootScope,ngMessage){
	storage.init();
	var index = 1;
	var token = storage.get("token");
//	var user = storage.get("user");
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
	$scope.page={
		showBackbtn:true,
		currentLayout:"index",
		prevLayout:"",
		ppLayout:""
	}
	$scope.layout={
		"index":{
			"show":true,
			"title":"修改证件号",
			"back":true,
			"history":true
		},
		"add":{
			"show":false,
			"title":"添加证件号",
			"back":true
		},
		"edit":{
			"show":false,
			"title":"编辑证件号",
			"back":true
		}
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
	$scope.switchLayout("index");
	
	$scope.birthday = "";
//旅客信息
	$scope.editPassenger = { //修改旅客信息页
		"certificates":"",
//		"isDefault":0,
//		"list": [],
//		"default": {},
		"edit":function(){
			var data={
				"token":token,
				"ce_id":$scope.editPassenger.certificates.ce_id||'',
				"ce_type":$scope.editPassenger.certificates.ce_type,
//				"fk_pe_id":$scope.editPassenger.certificates.fk_pe_id||'',
				"ce_number":$scope.editPassenger.certificates.ce_number
//				"isDefault":$scope.editPassenger.isDefault?1:0
			};
			if(!data.ce_type){
				ngMessage.showTip("证件名必填！");
				return false;
			};
			if(!data.ce_number){
				ngMessage.showTip("证件号必填！");
				return false;
			};
			if(data.ce_type == 1){
				var Validator = new IDValidator();
				var i = Validator.isValid(data.ce_number);
				if(i){
					userS.ceUp(data,function(res) {
					console.log(res)
						if (res.resCode=="SUCCESS") {
							ngMessage.showTip(res.resMsg);
							$scope.switchLayout("index");
							$scope.getPassenger();
						}else if(res.resCode=="error"){
							ngMessage.showTip("你还没有做修改!");
						}else{
							res&&ngMessage.showTip(res.resMsg);
						}
					});
				}else{
					ngMessage.showTip("请输入正确的身份证号码！");
				}
			}else{
				userS.ceUp(data,function(res) {
					if (res.resCode=="SUCCESS") {
						ngMessage.showTip(res.resMsg);
						$scope.switchLayout("index");
						$scope.getPassenger();
					}else if(res.resCode=="error"){
						ngMessage.showTip("你还没有做修改!");
					}else{
						res&&ngMessage.showTip(res.resMsg);
					}
				});
			};
		},
//		"setDefault": function(v) {
//			passengerS.setDefault({
//				"addressId": v.id,
//				"token": tokena
//			}, function(res) {
//				if (res.resCode == "SUCCESS") {
//					v.isDefault = "1";
//					$scope.recAddress.get();
//				};
//			});
//		},
		"setPassenger":function (v) {	//修改时先复制信息	
//			console.log(v);
			$scope.editPassenger.certificates = v;
			console.log(v)
//			$scope.editPassenger.isDefault = parseInt(v.isDefault);
//			for (var i = 0; i < $scope.editPassenger.certificates.length; i++) {
//				if ($scope.editPassenger.provice[i].provice_id==v.provice) {
//					$scope.editPassenger.useProvice = $scope.editPassenger.provice[i];
//					break;
//				};
//			};
		}
	}
	//常用旅客列表
	$scope.getPassenger = function () {
		userS.certificates({"token":token},function(res) {
			if (res) {
				$scope.info = res.data||[];
				if($scope.info.length){
					$scope.noCertificates = false;
					console.log(res)
				}else{
					$scope.noCertificates = true;
					console.log("noPassengers")
				};
			}
		});
//			$scope.passenger.onChange()
	};
	$scope.getPassenger();
	//添加旅客
	$scope.addPassenger={
		"certificates":'',
//		"isDefault":0,
//		"onChange":function () {
//			var p = $scope.$watch("passenger.useProvice", function(n, o) {
//				$scope.passenger.useCity=null;
//				$scope.passenger.useCounty=null;
//				if (n) {
//					$scope.passenger.getCi(n.provice_id);
//				};
//
//			});
//			var ci = $scope.$watch("passenger.useCity", function(n, o) {
//				$scope.passenger.useCounty=null;
//				if (n) {
//					$scope.passenger.getCo(n.province_id,n.city_id)
//				};
//			});
//		},
		"add":function () {
			var data={
				"token":token,
//				"ce_id":$scope.addPassenger.certificates.id||'',
				"ce_type":$scope.addPassenger.certificates.type,
//				"fk_pe_id":$scope.addPassenger.certificates.fk_pe_id||'',
				"ce_number":$scope.addPassenger.certificates.number
//				"isDefault":$scope.addPassenger.isDefault?1:0
			};
			console.log(data);
			if(!data.ce_type){
				ngMessage.showTip("证件名必填！");
				return false;
			};
			if(!data.ce_number){
				ngMessage.showTip("证件号必填！");
				return false;
			};
			if(data.ce_type == 1){
				var Validator = new IDValidator();
				var i = Validator.isValid(data.ce_number);
				if(i){
					userS.ceUp(data,function(res) {
						if (res.resCode=="SUCCESS") {
							ngMessage.showTip(res.resMsg);
							$scope.switchLayout("index");
							$scope.getPassenger();
						}else if(res.resCode=="error"){
							ngMessage.showTip("已有相同的证件号!");
						}else{
							res&&ngMessage.showTip(res.resMsg);
						}
					});
				}else{
					ngMessage.showTip("请输入正确的身份证号码！");
				}
			}else{
				userS.ceUp(data,function(res) {
					if (res.resCode=="SUCCESS") {
						ngMessage.showTip(res.resMsg);
						$scope.switchLayout("index");
						$scope.getPassenger();
					}else if(res.resCode=="error"){
						ngMessage.showTip("已有相同的证件号!");
					}else{
						res&&ngMessage.showTip(res.resMsg);
					}
				});
			};
//			}
		},
		"clear":function () {
			$scope.addPassenger.certificates = null;
		},
//		"del":function () {
//			ngMessage.show("确定删除该收货地址？", function() {
//				passengerS.delRecAddress({
//					"addressId": $scope.recAddress.edit.id,
//					"token": token
//				}, function(res) {
//					res && ngMessage.showTip(res.resMsg);
//					$scope.recAddress.get();
//					$scope.switchLayout("index");
//				})
//			})
//		},
//		"setDefault":function () {  //设为默认旅客
//			if ($scope.recAddress.edit && $scope.recAddress.edit.id) {
//				passengerS.setDefault({
//					"addressId": $scope.recAddress.edit.id,
//					"token": token
//				}, function(res) {
//					if (res.resCode == "SUCCESS") {
//						$scope.recAddress.get();
//					};
//				});
//			};
//		}
	}
	console.log($scope.addPassenger.certificates);
	
	$scope.back=function () {
		var layout = $scope.page.currentLayout;
		if ($scope.layout[layout].history) {
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
.controller('passengerC',function($scope,storage,passengerS,ngMessage){
	storage.init();
	var index = 1;
	var token = storage.get("token");
	var mark = storage.get("mark"); //从订单提交过来的标识符
	
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
		storage.toPage(page);
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
			"title":"常用旅客",
			"back":true,
			"history":true
		},
		"add":{
			"show":false,
			"title":"添加常用旅客",
			"back":true,
			"subTitle":"编辑常用旅客"
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
	
	
	$scope.birthday = "";
	
	//常用旅客列表
	$scope.getPassenger = function () {
		passengerS.my_passenger({"token":token},function(res) {
			if (res) {
				$scope.info = res.data||[];
				if($scope.info.length){
					$scope.noPassengers = false;
					console.log(res)
				}else{
					$scope.noPassengers = true;
					console.log("noPassengers")
				};
			}
		});
//			$scope.passenger.onChange()
	};
	$scope.getPassenger();
	//删除旅客
	$scope.deletePassenger = function (v) {
		console.log(v)
		ngMessage.show("确定删除该旅客信息？", function() {
			passengerS.del_mp({
				"pe_id": v.pe_id,
				"token": token
			}, function(res) {
				res && ngMessage.showTip(res.resMsg);
				$scope.getPassenger();
				$scope.switchLayout("index");
				$(".management").text("管理")
			})
		})
	};
	$(".lineGroup .addsex input").click(function(){
		$(this).addClass("checked");
		$(this).siblings().removeClass("checked");
	})
	//添加旅客
	$scope.addPassenger={
		"id":"",
		"name":"",
		"sex":"",
		"birthday":"",
		"mobile":"",
//		"en":"",
		"certificates":{
			"id":'',
			"type":'',
			"number":''
		},
//		"isDefault":0,
//		"onChange":function () {
//			var p = $scope.$watch("passenger.useProvice", function(n, o) {
//				$scope.passenger.useCity=null;
//				$scope.passenger.useCounty=null;
//				if (n) {
//					$scope.passenger.getCi(n.provice_id);
//				};
//
//			});
//			var ci = $scope.$watch("passenger.useCity", function(n, o) {
//				$scope.passenger.useCounty=null;
//				if (n) {
//					$scope.passenger.getCo(n.province_id,n.city_id)
//				};
//			});
//		},
		"add":function () {
			if(!$scope.addPassenger.name){
				ngMessage.showTip("请填写姓名！");
				return false
			};
//			if (data.name&&!/^[\u4e00-\u9fa5]{2,5}$/gi.test(data.name)) {
//				ngMessage.showTip("收件人只能2~5个汉字！");
//				return false
//			};
			if ($scope.addPassenger.name&&$scope.addPassenger.name.length<2) {
				ngMessage.showTip("姓名至少为两个字符！");
				return false
			};
			if(!$scope.addPassenger.sex){
				ngMessage.showTip("请选择性别！");
				return false
			};
			if(!$scope.addPassenger.birthday){
				ngMessage.showTip("请选择出生日期！");
				return false
			};
			if (!$scope.addPassenger.mobile||!/^[1][35867][0-9]{9}$/.test($scope.addPassenger.mobile)) {
				ngMessage.showTip("请填写有效的手机号！");
				return false
			};
			if(!$scope.addPassenger.certificates.type){
				ngMessage.showTip("请选择证件类型！");
				return false
			};
			if(!$scope.addPassenger.certificates.number){
				ngMessage.showTip("请填写证件号！");
				return false
			};
			if($scope.addPassenger.certificates.type == 1){
				var Validator = new IDValidator();
				var i = Validator.isValid($scope.addPassenger.certificates.number);
				if(!i){
					ngMessage.showTip("请输入正确的身份证号码！");
					return false;
				}
			};
			var data={
				"token":token,
				"pe_id":$scope.addPassenger.id,
				"pe_name":$scope.addPassenger.name,
				"pe_sex":$scope.addPassenger.sex,
				"pe_birthday":$scope.addPassenger.birthday,
				"pe_mobile":$scope.addPassenger.mobile,
//				"pe_en":$scope.addPassenger.en,
				"certificates":JSON.stringify([{
					"ce_id":$scope.addPassenger.certificates.id||'',
					"ce_type":$scope.addPassenger.certificates.type,
					"ce_number":$scope.addPassenger.certificates.number
				}])
//				"certificates":JSON.stringify(Arr)
//				"isDefault":$scope.addPassenger.isDefault?1:0
			};

			console.log(data);
				passengerS.add_mp(data,function(res) {
					if (res.resCode=="SUCCESS") {
						ngMessage.showTip(res.resMsg);
						if(mark){
							storage.set("mark","false");
							window.history.go(-1);
						}else{
							$scope.switchLayout("index");
							$scope.getPassenger();
							$(".management").text("管理")
						}
					}else{
						res&&ngMessage.showTip(res.resMsg);
					}
				});
//			}
		},
		"clear":function () {
			$scope.addPassenger.id = "";
			$scope.addPassenger.name = "";
			$scope.addPassenger.sex = "";
			$scope.birthday = "";
			$scope.addPassenger.birthday = "";
			$scope.addPassenger.mobile = "";
			$scope.addPassenger.certificates = new Object;
			$scope.addPassenger.certificates.type = "1";
			$scope.addPassenger.certificates.number = "";
			$(".lineGroup .addsex").children().eq(0).removeClass("checked");
			$(".lineGroup .addsex").children().eq(1).removeClass("checked");
			console.log($scope.addPassenger.certificates);
		},
		"setPassenger":function (v) {	//修改时先复制信息	
			console.log(v);
			$scope.addPassenger.id = v.pe_id;
			$scope.addPassenger.name = v.pe_name;
			$scope.addPassenger.sex = v.pe_sex;
			$scope.birthday = v.pe_birthday; 
			$scope.addPassenger.birthday = v.pe_birthday;
			$scope.addPassenger.mobile = v.pe_mobile;
			$scope.addPassenger.certificates.type = v.certificates[0].ce_type;
			$scope.addPassenger.certificates.number = v.certificates[0].ce_number;
//			$scope.addPassenger.isDefault = parseInt(v.isDefault);
			if($scope.addPassenger.sex == 2){
				$(".lineGroup .addsex").children().eq(0).addClass("checked");
				$(".lineGroup .addsex").children().eq(1).removeClass("checked");
			}else if($scope.addPassenger.sex == 1){
				$(".lineGroup .addsex").children().eq(1).addClass("checked");
				$(".lineGroup .addsex").children().eq(0).removeClass("checked");
			}
		}
//		"setDefault":function () {  //设为默认旅客
//			if ($scope.recAddress.edit && $scope.recAddress.edit.id) {
//				passengerS.setDefault({
//					"addressId": $scope.recAddress.edit.id,
//					"token": token
//				}, function(res) {
//					if (res.resCode == "SUCCESS") {
//						$scope.recAddress.get();
//					};
//				});
//			};
//		}
	}
	
	if(mark){
		$scope.switchLayout("add");
		$scope.addPassenger.certificates.type = "1";//默认证件号为身份证
//		$scope.addPassenger.clear();
	}else{
		$scope.switchLayout("index");
	}
	
	$scope.back=function () {
		var layout = $scope.page.currentLayout;
		if ($scope.layout[layout].history||mark) {
			window.history.go(-1);
		}else{	
			if ($scope.page.ppLayout!="index") {
				$scope.switchLayout('index');
			}else{
				$scope.switchLayout($scope.page.prevLayout);
			}
			
		}		
	}
	
	
	
	
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//显示日期格式
$scope.timeC = new Date().Format('yyyy-MM-dd');
var timeY = $scope.timeC.slice(0,4);
var timeM = $scope.timeC.slice(5,7);
var timeD = $scope.timeC.slice(8,10);
var timeNew = timeY+'年'+timeM+'月'+timeD+'日';
$scope.timeY = timeY
$scope.timeM = timeM;
$scope.timeD = timeD;
$scope.timeNew = timeNew;
 
 
 
 //date plugin
 
 
 /*jslint eqeq: true, plusplus: true, undef: true, sloppy: true, vars: true, forin: true */
/*!
 * jQuery MobiScroll v2.5.1
 * http://mobiscroll.com
 *
 * Copyright 2010-2013, Acid Media
 * Licensed under the MIT license.
 *
 */
var startTimes = new Date();
(function ($) {
    function Scroller(elem, settings) {
        var m,
            hi,
            v,
            dw,
            ww, // Window width
            wh, // Window height
            rwh,
            mw, // Modal width
            mh, // Modal height
            anim,
            debounce,
            that = this,
            ms = $.mobiscroll,
            e = elem,
            elm = $(e),
            theme,
            lang,
            s = extend({}, defaults),
            pres = {},
            warr = [],
            iv = {},
            pixels = {},
            input = elm.is('input'),
            visible = false

        // Private functions

        function isReadOnly(wh) {
            if ($.isArray(s.readonly)) {
                var i = $('.dwwl', dw).index(wh);
                return s.readonly[i];
            }
            return s.readonly;
        }

        function generateWheelItems(i) {
            var html = '<div class="dw-bf">',
                l = 1,
                j;

            for (j in warr[i]) {
                if (l % 20 == 0) {
                    html += '</div><div class="dw-bf">';
                }
                html += '<div class="dw-li dw-v" data-val="' + j + '" style="height:' + hi + 'px;line-height:' + hi + 'px;"><div class="dw-i">' + warr[i][j] + '</div></div>';
                l++;
            }
            html += '</div>';
            return html;
        }

        function setGlobals(t) {
            min = $('.dw-li', t).index($('.dw-v', t).eq(0));
            max = $('.dw-li', t).index($('.dw-v', t).eq(-1));
            index = $('.dw-ul', dw).index(t);
            h = hi;
            inst = that;
        }

        function formatHeader(v) {
            var t = s.headerText;
            return t ? (typeof t === 'function' ? t.call(e, v) : t.replace(/\{value\}/i, v)) : '';
        }

        function read() {
            that.temp = ((input && that.val !== null && that.val != elm.val()) || that.values === null) ? s.parseValue(elm.val() || '', that) : that.values.slice(0);
            that.setValue(true);
        }

        function scrollToPos(time, index, manual, dir, orig) {
            
            // Call validation event
            if (event('validate', [dw, index, time]) !== false) {

                // Set scrollers to position
                $('.dw-ul', dw).each(function (i) {
                    var t = $(this),
                        cell = $('.dw-li[data-val="' + that.temp[i] + '"]', t),
                        cells = $('.dw-li', t),
                        v = cells.index(cell),
                        l = cells.length,
                        sc = i == index || index === undefined;
                    
                    // Scroll to a valid cell
                    if (!cell.hasClass('dw-v')) {
                        var cell1 = cell,
                            cell2 = cell,
                            dist1 = 0,
                            dist2 = 0;
                        
                        while (v - dist1 >= 0 && !cell1.hasClass('dw-v')) {
                            dist1++;
                            cell1 = cells.eq(v - dist1);
                        }

                        while (v + dist2 < l && !cell2.hasClass('dw-v')) {
                            dist2++;
                            cell2 = cells.eq(v + dist2);
                        }
                        
                        // If we have direction (+/- or mouse wheel), the distance does not count
                        if (((dist2 < dist1 && dist2 && dir !== 2) || !dist1 || (v - dist1 < 0) || dir == 1) && cell2.hasClass('dw-v')) {
                            cell = cell2;
                            v = v + dist2;
                        } else {
                            cell = cell1;
                            v = v - dist1;
                        }
                    }
                    
                    if (!(cell.hasClass('dw-sel')) || sc) {
                        // Set valid value
                        that.temp[i] = cell.attr('data-val');

                        // Add selected class to cell
                        $('.dw-sel', t).removeClass('dw-sel');
                        cell.addClass('dw-sel');

                        // Scroll to position
                        //that.scroll(t, i, v, time);
                        that.scroll(t, i, v, sc ? time : 0.1, sc ? orig : undefined);
                    }
                });
                
                // Reformat value if validation changed something
                that.change(manual);
            }
        
        }

        function position(check) {

            if (s.display == 'inline' || (ww === $(window).width() && rwh === $(window).height() && check)) {
                return;
            }
            
            var w,
                l,
                t,
                aw, // anchor width
                ah, // anchor height
                ap, // anchor position
                at, // anchor top
                al, // anchor left
                arr, // arrow
                arrw, // arrow width
                arrl, // arrow left
                scroll,
                totalw = 0,
                minw = 0,
                st = $(window).scrollTop(),
                wr = $('.dwwr', dw),
                d = $('.dw', dw),
                css = {},
                anchor = s.anchor === undefined ? elm : s.anchor;
            
            ww = $(window).width();

            rwh = $(window).height();
            wh = window.innerHeight; // on iOS we need innerHeight
            wh = wh || rwh;
            
            if (/modal|bubble/.test(s.display)) {
                $('.dwc', dw).each(function () {
                    w = $(this).outerWidth(true);
                    totalw += w;
                    minw = (w > minw) ? w : minw;
                });
                w = totalw > ww ? minw : totalw;
                wr.width(w);
            }
            
            mw = d.outerWidth();
            mh = d.outerHeight(true);
            
            if (s.display == 'modal') {
                l = (ww - mw) / 2;
                t = st + (wh - mh) / 2;
            } else if (s.display == 'bubble') {
                scroll = true;
                arr = $('.dw-arrw-i', dw);
                ap = anchor.offset();
                at = ap.top;
                al = ap.left;

                // horizontal positioning
                aw = anchor.outerWidth();
                ah = anchor.outerHeight();
                l = al - (d.outerWidth(true) - aw) / 2;
                l = l > (ww - mw) ? (ww - (mw + 20)) : l;
                l = l >= 0 ? l : 20;
                
                // vertical positioning
                t = at - mh; //(mh + 3); // above the input
                if ((t < st) || (at > st + wh)) { // if doesn't fit above or the input is out of the screen
                    d.removeClass('dw-bubble-top').addClass('dw-bubble-bottom');
                    t = at + ah;// + 3; // below the input
                } else {
                    d.removeClass('dw-bubble-bottom').addClass('dw-bubble-top');
                }

                //t = t >= st ? t : st;
                
                // Calculate Arrow position
                arrw = arr.outerWidth();
                arrl = al + aw / 2 - (l + (mw - arrw) / 2);

                // Limit Arrow position to [0, pocw.width] intervall
                $('.dw-arr', dw).css({ left: arrl > arrw ? arrw : arrl });
            } else {
                css.width = '100%';
                if (s.display == 'top') {
                    t = st;
                } else if (s.display == 'bottom') {
                    t = st + wh - mh;
                }
            }
            css.bottom = 0;
            css.left = 0;
            css.width = '100%';
             css.margin="0 auto";
            d.css(css);
            
            // If top + modal height > doc height, increase doc height
            $('.dw-persp', dw).height(0).height(t + mh > $(document).height() ? t + mh : $(document).height());
            $('.dwwr').css({'margin':"0 auto"})
            // Scroll needed
            if (scroll && ((t + mh > st + wh) || (at > st + wh))) {
                $(window).scrollTop(t + mh - wh);
            }
        }
        
        function testTouch(e) {
            if (e.type === 'touchstart') {
                touch = true;
                setTimeout(function () {
                    touch = false; // Reset if mouse event was not fired
                }, 500);
            } else if (touch) {
                touch = false;
                return false;
            }
            return true;
        }

        function event(name, args) {
            var ret;
            args.push(that);
            $.each([theme.defaults, pres, settings], function (i, v) {
                if (v[name]) { // Call preset event
                    ret = v[name].apply(e, args);
                }
            });
            return ret;
        }

        function plus(t) {
            var p = +t.data('pos'),
                val = p + 1;
            calc(t, val > max ? min : val, 1, true);
        }

        function minus(t) {
            var p = +t.data('pos'),
                val = p - 1;
            calc(t, val < min ? max : val, 2, true);
        }

        // Public functions

        /**
        * Enables the scroller and the associated input.
        */
        that.enable = function () {
            s.disabled = false;
            if (input) {
                elm.prop('disabled', false);
            }
        };

        /**
        * Disables the scroller and the associated input.
        */
        that.disable = function () {
            s.disabled = true;
            if (input) {
                elm.prop('disabled', true);
            }
        };

        /**
        * Scrolls target to the specified position
        * @param {Object} t - Target wheel jQuery object.
        * @param {Number} index - Index of the changed wheel.
        * @param {Number} val - Value.
        * @param {Number} time - Duration of the animation, optional.
        * @param {Number} orig - Original value.
        */
        that.scroll = function (t, index, val, time, orig) {
            
            function getVal(t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            }

            function ready() {
                clearInterval(iv[index]);
                delete iv[index];
                t.data('pos', val).closest('.dwwl').removeClass('dwa');
            }
            
            var px = (m - val) * hi,
                i;
            
            if (px == pixels[index] && iv[index]) {
                return;
            }
            
            if (time && px != pixels[index]) {
                // Trigger animation start event
                event('onAnimStart', [dw, index, time]);
            }
            
            pixels[index] = px;
            
            t.attr('style', (prefix + '-transition:all ' + (time ? time.toFixed(3) : 0) + 's ease-out;') + (has3d ? (prefix + '-transform:translate3d(0,' + px + 'px,0);') : ('top:' + px + 'px;')));
            
            if (iv[index]) {
                ready();
            }
            
            if (time && orig !== undefined) {
                i = 0;
                t.closest('.dwwl').addClass('dwa');
                iv[index] = setInterval(function () {
                    i += 0.1;
                    t.data('pos', Math.round(getVal(i, orig, val - orig, time)));
                    if (i >= time) {
                        ready();
                    }
                }, 100);
            } else {

                t.data('pos', val);
            }
        };
        
        /**
        * Gets the selected wheel values, formats it, and set the value of the scroller instance.
        * If input parameter is true, populates the associated input element.
        * @param {Boolean} sc - Scroll the wheel in position.
        * @param {Boolean} fill - Also set the value of the associated input element. Default is true.
        * @param {Number} time - Animation time
        * @param {Boolean} temp - If true, then only set the temporary value.(only scroll there but not set the value)
        */
        that.setValue = function (sc, fill, time, temp) {
            if (!$.isArray(that.temp)) {
                that.temp = s.parseValue(that.temp + '', that);
            }
            
            if (visible && sc) {
                scrollToPos(time);
            }
            
            v = s.formatResult(that.temp);
            
            if (!temp) {
                that.values = that.temp.slice(0);
                that.val = v;
            }

            if (fill) {
                if (input) {
                    elm.val(v).trigger('change');
                }
            }
        };
        
        that.getValues = function () {
            var ret = [],
                i;
            
            for (i in that._selectedValues) {
                ret.push(that._selectedValues[i]);
            }
            return ret;
        };

        /**
        * Checks if the current selected values are valid together.
        * In case of date presets it checks the number of days in a month.
        * @param {Number} time - Animation time
        * @param {Number} orig - Original value
        * @param {Number} i - Currently changed wheel index, -1 if initial validation.
        * @param {Number} dir - Scroll direction
        */
        that.validate = function (i, dir, time, orig) {
            scrollToPos(time, i, true, dir, orig);
        };

        /**
        *
        */
        that.change = function (manual) {
            v = s.formatResult(that.temp);
            if (s.display == 'inline') {
                that.setValue(false, manual);
            } else {
            	var year = formatHeader(v).slice(0,4);
            	var moth = formatHeader(v).slice(5,7);
            	var day = formatHeader(v).slice(8,10);
            	var newHeader = year+'年'+moth+'月'+day+'日';
                $('.dwv', dw).html(newHeader);
            }

            if (manual) {
                event('onChange', [v]);
            }
        };

        /**
        * Changes the values of a wheel, and scrolls to the correct position
        */
        that.changeWheel = function (idx, time) {
            if (dw) {
                var i = 0,
                    j,
                    k,
                    nr = idx.length;

                for (j in s.wheels) {
                    for (k in s.wheels[j]) {
                        if ($.inArray(i, idx) > -1) {
                            warr[i] = s.wheels[j][k];
                            $('.dw-ul', dw).eq(i).html(generateWheelItems(i));
                            nr--;
                            if (!nr) {
                                position();
                                scrollToPos(time, undefined, true);
                                return;
                            }
                        }
                        i++;
                    }
                }
            }
        };
        
        /**
        * Return true if the scroller is currently visible.
        */
        that.isVisible = function () {
            return visible;
        };
        
        /**
        *
        */
        that.tap = function (el, handler) {
            var startX,
                startY;
            
            if (s.tap) {
                el.bind('touchstart', function (e) {
                    e.preventDefault();
                    startX = getCoord(e, 'X');
                    startY = getCoord(e, 'Y');
                }).bind('touchend', function (e) {
                    // If movement is less than 20px, fire the click event handler
                    if (Math.abs(getCoord(e, 'X') - startX) < 20 && Math.abs(getCoord(e, 'Y') - startY) < 20) {
                        handler.call(this, e);
                    }
                    tap = true;
                    setTimeout(function () {
                        tap = false;
                    }, 300);
                });
            }
            
            el.bind('click', function (e) {
                if (!tap) {
                    // If handler was not called on touchend, call it on click;
                    handler.call(this, e);
                }
            });
            
        };
        
        /**
        * Shows the scroller instance.
        * @param {Boolean} prevAnim - Prevent animation if true
        */
        that.show = function (prevAnim) {
            if (s.disabled || visible) {
                return false;
            }

            if (s.display == 'top') {
                anim = 'slidedown';
            }

            if (s.display == 'bottom') {
                anim = 'slideup';
            }

            // Parse value from input
            read();

            event('onBeforeShow', [dw]);

            // Create wheels
            var l = 0,
                i,
                label,
                mAnim = '';

            if (anim && !prevAnim) {
                mAnim = 'dw-' + anim + ' dw-in';
            }
            // Create wheels containers
//          var html = '<div class="dw-trans ' + s.theme + ' dw-' + s.display + '">' + (s.display == 'inline' ? '<div class="dw dwbg dwi"><div class="dwwr">' : '<div class="dw-persp">' + '<div class="dwo"></div><div class="dw dwbg ' + mAnim + '"><div class="dw-arrw"><div class="dw-arrw-i"><div class="dw-arr"></div></div></div><div class="dwwr">' + (s.headerText ? '<div class="dwv"></div>' : ''));   //默认
            var html = '<div class="dw-trans ' + s.theme + ' dw-' + s.display + '">' + (s.display == 'inline' ? '<div class="dw dwbg dwi"><div class="dwwr">' : '<div class="dw-persp">' + '<div class="dwo"></div><div class="dw dwbg ' + mAnim + '"><div class="dw-arrw"><div class="dw-arrw-i"><div class="dw-arr"></div></div></div><div class="dwwr">');
            
            for (i = 0; i < s.wheels.length; i++) {
//          	   html += (s.display != 'inline' ? '<div class="dwbc' + (s.button3 ? ' dwbc-p' : '') + '"><span class="dwbw dwb-s"><span class="dwb">' + s.setText + '</span></span>' + (s.button3 ? '<span class="dwbw dwb-n"><span class="dwb">' + s.button3Text + '</span></span>' : '') + '<span class="dwbw dwb-c"><span class="dwb">' + s.cancelText + '</span></span></div>' : '<div class="dwcc"></div>') + '';
								 html += (s.display != 'inline' ? '<span class="dwbw dwb-c"><span class="dwb">' + s.cancelText + '</span></span>' + (s.button3 ? '<span class="dwbw dwb-n"><span class="dwb"></span></span><span class="dwbw dwb-s"><span class="dwb">' + s.setText + '</span></span></div>' : '') : '<div class="dwcc"></div>');
                 html += '<div class="dwc' + (s.mode != 'scroller' ? ' dwpm' : ' dwsc') + (s.showLabel ? '' : ' dwhl') + '"><div class="dwwc dwrc"><table cellpadding="0" cellspacing="0"><tr>';
                // Create wheels
                
                for (label in s.wheels[i]) {
                    warr[l] = s.wheels[i][label];
                    
                    // Create wheel values
//						       if(l<2){  //自定义只调取年-月, 如显示完整年-月-日,去掉if判断
						       	 html += '<td><div class="dwwl dwrc dwwl' + l + '">' + (s.mode != 'scroller' ? '<div class="dwwb dwwbp" style="height:' + hi + 'px;line-height:' + hi + 'px;"><span>+</span></div><div class="dwwb dwwbm" style="height:' + hi + 'px;line-height:' + hi + 'px;"><span>&ndash;</span></div>' : '') +'<div class="dww" style="height:' + (s.rows * hi) + 'px;min-width:' + s.width + 'px;"><div class="dw-ul">';
						       	 html += generateWheelItems(l);
                     html += '</div><div class="dwwo"></div></div><div class="dwwol"></div></div></td>';
//						       }
                    l++;
                }
                html += '</tr></table></div></div>';
            }
            
            dw = $(html);

            scrollToPos();
            
            event('onMarkupReady', [dw]);

            // Show
            if (s.display != 'inline') {
                dw.appendTo('body');
                // Remove animation class
                setTimeout(function () {
                    dw.removeClass('dw-trans').find('.dw').removeClass(mAnim);
                }, 350);
            } else if (elm.is('div')) {
                elm.html(dw);
            } else {
                dw.insertAfter(elm);
            }
            
            event('onMarkupInserted', [dw]);
            
            visible = true;
            
            // Theme init
            theme.init(dw, that);
            
            if (s.display != 'inline') {
                // Init buttons
                that.tap($('.dwb-s span', dw), function () {
                    if (that.hide(false, 'set') !== false) {
                        that.setValue(false, false);
                        event('onSelect', [that.val]);
                        var year = that.val.slice(0,4);
						var moth = that.val.slice(5,7);
						var day = that.val.slice(8,10);
					 	$scope.timeY = year;                                //$scope  年月日
					  	$scope.timeM = moth;
					  	$scope.timeD = day;
					  	$scope.birthday = $scope.timeY+'-'+$scope.timeM+'-'+$scope.timeD;  //显示格式
					  	$scope.addPassenger.birthday = $scope.birthday;
//					  	$scope.editPassenger.birthday = $scope.birthday;
                        startTimes = that.val;
                        var timeArr = startTimes.split("-");
                        var year = parseInt(timeArr[0]);
		              var month = parseInt(timeArr[1],10)
		              
		              if(month==12){
		              	 month = '01';
		              	 year = year+1;
		              }else{
		              	 month= '0'+(parseInt(month)+1)
		              }
                        $scope.$applyAsync();		
                    }
                });
                that.tap($('.dwb-c span', dw), function () {
                    that.cancel();
                });

                if (s.button3) {
                    that.tap($('.dwb-n span', dw), s.button3);
                }

                // prevent scrolling if not specified otherwise
                if (s.scrollLock) {
                    dw.bind('touchmove', function (e) {
                        if (mh <= wh && mw <= ww) {
                            e.preventDefault();
                        }
                    });
                }

                // Disable inputs to prevent bleed through (Android bug)
                $('input,select,button').each(function () {
                    if (!$(this).prop('disabled')) {
                        $(this).addClass('dwtd').prop('disabled', true);
                    }
                });
                
                // Set position
                position();
                $(window).bind('resize.dw', function () {
                    // Sometimes scrollTop is not correctly set, so we wait a little
                    clearTimeout(debounce);
                    debounce = setTimeout(function () {
                        position(true);
                    }, 100);
                });
            }

            // Events
            dw.delegate('.dwwl', 'DOMMouseScroll mousewheel', function (e) {
                if (!isReadOnly(this)) {
                    e.preventDefault();
                    e = e.originalEvent;
                    var delta = e.wheelDelta ? (e.wheelDelta / 120) : (e.detail ? (-e.detail / 3) : 0),
                        t = $('.dw-ul', this),
                        p = +t.data('pos'),
                        val = Math.round(p - delta);
                    setGlobals(t);
                    calc(t, val, delta < 0 ? 1 : 2);
                }
            }).delegate('.dwb, .dwwb', START_EVENT, function (e) {
                // Active button
                $(this).addClass('dwb-a');
            }).delegate('.dwwb', START_EVENT, function (e) {
                e.stopPropagation();
                e.preventDefault();
                var w = $(this).closest('.dwwl');
                if (testTouch(e) && !isReadOnly(w) && !w.hasClass('dwa')) {
                    click = true;
                    // + Button
                    var t = w.find('.dw-ul'),
                        func = $(this).hasClass('dwwbp') ? plus : minus;
                    
                    setGlobals(t);
                    clearInterval(timer);
                    timer = setInterval(function () { func(t); }, s.delay);
                    func(t);
                }
            }).delegate('.dwwl', START_EVENT, function (e) {
                // Prevent scroll
                e.preventDefault();
                // Scroll start
                if (testTouch(e) && !move && !isReadOnly(this) && !click) {
                    move = true;
                    $(document).bind(MOVE_EVENT, onMove);
                    target = $('.dw-ul', this);
                    scrollable = s.mode != 'clickpick';
                    pos = +target.data('pos');
                    setGlobals(target);
                    moved = iv[index] !== undefined; // Don't allow tap, if still moving
                    start = getCoord(e, 'Y');
                    startTime = new Date();
                    stop = start;
                    that.scroll(target, index, pos, 0.001);
                    if (scrollable) {
                        target.closest('.dwwl').addClass('dwa');
                    }
                }
            });

            event('onShow', [dw, v]);
        };
        
        /**
        * Hides the scroller instance.
        */
        that.hide = function (prevAnim, btn) {
            // If onClose handler returns false, prevent hide
            if (!visible || event('onClose', [v, btn]) === false) {
                return false;
            }

            // Re-enable temporary disabled fields
            $('.dwtd').prop('disabled', false).removeClass('dwtd');
            elm.blur();

            // Hide wheels and overlay
            if (dw) {
                if (s.display != 'inline' && anim && !prevAnim) {
                    dw.addClass('dw-trans').find('.dw').addClass('dw-' + anim + ' dw-out');
                    setTimeout(function () {
                        dw.remove();
                        dw = null;
                    }, 350);
                } else {
                    dw.remove();
                    dw = null;
                }
                visible = false;
                pixels = {};
                // Stop positioning on window resize
                $(window).unbind('.dw');
            }
        };

        /**
        * Cancel and hide the scroller instance.
        */
        that.cancel = function () {
            if (that.hide(false, 'cancel') !== false) {
                event('onCancel', [that.val]);
            }
        };

        /**
        * Scroller initialization.
        */
        that.init = function (ss) {
            // Get theme defaults
            theme = extend({ defaults: {}, init: empty }, ms.themes[ss.theme || s.theme]);

            // Get language defaults
            lang = ms.i18n[ss.lang || s.lang];

            extend(settings, ss); // Update original user settings
            extend(s, theme.defaults, lang, settings);

            that.settings = s;

            // Unbind all events (if re-init)
            elm.unbind('.dw');

            var preset = ms.presets[s.preset];

            if (preset) {
                pres = preset.call(e, that);
                extend(s, pres, settings); // Load preset settings
                extend(methods, pres.methods); // Extend core methods
            }

            // Set private members
            m = Math.floor(s.rows / 2);
            hi = s.height;
            anim = s.animate;

            if (elm.data('dwro') !== undefined) {
                e.readOnly = bool(elm.data('dwro'));
            }

            if (visible) {
                that.hide();
            }

            if (s.display == 'inline') {
                that.show();
            } else {
                read();
                if (input && s.showOnFocus) {
                    // Set element readonly, save original state
                    elm.data('dwro', e.readOnly);
                    e.readOnly = true;
                    // Init show datewheel
                    elm.bind('focus.dw', function () { that.show(); });
                }
            }
        };
        
        that.trigger = function (name, params) {
            return event(name, params);
        };
        
        that.values = null;
        that.val = null;
        that.temp = null;
        that._selectedValues = {}; // [];

        that.init(settings);
    }

    function testProps(props) {
        var i;
        for (i in props) {
            if (mod[props[i]] !== undefined) {
                return true;
            }
        }
        return false;
    }

    function testPrefix() {
        var prefixes = ['Webkit', 'Moz', 'O', 'ms'],
            p;

        for (p in prefixes) {
            if (testProps([prefixes[p] + 'Transform'])) {
                return '-' + prefixes[p].toLowerCase();
            }
        }
        return '';
    }

    function getInst(e) {
        return scrollers[e.id];
    }
    
    function getCoord(e, c) {
        var org = e.originalEvent,
            ct = e.changedTouches;
        return ct || (org && org.changedTouches) ? (org ? org.changedTouches[0]['page' + c] : ct[0]['page' + c]) : e['page' + c];

    }

    function bool(v) {
        return (v === true || v == 'true');
    }

    function constrain(val, min, max) {
        val = val > max ? max : val;
        val = val < min ? min : val;
        return val;
    }
    
    function calc(t, val, dir, anim, orig) {
        val = constrain(val, min, max);

        var cell = $('.dw-li', t).eq(val),
            o = orig === undefined ? val : orig,
            idx = index,
            time = anim ? (val == o ? 0.1 : Math.abs((val - o) * 0.1)) : 0;

        // Set selected scroller value
        inst.temp[idx] = cell.attr('data-val');
        
        inst.scroll(t, idx, val, time, orig);
        
        setTimeout(function () {
            // Validate
            inst.validate(idx, dir, time, orig);
        }, 10);
    }

    function init(that, method, args) {
        if (methods[method]) {
            return methods[method].apply(that, Array.prototype.slice.call(args, 1));
        }
        if (typeof method === 'object') {
            return methods.init.call(that, method);
        }
        return that;
    }

    var scrollers = {},
        timer,
        empty = function () { },
        h,
        min,
        max,
        inst, // Current instance
        date = new Date(),
        uuid = date.getTime(),
        move,
        click,
        target,
        index,
        start,
        stop,
        startTime,
        pos,
        moved,
        scrollable,
        mod = document.createElement('modernizr').style,
        has3d = testProps(['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']),
        prefix = testPrefix(),
        extend = $.extend,
        tap,
        touch,
        START_EVENT = 'touchstart mousedown',
        MOVE_EVENT = 'touchmove mousemove',
        END_EVENT = 'touchend mouseup',
        onMove = function (e) {
            if (scrollable) {
                e.preventDefault();
                stop = getCoord(e, 'Y');
                inst.scroll(target, index, constrain(pos + (start - stop) / h, min - 1, max + 1));
            }
            moved = true;
        },
        defaults = {
            // Options
            width: 70,
            height: 40,
            rows: 3,
            delay: 300,
            disabled: false,
            readonly: false,
            showOnFocus: true,
            showLabel: true,
            wheels: [],
            theme: '',
            headerText: '{value}',
            display: 'modal',
            mode: 'scroller',
            preset: '',
            lang: 'en-US',
            setText: 'Set',
            cancelText: 'Cancel',
            scrollLock: true,
            tap: true,
            formatResult: function (d) {
                return d.join(' ');
            },
            parseValue: function (value, inst) {
                var w = inst.settings.wheels,
                    val = value.split(' '),
                    ret = [],
                    j = 0,
                    i,
                    l,
                    v;

                for (i = 0; i < w.length; i++) {
                    for (l in w[i]) {
                        if (w[i][l][val[j]] !== undefined) {
                            ret.push(val[j]);
                        } else {
                            for (v in w[i][l]) { // Select first value from wheel
                                ret.push(v);
                                break;
                            }
                        }
                        j++;
                    }
                }
                return ret;
            }
        },

        methods = {
            init: function (options) {
                if (options === undefined) {
                    options = {};
                }

                return this.each(function () {
                    if (!this.id) {
                        uuid += 1;
                        this.id = 'scoller' + uuid;
                    }
                    scrollers[this.id] = new Scroller(this, options);
                });
            },
            enable: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.enable();
                    }
                });
            },
            disable: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.disable();
                    }
                });
            },
            isDisabled: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.settings.disabled;
                }
            },
            isVisible: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.isVisible();
                }
            },
            option: function (option, value) {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        var obj = {};
                        if (typeof option === 'object') {
                            obj = option;
                        } else {
                            obj[option] = value;
                        }
                        inst.init(obj);
                    }
                });
            },
            setValue: function (d, fill, time, temp) {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.temp = d;
                        inst.setValue(true, fill, time, temp);
                    }
                });
            },
            getInst: function () {
                return getInst(this[0]);
            },
            getValue: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.values;
                }
            },
            getValues: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.getValues();
                }
            },
            show: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.show();
                }
            },
            hide: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.hide();
                    }
                });
            },
            destroy: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.hide();
                        $(this).unbind('.dw');
                        delete scrollers[this.id];
                        if ($(this).is('input')) {
                            this.readOnly = bool($(this).data('dwro'));
                        }
                    }
                });
            }
        };

    $(document).bind(END_EVENT, function (e) {
        if (move) {
            var time = new Date() - startTime,
                val = constrain(pos + (start - stop) / h, min - 1, max + 1),
                speed,
                dist,
                tindex,
                ttop = target.offset().top;
        
            if (time < 300) {
                speed = (stop - start) / time;
                dist = (speed * speed) / (2 * 0.0006);
                if (stop - start < 0) {
                    dist = -dist;
                }
            } else {
                dist = stop - start;
            }
            
            tindex = Math.round(pos - dist / h);
            
            if (!dist && !moved) { // this is a "tap"
                var idx = Math.floor((stop - ttop) / h),
                    li = $('.dw-li', target).eq(idx),
                    hl = scrollable;
                
                if (inst.trigger('onValueTap', [li]) !== false) {
                    tindex = idx;
                } else {
                    hl = true;
                }
                
                if (hl) {
                    li.addClass('dw-hl'); // Highlight
                    setTimeout(function () {
                        li.removeClass('dw-hl');
                    }, 200);
                }
            }
            
            if (scrollable) {
                calc(target, tindex, 0, true, Math.round(val));
            }
            
            move = false;
            target = null;
        
            $(document).unbind(MOVE_EVENT, onMove);
        }

        if (click) {
            clearInterval(timer);
            click = false;
        }
    
        $('.dwb-a').removeClass('dwb-a');
                
    }).bind('mouseover mouseup mousedown click', function (e) { // Prevent standard behaviour on body click
        if (tap) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    });

    $.fn.mobiscroll = function (method) {
        extend(this, $.mobiscroll.shorts);
        return init(this, method, arguments);
    };

    $.mobiscroll = $.mobiscroll || {
        /**
        * Set settings for all instances.
        * @param {Object} o - New default settings.
        */
        setDefaults: function (o) {
            extend(defaults, o);
        },
        presetShort: function (name) {
            this.shorts[name] = function (method) {
                return init(this, extend(method, { preset: name }), arguments);
            };
        },
        shorts: {},
        presets: {},
        themes: {},
        i18n: {}
    };

    $.scroller = $.scroller || $.mobiscroll;
    $.fn.scroller = $.fn.scroller || $.fn.mobiscroll;
	$.mobiscroll.i18n.zh = $.extend($.mobiscroll.i18n.zh, {
			dateFormat: 'yyyy-mm-dd',
			dateOrder: 'yymmdd',
			dayNames: ['周日', '周一;', '周二;', '周三', '周四', '周五', '周六'],
			dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
			dayText: '日',
			hourText: '时',
			minuteText: '分',
			monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
			monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
			monthText: '月',
			secText: '秒',
			timeFormat: 'HH:ii',
			timeWheels: 'HHii',
			yearText: '年'
		});
		$.mobiscroll.i18n.zh = $.extend($.mobiscroll.i18n.zh, {
			setText: '确定',
			cancelText: '取消'
		});
		var theme = {
			defaults: {
				dateOrder: 'Mddyy',
				mode: 'mixed',
				rows: 5,
				width: 70,
				height: 36,
				showLabel: true,
				useShortLabels: true
			}
		}
	
		$.mobiscroll.themes['android-ics'] = theme;
		$.mobiscroll.themes['android-ics light'] = theme;
})(jQuery);

 
 /*jslint eqeq: true, plusplus: true, undef: true, sloppy: true, vars: true, forin: true */
(function ($) {

    var ms = $.mobiscroll,
        date = new Date(),
        defaults = {
            dateFormat: 'mm/dd/yy',
            dateOrder: 'mmddy',
            timeWheels: 'hhiiA',
            timeFormat: 'hh:ii A',
            startYear: date.getFullYear() - 100,
            endYear: date.getFullYear() + 1,
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            shortYearCutoff: '+10',
            monthText: 'Month',
            dayText: 'Day',
            yearText: 'Year',
            hourText: 'Hours',
            minuteText: 'Minutes',
            secText: 'Seconds',
            ampmText: '&nbsp;',
            nowText: 'Now',
            showNow: false,
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1,
            separator: ' '
        },
        preset = function (inst) {
            var that = $(this),
                html5def = {},
                format;
            // Force format for html5 date inputs (experimental)
            if (that.is('input')) {
                switch (that.attr('type')) {
                case 'date':
                    format = 'yy-mm-dd';
                    break;
                case 'datetime':
                    format = 'yy-mm-ddTHH:ii:ssZ';
                    break;
                case 'datetime-local':
                    format = 'yy-mm-ddTHH:ii:ss';
                    break;
                case 'month':
                    format = 'yy-mm';
                    html5def.dateOrder = 'mmyy';
                    break;
                case 'time':
                    format = 'HH:ii:ss';
                    break;
                }
                // Check for min/max attributes
                var min = that.attr('min'),
                    max = that.attr('max');
                if (min) {
                    html5def.minDate = ms.parseDate(format, min);
                }
                if (max) {
                    html5def.maxDate = ms.parseDate(format, max);
                }
            }

            // Set year-month-day order
            var s = $.extend({}, defaults, html5def, inst.settings),
                offset = 0,
                wheels = [],
                ord = [],
                o = {},
                i,
                k,
                f = { y: 'getFullYear', m: 'getMonth', d: 'getDate', h: getHour, i: getMinute, s: getSecond, a: getAmPm },
                p = s.preset,
                dord = s.dateOrder,
                tord = s.timeWheels,
                regen = dord.match(/D/),
                ampm = tord.match(/a/i),
                hampm = tord.match(/h/),
                hformat = p == 'datetime' ? s.dateFormat + s.separator + s.timeFormat : p == 'time' ? s.timeFormat : s.dateFormat,
                defd = new Date(),
                stepH = s.stepHour,
                stepM = s.stepMinute,
                stepS = s.stepSecond,
                mind = s.minDate || new Date(s.startYear, 0, 1),
                maxd = s.maxDate || new Date(s.endYear, 11, 31, 23, 59, 59);
                
            inst.settings = s;

            format = format || hformat;
                
            if (p.match(/date/i)) {

                // Determine the order of year, month, day wheels
                $.each(['y', 'm', 'd'], function (j, v) {
                    i = dord.search(new RegExp(v, 'i'));
                    if (i > -1) {
                        ord.push({ o: i, v: v });
                    }
                });
                ord.sort(function (a, b) { return a.o > b.o ? 1 : -1; });
                $.each(ord, function (i, v) {
                    o[v.v] = i;
                });

                var w = {};
                for (k = 0; k < 3; k++) {
                    if (k == o.y) {
                        offset++;
                        w[s.yearText] = {};
                        var start = mind.getFullYear(),
                            end = maxd.getFullYear();
                        for (i = start; i <= end; i++) {
                            w[s.yearText][i] = dord.match(/yy/i) ? i : (i + '').substr(2, 2);
                            w[s.yearText][i]+='年';
                        }
                    } else if (k == o.m) {
                        offset++;
                        w[s.monthText] = {};
                        for (i = 0; i < 12; i++) {
                            var str = dord.replace(/[dy]/gi, '').replace(/mm/, i < 9 ? '0' + (i + 1) : i + 1).replace(/m/, (i + 1));
                            w[s.monthText][i] = str.match(/MM/) ? str.replace(/MM/, '<span class="dw-mon">' + s.monthNames[i] + '</span>') : str.replace(/M/, '<span class="dw-mon">' + s.monthNamesShort[i] + '</span>');
                            w[s.monthText][i]+='月'
                        }
                    } else if (k == o.d) {
                        offset++;
                        w[s.dayText] = {};
                        for (i = 1; i < 32; i++) {
                            w[s.dayText][i] = dord.match(/dd/i) && i < 10 ? '0' + i : i;
                            w[s.dayText][i]+='日'
                        }
                    }
                }
                wheels.push(w);
            }

            if (p.match(/time/i)) {

                // Determine the order of hours, minutes, seconds wheels
                ord = [];
                $.each(['h', 'i', 's', 'a'], function (i, v) {
                    i = tord.search(new RegExp(v, 'i'));
                    if (i > -1) {
                        ord.push({ o: i, v: v });
                    }
                });
                ord.sort(function (a, b) {
                    return a.o > b.o ? 1 : -1;
                });
                $.each(ord, function (i, v) {
                    o[v.v] = offset + i;
                });

                w = {};
                for (k = offset; k < offset + 4; k++) {
                    if (k == o.h) {
                        offset++;
                        w[s.hourText] = {};
                        for (i = 0; i < (hampm ? 12 : 24); i += stepH) {
                            w[s.hourText][i] = hampm && i == 0 ? 12 : tord.match(/hh/i) && i < 10 ? '0' + i : i;
                        }
                    } else if (k == o.i) {
                        offset++;
                        w[s.minuteText] = {};
                        for (i = 0; i < 60; i += stepM) {
                            w[s.minuteText][i] = tord.match(/ii/) && i < 10 ? '0' + i : i;
                        }
                    } else if (k == o.s) {
                        offset++;
                        w[s.secText] = {};
                        for (i = 0; i < 60; i += stepS) {
                            w[s.secText][i] = tord.match(/ss/) && i < 10 ? '0' + i : i;
                        }
                    } else if (k == o.a) {
                        offset++;
                        var upper = tord.match(/A/);
                        w[s.ampmText] = { 0: upper ? 'AM' : 'am', 1: upper ? 'PM' : 'pm' };
                    }
                    
                }

                wheels.push(w);
            }

            function get(d, i, def) {
                if (o[i] !== undefined) {
                    return +d[o[i]];
                }
                if (def !== undefined) {
                    return def;
                }
                return defd[f[i]] ? defd[f[i]]() : f[i](defd);
            }

            function step(v, st) {
                return Math.floor(v / st) * st;
            }

            function getHour(d) {
                var hour = d.getHours();
                hour = hampm && hour >= 12 ? hour - 12 : hour;
                return step(hour, stepH);
            }

            function getMinute(d) {
                return step(d.getMinutes(), stepM);
            }

            function getSecond(d) {
                return step(d.getSeconds(), stepS);
            }

            function getAmPm(d) {
                return ampm && d.getHours() > 11 ? 1 : 0;
            }

            function getDate(d) {
                var hour = get(d, 'h', 0);
                return new Date(get(d, 'y'), get(d, 'm'), get(d, 'd', 1), get(d, 'a') ? hour + 12 : hour, get(d, 'i', 0), get(d, 's', 0));
            }

            inst.setDate = function (d, fill, time, temp) {
                var i;
                // Set wheels
                for (i in o) {
                    this.temp[o[i]] = d[f[i]] ? d[f[i]]() : f[i](d);
                }
                this.setValue(true, fill, time, temp);
            };

            inst.getDate = function (d) {
                return getDate(d);
            };

            return {
                button3Text: s.showNow ? s.nowText : undefined,
                button3: s.showNow ? function () { inst.setDate(new Date(), false, 0.3, true); } : undefined,
                wheels: wheels,
                headerText: function (v) {
                    return ms.formatDate(hformat, getDate(inst.temp), s);
                },
                /**
                * Builds a date object from the wheel selections and formats it to the given date/time format
                * @param {Array} d - An array containing the selected wheel values
                * @return {String} - The formatted date string
                */
                formatResult: function (d) {
                    return ms.formatDate(format, getDate(d), s);
                },
                /**
                * Builds a date object from the input value and returns an array to set wheel values
                * @return {Array} - An array containing the wheel values to set
                */
                parseValue: function (val) {
                    var d = new Date(),
                        i,
                        result = [];
                    try {
                        d = ms.parseDate(format, val, s);
                    } catch (e) {
                    }
                    // Set wheels
                    for (i in o) {
                        result[o[i]] = d[f[i]] ? d[f[i]]() : f[i](d);
                    }
                    return result;
                },
                /**
                * Validates the selected date to be in the minDate / maxDate range and sets unselectable values to disabled
                * @param {Object} dw - jQuery object containing the generated html
                * @param {Integer} [i] - Index of the changed wheel, not set for initial validation
                */
                validate: function (dw, i) {
                    var temp = inst.temp, //.slice(0),
                        mins = { y: mind.getFullYear(), m: 0, d: 1, h: 0, i: 0, s: 0, a: 0 },
                        maxs = { y: maxd.getFullYear(), m: 11, d: 31, h: step(hampm ? 11 : 23, stepH), i: step(59, stepM), s: step(59, stepS), a: 1 },
                        minprop = true,
                        maxprop = true;
                    $.each(['y', 'm', 'd', 'a', 'h', 'i', 's'], function (x, i) {
                        if (o[i] !== undefined) {
                            var min = mins[i],
                                max = maxs[i],
                                maxdays = 31,
                                val = get(temp, i),
                                t = $('.dw-ul', dw).eq(o[i]),
                                y,
                                m;
                            if (i == 'd') {
                                y = get(temp, 'y');
                                m = get(temp, 'm');
                                maxdays = 32 - new Date(y, m, 32).getDate();
                                max = maxdays;
                                if (regen) {
                                    $('.dw-li', t).each(function () {
                                        var that = $(this),
                                            d = that.data('val'),
                                            w = new Date(y, m, d).getDay(),
                                            str = dord.replace(/[my]/gi, '').replace(/dd/, d < 10 ? '0' + d : d).replace(/d/, d);
                                        $('.dw-i', that).html(str.match(/DD/) ? str.replace(/DD/, '<span class="dw-day">' + s.dayNames[w] + '</span>') : str.replace(/D/, '<span class="dw-day">' + s.dayNamesShort[w] + '</span>'));
                                    });
                                }
                            }
                            if (minprop && mind) {
                                min = mind[f[i]] ? mind[f[i]]() : f[i](mind);
                            }
                            if (maxprop && maxd) {
                                max = maxd[f[i]] ? maxd[f[i]]() : f[i](maxd);
                            }
                            if (i != 'y') {
                                var i1 = $('.dw-li', t).index($('.dw-li[data-val="' + min + '"]', t)),
                                    i2 = $('.dw-li', t).index($('.dw-li[data-val="' + max + '"]', t));
                                $('.dw-li', t).removeClass('dw-v').slice(i1, i2 + 1).addClass('dw-v');
                                if (i == 'd') { // Hide days not in month
                                    $('.dw-li', t).removeClass('dw-h').slice(maxdays).addClass('dw-h');
                                }
                            }
                            if (val < min) {
                                val = min;
                            }
                            if (val > max) {
                                val = max;
                            }
                            if (minprop) {
                                minprop = val == min;
                            }
                            if (maxprop) {
                                maxprop = val == max;
                            }
                            // Disable some days
                            if (s.invalid && i == 'd') {
                                var idx = [];
                                // Disable exact dates
                                if (s.invalid.dates) {
                                    $.each(s.invalid.dates, function (i, v) {
                                        if (v.getFullYear() == y && v.getMonth() == m) {
                                            idx.push(v.getDate() - 1);
                                        }
                                    });
                                }
                                // Disable days of week
                                if (s.invalid.daysOfWeek) {
                                    var first = new Date(y, m, 1).getDay(),
                                        j;
                                    $.each(s.invalid.daysOfWeek, function (i, v) {
                                        for (j = v - first; j < maxdays; j += 7) {
                                            if (j >= 0) {
                                                idx.push(j);
                                            }
                                        }
                                    });
                                }
                                // Disable days of month
                                if (s.invalid.daysOfMonth) {
                                    $.each(s.invalid.daysOfMonth, function (i, v) {
                                        v = (v + '').split('/');
                                        if (v[1]) {
                                            if (v[0] - 1 == m) {
                                                idx.push(v[1] - 1);
                                            }
                                        } else {
                                            idx.push(v[0] - 1);
                                        }
                                    });
                                }
                                $.each(idx, function (i, v) {
                                    $('.dw-li', t).eq(v).removeClass('dw-v');
                                });
                            }

                            // Set modified value
                            temp[o[i]] = val;
                        }
                    });
                },
                methods: {
                    /**
                    * Returns the currently selected date.
                    * @param {Boolean} temp - If true, return the currently shown date on the picker, otherwise the last selected one
                    * @return {Date}
                    */
                    getDate: function (temp) {
                        var inst = $(this).mobiscroll('getInst');
                        if (inst) {
                            return inst.getDate(temp ? inst.temp : inst.values);
                        }
                    },
                    /**
                    * Sets the selected date
                    * @param {Date} d - Date to select.
                    * @param {Boolean} [fill] - Also set the value of the associated input element. Default is true.
                    * @return {Object} - jQuery object to maintain chainability
                    */
                    setDate: function (d, fill, time, temp) {
                        if (fill == undefined) {
                            fill = false;
                        }
                        return this.each(function () {
                            var inst = $(this).mobiscroll('getInst');
                            if (inst) {
                                inst.setDate(d, fill, time, temp);
                            }
                        });
                    }
                }
            };
        };

    $.each(['date', 'time', 'datetime'], function (i, v) {
        ms.presets[v] = preset;
        ms.presetShort(v);
    });

    /**
    * Format a date into a string value with a specified format.
    * @param {String} format - Output format.
    * @param {Date} date - Date to format.
    * @param {Object} settings - Settings.
    * @return {String} - Returns the formatted date string.
    */
    ms.formatDate = function (format, date, settings) {
        if (!date) {
            return null;
        }
        var s = $.extend({}, defaults, settings),
            look = function (m) { // Check whether a format character is doubled
                var n = 0;
                while (i + 1 < format.length && format.charAt(i + 1) == m) {
                    n++;
                    i++;
                }
                return n;
            },
            f1 = function (m, val, len) { // Format a number, with leading zero if necessary
                var n = '' + val;
                if (look(m)) {
                    while (n.length < len) {
                        n = '0' + n;
                    }
                }
                return n;
            },
            f2 = function (m, val, s, l) { // Format a name, short or long as requested
                return (look(m) ? l[val] : s[val]);
            },
            i,
            output = '',
            literal = false;

        for (i = 0; i < format.length; i++) {
            if (literal) {
                if (format.charAt(i) == "'" && !look("'")) {
                    literal = false;
                } else {
                    output += format.charAt(i);
                }
            } else {
                switch (format.charAt(i)) {
                case 'd':
                    output += f1('d', date.getDate(), 2);
                    break;
                case 'D':
                    output += f2('D', date.getDay(), s.dayNamesShort, s.dayNames);
                    break;
                case 'o':
                    output += f1('o', (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000, 3);
                    break;
                case 'm':
                    output += f1('m', date.getMonth() + 1, 2);
                    break;
                case 'M':
                    output += f2('M', date.getMonth(), s.monthNamesShort, s.monthNames);
                    break;
                case 'y':
                    output += (look('y') ? date.getFullYear() : (date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
                    break;
                case 'h':
                    var h = date.getHours();
                    output += f1('h', (h > 12 ? (h - 12) : (h == 0 ? 12 : h)), 2);
                    break;
                case 'H':
                    output += f1('H', date.getHours(), 2);
                    break;
                case 'i':
                    output += f1('i', date.getMinutes(), 2);
                    break;
                case 's':
                    output += f1('s', date.getSeconds(), 2);
                    break;
                case 'a':
                    output += date.getHours() > 11 ? 'pm' : 'am';
                    break;
                case 'A':
                    output += date.getHours() > 11 ? 'PM' : 'AM';
                    break;
                case "'":
                    if (look("'")) {
                        output += "'";
                    } else {
                        literal = true;
                    }
                    break;
                default:
                    output += format.charAt(i);
                }
            }
        }
        return output;
    };

    /**
    * Extract a date from a string value with a specified format.
    * @param {String} format - Input format.
    * @param {String} value - String to parse.
    * @param {Object} settings - Settings.
    * @return {Date} - Returns the extracted date.
    */
    ms.parseDate = function (format, value, settings) {
        var def = new Date();

        if (!format || !value) {
            return def;
        }

        value = (typeof value == 'object' ? value.toString() : value + '');

        var s = $.extend({}, defaults, settings),
            shortYearCutoff = s.shortYearCutoff,
            year = def.getFullYear(),
            month = def.getMonth() + 1,
            day = def.getDate(),
            doy = -1,
            hours = def.getHours(),
            minutes = def.getMinutes(),
            seconds = 0, //def.getSeconds(),
            ampm = -1,
            literal = false, // Check whether a format character is doubled
            lookAhead = function (match) {
                var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
                if (matches) {
                    iFormat++;
                }
                return matches;
            },
            getNumber = function (match) { // Extract a number from the string value
                lookAhead(match);
                var size = (match == '@' ? 14 : (match == '!' ? 20 : (match == 'y' ? 4 : (match == 'o' ? 3 : 2)))),
                    digits = new RegExp('^\\d{1,' + size + '}'),
                    num = value.substr(iValue).match(digits);

                if (!num) {
                    return 0;
                }
                //throw 'Missing number at position ' + iValue;
                iValue += num[0].length;
                return parseInt(num[0], 10);
            },
            getName = function (match, s, l) { // Extract a name from the string value and convert to an index
                var names = (lookAhead(match) ? l : s),
                    i;

                for (i = 0; i < names.length; i++) {
                    if (value.substr(iValue, names[i].length).toLowerCase() == names[i].toLowerCase()) {
                        iValue += names[i].length;
                        return i + 1;
                    }
                }
                return 0;
                //throw 'Unknown name at position ' + iValue;
            },
            checkLiteral = function () {
                //if (value.charAt(iValue) != format.charAt(iFormat))
                //throw 'Unexpected literal at position ' + iValue;
                iValue++;
            },
            iValue = 0,
            iFormat;

        for (iFormat = 0; iFormat < format.length; iFormat++) {
            if (literal) {
                if (format.charAt(iFormat) == "'" && !lookAhead("'")) {
                    literal = false;
                } else {
                    checkLiteral();
                }
            } else {
                switch (format.charAt(iFormat)) {
                case 'd':
                    day = getNumber('d');
                    break;
                case 'D':
                    getName('D', s.dayNamesShort, s.dayNames);
                    break;
                case 'o':
                    doy = getNumber('o');
                    break;
                case 'm':
                    month = getNumber('m');
                    break;
                case 'M':
                    month = getName('M', s.monthNamesShort, s.monthNames);
                    break;
                case 'y':
                    year = getNumber('y');
                    break;
                case 'H':
                    hours = getNumber('H');
                    break;
                case 'h':
                    hours = getNumber('h');
                    break;
                case 'i':
                    minutes = getNumber('i');
                    break;
                case 's':
                    seconds = getNumber('s');
                    break;
                case 'a':
                    ampm = getName('a', ['am', 'pm'], ['am', 'pm']) - 1;
                    break;
                case 'A':
                    ampm = getName('A', ['am', 'pm'], ['am', 'pm']) - 1;
                    break;
                case "'":
                    if (lookAhead("'")) {
                        checkLiteral();
                    } else {
                        literal = true;
                    }
                    break;
                default:
                    checkLiteral();
                }
            }
        }
        if (year < 100) {
            year += new Date().getFullYear() - new Date().getFullYear() % 100 +
                (year <= (typeof shortYearCutoff != 'string' ? shortYearCutoff : new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10)) ? 0 : -100);
        }
        if (doy > -1) {
            month = 1;
            day = doy;
            do {
                var dim = 32 - new Date(year, month - 1, 32).getDate();
                if (day <= dim) {
                    break;
                }
                month++;
                day -= dim;
            } while (true);
        }
        hours = (ampm == -1) ? hours : ((ampm && hours < 12) ? (hours + 12) : (!ampm && hours == 12 ? 0 : hours));
        var date = new Date(year, month - 1, day, hours, minutes, seconds);
        if (date.getFullYear() != year || date.getMonth() + 1 != month || date.getDate() != day) {
            throw 'Invalid date';
        }
        return date;
    };

})(jQuery);

 
})

.controller('passengerselC',function($scope,storage,passengerS,$rootScope,ngMessage){
	storage.init();
	var index = 1;
	var token = storage.get("token");
	var totalnum=storage.get("totalnum");
	var selectBox=storage.get("selectBox")||[];
	console.log(selectBox);
//	var user = storage.get("user");
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
			"title":"选择旅客",
			"back":true,
			"history":true
		},
		"add":{
			"show":false,
			"title":"添加常用旅客",
			"back":true
		},
		"edit":{
			"show":false,
			"title":"编辑旅客",
			"back":true
		}
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
	$scope.switchLayout("index");
	
	$scope.birthday = "";
//旅客信息
	//常用旅客列表
	$scope.getPassenger = function () {
		passengerS.my_passenger({"token":token},function(res) {
			if (res) {
				$scope.info = res.data||[];
				$scope.noPassengers = false;
				console.log(res)

				for(i=0;i<$scope.info.length;i++){
					$scope.info[i].check=false;
					if(selectBox){
						for(y=0;y<selectBox.length;y++){
							if(selectBox[y]==$scope.info[i].pe_id){
								$scope.info[i].check=true;
							}
						}
					}
				};
				console.log($scope.info)
			}else{
				$scope.noPassengers = true;
				console.log("noPassengers")
			};
		});
//			$scope.passenger.onChange()
	};
	$scope.getPassenger();
	$scope.addPassenger = function(){
		storage.set("mark","true");
		storage.toPage("passenger")
	};
		
	$scope.topage=function(){
		if(selectBox.length>totalnum){
			ngMessage.showTip("所选旅客超过参与人数！");
			return false;
		}else if(selectBox.length<totalnum){
			ngMessage.showTip("所选旅客少于参与人数！");
			return false;
		}
		storage.set("selectBox",selectBox);
		window.history.go(-1);
	};
	$scope.check=function (v) {
		v.check = !v.check;
		if(v.check){
			selectBox.push(v.pe_id);
		}else{
			var index = selectBox.indexOf(v.pe_id);
			if (index > -1) {
            selectBox.splice(index,1);
            }
		}
		console.log(selectBox);
	};
	$(".lineGroup .addsex input").click(function(){
		$(this).addClass("checked");
		$(this).siblings().removeClass("checked");
	});
	
	$scope.back=function () {
		var layout = $scope.page.currentLayout;
		if ($scope.layout[layout].history) {
			window.history.go(-1);
		}else{	
			if ($scope.page.ppLayout!="index") {
				$scope.switchLayout('index');
			}else{
				$scope.switchLayout($scope.page.prevLayout);
			}
			
		}		
	}
})	
	