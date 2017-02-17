define(function(require , exports ,module){
	var $ = require('jquery');
	var common = require('common');
	
	require('jquery_validate');
    var tool = require('model/tool');

   	/**
   	 * 添加管理员验证
   	 */
    $('#changePageSize').bind('keypress',function(event){               
        if(event.keyCode == "13")    
        {
            $('.form-search pull-right').submit();
        }
     });
	var add_validate = function(){
		$('#user_edit').validate($.extend({
            rules: {
                username: {
                    required: true
                },
                nickname: {
                	required: true
                },
                password:{
                    required: true
                },
//                email:{
//                    required: true,
//                    email: true
//                },
                mobile:{
                	required: true,
                	//mobile: true
                },
                role_id:{
                	required: true
                }
            },
            messages: {
                username: {
                    required: "用户名不能空"
                },
                nickname: {
                	required: "真实姓名不能空"
                },
                password:{
                    required: "密码不能空"
                },
//                email:{
//                    required: "email不能为空",
//                    email: "请输入正确的email地址"
//                },
                mobile:{
                	required: '手机不能为空',
                	//mobile: '手机格式不正确'
                },
                role_id:{
                	required: '角色不能为空'
                }
            }
        },tool.validate_setting));
	};

    /**
     * 修改管理员验证
     */
    var edit_validate = function(){
    	$('#user_edit').validate($.extend({
            rules: {
                username: {
                    required: true
                },
                nickname: {
                	required: true
                },
                email:{
                    required: true,
                    email: true
                },
                mobile:{
                	required: true,
                	mobile: true
                },
                role_id:{
                	required: true
                }
            },
            messages: {
                username: {
                    required: "用户名不能空"
                },
                nickname: {
                	required: "真实姓名不能空"
                },
                email:{
                    required: "email不能为空",
                    email: "请输入正确的email地址"
                },
                mobile:{
                	required: '手机不能为空',
                	mobile: '手机格式不正确'
                },
                role_id:{
                	required: '角色不能为空'
                }
            }
        },tool.validate_setting));
    };

	var main ={
		index : function(){
			var uid;
			tool.del($('.js-del'));
			
			$('a').click(function(){
				uid = $(this).text();
			})
			$('.uppass').click(function(){
				$('.prompt').text("");
				$("input[name='opwd']").val("");
				$("input[name='pwd']").val("");
				$("input[name='pwds']").val("");
				uid = $(this).attr('data');
				$('#up_pass').show();
				if(uid != 1){

					$('.opass').hide();
				}else{
					$('.opass').show();
				}
			});
			
			$('.cancel').click(function(){
				$('#up_pass').hide();
			});
			
			$("button[type='submit']").click(function(){
				var opwd = $("input[name='opwd']").val();
				var pwd = $("input[name='pwd']").val();
				var pwds = $("input[name='pwds']").val();
				
                tool.doAjax({
                    url:common.U('Admin/up_pass'),
                    data:{"uid":uid,"opwd":opwd,"pwd":pwd,"pwds":pwds}
                },function(result){
                    require.async('base/jtDialog',function(jtDialog){
                        if(data.status != tool.success_code){
                            $('#up_pass').hide();
                            jtDialog.showTip(result.msg);
                        }else{
                            jtDialog.showTip('操作成功！',2,function(){
                                $('#up_pass').hide();
                                location.reload();
                            });
                        }
                    });
                });
				
				/*$.ajax({
					type:'POST',
					url:'up_pass',
					data:{uid:uid,opwd:opwd,pwd:pwd,pwds:pwds},
					dataType: "json",
					success:function(data){
						if(data.status == 'success'){
							$('.prompt').text(data.msg);
							$('#up_pass').hide();
						}else{
							$('.prompt').text(data.msg);
						}
					}
				})*/
			});
		},
        add : function(){
            add_validate();
        },
        edit : function(){
            edit_validate();
		}
	};
	module.exports = main;
});