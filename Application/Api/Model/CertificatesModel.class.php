<?php
namespace Api\Model;
class CertificatesModel extends ApiBaseModel{
	
	protected $autoCheckFields  =   false;
    protected $tableName  =   "certificates";
	
    /**
     * 编辑证件信息
     * @param array $info 证件数据
     * 
     */
    public function ceUp($info,$uid){
		if($info['pe_en']){
			$name['pe_en'] = $info['pe_en'];
		}
		
		if($info['real_name']){
			$name['pe_real_name'] = $info['real_name'];
		}
		
		$where['pe_type'] 		= 2;
		$where['fk_uid'] 		= $uid;
		/*if($name['pe_en'] || $name['pe_real_name']){
        	$res = M('my_passenger')->where($where)->data($name)-> save();
		}*/
		
		$data['ce_type'] 	= $info['ce_type'];
		// $data['fk_pe_id'] 	= $info['fk_pe_id'];
		$data['ce_number'] 	= $info['ce_number'];
		$data['fk_uid'] 	= $uid;

		$pe_id  = M('MyPassenger')->where(['fk_uid'=>$uid,'pe_type'=>2])->getField('pe_id');
		$wheres['ce_type'] 	= $info['ce_type'];
		
		$this->startTrans();
		if(!$pe_id){
			$name['pe_type'] = 2;
			$name['fk_uid'] = $uid;
			$res = M('my_passenger')->data($name)-> add();

			if(!$res){
				$this->rollback();
				return false;
			}

			$data['fk_pe_id'] = $res;
			$result = $this  -> add($data);
			if(!$result){
				$this->rollback();
				return false;
			}else{
				$this -> commit();
				return true;
			}
		}else{ 
			$wheresss = [
				'fk_uid'=>$uid,
				'ce_type'=>$info['ce_type'],
				'fk_pe_id'=>$pe_id,
			];
			$num = $this ->where($wheresss) -> count();
			if($num){
				$res = $this -> where($wheresss) -> save($data);
			}else{
				$data['fk_pe_id']=$pe_id;
				$res = $this  -> add($data);
			}

			if($res){
				$this -> commit();
				return true;
			}else{
				$this->rollback();
				return false;
			}
		}
    }

}