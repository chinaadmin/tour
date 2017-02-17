<?php
/**
 * 导航管理
 * @author qrong
 * @date 2016-5-3
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
header('Content-Type:text/html;Charset=utf-8');
class NavController extends AdminbaseController{
	protected $curent_menu = 'Nav/index';
	private $nav_model;
	public function _initialize(){
		parent::_initialize();
		$this->nav_model = D("Admin/Nav");
	}

	/**
	 * 导航列表
	*/
	public function index(){
		$lists = $this->lists($this->nav_model,"",'sort ASC,add_time desc');
		// $lists = $this->lists($this->viewModel,"",'add_time desc');
		foreach($lists as $k=>$v){
			$attr = D('Upload/AttachMent')->getAttach($v['nav_attr'],true);
			$lists[$k]['pic'] = $attr[0]['path'];
			$lists[$k]['cate_name'] = M('Cate')->where(['cat_id'=>$v['cat_id']])->getField('name');
		}
		$this->assign("lists",$lists);

		$this->display();
	}

	/**
	 *	前台banner接口
	 */
	public function banner(){
		$banner = $this->nav_model->banner();
		dump($banner);
	}

	/**
	 * 添加/编辑
	*/
	public function edit(){
		$nav_id = I("request.nav_id",0,'intval');
		if($nav_id){
			$info = $this->nav_model->getById($nav_id);
			if($info['nav_attr']){
				$info['nav_attr'] = D('Upload/AttachMent')->getAttach($info['nav_attr'],true);
			}
			$this->assign("info",$info);
		}
		// dump($info);die;


		$cat_group = M('Cate')->where(['status'=>1])->order('cat_id')->select();
		$this->assign('cat_group',$cat_group);
		// dump($cat_group);die;
		$this->display();
	}

	/**
	 * 更新
	 */
	public function update(){
		if(IS_POST){
			$sort = I('post.sort',0,'int');
			$nav_attr = I('post.attachId',0,'int');
			if(!in_array($sort,[0,1,2])){
				$this->ajaxReturn($this->result->error('请输入正确的排序序号')->toArray());
				exit;
			}

			if(empty($nav_attr)){
				$this->ajaxReturn($this->result->error('请上传图案')->toArray());
				exit;
			}


			$nav_id = I("post.nav_id",0,'int');
			$data = array(
				'name' => I("post.name",''),
				'cat_id' => I("post.cat_id",0,'int'),
				'nav_attr' => $nav_attr,
				'sort'=> $sort,
				'status'=> I('post.status',0,'int'),
				'add_time' => NOW_TIME,
			);
			if($nav_id){
				unset($data['add_time']);
				$where = array(
					'nav_id' => $nav_id
				);
				$result = $this->nav_model->setData($where,$data);
			}else{
				$result = $this->nav_model->addData($data);
			}
			$this->ajaxReturn($result->toArray());
		}
	}
	
	/**
	 * 删除
	 */
	public function del(){
	    $nav_ids = I('post.nav_id','');
	    // $this->ajaxReturn($nav_ids);
	    // dump($nav_ids);die;
	    $result = $this->nav_model->delNav($nav_ids);
	    $this->ajaxReturn($result->toArray());
	}
}