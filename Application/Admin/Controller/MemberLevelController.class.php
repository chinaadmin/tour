<?php
/**
 * 会员等级管理
 * @author LIU
 * @date 2016/07/12
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class  MemberLevelController extends AdminbaseController{
	
	protected  $curent_menu = 'MemberLevel/index';
	public  function  index(){
		$this -> assign('data',M('member')->select());
		$this -> display();
	}


	public function edit()
	{
		$id = I('get.id');
		$this -> assign('info',M('member')->where(['member_id'=>$id]) ->find());
		$this -> display();
	}

	public function update()
	{
		$where['member_id'] = I('post.member_id');
		$data = I('post.');
		unset($data['member_id']);
		$re = D('Member') ->setData($where,$data);
		$this->ajaxReturn($re->toArray());
	}
	
	/*
	 * 会员卡销售记录
	 */
	public function record(){
		//查询条件，输入数据过滤
		empty(I('get.phone_number','',number_int))?:$where['phone_number'] = ['like','%'.I('get.phone_number','',number_int).'%'];
		if (!empty(I('get.one_number','',number_int))){
			$where['one_number'] = ['like','%'.I('get.one_number','',number_int).'%'];
			$where['upgrade_level'] = 2;
		}
		if (!empty(I('get.family_number','',number_int))){
			$where['family_number'] = ['like','%'.I('get.family_number','',number_int).'%'];
			$where['upgrade_level'] = 3;
		}
		empty(I('get.card_physical_type','',number_int))?:$where['card_physical_type'] = ['like','%'.I('get.card_physical_type','',number_int).'%'];
		$start_time = I('start_time','','trim');
		$end_time = I('end_time','','trim').'23:59:59';
		$start_time = strtotime($start_time);
		$end_time = strtotime($end_time);
		if( ! empty($start_time) && ! empty($end_time)){
			$where['upgrade_time'] = ['between',[$start_time,$end_time]];
		}elseif( ! empty($start_time) && empty($end_time)){
			$where['upgrade_time'] = ['EGT',$start_time];
		}elseif(empty($start_time) && ! empty($end_time)){
			$where['upgrade_time'] = ['ELT',$end_time];
		}
		//选择支付成功的记录
		$where['pay_status'] = 1;
		$this -> curent_menu = 'MemberLevel/record';
		$getCardsaleModel = D('UserCardsale')->getCardsale();
		$lists = $this->getMemberListByOrder($getCardsaleModel,$where,'UserCardsale.upgrade_time desc');

		//查询出所有的会员等级,根据等级编号组合出会员的等级中文表示
		$grade = M('member')->select();
		foreach ($lists as &$item){
			foreach ($grade as $key=>$value){
				if($value['member_id'] == $item['original_level']){
					$item['original_level_name'] = $value['member_name'];
				}
				if($value['member_id'] == $item['upgrade_level']){
					$item['upgrade_level_name'] = $value['member_name'];
				}
			}
		}
//		var_dump($grade);exit;
		$this->assign('lists',$lists);
		$this -> display();
	}
	/**
	 * 根据不同点击获取不同的排序规则
	 * @param $user_model 用户模型
	 * @param $where 查询条件
	 * @return mixed 按查询条件返回的数组
	 */
	private function getMemberListByOrder($user_model,$where){
		if (!empty(I('get.sort_id'))){
			if (I('get.sort_id') <= 3){
				$id_status = I('get.sort_id') == 2? 1:2;
				$username_status = 6;
				$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status]);
				return I('get.sort_id') == 2 ? $this->lists($user_model,$where,'cid asc'):$this->lists($user_model,$where,'cid desc');
			}elseif (I('get.sort_id')<= 6){
				$id_status = 3;
				$username_status = I('get.sort_id') == 5? 4:5;
				$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status]);
				return I('get.sort_id') == 5 ? $this->lists($user_model,$where,'upgrade_time asc'):$this->lists($user_model,$where,'upgrade_time desc');
			}
		}else{
			$id_status = 3;
			$username_status = 6;
			$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status]);
			return $this->lists($user_model,$where,'UserCardsale.upgrade_time desc');
		}
	}

	/**
	 * 导出指定的会员卡销售记录
	 */
	public function exportAppoint()
	{
		set_time_limit(0);
		$heads = $this->setHeads();
		$data_field = $this->setDataField();
		//拼接获取数据的编号查询条件
		$cid = explode ( ",", rtrim ( I ( "request.cid", '' ), "," ) );
		if (empty ( $cid )) {
			$this->error ( "请选择要导出的会员" );
		}
		$where = array (
			"cid" => array (
				'in',
				$cid
			),
			"pay_status" => 1
		);
		$getCardsaleModel = D('UserCardsale')->getCardsaleExcel();
		$lists = $this->lists($getCardsaleModel,$where,'UserCardsale.upgrade_time desc');
		//拼接数据到data数组只取data_field字段
		$data = $this->formateData($lists);
		$excel = new \Admin\Org\Util\ExcelComponent ();
		$excel = $excel->createWorksheet ();
		$excel->head($heads,"Candara","16","30");
		$excel->listData ($data,$data_field);
		$file_name = "CardSaleRecord";
		$excel->output ( $file_name . ".xlsx" );
	}

	/**
	 * 导出全部的会员卡销售记录
	 */
	public function exportAllSale()
	{
		set_time_limit(0);
		$heads = $this->setHeads();
		$data_field = $this->setDataField();
		//选择支付成功的记录
		$where['pay_status'] = 1;
		$lists = D('UserCardsale')->getCardsaleExcel()->where($where)->order('UserCardsale.upgrade_time desc')->limit(1000)->select();
		$data = $this->formateData($lists);
		$excel = new \Admin\Org\Util\ExcelComponent ();
		$excel = $excel->createWorksheet ();
		$excel->head($heads,"Candara","16","30");
		$excel->listData ($data,$data_field);
		$file_name = "CardSaleRecord";		
		$excel->output ( $file_name . ".xls" );
	}
	//设置表格头格式
	protected  function setHeads()
	{
		$heads = [
			'编号',
			'会员手机号',
			'个人VIP卡号',
			'家庭VIP卡号',
			'升级时间',
			'原等级',
			'升级等级',
			'收件人',
			'联系电话',
			'收件地址',
		];
		return $heads;
	}
	//设置表格数据字段
	protected function setDataField()
	{
		$data_field = [
			'cid',
			'phone_number',
			'one_number',
			'family_number',
			'upgrade_time',
			'original_level',
			'upgrade_level',
			'receive_person',
			'phone',
			'receive_address'
		];
		return $data_field;
	}

	/**
	 * @param $data需要格式化处理的数据
	 */
	protected function formateData($lists)
	{
		$grade = M('member')->select();
		foreach ($lists as &$item){
			//只显示升级的卡号
			if ($item['upgrade_level'] == 2)
			{
				unset($item['family_number']);
			}
			else
			{
				unset($item['one_number']);
			}
			//拼接升级等级和原等级为对应的中文表示
			foreach ($grade as $key=>$value){
				if($value['member_id'] == $item['original_level']){
					$item['original_level'] = $value['member_name'];
				}
				if($value['member_id'] == $item['upgrade_level']){
					$item['upgrade_level'] = $value['member_name'];
				}
			}
			//格式化时间
			$item['upgrade_time'] = date('Y-m-d H:i:s',$item['upgrade_time']);

		}
		return $lists;
	}

}