<?php
/**
 * 首页顶部Banner 管理
 * @author LIU
 * @date 2015/5/22
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class  DomesticTourController extends AdminbaseController{
	
	protected  $curent_menu = 'domestictour/index';
	public  function  index(){
		$domestic_tour = D('domestic_tour');
		$where = [];
		if(I('dt_id','','trim')){
        	
        	$where['dt_id'] = I('dt_id','','trim');
        }
        if(I('dt_name')){
        	$where['dt_name'] = array('like','%'.I('dt_name').'%');
        }
		if($fk_tat_id = I('fk_tat_id','','trim')){
			$where['fk_tat_id'] = array('like',"%{$fk_tat_id}%");
		}

		$lists = $this->lists($domestic_tour,$where,'dt_state asc, dt_sort desc,dt_time desc');
		$img = M('attachment');
		$Tag = D('Admin/Tag');
		// print_r($lists);
		foreach($lists as $k => $v){
			if($lists[$k]['fk_attr_id']){

				$img_nfo = $img ->where(['att_id' => $lists[$k]['fk_attr_id']]) ->  find();
				$lists[$k]['img_url'] = $img_nfo['path']."/".$img_nfo['name'].".".$img_nfo['ext'];
			}
			$lists[$k]['tag'] = implode($Tag -> getByIds(trim($v['fk_tat_id'],','),'name'),',');
		}
		//获取商品标签

		$this ->assign('fk_tat_id',I('fk_tat_id','','trim'));
		$this -> assign('tag',D('Admin/Tag') -> getTags());
		$this -> assign('lists',$lists);
		$this -> display();
	}
	
	public function edit(){
		$domestic_tour = D('domestic_tour');
		if(I('id')){
			$info = $domestic_tour -> where(['dt_id'=>I('id')])-> find();
			if($info['fk_attr_id'])
			$info['attribute_id'] = D('Upload/AttachMent')->getAttach($info['fk_attr_id'],true);
			$this -> assign('info',$info);
		}
		
		//获取商品标签
		$this -> assign('tag',D('Admin/Tag') -> getTags());
		
		$this -> display();
	}
	
	public function update(){
		$domestic_tour = D('domestic_tour');
		if(I('post.')){
			$data = I('post.');
			$data['fk_tat_id'] = implode($data['fk_tat_id'],',');
			$data['fk_attr_id'] = $data['attachId'][0];
			$data['dt_time'] = time();
			if($data['dt_id']){
				$re = $domestic_tour -> where(['dt_id'=>$data['dt_id']])->save($data);
			}else{
				$re = $domestic_tour ->add($data);
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
		$domestic_tour = D('domestic_tour');
		$data = I('post.dt_id');
		$dt_id['dt_id'] = ['in',$data];
		$attr_id = array_unique(array_column($domestic_tour  -> where($dt_id) -> Field('fk_attr_id')->select(),'fk_attr_id'));
		if($data){
			$re = $domestic_tour -> where($dt_id) -> delete();
			
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