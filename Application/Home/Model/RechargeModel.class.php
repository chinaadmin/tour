<?php
namespace Home\Model;
use Common\Model\HomebaseModel;
use User\Org\Util\User;

class RechargeModel extends HomebaseModel{

    protected $tableName = 'account_recharge';

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
     * 生成订单id
     * @return string
     */
    public function orderid() {
       // return uniqueId();
        return date('ymd').mt_rand(1000,9999);
    }

    /**
     * 生成订单号
     * @return string
     */
    public function ordersn() {
        mt_srand((double) microtime() * 1000000);
        return 'B'.date('Ymd') . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * 添加记录
     * @param int $money 金额
     * @param null $uid 用户id
     * @param int $source 来源
     * @return mixed
     */
    public function addRecord($money,$uid = null,$source = 3){
        $data = [
           'order_id'=>$this->orderid(),
            'order_sn'=>$this->ordersn(),
            'money'=>$money,
            'status'=>0,
            'source'=>$source,
            'add_time'=>time()
        ];
        //用户id
        if(empty($uid)){
            $data['uid'] = $this->user_id;
        }else{
            $data['uid'] = $uid;
        }
        $result =  $this->data($data)->add();

        if($result===false){
            return $this->result()->error('充值失败');
        }
        return $this->result()->content($data)->success();
    }

    /**
     * 充值
     * @param string $order_id 订单id
     * @return \Common\Org\Util\Results
     */
    public function paying($order_id){
        $result = $this->result();
        $recharge_info = $this->where(['order_id'=>$order_id])->field(true)->find();
        $this->startTrans();
        $uid = $recharge_info['uid'];

        //余额增加
        $credits_model = D('User/Credits');
        $credits_model->setOperateType(1,'ACCOUNT');
        $credits_result = $credits_model->setCredits($uid, $recharge_info['money'], '充值', 0, 0);
        if (!$credits_result->isSuccess()) {
            $this->rollback();
            return $credits_result;
        }

        //充值订单号设置为已支付
        $recharge_result = $this->where(['order_id'=>$order_id])->data(['status'=>1])->save();
        if($recharge_result === false){
            $this->rollback();
            return $result->error('充值失败');
        }

        /*$user_analysis_model = M('UserAnalysis');

        //用户数据统计
        $analysis_data = [
            'recharge_count'=>['exp','recharge_count + 1'],
            'recharge_money'=>['exp','recharge_money + '.$recharge_info['money']],
        ];
        if($user_analysis_model->where(['uid'=>$uid])->data($analysis_data)->save() === false){
            $this->rollback();
            return $result->error('充值失败');
        }*/
        $this->commit();
        //用户等级
       // D("User/UserGrade")->userGrade($uid,2);
        return $result->success('充值成功');
    }

}