/**
 * 订单中心
 */
define(function(require , exports ,module){
	var $ = require("jquery");
	var tool = require('model/tool');
	var common = require('common');
	var send = require("./send");
	var refund = require("./refund");
    var main = function(){
    	/**
    	 * 订单查询时间段
    	 */
    	this.time_sole = function(){
    		require.async("pulgins/bootstrap/datepicker/bootstrap-datepicker",function(){
                $('.start_time').datepicker({
                    autoclose:true
                });
                $('.end_time').datepicker({
                    autoclose:true
                });
            });
    	};
    	//显示隐藏商品详情
    	this.hover_info = function(){
    		$('.order-code').hover(function(e){
    			e.stopPropagation();
    			var index = $(this).index();
    			$(this).find('.goods-info').show();
    		},function(){
    			$(this).find('.goods-info').hide();
    		})
    	};
    	//点击切换发票
    	this.invoice_click=function(){
    		var _this = this;
    		$('#need_invoice,#norml_invoice,#add_invoice').on('click',function(){
    			_this.tab_invoice();
    		})
    	};
    	/**
    	 * 发票类型切换
    	 */
    	this.tab_invoice=function(){
    		if($('#need_invoice').is(":checked")){
    			$('.invoce_type').show();
    			if($('#norml_invoice').is(":checked")){
    				$(".general-invoice").show();
    				$('.add-invoice').hide();
    			}
    			if($('#add_invoice').is(":checked")){
    				$(".general-invoice").hide();
    				$('.add-invoice').show();
    			}
    		}else{
    			$('.invoce_type').hide();
    			$(".general-invoice").hide();
				$('.add-invoice').hide();
    		}
    	};
    	/**
    	 * 编辑表单提交
    	 */
    	this.editSubmit = function(){
    		require.async("jquery_validate",function(){
        		$('#edit-invoice').validate($.extend(tool.validate_setting,{
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
    	};
    	/**
    	 * 批量确认
    	 */
    	this.all_confirm = function(){
    		$(".order_confirm").on('click',function(){
    			var _this = $(this);
    	require.async('base/jtDialog',function(jtDialog){
    		var order_id = _this.attr('order_id');
			var j=0;
			if(order_id){
				var data = "order_id="+order_id;
				j++;
			}else{
				var data = {};
    			data['order_id'] ={};
    			$('.order_check').each(function(i){
    				var obj = $('.order_check').eq(i);
    				var status = obj.attr('data-status');
    				var val = obj.val();
    				if(obj.is(':checked') && status==0){
    					data['order_id'][i] = val;
    				}
    				if(obj.is(':checked')){
    					j++;
    				}
    			});
			}
    			if(j){
    		     jtDialog.confirm(function(){
    			   tool.doAjax({
    				  url:common.U('Order/order_confirm'),
    				  data:data
    			   },function(result){
    				   if(result.status != tool.success_code){
    					   jtDialog.showTip("更新失败！");
    				   }else{
    					   jtDialog.showTip(result.msg, 2, function () {
                               location.reload();
                            });
    				   }
    		       });
    		     },"订单确认后无法再进行编辑，确认吗？");
    			 }else{
    				 jtDialog.showTip("请选择要确认的订单!");
    			 }
    		});
    		});	
    	};
    };
    /**
     * 订单导出
     */
    main.prototype.export_order = function(){
    	$(".order-export").on('click',function(){
    		var data = "";
    		$(".order_check").each(function(i,v){
    			if($(v).is(":checked")){
    				data+=$(v).val()+",";
    			}
    		})
    		if(data){
    		 var url = $(this).attr('url')+"?order_id="+data;
    		 window.location.href=url;
    		}else{
    			require.async('base/jtDialog',function(jtDialog){
    				 jtDialog.showTip("请选择要导出的订单");
    			});
    		}
    	})
    }

    //导出全部订单
    main.prototype.allExport_order = function(){
        $(".order-allExport").on('click',function(){
            var order_status = $('select[name="order_status"]').val(); //订单状态
            var pay_status = $('select[name="pay_status"]').val(); // 支付状态
            var receipt_status = $('select[name="receipt_status"]').val(); // 发货状态
            var order_keywords = $('input[name="order_keywords"]').val(); // 关键字查询
            var start_time = $('input[name="start_time"]').val(); // 下单起始时间
            var end_time = $('input[name="end_time"]').val(); // 下单结束时间
            var start_money = $('input[name="start_money"]').val(); // 订单起始金额
            var end_money = $('input[name="end_money"]').val(); // 订单最大金额
            var send_type = $('select[name="send_type"]').val(); //配送方式
            var order_source = $('select[name="order_source"]').val(); // 订单来源
            var pay_type = $('select[name="pay_type"]').val(); // 支付方式
            var stores = $('select[name="stores"]').val(); // 门店
            var url = $(this).attr('url')+"?order_status=" + order_status + "&pay_status=" + pay_status +"&receipt_status=" + receipt_status +"&order_keywords=" + order_keywords +"&start_time=" + start_time +"&end_time=" + end_time +"&start_money=" + start_money  +"&end_money=" + end_money +"&send_type=" + send_type +"&order_source=" + order_source +"&pay_type=" + pay_type +"&stores=" + stores;
             window.location.href=url;
        })
    }
	//添加线下订单
	main.prototype.validationorder = function(){
		$(".order-validationorder").on('click',function(){
			var tel = $('.m-wrap').val();
			console.log(tel);
			var reg = /^0?1[3|4|5|8][0-9]\d{8}$/;
			if (reg.test(tel)) {
				$("#order_selectjump").submit();
			}else{
				require.async('base/jtDialog',function(jtDialog){
					jtDialog.showTip('请填写正确的手机号码');
				});
			};
		})
	}

	//用户注册
	main.prototype.useraddpwd = function(){
		$(".order-pwd").on('click',function(){
			var data={};
			data['mobile'] = $('.getmobile').val();
			data['password'] = $('.getpassword').val();
			var url=window.location.host,urls;
			urls = url.replace(/admin/,'api');
			tool.doAjax({
				url:'http://'+urls+'/User/registerwithoutcode',
				data:data
			},function(result){
				if(result.resCode === "SUCCESS"){
					window.location.href='http://'+url+'/Order/selectJump/mobile/'+data['mobile'];
				}else{
					require.async('base/jtDialog',function(jtDialog){
						jtDialog.showTip(result.resMsg);
					});
				}
			});
		})
	}

	//填写出行人数显示对应出行人填写信息
	main.prototype.travelinfo = function(){
		$('input[name="travel_number"]').bind('input propertychange',function () {
			var travel_number = $('input[name="travel_number"]').val();
			var kucun = $('input[name="kucun"]').val();
			$('.addtraveler').empty();
			if(!isNaN(parseInt(travel_number))){
				var travel_number = parseInt(travel_number);//出行人数
				if(travel_number > kucun){
					$('input[name="travel_number"]').val('');
					require.async('base/jtDialog',function(jtDialog){
						jtDialog.showTip('出行人数不能超过库存数');
					});
				}else if(travel_number === 0){
					$('input[name="travel_number"]').val('');
					require.async('base/jtDialog',function(jtDialog){
						jtDialog.showTip('出行人数不能为0');
					});
				}else{
					var i=1
					for (i;i<=travel_number;i++){
						$('.addtraveler').append("<label style='margin-left: 50px;margin-top: 10px;'>出行人"+i+"</label><div style='margin-top:10px'><span style='margin-right: 46px;margin-left: 90px'>姓名</span><input type='text' name='travel_name[]' minlength='2' required></div><div style='margin-top:10px'><span style='margin-right: 20px;margin-left: 90px'>联系电话</span><input type='text' name='travel_phone[]' maxlength='11' pattern='^1[3-9][0-9]{9}$' required></div><div style='margin-top:10px'><span style='margin-right: 33px;margin-left: 90px'>身份证</span><input type='text' name='travel_cardid[]' minlength='15' maxlength='18' pattern='[0-9]{15}|[0-9]{17}[0-9xX]$' required></div>");
					}
				}
			}
		});
	}

	//获取选择的路线对应的团期
	main.prototype.lineselect = function(){
		$(".order-line").on('click',function(){
			var data={};
			data['goods_sn'] = $('.goods_sn').val();
			if(data['goods_sn']){
				$('#order-linesubmit').submit();
			}
		})
	}
	/*jQuery.validator.addMethod("<strong>isMobile</strong>", function(value, element) {
		var length = value.length;
		var regPhone = /^1([3578]\d|4[57])\d{8}$/;
		return this.optional(element) || ( length == 11 && regPhone.test( value ) );
	}, "请正确填写您的手机号码");
	/!**
	 * 编辑验证
	 *!/
	main.prototype.editvalidate = function(){
		$('#addOrderMsg-from').validate($.extend({
				rules: {
					order_phone: {
						required:true,
						isMobile:true,
					},
					travel_number: {
						required:true,
					},
					order_name: {
						required:true,
					}
				},
				messages: {
					order_phone: {
						required:"手机号码不能为空",
						isMobile: "手机号码不符合规范"
					},
					travel_number: {
						required: "出行人数不能为空"
					},
					order_name: {
						required: "订单联系人不能为空"
					}
				}
			},$.extend(tool.validate_setting,{
				submitHandler: function (form) {
					tool.formAjax(form,function(data){
						require.async('base/jtDialog',function(jtDialog){
							if(data.status != tool.success_code){
								jtDialog.showTip(data.msg);
							}else{
								$(".btn").removeClass('blue');
								$(".btn").attr('disabled',true);
								$('#addOrderMsg-from').submit();
							}
						});
						return false;
					});
				}
			}
			)
		));
	}();*/
    /**
     * 订单列表
     */

    main.prototype.index = function(){
    	this.time_sole();
    	// this.editvalidate;
    	this.travelinfo();
    	this.useraddpwd();
    	this.lineselect();
    	this.validationorder();
    	this.hover_info();
    	this.all_confirm();
    	this.export_order();

        this.allExport_order(); //导出全部订单

    	tool.check_all("#check_all",".order_check");
    	tool.batch_del($('.order-del'),$('.order_check'));
    	send.index();
		$("#ipt1").keyup(function () {
			var reg = $(this).val().match(/\d+\.?\d{0,2}/);
			var txt = '';
			if (reg != null) {
				txt = reg[0];
			}
			$(this).val(txt);
		}).change(function () {
			$(this).keypress();
			var v = $(this).val();
			if (/\.$/.test(v))
			{
				$(this).val(v.substr(0, v.length - 1));
			}
		});
		$(".line_done").click(function () {
			/*var paynumber = $("#ipt1").val();
			if (paynumber == 0){
				require.async('base/jtDialog',function(jtDialog){
					jtDialog.showTip('付款金额不能为0');
				});
			}else{*/
				$("#line_done_submit").submit();
			// }
		});
        $("#completeAll").click(function(){
            var orderIds = $("input:checkbox[name*='order_ids']:checked").map(function(index,elem) {
                return $(elem).val();
            }).get().join(',');
            // var orderIds = $("input:checkbox[name*='order_ids']:checked").val();
            // console.log(orderIds);return false;
            tool.doAjax({
                url:common.U('Order/completeAll'),
                data:{'orderIds':orderIds}
            },function(result){
				require.async('base/jtDialog',function(jtDialog){
					jtDialog.showTip(result.msg,1);
					location.reload();
				});
            });
        });
    }
    /**
     * 编辑订单
     */
    main.prototype.edit = function(){
    	this.tab_invoice();
    	this.invoice_click();
    	this.editSubmit();
    }
    /**
     * 订单备注
     */
    main.prototype.mark = function(){
    	require.async("jquery_validate",function(){
    		$('#seller_postscript').validate($.extend({
                /*rules: {
                	seller_postscript: {
                        required: true,
                    }
                },
                messages: {
                	seller_postscript: {
                        required: "订单备注不能为空",
                    }
                }*/
            },$.extend(tool.validate_setting,{
            	 submitHandler: function (form) {
                     tool.formAjax(form,function(data){
                         require.async('base/jtDialog',function(jtDialog){
                             if(data.status != tool.success_code){
                                 jtDialog.showTip(data.msg);
                             }else{
                            	 $("#myModal_remark").modal('hide');
//                                 jtDialog.showTip(data.msg,1,function(){
//                                	 //location.reload();
//                                	 
//                                 });
                             }
                         });
                         return false;
                     });
                 }
            })));
    	})
      };
      main.prototype.info = function(){
    	  this.mark();
    	  this.all_confirm();
    	  refund.index();
      }
      //订单打印
      main.prototype.printList = function(){
    	 $('button[name="confirmPrint"]').click(function(){
    		 require.async("pulgins/print/jquery.PrintArea",function(){
    			 $("#print").printArea();   
    		 })
    	 });
      }
    module.exports = new main();
});