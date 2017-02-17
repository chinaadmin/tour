<?php
	/**
	 * 保险信息管理
	 * @author qrong
	 * @date 2016-04-29
	 */
	namespace Admin\Controller;
	use Common\Controller\AdminbaseController;
	class InsuranceController extends AdminbaseController{
		protected $curent_menu = 'Insurance/index';
		public $insurance_model;

		public function _initialize(){
			parent::_initialize();
			$this->insurance_model=D('Admin/Insurance');
		}

		/**
		 * 保险信息列表
		*/
		public function index(){
			$lists = $this->lists($this->insurance_model,'',"add_time desc");

			$this->assign('list',$lists);
			$this->display();
		}

		/**
		 * 编辑
		*/
		public function edit(){
			$id = I('id',0,'intval');

			if($id){
				$info = $this->insurance_model->getInfo($id);
				$this->assign('info',$info);
			}

			$this->display();
		}

		/**
		 * 更新
		*/
		public function update(){
			$id = I('id',0,'intval');

			$data = array(
					'name'=>I('post.name'),
					'costs'=>I('post.costs'),
					'status'=>I('post.status',0,'intval'),
					'add_time'=>NOW_TIME
				);

			if($id){
				unset($data['add_time']);
				$data['update_time']=NOW_TIME;
				$result = $this->insurance_model->setData(["id"=>$id],$data);
			}else{
				$result = $this->insurance_model->addData($data);
			}

			$this->ajaxReturn($result->toArray());
		}

		/**
		 * 删除信息
		*/
		public function del(){
			$id = I('id');

			$result = $this->insurance_model->del($id);
		    $this->ajaxReturn($result->toArray());
		}
	}
?>