<?php
/**
 * 热门目的地设置
 * @author LIU
 * @date 2015/5/22
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class  SetPlaceController extends AdminbaseController{
	
	protected  $curent_menu = 'SetPlace/index';
	public  function  index(){
		$setplace = M('setplace');
		$where = [];
		$status = I('place_state','','trim');
		if(I('place_id','','trim')){
        	
        	$where['place_id'] = I('place_id','','trim');
        }
        if(I('place_name')){
        	$where['place_name'] = array('like','%'.I('place_name').'%');
        }
		if(I('fk_classify_id')){
			$where['fk_classify_id'] = I('fk_classify_id');
		}
		if(is_numeric($status)){
			$where['place_state'] = $status;
		}
		
		$lists = $this->lists($setplace,$where,'place_state asc,place_time desc');
		$img = M('attachment');
		foreach($lists as &$v){
			if($v['fk_attr_id']){
				$img_nfo = $img ->where(['att_id' => $v['fk_attr_id']]) ->  find();
				$v['img_url'] = 'http://'.$_SERVER['HTTP_HOST'].$img_nfo['path']."/".$img_nfo['name'].".".$img_nfo['ext'];
			}
		}
		//获取分类
		$this -> assign('category',D('Classify') -> classify_info());
		$this -> assign('category_all',D('Classify') -> classify_all());
		$this -> assign('lists',$lists);
		$this -> display();
	}
	
	public function edit(){
		$setplace = M('setplace');
		$this -> assign('category',D('Classify') -> classify_all());
		if(I('id')){
			
			$info = $setplace -> where(['place_id'=>I('id')])-> find();
			if($info['fk_attr_id'])
			$info['attribute_id'] = D('Upload/AttachMent')->getAttach($info['fk_attr_id'],true);
			$this -> assign('info',$info);
		}
		
		$this -> display();
	}
	
	public function update(){
		$setplace = M('setplace');
		if(I('post.')){
			$data = I('post.');
			$data['fk_attr_id'] = $data['attachId'];
			$data['place_time'] = time();

			if($data['place_id']){
				$msg = '信息填写不完整，不允许编辑';
				$msgs = '编辑成功';
				$msge = '编辑失败';
			}else{
				$msg = '信息填写不完整，不允许添加';
				$msgs = '添加成功';
				$msge = '添加失败';
			}

			if(empty($data['place_name']) || empty($data['fk_classify_id']) || empty($data['place_keyword']) || empty($data['fk_attr_id'])){
				$this->ajaxReturn($this->result->error($msg)->toArray());exit;
			}
			

			if($data['place_id']){
				$re = $setplace -> where(['place_id'=>$data['place_id']])->save($data);
			}else{
				$re = $setplace ->add($data);
			}
			if($re){
				$this->ajaxReturn($this->result->success($msgs)->toArray());
			}else{
				$this->ajaxReturn($this->result->error($msge)->toArray());
			}
		}else{
			$this -> display('edit');
		}
	}
	
	public function deldate(){
		$setplace = M('setplace');
		$data = I('post.place_id');
		$s_id['place_id'] = ['in',$data];
		$attr_id = array_unique(array_column($setplace  -> where($s_id) -> Field('fk_attr_id')->select(),'fk_attr_id'));
		if($data){
			$re = $setplace -> where($s_id) -> delete();
			
			//删除图片
			if($attr_id){
				
				D('Upload/AttachMent') -> delById($attr_id);
			}
			
			if($re){
				$this->ajaxReturn(['msg'=>'success']);
			}else{
				$this->ajaxReturn(['msg'=>'error']);
			}
		}
	}
}