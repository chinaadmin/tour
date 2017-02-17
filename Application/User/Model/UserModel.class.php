<?php
/**
 * 用户类
 * @author cwh
 * @date 2015-04-09
 */
namespace User\Model;
use Common\Model\BaseModel;
use Common\Org\Util\Results;
use Think\Model\RelationModel;
use User\Interfaces\UserInterface;
use User\Org\Util\Integral;

class UserModel extends BaseModel implements UserInterface{

    protected $tableName = 'user';

    public $_validate = [
        ['username','require','ACCOUNT_REQUIRE::账号不能为空'],
    	['username','ifUniqueUsername','MOBILE_CODE_ERROR::用户名已注册',self::EXISTS_VALIDATE,'callback',self::MODEL_INSERT],

        ['aliasname','require','NICKNAME_REQUIRE::昵称不能为空'],
        ['real_name','require','REALNAME_REQUIRE::真实姓名不能为空'],
        ['pass','require','PASSWORD_REQUIRE::密码不能为空',self::MUST_VALIDATE,'',self::MODEL_INSERT],
    	//邮箱
        ['email','email','EMAIL_FORMAT_ERROR::邮箱格式不正确',self::VALUE_VALIDATE],
    	['email','ifUniqueEmail','EMAIL_EXISTS::邮箱已经存在',self::VALUE_VALIDATE,'callback',self::MODEL_INSERT],
        //手机
        ['mobile','number','MOBILE_FORMAT_ERROR::手机格式不正确',self::VALUE_VALIDATE],
    	['mobile','ifUniqueMobile','MOBILE_EXISTS::手机已经存在',self::VALUE_VALIDATE,'callback',self::MODEL_INSERT],

        ['mobile_code','verifyCode','MOBILE_CODE_ERROR::手机验证码错误',self::EXISTS_VALIDATE,'callback']
    ];

    public $_auto = [
        ['pass','pwdHash',self::MODEL_BOTH,'callback'],
        ['add_time','time',self::MODEL_INSERT,'function']
    ];

    //命名范围
    protected $_scope = [
        'normal'=>[// 获取正常状态
            'where'=>['status'=>1],
        ],
        'default'=>[// 获取没有被删除状态
            'where'=>[
                'delete_time'=>['eq',0]
            ]
        ],
    	'normalDefault' =>[
    			'where'=>[
    					'delete_time'=>['eq',0],
    					'status'=>1
    			]
    	]
    ];
 //验证用户名唯一性
    public function ifUniqueUsername($username){
    	$res = $this->scope()->where(array_merge($this->_scope['normal']['where'],['username' => $username]))->count();
    	return $res ?  false : true ;
    }
//验证邮箱唯一性
    public function ifUniqueEmail($email){
    	$res = $this->scope()->where(array_merge($this->_scope['normal']['where'],['email' => $email]))->count();
    	return $res ?  false : true ;
    }
//验证手机唯一性
    public function ifUniqueMobile($mobile){
    	$res = $this->scope('normal,default')->where(['mobile' => $mobile])->count();
    	return $res ?  false : true ;
    }
	public function getUid($mobile){
		return $this -> where(['mobile'=>$mobile,'delete_time'=>0])->order('add_time DESC')->getField('uid');
	}
    /**
     * 验证手机验证码
     * @param $code 验证码
     * @param $mobile 手机号
     * @param $type 1:注册 2：修改密码 3：修改手机
     * @return bool|mixed
     */
    public function verifyCode($code,$type=1,$mobile=''){
    	$vaild_time = intval(C("JT_CONFIG_WEB_SORT_MESSAGE_VAILD"));
    	$vaild_time = $vaild_time *60;
    	$mobile = I('request.username',$mobile);
    	if(empty($code) || empty($mobile)){
    		return false;
    	}else{
    		/* $where = array(
    			'code' => $code,
    			'type' => $type,
    			'extend' => $mobile,
    			'add_time' => array('EGT',time()-$vaild_time)
    		);
    		if(M('Code')->where($where)->find()){
    			return true;
    		}else{
    			return false;
    		} */
			if(session('login_'.$data['username']) == $invite_code){
				return true;
			}else{
				return false;
			}
    	}

    }
    /**
     * 密码加密
     * @param string $password 密码
     * @return bool|mixed
     */
    protected function pwdHash($password) {
        if(!empty($password)) {
            $pass = getpass($password);
            if($pass){
                return $pass;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    /**
     * 用户密码强度
     * @param string $password 密码
     * @return bool|mixed
     */
    protected function pwdStrength($password) {
        if(!empty($password)) {
            return passStrength($password);
        }else{
            return false;
        }
    }

    /**
     * 插入用户数据前的回调方法
     * @param array $data
     * @param array $options
     */
    protected function _before_insert(&$data,$options) {
        //用户标识
       // $mark = uniqueId();
       // $data['uid'] = $mark;
       // $this->data['uid'] = $mark;

        //用户密码强度
        $pass_length = $this->pwdStrength($data['pass']);
        $data['pass_length'] = $pass_length;
        $this->data['pass_length'] = $pass_length;

        //用户注册ip
        $this->data['reg_ip'] = get_client_ip(1,true);
    }

    /**
     * 新增用户成功后的回调方法
     * @param array $data
     * @param array $options
     * @return bool
     */
    protected function _after_insert($data,$options) {
        $uid = $data['uid'];
        /*//添加用户统计
        $where = array();
        $where['uid'] = $uid;
        M('UserCount')->data($where)->add();*/
        $account_model = $this->getAccountModel();
        //添加用户账号
        if(!empty($data['username']) && !$account_model->addAccount($uid,$data['username'],3)->isSuccess()){
			
            return false;
        }

        if(!empty($data['email']) && !$account_model->addAccount($uid,$data['email'],1)->isSuccess()){
            return false;
        }

        if(!empty($data['mobile']) && !$account_model->addAccount($uid,$data['mobile'],2)->isSuccess()){
            return false;
        }
        if(!M('my_passenger') -> add(['fk_uid' => $uid,'pe_type'=>2])){
            return false;
        }
        //初始化积分账户
        if(!$this->getCreditsModel()->initAccountCredits($uid)->isSuccess()){
            return false;
        }
        $data = array('uid'=>$uid);
        $this->addUserRelation($data);
        return true;
    }
    /**
     * user关联表预插入数据
     * @param  $data 要插入的数据
     */
    protected function addUserRelation($data,Array $tables=array()){
    	if(empty($tables)){
    	 $tables = array(
    			'UserAddress','UserProfile','UserAnalysis'
    	 );
    	}
    	foreach($tables as $v){
    		M($v)->add($data);
    	}
    	return true;
    }

    /**
     * 用户关联模型
     *
     */
    public function userRelation($reletion=true){
    	$_link = array(
    		'UserConnect'=> array(
    		   'mapping_type'=>RelationModel::HAS_ONE,
    		   'foreign_key' => 'uid'
    		),
    		'UserProfile' => array(
    		   'mapping_type' =>RelationModel::HAS_ONE,
    		   'foreign_key' => 'uid'
    		),
    		'UserAddress' => array(
    			'mapping_type' =>RelationModel::HAS_ONE,
    			'foreign_key' => 'uid'
    		)
    	);
    	return $this->dynamicRelation($_link)->relation($reletion);
    }
    /**
     * 用户视图模型
     * @param 要关联的表 user $field = array('User')
     * @param 要查询的字段    $filed = array('User'=>"username,mobile",'UserProfile'=>'')
     */
    public function userView($viewTable=array(),$field=array()){
    	$field = array(
    		'User'=> !empty($field['User'])?$field['User']:"*",
    		'UserConnect'=>!empty($field['UserConnect'])?$field['UserConnect']:"*",
    		'UserProfile'=>!empty($field['UserProfile'])?$field['UserProfile']:"*",
    		'UserAddress'=>!empty($field['UserAddress'])?$field['UserAddress']:"*"
    	);
    	$view = array(
    	    'User' => array($field['User'],"_type"=>'LEFT'),
    		'UserConnect'=>array($field['UserConnect'],"_on"=>"User.uid=UserConnect.uid","_type"=>"LEFT"),
    	    'UserProfile'=>array($field['UserProfile'],"_on"=>"User.uid=UserProfile.uid","_type"=>"LEFT"),
    	    'UserAddress'=>array($field['UserAddress'],"_on"=>"User.uid=UserAddress.uid","_type"=>"LEFT")
    	);
    	$viewFields = array();
    	if($viewTable){
    		foreach($viewTable as $v){
    			if(array_key_exists($v, $view)){
    				$viewFields[$v] = $view[$v];
    			}
    		}
    	}
    	if(empty($viewFields)){
    		$viewFields = $view;
    	}
    	return $this->dynamicView($viewFields);
    }
    /**
     * 修改用户前的回调方法
     * @param array $data
     * @param array $options
     * @return bool
     */
    protected function _before_update(&$data,$options) {
        //用户密码强度
        if(!empty($data['pass'])) {
            $pass_length = $this->pwdStrength($data['pass']);
            $data['pass_length'] = $pass_length;
            $this->data['pass_length'] = $pass_length;
        }
    }

    /**
     * 修改用户成功后的回调方法
     * @param array $data
     * @param array $options
     * @return bool
     */
    protected function _after_update($data,$options) {
        $uid = $options['where']['uid'];

        $account_model = $this->getAccountModel();
        //修改邮箱后更新账号
        if(isset($data['username']) && !$account_model->replaceAccount($uid,$data['username'],'',3)->isSuccess([Results::SUCCESS_CODE,'ACCOUNT_IS_MODIFY'])){
            return false;
        }

        if(isset($data['email']) && !$account_model->replaceAccount($uid,$data['email'],'',1)->isSuccess([Results::SUCCESS_CODE,'ACCOUNT_IS_MODIFY'])){
            return false;
        }

        //修改手机后更新账号
        if(isset($data['mobile']) && !$account_model->replaceAccount($uid,$data['mobile'],'',2)->isSuccess([Results::SUCCESS_CODE,'ACCOUNT_IS_MODIFY'])){
            return false;
        }

        return true;
    }

    /**
     * 删除用户成功前的回调方法
     * @param array $options
     * @return bool
     */
    protected function _before_delete($options) {
        $uid = $options['where']['uid'];
        if(!$this->getAccountModel()->delAllAccount($uid)->isSuccess()){
            return false;
        }
        if(!$this->getCreditsModel()->destroyAccountCredits($uid)->isSuccess()){
            return false;
        }
        return true;
    }


    /**
     * 通过id获取用户
     * @param integer $id 用户id
     * @return \Common\Org\util\Results
     */
    public function getUserById($id,$field=true){
        $result = $this->result();
        $where = [
            'uid' => $id
        ];
        $user_info = $this->field($field)->where($where)->find();
        if($user_info === false){
            return $result->set('GET_USER_FAILED');
        }
        //获取头信息
        if($user_info['headattr']){
			$attach = D('Upload/AttachMent')->getAttach($user_info['headattr']);
			$user_info['path'] = fullPath($attach[0]['path']);
        }else{
        	$user_info['path'] = '';
        }
        return $result->content($user_info)->set();
    }

    /**
     * 通过用户名获取用户/验证用户是否唯一
     * @param $username 用户名
     * @return \Common\Org\util\Results
     */
    public function getUserByName($username){
    	$result = $this->result();
    	$where = [
    		'username' => $username
    	];
    	$user_info = $this->scope('normalDefault')->where($where)->find();
    	if(empty($user_info)){
    		return $result->set('GET_USER_FAILED');
    	}
    	return $result->content($user_info)->set();
    }

    /**
     * 登录账户的类型
     * @param string $account 账号
     * @param int $type 类型
     * @return \Common\Org\util\Results
     */
    private function selectMode($account, $type) {
        return $this->getAccountModel()->loginAuth($account,$type);
    }

    /**
     * 登录流程
     * @param string $account 用户帐号
     * @param string $pasword 用户密码
     * @param $type 1为用户名
     * @param $is_login，1手机短信登陆
     * @return \Common\Org\util\Results
     */
    public function loginAuth($account, $pasword, $type = 0,$is_login=""){
        $result = $this->result();
        $sel_result = $this->selectMode($account, $type);
        if ($sel_result->isSuccess()) {
            $uid = $sel_result->getResult();
        }

        $where = [
            'uid' => $uid
        ];
        $user = $this->field('uid,pass,status')->scope()->where($where)->find();
        if ($user) {
            if ($user ['status'] == 0) {
                return $result->set('USER_IS_LOCKED');
            }
			if(!$is_login){
				if ($user ['pass'] != getpass($pasword)) {
					return $result->set('PASSWORD_ERROR');
				}
			}
            
            return $result->content($user['uid'])->set();
        } else {
            return $result->set('USER_NOT_EXIST');
        }
    }

    /**
     * 登录日志回调
     * @param integer $id 用户id
     * @param array $data 登录数据
     * @param integer $status 登录结果代码
     * @param string $info 登录结果
     */
    public function recordLogin($id, $data, $status, $info = ''){
        // TODO: Implement recordLogin() method.
    }

    /**
     * 获取账户模型
     * @return \Model|\Think\Model
     */
    public function getAccountModel(){
        return D('User/Account');
    }

    /**
     * 获取积分模型
     * @return \Model|\Think\Model
     */
    public function getCreditsModel(){
        return D('User/Credits');
    }
    /**
     * 检查某些唯一字段是否已经存在
     * @param int $type 类型  1：邮件 2：手机  3:用户名
     * @param string|int $val
     * @param string $uid 用户id
     * @return boolean 存在某字段返回false 反之true
     */
    public function ifExist($type,$val,$uid){
    	$where = $this->_scope['normal']['where'];
    	$where = array_merge($where,$this->_scope['default']['where']);
    	if($uid){
	    	$where['uid'] = ['not in',$uid];
    	}
    	$res = true;
    	if($type == 1){
    		$where['email'] = $val;
    		$res = $this->where($where)->count();
    	}else if($type == 2){
    		$where['mobile'] = $val;
    		$res = $this->where($where)->count();
    	}else if($type == 3){
    		$where['username'] = $val;
    		$res = $this->where($where)->count();
    	}
    	return $res ? false : true;
    }
    //用户名显示
    public function showUserName($uid){
    	$res = $this->scope()->where(['uid' => $uid])->find();
    	if(!$res){
    		return '';
    	}
    	if($res['aliasname']){
    		return $res['aliasname'];
    	}
    	return $res['username'];
    }
    //核对密码
    function checkPassWord($uid,$passwd){
    	$passwd = getpass($passwd);
    	$yumPasswd = $this->scope()->where([$this->getPk() => $uid])->getField('pass');
    	return ($passwd == $yumPasswd) ? true : false;
    }

    /**
     * 推荐用户
     * @param $uid 用户id
     * @param $invitation 好友id
     *
     */
    public function recommend($uid,$invitation){
        $invitation_info = $this->scope()->where(['uid'=>$invitation])->getField('uid');
        if(empty($invitation_info)){
            return ;
        }

        D('UserRecommend')->data([
            'uid'=>$uid,
            'recommend'=>$invitation,
            'add_time'=>NOW_TIME
        ])->add();

        //推荐用户积分添加
        $integral = Integral::getInstance();
        $integral->run('recommend_user',$invitation);
    }
    /**
     * 检查是否为内部员工
     *
     */
    function isInsideUser($userIdArr){
    	$userIdArr = (array)$userIdArr;
    	$count = $this->scope('default,normal')->where(['is_inside_user' => ['in',$userIdArr]])->count();
    	return $count ? true : false;
    }
    /**
     * 导出会员
     *
     * @param array $user
     *          要导出的数据
     */
    public function exportExcel($user) {
        $excel = new \Admin\Org\Util\ExcelComponent ();
        $excel = $excel->createWorksheet ();
        $excel->head ( array (
                '用户名',
                '用户昵称',
                '真实姓名',
                '交易额/次数',
                '上次交易时间',
                '用户余额',
                '用户来源',
                '最后一次登入时间',
                '内部员工'
        ) );
        $sn = "export";
        $data = array ();
        $key = 0;
        foreach ( $user as  $v ) {
            $sn = (string)$v ['username'];
            $data [$key] ["username"] = $v ["username"];
            $data [$key] ["aliasname"] = $v ["aliasname"];
            $data [$key] ["real_name"] = $v ["real_name"];
            $data [$key] ["dealTotalCount"] = $v ['dealTotalCount'];
            $data [$key] ["last_buy_time"] = $v ["last_buy_time"];
            $data [$key] ["account"] = $v ["account"];
            $data [$key] ["come_from"] = $v ['come_from'];
            if(!empty($v ["last_login_time"])){
               $data [$key] ["last_login_time"]=date('Y-m-d H:i:s',$v ["last_login_time"]);
            }else{
               $data [$key] ["last_login_time"]=$v ["last_login_time"];
            }
            if($v['is_inside_user']){
               $data [$key] ['is_inside_user']="是";
            }else{
                $data [$key] ['is_inside_user']="否";
            }
            // $this->addUserRow($v['goods'],$key,$data);
            $key++;
        }
        $excel->listData ( $data, array (
                "username",
                "aliasname",
                "real_name",
                "dealTotalCount",
                "last_buy_time",
                "account",
                "come_from",
                "last_login_time",
                "is_inside_user"
        ));
        $excel->output ( $sn . ".xlsx" );
    }
    /*//增加产品行
    private function addUserRow($goodsArr,&$key,&$data){
        if(count($goodsArr) <= 1){
            return;
        }
        unset($goodsArr[0]);
        foreach ($goodsArr as $v){
            $key++;
            $data [$key] ["goods_name"] = $v['name'];
            $data [$key] ["goods_number"] = $v['number'];
            $data [$key] ["goods_price"] = $v['goods_price'];
        }
        
    }*/

    /**
     * @return array
     */
    public function getInfo($uid)
    {
         $userView = [
             'user'=>[
                 'mobile',
                 'real_name',
                 'aliasname',
                 'member_id',
                 'one_number',
                 'add_time',
                 'family_number',
             ],
             'my_passenger'=>[
                 'pe_real_name',
                 'pe_id',
                 'pe_en',
                 'pe_birthday',
                 '_type' => 'left',
                 '_on' =>'my_passenger.fk_uid =user.uid',

             ],

             // 增加第三方用户表关联 xiaohuakang 2016-10-13
             'user_connect' => [
                 'openid',
                 '_as' => 'uc',
                 '_type' => 'left',
                 '_on' => 'user.uid = uc.uid'
             ]
         ];
        $re = $this -> dynamicView($userView) ->where(['user.uid'=>$uid,'pe_type'=>2])-> find();
        $data = M('certificates')->where(['fk_pe_id'=>$re['pe_id']])->select();
        $invoice = M('UserInvoice')->where(['uid'=>$uid])->select();//发票
        $address = M('UserShippingAddress')->where(['uid'=>$uid])->select();//常用地址
       if(!empty($data)){
           foreach ($data as $v){
               $re['type'.$v['ce_type']] = $v['ce_number'];
           }
       }
        if(!empty($invoice)){
            foreach ($invoice as $key=>$v){
                $re['invoice'][$key] = $v['invoice_payee'];
            }
        }
        if(!empty($address)){
            foreach ($address as $key=>$v){
                $re['address'][$key]['name'] = $v['name'];
                $re['address'][$key]['mobile'] = $v['mobile'];
                $re['address'][$key]['addr'] = $v['user_localtion'].$v['user_detail_address'];
            }
        }
        $re['member_id'] = D('Admin/member') ->getName($re['member_id']);
        $re['pe_birthday'] = empty($re['pe_birthday'])?'':date('Y-m-d H:i:s',$re['pe_birthday']);
        $re['add_time'] = empty($re['add_time'])?'':date('Y-m-d H:i:s',$re['add_time']);
        return  $re;
    }

    /*
     * 获取用户拥有的卡号信息
     * @param $uid  用户UID
     */
    public function getVipInfo($uid){
        $vipInfo = $this -> where(['uid' =>$uid])->field('one_number,family_number') -> find();
        $member  = M('member')->getField('member_id,member_name');
        $arr[0]['num'] = $vipInfo['one_number'];
        $arr[0]['name'] = $member[2];
        $arr[1]['num'] = $vipInfo['family_number'];
        $arr[1]['name'] = $member[3];
        return $arr;
    }

    /*
     * 获取用户当前等级
     * @param $uid  用户UID
     */

    public function getUserLevel($uid){
       if(empty($uid)){
           return false;
       }
        $user['member_id'] = $this -> where(['uid' => $uid]) -> getField('member_id');
        if( $user['member_id'] === false){
            return false;
        }
        $user['name'] = M('member') -> where(['member_id'=>$user['member_id']]) -> getField('member_name');
        return $user;
    }
}
