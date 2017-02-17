<?php
/**
 * 分类模型
 * @author qrong
 * @date 2015-5-5
 */
namespace Admin\Model;
use Common\Model\AdminbaseModel;
use Common\Org\Util\Tree;
class RegionModel extends AdminbaseModel{
	protected $tableName = "depart";

	/**
	 * 获取出发地
	 * @param $where 搜索条件
	 * @param $field 字段
	 */
	public function getDepart($field=true,$where=array()){
		// $where['type']=array('lt',2);
		// $where['pid']=0;
		if($where){
			$data =  M('Depart')->field($field)->where($where)->order("depart_id")->select();
		}else{
			$data =  M('Depart')->field($field)->order("depart_id")->select();
		}
		return $data;
	}

	/**
	 * 获取树形分类
	 * @param $field 字段
	 * @return array
	 */
	public function getTree($field=true,$icon=''){
		$data = $this->getDepart($field);
		// return $data;
		$tree = new Tree($data,array(
			'depart_id',
			'pid',
			'name'
		));

		if(!$icon){
			$tree->icon = array(
					'&nbsp;&nbsp;&nbsp;│ ',
					'&nbsp;&nbsp;&nbsp;├─ ',
					'&nbsp;&nbsp;&nbsp;└─ '
			);
		}else{
			$tree->icon = $icon;
		}
		$data = $tree->getArray();
		return $data;
	}

	/**
	 *	删除地址
	 *	@param $id 地址主键id
	 */
	public function delDepart($id){
		$child = M('Depart')->where(['pid'=>$id])->find();
		if($child){
			return $this->result()->error('该类下面包含子类！');
		}

		$res = M('Depart')->where(['depart_id'=>$id])->delete();
		if($res){
	        $redis = D('Common/Redis')->getRedis();
	        $region = $redis->delete('jttravel_region');

			return $this->result()->success();
		}else{
			return $this->result()->error();
		}
	}


	/**
	 *	根据id获取信息
	 *	@param $id 主键id
	 */
	public function getById($id){
		return M('Depart')->where(['depart_id'=>$id])->find();
	}
	
	/**
	 *	根据id获取地址名称
	 *	@param $ids Array 主键id
	 */
	public function getNameById($ids){
		if(empty($ids)){
			return;
		}
		$list = M('Depart')->field('depart_id,pid,name')->where(array('depart_id'=>array('IN',$ids)))->select();
		// return $list;
		$nameList = array();
		$i=0;
		foreach($list as $k=>$v){
			if($v['pid']!=0){
				$nameList[$i]['depart_id']=$v['depart_id'];
				$nameList[$i]['name']=$v['name'];
				$i++;
			}
		}
		return $nameList;
	}

	/**
	 *	根据pid获取地址信息
	 *	@param $pid 父id
	 */
	public function getByPid($pid){
		return M('Depart')->where(['pid'=>$pid])->select();
	}

	/**
	 *	保存地址
	 * 	@param $depart_id 主键id
	 * 	@param $data Array 修改的信息
	 */
	public function saveData($depart_id,$data){
		if(empty($depart_id)){
			return $this->result()->error('主键id不能为空！');
		}
		if(empty($data)){
			return $this->result()->error('修改的数据不能为空！');
		}

		$result = M('Depart')->where(['depart_id'=>$depart_id])->save($data);
		if($result){
			$redis = D('Common/Redis')->getRedis();
	        $region = $redis->delete('jttravel_region');
			
			return $this->result()->success();
		}else{
			return $this->result()->error();
		}
	}

	/**
	 *	添加地址
	 * 	@param $data Array 
	 */
	public function addData($data){
		$result = M('Depart')->add($data);

		if($result){
			$redis = D('Common/Redis')->getRedis();
	        $region = $redis->delete('jttravel_region');
			
			return $this->result()->success();
		}else{
			return $this->result()->error();
		}
	}
}