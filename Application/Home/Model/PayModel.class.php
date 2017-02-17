<?php
/**
 * 支付模型
 * @author cwh
 * @date 2015-05-28
 */
namespace Home\Model;
use Common\Model\HomebaseModel;
class PayModel extends HomebaseModel{

    protected $autoCheckFields = false;

    /**
     * 账户付款
     * @param string $order_id 订单id
     * @return \Common\Org\Util\Results
     */
    public function accountPay($order_id){
        $result = $this->result();
        $this->startTrans();
        $order_model = D('Home/order');
        $order_info = $order_model->where(['order_id'=>$order_id])->find();
        if($order_info['pay_type'] != '1' || (intval($order_info['pay_time'])!=0)){
            $this->rollback();
            return $result->error('支付方式错误');
        }
        $re = M("payment_log")->add([
            'order_id'=>$order_info['order_id'],
            'order_sn' => $order_info['order_sn'],
            'order_amount' => $order_info['order_amount'],
            'order_type'=>0,
            'status' => 1,
            'callback'=>'',
            'update_time' => time(),
            'add_time' => time()
        ]);
        if($re === false){
            $this->rollback();
            $this->ajaxReturn($this->result->error('添加订单记录失败'));
        }

        //需要付款金额为0
        if(empty((float) $order_info['order_amount'])){
            $pay_result = D('Home/Pay')->paying($order_id);
            if(!$pay_result->isSuccess()){
                $this->rollback();
            }
            $this->commit();
            return $pay_result;
        }
        //使用余额
        $credits_model = D('User/Credits');
        $credits_model->setOperateType(4,'ACCOUNT');

        $sql = "LOCK TABLES jt_ WRITE";
        
        $credits_result = $credits_model->setCredits($order_info['uid'], $order_info['order_amount'], '支付订单'.$order_info['order_sn'], 1, 0);
        if (!$credits_result->isSuccess()) {
            $this->rollback();

            $code = $credits_result->getCode();
            switch($code){
                case 'CREDITS_INADEQUATE':
                    $credits_result->error('余额不足',$code);
                    break;
                case 'SET_CREDITS_FAIL':
                    $credits_result->error('扣除余额失败',$code);
                    break;
            }

            return $credits_result;
        }

        $pay_result = D('Home/Pay')->paying($order_id,false);
        if(!$pay_result->isSuccess()){
            $this->rollback();
            return $pay_result;
        }

        $this->commit();
		//if($order_info['shipping_type'] == 0){
			//$order_code = rand_string ( 6, 1 );
			//$res = M("order") -> where(array('order_id'=>$order_info['order_id'])) -> save(array('order_code'=>$order_code));
			//$phone = M("stores") -> where(array('stores_id'=>$order_info['stores_id'])) -> field('name,phone') -> find();
			
			// 发送短信
			/*$where = array(
					"uid"=>$order_info['uid']
			);
			$mobile = M("user")->where($where)->getField("mobile");
			$messageObj = new \Common\Org\Util\MobileMessage ();
			$arr = array(
				'trade_name' =>empty($phone['name'])?"系统:":$phone['name'],
				'code' =>$order_code,
				'stores_tel' =>empty($phone['phone'])?"4007777927":$phone['phone'],
			);*/

			//$mobileResult = $messageObj->sendMessByTel($mobile,$arr,'pk_up_code');
		//}
        return $this->result()->success('支付成功');
    }

    /**
     * 付款
     * @param string $order_id 订单id
     * @param bool $is_start_trans 是否开启事务
     * @return \Common\Org\Util\Results
     */
    public function paying($order_id,$is_start_trans = true){
        $result = $this->result();
        $order_model = D('Home/order');
        $order_info = $order_model->where(['order_id'=>$order_id])->find();
        if($order_info['status']!=0){
        	return $result->success('付款成功');
        }

        $data = [
            'money_paid'=>$order_info['order_amount'],
            'status'=>1,
            'pay_time'=>time()
        ];
        
        if($is_start_trans) {
            $this->startTrans();
        }
        $order_result = D('Home/order')->where(['order_id'=>$order_id])->data($data)->save();
        if($order_result === false){
            if($is_start_trans) {
                $this->rollback();
            }
            return $result->error('付款失败');
        }else{
            //订单提交操作记录
            if($order_model->orderAction($order_id,[ 'status'=>1],'订单付款','您的订单已完成支付') === false){
                if($is_start_trans) {
                    $this->rollback();
                }
                return $result->error('付款失败');
            }

            if($is_start_trans) {
                $this->commit();
            }

            /* // 原下单短信推送
            $mess = new \Common\Org\Util\MobileMessage();
            $arr = [];
            $arr['mobile_code'] = $order_info['order_sn'];*/

            //新短信发送
	        $mess = new \Common\Org\Util\DayuMessage();

	        $goodsInfo  = M('Goods')->field('name,goods_sn')->where(['goods_id'=>$order_info['goods_id']])->find();
	        $mobile     = M('User')->where(['uid'=>$order_info['uid']])->getField('mobile');
            $for_user   = M('OrderSms')->where(['sms_code'=>'for_user'])->find();
            $for_inside = M('OrderSms')->where(['sms_code'=>'for_inside'])->find();
            // $goodsName  = subGoodsName($goodsInfo['name']);

            /*if(strlen($goodsInfo['name'])<=30){
            	$goodsName = $goodsInfo['name'];
            }else{
            	$goodsName = substr($goodsInfo['name'],0,6).'...'.substr($goodsInfo['name'],-12);
            }*/
			if($for_user['status']){
				if(!empty($mobile)){	 	//如果开启，推送给用户
					$u_arr = [
						'start_time'=>(String)date('Y-m-d',$order_info['start_time']),
						'name'=>(String)$goodsInfo['name'],
						'adult_num'=>(String)$order_info['adult_num'],
						'child_num'=>(String)$order_info['child_num'],
						'amount'=>(String)$order_info['order_amount'],
					];

					$user_tmp = M('Template')->where(['pk_temp'=>$for_user['temp_id']])->getField('temp_code');
					$mess->sendMsgByTel($mobile, $u_arr,$user_tmp);
				}
			}
			if($for_inside['status']){		//如果开启，则推送给工作人员
				$inside_arr = [
					'user' => (String)$mobile,
					'name' => (String)$goodsInfo['name'],
					'goods_sn' => (String)$goodsInfo['goods_sn']
				];

				$mobiles = explode(',',$for_inside['mobile']);
				$newMobile = [];
				$inside_tmp = M('Template')->where(['pk_temp'=>$for_inside['temp_id']])->getField('temp_code');
				foreach ($mobiles as $k => $v) {
					if(checkMobile($v)){	//手机格式正确的才发送短信
						$newMobile[]=$v;

						// $mess->sendMsgByTel($v, $inside_arr,$inside_tmp);
					}
				}

				$newMobiles = implode(',',$newMobile);
				$mess->sendMsgByTel($newMobiles, $inside_arr,$inside_tmp);
			}
            return $result->success('付款成功');
        }
    }

}