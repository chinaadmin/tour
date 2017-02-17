define(function(require , exports ,module){
	var $ = require('jquery');
	var common = require('common');
	
	require('jquery_validate');
    var tool = require('model/tool');
	var main ={
		index : function(){
			tool.check_all("#check_all",".nav_check");
			var j=0;
			$('#changePageSize').bind('keypress',function(event){				
		            if(event.keyCode == "13")    
		            {
		                $('.form-search pull-right').submit();
		            }
		    });
			$('.del_routes').click(function(){
				require.async('base/jtDialog',function(jtDialog){
					var data = {};
					data['goods_id'] ={};
					$('.nav_check').each(function(i){
						var obj = $('.nav_check').eq(i);
						var status = obj.attr('data-status');
						var val = obj.val();
						if(obj.is(':checked')){
							data['goods_id'][i] = val;
						}
						if(obj.is(':checked')){
							j++;
						}
					});
					
					if(j){
					 
					   tool.doAjax({
						  url:common.U('FeaturedRoutes/deldata'),
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
					
					}else{
						jtDialog.showTip("请选择要删除的编号!");
					}
				});
			});
			$("input[name='title']").blur(function(){

				var data = {};
				data['goods_id'] = $(this).attr('data');
				data['contens'] = $(this).val();
				if(data['contens'] == ""){
					return false;
				}
				if(data['contens'] == contens){
					return false;
				}
				data['name'] = 'title';
				updara(data,'大标题');
			})

			$("input[name='titles']").blur(function(){
				var data = {};
				data['goods_id'] = $(this).attr('data');
				data['contens'] = $(this).val();
				data['name'] = 'titles';
				if(data['contens'] == ""){
					return false;
				}
				if(data['contens'] == contens){
					return false;
				}
				updara(data,'副标题');
			})
			$("input[name='sort']").blur(function(){
				var data = {};
				data['goods_id'] = $(this).attr('data');
				data['contens'] = $(this).val();
				data['name'] = 'sort';
				if(data['contens'] == ""){
					return false;
				}
				if(data['contens'] == contens){
					return false;
				}
				updara(data,"排序");
			})

			$("input[name='sort']").focus(function(){
				contens = $(this).val();
			})
			$("input[name='titles']").focus(function(){
				contens = $(this).val();
			})
			$("input[name=title]").focus(function(){
				contens = $(this).val();
			})

			function updara(data,contens){
				var datas = {};
				datas['data'] = data;
				require.async('base/jtDialog',function(jtDialog){
					tool.doAjax({
						url:common.U('FeaturedRoutes/uptitle'),
						data:datas
					},function(result){
						if(result.msg == 'success'){
							jtDialog.showTip(contens+'更新成功');
						}else{
							jtDialog.showTip(contens+"更新失败！");

						}
					});
				});
			}
		},
        add : function(){
			tool.check_all("#check_all",".order_check");
			var contens = "";
			var j=0;
			$('.add_routes').click(function(){
				require.async('base/jtDialog',function(jtDialog){
					var data = {};
					data['goods_id'] ={};
					$('.order_check').each(function(i){
						var obj = $('.order_check').eq(i);
						var status = obj.attr('data-status');
						var val = obj.val();
						if(obj.is(':checked')){
							data['goods_id'][i] = val;
						}
						if(obj.is(':checked')){
							j++;
						}
					});
					
					if(j){
					
					   tool.doAjax({
						  url:common.U('FeaturedRoutes/updata'),
						  data:data
					   },function(result){
						   if(result.msg == 'success'){
								jtDialog.showTip('添加成功', 2, function () {
								   location.reload();
								});
								
						   }else{
							   jtDialog.showTip("添加失败！");
							  
						   }
					   });
					
					}else{
						jtDialog.showTip("请选择要添加的编号!");
					}
				});
			});
        },
        edit : function(){
           
		}
	};
	module.exports = main;
});