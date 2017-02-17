<?php
/**
 * 热门地管理
 * @author LIU
 * @date 2015/5/22
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class  HotController extends AdminbaseController{
	
	protected  $curent_menu = 'Hot/index';
	public  function  index(){
		$startpage =M('classify');
		$where = [];
		if(I('classify_id','','trim')){
        	
        	$where['classify_id'] = I('classify_id','','trim');
        }
        if(I('classify_name')){
        	$where['classify_name'] = array('like','%'.I('classify_name').'%');
        }
		if(I('classify_state','','trim')){
			$where['classify_state'] = I('classify_state','','trim');
		}

		$lists = $this->lists($startpage,$where,'classify_state asc,classify_sort desc,classify_up_time desc');

		$this -> assign('lists',$lists);
		$this -> display();
	}
	
	public function edit(){
		$startpage = M('classify');
		if(I('id')){
			$info = $startpage -> where(['classify_id'=>I('id')])-> find();
			$this -> assign('info',$info);
		}
		
		$this -> display();
	}
	
	public function update(){
		$startpage = M('classify');
		if(I('post.')){
			$data = I('post.');
			$data['classify_up_time'] = time();
			if($data['classify_id']){
				$re = $startpage -> where(['classify_id'=>$data['classify_id']])->save($data);
			}else{
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
		$startpage = M('classify');
		$data = I('post.classify_id');
		$s_id['classify_id'] = ['in',$data];
		if($data){
			$re = $startpage -> where($s_id) -> delete();
			if($re){
				$this->ajaxReturn(['msg'=>'success']);
			}else{
				$this->ajaxReturn(['msg'=>'error']);
			}
		}
	}
}