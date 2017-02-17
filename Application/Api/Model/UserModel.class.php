<?php
namespace Api\Model;
class UserModel extends ApiBaseModel{

    protected $autoCheckFields  =   false;

    /**
     * 手机加密token
     * @param string $mobile 手机
     * @param string $code 编号
     * @return string
     */
    public function mobileEncrypt($mobile,$code){
        return path_encrypt($mobile.'|'.$code.'|'.NOW_TIME);
    }

    /**
     * 解密token手机
     * @param string $token token
     * @return array
     */
    public function mobileDecrypt($token){
        $info = path_decrypt($token);
        // print_r($info);exit();
        $info = explode('|',$info);
        $result = $this->result();
        if(count($info)<3){
            return $result->set('TOKEN_AUTH_FAILED');
        }

        if($info[2] + 60*10<NOW_TIME){
            return $result->set('TOKEN_HAS_EXPIRED');
        }

        return $result->content([
            'mobile'=>$info[0],
            'code'=>$info[1]
        ])->success();
    }
    
    /**
     * 判断第三方账号是否绑定
     */
    public function isBind($openid,$unionid){
    	if(!empty($unionid)){
    		$uid = M("UserConnect")->where(['unionid'=>$unionid])->getField("uid");
    	}else{
    		$uid = M("UserConnect")->where(['openid'=>$openid])->getField("uid");
    	}
    	if($uid){
    		if(M('User')->where(['uid'=>$uid])->find()){ //用户已绑定
    			return false;
    		}else{
    			return true;
    		}
    	}
    	return true;
    }
    
    /**
     * 通过uid判断是否已绑定
     * @param unknown $uid
     */
    public function bindByUid($uid,$type){
    	return M("UserConnect")->where(['uid'=>$uid,'type'=>strtolower($type)])->find();
    }
	
	/**
     * 通过uid获取用户详情
     * @param string $uid
	 * @param string $field 
     */
	public function user_profile($uid,$field=true){
		return M("user_profile")->where(['uid'=>$uid])->getField($field);
	}
	
	
	
	/**
     * 通过uid获取用户证件
     * @param string $uid
	 * @param string $type 
     */
	public function certificates($uid,$type=false){
		$arr =array('','身份证','港澳通行证','护照','台湾通行证','军官证','台胞证','回乡证','户口本','出生证明','其他证件');

        $peInfo = M("MyPassenger")->field('pe_id,pe_en')->where(['fk_uid'=>$uid,'pe_type'=>2])->find();
        // dump($peInfo);exit;
		if($type){
			$res =  M("certificates")->where(['fk_uid'=>$uid,'fk_pe_id'=>$peInfo['pe_id']])->order('ce_type asc') -> find();


			if($res){
				unset($res['fk_uid']);
				$res['ce_number'] = $res['ce_number'];
				$res['name'] = $arr[$res['ce_type']];
                $re=[];
                $re['pe_en']=$peInfo['pe_en'];
				$re[0] = $res;
			}else{
				$re = $res;
                $re['pe_en']=$peInfo['pe_en'];
			}
		}else{
            $re = [];
			$re =  M("certificates")->where(['fk_uid'=>$uid,'fk_pe_id'=>$peInfo['pe_id']])-> order('ce_type asc') ->select();
            // dump($re);exit;
			if($re){
                $fk_pe_id=$re[0]['fk_pe_id'];
				foreach($re as $k => &$v){
					unset($v['fk_uid'],$v['fk_pe_id']);
					$v['ce_number'] = $v['ce_number'];
					$v['name'] = $arr[$v['ce_type']];
				}
			}
            $re['pe_en']=$peInfo['pe_en'];
            $re['fk_pe_id']=$fk_pe_id;
		}

		return $re;
	}
	
	//获取头信息
	public function headattr($headattr){
        if($headattr){
			$attach = D('Upload/AttachMent')->getAttach($headattr);
			$path = fullPath($attach[0]['path']);
        }else{
        	$path = '';
        }
		return $path;
	}
}