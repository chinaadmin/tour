<?php
/**
 * 订单状态
 * @author cwh
 */
class OrderStatusTask extends \Think\Controller {

	/**
	 * 返回信息
	 */
	private $message = '';

    /**
     * 任务主体
     * @param int $cronId 任务ID
     * @return bool
     */
    public function run($cronId) {
        $order_model = D('OrderStatus');
        
        //是否有超时未支付
        $has_unpaid = $order_model->isTimeoutUnpaid();

        if (!$has_unpaid){
            $this->message = "执行了订单状态变更计划任务";
            return false;
        }

        //有超时未支付
        if ($has_unpaid){
            if($order_model->cancelUnpaidOrder()===false){
                $this->message = "取消超时未支付的订单,出现失败状况";
                return false;
            }
        }

        G('order_status_end');
        //超过20秒停止运行同步接口（等待下次计划任务执行）
        if(G('cron_begin','order_status_end',2) > 20){
            $this->message = "执行了订单状态变更计划任务";
            return false;
        }

        //递归执行
        $this->run($cronId);
    }

    /**
     * 返回信息
     * @return string
     */
    public function getMessage(){
    	return $this->message;
    }
    
}