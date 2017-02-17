<?php
/**
 * 会员卡销售记录
 * @author chendongdong
 * @date 2015-07-13
 */
namespace Admin\Model;
use Common\Model\AdminbaseModel;
class UserCardsaleModel extends AdminbaseModel{
	protected $tableName = "user_cardsale";
//	public $number =1000; //编号规则 主键+1000
	/**
	 * 会员卡销售记录视图模型
	 */
	public function getCardsale(){
		$viewFields = [
				'UserCardsale'=>[
					"*",
					"_type"=>"LEFT"
				],
				'MailcardInformation'=>[
					"*",
					"_on"=>"UserCardsale.cid=MailcardInformation.cardsale_cid",
					"_type"=>"LEFT"
				],
				'User'=>[
					"one_number",
					"family_number",
					"_on"=>"UserCardsale.uid=User.uid"
				]
		];
		return $this->dynamicView($viewFields);
	}

	/**
	 * @return 导出excel数据视图模型
	 */
	public function getCardsaleExcel(){
		$viewFields = [
			'UserCardsale'=>[
				"cid",
				"phone_number",
				"upgrade_time",
				"original_level",
				"upgrade_level",
				"_type"=>"LEFT"
			],
			'MailcardInformation'=>[
				"card_physical_type",
				"phone",
				"receive_person",
				"receive_address",
				"_on"=>"UserCardsale.cid=MailcardInformation.cardsale_cid",
				"_type"=>"LEFT"
			],
			'User'=>[
				"one_number",
				"family_number",
				"_on"=>"UserCardsale.uid=User.uid"
			]
		];
		return $this->dynamicView($viewFields);
	}
}