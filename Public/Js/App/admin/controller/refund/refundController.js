/**
 * 退款管理
 */
define(function(require , exports ,module){
	var $ = require("jquery");
	var tool = require('model/tool');
	var common = require('common');
	var refund = {
		/**
	     * 订单查询时间段
	     */
	      time_sole:function(){
	    		require.async("pulgins/bootstrap/datepicker/bootstrap-datepicker",function(){
	                $('.start_time').datepicker({
	                    autoclose:true
	                });
	                $('.end_time').datepicker({
	                    autoclose:true
	                });
	            });
	       },
	       /**
	        * 商品详情审核
	        */
	      info_send:function(){
	    	    	require.async("jquery_validate",function(){
	    	    		$('#refund_postscript').validate(
	    	    		$.extend(tool.validate_setting,{
	    	            	 submitHandler: function (form) {
	    	                     tool.formAjax(form,function(data){
	    	                         require.async('base/jtDialog',function(jtDialog){
	    	                             if(data.status != tool.success_code){
	    	                                 jtDialog.showTip(data.msg);
	    	                             }else{
	    	                                 jtDialog.showTip(data.msg,1,function(){
	    	                                	 location.reload();
	    	                                 });
	    	                             }
	    	                         });
	    	                         return false;
	    	                     });
	    	                 }
	    	            }));
	    	    	})
	      },
	    //显示隐藏商品详情
	     // hover_info : function(){
	    	// 	$('.order-code').hover(function(e){
	    	// 		e.stopPropagation();
	    	// 		var index = $(this).index();
	    	// 		$(this).find('.goods-info').show();
	    	// 	},function(){
	    	// 		$(this).find('.goods-info').hide();
	    	// 	})
	    	// },
	   //批量审核
	   all_verify :function(){
		   $('#all_confirm').on('click',function(){
			   var ids = $('.order_check').serializeArray();
			    if($.isEmptyObject(ids)){
			    	//$('#myModal').modal('hide');
			    	require.async('base/jtDialog',function(jtDialog){
			    		jtDialog.showTip("请选择要审核的商品！");
			    	});
				    return false;
			    }else{
			    	require.async('base/jtDialog',function(jtDialog){
				   $("#do_refund").on('submit',function(){
					  var refund_status = $("input[name='refund_status']").eq(1).is("checked");
					  var refund_mark = $("textarea[name='refund_mark']").val();
					  if(refund_status && !refund_mark){
						  jtDialog.showTip("请填写不同意的原因！");
						  return false;
					  }
					   ids = JSON.stringify($('.order_check').serializeArray());
					   data = $(this).serialize()+"&ids="+ids;
					   tool.doAjax({
						   url:common.U('Refund/batchAudit'),
						   data:data
					   },function(result){
						   if(result.status != tool.success_code){
                               jtDialog.showTip(result.msg);
                           }else{
                        	   $('#myModal').modal('hide');
                               jtDialog.showTip(result.msg,2,function(){
                              	 window.location.href = common.U('refund/index');
                               });
                           } 
						  })
						  return false;
					   })
				   });
			    }
		   })
	   },
	   //收货
	   receive:function(){
		   $('#receive').on('click',function(){
			   var refund_id = $(this).attr('data-id');
			  $("#do_receive").on("submit",function(){
				  var data = $(this).serialize()+"&refund_id="+refund_id;
				  require.async('base/jtDialog',function(jtDialog){
				  tool.doAjax({
					   url:common.U('Refund/receive'),
					   data:data
				   },function(result){
					   if(result.status != tool.success_code){
                          jtDialog.showTip(result.msg);
                      }else{
                   	   $('#myModal2').modal('hide');
                          jtDialog.showTip(result.msg,2,function(){
                         	 window.location.href = common.U('refund/index');
                          });
                      } 
					  })
				  });
				  return false;
			  })
		   })  
	   }
	};

	/**
	 * 列表页
	 */
	refund.index = function(){
		// this.hover_info();
		this.all_verify();
		this.receive();
		this.time_sole();
		tool.check_all("#check_all",".order_check");
		tool.batch_del($('.order-del'),$('.order_check'));
	};
	/**
	 * 详情页
	 */
	refund.info = function(){
		this.info_send();
		 require.async('fancyapps',function(){
			 $("a[rel=group]").fancybox({
				  	nextSpeed  : 550,
	             	loop:false,
	             	prevEffect		: 'none',
	         		nextEffect		: 'fade',
	         		helpers		: {
	         			title	: { type : 'inside' },
	         			buttons	: {}
	         		},
	         		/*afterLoad : function() {
	 					this.title = 'Image ' + (this.index + 1) + ' of ' + this.group.length + (this.title ? ' - ' + this.title : '');
	 				}*/
		     });
		 });
		 
		 $(function(){
		 	// 处理退款单
		 	$(".js-submit").click(function(){
		 		var refundSn = $("#refund-sn").val(); // 退款编号
				var orderStatus = $("#order-status").val(); // 订单发货状态
				var refundStatus = $(".js-refund_status:checked").val(); // 退款状态
				var refundMoney = $("#refund-money").val(); // 退款金额
				var refundMark = $("#refund-mark").val(); // 备注
				var editRefundMoney = $("#edit-refund-money").val(); // 审核后修改的金额
				var confirmDelivery = $("#confirm-delivery").val(); // 确认收货时的退款状态
				var refundHandle = $(this).data('handle'); // 处理退款单后的退款状态
				var orderSn = $("#order-sn").val(); // 订单编号
				// 确定退款或用户取消时弹出提示
				if(refundHandle){
					if( ! confirm("确定要执行该操作吗？")){
						return false;
					}
				}
				$.post(common.U('Refund/changeRefundStatus'), { refundSn: refundSn, orderStatus: orderStatus, refundStatus: refundStatus, refundMoney : refundMoney, refundMark: refundMark, editRefundMoney: editRefundMoney, confirmDelivery: confirmDelivery, refundHandle: refundHandle, orderSn: orderSn }, function(data){
					if(data.code == 1){
						require.async('base/jtDialog',function(jtDialog){
							jtDialog.showTip("操作成功！");
						});
						window.location.reload();
					}
				});
			});

		 });
	}

	refund.edit=function(){
		$('#chuli').click(function(){
			$('#tanchuss').css('display','block');
			$('#zzjs_net').css('display','block');
			$(document.body).css('overflow','hidden');
		});
		
		/*关闭弹框*/
		function closenum(){
			$('#tanchuss').css('display','none');
			$('#zzjs_net').css('display','none');
			$(document.body).css("overflow","visible"); 
		}

		$('#edittitles a').click(function(){
			closenum();
		});
		$('.del_form').click(function(){
			closenum();
		});

		$("#agree").click(function(){
			$('#refund_money').attr("disabled",false);
		});
		$("#refuse").click(function(){
			$('#refund_money').attr("disabled",true);
		});

		/*提交是否退款*/
		$('#send_form').live('click',function(){
			var is_agree = $("input[name='refund']:checked").val();
			var refund_id = $('#refund_id').val();
			var refund_money=$('#refund_money').val();
			var info_source = $('#info_source_id').val();
			var pay_type = $('#pay_type_id').val();//付款方式
			
			if(is_agree == 1){
				if(confirm('提交后金额会自动返回给客户，是否继续？')){
					if (info_source == 5){
						if(pay_type){
							// console.log('线下 线上付款');
							tool.doAjax({
								url:common.U('Refund/changeRefundStatus'),
								data:{'refund_id':refund_id,'refund_money':refund_money,'is_agree':is_agree}
							},function(result){
								require.async('base/jtDialog',function(jtDialog){
									if(result.type == 'aliRefund'){
										// window.open(common.U('Refund/refundPage'));	//有密退款

										if(result.code == 'T'){
											jtDialog.showTip('退款成功');
										}else if(result.code == 'F'){
											jtDialog.showTip('退款失败');
										}else if(result.code == 'P'){
											jtDialog.showTip('退款处理中');
										}

										//睡眠2秒再往下执行
										setTimeout("location.reload()",2000);
										return false;
									}else{
										jtDialog.showTip(result.msg);
										location.reload();
									}
								});
							});
						}else {
							// console.log('线下 线下付款');
							tool.doAjax({
								url:common.U('Refund/changeRefundStatusOutLine'),
								data:{'refund_id':refund_id,'refund_money':refund_money,'is_agree':is_agree}
							},function(result){
								require.async('base/jtDialog',function(jtDialog){
									if(result.code == 1){
										jtDialog.showTip(result.msg);
										//睡眠2秒再往下执行
										setTimeout("location.reload()",2000);
										return false;
									}else {
										jtDialog.showTip(result.msg);
										setTimeout("location.reload()",2000);
										return false;
									}
								})
							});
						}
					}else {
						tool.doAjax({
							url:common.U('Refund/changeRefundStatus'),
							data:{'refund_id':refund_id,'refund_money':refund_money,'is_agree':is_agree}
						},function(result){
							require.async('base/jtDialog',function(jtDialog){
								if(result.type == 'aliRefund'){
									// window.open(common.U('Refund/refundPage'));	//有密退款
	
									if(result.code == 'T'){
										jtDialog.showTip('退款成功');
									}else if(result.code == 'F'){
										jtDialog.showTip('退款失败');
									}else if(result.code == 'P'){
										jtDialog.showTip('退款处理中');
									}
	
									//睡眠2秒再往下执行
									setTimeout("location.reload()",2000);
									return false;
								}else{
									jtDialog.showTip(result.msg);
									location.reload();
								}
	                    	});
						});
					}
					closenum();
				}
			}else{
				tool.doAjax({
					url:common.U('Refund/changeRefundStatus'),
					data:{'refund_id':refund_id,'is_agree':is_agree}
				},function(result){
					// console.log(result);return false;
					require.async('base/jtDialog',function(jtDialog){
						jtDialog.showTip(result.msg);
						location.reload();
					});
				});
				closenum();
			}
		});
	}

	module.exports = refund;
});