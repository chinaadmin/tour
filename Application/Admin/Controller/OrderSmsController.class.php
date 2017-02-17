<?php
/**
 * 短信推送管理 
 * @author qrong
 * @date 2016/6/23
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class  OrderSmsController extends AdminbaseController{
	protected  $curent_menu = 'OrderSms/index';

	/**
	 *	推送设置
	 */
	public function index(){
		$OrderSms 	= M('OrderSms');
		$tmpList = M('Template')->where(['temp_type'=>1])->select();

		$inside_tmp = $OrderSms->where(['sms_code'=>'for_inside'])->find();
		$user_tmp = $OrderSms->where(['sms_code'=>'for_user'])->find();

		$this->assign('inside_tmp',$inside_tmp);
		$this->assign('user_tmp',$user_tmp);
		$this->assign('tmpList',$tmpList);
		$this->display('sms');
	}

	/**
	 *	推送设置保存
	 */
	public function update(){
		$for_inside = I('for_inside',0,'int');
		$for_user   = I('for_user',0,'int');
		$inside_tmp = I('inside_tmp','','int');
		$user_tmp   = I('user_tmp','','int');
		$mobile	    = I('mobile','','trim');
		$OrderSms 	= M('OrderSms');

		if($for_inside == 1 && !is_numeric($inside_tmp)){
			$this->ajaxReturn($this->result->error('请选择针对工作人员的短信模板')->toArray());exit;
		}
		if($for_user == 1 && !is_numeric($user_tmp)){
			$this->ajaxReturn($this->result->error('请选择针对用户的短信模板')->toArray());exit;
		}
		if(empty($mobile)){
			$this->ajaxReturn($this->result->error('请输入推送手机号')->toArray());exit;
		}

		$in_data = [
			'sms_code'=>'for_inside',
			'temp_id'=>$inside_tmp,
			'mobile'=>$mobile,
			'status'=>1,
		];
		$inside_exist = $OrderSms->where(['sms_code'=>'for_inside'])->find();
		$user_exist = $OrderSms->where(['sms_code'=>'for_user'])->find();
		if($for_inside){
			if(!empty($inside_exist)){
				$result = $OrderSms->where(['sms_code'=>'for_inside'])->save($in_data);
			}else{
				$result = $OrderSms->where(['sms_code'=>'for_inside'])->add($in_data);
			}
		}else{
			$in_data['status'] = 0;
			if(!empty($inside_exist)){
				$result = $OrderSms->where(['sms_code'=>'for_inside'])->save($in_data);
			}else{
				$result = $OrderSms->where(['sms_code'=>'for_inside'])->add($in_data);
			}
		}

		$user_data = [
			'sms_code'=>'for_user',
			'temp_id'=>$user_tmp,
			'status'=>1,
		];

		if($for_user){
			if(!empty($user_exist)){
				$res = $OrderSms->where(['sms_code'=>'for_user'])->save($user_data);
			}else{
				$res = $OrderSms->where(['sms_code'=>'for_user'])->add($user_data);
			}
		}else{
			$user_data['status'] = 0;
			if(!empty($user_exist)){
				$res = $OrderSms->where(['sms_code'=>'for_user'])->save($user_data);
			}else{
				$res = $OrderSms->where(['sms_code'=>'for_user'])->add($user_data);
			}
		}

		$this->ajaxReturn($this->result->success('保存配置成功','SUCCESS')->toArray());
	}
}