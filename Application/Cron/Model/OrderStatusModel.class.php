<?php
/**
 * 订单状态模型
 */
namespace Cron\Model;
use Common\Model\BaseModel;
class OrderStatusModel extends BaseModel {

    protected $autoCheckFields = false;

    /**
     * 付款过期时间按小时算
     * @var int
     */
    public $pay_timeout = 24;

    /**
     * 获取付款过期时间
     * @return int
     */
    public function getPayTimeout(){
        return  $this->pay_timeout*60*60;
    }

    /**
     * 获取是否有超时未支付订单
     * @return bool
     */
    public function isTimeoutUnpaid(){
        $order_id = M('Order')->where([
            'status'=>0,
            'add_time'=>[
                'lt',time() - $this->getPayTimeout()
            ]
        ])->getField('order_id');
        return empty($order_id)?false:true;
    }

    /**
     * 取消超时未支付的订单
     * @param int $limit 数量
     * @return bool
     */
    public function cancelUnpaidOrder($limit = 10){
        $order_lists = M('Order')->field(true)->where([
            'status'=>0,
            'add_time'=>[
                'lt',time() - $this->getPayTimeout()
            ]
        ])->limit($limit)->select();

        $order_ids = array_column($order_lists,'order_id');
        $this->startTrans();

        //修改订单状态为已取消
        if(M('Order')->where([
            'order_id'=>['in',$order_ids]
        ])->data([
            'status'=>6
        ])->save() === false){
            $this->rollback();
            return false;
        }

        //添加库存
        foreach($order_lists as $k => $v){
            $num = $v['adult_num']+$v['child_num'];
            $gd_id = M('GoodsDate')->where(['goods_id'=>$v['goods_id'],'date_time'=>$v['start_time']])->getField('gd_id');
            if($gd_id){
				$changs_stock = D('Admin/Goods')->changeStock($gd_id,$num);
				if(!$changs_stock->isSuccess()){
					$this->rollback();
					return false;
				}
            }
        }

        //订单提交操作记录
        if($this->orderAction($order_ids,[
                'status'=>6
            ],$this->pay_timeout.'小时内未进行支付，订单已自动取消','您在'.$this->pay_timeout.'小时内未进行支付，订单已自动取消') === false){
            $this->rollback();
            return false;
        }

        $this->commit();
        return true;
    }

    /**
     * 订单处理
     * @param string $order_ids 订单id
     * @param array $action 订单操作
     * @param string $remark 备注
     * @param string $front_remark 前端显示备注
     * @return mixed
     */
    public function orderAction($order_ids,$action,$remark,$front_remark){
        $data_all = [];
        $data = [
            'action'=>json_encode($action),
            'is_seller'=>2,
            'handle'=>'',
            'remark'=>$remark,
            'front_remark'=>$front_remark,
            'add_time'=>time()
        ];
        foreach($order_ids as $v){
            $data['order_id'] = $v;
            $data_all[] = $data;
        }
        return M('OrderAction')->addAll($data_all);
    }

}