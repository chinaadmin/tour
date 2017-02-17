<?php
/**
 *  APP启动页 
 * @author wxb
 * @date 2015/5/22
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class  MarketingController extends AdminbaseController{
	
	protected  $curent_menu = 'Marketing/index';
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
		$where['s_type'] = 1;
			
		$lists = $this->lists($startpage,$where,'s_state asc,s_display desc,s_time desc');

		$img = M('attachment');
		foreach($lists as &$v){
			if($v['fk_attr_id']){
				$img_nfo = $img ->where(['att_id' => $v['fk_attr_id']]) ->  find();
				$v['img_url'] = 'http://'.$_SERVER['HTTP_HOST'].$img_nfo['path']."/".$img_nfo['name'].".".$img_nfo['ext'];
			}
		}		
		$this -> assign('s_state',I('s_state','','trim'));
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

			if(!is_numeric($data['s_display'])){
				$this->ajaxReturn($this->result->error('显示顺序只能是数字')->toArray());exit;
			}
			if(empty($data['attachId'])){
				$this->ajaxReturn($this->result->error('图片不能为空')->toArray());exit;
			}

			$data['fk_attr_id'] = $data['attachId'][0];
			$data['s_time'] = time();
			unset($data['s_display_time']);
			if($data['s_id']){
				$re = $startpage -> where(['s_id'=>$data['s_id']])->save($data);
				$msg_s = '编辑成功';
				$msg_e = '编辑失败';
			}else{
				$data['s_type'] = 1;
				$re = $startpage ->add($data);
				$msg_s = '添加成功';
				$msg_e = '添加失败';
			}
			if($re){
				$this->ajaxReturn($this->result->success($msg_s)->toArray());exit;
			}else{
				$this->ajaxReturn($this->result->success($msg_e)->toArray());exit;
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
}