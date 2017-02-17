<?php
/**
 * 用户逻辑类
 * @author cwh
 * @date 2015-04-09
 */
namespace Admin\Controller;
use Common\Controller\AdminbaseController;
header('Content-type: text/html; charset=utf-8');
class UserController extends AdminbaseController {

    protected $curent_menu = 'User/index';
    protected $allParam = [];
    protected $combineWay = '';
    protected $conditionArr = [];
    /**
     * 列表
     */
    public function index(){
		$where = [];
        //来自后台首页的搜索
        if(I('today')){     //今日订单
            $time = strtotime(date('Y-m-d'));
            $ntime = $time+(3600*24);
            $where['add_time']=['between',[$time,$ntime]];
        }
        if(I('yesterday')){   //昨日订单
            $time = strtotime(date('Y-m-d',strtotime("-1 day")));
            $ntime = $time+(3600*24);
            $where['add_time']=['between',[$time,$ntime]];
        }

		if(I('mobile')){
			$where ['mobile|username'] = array('like',"%".I('mobile')."%");
		}
		
		if(I('real_name')){
			$where['real_name'] = array('like',"%".I('real_name')."%");
		}
		if(I('member_id')){
            $where['member_id'] = I('member_id');
        }
		if(I('ce_number')){
            $where['ce_number'] = array('like',"%".I('ce_number')."%");
		}
		
		if(I('start_time') && I('end_time')){
            $ystr = I('end_time').'23:59:59';
			$where['add_time'] = array('between',strtotime(I('start_time')).",".strtotime($ystr));
		}

        if(!empty(I('come_from'))){
            $where['come_from'] = I('come_from');
        }
        $where['delete_time'] = 0;//获取没有被删除的数据
//        $user_model = D('User')->getMemView()->fetchsql()->select();
//        print_r($user_model);exit;
        $user_model = D('User')->getMemView();
        $user = $this->getUserListByOrder($user_model,$where);
//        var_dump($user);exit;
        
        $data =D('Member') -> getMember() ->formatData(['member_id','member_name']);
        $this -> assign('data',$data);
        $this->assign('lists',$user);
        $membetName = D('member') -> getMember() -> formatName('member_id');
        $this ->assign('membetName',$membetName);
        $this->display('index');
    }
    /**
     * 根据不同点击获取不同的排序规则
     * @param $user_model 用户模型
     * @param $where 查询条件
     * @return mixed 按查询条件返回的数组
     */
    private function getUserListByOrder($user_model,$where){
        if (!empty(I('get.sort_id'))){
            if (I('get.sort_id') <= 3){
                $id_status = I('get.sort_id') == 2? 1:2;
                $this -> assign(['id_status'=>$id_status]);
                return I('get.sort_id') == 2 ? $this->lists($user_model,$where,'add_time asc'):$this->lists($user_model,$where,'add_time desc');
            }
        }else{
            $id_status = 3;
            $this -> assign(['id_status'=>$id_status]);
            return $this->lists($user_model,$where,'add_time desc');
        }
    }

    //导出全部会员excel
    public function allExport(){
        //获取用户信息
        $viewTable = array(
                'User','UserProfile','UserAddress','UserConnect'
        );
        $viewField = [
            'User' =>'*',
            'UserProfile'=>'user_birthday,user_interest,user_marital_status,user_monthly_profit,user_study_level,user_trade,user_ID,user_birthday',
            'UserAddress' =>'user_provice,user_city,user_county,user_town,user_localtion,user_detail_address,UserAddress.type,user_provice',
            'UserConnect'=>'yzid'
        ];
        $user_model = D('User/User')->userView($viewTable,$viewField);
        $where = [];
        $where['delete_time'] = ['eq',0];
        if($mix_keywords = I('mix_keywords','','trim')){
            $this->mix_keywords = $mix_keywords;
            $where['username|aliasname|mobile|email'] = ['like','%'.$mix_keywords.'%'];
        }
        $grade_id = I('grade_id',0,'int');
        if($grade_id > 0 ){ //会员等级查询
            $where['grade_id'] = $grade_id;
        }
        //分组查询
        $groupId = I('groupId',0,'int');
        if($groupId){ 
            $uidArr = D('User/UserGroup')->getUidByGid($groupId);
            $where['User.uid'] = ['in',$uidArr];
        }
        // $user = $this->lists($user_model,$where,'add_time desc');
        $user = $user_model->where($where)->order('add_time desc')->select();
        $this->formateUserlist($user);
        $user_m=D('User/User');
        $user_m->exportExcel($user);
    }

    function userDetail($uid){
    	if(I('from') == 'user_blacklist'){
    		$this->curent_menu = 'User/user_blacklist';
    	}
    	$this->title = '会员资料详情';
    	/* $viewTable = array(
    			'User','UserProfile','UserAddress'
    	);
    	$viewField = [
    			'User' =>'*',
    			'UserProfile'=>'user_birthday,user_interest,user_marital_status,user_monthly_profit,user_study_level,user_trade,user_ID,user_birthday',
    			'UserAddress' =>'user_provice,user_city,user_county,user_town,user_localtion,user_detail_address,type,user_provice'
    	];
    	$user_model = D('User/User')->userView($viewTable,$viewField);
    	$info = $user_model->where(['uid' => $uid])->find();
    	$user[0] = $info;
    	$this->formateUserlist($user);
    	$this->info = $user[0];
    	$this->info_trade = M('UserAnalysis')->where(['uid' => $uid])->find();
    	
    	$where = ['uid' => $uid];
    	$this->qqInfo = M('user_connect')->where(array_merge($where,['type' => 'qq']))->find();
    	$this->wechatInfo = M('user_connect')->where(array_merge($where,['type' => 'wechat']))->find(); */
    	$where = ['uid' => $uid];
    	$this->qqInfo = M('user_connect')->where(array_merge($where,['type' => 'qq']))->find();
    	$this->wechatInfo = M('user_connect')->where(array_merge($where,['type' => 'wechat']))->find(); 
    	
    	$this->userStatistics($uid);//统计信息

        $orderAll = M('order') -> where(['uid'=>$uid]) -> order('add_time desc') -> select();
        $corAll   = M('Crowdfunding_order') -> where(['cor_uid'=>$uid]) -> order('cor_add_time desc') -> select();

        $orderAmount = 0;
        $successCount = 0;
        $successAmount = 0;
        $refundAmount = 0;
        $noCount = 0;
        $noAmount = 0;
        $orderFirstTime=0;
        $orderLastTime=0;
        $order_ids = array();
        if(!empty($orderAll)){
            foreach($orderAll as $k=>$v){
                if(!in_array($v['order_id'],$order_ids)){
                    $order_ids[]=$v['order_id'];
                }

                $orderAmount+=$v['order_amount'];
                if($v['pay_status']==2){
                    $successCount+=1;
                    $successAmount+=$v['order_amount'];
                }elseif($v['pay_status']==0){
                    $noCount+=1;
                    $noAmount+=$v['order_amount'];
                }
            }
            $orderFirstTime=$orderAll[count($orderAll)-1]['add_time'];
            $orderLastTime=$orderAll[0]['add_time'];
        }

        $refundOrder = M('Refund')->where(array('order_id'=>array('IN',$order_ids)))->select();
        $order_ids = array();
        foreach($refundOrder as $key => $val){
            $refundAmount+=$val['refund_money'];
            if(!in_array($val['order_id'],$order_ids)){
                $order_ids[]=$val['order_id'];
            }
        }

        $corCount = 0;
        $corAmount = 0;
        $corsCount = 0;
        $corsAmount = 0;
        $corrCount = 0;
        $corrAmount = 0;
        $cornCount = 0;
        $cornAmount = 0;
        $corFirstTime = 0;
        $corLastTime = 0;
        
        if(!empty($corAll)){
            foreach($corAll as $k=>$v){
                $corAmount+=$v['cor_should_pay'];
                if($v['cor_pay_status']==2 && intval($v['cor_should_pay'])!=0){
                    $corsCount+=1;
                    $corsAmount+=$v['cor_should_pay'];
                }elseif($v['cor_pay_status']==4){
                    $corrCount+=1;
                    $corrAmount+=$v['cor_should_pay'];
                }elseif($v['cor_pay_status']==0){
                    $cornCount+=1;
                    $cornAmount+=$v['cor_should_pay'];
                }

                if(intval($v['cor_should_pay'])!=0){
                    $corCount+=1;
                }
            }
            $corFirstTime=$corAll[count($corAll)-1]['cor_add_time'];
            $corLastTime=$corAll[0]['cor_add_time'];
        }

        $data['all_order'] = count($orderAll)+$corCount;
        $data['order_all_amount'] = $orderAmount+$corAmount;
        $data['order_success'] = $corsCount+$successCount;
        $data['order_success_money'] = $successAmount+$corsAmount;
        $data['order_refund'] = count($order_ids)+$corrCount;
        $data['order_refund_amount'] = $refundAmount+$corrAmount;
        $data['order_nopay'] = $noCount+$cornCount;
        $data['order_nopay_amount'] = $noAmount+$cornAmount;
        if($corFirstTime!=0){
            $data['first_time'] = $corFirstTime>$orderFirstTime?$orderFirstTime:$corFirstTime;
        }else{
            $data['first_time'] = $orderFirstTime;
        }
        if($corLastTime!=0){
            $data['last_time'] = $corLastTime>$orderLastTime?$corLastTime:$orderLastTime;
        }else{
            $data['last_time'] = $orderLastTime;
        }

        unset($orderAmount,$successCount,$successAmount,$refundCount,$refundAmount,$noCount,$noAmount,$orderFirstTime,$orderLastTime,$orderAll,$corAll);
        unset($corAmount,$corsCount,$corsAmount,$corrCount,$corrAmount,$cornCount,$cornAmount,$corFirstTime,$corLastTime);
		
        $all_goods = M('order') -> field('goods_id') -> join('__ORDER_GOODS__ ON __ORDER__.order_id = __ORDER_GOODS__.order_id') -> where(array('uid'=>$uid,'pay_status'=>2)) -> select();
        $cor_all_goods = M('Crowdfunding_order') -> field('fk_cg_id,cor_should_pay') -> join('__CROWDFUNDING_ORDER_GOODS__ ON __CROWDFUNDING_ORDER__.cor_order_id = __CROWDFUNDING_ORDER_GOODS__.fk_cor_order_id') -> where(array('cor_uid'=>$uid,'cor_pay_status'=>2)) -> select();
        $allGoods = array();
        $corAllGoods = array();
        foreach($all_goods as $key => $v){
            if(!in_array($v['goods_id'],$allGoods)){
                $allGoods[]=$v['goods_id'];
            }
        }
        foreach($cor_all_goods as $key => $v){
            if(!in_array($v['fk_cg_id'],$corAllGoods)){
                $corAllGoods[]=$v['fk_cg_id'];
            }
        }
        $data['all_goods'] = count($all_goods)+count($cor_all_goods);
        $data['unique_goods'] = count($allGoods)+count($corAllGoods);
        unset($all_goods,$cor_all_goods,$allGoods,$corAllGoods);

		$creditss = M('account_credits') -> where(array('uid'=>$uid,'type'=>1)) -> getField('credits');
		$user_info = M('user_analysis') -> where(array('uid'=>$uid)) ->find();
		$grade_id = M('user') -> where(array('uid'=>$uid))-> field('grade_id') -> find();
		$arr = array_merge($data,$user_info,$grade_id);
		$arr['creditss'] = $creditss;
        // dump($arr);die;
		unset($grade_id,$user_info,$data,$order_fail_money,$creditss);

        $this -> assign("userStatistics",$arr);

    	//会员资料
    	$this->edit($uid);
    	$this->display();
    }

    public function arrSort($array,$key,$asc = true){
        $result = array();

        // 整理出准备排序的数组
        foreach($array as $k => &$v){
            $values[$k] = isset($v[$key]) ? $v[$key] : '';
        }
        unset($v);

        // 对需要排序键值进行排序
        $asc?asort($values) : arsort($values);

        // 重新排列原有数组
        foreach($values as $k => $v){
            $result[$k] = $array[$k];
        }

        return $result;
    }


    //推荐会员列表
    function getRecommendList(){
    	$uid = I('uid','','trim');
    	if(!$uid){
    		$this->ajaxReturn($this->result->error('传参有误')->toArray());
    	}
    	$_GET['p'] = I('page');
    	$sql = "SELECT u.username,ur.* FROM `jt_user_recommend` ur left join jt_user u on 
u.uid = ur.uid where ur.recommend = '{$uid}'";
    	$total = count(M()->query($sql));
    	$page = $this->page($total);
    	$sql .= "  limit ".$page->firstRow . ',' . $page->listRows;
    	$list = M()->query($sql);
    	foreach ($list as &$v){
    		$v['add_time'] = date('Y-m-d H:i',$v['add_time']);
    	}
    	$this->ajaxReturn($this->result->content(['items' => $list,'count' => $total])->success()->toArray());
    }
    //充值明细
    function getRechargeLog(){
    	$this->getAccountLog(['neq',1]);
    }
    //积分日志
    function getAccountLog($type = 1){
    	$uid = I('uid','','trim');
    	if(!$uid){
    		$this->ajaxReturn($this->result->error('传参有误')->toArray());
    	}
    	$_GET['p'] = I('page');
    	$d = M('accountLog');
    	$where['uid'] = $uid;
    	$where['credits_type'] = $type;
    	$total = $d->where($where)->count();
    	$page = $this->page($total);
    	$list = $d->where(['uid' => $uid])->limit($page->firstRow . ',' . $page->listRows)->select();
    	foreach ($list as &$v){
    		$v['add_time'] = date('Y-m-d H:i',$v['add_time']);
    		$v['order'] = str_replace('支付订单', '', $v['remark']);
    	}
    	$this->ajaxReturn($this->result->content(['items' => $list,'count' => $total])->success()->toArray());
    }
    //收货地址
    function getShippingAddressList(){
    	$uid = I('uid','','trim');
    	if(!$uid){
    		$this->ajaxReturn($this->result->error('传参有误')->toArray());
    	}
    	$_GET['p'] = I('page');
    	$d = D('Home/ShippingAddress');
    	$total = $d->where(['uid' => $uid])->count(); 
    	$page = $this->page($total);
    	$list = $d->where(['uid' => $uid])->limit($page->firstRow . ',' . $page->listRows)->select();
    	$this->ajaxReturn($this->result->content(['items' => $list,'count' => $total])->success()->toArray());
    }
    //历史订单
    function historyorderlist(){
    	$uid = I('uid','','trim');
    	if(!$uid){
    		$this->ajaxReturn($this->result->error('传参有误')->toArray());
    	}
    	$d = D('Admin/Order');
    	$total = $d->where(['uid' => $uid])->count();
    	$_GET['p'] = I('page');
    	$page = $this->page($total);
    	$list = $d->where(['uid' => $uid])->limit($page->firstRow . ',' . $page->listRows)->select();
    	foreach ($list as &$v){
    		$v['status'] = $d->order_status['status'][$v['status']];
    		$v['shipping_status'] = $d->order_status['shipping_status'][$v['shipping_status']];
    		$v['pay_status'] = $d->order_status['pay_status'][$v['pay_status']];
    		$v['add_time'] = date('Y-m-d H:i',$v['add_time']); 
    	}
    	$this->ajaxReturn($this->result->content(['items' => $list,'count' => $total])->success()->toArray());
    }
    //买过的商品
     function buyGoods($uid){
     	$uid = I('uid','','trim');
     	if(!$uid){
     		$this->ajaxReturn($this->result->error('传参有误')->toArray());
     	}
     	$_GET['p'] = I('page');
    	$viewfields = [
    			'order' => [
    				'_as' => 'og',
    				'_type' =>'left'	
    			],
    			'order_goods' =>[
    					'number',
    					'goods_price',
    					'_as' => 'ogs',
    					'_type' =>'left',
    					'_on' => 'og.order_id = ogs.order_id'
    			],
    			'goods' =>[
    					'attribute_id',
    					'name',
    					'_as' => 'g',
    					'_on' => 'g.goods_id = ogs.goods_id'
    			]
    	];
    	$where['og.uid'] = $uid;
    	$where['_string'] = 'pay_status = 2';

       /* $viewCor = [
                'crowdfunding_order' => [
                    '_as' => 'co',
                    '_type' =>'left'    
                ],
                'crowdfunding_order_goods' =>[
                        'cog_count',
                        'cog_goods_price',
                        '_as' => 'cog',
                        '_type' =>'left',
                        '_on' => 'co.cor_order_id = cog.fk_cor_order_id'
                ],
                'crowdfunding_goods' =>[
                        'cg_id',
                        'cg_goods_name',
                        '_as' => 'cg',
                        '_on' => 'cg.cg_id = cog.fk_cg_id'
                ]
        ];
        $where2['co.uid'] = $uid;
        $where2['_string'] = 'cor_pay_status = 2';*/


        $buyGoods = D('Admin/Goods')->dynamicView($viewfields);
    	// $buyCorGoods = D('Admin/Goods')->dynamicView($viewCor);
		
        $total = $buyGoods->where($where)->count();
    	// $corTotal = $buyCorGoods->where($where2)->count();
		//var_dump($buyGoods -> getlastsql());
		//die;
    	$page = $this->page($total);
    	$buyGoods = $buyGoods->where($where)->order(['og.add_time' => 'DESC'])->limit($page->firstRow . ',' . $page->listRows)->select();

    	$d = D('Upload/AttachMent');
    	foreach ($buyGoods as &$v){
    		$v['src'] = $d->getAttach(json_decode($v['attribute_id'],true)["default"])[0]['path'];
    		$v['src'] = fullPath($v['src']);
    		$v['total'] = $v['number'] * $v['goods_price'];
    	}

    	$this->ajaxReturn($this->result->content(['items' => $buyGoods,'count' => $total])->success()->toArray());
    }

    //购买过的众筹商品
    public function getCrowdGoods(){
        $uid = I('uid','','trim');
        if(!$uid){
            $this->ajaxReturn($this->result->error('传参有误')->toArray());
        }
        $_GET['p'] = I('page');

        $viewCor = [
                'crowdfunding_order' => [
                    '_as' => 'co',
                    '_type' =>'left'    
                ],
                'crowdfunding_order_goods' =>[
                    'cog_count',
                    'cog_goods_price',
                    '_as' => 'cog',
                    '_type' =>'left',
                    '_on' => 'co.cor_order_id = cog.fk_cor_order_id'
                ],
                'crowdfunding_goods' =>[
                    'cg_id',
                    'cg_goods_name',
                    '_as' => 'cg',
                    '_type' =>'left',
                    '_on' => 'cg.cg_id = cog.fk_cg_id'
                ],
                'attachment' =>[
                    'path',
                    'name',
                    'ext',
                    '_as' => 'at',
                    '_on' => 'cg.cg_att_id = at.att_id'
                ]
        ];
        $where['co.cor_uid'] = $uid;
        $where['_string'] = 'cor_pay_status = 2';

        $buyCorGoods = D('Admin/Goods')->dynamicView($viewCor);

        $total = $buyCorGoods->where($where)->count();
        $page = $this->page($total);

        $goodsList = $buyCorGoods->where($where)->order(['co.cor_add_time' => 'DESC'])->limit($page->firstRow . ',' . $page->listRows)->select();
        foreach($goodsList as $k=>$v){
            $goodsList[$k]['pic']=rtrim($v['path'],'/').'/'.$v['name'].'.'.$v['ext'];
            $goodsList[$k]['total']=$v['cog_count']*$v['cog_goods_price'];
        }

        $this->ajaxReturn($this->result->content(['item' => $goodsList,'count' => $total])->success()->toArray());
    }

    private function userStatistics($uid){
    	$sql = "SELECT ug.grade_name,ac.credits,ua.* FROM `__PREFIX__user` u
				LEFT JOIN __PREFIX__user_analysis  ua 
				on ua.uid = u.uid  
				left JOIN __PREFIX__user_grade ug
				on u.grade_id = ug.gid
				left join __PREFIX__account_credits ac
				on u.uid = ac.uid and ac.type = 1 and u.uid = '{$uid}' limit 1";
        $this->userStatistics = M()->query($sql)[0];
    }
    function formateUserlist(&$user){
    	if(!$user){
    		return;
    	}
    	$provice = M('position_provice');
    	$city = M('position_city');
    	$county = M('position_county');
    	$town = M('position_town');
    	$user_analysis = M('user_analysis');
        $source = D('Common/Shared')->getSource();
        $gradeDodel = D('User/UserGrade');
        $user_analysis_model = M('user_analysis');
        $creditsModel = D('User/Credits');
        // return;
    	foreach ($user as $k => &$v){
    		$this->addField($v, $gradeDodel,$user_analysis_model,$creditsModel);
    		$v['loaction'] = '';
    		$v['loaction'] = $v['user_provice'] ? $provice->getFieldByProvice_id($v['user_provice'].'&nbsp;&nbsp;&nbsp;','provice_name') : ''; 
    		$v['loaction'] .= ($v['user_city'] ? $city->getFieldByCity_id($v['user_city'],'city_name') : '').'&nbsp;&nbsp;&nbsp;'; 
    		$v['loaction'] .= ($v['user_county'] ? $county->getFieldByCounty_id($v['user_county'],'county_name') : '').'&nbsp;&nbsp;&nbsp;'; 
    		$v['loaction'] .= ($v['user_town'] ? $town->getFieldByTown_id($v['user_town'],'town_name') : '').'&nbsp;&nbsp;&nbsp;'; 
    		$v['consume_money'] = $user_analysis->getFieldByUid($v['uid'],'consume_money');
            //来源
            $v['come_from'] = $source[$v['come_from']];
    	}
    }
    //计算总交易额和对应的次数
    private function addField(&$oneRecord,$gradeDodel,$user_analysis_model,$creditsModel){
    	$analysisInfo = $user_analysis_model->where(['uid' => $oneRecord['uid']])->find();
    	// $oneRecord['gradeName'] = $gradeDodel->getById($oneRecord['grade_id'],'grade_name')['grade_name'];
    	$oneRecord['dealTotalCount'] = !$analysisInfo ? 0 : $analysisInfo['pay_count'].'/'.($analysisInfo['order_count'] - $analysisInfo['order_close_count']);
    	$oneRecord['last_buy_time'] = $analysisInfo['last_buy_time'] ? date('Y-m-d H:i',$analysisInfo['last_buy_time']) : '_';
    	$oneRecord['integral'] = $creditsModel->getCredits($oneRecord['uid'],1);
    	$oneRecord['account'] = array_sum($creditsModel->getCredits($oneRecord['uid']));
    }
    /**
     * 会员资料编辑
     */
    public function edit($input = '' ){
        $data =D('Member') -> getMember() ->formatData(['member_id','member_name']);
        $this -> assign('data',$data);
    	if(!$input){
    		$uid = I('request.uid','','trim');
    	}else{
    		$uid = $input;
    	}
        $user_model = D('User/User','Service');
        $user = [];
        if(!empty($uid)) {
            $user = $user_model->field(true)->find($uid);
        }
        $blackModel = M('user_blacklist');
       	$user['isBlack'] = ($blackModel->where(['ub_uid' => $uid])->count()) ? 1 : 0;
       $this->address = M('user_address')->where(['uid' => $uid,'type' => 1])->find();
        $this->assign('info',$user);
        if(!$input){
	        $this->display();
        }
    }

    /**
     * 更新
     */
    public function update(){
        $id = I('request.uid');
        $vipNumber = M('user') -> where(['uid'=> $id])->field('family_number,one_number')->find();
        $admin_model = D('User/User','Service');
        $family_number = I('request.family_number','');
        $one_number = I('request.one_number','');
        $data = [
            'mobile' => I('request.mobile'),
            'member_id' => I('request.member_id'),
            'status'=>1,
        ];
     
        $member = D('Member');
        if($family_number!=$vipNumber['family_number']){
            if($family_number){
                if($member -> numberUniqID($id,$family_number,2)){
                    $this->ajaxReturn($this->result->setMsg('卡号已存在，或格式错误')->toArray());
                }else{
                    $data['family_number'] = $family_number;
                    M('member_id') -> where(['num' => $family_number,'type' => 2]) ->save(['del_time' => time()]);
                }
            }else{
                $data['family_number'] = '';
            }
        }

        if($one_number!=$vipNumber['one_number']){
            if($one_number){
                if($member -> numberUniqID($id,$one_number)){
                    $this->ajaxReturn($this->result->setMsg('卡号已存在，或格式错误')->toArray());
                }else{
                    $data['one_number'] = $one_number;
                    M('member_id') -> where(['num' => $one_number,'type' => 1]) ->save(['del_time' => time()]);
                }
            }else{

                $data['one_number'] = '';
            }
        }
        if(!empty($id)) {
            $where = [
                'uid' => $id
            ];
            $data['uid']=$id;
            unset($data['mobile']);
            $result = $admin_model->setData($where,$data);
        }else{
            $data['aliasname'] = A('Api/User')->get_nick();
        	$data['pass'] =  I('request.pass');
            $result = D('User/User')->addData($data,true);
            $token = D('User/Token')->device()->setMore($result->getResult());
        }
        if(!$result->isSuccess()){
	        $this->ajaxReturn($result->toArray());
        }

        //卡号回收
      /*  if($family_number !=$vipNumber['family_number']){
            M('member_id') -> where(['num' => $vipNumber['family_number'],'type' => 2]) ->save(['del_time' => 0]);
        }
        if($one_number != $vipNumber['one_number']){
            M('member_id') -> where(['num' => $vipNumber['one_number'],'type' => 1]) ->save(['del_time' => 0]);
        }*/
       
        $this->ajaxReturn($this->result->success()->toArray());
    }

    /**
     * 删除
     */
    public function del(){
        $id = I('request.uid');
        $admin_model = D('User/User','Service');
        $id = (array)$id;
        $where = [
            'uid' => ['in',$id]
        ];
        $idStr = "'".implode("','", $id)."'";
        $result = $admin_model->tombstoneData($where);
        //删除分组个数
        $sql = "
				SELECT
					group_id,
					count(group_id) as count
				FROM
					__TABLE__
				WHERE
					uid in (".$idStr.")
				GROUP BY
					group_id;
        		";
        $list = M('user_group_x')->query($sql);
        $m = M('user_group');
        foreach ($list as $v){
        	M('user_group')->execute("UPDATE __TABLE__ SET `count` = count - {$v['count']}  WHERE `id` = ".$v['group_id']);
        }
        //删除已失效的uid
        M('user_group_x')->where($where)->delete();
        $this->ajaxReturn($result->toArray());
    }
    //用户意见反馈
	public  function suggest_manage(){
		$this->title = '用户反馈';
		$this->curent_menu = 'User/suggest_manage';
		$where = [];
		$mix_keywords = I('mix_keywords','','trim');
		if($mix_keywords){
			$where['su_id|su_email'] = ['like','%'.$mix_keywords.'%'];
			$this->mix_keywords = $mix_keywords;
		}
		$search = [];
		if(($start_time = I('start_time','','trim')) && ($end_time = I('end_time','','trim'))){
			$search['start_time'] = $start_time;
			$search['end_time'] = $end_time;
			$start_time = strtotime($start_time);
			$end_time = strtotime($end_time);
			$where['su_add_time'] = ['between',[$start_time,$end_time]];
		}
		if($type = I('su_type','','trim')){
			$quer = [];
			foreach ($type as $v){
				$quer[] = "FIND_IN_SET($v,su_type)";
			}
			$where['_string'] = implode('  and  ', $quer);
			$search['su_type'] = $type;
		}
		$this->search = $search;
		$model = M('suggestion');
		$this->lists = $this->lists($model,$where);
		$this->display();
	}

    /**
     * 导出问卷
     */
    public function questionnaire_export(){
        D('Home/Quest')->export();
    }
    /**
     * 黑名单列表
     */
    function user_blacklist(){
    	$this->assign('from','user_blacklist');
    	$this->curent_menu = 'User/user_blacklist';
    	$this->index(true);
    }
    //加入黑名单
    function addBlackList(){
    	$uidArr = I('uid','','trim');
    	if(!$uidArr){
    		$this->ajaxReturn($this->result->error('请选择用户!')->toArray());
    	}
    	$m = M('user_blacklist');
    	$m->where(['ub_uid' => ['in',$uidArr]])->delete();
	   	$data = [];
    	foreach ($uidArr as $k){
    		$tmp = [];
    		$tmp['ub_type'] = 1;
    		$tmp['ub_uid'] = $k;
    		$data[] = $tmp;
    	}
    	$m->addAll($data);
		$this->ajaxReturn($this->result->success()->toArray());
    }
    function removeBlackList(){
    	$id = I('request.uid');
    	$user_model = D('User/User','Service');
    	$res = $user_model->removeBlackList($id);
    	$this->ajaxReturn($res->toArray());
    }
    /**
     * 分组操作
     */
    function group_operate(){
    	$this->curent_menu = 'User/GroupOperate';
    	$d = D('User/UserGroup');
    	$where = [];
    	if($id = I ('id',0,'int')){
    		$where['id'] = $id; 
    		$info = $d->where($where)->find();
    		if($info['condition']){
	   			$info = array_merge($info,json_decode($info['condition'],true));
    		}
    		$this->info = $info;
    		$this->goodsClassifyList();
    		$this->goodsChoosedList($info['buyedGoods']);
    	}else{
    		$this->info = [];
    	}
    	$this->lists = $this->lists($d);
    	$this->display();
    }
    /**
     * 选择的商品信息
     * @param str $goods_ids ,分割的商品id字窜
     */
  	private  function goodsChoosedList($goods_ids){
  		if(!$goods_ids){
  			return;
  		}
    	$fields =  [
    			'goods_id',
    			'name', //商品名
    			'old_price',//原价
    			'attribute_id'//原价
    	];
    	$d = D('Admin/Goods');
    	$list = $d->field($fields)->where(['goods_id' => ['in',$goods_ids]])->select();
    	$this->addAttach($list);
    	$this->goodsChoosedList = $list;
    }
    function saveGroup(){
    	$name = I('name','','trim'); //分组名
    	$uidArr = $this->groupUidData(false); //获取用户uid数组
    	$id = I('id',0,'int'); 
		$data['name'] = $name;   	
		$data['count'] = count($uidArr);   	
		$data['condition'] = json_encode($this->conditionArr);   	
		$mGroup = D('User/UserGroup'); 
		if($id){
			$data['id'] = $id;
			$mGroup->save($data);
		}else{
			$mGroup->add($data);
		}
		//更新分组用户信息
		$m = M('user_group_x');
		$m->where(['group_id' => $id])->delete();
		$data = [];
		foreach ($uidArr as $k){
			$data[] = ['uid' => $k,'group_id' => $id];
		}
		$m->addAll($data);
    	$this->ajaxReturn($this->result->success()->toArray());
    }
    //分组uid
    function groupUidData($ifCount = true){
    	$this->allParam = explode(',',I('availableNameStr','','trim'));
    	$this->combineWay = I('combineWay','','trim');
    	$this->conditionArr['combineWay'] = $this->combineWay;
		$viewFields = [ 
				'User' => [ 
						'uid',
						'_as' => 'user',
						'_type' => 'left' 
				],
				'UserProfile' => [ 
						'_as' => 'user_profile',
						'_on' => 'user.uid = user_profile.uid',
						'_type' => 'left' 
				],
				'UserAddress' => [ 
						'_as' => 'user_address',
						'_on' => 'user.uid = user_address.uid',
						'_type' => 'left' 
				],
				'Order' => [ 
						'_as' => 'ord',
						'_on' => 'user.uid = ord.uid',
						'_type' => 'left' 
				],
				'OrderGoods' => [ 
						'_as' => 'order_goods',
						'_on' => 'ord.order_id = order_goods.order_id' 
				] 
		];
    	$d = D('User/User')->dynamicView($viewFields);
    	$where = $this->createWhere();
    	if(!$where){
    		$uidArr = [];
    	}else{
    		$where['user.delete_time'] = 0;
	    	$uidArr = $d->where($where)->distinct(true)->getField('uid',true);
    	}
    	$uidArrOne = $this->getUidArrOne($this->createWhereOne());
    	if($this->combineWay == 'and' && !$uidArr && !$uidArrOne){
	    	$uidArr = array_intersect($uidArr,$uidArrOne);
    	}else{
	    	$uidArr = array_merge($uidArr,$uidArrOne);
    	}
    	if($ifCount){
    		$this->ajaxReturn($this->result->content(count($uidArr))->success()->toArray());
    	}
    	return $uidArr;
    }
    private function createWhere(){
    	if(in_array('sex', $this->allParam) && ($sex = I('sex',0,'int'))){
    		$where['user.sex'] = $sex;
    		$this->conditionArr['sex'] = $sex;
    	}
    	if(in_array('old_end', $this->allParam) && in_array('old_start', $this->allParam) && ($old_start = I('old_start','','trim')) &&  ($old_end = I('old_end','','trim'))){
    		$this->conditionArr['age'] = ['old_start' => $old_start,'old_end' => $old_end];
    		$old_start = strtotime('-'.$old_start.'  years');
    		$old_end = strtotime('-'.$old_end.'  years');//数据不能太大
    		if($old_start > $old_end){
    			$tmp = $old_start;
    			$old_start = $old_end;
    			$old_end = $tmp;
    		}
    		$where['_string'] = "user_profile.user_birthday between {$old_start} and {$old_end}";
    	}
    	if(($user_provice = I('provice_id','','trim')) && in_array('provice_id[]', $this->allParam)){
/*     		
    		$where['user_address.user_provice'] = $user_provice;    
    		$this->conditionArr['area']['provice'] = $user_provice;  
    		
	    	if(($user_city = I('city_id','','trim')) && in_array('city_id[]', $this->allParam)){
	    		$where['user_address.user_city'] = $user_city;
	    		$this->conditionArr['area']['city'] = $user_city;
	    	}
    		
	    	if(($user_county = I('county_id','','trim')) && in_array('county_id[]', $this->allParam)){
	    		$where['user_address.user_county'] = $user_county;
	    		$this->conditionArr['area']['county'] = $user_county;
	    	}
	    	
 */	    $user_city = I('city_id','','trim') ;
    		$user_county = I('county_id','','trim');
    		$count = count($user_provice);
	    	for ($i = 0 ; $i < $count  ; $i++){
	    		$whereTmp = [];
	    		$whereTmp[] = "user_address.user_provice =  $user_provice[$i] "; 
	    		if($user_city[$i]){
	    			$whereTmp[] = "user_address.user_city = $user_city[$i]";
	    			if($user_county[$i]){
	    				$whereTmp[] = "user_address.user_county = $user_county[$i]";
	    			}
	    		}
	    		$where['_string'] = $where['_string'] ? ($where['_string']." ".$this->combineWay." (".implode(' and ', $whereTmp) ).')': '('.implode(' and ', $whereTmp).')'; 
	    		$this->conditionArr['area'][] = ['provice' => $user_provice[$i],'city' => $user_city[$i],'county' => $user_county[$i]];
	    	}
    	}
    	if(in_array('user_birthday_start', $this->allParam) && in_array('user_birthday_end', $this->allParam) && ($user_birthday_start = I('user_birthday_start','','trim')) &&  ($user_birthday_end = I('user_birthday_end','','trim'))){
    		$this->conditionArr['birthday'] = ['user_birthday_start' => $user_birthday_start,'user_birthday_end' => $user_birthday_end];
    		$user_birthday_start = strtotime($user_birthday_start.' 00:00:00');
    		$user_birthday_end = strtotime($user_birthday_end.' 23:59:59');
    		$where['user_profile.user_birthday'] = ['between',[$user_birthday_start,$user_birthday_end]];
    	}
    	//商品id
    	if(in_array('goods_ids', $this->allParam) && $goods_ids = I('goods_ids','','trim')){
    		$this->conditionArr['buyedGoods'] = $goods_ids;
    		$where['order_goods.goods_id'] = ['in',$goods_ids]; 
    	}
    	$where['_logic'] = $this->combineWay;
    	return count($where) > 1 ? ['_complex' => $where] : [];
    }
    private function createWhereOne(){
    	$where = [];
    	//付款总额
    	if(in_array('payAmountStart', $this->allParam) && ($payAmountStart = I('payAmountStart',0,'int')) &&  ($payAmountEnd = I('payAmountEnd',0,'int'))){
    		$this->conditionArr['payAmount'] = ['payAmountStart' => $payAmountStart,'payAmountEnd' => $payAmountEnd];
    		$where['useAna.consume_money'] = ['between',[$payAmountStart,$payAmountEnd]];
    	}
    	//最近付款时间
    	if(in_array('lastPayTimeStart', $this->allParam) && ($lastPayTimeStart = I('lastPayTimeStart','','trim')) && ($lastPayTimeEnd = I('lastPayTimeEnd','','trim'))){
    		$this->conditionArr['lastPayTime'] = ['lastPayTimeStart' => $lastPayTimeStart,'lastPayTimeEnd' => $lastPayTimeEnd];
    		$lastPayTimeStart = strtotime($lastPayTimeStart.' 00:00:00');
    		$lastPayTimeEnd = strtotime($lastPayTimeEnd.' 23:59:59');
    		$where['ord.pay_time'] = ['between',[$lastPayTimeStart,$lastPayTimeEnd]];
    	}
    	//付款距今天数
    	if(in_array('payToNowStart', $this->allParam) && ($payToNowStart = I('payToNowStart','','trim')) && ($payToNowEnd = I('payToNowEnd','','trim'))){
    		$this->conditionArr['payToNow'] = ['payToNowStart' => $payToNowStart,'payToNowEnd' => $payToNowEnd];
    		$payToNowStart = strtotime('-'.$payToNowStart.' days');
    		$payToNowEnd = strtotime('-'.$payToNowEnd.' days');
    		$where['_string'] = "ord.pay_time between {$payToNowStart} and {$payToNowEnd} ";
    	}
    	//付款次数
    	if(in_array('payCountStart', $this->allParam) && ($payCountStart = I('payCountStart',0,'int'))  && ($payCountEnd = I('payCountEnd',0,'int'))){
    		$this->conditionArr['payCount'] = ['payCountStart' => $payCountStart,'payCountEnd' => $payCountEnd];
    		$where['useAna.pay_count'] = ['between',[$payCountStart,$payCountEnd]];
    	}
    	//最后下单时间
    	if(in_array('lastBuyTimeStart', $this->allParam) && ($lastBuyTimeStart = I('lastBuyTimeStart','','trim')) && ($lastBuyTimeEnd = I('lastBuyTimeEnd','','trim'))){
    		$this->conditionArr['lastBuyTime'] = ['lastBuyTimeStart' => $lastBuyTimeStart ,'lastBuyTimeEnd' => $lastBuyTimeEnd];
    		$lastBuyTimeStart = strtotime($lastBuyTimeStart.' 00:00:00');
    		$lastBuyTimeEnd = strtotime($lastBuyTimeEnd.' 23:59:59');
    		$where['useAna.last_buy_time'] = ['between',[$lastBuyTimeStart,$lastBuyTimeEnd]];
    	}
    	//下单距今天数
    	if(in_array('buyToNowStart', $this->allParam) && ($buyToNowStart = I('buyToNowStart','','trim')) && ($buyToNowEnd = I('buyToNowEnd','','trim'))){
    		$this->conditionArr['buyToNow'] = ['buyToNowStart' => $buyToNowStart,'buyToNowEnd' => $buyToNowEnd];
    		$buyToNowStart = strtotime('-'.$buyToNowStart.' days');
    		$buyToNowEnd = strtotime('-'.$buyToNowEnd.' days');
    		if($where['_string']){
	    		$where['_string'] .= $this->combineWay."  ( useAna.last_buy_time between {$buyToNowStart} and {$buyToNowEnd} )";
    		}else{
    			$where['_string'] = "useAna.last_buy_time between {$buyToNowStart} and {$buyToNowEnd} ";
    		}
    	}
    	//下单次数
    	if(in_array('buyCountStart', $this->allParam) && ($buyCountStart = I('buyCountStart',0,'int'))  && ($buyCountEnd = I('buyCountEnd',0,'int'))){
    		$this->conditionArr['buyCount'] = ['buyCountStart' => $buyCountStart,'buyCountEnd' => $buyCountEnd]; 
    		$where['useAna.order_count'] = ['between',[$buyCountStart,$buyCountEnd]];
    	}
    	$where['_logic'] = $this->combineWay;
    	return count($where) > 1 ? ['_complex' => $where] : [];
    }
//     获取满足RFM属性的uid
    private function getUidArrOne($where){
    	if(!$where){
    		return [];
    	}
    	$viewFields = [
    			'Order' => [
    					'_as' => 'ord',
    					'_type' => 'left',
    					'uid'
    			],
    			'UserAnalysis' => [
    					'_as' => 'useAna',
    					'_on' => 'useAna.uid = ord.uid'
    			]
    	];
    	$d = D('User/User')->dynamicView($viewFields);
    	$uidArr = $d->distinct(true)->where($where)->getField('uid',true);
    	return $uidArr ? $uidArr : [];
    }
    function addGroup(){
    	$name = I('group_name');
    	D('User/UserGroup')->add(['name' => $name]);
    	$this->ajaxReturn($this->result->success()->toArray());
    }
    function delGroup(){
    	$group_id = I('id','','int');
    	if(!$group_id){
    		$this->ajaxReturn($this->result->error('请选择分组!')->toArray());
    	}
    	D('User/UserGroup')->delGroup($group_id);
    	$this->ajaxReturn($this->result->success()->toArray());
    }
    function goodsList(){
    	$where = [];
    	if($cat_id = I('cat_id','0','int')){
    		$where['c.cat_id'] = $cat_id;
    	}
    	if($name = I('name','','trim')){
    		$where['g.name'] = ['like','%'.$name.'%'];
    	}
    	$where["g.delete_time"]=0;
    	$where["g.is_goods"]=1;
    	$where['g.is_sale']=1;
    	$viewFields = [
    			'Goods' => [
    					'_as' => 'g',
    					'_type' => 'left',
    					'goods_id',
    					'name', //商品名
    					'old_price',//原价
    					'price',
    					'attribute_id',
    					'cat_id'
    			],
    			'GoodsNormsAttr' => [
    					'_as' => 'gna',
    					'_type' => 'left',
    					'_on' => 'gna.goods_id = g.goods_id',
    					'sum(gna.goods_norms_number)' => 'goods_norms_number'
    			],
    			'Category' => [
    					'_as' => 'c',
    					'_type' => 'left',
    					'_on' => 'c.cat_id = g.cat_id'
    			],
    			'Brand' => [
    					'_as' => 'b',
    					'_on' => 'b.brand_id = g.brand_id',
    					'name' => 'brandName' //品牌名
    			]
    	];
		$d = D('Admin/Goods')->dynamicView($viewFields);
		$_GET['p'] = I('page');
		$total = $d->where($where)->group('goods_id')->select();
		$total = count($total);
		$page = $this->page($total);
		$list = $d->where($where)->group('goods_id')->limit($page->firstRow . ',' . $page->listRows)->select();
		$this->addAttach($list);
		$this->ajaxReturn($this->result->content(['items' => $list,'count' => $total])->success()->toArray());
    }
    private function addAttach(&$list){
    	D("Home/List")->getThumb($list);
    	foreach($list as &$v){
    		$v['src'] = fullPath($v['thumb']);
    	}
    	/* $attachModel = D('Upload/AttachMent');
    	foreach($list as &$v){
    		if($v['attribute_id']){
    			$v['src'] = $attachModel->getAttach(json_decode($v['attribute_id'],true)["default"])[0]['path'];
    			$v['src'] = fullPath($v['src']);
    		}else{
    			$v['src'] = '';
    		}
    		$v['href'] = fullPath(U('detail/index',['id' => $v['goods_id'],'catId' => $v['cat_id']]));
    	} */
    }
    //商品分类
    private function goodsClassifyList(){
    	$this->goodsClassifyList = D('Admin/Category')->field(['cat_id','name'])->select();
    }
    //增加用户至分组
    function addGroupUsers(){
    	$groupId = I('post.groupId','0','int');
    	$uidArr= I('post.uid','','trim');
    	$m = M('user_group_x');
    	$oldUser = $m->where(['group_id' => $groupId,'uid' => ['in',$uidArr]])->distinct(true)->getField('uid',true);
    	if(!$oldUser){
    		$oldUser = [];
    	}
    	$uidArr = array_diff($uidArr, $oldUser);
    	$data = [];
    	foreach ($uidArr as $v){
    		$data[] = ['group_id' => $groupId,'uid' => $v];
    	}
 	    $m->addAll($data);	
 	    //更新人数
 	    $count = $m->where(['group_id' => $groupId])->count();
 	    M('user_group')->where(['id' => $groupId])->save(['count' => $count]);
 	    $this->ajaxReturn($this->result->success()->toArray());
    }
    //从分组里删除用户
    function removeGroupUsers(){
    	$groupId = I('post.groupId','0','int');
    	$uidArr= I('post.uid','','trim');
    	$m = M('user_group_x');
    	$m->where(['group_id' => $groupId,'uid' => ['in',$uidArr]])->delete();//删除用户
 	    //更新人数
 	    $count = $m->where(['group_id' => $groupId])->count();
 	    M('user_group')->where(['id' => $groupId])->save(['count' => $count]);
 	    $this->ajaxReturn($this->result->success()->toArray());
    }
    function remakInside(){
    	$type = I('type',0,'int');
    	$uid = I('uid');
    	$m = D('User/User');
    	$where = ['uid' => ['in',$uid]];
    	if($type == 1){
    		$res = $m->setData($where,['is_inside_user' => 1]);
    	}elseif($type == -1){
    		$res = $m->setData($where,['is_inside_user' => 0]);
    	}
    	$this->ajaxReturn($res->toArray());
    }

    /*
     * 手机号是否存在
     */
    public function isMobile(){
        $re = D('User/User') -> ifUniqueMobile(I('mobile',0,''));
        if($re){
            $this -> ajaxReturn(['msg' =>2]);
        }else{
            $this -> ajaxReturn(['msg' =>1]);
        }
    }

    /*
     * 通过用户ID获取用户信息
     */
    public function getInfo(){
        $uid = I('post.id');
        if(empty($uid)){
            $this ->ajaxReturn($this->error());
        }
        $this ->ajaxReturn(D('User/user')->getInfo($uid));
    }


	/**
	 * 解除微信绑定
	 * @param string openid 微信openid
	 */
	 public function unBindWechat()
	 {
		 $openId = I('openid', '', 'trim'); // 微信oprnid
		 if ( empty($openId) ) {
			 $this->ajaxReturn($this->result->error('openId不能为空！', 'OPENID_REQUIRE')->toArray());
		 }
		 $userConnet = M('UserConnect');
		 $userConnet->startTrans(); // 开启事务
		 $ucResult = $userConnet->where(['openid' => $openId])->delete();
		 $unResult = M('UserUnion')->where(['openid' => $openId])->delete();
		 if ( $ucResult !== false && $unResult !== false ) {
			 $userConnet->commit(); // 提交
			 $this->ajaxReturn($this->result->success('微信解绑成功！', 'SUCCESS')->toArray());
		 } else {
			 $userConnet->rollback(); // 回滚
			 $this->ajaxReturn($this->result->error('微信解绑失败！', 'ERROR')->toArray());
		 }
	 }


}