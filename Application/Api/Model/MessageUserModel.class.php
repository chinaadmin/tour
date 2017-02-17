<?php
namespace Api\Model;
class MessageUserModel extends ApiBaseModel{

    protected $autoCheckFields  =   false;
    protected $tableName  =   "message_user";
	
	
	public function get_message($uid,$push_name=0){
		
		//查询所有未读消息
		if($push_name == 0){
			//查询促销
			$data["0"] = M('Message_user')
				->join('LEFT JOIN __MESSAGE_PUSH__ ON __MESSAGE_USER__.fk_push_id=__MESSAGE_PUSH__.push_id')
				->where(['user_id' =>$uid,'fk_push_name' =>1])
				->field("push_id,push_name,push_brief,addtime,push_title")
				->order("addtime desc") ->find();
			
			$data["0"]['count'] = $this -> where(['user_id' =>$uid,'state'=>1,'fk_push_name' =>1]) -> count();
			$data["0"]['addtime'] = empty($data["0"]['addtime'])?'':date('m月d日',$data["0"]['addtime']);
			
			//查询新品上市
			$data["1"] = M('Message_user')
				->join('LEFT JOIN __MESSAGE_PUSH__ ON __MESSAGE_USER__.fk_push_id=__MESSAGE_PUSH__.push_id')
				->where(['user_id' =>$uid,'fk_push_name' =>2])
				->field("push_name,push_id,push_brief,addtime,push_title")
				->order("addtime desc") ->find();
			$data["1"]['count'] = $this -> where(['user_id' =>$uid,'state'=>1,'fk_push_name' =>2]) -> count();
			$data["1"]['addtime'] = empty($data["1"]['addtime'])?'':date('m月d日',$data["1"]['addtime']);
			
			$data[2]['addtime'] ="";
			$data[2]['push_id'] ="";
			$data[2]['push_brief'] ="";
			$data[2]['push_title'] ="";
			$data[2]['count'] ="0";
			$data[2]['push_name'] = 3;
			//查询物流信息
			$data["3"] = M('message_logistics') -> where(['uid'=>$uid]) ->order("addtime desc")->field('addtime') ->find();
			$data["3"]['count'] = M('message_logistics') -> where(['uid' =>$uid,'state'=>1]) -> count();
			$data["3"]['addtime'] = empty($data["3"]['addtime'])?"":date('m月d日',$data["3"]['addtime']);
			$data["3"]['push_name'] = 4;
			$data["3"]['push_id'] = '';
			$data["3"]['push_title'] = '';
			$data["3"]['push_brief'] = '';
			
			$data[4]['addtime'] ="";
			$data[4]['push_id'] ="";
			$data[4]['push_brief'] ="";
			$data[4]['push_title'] ="";
			$data[4]['count'] = "0";
			$data[4]['push_name'] = 5;
			
			$data[5]['push_title'] ="";
			$data[5]['addtime'] ="";
			$data[5]['push_id'] ="";
			$data[5]['push_brief'] ="";
			$data[5]['count'] ="0";
			$data[5]['push_name'] = 6;
			return $data;
		}
		
		//查询物流未读信息
		
		if($push_name==4){
			$arr = array('[在途中]','[已揽收]','[疑难]','[已签收]','[退签]','[同城派送中]','[退回]','[转单]','[已发货]');
			$order_type = M('message_logistics') -> where(['uid'=>$uid]) ->order("state asc, addtime desc") ->select();
			foreach($order_type as $k =>$v){
				
				if($v['type'] ==1){
					
					$order = D('Admin/Order') -> getGoodsByInfo($v['order_id']);
					$data[$k]['time'] = $this -> fromat_time($v['addtime']);
					$data[$k]['rec_id'] = $order['rec_id'];
					$data[$k]['order_id'] = $order['order_id'];
					$data[$k]['name'] = $order['name'];
					$data[$k]['pic'] = 'http://'.$_SERVER['HTTP_HOST'].$order['pic'];
				}else if($v['type'] ==2){
					$order = M('crowdfunding_order_goods')
							->join('LEFT JOIN __CROWDFUNDING_ORDER__ ON __CROWDFUNDING_ORDER_GOODS__.fk_cor_order_id=__CROWDFUNDING_ORDER__.cor_order_id')
							->join('LEFT JOIN __CROWDFUNDING_GOODS__ ON __CROWDFUNDING_ORDER_GOODS__.fk_cg_id =__CROWDFUNDING_GOODS__.cg_id')
							->where(['cog_id'=>$v['order_id']])
							->find();
					$data[$k]['time'] 		= $this -> fromat_time($order['cog_shipping_time']);
					$data[$k]['rec_id'] 	= $v['order_id'];
					$data[$k]['order_id'] 	= $order['cor_order_id'];
					
					$data[$k]['name'] 		= $order['cg_goods_name'];
					$img = D( 'Upload/AttachMent' )->getAttach ($order['cg_att_id']);
					$data[$k]['pic'] 		= 'http://'.$_SERVER['HTTP_HOST'].$img[0]['path'];
					
					
				}
				$data[$k]['logistics_state']=$arr[$v['logistics_state']];
				$data[$k]['type'] = $v['type'];
				$data[$k]['code'] = $v['number'];
				$data[$k]['state'] = $v['state'];
				
			}
			//M('message_logistics') -> where(['user_id' =>$uid,'state'=>1]) -> save(['state' => 2]);
			return $data;
		}
		
		//查询指定消息
		$list = M('Message_user')
				->join('LEFT JOIN __MESSAGE_PUSH__ ON __MESSAGE_USER__.fk_push_id=__MESSAGE_PUSH__.push_id')
				->where(['user_id' =>$uid,'push_name' =>$push_name])->order("state asc,addtime desc")
				->field("push_name,push_title,push_id,push_att_id,push_brief,push_url,push_note,push_is_app,push_message,push_addtime,id,state") ->select();
		
		if(empty($list)){
			return false;
		}
		$img = M('attachment');
		foreach($list as &$v){
			
			$img_nfo = $img ->where(['att_id' => $v['push_att_id']]) ->  find();
			$v['img_url'] = 'http://'.$_SERVER['HTTP_HOST'].$img_nfo['path']."/".$img_nfo['name'].".".$img_nfo['ext'];
			$v['push_addtime'] = $this -> fromat_time($v['push_addtime']);
			unset($v['push_att_id']);
		}
		
		//更新消息状态
		//$this -> where(['user_id' =>$uid,'state'=>1,'fk_push_name' =>$push_name]) -> save(['state' => 2]);
		return $list;
	}
	
	//格式化时间
	private function fromat_time($data){
		//$time = strtotime(date('Y年m月d日',time())) - strtotime(date('Y年m月d日',$data));
		$time = strtotime(date('Y-m-d',time())) - strtotime(date('Y-m-d',$data));
		if($time == 0){
			return date('H:i',$data);
		}if($time == 86400){
			return '昨天';
		}else{
			return date('Y年m月d日',$data);
		}
	}
}