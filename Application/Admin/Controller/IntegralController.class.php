<?php
/**
 * 积分 管理
 * @author liu
 * @date 2016-10-10
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class IntegralController extends AdminbaseController {
	protected $curent_menu = 'Integral/index';

    public function index(){
		$user =   D('User/Credits') ->getView();
		$list =  $this -> lists($user,$this -> _where(),'up_time desc');
		$this -> assign('lists',$list);
      	$this -> display();
    }

	private function _where(){
		$where['type'] = 1;
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

	//用户积分详情
	public function info(){
		$uid = I('id','');
		if(empty($uid)){
			$this -> redirect('index');
		}
		$where['uid'] = $uid;
		$where['credits_type'] = 1;
		$user =   D('User/Credits') ->getLogView();
		$list =  $this -> lists($user,$where,'add_time desc');
		$this -> assign('mobile',M('user') -> where(['uid'=>$uid]) ->getField('mobile'));
		$this -> assign('type',D('User/Credits') ->getOperateType());
		$this -> assign('lists',$list);
		$this -> display();
	}
	//更新积分
	public function upIntegral(){
		$uid = I('post.id');
		$credits= I('post.credits',0,'int');
		$desc=I('post.remark');
		$is_change=I('post.state');
		$credits_type=1;
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

	//设置积分
	public function set_integral(){
		$configs_model = D('Admin/Configs');

		if(I('post.')){
			$data['consumption_integral']  = I('post.consumption_integral',0,'int');
			//$data['deductible']  = I('post.deductible',0,'int');
			$data['deductible']  = 1;
			$result = $configs_model->saveConf ($data);
			$this->ajaxReturn($result->toArray());
		}
		$this -> assign('consumption_integral',$configs_model ->where(['code'=>'consumption_integral']) -> getfield('value'));
		$this -> assign('deductible',$configs_model ->where(['code'=>'deductible']) -> getfield('value'));
		$this -> curent_menu = 'Integral/set_integral';
		$this -> display();
	}
}