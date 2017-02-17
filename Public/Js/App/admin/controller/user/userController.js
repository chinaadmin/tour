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
                    required: true,
                    rangelength:[5,30]
                },
                pass:{
                    required: true,
                    minlength:5
                },
                email:{
                    email: true
                },
                mobile:{
                	mobile: true
                }
            },
            messages: {
                username: {
                    required: "用户名不能空"
                },
                pass:{
                    required: "密码不能空",
                    minlength:"密码最少 {0} 位数"
                },
                email:{
                    email: "请输入正确的email地址"
                },
                mobile:{
                	mobile: "请输入正确的手机号"
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
                /*username: {
                    required: true,
                    rangelength:[5,30]
                },*/
                pass:{
                    minlength:5
                },
               /* email:{
                    email: true
                },*/
                mobile:{
                	mobile: true
                }
            },
            messages: {
               /* username: {
                    required: "用户名不能空"
                },*/
                pass:{
                    minlength:"密码最少 {0} 位数"
                },
               /* email:{
                    email: "请输入正确的email地址"
                },*/
                mobile:{
                	mobile: "请输入正确的手机号"
                }
            }
        },tool.validate_setting));
    };
    suggestManage = function(){
    	common.date();
    }
    function addBlackList(){
    	postData = $('.user_check').serializeArray();
    	$.post(common.U('addBlackList'),postData,function(data){
    		require.async('base/jtDialog',function(jtDialog){
    			if(data.status != tool.success_code){
					jtDialog.showTip(data.msg);
				}else{
					 jtDialog.showTip(data.msg, 2, function () {
                        location.reload();
                     });
				}
    		});
    	});
    }
    //向某一组添加用户 或 删除用户
    function operateGroup(){
    	//向某一组添加用户 start
    	$('#addGroup').click(function(){
    		require.async('base/jtDialog',function(jtDialog){
	    		var data = $('#list').serializeArray();
	    		if($.isEmptyObject(data)){
	    			jtDialog.showTip('请选择用户');
	    			return false;
	    		}
	    		$('#help-tip').hide();
				$('#chooseGroup').modal('show');
    		})		
		});
		$('.choose_group_confirm').click(function(){
			var data = $('#list').serializeArray(),groupNameListObj = $('[name=groupNameList]'); //用户
			//某一会员组
			var groupId = $('[name=groupNameList]').val();
			if(groupId == ''){ //为空
				$('#help-tip').show();
				return;
			}
			data.push({name:'groupId',value:groupId});
			$.post(common.U('addGroupUsers'),data,function(data){
			    require.async('base/jtDialog',function(jtDialog) {
	                if (data.status !== tool.success_code) {
	                     jtDialog.error(data.msg);
	                } else {
	                	 jtDialog.showTip(data.msg,1,function(){
                             location.reload();
                         });
	                }
	            });
			});
    	});
    	//向某一组添加用户 end
		
    	//向某一组删除用户 start
		$('#removeUser').click(function(){
				require.async('base/jtDialog',function(jtDialog){
		    		var data = $('#list').serializeArray();
		    		if($.isEmptyObject(data)){
		    			jtDialog.showTip('请选择用户');
		    			return false;
		    		}
		    		var groupId = $('[name=groupId]').val();
		    		data.push({name:'groupId',value:groupId});
					$.post(common.U('removeGroupUsers'),data,function(data){
					    require.async('base/jtDialog',function(jtDialog) {
			                if (data.status !== tool.success_code) {
			                     jtDialog.error(data.msg);
			                } else {
			                	 jtDialog.showTip(data.msg,1,function(){
		                             location.reload();
		                         });
			                }
			            });
					});
	    		})
		});
    }
    function detailEvent(){
    	$('.detail').each(function(index){
    		var _self = $(this);
    		_self.mouseenter(function(){
    			_self.find('div').show();
    		}).mouseleave(function(){
    			_self.find('div').hide();
    		});
    	});
    }

	//过期时间
	function put_in_time(){
		require.async("pulgins/bootstrap/datepicker/bootstrap-datepicker",function(){
			$('.start_time').datepicker({
				autoclose:true
			}).on('changeDate',function(ev){
				if(ev.date.valueOf() > new Date($('#end_time').val()).getTime()){
					$('#end_time').val('');
				}
				$('.end_time').datepicker('setStartDate', new Date(ev.date));
			});
			$('.end_time').datepicker({
				autoclose:true,
				startDate:$('#start_time').val()
			});
		});
	}
	var main ={
		index : function(){
			put_in_time();
			tool.del($('.js-del'));
			
			common.date({startSelector:'[name="start_time"]',endSelector:'[name="end_time"]'});
			var exportExcelObj = $('[name = "exportExcel"]');
			$('.search').click(function(){
				exportExcelObj.val(0);
			});
			$('.export').click(function(){
				exportExcelObj.val(1);
			});
			$(".detail").click(function(){
				$(".removeappend").remove();//先清除之前动态添加的html元素

				// $("div[class^='w25 user_']").html("&nbsp;&nbsp;"); // 原初始化用户详情为空白
				$("div[class^='w30 user_']").html("&nbsp;&nbsp;");	

				var  id = $(this).attr('data');
				$.post(common.U('getInfo'),{id:id},function(datas){
					console.log(datas);
					for(var name in datas){
						if(datas[name]){
							// $('.user_'+name).html(datas[name]) // 原动态添加用户详情
							if ( 'openid' ==  name ) {
								$('.user_'+name).html(datas[name] + '<br/><button class="btn green js-unbind-wechat" data-openid="' + datas[name] + '">解除绑定</button>');
							} else {
								$('.user_'+name).html(datas[name]);
							}
						}
					}

					// 原动态添加html元素
					// if(datas['invoice']){
					// 	$(".modal-body").append('<div class="removeappend"><div class="w25"><b>发票抬头</b></div><div class="w25">&nbsp;&nbsp;</div><div class="w25">&nbsp;&nbsp;</div><div class="w25">&nbsp;&nbsp;</div></div>');
					// 	for(var i=0;i<datas['invoice'].length;i++){
					// 		$(".modal-body").append('<div class="removeappend"><div class="w25">发票抬头'+(i+1)+'</div><div class="w25">'+datas['invoice'][i]+'</div><div class="w25">&nbsp;&nbsp;</div><div class="w25">&nbsp;&nbsp;</div></div>');
					// 	}
					// }
					// if(datas['address']){
					// 	$(".modal-body").append('<div class="removeappend"><div class="w25"><b>常用地址</b></div><div class="w25">&nbsp;&nbsp;</div><div class="w25">&nbsp;&nbsp;</div><div class="w25">&nbsp;&nbsp;</div></div>');
					// 	for(var i=0;i<datas['address'].length;i++){
					// 		$(".modal-body").append('<div class="removeappend"><div class="w25">姓名</div><div class="w25">'+datas['address'][i]['name']+'</div><div class="w25">&nbsp;&nbsp;</div><div class="w25">&nbsp;&nbsp;</div></div>');
					// 		$(".modal-body").append('<div class="removeappend"><div class="w25">手机号码</div><div class="w25">'+datas['address'][i]['mobile']+'</div><div class="w25">&nbsp;&nbsp;</div><div class="w25">&nbsp;&nbsp;</div></div>');
					// 		$(".modal-body").append('<div class="removeappend"><div class="w25">常用地址</div><div>'+datas['address'][i]['addr']+'</div><br/>');
					// 	}
					// }

					if(datas['invoice']){
						$(".modal-body").append('<div class="removeappend"><div class="w20"><b>发票抬头</b></div><div class="w30">&nbsp;&nbsp;</div><div class="w20">&nbsp;&nbsp;</div><div class="w30">&nbsp;&nbsp;</div></div>');
						for(var i=0;i<datas['invoice'].length;i++){
							$(".modal-body").append('<div class="removeappend"><div class="w20">发票抬头'+(i+1)+'</div><div class="w30">'+datas['invoice'][i]+'</div><div class="w20">&nbsp;&nbsp;</div><div class="w30">&nbsp;&nbsp;</div></div>');
						}
					}
					if(datas['address']){
						$(".modal-body").append('<div class="removeappend"><div class="w20"><b>常用地址</b></div><div class="w30">&nbsp;&nbsp;</div><div class="w20">&nbsp;&nbsp;</div><div class="w30">&nbsp;&nbsp;</div></div>');
						for(var i=0;i<datas['address'].length;i++){
							$(".modal-body").append('<div class="removeappend"><div class="w20">姓名</div><div class="w30">'+datas['address'][i]['name']+'</div><div class="w20">&nbsp;&nbsp;</div><div class="w30">&nbsp;&nbsp;</div></div>');
							$(".modal-body").append('<div class="removeappend"><div class="w20">手机号码</div><div class="w30">'+datas['address'][i]['mobile']+'</div><div class="w20">&nbsp;&nbsp;</div><div class="w30">&nbsp;&nbsp;</div></div>');
							$(".modal-body").append('<div class="removeappend"><div class="w20">常用地址</div><div>'+datas['address'][i]['addr']+'</div><br/>');
						}
					}

				})

				// $("#user_info").show(); // 原弹出 用户详情弹窗
				$("#user_info").modal('show');

			})

			//原关闭 用户详情弹窗
			$('.close').click(function(){
				// $("#user_info").hide();
				$("#user_info").modal('hide');
				$("#newMsgModal").remove();
			})
			$('.btn-default').click(function(){
				$("#user_info").modal('hide');
				$("#newMsgModal").remove();
			})


			// 解绑微信账号
			$(document).on('click', '.js-unbind-wechat', function(){
				var that = $(this);
				require.async('base/jtDialog',function(jtDialog){
					jtDialog.confirm(function(){
						var $openid = that.data('openid');
						tool.doAjax({
							url:common.U('User/unBindWechat'),
							type:'post',
							data: {openid: $openid}
						}, function(result){
							if ( 'SUCCESS' == result.status ) {
								$('.user_openid').html("&nbsp;&nbsp;");
								jtDialog.showTip(result.msg);
							}
						});
					}, '确认要解除该用户绑定的微信账号吗？');
				});
			})


		},
        add : function(){
			require.async('base/jtDialog',function(jtDialog){
				$("input[name='mobile']").blur(function(){
					var mobile = $(this).val();
					if(mobile == ''){
						jtDialog.showTip('手机号不能为空');
					}
					//var data = {};
					//data.push({mobile:mobile});
					$.post(common.U('isMobile'),{mobile:mobile},function(datas){
						if(datas.msg==1){
							jtDialog.showTip('手机号已经存在');
						}
					})
				});
			});
            add_validate();
        },
        edit : function(){

            edit_validate();
            var area = require('pulgins/area/area.js');
            var area_config = {
                value: {
                    provice_id: $('#provice').data('id'),
                    city_id: $('#city').data('id'),
                    county_id: $('#county').data('id')
                }
            };

            area.init(area_config);
            setStatisticsTableCss();
            require.async('base/ajaxListComponent',function(list){
            	get_buy_goods(list);
            });
            require.async('controller/user/ajaxListComponent1',function(list){
              	getHistoryOrder(list);
            });
			require.async('controller/user/ajaxListComponent6',function(list){
              	get_crowd_goods(list);
            });
            require.async('controller/user/ajaxListComponent2',function(list){
            	get_shipping_address_list(list);
            });
            require.async('controller/user/ajaxListComponent3',function(list){
            	get_credits_list(list);
            });
            require.async('controller/user/ajaxListComponent4',function(list){
            	get_recharge_list(list);
            });
            require.async('controller/user/ajaxListComponent5',function(list){
            	get_recommend_list(list);
            });
		},
		suggestManage:function(){
			suggestManage();
		}
	};
	/**
     * 获取买过的普通商品列表
     */
	function get_buy_goods(list){
	    var config = {
	    		 	async:true,
	                page_id : 'buy_goods_page',
	                list_id : 'buy_goods_list',
	                list_tpl_id : 'tpl_buy_goods_list',
	                url : common.U('buyGoods',{'uid':$('#buy_goods_list').data('uid')}),
	                page_size:$('#buy_goods_list').data('pagesize')
	            };
	       list.init(config);
	       list.get_lists();
	}
	
	/**
     * 获取买过的众筹商品列表
     */
	function get_crowd_goods(list){
		var config = {
	    		 	async:true,
	                page_id : 'buy_crowd_page',
	                list_id : 'buy_crowd_list',
	                list_tpl_id : 'tpl_buy_crowd_list',
	                url : common.U('getCrowdGoods',{'uid':$('#buy_crowd_list').data('uid')}),
	                page_size:$('#buy_crowd_list').data('pagesize')
	            };
	   list.init(config);
	   list.get_lists();
	}
	
	
	/**
	 * 获取推荐会员列表
	 */
	function get_recommend_list(list){
		var config = {
				async:true,
				page_id : 'recommend_page',
				list_id : 'recommend_list',
				list_tpl_id : 'tpl_recommend_list',
				url : common.U('getRecommendList',{'uid':$('#recommend_list').data('uid')}),
				page_size:$('#recommend_list').data('pagesize')
		};
		list.init(config);
		list.get_lists();
	}
	/**
     * 获取充值日志
     */
	function get_recharge_list(list){
	     var config = {
	    		 	async:true,
	                page_id : 'recharge_page',
	                list_id : 'recharge_list',
	                list_tpl_id : 'tpl_recharge_list',
	                url : common.U('getRechargeLog',{'uid':$('#recharge_list').data('uid')}),
	                page_size:$('#recharge_list').data('pagesize')
	            };
	       list.init(config);
	       list.get_lists();
	}
	 /**
     * 获取积分日志
     */
	function get_credits_list(list){
	     var config = {
	    		 	async:true,
	                page_id : 'credits_page',
	                list_id : 'credits_list',
	                list_tpl_id : 'tpl_credits_list',
	                url : common.U('getAccountLog',{'uid':$('#credits_list').data('uid')}),
	                page_size:$('#credits_list').data('pagesize')
	            };
	       list.init(config);
	       list.get_lists();
	}
	 /**
     * 获取历史订单
     */
	function getHistoryOrder(list){
            var config = {
            	async:true,
                page_id : 'historyOrderPage',
                list_id : 'historyOrder',
                list_tpl_id : 'tpl_history_order',
                url : common.U('historyorderlist',{'uid':$('#historyOrder').data('uid')}),
                page_size:$('#historyOrder').data('pagesize')
            };
            list.init(config);
            list.get_lists();
	}
	function get_shipping_address_list(list){
		  var config = {
				  	async:true,
	                page_id : 'shipping_address_page',
	                list_id : 'shipping_address_list',
	                list_tpl_id : 'tpl_shipping_address_list',
	                url : common.U('getShippingAddressList',{'uid':$('#historyOrder').data('uid')}),
	                page_size:$('#shipping_address_list').data('pagesize')
	            };
	            list.init(config);
	            list.get_lists();
	}
	//设置会员信息统计表样式
	function setStatisticsTableCss(){
		$('.userStatisticsTable').find('tr:even').css({
			'background-color':'#F9F9F9'
		});
	}
	module.exports = main;
});