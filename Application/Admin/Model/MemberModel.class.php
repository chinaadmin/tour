<?php
/**
 * 会员管理模型
 * @author  liu
 * @date 2016-7-11
 */
namespace Admin\Model;
use Common\Model\AdminbaseModel;
class MemberModel extends AdminbaseModel{
	protected $tableName = "member";
	private $membeData = null;


	/*
	 * 获取会员列表
	 * @return array
	 */
	public function getMember($where=true)
	{
		$re = $this -> where($where)->select();

		$this -> membeData = $re;
		return $this ;
	}

	/**
	 * @return array
	 */
	public function formatData($fielde="",$data='')
	{
		$arr = null;
		if(empty($data)){
			$re = $this -> membeData;
		}
		if($fielde){
			if(is_array($fielde)){
				foreach ($re as $k=>$v){
					for ($i=0;$i<count($fielde);$i++){
						$arr[$k][$fielde[$i]] = $v[$fielde[$i]];
					}
				}
			}else{
				foreach ($re as $k=>$v){
					$arr[$k] = $v[$fielde];
				}
			}
		}else{
			return $re;
		}
		return $arr;
	}

	/**
	 * @return array
	 */
	public function formatName($fielde='',$data='')
	{
		if(empty($data)){
			$re = $this -> membeData;
		}
		foreach ($re as $k=>$v){
			if($fielde){
				$arr[$v[$fielde]] = $v['member_name'];
			}else{
				$arr[$k] = $v['member_name'];
			}
		}
		return $arr;
	}


	/**
	 * 通过ID获取会员名称
	 * @return string
	 */
	public function getName($member_id)
	{
		if(!$member_id){
			return false;
		}
		return $this -> where(['member_id'=>$member_id])->getField('member_name');
	}

	/*
	 * 检测卡号的唯一
	 * @param number 卡号
	 * @param type 1:个人VIP 2家庭VIP
	 * @return
	 */

	public function numberUniqID($uid,$number,$type=1){
		if(empty($number)){
			return true;
		}
		if($type==1){
			if(800000>$number || $number>810001){
				return true;
			}

		}else{
			if(900000>$number || $number>910001){
				return true;
			}
		}
		if(M('user') -> where(['one_number|family_number'=>$number,'uid'=>['NEQ',$uid]]) ->find() || !M('member_id') -> where(['num'=>$number,'del_time'=>0]) ->find()){
				return true;
		}
		return false;
	}

	/*
	 * 生成卡号
	 * @param type 1:个人VIP 2家庭VIP
	 * @return string
	 */
	public function getNumber($type=2){

		$num = M('member_id') -> where(['type'=> $type-1,'del_time ' =>0])->order('id asc') -> field('id,num')->find();
		if(M('member_id') -> where(['id'=>$num['id']]) -> save(['del_time'=>time()])){
			return $num['num'];
		}
		return false;
	}
}