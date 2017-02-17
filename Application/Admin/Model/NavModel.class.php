<?php
/**
 * 导航管理模型
 * @author qrong
 * @date 2015-5-3
 */
namespace Admin\Model;
use Common\Model\AdminbaseModel;
class NavModel extends AdminbaseModel{
	/**
	 * 根据导航id获取数据
	 * @param  $nav_id 导航id
	 * @param string $field
	 * @return array
	 */
	public function getById($nav_id,$field=true){
		$where = array(
			'nav_id'=>$nav_id
		);
		return $this->field($field)->where($where)->find();
	}

	/**
	 * 删除导航
	 * @param array $nav_id 导航id
	 */
	public function delNav($nav_id){
		if(empty($nav_id)){
			return $this->result()->error("请选择要删除的导航！");
		}
		$where = array(
			"nav_id"=>array('in',$nav_id)
		);

		$return_tag = $this->where($where)->delete();
		if($return_tag!==false){
			return $this->result()->success();
		}else{
			return $this->result()->error();
		}
	}

	/**
	 * 幻灯片banner
	 */
	public function banner($field=true){
		$navList = M('Nav')->field('name,cat_id,nav_attr as photo')->where(['status'=>1])->order('sort ASC,add_time DESC')->limit(3)->select();
		$attr_ids = array_column($navList,'photo');
		$attach = D('Upload/AttachMent')->getAttach($attr_ids);
		// $attach = M('Attachment')->where(array('att_id'=>array('IN',$attr_ids)))->select();
		
		$attr_ids = array_column($attach,'path',"att_id");
		return array_map(function($data) use($attr_ids){
			$data['photo'] = $attr_ids[$data['photo']];
			return $data;
		},$navList);
	}
}