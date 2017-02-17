<?php
/**
 * 旅游分类
 * @author xiongzw
 * @date 2014-04-14
 */
namespace Admin\Model;
use Common\Model\AdminbaseModel;

class FeaturedRoutesModel extends AdminbaseModel{

	protected $tableName = "goods";
	
	public function _initialize(){
		parent::_initialize();
		$this->product_model = D("Admin/Product");
	}
	
	public function getRoutes($where,$field=""){

		$re = $this -> where($where) -> select();
		if($field){
			$arr=[];
			foreach($re as $k=>$v){
				$arr[$v[$field]] = $v;
			}
			return $arr;
		}
		return $re;
	}
	
}