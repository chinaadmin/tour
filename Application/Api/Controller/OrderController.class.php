<?php
namespace Api\Controller;
use Common\Model\SharedModel;
use Common\Org\ThinkPay\PayVo;
use Common\Org\ThinkPay\ThinkPay;
use User\Org\Util\User;
class OrderController extends ApiBaseController {

    public function _initialize(){
        parent::_initialize();
        $this->authToken();
        $user = User::getInstance ();
        $user->loginUsingId($this->user_id);
    }

    /**
     * 提交订单
     * @param String  token 			
     * @param String  goods_id 			线路id
     * @param String  dateTime 			团期
     * @param String  adult_num 		成人票数
     * @param String  child_num 		儿童票数
     * @param Array   insu_id 			保险信息id
     * @param String  needs_invoice 	是否需要发票	0为不需要，1为需要
     * @param String  invoice_payee 	发票抬头
     * @param String  receive_name  	发票收件人
     * @param String  receive_phone 	收件人号码
     * @param String  receive_address 	收件人地址
     * @param Json    travellerList 	旅客信息列表
     * @param String  contact 			订单联系人
     * @param String  mobile 			联系人号码
     * @param String  source 			订单来源	1为APP、2为微信、3为PC、4为必好货商城
     */
    public function single(){
		$data = array();
		$goods_id = I('post.goods_id',0,'int');
        $insu_id = I('post.insu_id');
		$travellerList = I('post.travellerList');
        $integral = I('post.integral',0,'float');
        if($integral){
            $credits =  D('User/Credits') ->getCredits($this ->user_id,1);
            if($integral > $credits){
                $this->ajaxReturn($this->result->error('积分不足！','ERROR'));
            }
        }
        if($integral< 0){
            $this->ajaxReturn($this->result->error('下单失败！','ERROR'));
        }
		$data = array(
			'goods_id' 	=>	$goods_id,
			'dateTime' 	=>	I('post.dateTime'),
			'adult_num' =>	I('post.adult_num',0,'int'),
			'child_num' =>	I('post.child_num',0,'int'),
			'insu_id' 	=>	is_array($insu_id)?$insu_id:html_entity_decode($insu_id),
			'contact'	=>	I('post.contact'),
			'mobile'	=>	trim(I('post.mobile')),
			'needs_invoice'	=>	I('post.needs_invoice',0,'int'),
			'travellerList'	=>	is_array($travellerList)?$travellerList:html_entity_decode($travellerList),
			'source'	=>	I('post.source',0,'int')?I('post.source',0,'int'):1,
            'integral' => $integral,
		);
		$invoice_payee	 =	I('post.invoice_payee');
		$receive_name	 =	I('post.receive_name');
		$receive_phone	 =	I('post.receive_phone');
		$receive_address =	I('post.receive_address');
		
        if($data['needs_invoice']==1){
			if(empty($invoice_payee) || empty($receive_name) || empty($receive_phone) || empty($receive_address)){
				$this->ajaxReturn($this->result->error('发票信息不全！','ERROR'));
				exit;
			}
			
			$goodsName = M('Goods')->where(['goods_id'=>$goods_id])->getField('name');
			$invoice_data = [
				'invoice_payee' => $invoice_payee,
				'invoice_content' => $goodsName?$goodsName:'吉途旅游发票',
				'receive_name' => $receive_name,
				'receive_address' => $receive_address,
				'receive_phone' => $receive_phone,
			];
			$res = M('Invoice')->add($invoice_data);
			if ($res === false) {
				$this->ajaxReturn($this->result->error('添加发票失败！'));
				exit;
			}
			$data['invoice_id'] = $res;
        }

        $result = D('Home/Order')->addOrder($data);
		
        $this->ajaxReturn($result);
    }
	
	/**
	 *	订单支付方式选择页面
	 *	@param	String	token		登录令牌
	 *	@param	String	order_id	订单id
	 */
	public function toPayPage(){
		$order_id = I('post.order_id');
		
		$result = D('Home/Order')->getPayInfo($order_id);
		$this->ajaxReturn($result);
        
	}
	
	/**
	 *	支付接口
	 *	@param String token  	登陆令牌
	 *	@param String order_id  订单id
	 *	@param String pay_type  支付方式	1为余额支付，2为支付宝，3为微信支付
	 */
	/* public function paying(){
		$order_id = I('order_id',0,'int');
		$pay_type = I('pay_type',0,'int');
		
		if(!$order_id){
			$this->result()->error('订单id不能为空！','ERROR');
			exit;
		}
		if(!$pay_type){
			$this->result()->error('请选择支付方式！','ERROR');
			exit;
		}
		$orderInfo = M('Order')->field('status,pay_time')->where(['order_id'=>$order_id])->find();
		if(empty($orderInfo)){
			$this->result()->error('订单不存在！','ERROR');
			exit;
		}elseif($orderInfo['status']!=0 || $orderInfo['pay_time']){
			$this->result()->error('该订单已支付！','ERROR');
			exit;
		}
		
		if($pay_type==3){
			$this->wechatPay();
		}elseif($pay_type==2){

        }
	} */

    
    
    /**
     * 账户余额支付
     * @param 	token 		token值
     * @param	orderId 	订单id        
     */
    public function accountPay(){
        $order_id = I('post.orderId');
        $re = M('Order')->where(['order_id'=>$order_id])->data(['pay_type'=>'1'])->save();
        $result = D('Home/Pay')->accountPay($order_id);
        $this->ajaxReturn($result);
    }
	
	/**
	 *	我的订单
	 *	@param type 		订单状态   0待支付;1待消费;2已完成;3申请退款
	 *	@param order_id 	订单ID    
	 */
	public function myOrder(){
		$where = [];
		$status = I('type','','int');
        $page = I('page','','int');

		if(is_numeric($status)){
            if($status==3){
                $where['status']=['in',[3,4,5]];
            }else{
                $where['status']=$status;
            }
		}
		$where['uid']=$this->user_id;
		// $img = D('Upload/AttachMent');
		
		$return_data = D('Home/Order')->getOrderList($where,$page);
		// $status_arr  = [0=>'待支付',1=>'待消费',2=>'已完成',3=>'申请退款'];
		if(!empty($return_data)){
			foreach($return_data as $k=>$v){
				// $return_data[$k]['statusName']=$status_arr[$v['status']];
				$return_data[$k]['num']=$v['adult_num']+$v['child_num'];
				if($v['photo']){
					$img = D('Upload/AttachMent')->getAttach($v['photo'],true);
					$return_data[$k]['photo'] = $img?'http://'.C('jt_config_web_domain_name').$img[0]['path']:'';
					// $return_data[$k]['photo'] = $img;
				}
				if($v['status']==5){
					$refundMoney = M('Refund')->where(['order_id'=>$order_id])->getField('refund_money');
					$return_data[$k]['refundMoney']=$refundMoney?$refundMoney:0;
				}else{
					$return_data[$k]['refundMoney']=0;
				}
				
				$return_data[$k]['expire_time']=$v['status']==0?($v['add_time']+3600*24):0;
				
				unset($return_data[$k]['adult_num']);
				unset($return_data[$k]['child_num']);
			}
		}
        // dump($return_data);exit;
        // $return_data['lastPage']=!empty($return_data)?1:0;  //判断是否是最后一页
		$data = [
			'orderList' => $return_data,
            'lastPage'  => !empty($return_data)?"1":"0",
		];
		$this->ajaxReturn($this->result->content($data)->success());
		// dump($return_data);
	}
	
	/**
	 *	订单详情
	 *	@param token 		登陆令牌
	 *	@param order_id 	订单id
	 */
	public function orderDetail(){
		$order_id = I('order_id',0,'int');
		
		$orderInfo = D('Home/Order')->getOrderDetail($order_id);
		$travelList = M('OrderTraveller')->field('traveller_name,paper_name,paper_code')->where(['order_id'=>$orderInfo['order_id']])->select();
		$num = $orderInfo['adult_num']+$orderInfo['child_num'];
		$adultPrice = $orderInfo['adult_num']*$orderInfo['adult_price'];
		$childPrice = $orderInfo['child_num']*$orderInfo['child_price'];
		$data = [
			'goodsname'=>$orderInfo['goodsname']?$orderInfo['goodsname']:'',
            'goods_sn'=>$orderInfo['goods_sn']?$orderInfo['goods_sn']:'',
			'order_sn'=>$orderInfo['order_sn']?$orderInfo['order_sn']:'',
			'status'=>is_numeric($orderInfo['status'])?$orderInfo['status']:'',
			'add_time'=>$orderInfo['add_time']?$orderInfo['add_time']:'',
			'start_time'=>$orderInfo['start_time']?$orderInfo['start_time']:'',
			'num'=>$num?$num:0,
			'name'=>$orderInfo['name']?$orderInfo['name']:'',
			'adult_num'=>$orderInfo['adult_num']?$orderInfo['adult_num']:0,
			'adultPrice'=>$adultPrice?$adultPrice:0,
			'child_num'=>$orderInfo['child_num']?$orderInfo['child_num']:0,
			'childPrice'=>$childPrice?$childPrice:0,
			'order_amount'=>$orderInfo['order_amount']?$orderInfo['order_amount']:'',
			'contact'=>$orderInfo['contact']?$orderInfo['contact']:'',
			'mobile'=>$orderInfo['mobile']?$orderInfo['mobile']:'',
			'needs_invoice'=>$orderInfo['needs_invoice']?$orderInfo['needs_invoice']:0,
			'invoice_payee'=>$orderInfo['invoice_payee']?$orderInfo['invoice_payee']:'',
			'receive_name'=>$orderInfo['receive_name']?$orderInfo['receive_name']:'',
			'receive_phone'=>$orderInfo['receive_phone']?$orderInfo['receive_phone']:'',
			'receive_address'=>$orderInfo['receive_address']?$orderInfo['receive_address']:'',
			'insuList'=>!empty($orderInfo['insu_info'])?json_decode($orderInfo['insu_info'],true):[],
			'travelList'=>!empty($travelList)?$travelList:[],
			'discount'=>$orderInfo['minus_price']+$orderInfo['discount_price']+$orderInfo['integral_price'],
			'order_type'=>$orderInfo['order_type'],
		];
        //获取活动
        $re = D('Admin/Promotions') -> getName(json_decode($orderInfo['promotions_type'],true));
        if($re[1]){
            $activity[0]['name'] = $re[1];
            $activity[0]['price'] = $orderInfo['minus_price'];
            $activity[0]['discount'] = "";
        }
        if($re[2]){
            $activity[1]['name'] = $re[2];
            $activity[1]['price'] = $orderInfo['discount_price'];
            $activity[1]['discount'] = $orderInfo['discount'];
        }
        if($orderInfo['integral_price']){
            $integral['name'] = '积分抵扣';
            $integral['price'] = $orderInfo['integral_price'];
            $integral['discount'] = "";
            $activity[] = $integral;
        }
        if(empty($activity)){
            $data['activity'] = array();
        }else{
            $data['activity'] =  array_values($activity);
        }

		$this->ajaxReturn($this->result->content($data)->success());
	}

    /**
     * 移动支付
     * @param String  token       token值
     * @param String  type        类型 0为订单，1为充值
     * @param String  order_id    订单id
     * @param String  amount      充值金额
     */
    public function mobilePay(){
        $type = I('post.type',0,'intval');
        //$type = 0;
        $pay_type = 'ALIPAY';
        $thinkpay_config = C('THINK_PAY.common');
        switch($type){
            case 0:
                $order_id = I('post.order_id');
                $order_info = M('Order')->field(true)->where(['order_id'=>$order_id])->find();
                if(empty($order_info)){
                    $this->ajaxReturn($this->result->error('该订单不存在'));
                    exit;
                }elseif($order_info['status']!=0 || $order_info['pay_time']){
					$this->ajaxReturn($this->result->error('该订单已支付！','ERROR'));
					exit;
				}

                //$pay_type = $order_info['pay_type'];
                if($order_info['pay_type'] != 2){
                   // $this->ajaxReturn($this->result->error('支付方式有误'));
                   M('Order')->where(['order_id'=>$order_id])->save(['pay_type'=>2]);
                    //exit;
                }

                $order_id = $order_info['order_id'];
                $order_sn = $order_info['order_sn'];
                $amount = $order_info['order_amount'];
                break;
            case 1:
                $amount = I('post.amount');
                $balance_model = D('Home/Recharge');
                $balance_result = $balance_model->addRecord($amount,$this->user_id,SharedModel::SOURCE_MOBILE);
                if(!$balance_result->isSuccess()){
                    $this->ajaxReturn($this->result->error('支付出错'));
                    return;
                }
                $balance_info = $balance_result->getResult();
                $order_id = $balance_info['order_id'];
                $order_sn = $balance_info['order_sn'];
                break;
            case 2:
                break;
            default:
                $this->ajaxReturn($this->result->error('类型有误'));
                return;
        }

        $thinkpay_config = C('THINK_PAY.common');
        $thinkpay_config['sign_type'] = 'RSA';
        C('THINK_PAY.common',$thinkpay_config);
        $thinkpay = ThinkPay::getInstance($pay_type);
        $thinkpay->setProcess(ThinkPay::PROCESS_PAY)
            ->setMode(ThinkPay::MODE_STRING)
            ->setService('mobile');
        $pay_vo = new PayVo();
        $pay_vo->setFee($amount)
            ->setOrderNo($order_sn)
            ->setOrderId($order_id)
            //->setCallback('Cart/paysuccess?id='.$order_info['order_id'])
            ->setOrderType($type);//订单类型
        $pay_param = $thinkpay->submit($pay_vo);
        $this->ajaxReturn($this->result->content(['data'=>$pay_param])->success());
    }


    /**
     * 微信支付
     * @param String   token      token值
     * @param String   order_id   订单Id
     * @param String   openid     openid
     */
    public function wechatPay(){
        $order_id = I('post.order_id');
        $openid = I('post.openid');
        $trade_type = I('post.tradeType','JSAPI');
        $order_info = M('Order')->field(true)->where(['order_id'=>$order_id])->find();
        if(empty($order_info)){
            $this->ajaxReturn($this->result->error('该订单不存在'));
            exit;
        }elseif($order_info['status']!=0 || $order_info['pay_time']){
			$this->ajaxReturn($this->result->error('该订单已支付！','ERROR'));
			exit;
		}
        /* $wechat_type = 'WEIXIN';
        if(strtoupper($trade_type)!='JSAPI'){
        	$wechat_type .= "#".$trade_type;
        } */
        M('Order')->where(['order_id'=>$order_id])->data(['pay_type'=>3])->save();
        /*$payment_info = D('Admin/Payment')->field(true)->where(['code'=>$order_info['pay_type']])->find();
        if(empty($payment_info)){
            $this->error('没有找到该支付方式');
            return;
        }*/
        $pay_vo = new PayVo();
        $result = $pay_vo->setFee($order_info['order_amount'])
            ->setOrderNo($order_info['order_sn'])
            ->setOrderId($order_info['order_id'])
            ->setOrderType(0)->record();//订单类型
        if($result === false){
            $this->ajaxReturn($this->result->error('添加订单记录失败'));
            exit;
        }

        $subject = $pay_vo->getTitle();
        if(empty($subject)){
            $subject = $pay_vo->getOrderNo();
        }

        $pay = new \Common\Org\Util\WechatPay ();
		// dump($pay->unifiedOrder());exit;
		
        $pay->unifiedParam = array (
            "body" =>$subject,
            "out_trade_no" => $pay_vo->getOrderNo(),
            "total_fee" => $pay_vo->getFee(),
            //"notify_url" => "http://".C('jt_config_web_domain_name')."/index.php/home/pay/wechatpaynotify.html",
            "notify_url" => "http://".C('jt_config_web_domain_name')."/home/pay/wechatpaynotify.html",
            "trade_type" => $trade_type,
            "openid" => $openid
        );

        $returnData = $pay->unifiedOrder();
        if(is_string($returnData)){
        	$returnData = json_decode($pay->unifiedOrder(),true);
        }

        //原生成加密key（若是APP，引入key，加密返回）
        //$returnData = $this->makeSign($trade_type, $returnData);
        if($trade_type == 'APP'){
            $arr = [];
            $arr = [
                'trade_type'    =>  $returnData['trade_type'],
                'appid'         =>  $returnData['appid'],
                'mch_id'        =>  $returnData['mch_id'],
                'nonce_str'     =>  $returnData['nonce_str'],
                'prepay_id'     =>  $returnData['prepay_id'],
                'result_code'   =>  $returnData['result_code'],
                'return_code'   =>  $returnData['return_code'],
                'return_msg'    =>  $returnData['return_msg'],
            ];
            $arr = $this->makeSign($trade_type,$arr);
        }else{
            $arr = $returnData;
        }



        /*if($trade_type == 'APP'){
            require_once (VENDOR_PATH . "WechatPay/WxPay.JsApiPay.php");
            $key = \WxPayConfig::$config['app']['KEY'];

            $signStr = 'appid='.$returnData['appid'].'&noncestr='.$returnData['nonce_str'].'&package=Sign=WXPay&partnerid='.$returnData['mch_id'].'&prepayid='.$returnData['prepay_id'].'&timestamp='.time().'&key='.$key;
            $arr['signStr']   = strtoupper(md5($signStr));
            $arr['timestamp'] = time();
        }*/
        
        $this->ajaxReturn($this->result->content(['data'=>$arr])->success());
    }

    /**
     * 微信充值
     * @param String  token     token值
     * @param String  amount    金额
     * @param String  openid    openid
     */
    public function wechatRecharge(){
        $amount = I('post.amount');
        $openid = I('post.openid');
        $trade_type = I('post.tradeType','JSAPI');
        $balance_model = D('Home/Recharge');
        $balance_result = $balance_model->addRecord($amount,$this->user_id,SharedModel::SOURCE_WEIXIN);
        if(!$balance_result->isSuccess()){
            $this->ajaxReturn($this->result->error('支付出错'));
            return;
        }
        $balance_info = $balance_result->getResult();
        $order_id = $balance_info['order_id'];
        $order_sn = $balance_info['order_sn'];

        /*$payment_info = D('Admin/Payment')->field(true)->where(['code'=>$pay_type])->find();
        if(empty($payment_info)){
            $this->error('没有找到该支付方式');
            return;
        }*/
        $pay_vo = new PayVo();
        $result = $pay_vo->setFee($amount)
            ->setOrderNo($order_sn)
            ->setOrderId($order_id)
            ->setOrderType(1)->record();//订单类型
        if($result === false){
            $this->ajaxReturn($this->result->error('添加订单记录失败'));
            exit;
        }

        $subject = $pay_vo->getTitle();
        if(empty($subject)){
            $subject = $pay_vo->getOrderNo();
        }
        $pay = new \Common\Org\Util\WechatPay ();
        $pay->unifiedParam = array (
            "body" =>$subject,
            "out_trade_no" => $pay_vo->getOrderNo(),
            "total_fee" => $pay_vo->getFee(),
            "notify_url" => U('Pay/wechatPaynotify',[],true,true),
            "trade_type" => $trade_type,
            "openid" => $openid
        );
        $returnData = $pay->unifiedOrder();
        if(is_string($returnData)){
        	$returnData = json_decode($pay->unifiedOrder(),true);
        }
        $returnData = $this->makeSign($trade_type, $returnData);
        $this->ajaxReturn($this->result->content(['data'=>$returnData])->success());
    }
    
    
    public function makeSign($type,$return){
    	/*if(strtoupper($type)=='APP'){
    		require_once (VENDOR_PATH . "WechatPay/WxPay.JsApiPay.php");
    		$key = \WxPayConfig::$config['app']['KEY'];
			// $sign = "appid=" . $return ['appid'] . "&noncestr=" . $return ['nonce_str'] . "&package=Sign=WXPay&partnerid=" . $return ['mch_id'] . "&prepayid=" . $return ['prepay_id'];
			// $sign .= "&timestamp=" . time ()."&key=".$key;
			// $sign = strtoupper(md5($sign));
			// $return['sign'] = $sign;
            $return['key'] = base64_encode('jitujituan'.$key);
			return $return;
    	}*/

        if($type == 'APP'){
            require_once (VENDOR_PATH . "WechatPay/WxPay.JsApiPay.php");
            $key = \WxPayConfig::$config['app']['KEY'];

            $signStr = 'appid='.$return['appid'].'&noncestr='.$return['nonce_str'].'&package=Sign=WXPay&partnerid='.$return['mch_id'].'&prepayid='.$return['prepay_id'].'&timestamp='.time().'&key='.$key;
            $return['signStr']   = strtoupper(md5($signStr));
            $return['timestamp'] = time();
        }

    	return $return;
    }
    
    /**
     *	取消订单
     *  @param  token 		token值
     *  @param  order_id 	订单id
     */
    public function cancel(){
        $order_id = I('post.order_id');
        $result = D('Home/Order')->cancel($order_id);
        $this->ajaxReturn($result);
    }
	
	/**
     *	申请退款
     *  @param  token 		token值
     *  @param  order_id 	订单id
     */
    public function orderRefund(){
		$order_id = I('post.order_id');
		
		$result = D('Home/Order')->doRefund($order_id);
        $this->ajaxReturn($result);
	}

    /*
     *升级会员
     * @param String  token     token值
     * @param String  openid    openid
     * @param String  member_id 会员等级ID
     */
    public function UpgradeMember(){
        $this ->authToken();
        $member_id = I('post.member_id',0,'int');
        $userLevel = M('user')->where(['uid'=> $this -> user_id]) -> getField('member_id');
        if($userLevel == 4 || $userLevel == $member_id || !$member_id || $member_id>=4){
            $this -> ajaxReturn($this -> result -> error('你不能升级该等级'));
        }
       if(!M('member_id') -> where(['type'=>($member_id-1),'del_time'=>['EQ',0]])->find()){
           $this -> ajaxReturn($this -> result -> error('卡号不足'));
       }
        $amount = M('Member') ->where(['member_id' => $member_id]) -> getField('member_price');
        $openid = I('post.openid');
        $trade_type = I('post.tradeType','JSAPI');
        $balance_model = D('Home/UserCardsale');
        $balance_result = $balance_model->addRecord($this->user_id,$member_id);
        if(!$balance_result->isSuccess()){
            $this->ajaxReturn($this->result->error('支付出错'));
            return;
        }
        $balance_info = $balance_result->getResult();
        $order_id = $balance_info['order_id'];
        $order_sn = $balance_info['order_cid'];
        $pay_vo = new PayVo();
        $result = $pay_vo->setFee($amount)
            ->setOrderNo($order_sn)
            ->setOrderId($order_id)
            ->setOrderType(2)->record();//订单类型
        if($result === false){
            $this->ajaxReturn($this->result->error('添加订单记录失败'));
            exit;
        }
        $subject = $pay_vo->getTitle();
        if(empty($subject)){
            $subject = $pay_vo->getOrderNo();
        }
        $pay = new \Common\Org\Util\WechatPay ();
        $pay->unifiedParam = array (
            "body" =>$subject,
            "out_trade_no" => $pay_vo->getOrderNo(),
            "total_fee" => $pay_vo->getFee(),
            //"notify_url" => "http://".C('jt_config_web_domain_name')."/index.php/home/pay/wechatpaynotify.html",
            "notify_url" => "http://".C('jt_config_web_domain_name')."/home/pay/wechatpaynotify.html",
            "trade_type" => $trade_type,
            "openid" => $openid
        );
        $returnData = $pay->unifiedOrder();
       // print_r($returnData);
        //die;
        if(is_string($returnData)){
            $returnData = json_decode($pay->unifiedOrder(),true);
        }
        $returnData = $this->makeSign($trade_type, $returnData);
        $this->ajaxReturn($this->result->content(['data'=>$returnData])->success());

    }
}