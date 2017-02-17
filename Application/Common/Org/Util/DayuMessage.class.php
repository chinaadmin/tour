<?php
/**
 * 手机短信类
 * @author qrong 
 * @date 2016/6/28
 */
namespace Common\Org\Util;
class DayuMessage {
	private $appkey;
	private $secret;

	public function __construct(){
		// $this->appkey = "23386674";
		// $this->secret = "0fb646689023bfaea821f30b2aed34d1";

		$this->appkey = "23387256";
		$this->secret = "ab3b050cab238c393c3e32f53c119ff8";
	}

	/**
	 * 通过用户电话发送短信
	 * @param array|str $mobile 电话号 ,分隔的字窜或者数组
	 * @param 短信模板变量 $arr
	 * @param 短信模板代码 $msgCode
	 */
	public function sendMsgByTel($mobile,$arr,$msgCode="SMS_10675646") {
		//获取手机号
		if(is_array($mobile)){
			$mobile = implode(',', $mobile);
		}

		if(is_array($arr)){
			$arr = json_encode($arr,true);
		}
		
		//引入dayu类库
		import('Org.Taobao.top.TopClient');
        import('Org.Taobao.top.ResultSet');
        import('Org.Taobao.top.RequestCheckUtil');
        import('Org.Taobao.top.TopLogger');
        import('Org.Taobao.top.request.AlibabaAliqinFcSmsNumSendRequest');

        //将需要的类引入，并且将文件名改为原文件名.class.php的形式
        $c = new \TopClient;
        $c->appkey = $this->appkey;
        $c->secretKey = $this->secret;
        $req = new \AlibabaAliqinFcSmsNumSendRequest;

        $req->setSmsType("normal");				//短信类型
        
        //进入阿里大鱼的管理中心找到短信签名管理，输入已存在签名的名称，这里是身份验证。
        $req->setSmsFreeSignName("吉途旅游");

        //这里设定的是发送的短信内容：验证码${code}，您正在进行${product}身份验证，打死不要告诉别人哦！”
        // $req->setSmsParam("{'code':'666666','product':'测试网站'}");
        // $req->setSmsParam('{"code":"666666","product":"测试网站"}');

        $req->setSmsParam($arr);				//短信模板变量
        $req->setRecNum($mobile);				//用户的手机号码
        $req->setSmsTemplateCode($msgCode);		//短信模板
        $send = $c->execute($req);				//发送短信
        $result = $send->result;
        
        return $result;
	}	
}