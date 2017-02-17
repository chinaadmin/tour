<?php
namespace Api\Controller;
class MessageController extends ApiBaseController {

    /**
     * 发送短信
     * @author cwh
     *         传入参数:
     *         <code>
     *         type 用途： 1:注册 2:手机登录 3:忘记密码 6：绑定手机
     *         mobile 手机
     *         </code>
     */
    public function sendSMS(){
        $type = I('post.type','','intval');
        $mobile = I('post.mobile','','trim');
        $tmp = 'SMS_11006187';		//短信模板id

        if(empty($mobile) || !checkMobile($mobile)){
            $this->ajaxReturn($this->result->set('MOBILE_FORMAT_ERROR'));
        }
		 
		if($type == 1){ //检查是否已经存在这样的手机号 或用户
			$d = D('User/User');
			$pre = 'reg_';
			$user_is_exist = $d->ifUniqueUsername($mobile);//注册时手机号同时也为用户名
			$mobile_is_exist = $d->ifUniqueMobile($mobile);
			if(!$user_is_exist || !$mobile_is_exist){
				$this->ajaxReturn($this->result->set('MOBILE_EXISTS')); //统一提示手机号已存在
			}

			$product = "注册";
		}else if($type == 2){
			$pre = 'login_';
			$d = D('User/User');
			$user_is_exist = $d->ifUniqueUsername($mobile);//注册时手机号同时也为用户名
			$mobile_is_exist = $d->ifUniqueMobile($mobile);
			if($user_is_exist && $mobile_is_exist){
				$type['type'] = 1;
			}else{
				$type['type'] = 2;
			}

			$product = "登录";
		}else if($type == 3){
			
			$d = D('User/User');
			$pre = 'is_code';
			//$user_is_exist = $d->ifUniqueUsername($mobile);//注册时手机号同时也为用户名
			$mobile_is_exist = $d->ifUniqueMobile($mobile);
			if($mobile_is_exist){
				$this->ajaxReturn($this->result->set('MOBILE_NOT_EXISTS')); //统一提示手机号已存在
			}

			$product = "找回密码";
		}else if($type == 4){
			$d = D('User/User');
			$user_is_exist = $d->ifUniqueUsername($mobile);
			$mobile_is_exist = $d->ifUniqueMobile($mobile);
			if($user_is_exist && $mobile_is_exist){
				$this->ajaxReturn($this->result->set('MOBILE_NOT_EXISTS')); 
			}
			$pre = 'is_code';
			$product = "原手机号";
			$product = "";
		}else if($type == 5){
			$d = D('User/User');
			$user_is_exist = $d->ifUniqueUsername($mobile);
			$mobile_is_exist = $d->ifUniqueMobile($mobile);
			if(!$user_is_exist && !$mobile_is_exist){
				$this->ajaxReturn($this->result->set('MOBILE_EXISTS')); 
			}
			$pre = 'is_code';
			$product = "新手机号";
			$product = "";
		}else if ( $type == 6 ) {
            $pre = 'bind_code';
            $product = '绑定手机';
        }

        $code = mt_rand(100000,999999);

        //发送短信 		//原短信发送
        /*$mess = new \Common\Org\Util\MobileMessage();
        $arr = [];
        $arr['mobile_code'] = $code;*/

        //新短信发送
        $mess = new \Common\Org\Util\DayuMessage();
        $arr = [];
        $arr['code'] = (string)$code;
        $arr['product'] = $product;

        $msgReturn = $mess->sendMsgByTel($mobile, $arr,$tmp);
        $toArr = $this->objectToArray($msgReturn);

        // if($mess->sendMessByTel($mobile, $arr,$tmp) === true){//原发送结果判断
        if($toArr['success'] === "true"){//发送成功
			S($pre.$mobile,$code,C('JT_CONFIG_WEB_SORT_MESSAGE_VAILD')*60);
            $this->ajaxReturn($this->result->success());exit;
        }
        $this->ajaxReturn($this->result->set('SEND_MESSAGE_FAIL'));
    }

    /**
     *	对象转数组,使用get_object_vars返回对象属性组成的数组
     */
	public function objectToArray($obj){
		$arr = is_object($obj) ? get_object_vars($obj) : $obj;
		return $arr;
		/*if(is_array($arr)){
			return array_map(__FUNCTION__, $arr);
		}else{
			return $arr;
		}*/
	}

    /**
     * 验证短信
     * @author cwh
     *         传入参数:
     *         <code>
     *         type 用途：2:忘记密码 3:修改手机
     *         mobile 手机
     *         code 验证码
     *         </code>
     */
    public function verifySMS(){
        //$type = I('post.type','','intval');
        $code = I('post.code','','intval');
        $mobile = I('post.mobile','','trim');
        if(empty($mobile) || !checkMobile($mobile)){
            $this->ajaxReturn($this->result->set('MOBILE_FORMAT_ERROR'));
        }
        $map=[];
        $map['mobile'] = $mobile;
        $map['delete_time'] = 0;
        $res = M('user')->where($map)->order('add_time DESC')->find();
      	if (empty($res)) {
      		$this->ajaxReturn($this->result->error('号码不存在，请先进行注册'));
      	}
		if(S('is_code'.$mobile) ==  $code){
	
			S('is_code'.$mobile,null);
			$token = M('Token')->where(['uid'=>$res['uid']])->getField('token');
			// $token = D('Api/User')->mobileEncrypt($mobile,$code);
			$this->ajaxReturn($this->result->content(['token'=>$token])->success());
        }
        $this->ajaxReturn($this->result->set('CODE_ERROR'));
    }
	
	
	/********************************吉途****************************************/
	
	
	/**
     * 发送短信（登陆）
     * @author mobile 手机号
     *         
     */
    public function sendSmsLog(){
		$type['type'] ='';
        $mobile = I('post.mobile','','trim');
        $tmp = 'SMS_11006187';		//短信模板id
        if(empty($mobile) || !checkMobile($mobile)){
            $this->ajaxReturn($this->result->set('MOBILE_FORMAT_ERROR')->content($type));
        }
		//检查是否已经存在这样的手机号 或用户
		$d = D('User/User');
		$user_is_exist = $d->ifUniqueUsername($mobile);//注册时手机号同时也为用户名
		$mobile_is_exist = $d->ifUniqueMobile($mobile);
		if($user_is_exist && $mobile_is_exist){
			$type['type'] = 1;
		}else{
			$type['type'] = 2;
		}
        $code = mt_rand(100000,999999);

        //发送短信
        /*$mess = new \Common\Org\Util\MobileMessage();
        $arr = [];
        $arr['mobile_code'] = $code;*/

        //新短信发送
        $mess = new \Common\Org\Util\DayuMessage();
        $arr = [];
        $arr['code'] = (string)$code;
        $arr['product'] = "登陆";
        
        $msgReturn = $mess->sendMsgByTel($mobile, $arr,$tmp);
        $toArr = $this->objectToArray($msgReturn);

        // if($mess->sendMessByTel($mobile, $arr,$tmp) === true){	//原发送结果判断
        if($toArr['success'] === "true"){	//发送成功
			S('login_'. $mobile,$code,C('JT_CONFIG_WEB_SORT_MESSAGE_VAILD')*60);
            $this->ajaxReturn($this->result->content($type)->success());
        }else{
			$this->ajaxReturn($this->result->set('SEND_MESSAGE_FAIL')->content($type));
		}
    }

}