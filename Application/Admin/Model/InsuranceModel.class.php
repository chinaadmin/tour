<?php
/**
 * 保险信息模型
 * @author qrong
 * @date 2016-04-29
 */
namespace Admin\Model;
use Common\Model\AdminbaseModel;
class InsuranceModel extends AdminbaseModel{
	protected $tableName = "insurance";
	
	/**
	 * 获取保险信息
	 * string $id 主键id
	*/
	public function getInfo($id){
		return $this->where(['id'=>$id])->find();
	}

	/**
	 * 删除信息
	 * @param array|string $id 主键id
	 */
	public function del($id){
		$where = array();
		if(empty($id)){
			return $this->result()->error("请选择要删除的保险信息！");
		}
		if(is_array($id)){
			$where = array(
				"id"=>array('in',$id)
			);
		}else{
			$where = array(
				"id"=>$id
			);
		}
		

		//删除标签商品关联
		$return = $this->where($where)->delete();
		if($return!==false){
			return $this->result()->success();
		}else{
			return $this->result()->error();
		}
	}
}