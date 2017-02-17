<?php
namespace Api\Controller;
use  Common\Org\Ttrans\baiduTtransApi;
class GoodsController extends ApiBaseController {
	
	public function _initialize(){
		parent::_initialize();
		$this->Product = D("Admin/Product");
	}
	
	/*
	 *	线路目的地产品搜索
	 *	@param  search 搜索条件
	 *	@return Array 
	 */
	public function goods_search(){
		$search = I('post.search');
		$page = I('post.page','1');
		$data = explode(',',trim($search,","));
		$re =   $this->Product-> getInfo($data,$page) -> formatData();
		if(empty($re)){
			$re = array();
		}
		$this ->data($re);
	}
	
	/*
	 *	线路类别产品搜索
	 *	@param  search 搜索条件
	 *	@return Array 
	 */
	public function category_search(){
		$page = I('post.page','1','int');
		/*print_r($where);
		die;*/
		$Product = $this->Product->category_search($page,$this -> where()) -> formatData();
		if(empty($Product)){
			$Product = array();
		}
		
		$this ->data($Product);
		
	}
	
	//精选路线推荐
	
	public function routes(){
		$page = I('post.page','1','int');
		$re = $this->Product -> getRoutes($page);
		if(empty($re)){
			$re = array();
		}
		$this ->ajaxReturn($this ->result->content(['data'=>$re])->success());
	}
	
	//获取商品详情
	public function get_info(){
		$goods_id = I("post.goods_id");
		if($goods_id){
			$data = $this -> Product -> getGoodsInfos($goods_id) ->formatGoodsInfo();
		}
		$data['depart'] = $this ->getDepart($data['goods_id']);
		$data['destination'] = $this ->getDestination($data['goods_id']);
		$this -> data($data);
	}
	
	public function data($data){
		if(empty($data)){
			$data = array();
		}
		$this ->ajaxReturn($this ->result->content(['data'=>$data])->success());
	}
	//获取出发地
	private function getDepart($goods_id){
		$depart = M('goods_depart');
		$re = $depart->alias('gd') -> join('LEFT JOIN __DEPART__ d ON gd.depart_id =d.depart_id')->field('d.name')->where(['gd.goods_id'=>$goods_id])->select();
		return implode(array_column($re,'name'),',');
		
	}
	
	//获取目的地
	private function getDestination($goods_id){
		$depart = M('goods_destination');
		$re = $depart->alias('gd') -> join('LEFT JOIN __DEPART__ d ON gd.depart_id =d.depart_id')->field('d.name')->where(['gd.goods_id'=>$goods_id])->select();
		return implode(array_column($re,'name'),',');
		
	}
	
	//获取价格
	public function get_price(){
		$goods_id = I("post.goods_id",'','int');
		if(!$goods_id){
			$this -> data();
		}
		$advance = $this -> Product -> where(['goods_id'=>$goods_id]) -> getfield('advance');
		$where['date_time'] = array('egt',strtotime(date('Y-m-d',strtotime("+{$advance} day"))));
		$where['goods_id'] = $goods_id;
		$price = M('goods_date') -> where($where) ->field('date_time,stock,adult_price,child_price') ->order('date_time asc') -> select();
		
		$this -> data($price);
	}

	private function where(){
		$cat_id = I('post.cat_id',"",'int');
		if(!$cat_id){
			$this ->data("");
		}
		// 分类及子分类
		$page = I('post.page',1,'int');
		$arr[] = $cat_id;
		$id = M('cate') -> where(['pid' =>$cat_id]) -> field('cat_id') -> select();
		if(!empty($id)){
			foreach($id as $v){
				$arr[] = $v['cat_id'];
			}
		}
		$where['cat_id'] = array('in',$arr);
		//目的地 或 产品名称
		$search = I('post.search',"");
		if($search){
			$searchs = explode(',',trim($search,","));
			if($searchs){
				$arr = '';
				for($i=0;$i<count($searchs);$i++){
					$arr[$i] = array('like',"%{$searchs[$i]}%");
				}
				$arr[] = "or";
				$where['destination|name'] = $arr;
			}
		}

		// 绑定标签
		$dt = I('post.dt_id','');
		if($dt){
			$dt_id = M('domestic_tour') -> where(['dt_id' => $dt]) -> getField('fk_tat_id');
			if($dt_id){
				$id = explode(',',trim($dt_id,","));
				$arr = '';
				for($i=0;$i<count($id);$i++){
					$arr[$i] = array('like',"%{$id[$i]}%");
				}
				$arr[] = "or";
				// print_r($arr);exit();
				$where['tag_id'] = $arr;
			}else{
				$this ->data('');
			}

		}
		$where['is_sale'] = 1;
		return $where;
	}
}