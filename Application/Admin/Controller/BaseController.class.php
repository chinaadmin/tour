<?php
	/**
	 * 参观基地管理
	 * @author qrong
	 * @date 2016-5-9
	 */
	namespace Admin\Controller;
	use Common\Controller\AdminbaseController;
	class BaseController extends AdminbaseController{
		public $base_model;
		protected $curent_menu = 'Base/index';
		/*public function _initialize(){
			parent::_initialize();
			$this->base_model=D('Admin/Base');
		}*/

		/**
		 *	参观基地列表
		 */
		public function index(){
			// $code 	 = I('code');
			$code 	 = I('code','','trim');
			$name 	 = I('name','','trim');
			$title 	 = I('title','','trim');
			$s_title = I('s_title','','trim');
			$is_sale = I('is_sale');
			if(!empty($code)){
				$where['code'] = ['LIKE','%'.$code.'%'];
			}
			
			if(!empty($name)){
				$where['name'] = ['LIKE','%'.$name.'%'];
			}
			
			if(!empty($title)){
				$where['title'] = ['LIKE','%'.$title.'%'];
			}
			
			if(!empty($s_title)){
				$where['s_title'] = ['LIKE','%'.$s_title.'%'];
			}
			if(is_numeric($is_sale)){
				$where['is_sale'] = $is_sale;
			}
			
			// $data = M('base') -> where($where) ->order("is_sale desc ,sort desc,update_time desc") ->select();
//			$data = M('base') -> where($where) ->order("sort desc,update_time desc") ->select();
			$data = $this->getVisitListByOrder(M('base'),$where);
			$base_ids = array_column($data,"base_id");
			if($base_ids){
				$base_goods = M('base_goods') -> where(array('base_id'=>['in',$base_ids])) ->field('goods_id,base_id') ->select();
				foreach($base_goods as $k=>$v){
					$num = count(json_decode($v['goods_id'],true));
					$arr[$v['base_id']] = $num?$num:"";
				}
			}
			
			$this -> assign('num',$arr);
			$this ->assign('lists',$data);
			$this->display();
		}


		/**
		 *	编辑
		 */
		public function edit(){
			$base_id = I("id");
			$img = M('attachment');
			if($base_id){
				$list = M('base') -> where(['base_id' => $base_id]) -> find();
				if($list['conten_id']){
					$list['conten_id'] = D('Upload/AttachMent')->getAttach(json_decode($list['conten_id'],true),true);

				} 
				
				if($list['base_attr']){
					$image = D('Upload/AttachMent')->getAttach($list['base_attr'],true);
					$list['attr_id'] = $image;
				} 
				$this ->assign('info',$list);
			}
			// dump($list);exit;
			$this->display();
		}

		/**
		 *	更新
		 */
		public function update(){
			$data = I('post.');
			$data['conten_id'] = empty($data['conten_id'])?"":json_encode($data['conten_id'],true);
			// $data['base_attr'] = $data['base_attr'][0];
			if($data['base_id']){
				$where['base_id'] = $data['base_id'];
				unset($data['base_id']);
				$re = M('base') -> where($where)->save($data);
				
			}else{
				$data['update_time'] = time();
				$data['code'] = 'YS'.mt_rand(100000000,999999999);
				$re = M('base') ->add($data);
			}
			
			if($re){
				$this->success('更新成功！',U('index'));
			}else{
				$this->error('更新失败！');
			}
		}

		/**
		 *	删除
		 */
		public function del(){
			$base = I('post.base_id');
			if(!empty($base)){
				$where['base_id'] = array('in',$base);
				$re = M('base')->where($where) -> delete();
				if($re){
					$re = M('base_goods')->where($where) -> delete();
				}
				if($re)
				{
					$this->ajaxReturn(['msg'=>'success']);
				}
			}
			$this->ajaxReturn(['msg'=>'error']);
		}

		
		/**
		 *	关联线路
		*/
		
		public function relates(){
			$product_model = D("Admin/Product");
			$id = I('id');
			$goods_id = json_decode(M('base_goods')-> where(['base_id' => $id]) ->getfield('goods_id'),true);
			$data['id'] = $id;
			$data['num'] = count($goods_id);
			$this ->assign('data',$data);
			//获取产品线路
			
			if($goods_id){
				$where['goods_id'] = array('in',$goods_id);
				$list = $this->lists($product_model,$where,"goods_id DESC");

				foreach($list as $k=>$v){
					$list[$k]['minAdultPrice']=$this->getMinAdultPrice($v['goods_id']);
					$list[$k]['linkTag']=$product_model->getLinkTag(json_decode($v['tag_id'],true));
				}
			}
		
			$this->assign('list',$list);
			$this -> display();
		}

		/**
		 *	添加关联线路
		 */
		public function addRelate(){
			$product_model = D("Admin/Product");
			$id = I('id');
			$goods_id = json_decode(M('base_goods')-> where(['base_id' => $id]) ->getfield('goods_id'),true);
			$data['id'] = $id;
			$data['num'] = count($goods_id);
			$this ->assign('data',$data);
			//获取产品线路
			$where		=	array();
			$is_sale 	=	I('is_sale','','intval');
			$name 		=	I('name');
			$goods_sn	=	I('goods_sn');
			$minAdultPrice = I('minAdultPrice','','intval');

			if($name){
				$where['name']=array('LIKE','%'.$name.'%');
			}
			if($goods_id){
				$where['goods_id'] = array('not in',$goods_id);
			}
			if($goods_sn){
				$where['goods_sn']=$goods_sn;
			}
			if(is_numeric($is_sale)){
				$where['is_sale']=$is_sale;
			}
			

			if($where){
				$list = $this->lists($product_model,$where,"goods_id DESC");
			}else{
				$list = $this->lists($product_model,'',"goods_id DESC");
			}

			foreach($list as $k=>$v){
				$list[$k]['minAdultPrice']=$this->getMinAdultPrice($v['goods_id'],time());
				$list[$k]['linkTag']=$product_model->getLinkTag(json_decode($v['tag_id'],true));
			}

			$this->assign('list',$list);
			
			
			$this -> display('addRelate');
		}
		
		/**
		 *	更新关联线路数据
		*/
		
		public function upRelate(){
			$goods = I('post.goods_id');
			$base_id = I('post.id',0,'int');
			$goods_id['goods_id'] = $this -> upRelateData($goods,$base_id);
			$where['base_id'] = I('post.id');
			$base_goods = M('base_goods');
			if(($base_goods -> where($where) -> count())>0){
				$re = $base_goods ->where($where) -> save($goods_id);
			}else{
				$goods_id['base_id'] = I('post.id');
				$re = $base_goods ->add($goods_id);
			}
			if($re){
				$this->ajaxReturn(['msg'=>'success']);
			}else{
				$this->ajaxReturn(['msg'=>'error']);
			}
		}
		
		/**
		 *	删除关联线路
		 */
		public function delRelate(){
			$goods = I('post.goods_id');
			$base_id = I('post.id',0,'int');
			$id = json_decode(M('base_goods')-> where(['base_id' => $base_id]) ->getfield('goods_id'),true);
			
			for($i=0;$i<count($id);$i++){
				if(!in_array($id[$i],$goods)){
					$arr[] = $id[$i];
				}
			}
			$goods_id['goods_id'] = json_encode($arr,true);
			$re = M('base_goods') ->where(['base_id' => $base_id]) -> save($goods_id);
			if($re){
				$this->ajaxReturn(['msg'=>'success']);
			}else{
				$this->ajaxReturn(['msg'=>'error']);
			}
			
		}
		
		
		/**
		 *	获取成人最低价格
		 *	@param $goods_id   线路id
		 *	@param $start_time 开始时间
		 *	@param $type 哪里调取  0为后台(默认)，1为前台
		 */
		public function getMinAdultPrice($goods_id,$start_time,$type){
			return D("Admin/Product")->getMinPrice($goods_id,$start_time,$type);
		}
		
		
		private function upRelateData($data,$base_id){

			$id = json_decode(M('base_goods')-> where(['base_id' => $base_id]) ->getfield('goods_id'),true);
			if($id && (count($data)<3)){
				return json_encode(array_merge($id,$data),true);
			}else{
				return json_encode($data,true);
			}
		}

		/*
		*一键上下架
		*@auth cdd
		*@table养生基地表
		*/
		public function isSale(){
			$id = I('post.id');
			$is_sale = I('post.is_sale/d');
			if (!empty($id)) {
				$where['base_id'] = array('in',$id);
				$data['is_sale'] = $is_sale;
				$res = M('base') ->where($where)->save($data);
				if ($res) {
					$data['msg'] = 'success';
					$this -> ajaxReturn($data);
				}
			}
			$this -> ajaxReturn($this->result->error());
		}
		/**
		 * 根据不同点击获取不同的排序规则
		 * @param $user_model 用户模型
		 * @param $where 查询条件
		 * @return mixed 按查询条件返回的数组
		 */
		private function getVisitListByOrder($user_model,$where){
			if (!empty(I('get.sort_id'))){
				if (I('get.sort_id') <= 3){
					$id_status = I('get.sort_id') == 2? 1:2;
					$username_status = 6;
					$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status]);
					return I('get.sort_id') == 2 ? $this->lists($user_model,$where,'sort asc'):$this->lists($user_model,$where,'sort desc');
				}elseif (I('get.sort_id')<= 6){
					$id_status = 3;
					$username_status = I('get.sort_id') == 5? 4:5;
					$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status]);
					return I('get.sort_id') == 5 ? $this->lists($user_model,$where,'update_time asc'):$this->lists($user_model,$where,'update_time desc');
				}
			}else{
				$id_status = 3;
				$username_status = 6;
				$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status]);
				return $this->lists($user_model,$where,'sort desc,update_time desc');
			}
		}

	}
?>