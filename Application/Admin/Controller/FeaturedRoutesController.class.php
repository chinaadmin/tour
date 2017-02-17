<?php
/**
 * 特色路线
 * @author LIU
 * @date 2016/5/25
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class  FeaturedRoutesController extends AdminbaseController{
	protected $curent_menu = 'FeaturedRoutes/index';
	
	private $product_model;
	public function _initialize(){
		parent::_initialize();
		$this->product_model = D("Admin/Product");
	}

	/**
	 * 产品中心
	*/
	public function index(){

		$list = $this -> info(1,'fk_sort desc,goods_id DESC',$pageSize);
		$goods_id = array_column($list,'goods_id');

		if($goods_id){
			$where['fk_goods_id'] = ['in',$goods_id];
			$re = M('goods_title') -> where($where) -> select();

			$arr=[];
			foreach($re as $k=>$v){
				$arr[$v['fk_goods_id']] = $v;
			}
		}

		$this -> assign('title',$arr);
		$this->assign('list',$list);
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
	
	//添加
	public function add(){
		$list = $this -> info(0);
		
		$goods_id = array_column($list,'goods_id');
		
		if($goods_id){
			$where['fk_goods_id'] = ['in',$goods_id];
			$re = M('goods_title') -> where($where) -> select();
			
			$arr=[];
			foreach($re as $k=>$v){
				$arr[$v['fk_goods_id']] = $v;
			}
		}
		

		$this -> assign('title',$arr);
		$this -> assign('list',$list);
		$this->display('edit_add');
	}
	
	private function info($is_featured = 1,$sort="goods_id DESC",$pageSize){
		$where		=	array();
		$is_sale 	=	I('is_sale',1);
		$name 		=	I('name');
		$goods_sn	=	I('goods_sn');
		$minAdultPrice = I('minAdultPrice','','intval');
		if($name){
			$where['name']=array('LIKE','%'.$name.'%');
		}
		if($goods_sn){
			$where['goods_sn']=array('LIKE','%'.$goods_sn.'%');
		}
		if($is_sale){
			$where['is_sale']=$is_sale;
		}
		if(I('departName')){
			$where['depart'] = array('like','%'.I('departName').'%');
		}
		if(I('destination')){
			$where['destination'] = array('like','%'.I('destination').'%');
		}
		if($minAdultPrice){
			$li = M('GoodsDate')->where(['adult_price'=>$minAdultPrice])->group('goods_id')->select();
			$goodsIds = array();
			if(is_array($li)){
				foreach($li as $val){
					if(!in_array($val['goods_id'],$goodsIds)){
						$goodsIds[]=$val['goods_id'];
					}
				}

				$where['goods_id']=array('IN',$goodsIds);
			}
		}
		$where['is_featured'] = $is_featured;
		
		if($where){
			$list = $this->getRoutesListByOrder($this->product_model,$where);
		}else{
			$list = $this->getRoutesListByOrder($this->product_model,'');
		}

		foreach($list as $k=>$v){
			$list[$k]['minAdultPrice']=$this->getMinAdultPrice($v['goods_id']);
			$list[$k]['linkTag']=$this->product_model->getLinkTag(json_decode($v['tag_id'],true));
		}
		
		return $list;
	}
	/**
	 * 根据不同点击获取不同的排序规则
	 * @param $user_model 用户模型
	 * @param $where 查询条件
	 * @return mixed 按查询条件返回的数组
	 */
	private function getRoutesListByOrder($user_model,$where){
		if (!empty(I('get.sort_id'))){
			if (I('get.sort_id') <= 3){
				$id_status = I('get.sort_id') == 2? 1:2;
				$username_status = 6;
				$this -> assign(['id_status'=>$id_status,'username_status'=>$username_status]);
				return I('get.sort_id') == 2 ? $this->lists($user_model,$where,'goods_sn asc'):$this->lists($user_model,$where,'goods_sn desc');
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
			return $this->lists($user_model,$where,"goods_id DESC");
		}
	}
	//更新数据
	public function updata(){
		
	
		$where['goods_id'] = array('in',I('post.goods_id'));
		
		$re = M('goods')->where($where) -> save(['is_featured' => 1]);
		if($re){
			$this->ajaxReturn(['msg'=>'success']);
		}else{
			$this->ajaxReturn(['msg'=>'error']);
		}
	}
	
	//删除精选路线数据
	public function deldata(){
		$where['goods_id'] = array('in',I('post.goods_id'));
		
		$re = M('goods')->where($where) -> save(['is_featured' => 0]);
		if($re){
			$this->ajaxReturn(['msg'=>'success']);
		}else{
			$this->ajaxReturn(['msg'=>'error']);
		}
	}
	
	//更新标题
	
	public function uptitle(){
		$data = I('post.data');
		if($data['name'] == 'sort'){
			if(is_numeric($data['contens']) && ($data['contens']>0)){
				if(M('goods') ->where(['goods_id'=>$data['goods_id']]) ->save(['fk_sort'=>$data['contens']])){
					$this->ajaxReturn(['msg'=>'success']);
				}
			}
		}else{
			if(M('goods_title')-> where(['fk_goods_id'=>$data['goods_id']]) -> count()){
				if(M('goods_title')-> where(['fk_goods_id'=>$data['goods_id']])->save([$data['name']=>$data['contens']])){
					$this->ajaxReturn(['msg'=>'success']);
				}
			}else{
				if(M('goods_title')-> add([$data['name']=>$data['contens'],'fk_goods_id'=>$data['goods_id']])){
					$this->ajaxReturn(['msg'=>'success']);
				}
			}
		}
		$this->ajaxReturn(['msg'=>'error']);
	}
}