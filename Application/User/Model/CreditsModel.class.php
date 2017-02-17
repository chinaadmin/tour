<?php
/**
 * 用户积分模型类
 * @author cwh
 * @date 2015-05-05
 */
namespace User\Model;
use Common\Model\BaseModel;
use User\Org\Util\User;

class CreditsModel extends BaseModel{

    protected $tableName = 'account_credits';
    public $getData="";
    private $operate_type_param = [
        'operate'=>0,
        'pay'=>'ACCOUNT'
    ];

    private $type = [
        0=>[
            'name'=>'金额',//名称
            'unit'=>'元',//单位
        ],
        1=>[
            'name'=>'积分',
            'unit'=>'分'
        ],
        2=>[
            'name'=>'不可提现金额',
            'unit'=>'元'
        ]
    ];

    /**
     * 获取积分类型
     * @param int|null $type_id 类型id
     * @return array
     */
    public function getType($type_id = null){
        if(is_null($type_id)){
            return $this->type;
        }
        return $this->type[$type_id];
    }

    private $operate_type = [
        0=>'其他类型',
        1=>'线上充值',
        2=>'提现',
        3=>'系统调整',
        4=>'订单支付',
        5=>'退款',
        6=>'活动中奖',
        7=>'旅游消费',
        8=>'订单取消'
    ];

    /**
     * 获取操作类型
     * @param int|null $type_id 类型id
     * @return array
     */
    public function getOperateType($type_id = null){
        if(is_null($type_id)){
            return $this->operate_type;
        }
        return $this->operate_type[$type_id];
    }

    /**
     * 初始化积分账户
     * @param string $uid 用户id
     * @return \Common\Org\Util\Results
     */
    public function initAccountCredits($uid){
        $all_data = [];
        $types = $this->getType();
        $data = [
            'uid'=>$uid,
            'credits'=>0
        ];
        foreach($types as $key=>$val){
            $data['type'] = $key;
            $all_data[] = $data;
        }
        return $this->addAll($all_data)===false?$this->result()->error('初始化积分账户失败'):$this->result()->success();
    }

    /**
     * 注销积分账户
     * @param string $uid 用户id
     * @return \Common\Org\Util\Results
     */
    public function destroyAccountCredits($uid){
        return $this->where(['uid'=>$uid])->delete()===false?$this->result()->error('注销积分账户失败'):$this->result()->success();
    }

    /**
     * 获取账户积分
     * @param string $uid 用户id
     * @param null $type 积分类型
     * @return array|double
     */
    public function getCredits($uid,$type = null){
        $where = [
            'uid'=>$uid
        ];
        if(!is_null($type)){
            $where['type'] = $type;
        }
        $credits = $this->where($where)->field(['type','credits'])->select();
        if(count($credits)>1){
            return array_column($credits,'credits','type');
        }
        return current($credits)['credits'];
    }

    /**
     * 操作类型
     * @param int $operate_type 类型:0为其他类型,1为充值,2为提现,3为管理员调节,4为订单支付,5为退款,6为活动中奖
     * @param string $pay_type 支付方式
     * @return $this
     */
    public function setOperateType($operate_type,$pay_type='ACCOUNT'){
        $this->operate_type_param = [
            'operate'=>$operate_type,
            'pay'=>$pay_type
        ];
        return $this;
    }

    /**
     * 改变会员金额
     * @param int $uid 会员ID
     * @param double $credits 积分
     * @param string $desc 备注
     * @param int $is_change 增减:0为增,1为减
     * @param int $credits_type 积分类型:0为金额,1为积分,2为不可提现金额
     * @param string $editor 操作人
     * @return int -1为金额不足,0操作失败,1操作成功
     */
    public function setCredits($uid,$credits,$desc='',$is_change=0,$credits_type=0,$editor='系统',$goods_id=""){
        $result = $this->result();
        if(empty($credits)){
            return $result->success();
        }

        $cur_credits = $this->getCredits($uid,$credits_type);

        $where = [
            'uid'=>$uid,
            'type'=>$credits_type
        ];
        $balance = 0;//余额
        $credits_result = true;
        $operate_type = $this->operate_type_param['operate'];
        switch($operate_type){
            case 4://订单支付
            case 5://退款
                $balance = $cur_credits;
                break;
            case 3://管理员调节
                $user = User::getInstance ();
                $user_info = $user->getUser();
                $editor =  $user_info['username'].'::'.$user_info['uid'];
                break;
            default://账号支付的
                break;
        }

        if($this->operate_type_param['pay'] == 'ACCOUNT') {
            if ($is_change == 1) {
                if ($cur_credits < $credits ) {
                    if($credits_type ==1){
                        return $result->set('CREDITS_INADEQUATE');
                    }else{
                        return $result->set('PRICE_INADEQUATE');
                    }

                }
                $credits_result = $this->where($where)->setDec('credits', $credits);
                $balance = $cur_credits - $credits;
            } else {
                $credits_result = $this->where($where)->setInc('credits', $credits);
                $balance = $cur_credits + $credits;
            }
        }

        $log_result = true;
        if($credits_result!=false) {
            $log_result = M('AccountLog')->add([
                'uid' => $uid,
                'credits' => $is_change == 1 ? -$credits : $credits,
                'credits_type' => $credits_type,
                'balance' => $balance,
                'remark' => $desc,
                'type' => $operate_type,
                'pay_type' => $this->operate_type_param['pay'],
                'add_time' => NOW_TIME,
                'editor' => $editor,
                'fk_goods_id' => $goods_id,
            ]);
        }

        if($credits_result==false||$log_result==false){
            return $result->set('SET_CREDITS_FAIL');
        }else{
            $this->where($where)->save(['up_time' => NOW_TIME]);
            return $result->success();
        }
    }

    /**
     * 获取记录试图
     * @param int|array $queryView 试图
     * @return array
     */
    public function getLogView($queryView = null){
        if(is_null($queryView)) {
            $queryView = [
                'user' => [
                    'mobile',
                    'aliasname'
                ],
                'account_log' => [
                    'log_id',
                    'uid',
                    'credits',
                    'credits_type',
                    'balance',
                    'type',
                    'remark',
                    'editor',
                    'add_time',
                    '_type'=>'LEFT',
                    '_on' => 'user.uid = account_log.uid',
                ],
                'goods'=>[
                    'name'=>'goods_name',
                    '_on' =>'account_log.fk_goods_id = goods.goods_id',

                ]
            ];
        }
        return $this->dynamicView($queryView);
    }

    /**
     * 获取积分，余额视图
     * @param int|array $queryView 试图
     * @return array
     */
    public function getView(){
            $queryView = [
                'user' => [
                    'uid',
                    'mobile',
                ],
                'account_credits' => [
                    'credits',
                    'up_time',
                    '_on' => 'user.uid = account_credits.uid',
                ]
            ];
        return $this->dynamicView($queryView);
    }

    /**
     * 获取积分，余额列表
     * @param  $where string 查询条件
     * @param  $page int    分页
     * @return object
     */
    public function getIntegral($where,$page){
        $this ->getData =  $this -> getLogView() -> where($where) -> order('add_time desc')-> page($page,10) ->select();
        $next = $this -> getLogView() -> where($where)  ->count()-(10*$page);
        $this ->getData['next'] = $next>0?1:0;
        return $this;
    }

    public function formatDatas($getData=""){
        $data = empty($getData)?$this -> getData:$getData;
        unset($data['next']);
        $re['data'] = array_map(function ($arr){
            $arrs['credits'] = $arr['credits'];
            $arrs['add_time'] = empty($arr['add_time'])?'':date('Y-m-d H:i:s',$arr['add_time']);
            $arrs['type'] = $this -> operate_type[$arr['type']];
            $arrs['remark'] = $arr['type'] == 7?$arr['goods_name']: $arr['remark'];
            $arrs['balance'] = $arr['balance'];
            return $arrs;
        },$data);
        $re['next'] = $this ->getData['next'];
        return $re;
    }

    /**
     * 赠送积分
     * @param int|array $queryView 试图
     * @return array
     */
    public function upIntegral($orderID){
        $money_paid = M('order') -> where(['order_id'=>$orderID]) -> field('money_paid,uid,goods_id,order_sn')->find();
        $consumption = M('configs') -> where(['code'=>'consumption_integral'])->getField('value');
        $credits = (int) ($money_paid['money_paid']/$consumption);
        return $this ->setOperateType(7) ->setCredits($money_paid['uid'],$credits,'订单'.$money_paid['order_sn'].'完成,积分赠送',$is_change=0,$credits_type=1,$editor='系统',$money_paid['goods_id']);
    }
    /**
     * 计算积分抵扣
     * @param  int $integral  积分
     * @return string
     */
    public function reckonInTntegral($integral=0){
        if (!$integral){
            return 0;
        }
        $deductible = M('configs') -> where(['code'=>'deductible'])->getField('value');
        return (int) ($integral / $deductible);
    }
}