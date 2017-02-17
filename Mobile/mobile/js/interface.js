
var host = "http://"+location.host+"/";//jtshop  


/*
var mockHost2 = "http://act.bihaohuo.com.cn/";
var mockHost = "http://api.bihaohuo.com.cn/";
var mockChips = "http://chips.bihaohuo.com.cn/";
var activityHost = "http://chips.bihaohuo.com.cn/";
*/
var mockHost2 = "http://act.t-jitu365.cn/";
var mockHost = "http://api.t-jitu365.cn/";
var mockChips = "http://chips.t-jitu365.cn/";
var activityHost = "http://chips.t-jitu365.cn/";
var adminhost = "http://admin.t-jitu365.cn";

//接口url      //act 
var interfaceURL={
	allChips:{  // 众筹
		chips:mockChips+"chips/chips",               // 方案列表
		chipsGoods:mockChips+"chips/chipsGoods",     // 方案商品
		orderShow:mockChips+"Order/orderShow",       // 订单页面
		submitOrder:mockChips+"Order/submitOrder",   // 订单提交
		getProject:mockChips+"Crowdfunding/getProject",  // 获取众筹项目内容
		doCollec:mockChips+"Crowdfunding/doCollect",       // 添加收藏  
		delCollect:mockChips+"Crowdfunding/delCollect",    // 删除收藏
		accountPay:mockChips+"Pay/accountPay",           // 余额支付
		wechatPay:mockChips+"Pay/wechatPay",               // 微信支付
		mobilePay:mockChips+"Pay/mobilePay",               // 移动支付
		i:mockChips+"i/index",                             // 余额
		doCollect:mockChips+"Crowdfunding/showCollect",       //收藏
		allOrders:mockChips+"Order/orders",                       //订单列表
		travelReg:mockChips+"Crowdfunding/travelRegister",       // 旅游
		exitChips:mockChips+"Order/exitChips",                   // 退出众筹
		getLogistic:mockChips+"Crowdfunding/getLogisticTrace",    //  物流跟踪信息 
		orderInfo:mockChips +"Order/orderInfo"
	},
	luckyDraw:{   // 众筹抽奖
		getAwardContent:mockChips+"Award/getAwardContent",       //获取抽奖内容
		draw:mockChips+"Award/draw",                             // 参与抽奖
		myDrawChance:mockChips+"Award/myDrawChance",             //获取抽奖名额数
		myDrawLis:mockChips+"Award/myDrawList",					 //获取所中奖品列表						
		getMyDraw:mockChips+"Award/getMyDraw",                   //领取奖品
		showMyAddress:mockChips+"Award/showMyAddress",           //领奖地址查看
		addAddress:mockChips+"Award/addAddress"				     //新增或修改获奖收获地址
	},
	home:{ //首页
		banner:mockHost+"Home/banner",
		banners:mockHost+"marketing/banner", // 首页banner
		routes:mockHost+'goods/routes',  //精选路线推荐
		rementuijian:mockHost+'Classify/index',  //精选路线推荐
		topNav:mockHost+'Home/topNav',  //首页顶部导航
		hots:mockHost+'Classify/index',  //热门目的地
		explosion:mockHost+"Home/recommend",//爆款
		recommend:mockHost+"Home/position", //推荐位
		brand: mockHost + "Home/brands", //品牌 
		category: mockHost +"Home/getCats", //类别
		feats:mockHost+"Home/feats" //推荐位 
	},
	user:{ //用户
		login:mockHost+"User/login",              //密码登陆
		mobileLogin:mockHost+"User/mobile_login", //验证码登陆
		setPassword:mockHost+"User/mobile_reg",   //设置新密码
		register:mockHost+"User/register",
		logout:host+"User/loginOut", //--------weixin unused
		recPassword:mockHost+"User/forgotPass",//找回密码
		updPassword:mockHost+"User/updatePass",
		updName:mockHost+"User/updateUsername",
		updRealname:mockHost+"User/updateRealname", //修改真实姓名
		updUsername:mockHost+"User/updateUsername", //修改昵称
		updMobile:mockHost+"User/updateMobile", //修改手机号
		infomation:mockHost+"User/getInfo",
		i:mockHost+"i/index",
		updAvatar:mockHost+"user/uploadHeadPic",
		accountBind:mockHost+"User/accountBind",   // 第三方登录 
		add_mp:mockHost+"user/add_mp",             //添加旅客
		del_mp:mockHost+"user/del_mp",             //删除旅客
		my_passenger:mockHost+"User/my_passenger",  //旅客列表
		certificates:mockHost+"User/certificates",  //证件信息
		ceUp:mockHost+"User/ceUp",  //添加证件号
		updateSex:mockHost+"User/updateSex",  //修改性别
		updateBirthday:mockHost+"User/updateBirthday",  //修改生日
		setPatPassword:mockHost+"User/setPaymentPWD",  //设置支付密码
		PaymentPWD:mockHost+"User/PaymentPWD",  //检查是否设置支付密码
		verifyPaymentPWD:mockHost+"User/verifyPaymentPWD",  //验证支付密码
		availableIntegral:mockHost+"promotions/availableIntegral",  //余额 积分查询
		getIntegral:mockHost+"User/getIntegral",  //余额 积分明细
		addinvoice:mockHost+"Affiliated/addinvoice",  //新增发票
		getVipInfo:mockHost+"user/getVipInfo",  //获取会员卡号
	},
	promotion:{ //用户等级
		login:mockHost+"User/login",  
		getPromotions:mockHost+"Promotions/getPromotions",  //会员等级信息
		submitData:mockHost+"Promotions/submitData",  //是否需要实体卡信息
		UpgradeMember:mockHost+"Order/UpgradeMember",  //会员升级
		getSuccess:mockHost+"Promotions/getSuccess",  //会员实体卡信息
		submitInfo:mockHost+"Promotions/submitInfo",  //填写领取线下实体卡信息
		getCard:mockHost+"Promotions/getCard"  //查询是否有未发实体卡片
	},
	sms:{ //短信
		send:mockHost+"Message/sendSMS",  //发送短信
		verify:mockHost+"Message/verifySMS", //验证短信
		checkTelSend:mockHost+"User/checkTelSend",//发送旧手机验证码
		checkTel:mockHost+"User/checkTel",//核对旧手机
		checkTelNewSend:mockHost+"user/recieveTelSendCode",//发送新手机验证码
		checkTelNew:mockHost+"user/recieveTel"//核对发送新手机
	},
	activitys:{//活动Ycj
		activityUrl:activityHost+"Activity/getWong",// 活动接口
		activityHelpCode:activityHost+"Activity/getCode",         // 活动助力码
		activityGetFriend:activityHost+"Activity/getFriendDetail",		 //加蜜友
		activityFriendCode:activityHost+"Activity/friendCode",		 //助力蜜友
        myList:activityHost+"Activity/MyAward",     				 //嗡嗡嗡我的奖单记录
		sysList:activityHost+"Activity/SystemAward",   //系统奖单记录
		notice:activityHost+"Activity/detail",    //     活动说明
		activityAward:activityHost+"Activity/award",		 //抽奖接口
		isDraw:activityHost+"Activity/isDraw",
		AnniversaryUrl:activityHost+"Activity/tenYear",  //十周年庆活动接口
		AnniversaryAward:activityHost+"Activity/tenYearAward",       //十周年庆抽奖接口                 
		AnniversaryList:activityHost+"Activity/tenMyAward",          //十年周庆我的奖品记录
		AnniversaryNotice:activityHost+'Activity/tenYearDetail'    //十周年庆活动说明
	},
	feedback:{ //反馈
		option:mockHost+"Feedback/opinionType",  //获取意见反馈类型
		submitOpt:mockHost+"Feedback/submitOpinion"	//提交意见反馈类型	
	},
	commodity:{  //商品
		list:mockHost+"List/goodsList",//商品列表
		detail: mockHost + "Detail/detail",  //商品详情
		goodsInfo:mockHost + "goods/get_info", //产品详情
		getActivityList: mockHost + "List/getActivityList",
		goodsPrice: mockHost + "goods/get_price",
		goods_search:mockHost + "goods/goods_search",    //目的地产品搜索
		category_search:mockHost + "goods/category_search",    //分类搜索（国内，周边，养生）
		domestic_tour:mockHost + "marketing/domestic_tour",    //国内游推荐分类接口
		base_index:mockHost + "base/base_index",    //参观基地首页分类
		more_base:mockHost + "base/more_base",    //参观基地更多分类
		base_info:mockHost + "base/base_info",    //参观基地详情
	},
	cart:{  //购物车
		list:mockHost+"Cart/lists",   //购物车列表
		add : mockHost+ "Cart/add",   //加入购物车
		update:mockHost+ "Cart/update",  //更新购物车
		del: mockHost +"Cart/del",       //删除购物车
		clearing:mockHost+"Cart/goShopping",  //结算购物车
		buynow:mockHost+"Cart/buynow",   //立即购买
		count:mockHost+"cart/getMyCartCount"
	},
	address:{ //地址
		list:mockHost+"Affiliated/getdelivery", //提货地址列表 
		add:host+"Affiliated/adddelivery",  //提货地址新增
		update: host +"Affiliated/updatedelivery", //提货地址
		del:host+"Affiliated/deldelivery", //提货地址
		option:mockHost+"Affiliated/getStores", //提货地址 门店列表
		listRec:mockHost+"Affiliated/getrecaddress",//收货地址列表
		addRec:mockHost+"Affiliated/addrecaddress",//增加收货地址
		updateRec:mockHost+"Affiliated/updaterecaddress",//更新收货地址
		delRec:mockHost+"Affiliated/delrecaddress",//删除收货地址
		setDefault:mockHost+"Affiliated/setDefaultRecaddress", //设置默认收货地址
		storesDistance : mockHost +"Affiliated/getStoresDistance",//获取送货上门
		commitComment : mockHost +"GoodsComment/commitComment"
		
	},
	invoice:{ //发票
		list:mockHost+"Affiliated/getinvoice", //获取发票列表
		add: mockHost+"Affiliated/addinvoice",    //新增发票
		update:mockHost+"Affiliated/updateinvoice", //修改发票
		del:mockHost+"Affiliated/delinvoice"      //删除发票
	},
	order:{
		submit:mockHost+"Order/single", //先提交订单，获取订单好，再进行支付
		list:mockHost+"Order/myOrder",     //订单列表
		pay:mockHost+"Order/wechatPay",      //微信支付
		apay:mockHost+"Order/accountPay",    //账户余额支付
		recharge:mockHost+"order/wechatRecharge",//充值接口
		cancal:mockHost+"Order/cancel",  //取消订单
		receipt:mockHost+"Order/receipt",//确认收货
		refund: mockHost +"Order/orderRefund",  //申请退款
		detail: mockHost+ "Order/orderDetail",// 订单详情
		shipmentPrice: mockHost+ "Order/shipmentPrice",// 订单运费
		getInsurance: mockHost+ "marketing/getInsurance",// 获取保险费用信息
		getDiscountPrice: mockHost+ "Promotions/getDiscountPrice",// 获取用户可优惠价格
		availableIntegral: mockHost+ "promotions/availableIntegral",// 获取可用积分 余额
		getinvoice: mockHost+ "Affiliated/getinvoice",// 获取发票列表
		getrecaddress: mockHost+ "Affiliated/getrecaddress",// 常用地址列表
		single: mockHost+ "Order/single",// 提交订单
		orderDetail: mockHost+ "Order/toPayPage",// 订单支付方式选择页面
		accountPay: mockHost+ "Order/accountPay",// 账户余额支付
	},
	refund:{
		list  : mockHost + "Refund/refundList",   //退款退货列表
		apply : mockHost +"Refund/refundShow",    //申请退款退货页面
		applyAll:mockHost+"Refund/refundShowAll",  //整单退款退货页面
		submit: mockHost + "Refund/refundAction", //申请退款/退货
		submitAll:mockHost+"Refund/allRefundAction", //申请整单退款/退货
		detail: mockHost + "Refund/refundInfo",   //退款退货详情
		cancel: mockHost +"Refund/cancelRefund",   //取消退款退货
		uploadVoucher: mockHost +"Refund/uploadVoucher"   //上传退款退货凭证
	},
	other:{
		history:mockHost+"History/history", //浏览记录
		area:mockHost+"Area/getArea",  //获取行政地区数据
		coin:mockHost+"i/creditsDetail",
		recHistory:mockHost+"Record/recharge",   // 充值历史记录
		payRecord:mockHost+"Record/payRecord",   // 消费记录
		allRecord:mockHost+"Record/allRecord",   // 全部记录
		getLocation:mockHost+"Area/getLocationByLngLat"   // 通过经纬获取地区信息
	},
	fav:{
		add:mockHost+"Collect/addCollect", //添加收藏
		del:mockHost+"Collect/del",   //取消收藏
		list:mockHost+"Collect/myCollect"  //我的收藏
	},
	coupon:{
		list:mockHost+"Coupon/couponList",  // 优惠券列表
		byOrder:mockHost+"Coupon/getCouponListByOrderMount",    // 订单可用优惠券列表
		receiveCoupon:mockHost+"Coupon/receiveCoupon",
		activity:mockHost+"Home/activity",       // 活动首页列表 (限时)
		getCouponRemark:mockHost + 'Coupon/getCouponRemark'    //获取优惠券备注说明

	},
	wechat:{
		pub:mockHost+"WechatPublic/getCode",
		oauth:mockHost+"User/oauth",
		mauth:mockHost+"WechatPublic/getInfo",
		sdk:mockHost+"JsSdk/getSignPackage",
		commentList:mockHost+"GoodsComment/commentList",
		isLook:mockHost+"jsSdk/validateMp",   //是否关注
		getHotCity:mockHost+"Area/getHotCity"
	},
	trytoeat:{
		list:mockHost2 + 'Tast/addTast'     // 试吃
	},
	togistics:{
		tost:mockHost + 'Logistics/getLogisticsTrace'  //查询快递跟踪
	},
	cashVoucher:{
		receiveCoupon:mockHost + 'Coupon/receiveCoupon',      //领取优惠券
		getCouponDetail:mockHost + 'Coupon/getCouponDetail'    //获取优惠券详情
	},
	push:{
		contactDetail:mockHost + 'MarketPushingRecommend/contactDetail'  //地推
	},
	msgPush:{
		msgPush:mockHost+'MessagePush/get_num',     //消息推送
		getInfo:mockHost+"KuaiDi/get_info",   //查看物流详情
		updateM:mockHost+'MessagePush/up_push'  //更新阅读状态
	},
	
}



//静态页面
var staticPages = {
	home:host+"index.html",
	detail:host+"html/commodity/detail.html",
	orderInfo:host+"/html/allchips/orderInfo.html",
	list:host+"html/list.html",
	classification:host+"html/classification.html",
	memcenter:host+"html/memcenter.html",
	personalCenter:host+"html/user/personalCenter.html",
	login:host+"html/user/login.html",
	register:host+"html/user/register.html",
	ucenter:host+"html/user/ucenter.html",
	user:host+"html/user/user.html",
	bindPhone:host+'html/user/bindPhone.html',
	changePhone:host+"html/user/changePhone.html",
	changePassword:host+"html/user/changePassword.html",
	history:host+"html/commodity/history.html",
	fav:host+"html/commodity/favoriter.html",
	domesticTravelindex:host+"html/commodity/domesticTravelindex.html", //尊享养生
	order:host+"html/order/index.html",
	orderDetail:host+"html/order/orderDetail.html",	//订单详情
	checkOrder:host+"html/order/check.html",
	payOrder:host+"html/order/pay.html",
	feedback:host+"html/feedback.html",
	addressMan:host+"html/address/manage.html",
	addAddress:host+"html/address/add.html",
	editAddress:host+"html/address/edit.html",
	cart:host+"html/cart/cart.html",
	refund:host + "html/refund/index.html",
	refundDetail:host + "html/refund/detail.html",
	request:host + "html/refund/request.html",
	requestAll:host + "html/refund/requestAll.html",  //整单退货
	coupon:host+"html/coupon/index.html",
    hysjymy:host+"html/hysj.html",
	couponDetail:host+"html/coupon/detail.html", // 优惠券详情页面

	balance:host+"html/order/balance.html",
	currency:host+"html/accounts/currency.html",
//	paySuccess:host+"html/pay/paySuccess.html",
//	payFailure:host+"html/pay/payFailure.html",
	paySuccess:host+"html/order/paysuccess.html",//支付成功
	payFailure:host+"html/order/payfail.html",
	wxAuth:host+"html/auth.html",
	collection:host+"html/user/collection.html",
	togistics:host+"html/togistics/togistics.html",  //查询快递跟踪
	recharge:host+"html/user/recharge.html",        //充值
	comments:host+"html/refund/comments.html",       //待评论
	commentsChild:host+"html/refund/commentsChild.html",       //评论
	push:host+"/html/push.html",
	Myraise:host+"/html/allchips/Myraise.html",
	details:host+"/html/allchips/details.html",
	honey:host+"/html/allchips/honey.html",
	chargeDetails:host+"html/order/chargeDetails.html",    // 充值详情
	check:host+"html/allchips/check.html",
	successPay:host+"html/allchips/pay.html",
	failurePay:host+"html/allchips/successPay.html",
	logistics:host+"html/allchips/logistics.html",
	luckyDraw:host+"html/allchips/luckyDraw.html",
	results:host+"html/friend/results.html",
	friendTes:host+"html/friend/friendTes.html",
	prizes:host+"html/allchips/prizes.html",          //领取奖品
	receive:host+"html/allchips/receive.html",         //添加地址
	
	premiumList:host+"html/wechatActivity/premiumList.html", //嗡嗡活动我的奖单
	systemList:host+"html/wechatActivity/systemList.html",    //嗡嗡活动系统奖单
	wengNotice:host+"html/wechatActivity/notice.html",       // 嗡嗡活动说明
	activity:host+"html/activitys/helpcode.html",      //助力码
	activityAddmi:host+"html/activitys/addmi.html",		//加蜜友
	activityDefault:host+"html/activitys/default.html",	//活动首页
	
	AnniversaryDefault:host+"html/anniversary/index.html", //十周年庆抽奖活动首页
	AnniversaryNotice:host+"html/anniversary/notice.html",  //十周年庆活动说明页
	AnniversaryMyList:host+"html/anniversary/proList.html",  //十周年庆我的奖品页
	
	deposit:host+"html/deposit/index.html",    //充值,挥金页面
	
	messageCheck:host+"html/messagePush/check.html",
	appxiazai:host+"html/hysjs.html",//app下载页面
	success:host+"html/zhifusuccess.html",//微信支付成功页
	fail:host+"html/zhifufail.html",//微信支付成功页
	setPassword:host+"html/user/setPassword.html", //设置新密码
	setPayPassword:host+"html/user/setPayPassword.html", //设置支付密码
	changePayPassword:host+"html/user/changePayPassword.html", //修改支付密码
	changePassword:host+"html/user/changePassword.html", //修改密码
	personalCenter:host+"html/user/personalCenter.html", //个人中心
	introduction:host+"html/introduction.html", //吉途旅游介绍
	gatarea:host+"html/gatarea.html", //搜索城市
	passenger:host+"html/user/passenger.html", //常用旅客
	changeName:host+"html/user/changeName.html", //真实姓名
	changeUsername:host+"html/user/changeUsername.html", //修改昵称
	certificates:host+"html/user/certificates.html", //修改证件号
	searchlist:host+"html/commodity/searchlist.html", //目的地搜索
	dateChoose:host+"html/commodity/dateChoose.html", //选择团期
	keywordsManagement:host+"html/user/keywordsManagement.html", //密码管理
	balance:host+"html/user/balance.html", //余额明细
	integral:host+"html/user/integral.html", //积分明细
	integralRules:host+"html/user/integralRules.html", //积分规则
	membershipGrade:host+"html/user/membershipGrade.html", //会员等级
	passengersel:host+"html/user/passengersel.html", //添加旅客
	addsend:host+"html/user/addsend.html", //添加收件人
	addfapiao:host+"html/user/addfapiao.html", //添加发票
	send:host+"html/user/send.html", //添加收件人
	fapiao:host+"html/user/fapiao.html", //添加发票
	checknext:host+"html/order/checknext.html", //支付订单选择页
	phoneChangeType:host+"html/user/phoneChangeType.html", //选择修改手机方式
	bindPassword:host+"html/user/bindPassword.html", //验证支付密码
	set:host+"html/user/set.html", //设置
	mailAddress:host+"html/user/mailAddress.html", //邮寄地址
	mailMsg:host+"html/user/mailMsg.html" //邮寄信息
}
