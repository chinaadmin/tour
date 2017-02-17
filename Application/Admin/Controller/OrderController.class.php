<?php
	/**
	 * 订单管理
	 * @author qrong
	 * @date 2016-5-9
	 */
	namespace Admin\Controller;
	use Common\Controller\AdminbaseController;
	use Common\Org\ThinkPay\RefundVo;
	use Common\Org\ThinkPay\ThinkPay;
	header('Content-type:text/html;Charset=utf-8');
	class OrderController extends AdminbaseController {
		protected $order_model;
		protected $curent_menu = 'Order/index';
		public function _initialize() {
			parent::_initialize ();
			$this->order_model = D('Admin/Order');
		}

		/**
		 * 订单列表 
		 */
		public function index() {
			$where = array();
			$order_sn = trim(I('order_sn'));
			$name = trim(I('name'));
			$mobile = trim(I('mobile'));
			$add_time1 = trim(I('add_time1'));
			$add_time2 = trim(I('add_time2'));
			$start_time1 = trim(I('start_time1'));
			$start_time2 = trim(I('start_time2'));
			$status = I('status','','int');
			$source = I('source','','int');
			$needs_invoice = I('needs_invoice','','int');

			//后台首页统计来的搜索
			if(I('today')){ 	//今日订单
				$time = strtotime(date('Y-m-d'));
				$ntime = $time+(3600*24);

				$where['add_time']=['between',[$time,$ntime]];
			}
			if(I('yesterday')){		//昨日订单
				$time = strtotime(date('Y-m-d',strtotime("-1 day")));
				$ntime = $time+(3600*24);

				$where['add_time']=['between',[$time,$ntime]];
			}
			if(I('pay_today')){		//今日支付
				$time = strtotime(date('Y-m-d'));
				$ntime = $time+(3600*24);

				$where['pay_time']=['between',[$time,$ntime]];
			}
			if(I('pay_yesterday')){		//昨日支付
				$time = strtotime(date('Y-m-d',strtotime("-1 day")));
				$ntime = $time+(3600*24);

				$where['pay_time']=['between',[$time,$ntime]];
			}
			if(!empty($order_sn)){
				$where['order_sn']=array('LIKE','%'.$order_sn.'%');
			}
			if(!empty($name)){
				$goods_id = M("Goods")->field('goods_id')->where(array('name'=>array('LIKE','%'.$name.'%')))->select();
				$goodsId = array_column($goods_id,'goods_id');
				if($goodsId){
					$where['goods_id']=array('IN',$goodsId);
				}else{
					$where['goods_id']=0;
				}
			}
			// dump($goodsId);exit;
			if(!empty($mobile)){
				// $where['mobile']=array('LIKE','%'.$mobile.'%');
				$uid = M('User')->where(['mobile'=>array('LIKE','%'.$mobile.'%'),'delete_time'=>0])->order('add_time DESC')->getField('uid');
				// $uid = M('User')->where(['mobile'=>array('LIKE','%'.$mobile.'%')])->order('add_time DESC')->getField('uid');

				//用户假删除后的搜索
				$where['uid']=$uid;
			}
			if(!empty($add_time1) && !empty($add_time2)){
				if(strtotime($add_time2)<strtotime($add_time1)){
					$this->error('后面时间应大于前面的搜索时间');
				}elseif(strtotime($add_time2) == strtotime($add_time1)){
					$addTime = strtotime($add_time1);
					$addTime2 = $addTime+86400;
					$where['add_time'] = ['between',[$addTime,$addTime2]];
				}else{
					$addTime = strtotime($add_time1);
					$addTime2 = strtotime($add_time2);
					$where['add_time'] = ['between',[$addTime,$addTime2]];
				}
			}
			if(!empty($start_time1) && !empty($start_time2)){
				if(strtotime($start_time2)<strtotime($start_time2)){
					$this->error('后面时间应大于前面的搜索时间');
				}elseif(strtotime($start_time1) == strtotime($start_time2)){
					$where['start_time'] = strtotime($start_time1);
				}else{
					$s_time1 = strtotime($start_time1);
					$s_time2 = strtotime($start_time2);
					$where['start_time'] = ['between',[$s_time1,$s_time2]];
				}
			}
			if(!empty($add_time1) && empty($add_time2)){
				$add_time=strtotime($add_time1);
				$where['add_time']=array('EGT',$add_time);
			}
			if(!empty($add_time2) && empty($add_time1)){
				$add_time=strtotime($add_time2);
				$where['add_time']=array('ELT',$add_time);
			}
			if(!empty($start_time1) && empty($start_time2)){
				$start_time=strtotime($start_time1);
				$where['start_time']=array('EGT',$start_time);
			}
			if(!empty($start_time2) && empty($start_time1)){
				$start_time=strtotime($start_time2);
				$where['start_time']=array('ELT',$start_time);
			}
			if(is_numeric($status)){
				$where['status']=$status;
			}
			if(is_numeric($source)){
				$where['source']=$source;
			}
			if(is_numeric($needs_invoice)){
				$where['needs_invoice']=$needs_invoice;
			}
			// dump($where);exit;
			if(!empty($where)){
				$lists = $this->getOrderListByOrder($this->order_model,$where);
			}else{
				$lists = $this->getOrderListByOrder($this->order_model,'');
			}
			
			foreach($lists as $k=>$v){
				$lists[$k]['name']=M('Goods')->where(['goods_id'=>$v['goods_id']])->getField('name');
			}
			// dump($lists);exit;
			
			$this->assign('lists',$lists);
			$this->display();
		}
				
		/**
		 * 编辑订单 
		 * @param order_id 订单id
		 */
		public function info(){
			$order_id = I('order_id');
			$orderInfo = D('Admin/Order')->getOrderDetail($order_id);
			$travelList = M('OrderTraveller')->field('traveller_name,paper_name,paper_code,pe_mobile')->where(['order_id'=>$orderInfo['order_id']])->select();
			/*$travelLists = M('OrderTraveller')->
			field('jt_order_traveller.traveller_name,jt_order_traveller.paper_name,jt_order_traveller.paper_code,jt_my_passenger.pe_mobile')->
			where(['jt_order_traveller.order_id'=>$orderInfo['order_id']])->
			join('jt_my_passenger on jt_my_passenger.pe_id = jt_order_traveller.my_passenger_id')->select();*/

			// dump($travelLists);exit;
			$refundInfo = M('Refund')->where(['order_id'=>$order_id])->find();
			$payLog = M('PaymentLog')->field('log_id,status,trade_no')->where(['order_id'=>$order_id])->order('add_time DESC')->find();
			$refundLog = M('WxRefundLog')->field('wx_log_id,handle,transaction_id,wx_refund_id')->where(['refund_id'=>$refundInfo['refund_id']])->order('add_time DESC')->find();
			$orderInfo['num']=$orderInfo['adult_num']+$orderInfo['child_num'];

			$orderInfo['trade_no']=!empty($payLog['trade_no'])?$payLog['trade_no']:$refundLog['transaction_id'];
			// $refundInfo['out_refund_no']=($orderInfo['pay_type'] == 3)?$refundLog['wx_refund_id']:$payLog['trade_no'];
			// $orderInfo['wx_refund_id']=$refundLog['wx_refund_id'];
			$orderInfo['pay_status']=$payLog['status'];
			// var_dump($travelList);exit();
			$this->assign('info',$orderInfo);
//			var_dump($orderInfo);exit;
			$this->assign('refund',$refundInfo);
			$this->assign('list',$travelList);
			$this->display ('orderDetail');
		}
		
		/**
		 *	出行完成
		 *	@param $order_id 订单id
		 */
		public function complete(){
			$order_id = I('order_id',0,'int');
			$order_model = M('Order');
			$where = [
				'order_id'=>$order_id
			];
			$order_info = $order_model->where($where)->field(true)->find();
			if(empty($order_info)){
				return $this->error('该订单不存在');
			}

			switch($order_info['status']){
				case 2:
					return $this->error('该订单已取消');
				case 1:
					break;
				default:
					return $this->error('不允许相关操作');
			}

			$data = [
				'status'=>2
			];

			if($order_model->where($where)->save($data)===false){
				$this->error('操作失败！');
			}else{
				//赠送积分
				D('User/Credits') -> upIntegral($order_id);
				$this->error('操作成功！',U('Order/index'));
			}
		}

		/**
		 *	批量出行完成
		 *	@param $order_id String 订单id
		 */
		public function completeAll(){
			$order_id = I('orderIds');
			if(!empty($order_id)){
				$orderIds = explode(',', $order_id);
			}else{
				$this->ajaxReturn($this->result->error('订单id不能为空！')->toArray());
				exit;
			}

			$order_model = M('Order');
			$where = [
				'order_id'=>['in',$orderIds]
			];
			$order_info = $order_model->where($where)->field('order_id,status')->select();
			if(empty($order_info)){
				$this->ajaxReturn($this->result->error('订单不存在！')->toArray());
				exit;
			}

			foreach($order_info as $k => $v){
				if($v['status']!=1){
					$this->ajaxReturn($this->result->error('选择的订单含有非待出行的订单！')->toArray());
					exit;
				}
			}

			$data = [
				'status'=>2
			];

			if($order_model->where($where)->save($data)===false){
				$this->ajaxReturn($this->result->error('批量出行失败！','ERROR')->toArray());
			}else{
				for($i=0;$i<=count($orderIds);$i++){
					D('User/Credits') -> upIntegral($orderIds[$i]);
				}
				$this->ajaxReturn($this->result->success('批量出行成功！')->toArray());
			}
		}
		/**
		 * 根据不同点击获取不同的排序规则
		 * @param $user_model 用户模型
		 * @param $where 查询条件
		 * @return mixed 按查询条件返回的数组
		 */
		private function getOrderListByOrder($user_model,$where){
			if (!empty(I('get.sort_id'))){
				if (I('get.sort_id') <= 3){
					$id_status = I('get.sort_id') == 2? 1:2;
					$username_status = 6;
					$realname_status = 9;
					$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status,'realname_status'=>$realname_status]);
					return I('get.sort_id') == 2 ? $this->lists($user_model,$where,'order_sn asc'):$this->lists($user_model,$where,'order_sn desc');
				}elseif (I('get.sort_id')<= 6){
					$id_status = 3;
					$username_status = I('get.sort_id') == 5? 4:5;
					$realname_status = 9;
					$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status,'realname_status'=>$realname_status]);
					return I('get.sort_id') == 5 ? $this->lists($user_model,$where,'add_time asc'):$this->lists($user_model,$where,'add_time desc');
				}elseif (I('get.sort_id')<= 9){
					$id_status = 3;
					$username_status = 6;
					$realname_status = I('get.sort_id') == 8? 7:8;
					$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status,'realname_status'=>$realname_status]);
					return I('get.sort_id') == 8 ? $this->lists($user_model,$where,'start_time asc'):$this->lists($user_model,$where,'start_time desc');
				}
			}else{
				$id_status = 3;
				$username_status = 6;
				$realname_status = 9;
				$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status,'realname_status'=>$realname_status]);
				return $this->lists($user_model,$where,"add_time DESC");
			}
		}

		/**
		 * 添加线下订单
		 */
		public function addOfflineOrder()
		{
			$this->display();
		}
		/**
		 * 用户是否存在跳转选择
		 */
		public function selectJump()
		{
			$phone = I('request.mobile');
			$uid = I('request.uid');
			$goodsid = I('request.goodsid');
			$line = M('Goods')->where(['goods_id'=>$goodsid])->find();
			if (!empty($uid)){
				$user = D('user')->where(['uid'=>$uid,'delete_time'=>0])->find();
			}
			if (!empty($phone)){
				$user = D('user')->where(['mobile'=>$phone,'delete_time'=>0])->find();
			}
			if($user){
				$this->assign(['uid'=>$user['uid'],'line'=>$line]);
				$this->display('addline');
//				$this->redirect('Product/index',['uid'=>$user['uid']]);//存在用户
			}else{
				$this->assign(['phone'=>$phone]);
				$this->display('addInitPwd');//不存在用户
			}
		}
		/**
		 * 展示团期
		 */
		public function disStage()
		{
			$uid = I('request.uid');
			$goods_id = I('goods_id',0,'intval');
			if($goods_id){
				$dateList = D("Admin/Product")->getDateList($goods_id);
				/*$advance = M('goods')->where(['goods_id'=>$goods_id])->field('advance')->find();
				$timestamp = strtotime('now')+$advance['advance']*24*3600;
				foreach($dateList as $k => $v){
					if ($timestamp <= $v['date_time']){
						$dateList[$k]['d']=date('d',$v['date_time']);
					}else{
						unset($dateList[$k]);
					}
				}
				foreach ($dateList as $k=>$v){
					$traveltime[] = $v;
				}*/
//				$this->assign('dateList',json_encode($traveltime));			//团期信息列表
				$this->assign('dateList',json_encode($dateList));			//团期信息列表
			}
			$this->assign(['goods_id'=>$goods_id,'uid'=>$uid]);
			$this->display();
		}

		/**
		 * 添加订单信息
		 */
		public function addOrderMsg()
		{
			$kucun = I('request.kucun');
			$goods_id = I('request.goods_id');
			$uid = I('request.uid');
			$outdate = I('request.outdate');
			$this->assign(['goods_id'=>$goods_id,'uid'=>$uid,'outdate'=>$outdate,'kucun'=>$kucun]);
			$this->display();
		}

		/**
		 * 付款信息
		 */
		public function disStageToPay()
		{
			$data = I('post.');
			cookie('orderinformation',json_encode($data));
			$this->display();
		}

		/**
		 * 完善更新订单的付款信息
		 */
		public function upPayStatus()
		{
			$data = I('post.');
			$orderinformation = json_decode(cookie('orderinformation'),true);
			$order_id = $this->addTheOrder($orderinformation);//先插入订单信息，再更改订单状态
			$updata = [
				'status'=>$data['status'],
				'order_amount'=>$data['paynumber'],
				'money_paid'=>$data['paynumber']
			];
			$res = M('Order')->where(['order_id'=>$order_id])->setField($updata);
			D('User/Credits') -> upIntegral($order_id);
			$this->redirect('Order/index');
		}

		/**
		 * 添加入订单
		 * @param $data要添加订单的数据
		 */
		private function addTheOrder($data)
		{
			foreach ($data['travel_name'] as $key => $value){
				$travelList[$key]['travel_name'] = $value;
			}
			foreach ($data['travel_phone'] as $key => $value){
				$travelList[$key]['travel_phone'] = $value;
			}
			foreach ($data['travel_cardid'] as $key => $value){
				$travelList[$key]['travel_cardid'] = $value;
			}
			//有发票先插入发票获取发票id
			if(!empty($data['invoice_payee'])){
				$invoice_data = [
					'invoice_payee' => $data['invoice_payee'],
					'invoice_content' => '吉途旅游发票',
					'receive_name' => $data['receive_name'],
					'receive_address' => $data['receive_address'],
					'receive_phone' => $data['receive_phone'],
				];
				$res = M('Invoice')->add($invoice_data);
			}
			$order_sn = '01' . date('ymdHi',NOW_TIME) . mt_rand(10,99) . mt_rand(100,999);
			$order_data = array(
				'order_sn'=>$order_sn,
				'uid'=>$data['uid'],
				'goods_id'=>$data['goods_id'],
				'insu_id'=>'',
				'insu_info'=>'',
				'adult_price'=>0,
				'adult_num'=>$data['travel_number'],
				'child_price'=>0,
				'child_num'=>0,
				'add_time'=>NOW_TIME,
				'start_time'=>strtotime($data['outdate']),
				'status'=>0,
				'order_amount'=>0,
				'invoice_id'=>$res?$res:0,//发票id
				'needs_invoice'=>$res?1:0,
				'insurance_price'=>0,
				'source'=>5,//5代表订单来自线下
				'contact'=>$data['order_name'],
				'mobile'=>$data['order_phone'],
				'order_type'=>0,
				'integral_price'=>0,
			);
			$order_id = M('Order')->add($order_data);
			$stock = M('GoodsDate')->where(['goods_id'=>$data['goods_id'],'date_time'=>$data['outdate']])->setDec('stock',$data['travel_number']);
			//还剩order_traveller还没插入（旅客人数）;
			$order_travel = array();
			foreach($travelList as $k=>$v){
				$order_travel[$k]['order_id']=$order_id;
				$order_travel[$k]['traveller_name']=$v['travel_name'];
				$order_travel[$k]['paper_name']='身份证';
				$order_travel[$k]['paper_code']=$v['travel_cardid'];
				$order_travel[$k]['pe_mobile']=$v['travel_phone'];
			}
			$travelResult = M('OrderTraveller')->addAll($order_travel);
			return $order_id;
		}
	}
?>