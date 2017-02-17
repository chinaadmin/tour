<?php
/**
 * 订单模型
 * @author cwh
 * @date 2015-05-28
 */
namespace Home\Model;
use Common\Model\HomebaseModel;
use User\Org\Util\Integral;
use User\Org\Util\User;

class OrderModel extends HomebaseModel{

    /**
     * 用户ID
     * @var int
     */
    public $user_id = 0;

    /**
     * 初始化
     * @see Model::_initialize()
     */
    public function _initialize(){
        parent::_initialize();
        $user = User::getInstance ();
        $user_id = $user->isLogin();
        $this->user_id = empty($user_id)?0:$user_id;
    }

    /**
     * 生成订单号
     * @return string
     */
    public function ordersn() {
        return '01' . date('ymdHi',NOW_TIME) . mt_rand(10,99) . mt_rand(100,999);
    }

    /**
     * 格式化状态
     * @param array $info 订单信息
     * @return array
     */
    public function formatStatus(array $info){
        /**
         * 订单状态为：未支付，                 显示:查看详情、立即支付、取消订单
         * 订单状态为：已支付，待确认            显示：查看详情、退款退货
         * 订单状态为：已确认，待收货            显示：查看详情、退款退货，确认收货
         * 订单状态为：已提货，                 显示：查看详情、退款退货，确认收货  （若7天后用户没有进行售后申请，订单状态自动改为已完成）
         * 订单状态为：已取消                  显示：查看详情，删除
         * 订单状态为：已过期 （2天订单没有支付，系统自动取消订单）               显示：查看详情，删除
         *
         *
         * 交易状态就显示：待付款、
         *              已付款，待确认、
         *              已确认，待收货、
         *              已完成、
         *              已取消、
         *              已过期
         *
         * btn_pay 支付按钮
         * btn_cancel 取消按钮
         * btn_receipt 确认收货按钮
         * btn_del 删除订单按钮
         * btn_show 查看详情按钮
         * btn_returns 退款退货按钮
         * btn_logistics 查看物流按钮
         */
        $is_returns = false;//可否退款退货
        $status_name = '';
        $info['btn_show'] = true;
        //订单状态
        switch($info['status']){
            case 0://未确认
                switch($info['pay_status']) {
                    case 0://未付款
                        $status_name = '待付款';
                        $info['btn_pay'] = true;
                        $info['btn_cancel'] = true;
                        break;
                    default:
                        $status_name = '待发货';

                        $is_returns = true;
                        break;
                }
                break;
            case 1://1确认
                //支付状态
                switch($info['pay_status']){
                    case 0://未付款
                        $info['btn_pay'] = true;
                        $info['btn_cancel'] = true;
                        $status_name = '待付款';
                        break;
                    default:
                        $is_returns = true;
                        $status_name = '已发货';
                        $info['btn_logistics'] = true;
                        //配送状态
                        switch($info['shipping_status']){//0未发货,1已发货,2已收货,3退货',
                            case 0://0未发货
                                $info['btn_logistics'] = false;
                                $status_name = '待发货';
                                break;
                            case 1://1已发货
                                $info['btn_receipt'] = true;
                                break;
                            case 2://2已收货
                                $status_name = '已完成';
                                break;
                            case 3://3退货
                                //$is_returns = false;
                                $status_name = '已退货';
                                break;
                            case 4://4发货中
                                $is_returns = false;
                                $status_name = '发货中';
                                break;
                            default:
                                break;
                        }
                        break;
                }
                break;
            case 2://2已取消
                $status_name = '已取消';
                $is_returns = false;
                $info['btn_del'] = true;
                break;
            case 3://3无效
                $status_name = '无效';
                $is_returns = false;
                $info['btn_del'] = true;
                break;
            case 4://4退货
                $status_name = '已退货';
                $is_returns = true;
                $info['btn_del'] = true;
                break;
            case 5://5已过期
                $status_name = '已过期';
                $is_returns = false;
                $info['btn_del'] = true;
                break;
            case 6://6已完成
                $status_name = '已完成';
                if($info['receiving_time']+7*24*60*60<time()) {//超过7天无法退款
                    $is_returns = false;
                }else{
                    $is_returns = true;
                }
                $info['btn_del'] = true;
                break;
        }

        //可否退款退货
        if($is_returns){
            $info['btn_returns'] = true;
        }

        $info['status_name'] = $status_name;
        return $info;
    }

    /**
     * 添加订单
     * @return \Common\Org\Util\Results
     */
    public function addOrder($data = [],$cart_id = []){
        $result = $this->result();
		if(!$data['dateTime'] || !$data['goods_id']){
			return $result->error('线路团期不能为空！','ERROR');
		}
		$goodsInfo = M('Goods')->where(['goods_id'=>$data['goods_id']])->find();
		$date_time = strtotime($data['dateTime']);
		$advanceTime = $goodsInfo['advance']*24*3600;
		$travelNumber = $data['adult_num']+$data['child_num'];
		
		if($date_time < getTTime()){
			return $result->error('选择的团期已过期！','ERROR');
		}elseif(($date_time-$advanceTime) < getTTime()){
			$canBuyDate = getTTime()+$goodsInfo['advance']*24*3600;
			return $result->error('你只能预订'.intval(date('m',$canBuyDate)).'月'.(intval(date('d',$canBuyDate))-1).'号之后的团期！','ERROR');
		}
		$travelList = is_array($data['travellerList'])?$data['travellerList']:json_decode(stripslashes($data['travellerList']),true);
		$insu_id = is_array($data['insu_id'])?$data['insu_id']:json_decode(stripslashes($data['insu_id']),true);
		
		$dateInfo = M('GoodsDate')->where(array('goods_id'=>$data['goods_id'],'date_time'=>$date_time))->find();
		if(empty($dateInfo) || empty($goodsInfo)){
			return $result->error('选择的团期不存在！','ERROR');
		}elseif($dateInfo['stock']==0){
			return $result->error('该团期余票为0，请选择其他团期！','ERROR');
		}elseif(($data['adult_num']+$data['child_num'])==0){
			return $result->error('旅客人数不能为0！','ERROR');
		}elseif(($data['adult_num']+$data['child_num'])>$dateInfo['stock']){
			return $result->error('旅客人数大于团期余票！','ERROR');
		}elseif(($data['adult_num']+$data['child_num'])>10){
			return $result->error('一个订单最多添加10个旅客，请分开下单！','ERROR');
		}elseif($data['child_num']>0 && $goodsInfo['for_child']!=1){
			return $result->error('该团期不支持儿童报名！','ERROR');
		}elseif($travelNumber != count($travelList)){
			return $result->error('旅客信息与旅客人数不符！','ERROR');
		}elseif(empty($data['contact'])){
			return $result->error('订单联系人不能为空','ERROR');
		}elseif(empty($data['mobile']) || !checkMobile($data['mobile'])){
            return $result->error('联系人号码格式错误','ERROR');
        }
		
		$insuranceFee = 0;
		$insurance_id = [];
		$insuJson = [];
		if(!empty($insu_id)){
			$insuInfo = M('Insurance')->where(['id'=>['IN',$insu_id]])->select();
			if(!empty($insuInfo)){
				foreach($insuInfo as $k=>$v){
					$insuranceFee+=($v['costs']*count($travelList));
					$insurance_id[] = $v['id'];
					$insuJson[$k]['name']=$v['name'];
					$insuJson[$k]['num']=count($travelList);
					$insuJson[$k]['price']=$v['costs']*count($travelList);
				}
			}
		}
		$orderAmount = $dateInfo['adult_price']*$data['adult_num']+$dateInfo['child_price']*$data['child_num'];
		
        //用户id
        if(empty($data['uid'])){
            $data['uid'] = $this->user_id;
        }
        if(empty($data['uid'])){
            return $result->error('用户id不能为空');
        }

        $this->startTrans();
		$order_sn   = $this->ordersn();
		$integral_price= 0;
		if($data['integral']){
			//计算积分抵扣
			$integral_price = D('User/Credits') ->reckonInTntegral($data['integral']);
			//扣除积分
			$re = D('User/Credits') -> setOperateType(7) ->setCredits($data['uid'],$data['integral'],'订单'.$order_sn.'预订,积分抵扣',$is_change=1,$credits_type=1,$editor='系统',$data['goods_id']) -> toArray();
			if($re['status'] != 'SUCCESS'){
				$this->rollback();
				return $result->error('添加订单失败');
			}
		}
		$order_data = array();

        $order_data = array(
            'order_sn'=>$order_sn,
            'uid'=>$data['uid'],
            'goods_id'=>$data['goods_id'],
            'insu_id'=>!empty($insurance_id)?json_encode($insurance_id):'',
            'insu_info'=>!empty($insuJson)?json_encode($insuJson):'',
			'adult_price'=>$dateInfo['adult_price'],
			'adult_num'=>$data['adult_num'],
			'child_price'=>$dateInfo['child_price'],
			'child_num'=>$data['child_num'],
			'add_time'=>NOW_TIME,
			'start_time'=>$dateInfo['date_time'],
			'status'=>0,
			'order_amount'=>$orderAmount+$insuranceFee,
			'invoice_id'=>$data['invoice_id']?$data['invoice_id']:'',
			'needs_invoice'=>$data['needs_invoice'],
			'insurance_price'=>$insuranceFee,
			'source'=>$data['source'],
			'contact'=>$data['contact'],
			'mobile'=>$data['mobile'],
			'integral' => $data['integral'],
			'integral_price' =>$integral_price,
        );

		//获取用户优惠活动
		$type = I('post.type');
		if($type){
			$discoun = '';
			$discoun['goods_id'] =  $data['goods_id'];
			$discoun['time']  =  strtotime(I('post.dateTime'));
			$discoun['adult'] =   I('post.adult_num',0,'int');
			$discoun['child'] =   I('post.child_num',0,'int');
			$re = D('Admin/promotions') -> getDiscountPrice($data['uid'],$discoun);
			if($re){
				$types = array_filter(explode(',',$type));

				$discount_price = 0;
				$promotions_type = [];
				//过滤未参加的活动
				foreach ($re as $v){
					if(in_array($v['type'],$types)){
						$promotions_type[] = (string) $v['type'];
						if($v['type']==1){
							$order_data['minus_price'] = floor($v['price']);
						}elseif($v['type']==2){
							$order_data['discount_price'] = floor($v['price']);
							$order_data['discount'] = $v['discount'];
						}
						$discount_price += floor($v['price']);
					}
				}

				$order_data['promotions_type'] = json_encode($promotions_type);

			}
		}
		$order_data['order_amount'] = $order_data['order_amount'] - $discount_price - $integral_price;
		$order_id = $this->add($order_data);

		if($order_id === false){
            $this->rollback();
            return $result->error('添加订单失败');
        }
		
		$order_travel = array();
		foreach($travelList as $k=>$v){
			$mobile = M('MyPassenger')->where(['pe_id'=>$v['pe_id']])->getField("pe_mobile");
			
			$order_travel[$k]['order_id']=$order_id;
			$order_travel[$k]['traveller_name']=$v['travellerName'];
			$order_travel[$k]['paper_name']=$v['documentName'];
			$order_travel[$k]['paper_code']=$v['cardNumber'];
			$order_travel[$k]['pe_mobile']=$mobile;
		}
		$travelResult = M('OrderTraveller')->addAll($order_travel);

		if($travelResult == false){
			$this->rollback();
            return $result->error('添加订单失败');
		}

		//订单提交操作记录
		if ($this->orderAction($order_id, [
				'status' => 0,
			], '提交订单', '您的订单已提交，请尽快完成付款') === false
		){
			$this->rollback();
			return $result->error('添加订单失败');
		}

		$number = $order_data['adult_num']+$order_data['child_num'];
		$stock = M('GoodsDate')->where(['goods_id'=>$order_data['goods_id'],'date_time'=>$order_data['start_time']])->setDec('stock',$number);
		
		if(!$stock){
			$this->rollback();
			return $result->error('添加订单失败');
		}

        $this->commit();
        return $result->content([
            'order_id'=>$order_id,//订单id
        ])->success('添加订单成功');
    }
	
	/**
	 * 订单试图模型
	 */
	public function viewModel($field = array()) {
		$viewFields = array (
			'Order' => array (
				"order_sn",
				"status",
				"add_time",
				"start_time",
				"pay_time",
				"order_amount",
				'_as' => "o",
				'_type' => 'LEFT'
			),
			'Goods' => array (
				"name"=>'goodsName',
				'_as' => "g" ,
				'_on' => 'o.goods_id=g.goods_id',
				'_type' => 'LEFT' 
			),
			'Cate' => array (
				"name",
				'_as' => "c" ,
				'_on' => 'g.cat_id=c.cat_id',
				'_type' => 'LEFT' 
			),
		);
		return $this->dynamicView($viewFields);
	}
	
	/**
	 *	获取订单详情
	 *	@param $where 搜索条件
	 */
	public function getOrderList($where,$page){
		$viewFields = array (
			'Order' => array (
				"order_id",
				"order_sn",
				"status",
				"add_time",
				"start_time",
				"order_amount",
				'adult_num',
				'child_num',
				'_as' => "o",
				'_type' => 'LEFT'
			),
			'Goods' => array (
				"name"=>'goodsName',
				"cover"=>'photo',
				'_as' => "g" ,
				'_on' => 'o.goods_id=g.goods_id',
				'_type' => 'LEFT' 
			),
			'Cate' => array (
				"name",
				'_as' => "c" ,
				'_on' => 'g.cat_id=c.cat_id',
				'_type' => 'LEFT' 
			),
		);
		// return $this->dynamicView($viewFields);
		if(empty($where)){
			return;
		}
		$limits = $this->limits($where,$page);

		return $this->dynamicView($viewFields)->where($where)->order('add_time DESC')->limit($limits,10)->select();
	}

	private function limits($where,$page=1){
		$viewFields = array (
			'Order' => array (
				"order_id",
				"order_sn",
				"status",
				"add_time",
				"start_time",
				"order_amount",
				'adult_num',
				'child_num',
				'_as' => "o",
				'_type' => 'LEFT'
			),
			'Goods' => array (
				"name"=>'goodsName',
				"cover"=>'photo',
				'_as' => "g" ,
				'_on' => 'o.goods_id=g.goods_id',
				'_type' => 'LEFT' 
			),
			'Cate' => array (
				"name",
				'_as' => "c" ,
				'_on' => 'g.cat_id=c.cat_id',
				'_type' => 'LEFT' 
			),
		);

		if((($page-1)*10)<=0){
			return 0;
		}
		$num = $this->dynamicView($viewFields) -> where($where) -> count();
		if(!$num){
			return 0;
		}

		return ($page-1)*10;
	}
	
	/**
	 *	订单详情
	 *	@param order_id 订单id
	 */
	public function getOrderDetail($order_id){
		$viewFields = array (
			'Order' => array (
				"order_id",
				"order_sn",
				"insu_info",
				"goods_id",
				"status",
				"add_time",
				"start_time",
				"order_amount",
				'adult_num',
				'child_num',
				"adult_price",
				"child_price",
				'contact',
				'mobile',
				'needs_invoice',
				'discount_price',
				'minus_price',
				'promotions_type',
				'discount',
				'order_type',
				'integral_price',
				'_as' => "o",
				'_type' => 'LEFT'
			),
			'Goods' => array (
				"name"=>'goodsName',
				"goods_sn",
				'_as' => "g" ,
				'_on' => 'o.goods_id=g.goods_id',
				'_type' => 'LEFT' 
			),
			'Cate' => array (
				"name",
				'_as' => "c" ,
				'_on' => 'g.cat_id=c.cat_id',
				'_type' => 'LEFT' 
			),
			'Invoice' => array (
				"invoice_payee",
				"receive_name",
				"receive_phone",
				"receive_address",
				'_as' => "i" ,
				'_on' => 'o.invoice_id=i.invoice_id',
				'_type' => 'LEFT' 
			),
		);
		
		if(empty($order_id)){
			return;
		}
		return $this->dynamicView($viewFields)->where(['order_id'=>$order_id])->find();
	}
	
	/**
	 *	获取订单信息
	 *	@param String	order_id	订单id
	 */
	public function getPayInfo($order_id){
		$result = $this->result();
		$viewFields = array (
			'Order' => array (
				'order_id',
				'insu_id',
				'insu_info',
				"order_sn",
				"order_amount",
				"money_paid",
				"start_time",
				"adult_num",
				"child_num",
				"invoice_id",
				"needs_invoice",
				'status',
				'contact',
				'mobile',
				'_as'=>'o',
				'_type' => 'LEFT'
			),
			'Goods' => array (
				'goods_sn',
				'name',
				'_as'=>'g',
				'_on' => 'o.goods_id=g.goods_id'
			)
		);
		
		$orderInfo = $this->dynamicView($viewFields)->where(['order_id'=>$order_id])->find();
		
		if($orderInfo['status']>=1){
			return $result->error('该订单已支付');
		}
		
		$travellerInfo = M('OrderTraveller')->field('traveller_name,paper_name,paper_code')->where(['order_id'=>$orderInfo['order_id']])->select();
		
		$travellerList = $travellerInfo?$travellerInfo:array();
		$return_data = array(
			'name'=>$orderInfo['name'],
			'goods_sn'=>$orderInfo['goods_sn'],
			'money_paid'=>$orderInfo['order_amount'],
			'order_sn'=>$orderInfo['order_sn'],
			'start_time'=>$orderInfo['start_time']?date('Y-m-d',$orderInfo['start_time']):'',
			'traveller_num'=>$orderInfo['adult_num']+$orderInfo['child_num'],
			'travellerList'=>$travellerList,
			'contact'=>$orderInfo['contact'],
			'mobile'=>$orderInfo['mobile'],
			'needs_invoice'=>$orderInfo['needs_invoice'],
		);
		
		$infoList = [];
		if(!empty($orderInfo['insu_info'])){
			$insu_info = json_decode($orderInfo['insu_info'],true);
			
			foreach($insu_info as $k=>$v){
				$infoList[$k]['name']=$v['name'];
			}
			
		}
		$return_data['insuList']=$infoList?$infoList:[];
		
		if($orderInfo['needs_invoice']==1){
			$invoice = M('Invoice')->where(['invoice_id'=>$orderInfo['invoice_id']])->find();
			if($invoice){
				$return_data['invoice_payee']=$invoice['invoice_payee'];
				$return_data['receive_name']=$invoice['receive_name'];
				$return_data['receive_phone']=$invoice['receive_phone'];
				$return_data['receive_address']=$invoice['receive_address'];
			}else{
				$return_data['invoice_payee']='';
				$return_data['receive_name']='';
				$return_data['receive_phone']='';
				$return_data['receive_address']='';
			}
		}else{
			$return_data['invoice_payee']='';
			$return_data['receive_name']='';
			$return_data['receive_phone']='';
			$return_data['receive_address']='';
		}
		
		return $result->content($return_data)->success();
	}

    /**
     * 取消订单
     * @param  string $order_id 订单id
     * @return string
     */
    public function cancel($order_id){
        $result = $this->result();
        $order_model = M('Order');
        $where = [
            'order_id'=>$order_id
        ];
        $order_info = $order_model->where($where)->field(true)->find();
        if(empty($order_info)){
            return $result->error('该订单不存在','ERROR');
        }

        switch($order_info['status']){
            case 6:
                return $result->error('该订单已取消','ERROR');
            case 0:
                break;
            default:
                return $result->error('无法取消订单','ERROR');
        }

        $this->startTrans();
		//是否可以退积分
		if($order_info['status'] == 0){
			$credits_model = D('User/Credits');
			$credits_model->setOperateType(8);
			$credits_result = $credits_model->setCredits($order_info['uid'],$order_info['integral'],'订单'.$order_info['order_sn'].'取消,积分返还',0,1,$editor='系统',$order_info['goods_id']);
			if(!$credits_result){
				$this->rollback();
				return $result->error('取消订单失败','ERROR');
			}
		}
        $data = [
            'status'=>6
        ];
        if($order_model->where($where)->data($data)->save()===false){
            $this->rollback();
            return $result->error('取消订单失败','ERROR');
        }

        //添加库存
		$change_num   = $order_info['adult_num']+$order_info['child_num'];
        $change_stock = M('GoodsDate')->where(array('goods_id'=>$order_info['goods_id'],'date_time'=>$order_info['start_time']))->setInc('stock',$change_num);
		if(!$change_stock){
			$this->rollback();
			return $result->error('取消订单失败','ERROR');
		}

        //订单提交操作记录
        if($this->orderAction($order_id,[
                'status'=>6
            ],'取消订单','您已取消订单') === false){
            $this->rollback();
            return $result->error('取消订单失败','ERROR');
        }

        $this->commit();

        return $result->success('取消订单成功');
    }
	
	/**
     * 取消订单
     * @param  string $order_id 订单id
     * @return string
     */
    public function doRefund($order_id){
        $result = $this->result();
        $order_model = M('Order');
        $where = [
            'order_id'=>$order_id
        ];
        $order_info = $order_model->where($where)->field(true)->find();
        if(empty($order_info)){
            return $result->error('该订单不存在','ERROR');
        }

        switch($order_info['status']){
			case 3:
                return $result->error('该订单已申请退款','ERROR');
            case 4:
                return $result->error('退款审核不通过','ERROR');
			case 5:
                return $result->error('退款已完成','ERROR');
            case 1:
                break;
            default:
                return $result->error('无法申请退款','ERROR');
        }

        $this->startTrans();

        $data = [
            'status'=>3
        ];
        if($order_model->where($where)->data($data)->save()===false){
            $this->rollback();
            return $result->error('申请退款失败','ERROR');
        }
		
		$dat = [
			'order_id'=>$order_info['order_id'],
			'goods_id'=>$order_info['goods_id'],
			'refund_uid'=>$order_info['uid'],
			'refund_sn'=>$this->ordersn(),
			'refund_time'=>NOW_TIME,
		];
		
		if(M('Refund')->add($dat)===false){
			$this->rollback();
            return $result->error('退款信息写入失败','ERROR');
		}

        //添加库存
		/* $change_num   = $order_info['adult_num']+$order_info['child_num'];
        $change_stock = M('GoodsDate')->where(array('goods_id'=>$order_info['goods_id'],'date_time'=>$order_info['start_time']))->setInc('stock',$change_num);
		if(!$change_stock){
			$this->rollback();
			return $result->error('取消订单失败','ERROR');
		} */

        //订单提交操作记录
        if($this->orderAction($order_id,[
                'status'=>3
            ],'申请退款','您已申请退款') === false){
            $this->rollback();
            return $result->error('申请退款失败','ERROR');
        }

        $this->commit();

        return $result->success('申请退款成功');
    }

    /**
     * 订单处理
     * @param string $order_id 订单id
     * @param array $action 订单操作
     * @param string $remark 备注
     * @param string $front_remark 前端显示备注
     * @return mixed
     */
    public function orderAction($order_id,$action,$remark,$front_remark){
        return M('OrderAction')->add([
            'order_id'=>$order_id,
            'action'=>json_encode($action),
            'is_seller'=>0,
            'handle'=>$this->user_id,
            'remark'=>$remark,
            'front_remark'=>$front_remark,
            'add_time'=>time()
        ]);
    }

    /**
     * 商品重量
     * @param array $goodsArr
     */
    function getGoodsWeight($goodsArr){
    	$goodsArr = (array)$goodsArr;
    	$weight = D('Admin/Goods')->where(['goods_id' => ['in',$goodsArr]])->sum('weight');
    	return $weight;//单位g
    }
}