<?php
	/**
	 * 线路模型
	 * @author qrong
	 * @date 2015-05-11
	 */
	namespace Admin\Model;
	use Common\Model\AdminbaseModel;

	class ProductModel extends AdminbaseModel{
		protected $tableName = "goods";
		protected $data = null;
		
		public function _initialize(){
			parent::_initialize();
		}

		/**
		 * get the line product viewModel
		 */
		public function getLineProduct()
		{
			$viewFields = [
				'goods'=>[
					"*",
					"_type"=>"LEFT"
				],
				'cate'=>[
					"pid",
					"name"=>'cate_name',
					"_on"=>"goods.cat_id=cate.cat_id",
				]
			];
			return $this->dynamicView($viewFields);
		}
		/*
		 *	添加线路
		 *	@param Array $data 商品主表数据
		 *	@param Array $dat  商品团期表数据
		 *	@param Array $address  商品附表数据（地址id数组）
		 */
		public function add($data,$dat,$address){
			$date = array();
			$this->startTrans();
			if(is_array($data)){
				$goods_id = M('Goods')->add($data);
			}
// 
			if(!$goods_id){
				$this->rollback();
				return $this->result()->error();
			}

			if($data['for_child']==0){
				foreach($dat as $k => $v){
					$date[$k]=array(
						'goods_id'		=>	$goods_id,
						'date_time'		=>	strtotime(date('Y-m-d',$v['time'])),
						'stock'			=>	$v['stock'],
						'adult_price'	=>	$v['adult'],
					);
				}
			}else{
				foreach($dat as $k => $v){
					$date[$k]=array(
						'goods_id'		=>	$goods_id,
						'date_time'		=>	strtotime(date('Y-m-d',$v['time'])),
						'stock'			=>	$v['stock'],
						'adult_price'	=>	$v['adult'],
						'child_price'	=>	$v['child'],
					);
				}
			}
			$goods_depart = array();
			$goods_destination = array();
			if($address['depart_id']){	//线路出发地表信息写入
				foreach($address['depart_id'] as $k=>$v){
					$goods_depart[$k]=array(
						'goods_id'=>$goods_id,
						'depart_id'=>$v,
					);
				}
				$departRes = M('GoodsDepart')->addAll($goods_depart);
				if($departRes==false){
					$this->rollback();
					return $this->result()->error();
				}
			}
			
			if($address['dt_id']){	//线路目的地表信息写入
				foreach($address['dt_id'] as $k=>$v){
					$goods_depart[$k]=array(
						'goods_id'=>$goods_id,
						'depart_id'=>$v,
					);
				}
				$destinationRes = M('GoodsDestination')->addAll($goods_depart);
				if($destinationRes==false){
					$this->rollback();
					return $this->result()->error();
				}
			}

			$goods_date = M('GoodsDate')->addAll($date);
			if($goods_date!==false){
				$this->commit();
				return $this->result()->success();
			}else{
				$this->rollback();
				return $this->result()->error();
			}
		}

		/*
		 *	保存线路信息
		 *	@param $data 更新的主表数据
		 *	@param $dat  更新的团期信息表数据
		 *	@param $address  更新的出发地、目的地数据
		 */
		public function saveData($goods_id,$data,$dat,$address){
			$date = array();
			$this->startTrans();
			
			//团期修改  第一版
			/*$startTime = M('Goods')->where(['goods_id'=>$goods_id])->getField('start_time');
			if(empty($data['start_time']) || ($data['start_time'] == $startTime)){
				//如果团期时间为空或者与之前的一样，不修改团期信息表

				unset($data['stock']);
				unset($data['start_time']);
				unset($data['end_time']);
				unset($data['for_child']);
				unset($data['adult_price']);
				unset($data['child_price']);

				$res = M('Goods')->where(['goods_id'=>$goods_id])->save($data);
				
				if($res==false){
					$this->rollback();
					return $this->result()->error();
				}
			}else{	//团期时间与之前不一致，更新团期信息
				$res = M('Goods')->where(['goods_id'=>$goods_id])->save($data);
				if($res==false){
					$this->rollback();
					return $this->result()->error();
				}
				
				if($data['for_child']==0){
					for($i=0;$i<31;$i++){
						if($i==0){
							$dateTimes = $data['start_time'];
						}else{
							$dateTimes = $data['start_time']+($i*86400);
						}
						$date[$i]=array(
							'goods_id'		=>	$goods_id,
							'date_time'		=>	$dateTimes,
							'stock'			=>	$data['stock'],
							'adult_price'	=>	$dat['adult_price'],
						);
					}
				}else{
					for($i=0;$i<31;$i++){
						if($i==0){
							$dateTimes = $data['start_time'];
						}else{
							$dateTimes = $data['start_time']+($i*86400);
						}
						$date[$i]=array(
							'goods_id'		=>	$goods_id,
							'date_time'		=>	$dateTimes,
							'stock'			=>	$data['stock'],
							'adult_price'	=>	$dat['adult_price'],
							'child_price'	=>	$dat['child_price'],
						);
					}
				}
				
				$deleteDate = M('GoodsDate')->where(['goods_id'=>$goods_id])->delete();
				$goodsDate = M('GoodsDate')->addAll($date);
				if($goodsDate == false){
					$this->rollback();
					return $this->result()->error();
				}
			}*/

			//团期修改  第二版
			if($data['checkAll']==1){	//如果勾选了批量设置，更新团期信息
				if($data['for_child']==0){
					foreach($dat as $k => $val){
						$date[$k]['goods_id']=$goods_id;
						$date[$k]['date_time']=strtotime(date('Y-m-d',$val['time']));
						$date[$k]['stock']=$val['stock'];
						$date[$k]['adult_price']=$val['adult'];
					}
				}else{
					foreach($dat as $k => $val){
						$date[$k]['goods_id']=$goods_id;
						$date[$k]['date_time']=strtotime(date('Y-m-d',$val['time']));
						$date[$k]['stock']=$val['stock'];
						$date[$k]['adult_price']=$val['adult'];
						$date[$k]['child_price']=$val['child'];
					}
				}

				$deleteDate = M('GoodsDate')->where(['goods_id'=>$goods_id])->delete();
				$goodsDate = M('GoodsDate')->addAll($date);
				if($goodsDate == false){
					$this->rollback();
					return $this->result()->error();
				}

				$res = M('Goods')->where(['goods_id'=>$goods_id])->save($data);
				if($res==false){
					$this->rollback();
					return $this->result()->error();
				}
			}else{
				unset($data['stock']);
				unset($data['start_time']);
				unset($data['end_time']);
				unset($data['for_child']);
				unset($data['adult_price']);
				unset($data['child_price']);
				unset($data['checkAll']);

				$res = M('Goods')->where(['goods_id'=>$goods_id])->save($data);
				if($res==false){
					$this->rollback();
					return $this->result()->error();
				}
			}
			
			$goods_depart = array();
			$goods_destination = array();
			if($address['depart_id']){	//线路出发地表信息写入
				$deleteDepart = M('GoodsDepart')->where(['goods_id'=>$goods_id])->delete();
			
				foreach($address['depart_id'] as $k=>$v){
					$goods_depart[$k]=array(
						'goods_id'=>$goods_id,
						'depart_id'=>$v,
					);
				}
				$departRes = M('GoodsDepart')->addAll($goods_depart);
				if($departRes==false){
					$this->rollback();
					return $this->result()->error();
				}
			}
			
			if($address['dt_id']){	//线路目的地表信息写入
				$deleteDestination = M('GoodsDestination')->where(['goods_id'=>$goods_id])->delete();
			
				foreach($address['dt_id'] as $k=>$v){
					$goods_depart[$k]=array(
						'goods_id'=>$goods_id,
						'depart_id'=>$v,
					);
				}
				$destinationRes = M('GoodsDestination')->addAll($goods_depart);
				if($destinationRes==false){
					$this->rollback();
					return $this->result()->error();
				}
			}
			
			if($res!==false){
				$this->commit();
				return $this->result()->success();
			}
		}


		/**
		 *	获取最低成人价格
		 *	@param $goods_id 线路id
		 *	@param $start_time 开始时间
		 *	@param $type 哪里调取  0为后台(默认)，1为前台
		 */
		public function getMinPrice($goods_id,$start_time,$type=0){
			if($type==0){
				return M('GoodsDate')->where(['goods_id'=>$goods_id])->order('adult_price')->limit(1)->getField('adult_price');
			}else{
				$where=array(
					'goods_id'=>$goods_id,
					'date_time'=>array('egt',$start_time)
				);

				return M('GoodsDate')->where($where)->order('adult_price')->limit(1)->getField('adult_price');
			}
		}

		/**
		 *	获取关联的标签
		 *	@param $tag_id Array 关联标签数组
		 *	@return String 
		 */
		public function getLinkTag($tag_id){
			if(empty($tag_id)){
				return;
			}else{
				$tag = M('GoodsTag')->where(array('tag_id'=>array('IN',$tag_id)))->select();
				$tag_list=array_column($tag,'name');
				$tag_str=implode('、',$tag_list);


				return $tag_str;
			}
		}
		
		/**
		 *	获取所有标签IMG
		 *	@param
		 *	@return Array 
		 */
		public function getLinkTagImg($data){
			if(empty($data)){
				return $arr=[];
			}
			$arr= [];
			$img = M('attachment');
			$map['tag_id'] = array('in' , $data);
			$tag = M('GoodsTag')->where($map) ->field('tag_attr') ->select();
			// print_r($tag);exit();
			if(is_array($data)){
				foreach($tag as $k=>$v){
					$img_nfo = $img ->where(['att_id' => $v['tag_attr']]) ->  find();
					if(!empty($img_nfo)){
						$arr[] = 'http://'.$_SERVER['HTTP_HOST'].$img_nfo['path']."/".$img_nfo['name'].".".$img_nfo['ext'];
					}else{
						$arr=array();
					}
				}
			}else{
				$img_nfo = $img ->where(['att_id' => $data]) ->  find();
				if(!empty($img_nfo)){
					$arr = 'http://'.$_SERVER['HTTP_HOST'].$img_nfo['path']."/".$img_nfo['name'].".".$img_nfo['ext'];
				}else{
					$arr="";
				}
				
			}
			return $arr;
			
		}
		
		/*
		 *	获取IMG
		 *	@param data 附件ID
		 *  @param type 是否返回数组
		 *	@return Array 
		*/
		
		public function getImg($data,$type=false){
			if(empty($data)){
				if($type){
					return array();
				}else{
					return $arr="";
				}
				
			}
			$arr= [];
			$img = M('attachment');
			
			if(is_array($data)){
				for($i=0; $i<count($data);$i++){
					$img_info = $img ->where(['att_id' => $data[$i]]) ->  find();
					if(!empty($img_info)){
						$arr[] = 'http://'.$_SERVER['HTTP_HOST'].$img_info['path']."/".$img_info['name'].".".$img_info['ext'];
					}
				}
			}else{
				$img_info = $img ->where(['att_id' => $data]) ->  find();
				if(!empty($img_info)){
					$arr = 'http://'.$_SERVER['HTTP_HOST'].$img_info['path']."/".$img_info['name'].".".$img_info['ext'];
				}else{
					$arr = "";
				}
				
			}
			if($type && empty($arr)){
				return array();
			}
			return $arr;
			
		}
		
		/**
		 *	获取线路产品信息
		 *	@param $goods_id 线路产品id
		 *	@return Array
		 */
		public function getGoodsInfo($goods_id){
			return M('Goods')->where(['goods_id'=>$goods_id])->find();
		}
		
		/**
		 *	获取线路团期信息
		 *	@param $goods_id 线路产品id
		 *	@return Array
		 */
		public function getDateList($goods_id){
			return M('GoodsDate')->where(['goods_id'=>$goods_id])->order('date_time')->select();
		}
		
		/**
		 *	获取线路出发地信息列表
		 *	@param $goods_id 线路产品id
		 *	@return Array
		 */
		public function getDepartList($goods_id){
			$viewFields = array (
				'Depart' => array (
					"name",
					'_as' => "d",
					'_type' => 'LEFT'
				),
				'GoodsDepart' => array (
					"depart_id",
					'_as' => "g" ,
					'_on' => 'd.depart_id=g.depart_id',
					'_type' => 'LEFT' 
				)
			);
		
			if(empty($goods_id)){
				return [];
			}
			return $this->dynamicView($viewFields)->where(['goods_id'=>$goods_id])->select();
		}
		
		/**
		 *	获取线路目的地信息列表
		 *	@param $goods_id 线路产品id
		 *	@return Array
		 */
		public function getDestinationList($goods_id){
			$viewFields = array (
				'Depart' => array (
					"name",
					'_as' => "d",
					'_type' => 'LEFT'
				),
				'GoodsDestination' => array (
					"depart_id",
					'_as' => "g" ,
					'_on' => 'd.depart_id=g.depart_id',
					'_type' => 'LEFT' 
				)
			);
		
			if(empty($goods_id)){
				return [];
			}
			return $this->dynamicView($viewFields)->where(['goods_id'=>$goods_id])->select();
		}
		
		/**
		 *	获取线路产品信息
		 *	@param $goods_id 线路产品id
		 *	@return Array
		 */
		public function getGoodsInfos($goods_id){
			$this -> data =  $this->where(['goods_id'=>$goods_id])->find();			
			return $this;
		}
		
		/**
		 *	获取线路产品信息
		 *	@param $goods_id 线路产品id
		 *	@return Array
		 */
		public function wheres($where){
			$this -> data =  $this ->where($where)->select();
			return $this;
		}

		/**
		 *	通过地点获取线路产品信息
		 *	@param $data 目的地名或线路名称
		 *	@return Array
		 */
		public function getInfo($data,$page=1){
			if(is_array($data)){
				for($i=0;$i<count($data);$i++){
					$arr[$i] = array('like',"%{$data[$i]}%");	
				}
				$arr[] = "or";
				$where['destination|name'] = $arr;
			}else{
				$where['destination|name'] = array('like',"'%".$data."%'");
			}
			$where['is_sale'] = 1;
			//$limits = $this -> limits($where,$page);
			$this ->data = $this-> where($where)-> order("sort desc,update_time desc") ->page($page,10)-> select();
			return $this;
		}
		
		/**
		 *	获取所有属性
		 *	@param
		 *	@return Array 
		 */
		public function getTypeAll(){
			$arr= [];
			$tag = M('goods_type')->select();
			foreach($tag as $k=>$v){
				$arr[$v['type_id']] = $v['name'];
			}
			return $arr;
			
		}
		
		/**
		 *	获取出发日期
		 *	@param goods_id 产品ID
		 *	@return Array 
		*/
		
		public function getDays($goods_id){

			$day['type'] = 1;
			$where['date_time'] = array('GT',time());
			$re = M('goods_date') -> where($where)->count();
			if($re<=0){
				$day['type'] = 2;
				$day['contens'] = "团期已结束";
			}else if($re == 1){
				$day['contens'] = date('n月d日',M('goods_date') -> where($where)->getfield('date_time'));
			}else if($re == 2){
				$res = M('goods_date') -> where($where)->field('date_time') -> select();
				$day['contens'] = date('n月d日',$res[0]['date_time'])."、".date('n月d日',$res[1]['date_time']);
			}else{
				$day['contens'] = date('n月d日',M('goods_date') -> where($where)->getfield('date_time'))."...".date('n月d日',M('goods_date') -> where($where)->order('date_time desc')->getfield('date_time'));
			}
			return $day;
		}
		
		/**
		 *	格式化列表数据
		 *	@param type 是格式化数据
		 *	@return Array 
		*/
		
		public function formatData($type=false){
			
			if($type){
				return $this -> data;
			}
			
			$type = $this -> getTypeAll();
			$re = $this -> data;
			if(empty($re)){
				return false;
			}
			foreach($re as $k =>$v){
				$tag_id = json_decode($v['tag_id'],true);
				// print_r($tag_id);exit();
				
				/*if(!empty($tag_id)){
					$getLinkTagImg = $this -> getLinkTagImg($tag_id);
				}
				$datas[$k]['tag'] = empty($getLinkTagImg)?array():$getLinkTagImg;*/
				if(!empty($tag_id)){
					//$getLinkTagImg = $this -> getLinkTagImg($tag_id);
					$where['tag_id'] = ['in',$tag_id];
					$tag_name = M('goods_tag')->field('name')->where($where)->select();
				}
//			$datas['tag'] = empty($getLinkTagImg)?array():$getLinkTagImg;
				$datas[$k]['tag_name'] = empty($tag_name)?array():$tag_name;
				$type_id = json_decode($v['type_id'],true);
				$arr = [];
				if(!empty($type_id)){
					for($i=0;$i<count($type_id);$i++){
						$arr[$i] = $type[$type_id[$i]];
					}
				}

				$datas[$k]['type'] = $arr;
				$datas[$k]['price'] =  $this -> getMinPrice($v['goods_id'],time());
				$datas[$k]['cat'] = M('cate') ->where(['cat_id'=>$re[$k]['cat_id']]) -> getfield('name');
				$datas[$k]['name'] = $re[$k]['name'];
				$datas[$k]['goods_id'] = $re[$k]['goods_id'];
				$datas[$k]['goods_id'] = $re[$k]['goods_id'];
				$datas[$k]['days'] = $re[$k]['days'].'天'.$re[$k]['nights'].'晚';
				$datas[$k]['date_time'] = $this -> getDays($v['goods_id']);
				$datas[$k]['cover'] = $this -> getImg($re[$k]['cover']);
			}
			return $datas;
		}
		
		/**
		 *	格式化单个产品数据
		 *	@param type 是格式化数据
		 *	@return Array 
		*/
		public function formatGoodsInfo($type=false){
			
			if($type){
				return $this -> data;
			}
			$type = $this -> getTypeAll();
			$re = $this -> data;
			// var_dump($re['feature']);exit;
			if(empty($re)){
				return false;
			}
			$tag_id = json_decode($re['tag_id'],true);

			if(!empty($tag_id)){
				//$getLinkTagImg = $this -> getLinkTagImg($tag_id);
				$where['tag_id'] = ['in',$tag_id];
				$tag_name = M('goods_tag')->field('name')->where($where)->select();
			}
//			$datas['tag'] = empty($getLinkTagImg)?array():$getLinkTagImg;
			$datas['tag_name'] = empty($tag_name)?array():$tag_name;

			$type_id = json_decode($re['type_id'],true);
			$arr = '';
			if(!empty($type_id)){
				for($i=0;$i<count($type_id);$i++){
					$arr .= $type[$type_id[$i]].'、';
				}
			}
			$datas['type'] = trim($arr,'、');
			$datas['price'] =  $this -> getMinPrice($re['goods_id'],time());
			$datas['cat'] = M('cate') ->where(['cat_id'=>$re['cat_id']]) -> getfield('name');
			$datas['name'] = $re['name'];
			$datas['goods_id'] = $re['goods_id'];
			$datas['goods_id'] = $re['goods_id'];
			$datas['days'] = $re['days'].'天'.$re['nights'].'晚';
			$datas['date_time'] = $this -> getDays($re['goods_id']);
			$datas['cover'] = $this -> getImg($re['cover']);
			$datas['accommodation'] = $re['accommodation'];
			$datas['traffic'] = $re['traffic'];
			$datas['goods_sn'] = $re['goods_sn'];
			$datas['advance'] = $re['advance'];
			$datas['is_sale'] = $re['is_sale'];
			$datas['depart'] = $re['depart'];
			$datas['destination'] = $re['destination'];

			$datas['features'] = json_decode($re['feature'],true);
			$datas['features']['feature'] = htmlspecialchars_decode($datas['features']['feature']);

			$datas['introduces'] = json_decode($re['introduce'],true);
			foreach ($datas['introduces'] as &$item) {
				$item['introduce'] = htmlspecialchars_decode($item['introduce']);
			}

			$datas['travel_costs'] = json_decode($re['travel_cost'],true);
			$datas['travel_costs']['travel_cost'] = htmlspecialchars_decode($datas['travel_costs']['travel_cost']);

			$datas['reminders'] = json_decode($re['reminder'],true);
			$datas['reminders']['reminder'] = htmlspecialchars_decode($datas['reminders']['reminder']);

			$datas['attribute_id'] = $this -> getImg(json_decode($re['attribute_id'],true),true);
			
			return $datas;
		}
		
		private function limits($where,$page=1){

			if((($page-1)*10)<=0){
				return 0;
			}
			$num = $this -> where($where) -> count();
			if(!$num){
				return 0;
			}
			/*if($num<(($page-1)*10)){
				return  $page-1*10;
			}*/
			/*if((($page-1)*10)>=(ceil($num/10)-1)*10){
				//echo (ceil($num/10)-1)*10;
				return (ceil($num/10)-1)*10;
			}*/


			return ($page-1)*10;
		}
		
		/**
		 *	线路类别产品搜索
		 *	@param  search 搜索条件
		 *	@return Array 
		 */
		public function category_search($page=1,$where=""){

			$limits = $this -> limits($where,$page);
			$this ->data = $this-> where($where)-> order("sort desc,update_time desc") ->limit($limits*10,10)-> select();
			return $this;
		}
		
		/**
		 *	获取精选线路类别产品
		 *	@param  page 分页
		 *	@return Array 
		*/
		public function getRoutes($page=1){
			$where['is_sale'] = 1;
			$where['is_featured'] = 1;
			$limits = $this->limits($where,$page);
			$data = $this-> where($where)-> order("fk_sort desc,update_time desc") ->limit($limits,10)-> select();
			$goods_id = array_column($data,'goods_id');
			
			if($goods_id){
				$wheres['fk_goods_id'] = array('in',$goods_id);
				$re = M('goods_title') -> where($wheres) -> select();
			}
			
			$arr=[];
			foreach($re as $k=>$v){
				$arr[$v['fk_goods_id']] = $v;
			}
			
			$datas = "";
			foreach($data as $k => $v){
				$datas[$k]['goods_id'] = $v['goods_id'];
				$datas[$k]['name'] = $v['name'];
				$datas[$k]['price'] =  $this -> getMinPrice($v['goods_id'],time());
				$datas[$k]['cat'] = M('cate') ->where(['cat_id'=>$v['cat_id']]) -> getfield('name');
				$datas[$k]['title'] = $arr[$v['goods_id']]['title'];
				$datas[$k]['titles'] = $arr[$v['goods_id']]['titles'];
				$img = json_decode($v['attribute_id'],true);
				$datas[$k]['img_url'] = $this -> getImg($img[0]);
			}
			
			return $datas;
		}
	}