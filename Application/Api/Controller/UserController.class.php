<?php
namespace Api\Controller;
use Common\Model\SharedModel;
use User\Org\Util\User;
class UserController extends ApiBaseController {
	private $thumbSize = array (
			"164X218"
	);
    /**
     * 登录
     * @author cwh
     *         传入参数:
     *         <code>
     *         username 用户名
     *         password 密码
     *         isBind 是否绑定第三方登陆 1：是0：否
     *         part 第三方数据
     *         </code>
     */
    public function login(){
        $mobile = I ( 'post.username', '', 'htmlspecialchars,trim' );
        $password = I ( 'post.password', '', 'htmlspecialchars,trim' );
        $source = I ( 'post.source', 1, 'intval' );
        if (empty ( $mobile )) {
            $this->ajaxReturn($this->result->set('ACCOUNT_REQUIRE'));
        }
        if (empty ( $password )) {
            $this->ajaxReturn($this->result->set('PASSWORD_REQUIRE'));
        }

        // 启用登录日志
        $user_instance = User::getInstance();
        $user_instance->recordLog = false;
        //验证账号和密码
        $credentials = [
            'account' => $mobile,
            'password' => $password,
            'source'=>$source
        ];
        $result = $user_instance->login ( $credentials,0,false );
        if (!$result->isSuccess()) {//登录失败
            $this->ajaxReturn($result);
        }

        $uid = $result->getResult();

        //绑定第三方数据
        if(I('post.isPart',0,'intval')){
            $connect = I('post.part','');
            $connect = htmlspecialchars_decode($connect);
            $connect = json_decode($connect,true);
            if(D("Api/User")->isBind($connect['openid'],$connect['unionid'])){
                //判断当前账号是否已绑定过
                if(!D("Api/User")->bindByUid($uid,$connect['type'])){
                    //$this->ajaxReturn($this->result->error("该账号已绑定，请使用其他账号！","CONNECT_EXISTS"));
                    if($connect){
                        $connect['uid'] = $uid;
                        $this->_connect($connect);
                    }else{
                        $this->ajaxReturn($this->result->error("第三方数据不能为空！","CONNECT_REQUIRE"));
                    }
                }
            }
        }
        $this->_toLogin($uid);
    }

    /**
     * 插入第三方数据
     * @param  $connect
     */
    private function _connect($connect){
        $connect['add_time'] = NOW_TIME;
        return M("UserConnect")->add($connect,'',true);
    }

    /**
     * 第三方登录
     * @author xiongzw
     *      <code>
     *          openId 开放平台id
     *          headPic 头像
     *          type 登录方式
     *          nick 昵称
     *      </code>
     */
    public function oauth(){
        $error = '';
        $openId = I('post.openId','');
        $headPic = I('post.headPic','');
        $nick = I('post.nick','');
        $type = I('post.type','');
        $unionid = I('post.unionid','');
        if(!$error && empty($openId)){
            $error = "OPENID_REQUIRE";
        }
        /* if(!error && empty($headPic)){
            $error = "HEADPIC_REQUIRE";
        } */
        if(!$error && empty($type)){
            $error = "PART_TYPE_REQUIRE";
        }
        if($error){
            $this->ajaxReturn($this->result->set($error));
        }
        $connect = D ( 'Home/Oauth' )->isBind ( $openId, $type,$unionid );
        //已注册用户
        if($connect){
            $uid = $connect['uid'];
            $this->_toLogin($uid);
        }else{
            //未注册用户
            $part = array(
                'openid'=>$openId,
                'pic' => $headPic,
                'nick'=>$nick,
                'type'=>$type,
                'unionid'=>$unionid
            );
            $data = array(
                "isReg"=>false,
                'part'=>$part
            );
            $this->ajaxReturn($this->result->content(['data'=>$data]));
        }
    }

	/**
    * 手机登录
    * @param  mobile 用户名或手机号
	* @param  code   验证码
    */
	
	public function mobile_login(){
		$username 	= I('post.mobile','','trim');
		$code 		= I('post.code','','trim');
		$source 	= I('post.source','','trim');
		if(empty($username) || empty($code)){
			$this->ajaxReturn($this->result->set('MOBILE_CODE_EMPTY'));
		}
		if($code != S('login_'.$username)){
			$this->ajaxReturn($this->result->set('VERIFICATION_CODE_ERROR'));
		}
		S('login_'.$username,null);

		$d = D('User/User');
		$where['delete_time'] = array('eq',0);
		$where['_string'] = 'username='.$username.' or mobile='.$username;

		if(!$d -> where($where) -> Field('uid') -> find()){
			//新用户
            S("user".$username,$username,300);
			$this->ajaxReturn($this->result ->error('新用户','NEW_NAME'));
		}
		// 启用登录日志
		$user_instance = User::getInstance();
		$user_instance->recordLog = false;
		$this -> _toLogin($d->getUid($username));
	}

    public function mobile_reg(){
        $data = [
            'mobile' => I('post.mobile',''),
            'pass' => I('post.pass','','/^[a-zA-Z\d_]{6,15}$/') ,
            'password' => I('post.password','','/^[a-zA-Z\d_]{6,15}$/')	,
            'status'=>1,
            'reg_ip'=>$_SERVER["REMOTE_ADDR"],
            // 'grade_id'=>D("User/UserGrade")->getDefaultGrade(),//用户等级
        ];
        if(empty($data['mobile']) || empty($data['password'])){
            $this -> ajaxReturn($this -> result -> error("密码不符合规范，请重新输"));
        }
        if($data['password'] != I('post.pass')){
            $this -> ajaxReturn($this -> result -> error());
        }
        // print_r(S('user'));exit();
/*        if(S('user') != $data['mobile']){
            $this -> ajaxReturn($this -> result -> error());
        }
        // S('user'.$data['mobile'],null);
        S('user',null);*/
        $data['mobile_status'] = 1;

        $data['aliasname'] = empty($data['aliasname'])?$this -> get_nick():$data['aliasname'];
        $data['come_from'] = I('request.source',1);//来源
        $result = D('User/User')->addData($data,true);
        $user_instance = User::getInstance();
        if($result->isSuccess()){

            if ($user_instance->isLogin ()) {//已有帐号登入就登出
                $user_instance->logout ();
            }
            $uid = $result->getresult();
            $user_instance->toLogin($uid);

            //设置token
            $token = D('User/Token')->device()->setMore($uid);
            if($token === false){
                $this->ajaxReturn($this->result->set('TOKEN_SET_FAILED'));
            }
            $return_data = [
                'uid'=>$uid,
                'token'=>$token,
                'headAttr'=>'',
                'aliasname'=>$data['aliasname'],
                'mobile'=>$data['mobile']
            ];
            $this->ajaxReturn($this->result->content($return_data)->success('注册成功'));
        }

        $this->ajaxReturn($result);
    }
	
    /**
     * 登录操作
     * @param 用户id
     */
    private function _toLogin($uid){
    	$channel_id = I("request.channelId"); //绑定推送channel_id
    	$deviceType = I("request.deviceType",1,'intval'); //设备类型
    	$token = D('User/Token')->device()->setChannel($channel_id)->setType($deviceType)->setMore($uid);
    	if($token === false){
    		$this->ajaxReturn($this->result->set('TOKEN_SET_FAILED'));
    	}
    	$user_instance = User::getInstance();
    	$user = $user_instance->user();
    	if(empty($user)){
    		$user = M("User")->where(['uid'=>$uid])->find();
    	}
		$img = M('attachment');
		
		$img_nfo = M('attachment') ->where(['att_id' => $user['headattr']]) ->  find();
        // print_r($img_nfo);exit();
        empty($img_nfo)? $img_url='':$img_url = 'http://'.$_SERVER['HTTP_HOST'].$img_nfo['path']."/".$img_nfo['name'].".".$img_nfo['ext'];
		

    	$return_data = [
		'headAttr' => $img_url,
    	'token'=>$token,
    	'aliasname'=>$user['aliasname'],
    	'mobile'=>$user['mobile'],
         'vip' => M('member') -> where(['member_id' =>$user['member_id']]) -> getField('member_name'),
         'vipNum' => $user['member_id'],
    	];
		
		/*if(empty(M('my_passenger')->where(['fk_uid' => $uid,'pe_type'=>2])->select())){
            M('my_passenger') -> add(['fk_uid' => $uid,'pe_type'=>2]);
        }*/
    	$this->ajaxReturn($this->result->content($return_data)->success('登录成功'));
    }
    
    

    /**
     * 退出
     * @author cwh
     *         传入参数:
     *         <code>
     *         token token值
     *         </code>
     */
    public function loginOut(){
        D('User/Token')->del($this->token);
        $this->ajaxReturn($this->result->success('退出成功'));
    }

    /**
     * 注册
     * @author cwh
     *         传入参数:
     *         <code>
     *         username 用户名
     *         password 密码
     *         code 验证码
     *         
     */
    public function register(){
        $data = [
           // 'mobile' => I('post.mobile',''),
            'mobile' => I('post.mobile',''),
            'pass' => I('post.password','','/^[a-zA-Z\d_]{6,15}$/')	,
            'status'=>1,
			'reg_ip'=>$_SERVER["REMOTE_ADDR"],
            // 'grade_id'=>D("User/UserGrade")->getDefaultGrade(),//用户等级
        ];
        if (empty($data['pass'])) {
            $this->ajaxReturn($this->result->error('密码不符合规范，请重新输','error'));
        }
        $invite_code = I('post.invite_code','');
       
		if(!S('reg_'.$data['mobile'])){
			$this->ajaxReturn($this->result->set('CODE_NOT_EXIST'));
		}
		if(S('reg_'.$data['mobile']) != $invite_code){
			$this->ajaxReturn($this->result->set('MOBILE_CODE_ERROR'));
		}
		
		$data['mobile_status'] = 1;

        $data['aliasname'] = empty($data['aliasname'])?$this -> get_nick():$data['aliasname'];
        $data['come_from'] = I('request.source',1);//来源
        $result = D('User/User')->addData($data,true);
        $user_instance = User::getInstance();
		S('reg_'.$data['mobile'],null);
        if($result->isSuccess()){
			
            if ($user_instance->isLogin ()) {//已有帐号登入就登出
                $user_instance->logout ();
            }
            $uid = $result->getresult();
            $user_instance->toLogin($uid);

            //设置token
            $token = D('User/Token')->device()->setMore($uid);
            if($token === false){
                $this->ajaxReturn($this->result->set('TOKEN_SET_FAILED'));
            }
            $return_data = [
                'uid'=>$uid,
                'token'=>$token,
				'headAttr'=>'',
				'aliasname'=>$data['aliasname'],
				'mobile'=>$data['mobile'],
            ];
			$this->ajaxReturn($this->result->content($return_data)->success('注册成功'));
        }
		
		
        $this->ajaxReturn($result);
    }

    /**
     * 注册不需要验证码
     * @author cwh
     *         传入参数:
     *         <code>
     *         username 用户名
     *         password 密码
     *
     */
    public function registerwithoutcode(){
        $data = [
            'mobile' => I('post.mobile',''),
            'pass' => I('post.password','','/^[a-zA-Z\d_]{6,15}$/')	,
            'status'=>1,
            'reg_ip'=>$_SERVER["REMOTE_ADDR"],
        ];
        if (empty($data['pass'])) {
            $this->ajaxReturn($this->result->error('密码不符合规范，请重新输','error'));
        }
        $data['mobile_status'] = 1;

        $data['aliasname'] = empty($data['aliasname'])?$this -> get_nick():$data['aliasname'];
        $data['come_from'] = I('request.source',1);//来源
        $result = D('User/User')->addData($data,true);
        $user_instance = User::getInstance();
        if($result->isSuccess()){

            if ($user_instance->isLogin ()) {//已有帐号登入就登出
                $user_instance->logout ();
            }
            $uid = $result->getresult();
            $user_instance->toLogin($uid);

            //设置token
            $token = D('User/Token')->device()->setMore($uid);
            if($token === false){
                $this->ajaxReturn($this->result->set('TOKEN_SET_FAILED'));
            }
            $return_data = [
                'uid'=>$uid,
                'token'=>$token,
                'headAttr'=>'',
                'aliasname'=>$data['aliasname'],
            ];
            $this->ajaxReturn($this->result->content($return_data)->success('注册成功'));
        }


        $this->ajaxReturn($result);
    }
  


    /**
     * 修改密码
     * @author cwh
     *         传入参数:
     *         <code>
     *         oldPass 旧密码
     *         newPass 新密码
     *         newRepass 新确认密码
     *         token 登录令牌
     *         </code>
     */
    public function updatePass(){
        $this->authToken();
        $old_pass = I('post.oldPass','','trim');
        $new_pass = I('post.newPass','','/^[a-zA-Z\d_]{6,15}$/');
        $new_repass = I('post.newRepass','','trim');

        if(empty($old_pass)){
            $this->ajaxReturn($this->result->set('OlD_PASSWORD_REQUIRE'));
        }

        if(empty($new_pass)){
            $this->ajaxReturn($this->result->set('NEW_PASSWORD_REQUIRE'));
        }

        if($new_pass !== $new_repass){
            $this->ajaxReturn($this->result->set('PASSWORD_INCONSISTENCY'));
        }

        //验证旧密码
        $user_model = D('User/User');
        $user_info = $user_model->getUserById($this->user_id);
        if($user_info->isSuccess()) {
            $user_info = $user_info->getResult();
            if ($user_info['pass'] != getpass($old_pass)) {
                $this->ajaxReturn($this->result->set('OlD_PASSWORD_ERROR'));
            }
        }else{
            $this->ajaxReturn($user_info);
        }

        $where = [];
        $where['uid'] = $this->user_id;
        $data['pass'] = $new_pass;
        $res = D('User/User')->setData($where,$data);
        $this->ajaxReturn($res);
    }
	
    /**
     * 找回密码
     * @author cwh
     *         传入参数:
     *         <code>
     *         newPass 新密码
     *         newRepass 新确认密码
     *         token 登录令牌
     *         </code>
     */
    public function forgotPass(){
        $token = I('post.token','','trim');
        $this->authToken($token);
        // print_r($res);exit();
        $new_pass = I('post.newPass','','/^[a-zA-Z\d_]{6,15}$/');
        $new_repass = I('post.newRepass','','/^[a-zA-Z\d_]{6,15}$/');
        if(empty($new_pass)){
            $this->ajaxReturn($this->result->set('NEW_PASSWORD_REQUIRE'));
        }

        if($new_pass !== $new_repass){
            $this->ajaxReturn($this->result->set('PASSWORD_INCONSISTENCY'));
        }

        /*$token = I('post.token','','trim');

        $token_result = D('Api/User')->mobileDecrypt($token);
        if($token_result->isSuccess()){
            $token_result = $token_result->getResult();
            $mobile = $token_result['mobile'];
        }else{
            $this->ajaxReturn($token_result);
        }*/

        $user_model = D('User/User');
/*        $uid = $user_model->where([
            'mobile'=>$mobile,
            'delete_time'=>0,
        ])->getField('uid');*/
        // print_r($this->user_id);exit();
        $where = [];
        $where['uid'] = $this->user_id;
        $data['pass'] = $new_pass;
        $res = $user_model->setData($where,$data);
        if($res -> getcode() != 'SUCCESS' ){
            $res -> error('修改失败，或许换个密码重试，谢谢');
       }
        $this->ajaxReturn($res);
    }

    /**
     * 修改用户名
     * @author cwh
     *         传入参数:
     *         <code>
     *         username 用户名
     *         token 登录令牌
     *         </code>
     */
    public function updateUsernames(){
        $this->authToken();
        //接收和验证参数
        $realname = I('post.realname','','trim');
        if(empty($realname)){
            $this->ajaxReturn($this->result->set('USER_REALNAME_REQUIRE'));
        }
        
        $nickname = I('post.nickname','','trim');//用户昵称
        if(empty($nickname)){
        	$this->ajaxReturn($this->result->set('USER_NICKNAME_REQUIRE'));
        }
        
        $sex = I('post.sex','','trim,int');//姓别
        if(empty($sex)){
        	$this->ajaxReturn($this->result->set('USER_SEX_REQUIRE'));
        }else if(!in_array($sex, [1,2])){
        	$this->ajaxReturn($this->result->set('USER_SEX_FORMAT_ERROR'));
        }
        

        $where = [];
        $where['uid'] = $this->user_id;
        $data['real_name'] = $realname;
        $data['aliasname'] = $nickname;
        $data['sex'] = $sex;
        $res = D('User/User')->setData($where,$data,true);
        $this->ajaxReturn($res);
    }
	
	/**
     * 修改昵称
     * @author cwh
     *         传入参数:
     *         <code>
     *         username 用户名
     *         token 登录令牌
     *         </code>
     */
    public function updateUsername(){
        $this->authToken();
        //接收和验证参数
        $nickname = I('post.nickname','','trim');//用户昵称
        if(empty($nickname)){
        	$this->ajaxReturn($this->result->set('USER_NICKNAME_REQUIRE'));
        }
        
        $where = [];
        $where['uid'] = $this->user_id;
		$data['aliasname'] = $nickname;
        $res = D('User/User')->setData($where,$data,true);
        $this->ajaxReturn($res);
    }
	
	/**
     * 修改手机号码
     * @author cwh
     *         传入参数:
     *         <code>
     *         mobile 手机号码
     *         token 登录令牌
     *         code  验证码
     *         </code>
     */
    public function updateMobile(){
        $this->authToken();
        //接收和验证参数
        $mobile = I('post.mobile','','trim');
        $newmobile = I('post.newmobile','','trim');
        $code = I('post.code','','trim');
        if(empty($mobile)){
        	$this->ajaxReturn($this->result->set('MOBILE_CODE_EMPTY'));
        }
        
		if(!$code){
			$this -> ajaxReturn($this ->result->set('CODE_NOT_EXIST'));
		}
		
		if(S('is_code'.$newmobile) != $code){
			$this -> ajaxReturn($this ->result->set('VERIFICATION_CODE_ERROR'));
		}
		
		$d = D('User/User');
		$mobile_is_exist = $d->ifUniqueMobile($newmobile);
		
		if(!$mobile_is_exist){
			$this->ajaxReturn($this->result->set('MOBILE_EXISTS'));
		}
		
        $where = [];
        $where['uid'] = $this->user_id;
		$data['mobile'] = $newmobile;
        $res = D('User/User')->where($where) -> save($data);
        if($res){
            $results = $this->result->success('修改成功');
        }else{
            $results = $this->result->error('修改失败');
        }
        $this->ajaxReturn($results);
    }
	
	/**
     * 修改真实名字
     * @author cwh
     *         传入参数:
     *         <code>
     *         mobile 手机号码
     *         token 登录令牌
     *         code  验证码
     *         </code>
     */
    public function updateName(){
        $this->authToken();
        //接收和验证参数
        $real_name = I('post.real_name','','trim');
		
        if(empty($real_name)){
        	$this->ajaxReturn($this->result->set('REALNAME_REQUIRE'));
        }
		
        $where = [];
        $where['fk_uid'] 		= $this->user_id;
        $where['pe_type'] 		= 2;
		$data['pe_real_name'] 	= $real_name;
		$res 					= D('Admin/my_passenger')->setData($where,$data,true);
		$this->ajaxReturn($res);
    }

    /**
     * 修改真实名字
     * @author cwh
     *         传入参数:
     *         <code>
     *         mobile 手机号码
     *         token 登录令牌
     *         code  验证码
     *         </code>
     */
    public function updateRealName(){
        $this->authToken();
        //接收和验证参数
        $real_name = I('post.real_name','','trim');
        
        if(empty($real_name)){
            $this->ajaxReturn($this->result->set('REALNAME_REQUIRE'));
        }
        
        $where = [];
        $where['uid']        = $this->user_id;
       /* $where['pe_type']       = 2;*/
        $data = [];
        $data['real_name']   = $real_name;
        $res                 = M('User')->where($where)->save($data);

        if($res){
            $result = $this->result->success('修改成功');
        }else{
            $result = $this->result->error('修改失败');
        }
        $this->ajaxReturn($result);
        // $this->ajaxReturn($result->toArray());
    }
	
	/**
     * 修改性别
     * @author cwh
     *         传入参数:
     *         <code>
     *        
     *         token 登录令牌
     *         sex  性别
     *         </code>
     */
    public function updateSex(){
        $this->authToken();
        //接收和验证参数
        $pe_sex = I('post.sex','','trim');
		$users = D("User");
        if(empty($pe_sex)){
        	$this->ajaxReturn($this->result->set('PARAM_EMPTY'));
        }
		
        $where = [];
        $where['uid'] 		= $this->user_id;
		$data['sex'] 		= $pe_sex;
		$res 				= $users->setData($where,$data,true);
		$this->ajaxReturn($res);
    }
	
	/**
     * 修改生日
     * @author cwh
     *         传入参数:
     *         <code>
     *        
     *         token 登录令牌
     *         pe_birthday  生日
     *         </code>
     */
    public function updateBirthday(){
        $this->authToken();
        //接收和验证参数
        $pe_birthday = I('post.birthday','','trim');
		
        if(empty($pe_birthday)){
        	$this->ajaxReturn($this->result->set('PARAM_EMPTY'));
        }
		
        /*$where = [];
        $where['fk_uid'] 		= $this->user_id;
        $where['pe_type'] 		= 2;*/
        $data = [];
		$data['user_birthday'] 	= strtotime($pe_birthday);
        // $res                    = D('Admin/my_passenger')->setData($where,$data,true);
		$res 					= D('UserProfile')->where(['uid'=>$this->user_id])->save($data);
        if($res){
            $result = $this->result->success('修改成功');
        }else{
            $result = $this->result->error('修改失败');
        }
        $this->ajaxReturn($result);
		// $this->ajaxReturn($result->toArray());
    }
	
	//修改头像
	public function uploadHeadPic(){
    	//用户是否登入
    	$userInfo = $this->authToken();
    	$uid = $this->user_id;
		$config = array(
				'thumb'=>false
		);
		$type = I('post.type',1,'intval');
		if($type==2){
			$baseImg = I('post.baseData','');
			if(!$baseImg){ 
				$this->ajaxReturn($this->result->set("PHOTO_REQUIRE"));
			}
			$ext = I ( "post.ext", '', 'trim' );
			if(!$ext){ 
				$this->ajaxReturn($this->result->set("PHOTO_EXT_REQUIRE"));
			}
			$datas = $this->_base64Upload($baseImg,$ext);
			
			$data = array(
					"attId"=>$datas['attId'],
					"photo"=>fullPath($datas['path'])
			);

			if(M('user') -> where(['uid'=>$uid]) -> save(['headAttr' => $data['attId']])){
				$this->ajaxReturn($this->result->success()->content(['result'=>$data]));exit;
			}else{
				$this->ajaxReturn($this->result->error());
			}

		}
		if($type==1){
			$result = $this->uploadPic($config);
			if($result['success']){
				
				$data = array(
						"attId"=>$result['id'],
						"photo"=>fullPath($result['path'])
				);
				if(M('user') -> where(['uid'=>$uid]) -> save(['headAttr' => $result['id']])){
					$this->ajaxReturn($this->result->success()->content(['result'=>$data]));
				}else{
					$this->ajaxReturn($this->result->error());
				}
			}else{
				$this->ajaxReturn($this->result->error($result['error'],"UPLOAD_ERROR"));
			}
		}
		
    }

    /**
     * base64上传
     */
    private function _base64Upload($baseImg,$ext) {

        $baseImg = preg_replace("/^data:image\/\w+;base64,/","",$baseImg);
        if(empty($baseImg)){
            $this->ajaxReturn($this->result->set("UPLOAD_ERROR"));
        }
        $baseImg = base64_decode ( $baseImg );
        $config = array(
            'thumb'=>false
        );
        $info = array(
            'is_admin' => 0,
            'uid' => $this->user_id,
            'model' => 'image'
        );
        $result = D ( "Upload/UploadImage" )->base64Upload ( $baseImg, $ext, $config, $info );
        if ($result) {
            $result['attId'] = $result ['att_id'];
            $result['path'] = fullPath ( $result ['path'] );
            return $result;
        } else {
            $this->ajaxReturn ( $this->result->error () );
        }
    }
	
	 /**
     * 获取证件信息
     * @author cwh
     *         传入参数:
     *         <code>
     *         token 登录令牌
     *         </code>
     */
	public function certificates(){
		$this->authToken();
        // $re  = D('Admin/my_passenger') ->mp_info($this->user_id,1);
		$re  = D("User")->certificates($this ->user_id,false);
        // dump($re);exit;
        $pe_en = $re['pe_en'];
        $pe_id = $re['fk_pe_id'];
        unset($re['pe_en'],$re['fk_pe_id']);
		$this->ajaxReturn($this->result->content(['data'=>$re,'pe_en'=>$pe_en,'fk_pe_id'=>$pe_id])->success());
	}
	
	/* public function certificates(){
		$this->authToken();
		$re = D('Certificates') ->get_info($this->user_id);
		$this->ajaxReturn($this->result->content(['data'=>$re])->success());
	} */
	
	/**
     * 编辑证件信息
     * @author cwh
     *         传入参数:
     *         <code>
     *         token 登录令牌
     *         </code>
    */
	public function ceUp(){
		$this->authToken();
		$ce = D('certificates');
		$data = I('post.');

		$re = $ce -> ceUp($data,$this ->user_id);
		if($re){
			$this ->ajaxReturn($this -> result->success());
		}else{
			$this ->ajaxReturn($this -> result->error('操作失败','error'));
		}
	}
	
    /**
     * 获取用户信息
     * @author cwh
     *         传入参数:
     *         <code>
     *         token 登录令牌
     *         </code>
     */
    public function getInfo(){
        $this->authToken();
    	$user_instance = User::getInstance();
    	$user = $user_instance->user();

    	if(empty($user)){
    		$user = M("User")->where(['uid'=>$this ->user_id])->find();
    	}

		//M("my_passenger")->where(['uid'=>$uid,'pe_type'=>2])->getField($field);
        $user_birthday = M('UserProfile')->where(['uid'=>$this ->user_id])->getField('user_birthday');
		$users = D("User");
		$MyPassenger = D('Admin/MyPassenger');
        $myInfo = $users->certificates($this ->user_id,true);
        $pe_en = $myInfo['pe_en'];
        // dump($myInfo[0]);exit;
        if(empty($myInfo[0])){
            $certificates = [
                'ce_id'=>'',
                'ce_type'=>'',
                'ce_number'=>'',
                'name'=>'',
            ];
        }else{
            $certificates = $myInfo[0];
        }
        unset($myInfo['pe_en']);
        unset($myInfo[0]['fk_pe_id']);
        // dump($myInfo);exit;
    	$return_data = [
		'headAttr' => $users -> headattr($user['headattr']),
    	'uid'=>$this ->user_id,
    	'token'=>$token,
		// 'pe_en' =>$MyPassenger->user_info('pe_en'),
    	'aliasname'=>$user['aliasname'],
        'accountStatus'=>$user['account_status'],
        'mobile'=>$user['mobile'],
        'sex'=>$user['sex'],
        // 'real_name'=>$MyPassenger -> getUserName($this ->user_id),
        'real_name'=>$user['real_name'],
        // 'user_birthday'=>$MyPassenger->user_info($this ->user_id,'pe_birthday')?date('Y年m月d日',$MyPassenger->user_info($this ->user_id,'pe_birthday')):"",
        'user_birthday'=>$user_birthday?$user_birthday:"",
        'certificates' => $certificates,
        'pe_en' => $pe_en,
         'vip' => M('member') -> where(['member_id' =>$user['member_id']]) -> getField('member_name'),
          'vipNum' => $user['member_id'],
		// 'certificates' => D('Admin/my_passenger')->mp_infos($this->user_id,2),
    	];
  
        $this->ajaxReturn($this->result->content($return_data)->success());
    }

	/**
     * 随机生成昵称
     * 
    */
	public function get_nick(){
		//97~122是小写的英文字母
		//65~90是大写的
		$str = "";
		for ($i = 1; $i <= 4; $i++) {
			$num = mt_rand(0,1);
			if($num){
				$str.= chr(rand(97,122));
			}else{
				$str.= chr(rand(65,90));
			}
		}
		$str .= mt_rand(1000,9999); 
		
		return $str;

	}
	
	
	/**
     * 旅客列表
     * @path 图片路径
     */
	public function my_passenger(){
		$this->authToken();
		 $user_model = D('User/User');
        $user_info = $user_model->getUserById($this->user_id);
		$my_passeenger = D('Admin/my_passenger') ->mp_info($this->user_id);
		if($my_passeenger){
			$this->ajaxReturn($this->result->content(['data'=>$my_passeenger])->success());
		}else{
			$this->ajaxReturn($this->result->error('暂无常用旅客信息','success'));
		}
	}
	
	
	/**
     * 添加 旅客
     * @path 
    */
	public function add_mp(){
		$this->authToken();
		$data = I('post.');        
		/* if($data['pe_name']){
			S('cs',$data['certificates']);
		}else{
			var_dump(S('cs'));
		} */
        $data['pe_mobile'] = I('post.pe_mobile',false,'/^1[34578]\d{9}$/');
        if (!$data['pe_mobile']) {
            $this->ajaxReturn($this->result->error('请输入正确的手机号码','error'));
        }
        $data['pe_birthday'] = strtotime($data['pe_birthday']);
        if($data){
            if($my_passeenger = D('Admin/my_passenger') ->mp_up($this->user_id,$data)){                
                if (empty($data['pe_id'])) {
				    $this->ajaxReturn($this->result->success('添加成功'));
                }
                $this->ajaxReturn($this->result->success('修改成功'));
			}else{
				$this->ajaxReturn($this->result->error('添加失败','error'));
			}
		}
		$this->ajaxReturn($this->result->error('添加失败','error'));
	}

    /**
     * 删除 旅客
     * @path token string 用户token
     * @path pe_id string 旅客ID
     */
    public function del_mp(){
        $this->authToken();
        $pe_id = I('post.pe_id',0,'int');
        if(!$pe_id || !$this -> user_id){
            $this->ajaxReturn($this->result->error('删除失败','error'));
        }
        $where['fk_uid'] = $this -> user_id;
        $where['pe_id'] = $pe_id;
        $where['pe_type'] = 1;

        $re = M('my_passenger') -> where($where) -> delete();
        if(!$re){
            $this->ajaxReturn($this->result->error('删除失败','error'));
        }
        $this->ajaxReturn($this->result->success('删除成功'));
    }
    /**
     * 设置支付密码
     * @param  string  token            用户TOKEN
     * @param  string  payment_pass     支付密码
     *
     */
    public function setPaymentPWD(){
        //alipay
        $this->authToken();
        $pass = I('post.payment_pass');
        if(!$this ->user_id || !$pass){
            $this->ajaxReturn($this->result->error('设置失败','error'));
        }
        $where['uid'] = $this ->user_id;

        $data['payment_pass'] = myMD5($pass);
        if(M('user') -> where($where)-> save($data)){
            $this->ajaxReturn($this->result->success('修改成功'));
        }
        $this->ajaxReturn($this->result->error('修改失败','error'));
    }

    /**
     * 验证支付密码
     * @param  string  token            用户TOKEN
     * @param  string  payment_pass     支付密码
     *
     */
    public function verifyPaymentPWD(){
        //alipay
        $this->authToken();
        $pass = I('post.payment_pass');
        if(!$this ->user_id || !$pass){
            $this->ajaxReturn($this->result->error('验证失败','error'));
        }
        $where['uid'] = $this ->user_id;
        $where['payment_pass'] = myMD5($pass);
        $where['delete_time'] = 0;
        if(M('user') -> where($where)-> count()){
            $this->ajaxReturn($this->result->success('验证成功'));
        }
        $this->ajaxReturn($this->result->error('验证失败','error'));
    }

    /*
     * 检测是否设置支付密码
     * @param  string  token   用户TOKEN
     */
    public function PaymentPWD(){
        $this->authToken();
        $re =  M('user') -> where(['uid' =>$this ->user_id])->getField('payment_pass');
        $data = 0;
        if($re){
            $data = 1;
        }
        $this -> ajaxReturn($this ->result -> content(['state'=>$data])->success());
    }

    /**
     * 获取用户积分明细
     * @param  string  token    用户TOKEN
     * @param  string  page     分页
     *
     */
    public function getIntegral(){
        $this->authToken();
        $where['uid'] = $this ->user_id;
        $where['credits_type'] = I('post.credits_type',1,'int');
        $page = I('post.page',1,'int');
        $user =   D('User/Credits') ->getIntegral($where,$page) ->formatDatas();
        $this->ajaxReturn($this->result->content($user) -> success());

    }


    /** 
    * 检测手机注册状态
    * @author xiaohuakang
    * @date 2016-10-13
    * @param string mobile 手机号码
    */
    public function checkMobileRegStatus()
    {
        $mobile = I('post.mobile',0,'htmlspecialchars,trim' );
        if (empty($mobile) || !checkMobile($mobile)) {
            $this->ajaxReturn($this->result->set('MOBILE_FORMAT_ERROR'));
        }

        // 限制一个手机号只能绑定一个第三方账户
        $uid = M('User')->where(['mobile' => $mobile, 'delete_time' => 0])->getField('uid');
        if ( $uid ) {
            $result = M('UserConnect')->where(['uid' => $uid])->find();
            if ( $result ) {
                $data = ['isReg' => 2, 'msg' => '该手机已绑定，请勿重复绑定！'];
            } else {
                $data = ['isReg' => 1, 'msg' => '该手机已注册！'];
            }
        } else {
            $data = ['isReg' => 0, 'msg' => '该手机未注册！'];
        }

        $this->ajaxReturn($this->result->content(['data' => $data])->success('操作成功！'));
    }

    /**
     * 添加第三方账户
     * @author xiaohuakang
     * @date 2016-10-13
     * @param string mobile 用户要绑定的手机号码
     * @param string code 验证码
     * @param string password 密码
     * @param string part 第三方用户数据 
     */
    public function addOauthAccount()
    {
        $mobile = I('post.mobile',0,'htmlspecialchars,trim' );  // 手机号码
        $code = I('post.code','','trim'); // 验证码
        $pass = I('post.password','','/^[a-zA-Z\d_]{6,15}$/'); // 密码

        // 第三方用户数据
        $connect = I('post.part',''); 
        if ( ! $connect ) {
            $this->ajaxReturn($this->result->error("第三方数据不能为空！","CONNECT_REQUIRE"));
        }
        $connect = htmlspecialchars_decode($connect);
        $connect = json_decode($connect,true);

        // 验证手机号码
        if ( empty($mobile) || !checkMobile($mobile) ) {
            $this->ajaxReturn($this->result->set('MOBILE_FORMAT_ERROR'));
        }

        // 检测验证码是否正确
        if ( empty($code) || S('bind_code'.$mobile) != $code ) {
            $this->ajaxReturn($this->result->error('验证码不存在！', 'CODE_NOT_EXIST'));
        }
        S('bind_code'.$mobile, null); // 删除已验证的验证码

        // 新用户
        if ( !empty($pass) ) {
             $data = [
                'mobile' => $mobile, // 手机号码
                'pass' => $pass, // 密码
                'status' => 1, // 用户状态
			    'reg_ip' => $_SERVER["REMOTE_ADDR"], // 注册ip
                'mobile_status' => 1, // 手机验证状态
                'aliasname' => $connect['nick'] ? $connect['nick'] : $this->get_nick(), // 用户昵称
                'come_from' => I('request.source',1) //用户来源 1：吉途 2：必好货
            ];

            $result = D('User/User')->addData($data,true);
            $user_instance = User::getInstance();
            if ( $result->isSuccess() ) {
                if ( $user_instance->isLogin() ) {//已有帐号登入就登出
                    $user_instance->logout();
                }
                $uid = $result->getresult();
                $user_instance->toLogin($uid);

                //设置token
                $token = D('User/Token')->device()->setMore($uid);
                if( $token === false ) {
                    $this->ajaxReturn($this->result->set('TOKEN_SET_FAILED'));
                }
            }
        }

        $connect['uid'] = M('User')->where(['mobile' => $mobile, 'delete_time' => 0])->getField('uid'); // 需要绑定的系统用户uid
        if ( $this->_connect($connect) ) {
            $this->_toLogin($connect['uid']); // 登录
        } else {
            $this->ajaxReturn($this->result->error("绑定第三方用户失败！","BIND_CONNECT_ERROR"));
        }
    }


    /** 
     * 获取用户绑定的第三方账户信息
     * @author xiaohuakang
     * @date 2016-10-13
     * @param string $token 用户token
     */
     public function getBindInfo()
     {
         $token = I('request.token', '', 'trim');
         $result = [];
         if ( ! $token ) {
                $this->ajaxReturn($this->result->set('TOKEN_REQUIRE')); 
         }
         $uid = M('Token')->where(['token' => $token])->getField('uid');
         if ( $uid ) {
             $result = M('UserConnect')->where(['uid' => $uid])->find();
             if ( $result ) {
                 $this->ajaxReturn($this->result->content(['data' => $result])->success('操作成功！'));
             }
         }
         $this->ajaxReturn($this->result->success('操作成功！'));
     }

     /**
	 * 第三方账户解绑
     * @author xiaohuakang
     * @date 2016-10-13
	 * @param string openid openid
	 */
	 public function unBind()
	 {
		 $openId = I('openid', '', 'trim');
		 if ( empty($openId) ) {
			 $this->ajaxReturn($this->result->error('openId不能为空！', 'OPENID_REQUIRE'));
		 }
		 $userConnet = M('UserConnect');
		 $userConnet->startTrans(); // 开启事务
		 $ucResult = $userConnet->where(['openid' => $openId])->delete();
		 $unResult = M('UserUnion')->where(['openid' => $openId])->delete();
		 if ( $ucResult !== false && $unResult !== false ) {
			 $userConnet->commit(); // 提交
			 $this->ajaxReturn($this->result->success('第三方账户解绑成功！', 'SUCCESS'));
		 } else {
			 $userConnet->rollback(); // 回滚
			 $this->ajaxReturn($this->result->error('第三方账户解绑失败！', 'ERROR'));
		 }
	 }
   
    /*
     * 获取用户拥有的卡号信息
     * @param token  用户TOKEN
     */
	 public function getVipInfo(){
        $this ->authToken();
        $re = D('User/user') -> getVipInfo($this -> user_id);
        $this -> ajaxReturn($this -> result ->content(['data' => $re])->success());
    }

    /*
     * 获取用户当前等级
     * @param token  用户TOKEN
     */

    public function getUserLevel(){
        $this ->authToken();
        $re = D('User/user') -> getUserLevel($this -> user_id);
        $this -> ajaxReturn($this -> result ->content(['data' => $re])->success());
    }
}