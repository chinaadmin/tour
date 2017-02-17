<?php
namespace Api\Controller;
class BaseController extends ApiBaseController {
	
	public function _initialize(){
		parent::_initialize();
		$this->Product = D("Admin/Product");
	}
	
	//首页养生基地
	public function base_index(){

		$data = M('base') ->order("is_sale desc ,sort desc,update_time desc")->where(['is_sale'=>1]) -> field('base_id,base_attr,name,title,s_title,conten_id') ->limit(3) -> select();
		foreach($data as $k =>&$v){
			$v['base_attr'] = $this->Product ->getImg($v['base_attr']);
			$v['conten_id'] = $this->Product ->getImg(json_decode($v['conten_id'],true),true);
		}

		$this -> data($data);
	}
	
	/**
	 *	更多养生基地
	 *	@param  page 分页
	 *	@return Array 
	 */
	public function more_base(){
		$page = I('post.page',1,'int');
		$limit = $this -> limits($page);
		$data = M('base') ->where(['is_sale'=>1]) -> field('base_id,base_attr,name,title,s_title,conten_id') ->order("is_sale desc ,sort desc,update_time desc")-> limit($limit*10,10) -> select(); 
		foreach($data as $k =>&$v){
			$v['base_attr'] = $this->Product ->getImg($v['base_attr']);
			$v['conten_id'] = $this->Product ->getImg(json_decode($v['conten_id'],true),true);
		}
		$this -> data($data);
	}
	
	
	/**
	 *	养生基地详情
	 *	@param  base_id 分类ID
	 *	@return Array 
	 */
	public function base_info(){
		$base_id = I('post.base_id','');
		
		if(!$base_id){
			$data=array();
			$this ->ajaxReturn($this ->result->content(['data'=>$data])->success());
		}
		$product_model = D("Admin/Product");
		$data = M('base') ->order("is_sale desc ,sort desc,update_time desc")->where(['base_id'=>$base_id]) -> field('base_id,base_attr,conten_id') -> find(); 
		if(empty($data)){
			$data=array();
			$this ->ajaxReturn($this ->result->content(['data'=>$data])->success());
		}
		$data['base_attr'] = $this->Product ->getImg($data['base_attr']);
		$data['conten_id'] = $this->Product ->getImg(json_decode($data['conten_id'],true),true);
		$goods_id = json_decode(M('base_goods')-> where(['base_id' => $base_id]) ->getfield('goods_id'),true);
		if($goods_id){
			$where['goods_id'] = array('in',$goods_id);
			$list = $product_model-> wheres($where)->formatData();
		}
		$data['goods'] =  $list?$list:array();
		$this -> data($data);
	}
	
	public function data($data){
		if(empty($data)){
			$data = array();
		}
		
		$this ->ajaxReturn($this ->result->content(['data'=>$data])->success());
	}
	
	private function limits($page=1){
		if((($page-1)*10)<=0){
			return 0;
		}
		$num = M('base') -> count();
		if(!$num){
			return 0;
		}

		return ($page-1)*10;
	}
	
	
}