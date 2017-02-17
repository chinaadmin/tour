<?php
	/**
	 * 产品中心
	 * @author qrong
	 * @date 2016-5-4
	 */
	namespace Admin\Controller;
	use Common\Controller\AdminbaseController;
	// use Common\Service\GetImgSizeService;
	header('Content-Type:text/html;Charset=utf-8');
	class ProductController extends AdminbaseController{
		protected $curent_menu = 'Product/index';
		private $product_model;
		public function _initialize(){
			parent::_initialize();
			$this->product_model = D("Admin/Product");
		}

		/**
		 * 产品中心
		*/
		public function index(){
			$where		=	array();
			$is_sale 	=	I('is_sale','','intval');
			$name 		=	I('name');
			$goods_sn	=	I('goods_sn','','trim');
			$minAPrice  = 	I('minAdultPrice','','trim');
			$minAPrice2 = 	I('minAdultPrice2','','trim');
			$departName =	I('departName','','trim');
			$destinationName =	I('destinationName','','trim');
			if($name){
				$where['name'] = ['LIKE','%'.$name.'%'];
			}
			if(!empty($departName)){
				$where['depart'] = ['LIKE','%'.$departName.'%'];
			}
			if(!empty($destinationName)){
				$where['destination'] = ['LIKE','%'.$destinationName.'%'];
			}
			if($goods_sn){
				$where['goods_sn'] = ['LIKE','%'.$goods_sn.'%'];
			}
			if(is_numeric($is_sale)){
				$where['is_sale'] = $is_sale;
			}
			if(is_numeric($minAPrice)){
				if(!empty($minAPrice2)){
					$li = M('GoodsDate')->where(array('adult_price'=>array('between',array($minAPrice,$minAPrice2))))->group('goods_id')->select();
				}else{
					$li = M('GoodsDate')->where(array('adult_price'=>array('EGT',$minAPrice)))->group('goods_id')->select();
				}
				
				$goodsIds = [];
				if(is_array($li)){
					foreach($li as $val){
						if(!in_array($val['goods_id'],$goodsIds)){
							$goodsIds[] = $val['goods_id'];
						}
					}

					$where['goods_id'] = ['IN',$goodsIds];
				}
			}
			empty(I('checked_id','','trim'))?:$where['cat_id'] = I('checked_id','','trim');
//			dump($where['cat_id']);die;
			$categorys =   D('Category')->getTree();
/*			if(I('Request.uid')){
				$where['is_sale'] = 1;
				$where['end_time'] = array('egt',strtotime("now"));
			}*/
			if($where){
				$list = $this->getLineListByOrder($this->product_model->getLineProduct(),$where);
			}else{
				$list = $this->getLineListByOrder($this->product_model->getLineProduct(),'');
			}
			foreach($list as $k=>$v){
				$list[$k]['minAdultPrice']=$this->getMinAdultPrice($v['goods_id']);
				$list[$k]['linkTag']=$this->product_model->getLinkTag(json_decode($v['tag_id'],true));
			}
//			 dump($list);die;
			$this->assign('uid',I('Request.uid'));
			$this->assign('list',$list);
			$this->assign('checked_id',I('checked_id','','trim'));
			$this->assign('categorys',$categorys);
			$this->display();
		}

		/**
		 *	获取成人最低价格
		 *	@param $goods_id   线路id
		 *	@param $start_time 开始时间
		 *	@param $type 哪里调取  0为后台(默认)，1为前台
		 */
		public function getMinAdultPrice($goods_id,$start_time,$type){
			return $this->product_model->getMinPrice($goods_id,$start_time,$type);
		}

		/**
		 *  添加产品
		 */
		public function edit(){
			$icon = array (
				'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
				'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
				'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
			);
			$cateList = D('Category')->getTree(true,$icon);						//分类
			$typeList = M('GoodsType')->where(['status'=>1])->select();			//属性
			$insuList = M('Insurance')->where(['status'=>1])->select();			//保险
			$tagList  = M('GoodsTag')->where(['tag_status'=>1])->select();		//标签
			$goods_id = I('goods_id',0,'intval');
			$img = D('Upload/AttachMent');

			if($goods_id){
				$goodsInfo = $this->product_model->getGoodsInfo($goods_id);
				/*$goodsInfo['adult_price'] = intval($goodsInfo['adult_price']);
				$goodsInfo['child_price'] = intval($goodsInfo['child_price']);*/
				
				$dateList = $this->product_model->getDateList($goods_id);
				foreach($dateList as $k => $v){
					$dateList[$k]['d']=date('d',$v['date_time']);
				}
				$goodsDepartList = $this->product_model->getDepartList($goods_id);
				/*if($goodsDepartList){
					foreach($goodsDepartList as $k => $v){
						
					}
				}*/
				$goodsDestinationList = $this->product_model->getDestinationList($goods_id);
				
				$type_id=json_decode($goodsInfo['type_id'],true);
				$tag_id=json_decode($goodsInfo['tag_id'],true);
				$insu_id=json_decode($goodsInfo['insu_id'],true);
				$goodsInfo['type_id'] = implode(',',$type_id);
				$goodsInfo['tag_id'] = implode(',',$tag_id);
				$goodsInfo['insu_id'] = implode(',',$insu_id);
				if($goodsInfo['attribute_id']){
					$goodsInfo['attribute_id'] = $img->getAttach(json_decode($goodsInfo['attribute_id'],true),true);
				}

				if($goodsInfo['cover']){
					$goodsInfo['cover'] = $img->getAttach($goodsInfo['cover'],true);
				}
				
				if($goodsInfo['feature']){
					$goodsInfo['feature'] = json_decode($goodsInfo['feature'],true);
				}
				
				if($goodsInfo['reminder']){
					$goodsInfo['reminder'] = json_decode($goodsInfo['reminder'],true);
				}
				if($goodsInfo['introduce']){
					$goodsInfo['introduceinfos'] = json_decode($goodsInfo['introduce'],true);
				}
				if($goodsInfo['travel_cost']){
					$goodsInfo['travel_cost'] = json_decode($goodsInfo['travel_cost'],true);
				}
				
				$this->assign('info',$goodsInfo);
				$this->assign('dateList',json_encode($dateList));			//团期信息列表
				$this->assign('departList',$goodsDepartList);				//线路出发地列表
				$this->assign('destinationList',$goodsDestinationList);		//线路目的地列表
			}
			// dump($dateList);exit;
			$this->assign('goods_id',$goods_id);
			$this->assign('cateList',$cateList);
			$this->assign('typeList',$typeList);
			$this->assign('insuList',$insuList);
			$this->assign('tagList',$tagList);
			$this->assign('uid',I('request.uid'));

			$this->display();
		}

		/**
		 *	更新数据
		 */
		public function update(){
			$posts = I('post.');
			//行程特色数据处理
			$feature['feature'] = I("post.feature");
			/*$getImgSize = new GetImgSizeService(htmlspecialchars_decode($feature['feature']));
			$feature['imgsize'] = $getImgSize->fetchImgSize();*/

			//行程介绍数据处理
			foreach ($posts['start_destination'] as $key=>$value){
				$introduce[$key]['start_destination'] =$value;
				$introduce[$key]['food_beverage'] =$posts['food_beverage'][$key];
				$introduce[$key]['accommodation'] =$posts['accommodation'][$key];
				$introduce[$key]['introduce'] =$posts['introduce'][$key];
				/*$getImgSize->setContent(htmlspecialchars_decode($introduce[$key]['introduce']));
				$introduce[$key]['imgsize'] = $getImgSize->fetchImgSize();*/
			}

			//行程费用数据处理
			$travel_cost['travel_cost'] = I("post.travel_cost");
			/*$getImgSize->setContent(htmlspecialchars_decode($travel_cost['travel_cost']));
			$travel_cost['imgsize'] = $getImgSize->fetchImgSize();*/

			//温馨提示数据处理
			$reminder['reminder'] = I("post.reminder");
			/*$getImgSize->setContent(htmlspecialchars_decode($reminder['reminder']));
			$reminder['imgsize'] = $getImgSize->fetchImgSize();*/

			$cover = I("post.cover");//线路封面图片上传结果
			$feature = json_encode($feature,true);	//行程特色图片上传结果
			$introduce =json_encode($introduce,true);	//详情介绍图片上传结果
			$travel_cost = json_encode($travel_cost,true);//旅游费用图片上传结果
			$reminder = json_encode($reminder,true);	//温馨提示图片上传结果

			$GoodsId = M('Goods')->order('goods_id DESC')->limit(1)->getField('goods_id');	//获取最大主键id

			//团期修改  第二版
			$arr = json_decode($_POST['datetuqi'],true);
			$arr2 = [];
			for($i=0;$i<count($arr);$i++){
				$arr2[]=$arr[$i]['time'];
			}
			sort($arr2);	//以时间正序排序
			$dat = [];
			$i=0;
			foreach($arr2 as $v){
				foreach($arr as $val){
					if($v==$val['time']){
						$val['time']=$val['time']/1000;		//转换毫秒时间
						$dat[$i] = $val;

						$i++;
					}
				}
			}
			
			$goods_id = I('goods_id',0,'int');
			$data = array();
			$startTime = I('start_time',0);
			$attachId = I('post.attachId');
			if($startTime){
				$start_time = strtotime($startTime);
				$end_time	= $start_time+(86400*31);
			}else{
				// $startTime  = date('Ymd',NOW_TIME);
				$start_time = $startTime;
				$end_time	= $start_time+(86400*31);
			}
			
			$cat_id = I('cat_id');
			$depart_id = I('depart_ids');		//勾选的出发地id数组
			$dt_id = I('depart_idsmd');			//勾选的目的地id数组
			
			$departInfo = D('Admin/Region')->getNameById($depart_id);
			$dtInfo = D('Admin/Region')->getNameById($dt_id);
			$departName = implode('',array_column($departInfo,'name'));
			$dtName = implode('',array_column($dtInfo,'name'));
			$address = array(
				'depart_id'=>array_column($departInfo,'depart_id'),
				'dt_id'=>array_column($dtInfo,'depart_id'),
			);
			// dump($depart_name);exit;

			//字段为空限制
			if($goods_id){
				$msg = '信息填写不完整，不允许编辑';
			}else{
				$msg = '信息填写不完整，不允许添加';
			}

			if(empty(I('name'))){
				$this->ajaxReturn($this->result->error('线路名称不能为空')->toArray());exit;
			}

			if(empty($cat_id) || empty($depart_id) || empty($dt_id) || empty(I('type_id')) || empty(I('insu_id')) || empty(I('day')) || empty(I('day')) || empty(I('night')) || empty(I('traffic')) || empty(I('accommodations')) || empty(I('stocks')) || empty(I('adultPrice')) || empty($cover) || empty($feature) || empty($reminder) || empty($introduce) || empty($travel_cost) || empty($attachId) ){
				$this->ajaxReturn($this->result->error($msg)->toArray());exit;
			}

			$data = array(
				'cat_id'		=>	I('cat_id',0,'int'),
				'type_id'		=>	I('type_id')?json_encode(I('type_id')):'',
				'tag_id'		=>	I('tag_id')?json_encode(I('tag_id')):'',
				'insu_id'		=>	I('insu_id')?json_encode(I('insu_id')):'',
				'goods_sn'		=>	getGoodsSn($GoodsId),
				'name'			=>	I('name'),
				'cover'			=>	$cover,
				'feature'		=>	$feature,
				'introduce'		=>	$introduce,
				'travel_cost'	=>	$travel_cost,
				'reminder'		=>	$reminder,
				'attribute_id'	=>	$attachId?json_encode($attachId):"",
				'sort'			=> 	I('sort',0,'int'),
				'days'			=> 	I('day',0,'int'),
				'nights'		=> 	I('night',0,'int'),
				'traffic'		=> 	I('traffic'),
				'accommodation'	=> 	I('accommodations'),
				'stock'			=> 	I('stocks'),
				'adult_price'	=> 	I('adultPrice'),
				'child_price'	=> 	I('childPrice'),
				'advance'		=> 	I('advance',1,'int'),
				'start_time'	=> 	$start_time,
				'end_time'		=> 	$end_time,
				'update_time'	=> 	NOW_TIME,
				'for_adult'		=> 	I('for_adult',1,'int'),
				'for_child'		=> 	I('for_child',0,'int'),
				'is_auto'		=> 	I('is_auto',0,'int'),
				'depart'		=> 	$departName,
				'destination'	=> 	$dtName,
				'checkAll'		=> 	I('checkAll',0,'int'),
			);
			/*$dat = array(
				'adult_price'	=> 	I('adultPrice'),
				'child_price'	=> 	I('childPrice'),
			);*/
			 // dump($_POST);
			/*dump($data);
			dump($dat);exit; */
			
			if($goods_id){
				unset($data['goods_sn']);
				
				if(!$cover){
					unset($data['cover']);
				}
				if(empty($feature)){
					unset($data['feature']);
				}
				if(empty($introduce)){
					unset($data['introduce']);
				}
				if(empty($travel_cost)){
					unset($data['travel_cost']);
				}
				if(empty($reminder)){
					unset($data['reminder']);
				}
				if(empty($departName)){
					unset($data['depart']);
				}
				if(empty($dtName)){
					unset($data['destination']);
				}

				$res = $this->product_model->saveData($goods_id,$data,$dat,$address);
				$res = $res->toArray();
			}else{
				//字段为空限制
				if(empty($start_time)){
					$this->ajaxReturn($this->result->error('信息填写不完整，不允许添加')->toArray());exit;
				}

				$res = $this->product_model->add($data,$dat,$address);
				$res = $res->toArray();
			}
			
			$this->ajaxReturn($res);
		}
		
		/**
		 *	修改单个团期的价格与库存
		 *	@param String  gd_id  		 团期id
		 *	@param String  adult_price   成人价格
		 *	@param String  child_price   儿童价格
		 *	@param String  stock		 库存
		 */
		public function updateDate(){
			$gd_id 		 = I('gd_id',0,'int');
			$adult_price = I('adult_price',0);
			$child_price = I('child_price',0);
			$stock 		 = I('stock',0);
			
			if($gd_id){
				$data=array(
					'adult_price'=>$adult_price,
					'child_price'=>$child_price,
					'stock'=>$stock,
				);
				if($adult_price==0){
					unset($data['adult_price']);
				}elseif($child_price==0){
					unset($data['child_price']);
				}
				
				M('GoodsDate')->where(['gd_id'=>$gd_id])->save($data);
			}
			$newInfo = M('GoodsDate')->where(['gd_id'=>$gd_id])->find();
			// $this->ajaxReturn($this->result->content(['info'=>$newInfo])->success());
			echo json_encode($newInfo);
		}

		/**
		 *	获取子类
		 *	@param pid 父id
		 */
		public function getChildAddress(){
			$pid = I("post.pid",0,'intval');
			$res = M('Depart')->where(['pid'=>$pid])->select();
			foreach($res as $k=>$v){
				$res[$k]['num']=M('Depart')->field('depart_id')->where(['pid'=>$v['depart_id']])->count();
			}
			
			echo json_encode($res,true);
		}

		/*
		 *	一键下上架
		 *	@param pid 父id
		 */
		public function isSale(){
			$id = I('post.id');
			$is_sale = I('post.is_sale');
			if(!empty($id)){
				$where['goods_id'] = array('in',$id);
				$data['is_sale'] =$is_sale;
				$re = M('goods') ->where($where)->save($data);
				if($re){
					$data['msg'] = 'success';
					$this -> ajaxReturn($data);
				}
			}
			$this -> ajaxReturn($this -> result->error());
		}
		/**
		 * 根据不同点击获取不同的排序规则
		 * @param $user_model 用户模型
		 * @param $where 查询条件
		 * @return mixed 按查询条件返回的数组
		 */
		private function getLineListByOrder($user_model,$where){
			if (!empty(I('get.sort_id'))){
				if (I('get.sort_id') <= 3){
					$id_status = I('get.sort_id') == 2? 1:2;
					$username_status = 6;
					$realname_status = 9;
					$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status,'realname_status'=>$realname_status]);
					return I('get.sort_id') == 2 ? $this->lists($user_model,$where,'sort asc'):$this->lists($user_model,$where,'sort desc');
				}elseif (I('get.sort_id')<= 6){
					$id_status = 3;
					$username_status = I('get.sort_id') == 5? 4:5;
					$realname_status = 9;
					$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status,'realname_status'=>$realname_status]);
					return I('get.sort_id') == 5 ? $this->lists($user_model,$where,'goods_sn asc'):$this->lists($user_model,$where,'goods_sn desc');
				}elseif (I('get.sort_id')<= 9){
					$id_status = 3;
					$username_status = 6;
					$realname_status = I('get.sort_id') == 8? 7:8;
					$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status,'realname_status'=>$realname_status]);
					return I('get.sort_id') == 8 ? $this->lists($user_model,$where,'name asc'):$this->lists($user_model,$where,'name desc');
				}
			}else{
				$id_status = 3;
				$username_status = 6;
				$realname_status = 9;
				$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status,'realname_status'=>$realname_status]);
				return $this->lists($user_model,$where,'update_time desc');
			}
		}



	}
?>