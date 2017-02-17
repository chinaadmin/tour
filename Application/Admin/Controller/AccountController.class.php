<?php
/**
 * 余额管理
 * @author liu
 * @date 2016-10-10
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class AccountController extends AdminbaseController {
	protected $curent_menu = 'Account/index';

    public function index(){
		$user =   D('User/Credits') ->getView();
		$list =  $this -> lists($user,$this -> _where(),'up_time desc');
		$this -> assign('lists',$list);
      	$this -> display();
    }

	private function _where(){
		$where['type'] = 0;
		$where['delete_time'] = 0;
		$minIntegral = I('minIntegral',0,'int');
		$maxIntegral = I('maxIntegral',0,'int');
		$start_time = I('start_time');
		$end_time = I('end_time');
		$mobile = I('mobile',"");
		if($maxIntegral){
			$where['credits'] = array(array('GT',$minIntegral),array('LT',$maxIntegral));

		}
		if($start_time && $end_time){
			$where['up_time'] = array(array('GT',strtotime($start_time)),array('LT',strtotime($end_time.'23:59:59')));
		}
		if($mobile){
			$where['mobile'] = array('like','%'.$mobile.'%');
		}
		return $where;
	}

	//用户余额详情
	public function info(){
		$uid = I('id','');
		if(empty($uid)){
			$this -> redirect('index');
		}
		$where['uid'] = $uid;
		$where['credits_type'] = 0;
		$user =   D('User/Credits') ->getLogView();
		$list =  $this -> lists($user,$where,'add_time desc');
		$this -> assign('mobile',M('user') -> where(['uid'=>$uid]) ->getField('mobile'));
		$this -> assign('lists',$list);
		$this -> assign('type',D('User/Credits') ->getOperateType());
		$this -> display();
	}
	//更新余额
	public function upIntegral(){
		$uid = I('post.id');
		$credits= I('post.credits',0,'float');
		$desc=I('post.remark');
		$is_change=I('post.state');
		$credits_type=0;
		$editor= $this ->user['username'];
		if(!$uid || !$credits){
			$this -> ajaxReturn(['msg' => '更新失败']);
		}
		$re = D('User/Credits') ->setOperateType(3) -> setCredits($uid,$credits,$desc,$is_change,$credits_type,$editor);
		$this -> ajaxReturn($re -> toArray());
		if($re == 1){
			$this -> ajaxReturn(['msg' => '更新成功','status' =>'success']);
		}
		$this -> ajaxReturn(['msg' => '更新失败']);
	}
	
}