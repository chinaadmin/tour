<?php
namespace Api\Controller;
class ClassifyController extends ApiBaseController {
	
	public function index(){
		$this -> ajaxReturn($this -> result -> content(['data'=>D('Admin/classify') -> all()]) -> success());
		//$this->ajaxReturn($this->result->content(['data'=>$re])->success());
	}
}