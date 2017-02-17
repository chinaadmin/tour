<?php
/**
 * 统计报表模型
 * @author xiongzw
 * @date 2015-09-22
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class ReportController extends AdminbaseController{
	/**
	 * @auth 陳董董
	 * @統計下的產品線路
	 */
	public function index(){
		if(I('goods_sn')){
			$where['goods_sn'] = 'goods_sn like \'%'.I('goods_sn').'%\'';
		}
		if(I('name')){
			$where['name'] = 'name like \'%'.I('name').'%\'';
		}
		if(I('depart')){
			$where['depart'] = 'depart like \'%'.I('depart').'%\'';
		}
		if(I('destination')){
			$where['destination'] = 'destination like \'%'.I('destination').'%\'';
		}
		$wheresql = $this->wheresql($where);//获取原生的sql查询条件
		$sql = D('goods')->getSql($wheresql);//拼接带where的sql语句
		$limit = $this->getLimit($sql);//分页
		//根据报名人数已支付和未支付的选择不同进行排序输出
		switch (I('get.sort_id'))
		{
			case 1:
				$unpay_sort_status = 2;
				$pay_sort_status = 6;
				$order = 'order by unpay_num asc';
				$sql = D('goods')->getSql($wheresql,$limit,$order);
				$res = M()->query($sql);//查询数据
				break;
			case 2:
				$unpay_sort_status = 1;
				$pay_sort_status = 6;
				$order = 'order by unpay_num desc';
				$sql = D('goods')->getSql($wheresql,$limit,$order);
				$res = M()->query($sql);//查询数据
				break;
			case 3:
				$unpay_sort_status = 1;
				$pay_sort_status = 6;
				$order = 'order by unpay_num desc';
				$sql = D('goods')->getSql($wheresql,$limit,$order);
//				print_r($sql);exit;
				$res = M()->query($sql);//查询数据
				break;
			case 4:
				$unpay_sort_status = 3;
				$pay_sort_status = 5;
				$order = 'order by pay_num asc';
				$sql = D('goods')->getSql($wheresql,$limit,$order);
				$res = M()->query($sql);//查询数据
				break;
			case 5:
				$unpay_sort_status = 3;
				$pay_sort_status = 4;
				$order = 'order by pay_num desc';
				$sql = D('goods')->getSql($wheresql,$limit,$order);
				$res = M()->query($sql);//查询数据
				break;
			case 6:
				$unpay_sort_status = 3;
				$pay_sort_status = 4;
				$order = 'order by pay_num desc';
				$sql = D('goods')->getSql($wheresql,$limit,$order);
				$res = M()->query($sql);//查询数据
				break;
			default:
				$unpay_sort_status = 3;
				$pay_sort_status = 4;
				$order = 'order by pay_num desc';
				$sql = D('goods')->getSql($wheresql,$limit,$order);
				$res = M()->query($sql);//查询数据
		}
		$pagesize = empty(I('get.pageSize'))? 10:I('get.pageSize');
		$this -> assign(['lists'=>$res,'pay_sort_status'=>$pay_sort_status,'unpay_sort_status'=>$unpay_sort_status,'pageSize'=>$pagesize]);
		$this -> display();
	}

	protected $curent_menu = 'Report/index';

	
	public function info(){
		$where['goods_id'] = I('id');
		$start_time = I('start_time','');
		$end_time = I('end_time','');
		$this -> assign('name',M('goods') -> where($where) -> getField('name'));
		if($start_time && $end_time){
			$arr[] = array('egt',strtotime($start_time));
			$arr[] = array('elt',strtotime($end_time));
			$where['start_time'] = $arr;
		}
		if (I('pay_status') == 0){
			$where['status'] = array('eq',0);
			$state = array('eq',0);
		}else{
			$where['status'] = array('in','1,2');
			$state = array('in','1,2');
		}
		if(!I('id')){
			$this -> redirect('index');
		}
		$order = M('order');
		$re = $this -> lists($order,$where,'start_time desc');
		$order_id = array_column($re,"order_id");
		if(!empty($order_id)){
			$user['order_id'] = array('in',$order_id);
			$user_info = M('order_traveller') ->where($user) ->field('paper_name,paper_code,order_id,traveller_name,pe_mobile') -> select();
			/*$user['jt_order_traveller.order_id'] = array('in',$order_id);
			$user_info = M('order_traveller')->
			field('jt_order_traveller.order_id,jt_order_traveller.traveller_name,jt_order_traveller.paper_name,jt_order_traveller.paper_code,jt_my_passenger.pe_mobile')->
			where($user)->
			join('jt_my_passenger on jt_my_passenger.pe_id = jt_order_traveller.my_passenger_id')->select();*/
			$arr = [];
			foreach ($user_info as $k => $v){
				$arr[$v['order_id']][] = $v;
			}
		}

		$data = "";
		foreach ($re as $k =>$v){
			if(empty($data[$v['start_time']]['num'])){
				$data[$v['start_time']]['num']= $order -> where(['goods_id'=>I('id'),'start_time' =>$v['start_time'],'status'=>$state]) -> sum('child_num')+
												   $order -> where(['goods_id'=>I('id'),'start_time' =>$v['start_time'],'status'=>$state]) -> sum('adult_num');
			}
			$data[$v['start_time']]['start_time'] = $v['start_time'];
			$data[$v['start_time']]['info'][] = $v;
		}
		// dump($arr);exit;
		$this -> assign('list',$data);
		$status = array(
			'未付款',
			'待消费',
			'已完成',
			'待退款',
			'拒绝退款',
			'退款完成',
			'订单取消',
		);
		$this -> assign('start_time',$start_time);
		$this -> assign('end_time',$end_time);
		$this -> assign('id',I('id'));
		$this -> assign('status',$status);
		$this -> assign('user_info',$arr);
		$this -> display();
	}
	
}
