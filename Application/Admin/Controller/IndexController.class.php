<?php
/**
 * 首页逻辑类
 * @author cwh
 * @date 2015-03-30
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class IndexController extends AdminbaseController {

    protected $no_auth_actions = ['index'];
    protected $index_model;
    public function _initialize(){
    	parent::_initialize();
    	$this->index_model = D("Admin/Index");
    }
    /**
     * 后台首页
     */
    public function index(){
        if(empty($this->user['uid'])){
            $this->redirect(C('USER_AUTH_GATEWAY'));
        }
       
    	$data = array(
    			"confirmed" => $this->index_model->ordersStatus(1),              //待出行
    			"send" => $this->index_model->ordersStatus(2),                   //已完成
    			"refund_ped"=>$this->index_model->refundStatus(0),               //待审核
                "refunded" => $this->index_model->refundStatus(1),               //待退款
    			"refund" => $this->index_model->refundStatus(2),                 //待退款
    			"today_order" => $this->index_model->orderDay(1),                //今日订单数
    			"yesterday_order" => $this->index_model->orderDay(2),            //昨日订单数
    			"today_pay" => $this->index_model->orderDay(1,"pay_time"),       //今日支付
    			"yesterday_pay" => $this->index_model->orderDay(2,"pay_time"),   //昨日支付
    			"today_user" => $this->index_model->userCount(),                 //今日注册
    			"yesterday_user" => $this->index_model->userCount(2),            //作日注册
    			"userTotal" => $this->index_model->userCount(3),                 //总会员数
    			"goods"=>$this->index_model->goodsCount(),                       //商品总数
    			"goods_sale"=>$this->index_model->goodsCount(1),                 //上架商品总数
    			"readyToSend"=>'test'//待送货
    	);
        // dump($data);exit;
    	$this->assign($data);
        $this->display();
    }
	private function showStoresList(){
		$this->storesList = D('Stores/Stores')->getStores();
	}
}