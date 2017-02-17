<?php
/**
 * 促销逻辑类
 * @author cwh
 * @date 2015-08-11
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
use Org\Util\Date;

class PromotionsController extends AdminbaseController {

    protected $curent_menu = 'Promotions/index';

    /**
     * 下单立减
     */
    public function index(){
        $data = M('promotions') -> where(['promotions_type'=>1])->find();
        $this -> assign('info',$data);
		$this -> display();
    }

    /**
     * 第三人打折
     */
    public function discount()
    {
        $this -> curent_menu = 'Promotions/discount';
        $data = M('promotions') -> where(['promotions_type'=>2])->find();
        $price = M('promotions_price') -> where(['fk_id'=>$data['promotions_id']])->select();
        $this -> assign('info',$data);
        $this -> assign('num',count($price));
        $this -> assign('price',$price);
        $this -> display();
    }
    
    public function update()
    {
        $id = I('post.id','');
        $data= [
            'promotions_name' => I('post.promotions_name'),
            'start_time' => empty(I('post.start_time',''))?'':strtotime(I('post.start_time')),
            'end_time' => empty(I('post.end_time',''))?'':strtotime(I('post.end_time')),
            'ordinary_price' => I('post.ordinary_price'),
            'one_price' => I('post.one_price'),
            'family_price' => I('post.family_price'),
            'ordinary_state' => empty(I('post.ordinary_state'))?2:1,
            'one_state' => empty(I('post.one_state'))?2:1,
            'family_state' => empty(I('post.family_state'))?2:1,
            'travel' => I('post.travel'),
            'promotions_type' => I('post.promotions_type'),
            'number' => I('post.number'),
            'state' => I('post.state'),
        ];
        $promotions = D('Admin/promotions');
        if($id){
            $result =  $promotions -> setData(['promotions_id' => $id],$data);
            $re_type = false;
        }else{
            $result = $promotions  -> addData($data);
            $re_type = true;
            $id = $result->getResult();
        }
        if( $data['promotions_type'] == 2 && ($result ->getCode() != 'UNKNOWN_ERROR')){
            //if($result ->getCode() == 'SUCCESS' || ($result ->getCode() == 'UNKNOWN_ERROR')){

           // }
            if(($re_type && $result -> isSuccess()) || !$re_type){
                $result =  $this -> goodsPrice($id);
            }

        }
        $this -> ajaxReturn($result ->toArray());
    }

    /*
     * 更新第三人折扣价格
     */
    public function goodsPrice($id){
        $minPrice = I('post.min_price');
        $manPrice = I('post.man_price');
        $discount = I('post.discount');
        $data = [];
        $min_price = -1;
        M('promotions_price') ->where(['fk_id' => $id]) -> delete();
        for($i=0;$i<count($minPrice);$i++){
            $data[$i]['min_price'] =  $minPrice[$i];
            $data[$i]['man_price'] =  $manPrice[$i];
            $data[$i]['discount']  =  $discount[$i];
            $data[$i]['fk_id']  =  $id;
            $data[$i]['type']  =  2;
            if($data[$i]['min_price'] >= $data[$i]['man_price'] || $min_price>=$data[$i]['min_price']){
                return $this->result->set('error','促销价格填写有误');
            }
            $min_price = $data[$i]['man_price'];
        }
        return $this -> result -> content(M('promotions_price') ->addAll($data))->success('添加成功');
    }
}
