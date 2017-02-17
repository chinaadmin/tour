define(function(require , exports ,module){
	var $ = require('jquery');
	var common = require('common');
	var template = require('template');
	require('jquery_validate');
	var base = require('base/controller/adminbaseController');
    var tool = require('model/tool');

    /**
     * 地址
     */
    var edit_validate = function(){
        $('#from_edit').validate($.extend({
            rules: {
                name: {
                    required: true,
                    maxlength:30
                }
            },
            messages: {
                name: {
                    required: "地址不能为空",
                    maxlength:"地址名称不能超过30个字"
                }
            }
        },tool.validate_setting));
    }();
	
	var main ={
		index : function(){
			tool.del($('.js-del'));
            tool.saveSort($('#save-sort'));
            /*$('.icon-plus-sign').click(function(){
            	var aa='';
            	var aa=$(this);
            	// $(this).removeClass('icon-plus-sign');
            	// $(this).addClass('icon-minus-sign');
            	$(this).attr('class','icon-minus-sign');
				var depart_id=$(this).attr('departId');
				// console.log(depart_id);return false;
				$.ajax({
					type:'post',
					url:'getChild',
					data:{'pid':depart_id},
					success:function(res){
						obj= $.parseJSON(res);
						$.each(obj,function(n,value){
							str='<tr class="pid_'+value.pid+'">';
							if(value.type==1){
								str+='<td style="text-indent:25px';
							}else if(value.type==2){
								str+='<td style="text-indent:50px';
							}else if(value.type==3){
								str+='<td style="text-indent:75px';
							}
							str+='">';

							if(value.child==1){
								str+='<i class="icon-plus-sign" departId="'+value.depart_id+'">&nbsp;'+value.name;
							}
							// str+='<td>'+value.status+'|getStatus=###,["0" =>["style"=>"label-danger","text"=>"否"],"1" =>["style"=>"label-success","text"=>"是"]]}</td>';
							str+='<td></td>';
							str+='<td><MyTag:rule name="Category/edit"><a class="btn blue-stripe" ';
							// str+=' href="{:U(\"edit\",[\"depart_id\"=>\"';
							str+=' href="edit/depart_id/';
							str+=value.depart_id+'">编辑</a></MyTag:rule>';
							// str+=value.depart_id+'\"])}">编辑</a></MyTag:rule>';
							// str+='<MyTag:rule name="Category/del">a class="btn red-stripe js-del" url="{:U(\"del\",[\"depart_id\"=>'+value.depart_id+'])}">删除</a></MyTag:rule></td>';
							str+='<MyTag:rule name="Category/del"><a class="btn red-stripe js-del" href="del/depart_id/'+value.depart_id+']">删除</a></MyTag:rule></td>';
							str+='</tr>';
							// console.log(str);

							aa.parent().parent().parent().append(str);
						});
					}
				});
				// var aa='';
			});*/

			/*$(function(){
				$(document).on('click',".icon-plus-sign",function(){
					var aa='';
					if(!$(this).hasClass('icon-plus-sign'))return;
					$(this).attr('class','icon-minus-sign');
					var depart_id=$(this).attr('departId');
					var aa=$(this);
		        	$.ajax({
						type:'post',
						url:'getChild',
						data:{'pid':depart_id},
						success:function(res){
							// console.log(res);return false;
							obj = $.parseJSON(res);
							var str = '';
							$.each(obj,function(n,value){
								str+='<tr class="pid_'+value.pid+'">';
								if(value.type==1){
									str+='<td style="text-indent:25px;">';
								}else if(value.type==2){
									str+='<td style="text-indent:50px;">';
								}else if(value.type==3){
									str+='<td style="text-indent:75px;">';
								}

								if(value.child==1){
									str+='<i class="icon-plus-sign" departId="'+value.depart_id+'">&nbsp;'+value.name;
								}
								str+='<td></td>';
								str+='<td><MyTag:rule name="Category/edit"><a class="btn blue-stripe" ';
								str+=' href="edit/depart_id/';
								str+=value.depart_id+'">编辑</a></MyTag:rule>';
								str+='<MyTag:rule name="Category/del"><a class="btn red-stripe js-del" href="del/depart_id/'+value.depart_id+']">删除</a></MyTag:rule></td>';
								str+='</tr>';
								aa.parent().parent().parent().append(str);
								var str = '';
							});
						}
					});
				});

				$(document).on('click',".icon-minus-sign",function(){
					$(this).attr('class','icon-plus-sign');
					var pid=$(this).attr('departId');
					$('.pid_'+pid).hide();
				});
			});*/

			
		},
		add:function(){
			tool.del($('.js-del'));
            tool.saveSort($('#save-sort'));

			$(function(){
				$("#first_address").change(function(){
					$("#third_address").find("option").remove();
					$("#second_address").find("option").remove();

					$("#second_address").hide();
					$("#third_address").hide();

					$("#second_address").show();

					var pid=$(this).val();
					var first=$(this);
					var str='';
					if(pid!=0){
						$.ajax({
							type:'post',
							type:'post',
							url:'getChildAdd',
							data:{'pid':pid},
							success:function(res){
								obj = $.parseJSON(res);
								str+='<option value="0">请选择</option>';

								$.each(obj,function(n,value){
									str+='<option value="'+value.depart_id+'">&nbsp;&nbsp;&nbsp;'+value.name+'</option>';
								});
								
								$('#second_address').append(str);
							}
						});
					}else{
						$("#second_address").hide();
					}
				});


				// $(document).on('change',"#second_address",function(){
				$("#second_address").change(function(){
					$("#third_address").find("option").remove();
					$("#third_address").hide();
					$("#third_address").show();

					var pid=$(this).val();
					var second=$(this);
					var str='';
					if(pid!=0){
						$.ajax({
							type:'post',
							type:'post',
							url:'getChildAdd',
							data:{'pid':pid},
							success:function(res){
								obj = $.parseJSON(res);
								str+='<option value="0">请选择</option>';
								$.each(obj,function(n,value){
									str+='<option value="'+value.depart_id+'">&nbsp;&nbsp;&nbsp;'+value.name+'</option>';
								});

								$('#third_address').append(str);
							}
						});
					}
				});
			});
		}
	};
	module.exports = main;
});