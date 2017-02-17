<?php
/**
 * 商品模型
 * @author xiongzw
 * @date 2014-04-14
 */
namespace Admin\Model;
use Common\Model\AdminbaseModel;
class PromotionsModel extends AdminbaseModel{
	protected $tableName = "promotions";

	/*public function _initialize(){
		parent::_initialize();
		$id = I('post.id',0,'intval');
		if($id){
			$this->edit_where = array(
					'goods_id' => $id
			);
		}
	}*/
	public $_validate = [ 
			[ 
					'promotions_name',
					'require',
					'商品名称不能为空' 
			],
			/*[
					'promotions_name',
					'ifUniqueName',
					'商品名称已存在',
					0,
					'callback',
					self::MODEL_BOTH 
			],*/
			[
				'start_time',
				'require',
				'开始时间不能为空'

			],
			[
				'end_time',
				'require',
				'结束时间不能为空'

			],
			[
				'end_time',
				'require_time',
				'结束时间不能小于等于开始时间',
				0,
				'callback',
				self::MODEL_BOTH

			],
			[
				'number',
				'isNumbers',
				'每个用户限制享受次数不能小于-1',
				0,
				'callback',
				self::MODEL_BOTH
			]
	];
	
	//命名范围
	/*protected $_scope = [
			'default' => [  // 获取没有被删除状态
					'where' => [ 
							'delete_time' => [ 
									'eq',
									0 
							] 
					] 
			],
			'sale' => [  // 获取上架的商品
					'where' => [ 
							'delete_time' => [ 
									'eq',
									0 
							],
							'is_sale' => 1 
					] 
			] 
	];*/
	
	function ifUniqueName($goods_name){
		$where = [ 'name' =>$goods_name];
		$id = I ( 'post.promotions_id', 0, 'intval' );
		if($id){
			$where[$this->getPk()] = ['neq',$id]; //排除自身
		}
		$flag = $this->scope()->where($where)->count();
		return $flag ? false : true;  
	}
	function ifUniqueCode($goods_code){
		$id = I ( 'post.id', 0, 'intval' );
		$where = [ 'code' =>$goods_code];
		if($id){
			$where[$this->getPk()] = ['neq',$id]; //排除自身
		}
		$flag = $this->scope()->where($where)->count();
		return $flag ? false : true;
	} 
    public function checkOldPrice(){
    	$price = I("post.price",'','floatval');
    	$old_price = I("post.old_price",'','floatval');
    	if($old_price<=$price){
    		return false;
    	}else{
    		return true;
    	}
    }
	public function isNumbers(){
		$number = I('post.number',0,'intval');
		if($number < -1){
			return false;
		}
		return true;
	}
	public  function require_time(){
		$start_time =  strtotime(I('post.start_time'));
		$end_time  = strtotime(I('post.end_time'));
		if($end_time<=$start_time){
			return false;
		}
		return true;
	}
	
	/*
	 * 获取用户优惠价格
	 * @prarm string  	$uid 用户ID
	 * @prarm array  	$data 
	 *  				$data[time]     出行日期
	 *  				$data[goods_id] 商品ID
	 *  				$data[child]   儿童出行人数量
	 *  				$data[adult]   成人出行数量
	 * 					
	 */
	public function getDiscountPrice($uid,$data)
	{
		$re = '';
		$userLevel = M('user')->where(['uid'=> $uid]) -> getField('member_id');
		//if($userLevel <= 1|| $data['adult'] == 0){
		//	return 0;
		//}
		$where['promotions_type'] = array('in',[1,2]);
		$where['state'] = 1;
		$where['start_time'] = ['ELT',time()];
		$where['end_time'] = ['EGT',time()];
		$discount = $this -> where($where)->select();
		if(empty($discount)){
			return 0;
		}
		
		$arr = '';
		foreach ($discount as $v){
			$arr[$v['promotions_type']] = $v;
		}
			
		//计算第三人折扣
		if($arr[2]['number'] != -1){
			$w['promotions_type'] = 2;
			$w['start_time'] = $arr[2]['start_time'];
			$w['end_time'] = $arr[2]['end_time'];
			$w['goods_id'] = $data['goods_id'];
			$w['uid'] = $uid;
			$num = D('Admin/order') -> getProNum($w);
		}else{
			$num = -1;
		}
		//查询是否还享有优惠次数
		if($num != -1){
			if($arr[2]['number']-$num <=0){
				$num = false;
			}else{
				$num = true;
			}
		}else{
			$num = true;
		}
		$is_open = false;

		//判断用户相应的等级是否开启优惠活动
		switch ($userLevel){
			case 1:
				//个人VIP优惠
				if($arr[2]['ordinary_state'] == 1){
					$is_open = true;
				}
				break;
			case 2:
				//个人VIP优惠
				if($arr[2]['one_state'] == 1){
					$is_open = true;
				}
				break;
			case 3:
				//家庭VIP优惠
				if($arr[2]['family_state'] == 1){
					$is_open = true;
				}
				break;
			case 4:

				if($arr[2]['one_state'] == 1){
					$is_open = true;
				}
				if($arr[2]['family_state'] == 1){
					$is_open = true;
				}
				break;
		}

		//计算优惠价格
		if(!$is_open || !$arr[2] || ($arr[2]['travel']>($data['child']+$data['adult'])) || ($data['adult']<=0) || !$num){
			$price =0;
		}else{

			$dayPrice = M('goods_date')-> where(['date_time'=> $data['time'],'goods_id'=>$data['goods_id']]) -> Field('adult_price,child_price')->find();
			/*$wheres['min_price'] =array('ELT',$dayPrice['adult_price']);
			$wheres['man_price'] =array('EGT',$dayPrice['adult_price']);
			$pro = M('promotions_price') -> where($wheres)-> order('discount asc') ->getfield('discount');*/
			//计算折扣
			$promotionsPrice = $this -> getDiscount($dayPrice['adult_price']);
			if($promotionsPrice && $promotionsPrice>=1){
				if($data['child'] && $data['child'] >=1){
					$price =(10 - $promotionsPrice)/10*$dayPrice['child_price'];
				}else{
					$price =(10 - $promotionsPrice)/10*$dayPrice['adult_price'];
				}
				if(floor($price) >0){
					$re[0]['price'] = floor($price);
					$re[0]['name'] = $arr[2]['promotions_name'];
					$re[0]['type'] = 2;
					$re[0]['discount'] = $promotionsPrice;
				}

			}else{
				$price =0;
			}
		}

		//获取下单立减优惠
		$w = '';
		if($arr[1]['number'] != -1){
			$w['promotions_type'] = 1;
			$w['start_time'] = $arr[1]['start_time'];
			$w['end_time'] = $arr[1]['end_time'];
			$w['goods_id'] = $data['goods_id'];
			$w['uid'] = $uid;
			$num = D('Admin/order') -> getProNum($w);
		}else{
			$num = -1;
		}
		//判断用户相应的等级是否开启优惠活动
		$prices = 0;
		if($arr[1] ){
			switch ($userLevel){
				case 1:
					//个人VIP优惠
					if($arr[1]['ordinary_state'] == 1){
						$prices = $arr[1]['ordinary_price'];
					}
					break;
				case 2:
					//个人VIP优惠
					if($arr[1]['one_state'] == 1){
						$prices = $arr[1]['one_price'];
					}
					break;
				case 3:
					//家庭VIP优惠
					if($arr[1]['family_state'] == 1){
						$prices = $arr[1]['family_price'];
					}
					break;
				case 4:

					if($arr[1]['one_state'] == 1){
						$prices = $arr[1]['one_price'];
					}
					if($arr[1]['family_state'] == 1){
						$prices += $arr[1]['family_price'];
					}
					//$prices = $arr[1]['family_price']+$arr[1]['one_price'];
					break;
				default :
					$prices = 0;
			}

		}
		//计算优惠价格
		if(floor($prices)>0 && (($arr[1]['number']-$num > 0) || $num == -1)){
			$re[1]['price'] = floor($prices);
			$re[1]['name'] = $arr[1]['promotions_name'];
			$re[1]['type'] = 1;
			$re[1]['discount'] = '';
		}
		return $re;
	}

	/*
	 * 获取第三人指定价格 折扣
	 * @prarm price 价格
	 */
	public function getDiscount($price){
		if(!$price){
			return 0;
		}

		$where['min_price'] = ['ELT',$price];
		$where['man_price'] = ['EGT',$price];
		return M('promotions_price') -> where($where) -> order('man_price desc') -> getfield('discount');
	}

	/*
	 * 通过类型获取活动名称 折扣
	 * @prarm $type 活动类型
	 */
	public function getName($type){
		if(is_array($type)){
			$where['promotions_type'] = ['in',$type];
			return $this -> where($where) -> getField('promotions_type,promotions_name',true);
		}else{
			return $this -> where(['promotions_type'=> $type]) ->getfield('promotions_name');
		}
	}

}