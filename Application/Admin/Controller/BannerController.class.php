<?php
/**
 * 首页顶部Banner 管理
 * @author LIU
 * @date 2015/5/22
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class  BannerController extends AdminbaseController{
	
	protected  $curent_menu = 'Banner/index';
	public  function  index(){
		$startpage = D('StartPage');
		$where = [];
		if(I('s_id','','trim')){
        	
        	$where['s_id'] = I('s_id','','trim');
        }
        if(I('s_name')){
        	$where['s_name'] = array('like','%'.I('s_name').'%');
        }
		if(I('s_state','','trim')){
			$where['s_state'] = I('s_state','','trim');
		}
		$where['s_type'] = 2;

		$lists = $this->lists($startpage,$where,'s_state asc,s_display desc,s_time desc');
		$img = M('attachment');
		foreach($lists as &$v){
			if($v['fk_attr_id']){
				$img_nfo = $img ->where(['att_id' => $v['fk_attr_id']]) ->  find();
				$v['img_url'] = 'http://'.$_SERVER['HTTP_HOST'].$img_nfo['path']."/".$img_nfo['name'].".".$img_nfo['ext'];
			}
		}

		$this ->assign('s_state',I('s_state','','trim'));
		$this -> assign('lists',$lists);
		$this -> display();
	}
	
	public function edit(){
		$startpage = D('StartPage');
		if(I('id')){
			$info = $startpage -> where(['s_id'=>I('id')])-> find();
			if($info['fk_attr_id'])
			$info['attribute_id'] = D('Upload/AttachMent')->getAttach($info['fk_attr_id'],true);
			$this -> assign('info',$info);
		}
		
		$this -> display();
	}
	
	public function update(){
		$startpage = D('StartPage');
		if(I('post.')){
			$data = I('post.');
			$data['fk_attr_id'] = $data['attachId'][0];
			$data['s_time'] = time();
			if($data['s_id']){
				$re = $startpage -> where(['s_id'=>$data['s_id']])->save($data);
			}else{
				$data['s_type'] = 2;
				$re = $startpage ->add($data);
			}
			if($re){
				$this -> success('新增成功','index');
			}else{
				$this -> error('新增失败','edit');
			}
		}else{
			$this -> display('edit');
		}
	}
	
	public function deldate(){
		$startpage = D('StartPage');
		$data = I('post.s_id');
		$s_id['s_id'] = ['in',$data];
		$attr_id = array_unique(array_column($startpage  -> where($s_id) -> Field('fk_attr_id')->select(),'fk_attr_id'));
		if($data){
			$re = $startpage -> where($s_id) -> delete();
			
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
	
	//吉途介绍
	public function blurb(){
		$this -> curent_menu = "Banner/blurb";
		$startpage = D('StartPage');
		$data = $startpage -> where(['s_type'=>3]) -> find();
		if($data['fk_attr_id']){
			$data['attribute_id'] = D('Upload/AttachMent')->getAttach($data['fk_attr_id'],true);
			$this -> assign('info',$data);
		}
		$this -> display();
	}
	
	//吉途介绍更新
	
	public function updates(){
		$this -> curent_menu = "Banner/updates";
		$startpage = M('StartPage');
		$id = I('post.attachId');
		// var_dump($id);exit();
		if(!empty($id)){
			$data = $startpage -> where(['s_type'=>3]) -> find();
			$attr_id['fk_attr_id'] = $id;
			if(!$data){
				$attr_id['s_type'] = 3;
				$re = $startpage ->add($attr_id);
			}else{
				if($data['fk_attr_id']){
					D('Upload/AttachMent') -> delById($data['fk_attr_id']);
				}
				$re = $startpage -> where(['s_type'=>3])->save($attr_id);
			}
			if($re){
				// $this -> success('新增成功','index');
				$this -> success('新增成功','blurb');
			}else{
				// $this -> error('新增失败','edit');
				$this -> error('新增失败','blurb');
			}
		}else{
			$this -> display('blurb');
		}
	}
}