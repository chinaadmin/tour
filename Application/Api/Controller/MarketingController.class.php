<?php
/**
 * 营销接口
 * @author LIU
 * @date 2016-05-12
 */
namespace Api\Controller;
class MarketingController extends ApiBaseController {

	
	public function banner(){
		$type = I('post.type');
		if($type){
			$data['data'] = array_values($this -> banner_info($type));
			if($data['data']){
				$this->ajaxReturn($this->result->content($data)->success());
			}
		}
		$this->ajaxReturn($this->result->error('操作失败','error'));
	}
	
	
	private function banner_info($type=""){
		if(!$type){
			return false;
		}
		$startpage = D('StartPage');
		switch($type){
			case 1:
				
				//APP启动页接口
				$where['s_type'] = 1;
				$limit = '1';
				break;
			case 2:
				
				//2：首页顶部banner
				$where['s_type'] = 2;
				$limit = '5';
				break;
			case 3:
				
				//3:首页简介
				$where['s_type'] = 3;
				$limit = '1';
				break;
			default:
			return false;
		}
		$where['s_state'] = 1;
		$lists = $startpage -> where($where) -> limit($limit) ->order('s_display desc,s_time desc') ->select();
		$img = M('attachment');
		foreach($lists as $k => &$v){
			if($v['fk_attr_id']){
				$img_nfo = $img ->where(['att_id' => $v['fk_attr_id']]) ->  find();
				$v['img_url'] = 'http://'.$_SERVER['HTTP_HOST'].$img_nfo['path']."/".$img_nfo['name'].".".$img_nfo['ext'];
			}else{
				$v['img_url']= "";
			}
			unset($v['s_display']);
			unset($v['s_type']);
			unset($v['fk_attr_id']);
			unset($v['s_state']);
			unset($v['s_time']);
		}
		return $lists;
	}

	//国内游推荐
	public function domestic_tour(){
		$data = M('domestic_tour') -> where(['dt_state' =>1]) ->order('dt_time desc') ->field('dt_id,dt_name,fk_attr_id') -> select();
		$rs = $this ->get_img($data);
		
		if($data){
			$datas['data']=array_values($rs);
			$this->ajaxReturn($this->result->content($datas)->success());
		}else{
			$this->ajaxReturn($this->result->error('操作失败','error'));
		}
		
	}
	
	/*
	 * 获取标签绑定产品
	 */
	public  function domestic_goods(){
		$search = I('post.search','');
		if($search){
			$data = explode(',',trim($search,","));
			for($i=0;$i<count($data);$i++){
				$res[$i] = array('like',"%{$data[$i]}%");
			}
			$res[] = "or";
			$where['destination'] = $res;
		}


		$dt_id = I('post.dt_id',"",'int');
		$data = "";
		if (empty($dt_id)){
			$this -> ajaxReturn($this -> result ->conte);
		}
		$id = M('domestic_tour') -> where(['dt_id'=>$dt_id]) ->field('fk_tat_id as id') ->find();
		if($id['id']){
			$id = explode(',',$id['id']);
			for($i=0;$i<count($id);$i++){
				$arr[$i] = array('like','%"'.$id[$i].'"%');
			}
			$arr[] = "or";
			$where['tag_id'] = $arr;
			$data = D('Admin/Product')->wheres($where) -> formatData();
		}
		if(!empty($data)){
			$datas['data'] = $data;
		}else{
			$datas['data'] = array();
		}

		$this -> ajaxReturn($this ->result -> content($datas)->success());
		
	}
	private function get_img($data,$field="fk_attr_id"){
		$img = M('attachment');
		
		if(is_array($data)){
			foreach($data as $k =>&$v){
				if($v[$field]){
					$img_nfo = $img ->where(['att_id' => $v[$field]]) ->  find();
					if($img_nfo){
						$v['img_url'] = 'http://'.$_SERVER['HTTP_HOST'].$img_nfo['path']."/".$img_nfo['name'].".".$img_nfo['ext'];
					}else{
						$v['img_url']= "";
					}
				}else{
					$v['img_url']= "";
				}
				unset($v[$field]);
			}
		}else{
			if($data[$field]){
				$img_nfo = $img ->where(['att_id' => $v['fk_attr_id']]) ->  find();
				$data['img_url'] = 'http://'.$_SERVER['HTTP_HOST'].$img_nfo['path']."/".$img_nfo['name'].".".$img_nfo['ext'];
			}else{
				$data['img_url'] = '';
			}
			unset($data[$field]);
		}
		
		return $data;
	}

	//获取保险信息
	public function getInsurance(){
		$this ->authToken();
		$goods_id = I('post.goods_id','','int');
		$insu_id = json_decode(M('goods') -> where(['goods_id'=> $goods_id]) -> getField('insu_id'),true);

		if(!empty($insu_id)){
			$where['id'] = array('in',$insu_id);
		}else{
			$re['data'] = array();
			$this ->ajaxReturn($this->result->content($re) ->success());
		}
		$data = M('insurance') ->where($where) -> field('id,name,costs') ->select();
		if(empty($data)){
			$re['data'] = array();
		}else{
			$re['data'] = $data;
		}
		$this ->ajaxReturn($this->result->content($re) ->success());
	}
	
}