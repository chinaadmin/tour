<?php
/**
 * 管理员用户类
 * @author cwh
 * @date 2015-04-01
 */
namespace Admin\Model;
use Common\Model\AdminbaseModel;
class MyPassengerModel extends AdminbaseModel{

    protected $tableName = 'my_passenger';

    /* public $_validate = [
        ['email','email','EMAIL_FORMAT_ERROR::邮箱格式不正确',self::EXISTS_VALIDATE],
        ['role_id','require','ROLE_REQUIRE::角色不能为空'],
    	['role_id','modRole','ROLE_MODI_FAIL::修改角色失败',self::VALUE_VALIDATE,'callback',self::MODEL_UPDATE ],
        ['username','require','ACCOUNT_REQUIRE::账号不能为空'],
        ['username','ifUniqueUsername','ACCOUNT_EXISTS::账号已经存在',self::EXISTS_VALIDATE,'callback',self::MODEL_BOTH],
        ['password','require','PASSWORD_REQUIRE::密码不能为空',self::MUST_VALIDATE,'',self::MODEL_INSERT]
    ]; */
   /*  public $_auto = [
        ['password','pwdHash',self::MODEL_BOTH,'callback'],
        ['add_time','time',self::MODEL_INSERT,'function'],
        ['invite_code','create_invite_code',self::MODEL_INSERT,'callback'],
    ]; */

    /* //命名范围
    protected $_scope = [
        'normal'=>[// 获取正常状态
            'where'=>['status'=>1],
        ],
        'default'=>[// 获取没有被删除状态
            'where'=>[
                'delete_time'=>['eq',0]
            ],
        ]
    ]; */

	
	//获取旅客列表
	public function mp_info($uid,$type="1"){
		$where['fk_uid'] = $uid;
		$where['pe_type'] = $type;
		$my_passeenger = $this ->where($where) -> select();
		$arr =array('','身份证','港澳通行证','护照','台湾通行证','军官证','台胞证','回乡证','户口本','出生证明','其他证件');
		foreach($my_passeenger as $k =>&$v){
			if($v['pe_id']){
				$certificates = M('certificates') -> where(['fk_pe_id' => $v['pe_id']])->field('ce_id,ce_type,ce_number') ->order('ce_type asc') -> select();
				foreach($certificates as $key => $val){
					$certificates[$key]['ce_name'] = $arr[$val['ce_type']];
				}
				if(empty($certificates)){
					$certificates[] = array(
						'ce_type' => '',
						'ce_number' => '',
						'ce_name' => '',
					);
				}
				$v['certificates'] = $certificates;
			}
			$v['pe_birthday'] = empty($v['pe_birthday'])?"":date('Y-m-d',$v['pe_birthday']);
		}
		return $my_passeenger;
	}

	//获取旅客列表
	public function mp_infos($uid,$type="2"){
		// "ce_id": "22",
		// "ce_type": "1",
		// "ce_number": "441424199205200820",
		// "ce_name": "身份证"

		$where['fk_uid'] = $uid;
		$where['pe_type'] = $type;
		$my_passeenger = $this->where($where)->find();
		$arr =array('','身份证','港澳通行证','护照','台湾通行证','军官证','台胞证','回乡证','户口本','出生证明','其他证件');
		$certificates = M('certificates') -> where(['fk_pe_id' => $my_passeenger['pe_id'],'ce_type'=>1])->field('ce_id,ce_type,ce_number') ->order('ce_type asc') -> find();
		if($certificates){
			$certificates['ce_name']=$arr[$certificates['ce_type']];
		}
		
		return $certificates?$certificates:[];
	}
	
    //编辑旅客信息
	public function mp_up($uid,$data){
		$certificates = json_decode(html_entity_decode($data['certificates']),true);
		$fk_pe_id = $data['pe_id'];
		$data['pe_en'] = html_entity_decode($data['pe_en']);
		unset($data['certificates']);
		$where['pe_id'] = $data['pe_id'];
		$this -> startTrans();
		//如果旅客id不为空就更新旅客表，否者获取用户id，并添加到旅客表
		if(!empty($fk_pe_id)){
			$passenger = $this -> where($where) ->save($data);//更新记录，若数据没变化返回0，但还是成功

			if($passenger !== false) {
				$flag = true;
			}else{
				$flag = false;
			}
		}else{
			$data['fk_uid'] = $uid;
			$passenger = $this  ->add($data);
			if($passenger) {
				$flag = true;
				$fk_pe_id = $passenger;	//旅客id号
			}else{
				$flag = false;
			}
		}
		if($certificates){
			$re = $this -> ce_add($certificates,$fk_pe_id,$uid);
		}else{
			$re = false;//没有填写身份信息不提交
		}

		if($re && $flag){
		   $this -> commit();
		   return true;
		}else{
		    $this -> rollback();
			return false;
		}
	}
	
	//更新证件信息
	private function ce_add($data,$fk_pe_id="",$uid){

		$certificates = M('certificates');
		//如果有数据，说明是编辑操作先删除数据，使编辑跟添加操作同步
		$where['fk_pe_id'] = $fk_pe_id;
		$certificates -> where($where) -> delete();
		foreach($data as &$temp){
			$temp['fk_uid'] = $uid;
			$temp['fk_pe_id'] = $fk_pe_id;
		}
		$res = $certificates -> addAll($data);
		if ($res) {
			return true;
		}
		/*foreach($data as &$v){
			$v['fk_uid'] = $uid;
			$where['ce_id'] = $v['ce_id'];
			if(!empty($v['ce_id'])){//如果存在身份id就是编辑更新操作
				$re = $ce -> where($where) -> save($v);
				if($re !== false) {
					$flag = true;
				}else{					
					$flag = false;
				}
			}else{
				// echo '111';exit();
				//判断是否存在相同类型的证件，如果存在就更新,不存在就添加
				$v['fk_pe_id'] = $fk_pe_id;
				$condition['fk_pe_id'] = $fk_pe_id;
				$condition['ce_type'] = $v['ce_type'];
				$res = $ce ->where($condition)->find();
				if($res) {
					$v['ce_id'] = $res['ce_id'];
					$re = $ce ->where($condition)->save($v);
					$flag = true;
				}else{					
					$re = $ce -> add($v);
					if($re) {
							$flag = true;
					}else{
							$flag = false;
					}
				}				
			}
			
			if(!$flag){
				return false;
			}
		}*/
		return false;
	}

    /**
     * 通过id获取真实姓名
     * @param integer $id 用户id
     */
    public function getUserName($id){
        
        $where = [
            'fk_uid' => $id,
			'pe_type' => 2,
			
        ];
		return $this -> where($where) -> getfield('pe_real_name');

    }
	
	/**
     * 通过uid获取用户详情
     * @param string $uid
	 * @param string $field 
     */
	public function user_info($uid,$field=true){
		
		$re = $this->where(['fk_uid'=>$uid,'pe_type'=>2])->getField($field);
		return $re;
	}
    
}