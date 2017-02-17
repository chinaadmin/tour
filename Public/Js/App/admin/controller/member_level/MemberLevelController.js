define(function(require , exports ,module){
	var $ = require('jquery');
	var common = require('common');
	require('jquery_validate');
    var tool = require('model/tool');
	var main = function () {

	};
	main.prototype.export_order = function(){
		$(".order-export").on('click',function(){
			var data = "";
			$(".order_check").each(function(i,v){
				if($(v).is(":checked")){
					data+=$(v).val()+",";
				}
			})
			if(data){
				var url = $(this).attr('url')+"?cid="+data;
				window.location.href=url;
			}else{
				require.async('base/jtDialog',function(jtDialog){
					jtDialog.showTip("请选择要导出的会员");
				});
			}
		})
	};
	main.prototype.put_in_time = function () {
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
	main.prototype.index = function(){
			this.put_in_time();//开始时间不能大于结束时间
			common.date({startSelector:'[name="start_time"]',endSelector:'[name="end_time"]'});

			$(".detail").click(function(){
				$("#user_info").show();
				var arr = [];
				$(this).nextAll().each(function(i){
					if($(this).text()==''){
						arr[i] = '&nbsp;&nbsp;'
					}else {
						arr[i]=$(this).text()
					}
				})
				$('.user_mobile').html($(this).text())
				$('.cid').html(arr[0])
				$('.one_number').html(arr[1])
				$('.family_number').html(arr[2])
				$('.upgrade_time').html(arr[3])
				$('.original_level').html(arr[4])
				$('.upgrade_level').html(arr[5])
				$('.card_physical_type').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+arr[6])
				$('.cid_type').html(arr[7])
				$('.pay_account').html(arr[8])
				$('.journal').html(arr[9])
				$('.pay_channel').html(arr[10])
				$('.pay_status').html(arr[11])
				$('.pay_done_time').html(arr[12])
				$('.receive_person').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+arr[13])
				$('.phone').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+arr[14])
				$('.receive_address').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+arr[15])
			});

			$('.close').click(function(){
				$("#user_info").hide();
			});

			this.export_order();
		};


	module.exports = new main();
});