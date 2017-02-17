<?php
/**
 * App首页控制器
 * @author xiongzw
 * @date 2015-06-30
 */
namespace Api\Controller;
class HomeController extends ApiBaseController{
	/**
	 * 首页顶部导航
	 * @author qrong
	 * @date 2016/5/16
	 */
	public function topNav(){
		$nav_model = D("Admin/nav");
		$banner = $nav_model->banner();
		if($banner){
			foreach($banner as $k=>&$v){
				$v['photo'] = 'http://'.C('jt_config_web_site_address').$v['photo'];
			}
			$this->ajaxReturn($this->result->success()->content(['navList'=>$banner]));
		}else{
			$this->ajaxReturn($this->result->error('操作失败','ERROR'));
		}
	}
	
	/**
	 * 广告位
	 */
	public function advent(){
		$home_model = D("Api/Home");
		$advent = $home_model->advent();
		$data = array();
		foreach ($advent as $key=>$v){
			$data[$key] = array(
					"name"=>$v['name'],
					"url"=>$v['url'],
					"goodsId"=>$v['goods_id'],
					"photo"=>fullPath($v['photo']),
					"photoAlt"=>$v['photo_alt']
			);
		}
		$this->ajaxReturn($this->result->success()->content(['adList'=>$data]));
	}
	
	/**
	 * 首页爆款
	 *      传入参数
	 *      <code>
	 *        count 获取个数(选传) 
	 *      </code>
	 */
	public function recommend(){
		$count = I("post.count",0,'intval'); //获取个数
		$data = D('Home/Recommend')->defaultHotList($count);
		/* foreach($data as &$v){
			$v['url'] = fullPath($v['url']);
			$v['photo'] = fullPath($v['photo']);
			$v['photoAlt'] = $v['photo_alt'];
			unset($v['photo_alt']);
			$v['marketPrice'] = $v['old_price'];
			unset($v['old_price']);
			$v['goodsId'] = $v['goods_id'];
			unset($v['goods_id']);
		} */
		$data = D('Api/Home')->formatRecommend($data);
		$this->ajaxReturn($this->result->success()->content(['goodsList'=>$data]));
	}
	
	/**
	 * 首页推荐位
	 *       传入参数
	 *       <code>
	 *       feat 商品展示位
	 *       </code>
	 */
	public function position($limit = 16){
		// $data= D("Home/Home")->featGoods('sort desc,sales desc,Goods.add_time',C("JT_CONFIG_WEB_RECOM_CONFIG_BOUT_NUM"),2,1);
		$data= D("Home/Home")->featGoods('sort desc,sales desc,Goods.add_time', $limit, 2, 1);
		$lists = array();
		foreach($data as $key=>&$v){
			$lists[$key] = array(
					"feat"=>$v['feat_id'],
					"featName"=>$v['feat_name'],
					"photo"=>fullPath($v['photo']),
					"goods"=>D("Api/Home")->formatPosition($v['goods'])
			);
		}
		$this->ajaxReturn($this->result->success()->content(['goodsList'=>$lists]));
	}
	
	/**
	 * 展位列表
	 */
	public function feats(){
		$data=  D("Admin/Feat")->getMobilelFeats(1,1);
		$lists = array();
		foreach($data as $key=>&$v){
			$lists[$key] = array(
					"feat"=>$v['feat_id'],
					"featName"=>$v['feat_name'],
					"photo"=>fullPath($v['photo']),
					'skipUrl' => $v['feat_url'] ? $v['feat_url'] : ''
			);
		}
		$this->ajaxReturn($this->result->success()->content(['featList'=>$lists]));
	}
	
	/**
	 * 首页品牌列表
	 *        传入参数
	 *        <code>
	 *        count 获取个数(选传)
	 *        </code>
	 */
	public function brands(){
		//$count = I("post.count",0,'intval');
		$brands = D("Home/Home")->getBrands(C("JT_CONFIG_WEB_BRAND_NUM"));
		$brands = D("Api/Home")->formatBrand($brands);
		$this->ajaxReturn($this->result->success()->content(['brands'=>$brands]));
	}
	/**
	 * 分类列表
	 */
	public function getCats(){
		$cats = D("Api/Home")->getCarts();
		$this->ajaxReturn($this->result->success()->content(['cats'=>$cats]));
	}
	
	/**
	 * App启动图片接口
	 */
	public function put(){
		$put_model = D("Admin/Put");
		$type = I("post.type","1",'trim');
		if(empty($type)){
			$type = 1;
		}
		$type = json_encode((array)$type);
		$is_guide = I("post.guide",0,'intval');
		$where = array(
				"put_status"=>1,
				"end_time"=>array("EGT",NOW_TIME),
				"is_guide"=>$is_guide,
				"put_type"=>$type,
		);
		$order = [];
		$order['put_sort'] = 'desc';
		$order['add_time'] = 'desc';
		$data = $put_model->where($where)->order($order)->select();
		D("Home/List")->getThumb($data,"",'put_attr');
		$return_array = array();
		foreach($data as $key=>$v){
			$return_array[$key] = array(
					"title"=>$v['put_title'],
					"url"=>$v['put_url'],
					"description"=>$v['put_description'],
					"photo"=>fullPath($v[thumb])
			);
		}
		$this->ajaxReturn($this->result->content(['list'=>$return_array]));
	}
	
	/**
	 * 首页活动
	 */
	public function activity(){
		$data = D("Home/Home")->getActivity(null,0,1);
	    $this->ajaxReturn($this->result->content(['activity'=>$data]));
	}
	
}