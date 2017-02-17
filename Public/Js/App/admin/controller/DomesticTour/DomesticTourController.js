define(function(require , exports ,module){
	var $ = require('jquery');
	var common = require('common');
	
	require('jquery_validate');
    var tool = require('model/tool');
	var main ={
		index : function(){
			tool.check_all("#check_all",".order_check");
			var j=0;
			$('#changePageSize').bind('keypress',function(event){				
		            if(event.keyCode == "13")    
		            {
		                $('.form-search pull-right').submit();
		            }
		    });
			$('.del_message').click(function(){
				require.async('base/jtDialog',function(jtDialog){
					var data = {};
					data['dt_id'] ={};
					$('.order_check').each(function(i){
						var obj = $('.order_check').eq(i);
						var status = obj.attr('data-status');
						var val = obj.val();
						if(obj.is(':checked')){
							data['dt_id'][i] = val;
						}
						if(obj.is(':checked')){
							j++;
						}
					});
					
					if(j){
					 jtDialog.confirm(function(){
					   tool.doAjax({
						  url:common.U('DomesticTour/deldate'),
						  data:data
					   },function(result){
						   if(result.msg == 'success'){
								jtDialog.showTip('删除成功', 2, function () {
								   location.reload();
								});
								
						   }else{
							   jtDialog.showTip("删除失败！");
							  
						   }
					   });
					 },"信息删除后无法再进行还原，确认吗？");
					 }else{
						 jtDialog.showTip("请选择要删除的编号!");
					 }
				});
			});
		},
        add : function(){
			
			$("form").submit( function () {
				var type = true;
				var s_time = $("input[name='s_display_time']").val();
				require.async('base/jtDialog',function(jtDialog){
					if(!$("input[name='s_name']").val()){
						jtDialog.showTip("图片名称不能为空");
						type = false;
						return false;
					}
					if(isNaN($("input[name='s_display']").val())){
						jtDialog.showTip("显示顺序只能是数字");
						type = false;
						return false;
					}
					if(isNaN(s_time)){
						jtDialog.showTip("显示时间只能是数字");
						type = false;
						return false;
					}
					if(s_time<1 || s_time > 5){
						jtDialog.showTip("显示时间只能在1-5之间");
						type = false;
						return false;
					}
				})
				if(!type){
					return false;
				}
			});
        },
        edit : function(){
            $("form").submit( function () {
				var type = true;
				require.async('base/jtDialog',function(jtDialog){
					if(!$("input[name='classify_name']").val()){
						jtDialog.showTip("分类名称不能为空");
						type = false;
						return false;
					}
					if(isNaN($("input[name='classify_sort']").val())){
						jtDialog.showTip("排序只能是数字");
						type = false;
						return false;
					}
				})
				if(!type){
					return false;
				}
			});
		}
	};
	module.exports = main;
});