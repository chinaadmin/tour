define(function(require , exports ,module){
	var $ = require('jquery');
	var common = require('common');
	
	require('jquery_validate');
    var tool = require('model/tool');
	var main ={
		index : function(){
			tool.check_all("#check_all",".nav_check");
			var j=0;
			$('.tag-del').click(function(){
				require.async('base/jtDialog',function(jtDialog){
					var data = {};
					data['base_id'] ={};
					$('.nav_check').each(function(i){
						var obj = $('.nav_check').eq(i);
						var status = obj.attr('data-status');
						var val = obj.val();
						if(obj.is(':checked')){
							data['base_id'][i] = val;
						}
						if(obj.is(':checked')){
							j++;
						}
					});
					
					if(j){
					 
					   tool.doAjax({
						  url:common.U('base/del'),
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
			j=0;
			$('.tag-outsale').click(function(){
				sale(0);
			});
			$('.sale').click(function(){
				sale(1);
			});
			function sale(is_sale){
				if(is_sale == 1){
					type = '上架';
				}else{
					type = '下架';
				}
				var j = 0;
				require.async('base/jtDialog',function(jtDialog){
					var data = {};
					data['id'] = {};
					data['is_sale'] = is_sale;
					$('.nav_check').each(function(i){
						var obj = $('.nav_check').eq(i);
						var status = obj.attr('data-status');
						var val = obj.val();
						if (obj.is(':checked')) {
							data['id'][i] = val;
							j++;
						}					
					});

					if(j){
						tool.doAjax({
							url:common.U('base/isSale'),
							data:data
						},function(result){
							if (result.msg == 'success') {
								jtDialog.showTip(type+'成功',2,function(){
									location.reload();
								});
							}else{
								jtDialog.showTip(type+"失败！");
							}
						});
					}else{
						jtDialog.showTip("请选择要修改的编号！");
					}
				});
				j=0;				
			}
			$('.onSale').click(function(){
					var data = {};
					data['is_sale'] = {};
					var type ='';
					data['id'] = {};
					data['is_sale'] = $(this).attr('data-val');
					if (data['is_sale'] == 0) {
						data['is_sale'] = 1;
						type = '上架';
					}else{
						data['is_sale'] = 0;
						type = '下架';
					}
					data['id'][0] = $(this).attr('data');
					require.async('base/jtDialog',function(jtDialog){
						tool.doAjax({
							url:common.U('base/isSale'),
							data:data
						},function(result){
							if (result.msg == 'success') {
								jtDialog.showTip(type+'成功',2,function(){
									location.reload();
								});
							}else{
								jtDialog.showTip(type+"失败！");
							}
						});
					});
				});
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
        edit : function(){
         
		},
		addrelate : function(){
			tool.check_all("#check_all",".nav_check");
			var num = $("input[name='num']").val();
			var id = $("input[name='id']").val();
			var j=0;
			$('.addrelate').click(function(){
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
					if(((num*1)+(j*1))>3){
						jtDialog.showTip("路线最大关联数量不能超过三个!，谢谢");
						j =0;
						return false;
					}
					if(j){
						data['id'] = id;
					   tool.doAjax({
						  url:common.U('Base/upRelate'),
						  data:data
					   },function(result){
						   if(result.msg == 'success'){
								jtDialog.showTip('关联成功', 2, function () {
								   location.reload();
								});
								
						   }else{
							   jtDialog.showTip("关联失败！");
							  
						   }
					   });
					
					}else{
						jtDialog.showTip("请选择要关联的编号!");
					}
				});
				j =0;
			});
		},
		
		del : function(){
			tool.check_all("#check_all",".nav_check");
			var id = $("input[name='id']").val();
			var j=0;
			$('.del_relate').click(function(){
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
						data['id'] = id;
					   tool.doAjax({
						  url:common.U('Base/delRelate'),
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
				j =0;
			});
		}
	};
	module.exports = main;
});