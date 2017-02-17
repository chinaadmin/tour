<?php
/**
 * 促销接口
 * @author wxb
 */
namespace Api\Controller;
class PromotionsController extends ApiBaseController
{
    /*
     * 获取会员列表
     */
    public function getPromotions()
    {
        if(I('post.type',0,'int') == 1){
            $in = '1,2,3';
        }else{
            $in = '2,3';
        }

        $re = M('Member')->where(['member_id' => ['in', $in], 'member_state' => 1])->field('member_id,member_name,member_price')->select();
        $this->data($re);

    }

    /*
    * 获取用户可优惠价格
    * @param string $time           出行日期
    * @param string $goods_id       商品ID
    * @param string $child          儿童出行人数量
    * @param string $adult          成人出行数量
    * @param string $token          用户TOKEN
    */
    public function getDiscountPrice()
    {
        $this->authToken();
      /* $data= [
            'time' =>'1467475200',
            'goods_id' =>'3',
            'child' => 1,//1儿童 2成人
            'adult' => 1,//1儿童 2成人
        ];*/
        $data['time'] = strtotime(I('post.time'));
        $data['goods_id'] = I('post.goods_id');
        $data['child'] = I('post.child');
        $data['adult'] = I('post.adult');
        $re = D('Admin/promotions') -> getDiscountPrice($this->user_id,$data);
        $this -> data($re);
    }

    private function data($data)
    {
        if (empty($data)) {
            $arr['data'] = array();
        } else {
            $arr['data'] = array_values($data);
        }
        $this->ajaxReturn($this->result->content($arr)->success());
    }

    /*
     * 支付成功提交用户是否需要实体卡信息接口
     * @param string $cardsale_cid          编号(必填)
     * @param string $card_physical_type    是否需要实体卡  1：需要  2：不需要',（必填）
     * @param string $receive_person        收件人（选填）
     * @param string $phone                 邮寄卡片预留电话（选填）
     * @param string $receive_address       收件地址（选填）
     */
    public function submitData()
    {
        $data = I('post.');
        $preg = '/^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/';
        if (!empty($data['phone'])){
            $data['phone'] = I('post.phone','',$preg);
            if (empty($data['phone'])){
                $this->ajaxReturn($this->result->error('请输入正确的电话号码！'));
            }
        }
        $where['cardsale_cid'] = $data['cardsale_cid'];
        $is_exist_cardId = M('MailcardInformation')->where($where)->find();
        empty($is_exist_cardId)?:$this->ajaxReturn($this->result->error('您卡片的邮寄信息已存在，请勿重复添加！'));
        $res = M('MailcardInformation')->add($data);
        if ($res){
            $this->ajaxReturn($this->result->success('邮寄信息填写成功！'));
        }else{
            $this->ajaxReturn($this->result->error('邮寄信息填写失败，请稍后再试！'));
        }
    }

    /*
     * 查询是否有未发实体卡片
     * @param string $token         用户TOKEN
     */
    public function getCard(){
        $this->authToken();
        $re = $this -> getNumber($this -> user_id);
        if($re){
            $this -> ajaxReturn($this ->result -> success());
        }
        $this->ajaxReturn($this->result->error('抱歉，您没有相关的升级记录！'));
    }

    /*
    * 领取线下实体卡
    * @param string $token                  用户TOKEN
    * @param string $receive_person        收件人
    * @param string $phone                 邮寄卡片预留电话
    * @param string $receive_address       收件地址
    */
    public function submitInfo(){
        $this->authToken();
        $data = I('post.');
        $preg = '/^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/';
        if (!empty($data['phone'])){
            $data['phone'] = I('post.phone','',$preg);
            if (empty($data['phone'])){
               $this->ajaxReturn($this->result->error('请输入正确的电话号码！'));
            }
        }else{
            $this->ajaxReturn($this->result->error('电话号码不能为空！'));
        }
        if(empty($data['receive_address'])){
            $this->ajaxReturn($this->result->error('地址不能为空！'));
        }
        if(empty($data['receive_person'])){
            $this->ajaxReturn($this->result->error('收件人不能为空！'));
        }
       $re = array_values($this -> getNumber($this -> user_id));
        if(!$re){
            $this->ajaxReturn($this->result->error('抱歉，您没有相关的升级记录！'));
        }
        $arr = [];
        unset($data['token']);
        for ($i=0; $i<count($re);$i++){
            $data['cardsale_cid'] = $re[$i];
            $data['card_physical_type'] = 1;
            $arr[$i] = $data;
        }
        M('mailcard_information') -> where(['cardsale_cid'=>['in',$re]])->delete();
        if(M('mailcard_information') -> addAll($arr)){
            $this->ajaxReturn($this->result->success('邮寄信息填写成功！'));
        }else{
            $this->ajaxReturn($this->result->error('邮寄信息填写失败，请稍后再试！'));
        }

    }

    //获取未发的实体卡片
    private function getNumber($uid){

        $info = M('user_cardsale') -> where(['uid' => $uid,"pay_status" => 1]) -> getField('cid',true);
        if(empty($info)){
            return false;
        }
        $data = M('mailcard_information') -> where(['cardsale_cid'=>['in',$info],'card_physical_type'=>['EQ',1]]) ->getField('cardsale_cid',true);
        $re = array_diff($info,$data);
        if($info && empty($data)){
            return $info;
        }
        if(empty($re)){
            return false;
        }
        return $re;
    }
    /*
     * 获取订单缓存
     * @param token   用户token
     */
    public function getSuccess(){
        $this->authToken();
        $info = F($this->user_id.'paying');
        F($this->user_id.'paying',null);
        $this->ajaxReturn($this->result->content(['info'=>$info])->success());
    }

    /*
    * 获取可用积分
    * @param token   用户token
    * @param type    查询类型0：余额 1：积分
    */

    public function availableIntegral()
    {

        $this->authToken();
        $type = I('post.type',1,'int');
        $credits =  D('User/Credits') ->getCredits($this ->user_id,$type);
        $data['credits'] =  $credits?$credits:0;
        if($type == 1){
            $data['deductible'] = M('configs') -> where(['code'=>'deductible'])->getField('value');
        }
        $this->ajaxReturn($this->result->content(['data'=>$data])->success());
    }
}