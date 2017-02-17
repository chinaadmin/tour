<?php
/**
 * 会员等级
 * @author xiongzw
 * @date 2015-06-10
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
class UserGradeController extends AdminbaseController{
	protected $curent_menu = "UserGrade/index";
	protected $grade_model;
	public function _initialize(){
		parent::_initialize();
		$this->grade_model = D("User/UserGrade");
	}
	/**
	 * 会员等级列表
	 */
	public function index(){
		$lists = $this->lists($this->grade_model,'','level DESC,add_time DESC');
		$this->assign("lists",$lists);
		$this->assign("express",$this->grade_model->express);
		$this->display();
	}
	/**
	 * 添加编辑等级
	 */
	public function edit(){
		$gid = I('request.gid',0,'intval');
		if($gid){
			$info = $this->grade_model->getById($gid);
			$this->assign("info",$info);
		}
		$this->display();
	}
	/**
	 * 更新等级
	 */
	public function update(){
		if(IS_POST){
			$data = array(
					"grade_name"=>I("post.name",''),
					"grade_discount"=>I('post.discount',''),
					"grade_status" => I('post.status',0,'intval'),
					"grade_default" => I('post.default',0,'intval'),
 					"grade_express" => I('post.express',0,'intval'),
 					"grade_money" => I("post.start_money",''),
//					"grade_money" => I("post.grade_money",''),
					"add_time" => NOW_TIME,
					"recharge"=>I("post.recharge",0,'intval'),
					"recharge_money"=>I("post.recharge_money",""),
					"recharge_ex_money"=>I("post.recharge_ex_money",""),
					"integral"=>I("post.integral",""),
					"integral_money"=>I("post.integral_money",""),
					"special"=>I("post.special",0,"intval")
			);
			if($data['grade_express']==4){
				$data['grade_ex_money'] = I("post.end_money",'');
			}
			$gid = I('request.gid',0,'intval');
			if($gid){
				$where = array(
						'gid'=>$gid
				);
				$data['gid'] = $gid;
				$result = $this->grade_model->setData($where,$data);
			}else{
				$data["level"] = $this->grade_model->getMaxGrade()+1;
				$result = $this->grade_model->addData($data);
				$id = $result->toArray();
				$gid = $id['result']; 
			}
			if($result->isSuccess()){
				if ($data ['grade_default'] == 1) {
					if ($gid)
						$this->grade_model->clearDefault ( $gid );
				} else {
					// 如果没有默认设置等级最低的为默认
					$this->grade_model->setDefaultGrade();
				}
			}
			$this->ajaxReturn($result->toArray());
		}
	}
	
	/**
	 * 批量删除
	 */
	public function del(){
		$gid = I('request.gid','');
		$gids = $this->grade_model->userHasGrade($gid);
		if($gids['success']){
			$where = array(
					'gid'=>array('in',$gids['success'])
			);
			$result = $this->grade_model->delData($where);
			$msg = $gids['success_count']."删除成功！".$gids['fail_count']."条记录中有会员,不能删除！";
			$this->ajaxReturn($result->success($msg)->toArray());
		}else{
			$msg = $gids['fail_count']."条记录中有会员,不能删除！";
			$this->ajaxReturn($this->result->error($msg)->toArray());
		}
	}
	
	/**
	 * 更新等级级别
	 */
	public function changeGrade(){
		$level = I('post.level',0,'intval');
		$gid = I('post.gid',0,'intval');
		$type = I('post.type','','intval');
		$result = $this->grade_model->updateLevel($gid,$level,$type);
		$this->ajaxReturn($result->toArray());
	}
}