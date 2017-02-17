<?php
/**
 * 商品模型
 * @author xiongzw
 * @date 2014-04-14
 */
namespace Admin\Model;
use Common\Model\AdminbaseModel;
class StartPageModel extends AdminbaseModel{
	protected $tableName = "start_page";
	
	public function get_data(){
		$this -> select();
	}
}