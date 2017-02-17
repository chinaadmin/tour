<?php
	/**
	 * 地区管理
	 * @author qrong
	 * @date 2016-5-4
	 */
	namespace Admin\Controller;
	use Common\Controller\AdminbaseController;
	use Common;
	header('Content-Type:text/html;Charset=utf-8');
	class RegionController extends AdminbaseController{
		protected $curent_menu = 'Region/index';
		public $region_model;

		public function _initialize(){
			parent::_initialize();
			$this->region_model=D('Admin/Region');
		}

		public function index(){
			$redis_model = D('Common/Redis');
	        $redis = $redis_model->getRedis();
	        $region_key = 'jttravel_region';
	        $region = $redis->get($region_key);

        	$region = empty($region)?[]:$redis_model->unformat($region);
	        // dump($region);die;

			// $lists = $this->lists($this->region_model,'',"depart_id");
			if($region){
				$data=$region;
			}else{
				$data  = $this->treeDepart(true);
				foreach ($data as $key => $value) {
					unset($data[$key]['pid']);
					unset($data[$key]['name']);
					unset($data[$key]['level']);
					unset($data[$key]['childsid']);
				}
				$redis->set($region_key,json_encode($data));
			}

			$this->assign('list',$data);
			$this->display();
		}

		/**
		 *	获取子类
		 *	@param $pid 父类id
		 *	@return json
		 */
		public function getChild(){
			$pid = I('pid',0,'intval');

			$res = M('Depart')->where(['pid'=>$pid])->select();
			foreach($res as $k=>$v){
				$c = M('Depart')->where(['pid'=>$v['depart_id']])->find();
				if($c){
					$res[$k]['child']=1;
				}else{
					$res[$k]['child']=0;
				}
			}
			echo json_encode($res,true);
		}

		

		/**
		 *	获取子地址
		 *	@param $pid 父类id
		 *	@return json
		 */
		public function getChildAdd(){
			$pid = I('pid',0,'intval');

			$res = M('Depart')->where(['pid'=>$pid])->select();
			/*foreach($res as $k=>$v){
				$c = M('Depart')->where(['pid'=>$v['depart_id']])->find();
				if($c){
					$res[$k]['child']=1;
				}else{
					$res[$k]['child']=0;
				}
			}*/
			echo json_encode($res,true);
		}

		/**
		 * 树形展示
		 * @param string $field        	
		 * @return $data
		 */
		private function treeDepart($field = true) {
			/*$icon = array (
					'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
					'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
					'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
				);*/
			return $this->region_model->getTree($field);
		}

		public function destination(){
			$this->display();
		}

		/**
		 *	删除地址
		 *	@param $depart_id 地址主键id
		 */
		public function del(){
			$depart_id = I('depart_id',0,'intval');

			$res = $this->region_model->delDepart($depart_id);
			// dump($res->toArray());die;
			$res = $res->toArray();
			if($res['status']=='SUCCESS'){
				$this->success('删除成功',U('Region/index'));
			}else{
				$this->error($res['msg']);
			}
			// $this->ajaxReturn($res);
		}

		/**
		 *	编辑地址
		 *	@param $id 地址主键id
		 */
		public function edit(){
			$depart_id = I('depart_id',0,'intval');

			if($depart_id){
				$info = $this->region_model->getById($depart_id);
				$this->assign('info',$info);

				$this->display('edit');
			}else{
				$list = $this->region_model->getByPid(0);
				$this->assign('first',$list);
				// dump($list);die;

				$this->display('add');
			}
		}

		/**
		 *	更新信息
		 *	@param $id 地址主键id 判断是编辑还是添加
		 */
		public function update(){
			$depart_id = I('depart_id',0,'intval');
			$data = array();
			// $name = I('name');

			if($depart_id){	//存在id，则为编辑
				$data['name']=I('name');
				$res = $this->region_model->saveData($depart_id,$data);

				$this->ajaxReturn($res->toArray());
			}else{
				$first = I('first',0,'intval');
				$second = I('second',0,'intval');
				$third = I('third',0,'intval');
				$data = array();
				$data['name']=I('name');
				if($third){
					$data['pid']=$third;
				}elseif(empty($third) && $second){
					$data['pid']=$second;
				}elseif(empty($second) && $first){
					$data['pid']=$first;
				}else{
					$data['pid']=0;
				}

				$res = $this->region_model->addData($data);
				$this->ajaxReturn($res->toArray());
			}
		}
	}