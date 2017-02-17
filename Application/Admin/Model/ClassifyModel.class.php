<?php
/**
 * 旅游分类
 * @author xiongzw
 * @date 2014-04-14
 */
namespace Admin\Model;
//use Common\Model\AdminbaseModel;
use Think\Model\RelationModel;
//class ClassifyModel extends AdminbaseModel{
class ClassifyModel extends RelationModel{
	protected $tableName = "Classify";
	
	 protected $_link = [
   			'Setplace' => [
   					'mapping_type'  => \Think\Model\RelationModel::HAS_MANY,
   					'class_name'    => 'Setplace',
   					'foreign_key'   => 'fk_classify_id',
   					'mapping_name'  => 'setplace',
					'parent_key'   => 'place_id',
					'condition'   => 'place_state = 1',
					'mapping_order' => 'place_sort desc',
					'mapping_fields' => 'place_name,place_url,fk_attr_id,place_keyword',
   			], 

	 	];
	
	
	public function classify_info($where=""){
		$data = $this ->where($where) -> select();
		$arr ="";
		foreach($data as $k => $v){
			$arr[$v['classify_id']] = $v['classify_name'];
		}
		return $arr;
	}
	
	public function classify_all($where=""){
		$data = $this ->where($where) -> select();
		$arr ="";
		foreach($data as $k => $v){
			$arr[$v['classify_id']] = $v;
		}
		return $arr;
	}
	
	public function all(){
		$freight_template = $this ->relation(true)->where($where)->field('classify_name,classify_id')->order('classify_sort desc') -> select();
		$arr = '';
		$img = M('attachment');
		foreach($freight_template as $k => &$v){
			if(empty($v['setplace'])){
				/* $v['setplace'][0]['place_name'] = '';
				$v['setplace'][0]['place_url']  = '';
				$v['setplace'][0]['img_url']  = ''; */
				unset($freight_template[$k]);
				//$v = "";
				//print_r($v);
			}else{
				foreach($v['setplace'] as $key => $val){
					if($val['fk_attr_id']){
						$img_nfo = $img ->where(['att_id' => $val['fk_attr_id']]) ->  find();
						$v['setplace'][$key]['img_url'] = 'http://'.$_SERVER['HTTP_HOST'].$img_nfo['path']."/".$img_nfo['name'].".".$img_nfo['ext'];
						
					}else{
						$v['setplace'][$key]['img_url'] = "";
					}
					unset($v['setplace'][$key]['fk_attr_id']);
				}
			}
		}
		sort($freight_template);
		//print_r($freight_template);
		//die;
		return $freight_template;
	}
}