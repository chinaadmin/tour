<?php
/**
 * Created by PhpStorm.
 * User: 陈董董
 * Date: 2016/7/25 0025
 * Time: 17:42
 */
namespace Admin\Model;
use Common\Model\AdminbaseModel;
class UserModel extends AdminbaseModel
{
    protected $tableName = "user";

    /**
     * 获取会员列表
     */
    public function getMemView()
    {
        $viewFields = [
            'User'=>[
                "*",
                "_type"=>"LEFT"
            ],
            'MyPassenger'=>[
                "pe_id",
                "pe_type",
                "_on"=>"User.uid=MyPassenger.fk_uid and pe_type=2",
                "_type"=>"LEFT"
            ],
            'Certificates'=>[
                "ce_number",
                "ce_type",
                "_on"=>"User.uid=Certificates.fk_uid and Certificates.ce_type=1 and MyPassenger.pe_id=Certificates.fk_pe_id",
                "_type"=>"LEFT"
            ]
        ];
        return $this->dynamicView($viewFields);
    }

}