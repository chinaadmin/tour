<?php
namespace Api\Controller;
class AssignAccountController extends ApiBaseController {
	/**
	 * 批量给未分配账户的用户分配积分、余额数据
	 *
	 */
	public function assignAccount(){
		$userList = M('User')->field('uid')->where(['delete_time'=>0])->select();
		$accountList = M('AccountCredits')->field('uid,type')->select();

		$uidList = array_column($userList,'uid');

		$balanceUid  = [];
		$integralUid = [];
		$otherUid    = [];
		foreach($accountList as $key => $val){
			if($val['type'] == 0){
				$balanceUid[]  = $val['uid'];
			}elseif($val['type'] == 1){
				$integralUid[]  = $val['uid'];
			}elseif($val['type'] == 2){
				$otherUid[]  = $val['uid'];
			}
		}

		$assignBalance  = array_diff($uidList,$balanceUid);   //需分配余额数据的用户id
		$assignIntegral = array_diff($uidList,$integralUid);  //需分配积分数据的用户id
		$assignOther    = array_diff($uidList,$otherUid);     //需分配不可提现金额数据的用户id

		if(empty($assignBalance) && empty($assignIntegral) && empty($assignOther)){
			echo "不存在需初始化的用户！";exit;
		}

		$balanceData  = [];
		$integralData = [];
		$otherData    = [];
		if($assignBalance){
			foreach($assignBalance as $v){
				$balanceData[]=[
					'uid' => $v,
					'type' => 0,
					'credits' => 0,
					'up_time' => NOW_TIME,
				];
			}
		}
		
		if($assignIntegral){
			foreach($assignIntegral as $v){
				$integralData[]=[
					'uid' => $v,
					'type' => 1,
					'credits' => 0,
					'up_time' => NOW_TIME,
				];
			}
		}

		if($assignOther){
			foreach($assignOther as $v){
				$otherData[]=[
					'uid' => $v,
					'type' => 2,
					'credits' => 0,
					'up_time' => NOW_TIME,
				];
			}
		}

		$data = array_merge($balanceData,$integralData,$otherData);
		if(M('AccountCredits')->addAll($data) === false){
			echo "\n分配账户失败!\n";exit;
		}
		echo "\n分配账户成功!\n";
	}
}