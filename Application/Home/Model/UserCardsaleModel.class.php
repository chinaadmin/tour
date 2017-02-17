<?php
namespace Home\Model;
use Common\Model\HomebaseModel;
use User\Org\Util\User;

class UserCardsaleModel extends HomebaseModel{

    protected $tableName = 'user_cardsale';

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
        mt_srand((double) microtime() * 1000000);
        return 'B'.date('Ymd') . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * 添加记录
     * @param null $uid 用户id
     * @param int $level 升级等级ID
     * @return mixed
     */
    public function addRecord($uid = null,$level){
        //用户id
        if(empty($uid)){
            $data['uid'] = $this->user_id;
        }else{
            $data['uid'] = $uid;
        }
        if(!$level){
            return $this->result()->error('升级失败');
        }
        $user = M('user') -> where(['uid' => $data['uid']])-> Field('member_id,mobile') -> find();
        $orderID = $this->ordersn();
        $data = [
            'uid'=>$uid,
            'upgrade_time' => time(),
            'original_level' => $user['member_id'],
            'upgrade_level' => $level,
            'phone_number' => $user['mobile'],
            'order_cid' => $orderID,
        ];
        $result =  $this->data($data)->add();
        if($result===false){
            return $this->result()->error('升级失败');
        }
        $data['order_id'] = $result;
        return $this->result()->content($data)->success();
    }

    /**
     * 升级
     * @param string $order_id 订单id
     * @param string $journal 流水号
     * @param string $total_fee 支付金额
     * @return \Common\Org\Util\Results
     */
    public function paying($order_id,$journal='',$total_fee=''){
        $result = $this->result();
        $recharge_info = $this->where(['cid'=>$order_id])->field(true)->find();
        if($recharge_info['pay_status']){
            return $result->error('重复支付');
        }
        $this->startTrans();
        $uid = $recharge_info['uid'];

        //升级
        switch ($recharge_info['upgrade_level']){
            case 2;
                if($recharge_info['original_level'] == 3){
                    $data['member_id'] = 4;
                }else{
                    $data['member_id'] = 2;
                }
                $num = D('Admin/member') -> getNumber(2);
                if(!$num){
                    return $result->error('升级失败');
                }
                $data['one_number'] = $num;
                break;
            case 3:
                if($recharge_info['original_level'] == 2){
                    $data['member_id'] = 4;
                }else{
                    $data['member_id'] = 3;
                }
                $num = D('Admin/member') -> getNumber(3);
                if(!$num){
                    return $result->error('升级失败');
                }
                $data['family_number'] = $num;
                break;
        }
        //$credits_model = D('User/User');
        $credits_model = M('User');
        $credits_result =  $credits_model->where(['uid' =>$uid]) -> save($data);
        if (!$credits_result) {
            $this->rollback();
            return $credits_result;
        }

        //充值订单号设置为已支付
        $data['pay_status'] = 1;
        $data['pay_channel'] = 0;
        $data['pay_done_time'] = time();
        $data['journal'] = $journal;
        $data['pay_account'] = $total_fee/100;
        $recharge_result = $this->where(['cid'=>$order_id])->data($data)->save();
        if($recharge_result === false){
            $this->rollback();
            return $result->error('升级失败');
        }
        $this->commit();
        $re['cid'] = $order_id;
        $re['num'] = $num;
        $re['name'] = D('Admin/member') -> getName($data['member_id']);
        $re['names'] = D('Admin/member') -> getName($recharge_info['upgrade_level']);
        F($uid.'paying',$re);
        //用户等级
        return $result->content($re) -> success('升级成功');
    }
}