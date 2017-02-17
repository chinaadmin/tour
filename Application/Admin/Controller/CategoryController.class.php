<?php
/**
 * 商品分类
 * @author xiongzw
 * @date 2015-04-09
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
use Common;
class CategoryController extends AdminbaseController {
	protected $curent_menu = 'Category/index';
	protected $category_model;
	public function _initialize() {
		parent::_initialize ();
		$this->category_model = D('Category');
	}
	/**
	 * 商品分类列表
	 */
	public function index() {
		$data = $this->treeCategory ();
		$this->assign ( 'lists', $data );
		$this->display ();
	}
	
	/**
	 * 树形分类
	 * 
	 * @param string $field        	
	 * @return $data
	 */
	private function treeCategory($field = true) {
		$icon = array (
				'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
				'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
				'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
			);
		return $this->category_model->getTree($field,$icon);
	}
	/**
	 * 添加/编辑分类
	 */
	public function edit() {
		// 获取分类
		$category = $this->treeCategory();
		$cat_id = I ( 'request.cat_id', 0, 'intval' );
		
		if ($cat_id) {
			$childs = $this->category_model->getChilds ( $cat_id );
			$childs [] = $id;
			$info = $this->category_model->getById ( $cat_id );

			
			$this->assign ( 'childs', $childs );
			$this->assign ( 'info', $info );
		}
		
		$this->assign ( 'categorys', $category );
		
		$this->display ();
	}
	
	/**
	 * 更新
	 */
	public function update() {
		$data = array();
		if (IS_POST) {
			$data = array (
				"name" => I('post.name',''),
				"pid" => I('post.pid',0,'intval'),
				"status" => I('post.status',0,'intval'),
				"add_time" => NOW_TIME,
			);
			$cat_id = I ( 'post.cat_id', 0, 'intval' );
			$where = array();
			if($cat_id) {
				$data ['update_time'] = NOW_TIME;
				unset ($data ['add_time']);
				// $result = M('Cate')->where(['cat_id'=>$cat_id])->save($data);
				$where['cat_id']=$cat_id;
				$result = $this->category_model->setData($where,$data);
			}else{
				// $result = M('Cate')->add($data);
				$result = $this->category_model->addData($data);
			}

			$this->ajaxReturn($result->toArray());
		}
	}
	/**
	 * 删除分类
	 */
	public function del() {
		$id = I('request.cat_id', 0, 'intval');
		$child = $this->category_model->getChilds ( $id );
		if ($child) {
			$this->ajaxReturn($this->result->error('请先删除子分类！')->toArray());
		}
		$hasGoods = M('Goods')->where(['cat_id'=>$id])->count();
		if (!empty($hasGoods)) {
			$this->ajaxReturn($this->result->error('该分类有关联的线路，不允许删除')->toArray());
		}
		$where = [ 
			'cat_id' => $id 
		];
		// $this->category_model->delAttr($id);
		$result = $this->category_model->delData ( $where );
		$this->ajaxReturn ( $result->toArray () );
	}
	
	/**
	 * 保存排序
	 */
	public function sort() {
		$sort = I ( 'request.sort' );
		$result = $this->category_model->saveSort ( $sort, false, 'sort', 'cat_id' );
		$this->ajaxReturn ( $result->toArray());
	}
	/**
	 * 通过类型获取属性
	 */
	public function attrs(){
		$type_id = I('post.type_id',0,'intval');
		$result['success'] = false;
		if($type_id){
			$atts = D('Attr')->getByType($type_id);
			if($atts){
				$result['success'] = true;
				$result['data'] = $atts;
			}
		}
		$this->ajaxReturn($result);
	}

	/**
	 * 目的地
	 */
	public function destination(){
		$this->display();
	}

	/**
	 * 出发地
	 */
	public function departure(){
		$this->display();
	}
}
