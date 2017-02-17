define(function(require , exports ,module){
	var $ = require('jquery');
	var common = require('common');
	
	require('jquery_validate');
    var tool = require('model/tool');
	var main ={
		index : function(){
			var pk_temp;
			$('#changePageSize').bind('keypress',function(event){				
			    if(event.keyCode == "13")    
			    {
			        $('.form-search pull-right').submit();
			    }
		    });
			$('.add_message').click(function(){
				pk_temp= "";
				$('.prompt').text("");
				$("input[name='title']").val("");
				$("input[name='temp_code']").val("");
				$("textarea[name='conten']").val("");
				$('.modal-title').text('添加短信模板');
				$('#message').show();
			})
			$('td a').click(function(){
				$('.prompt').text("");
				if($(this).parent().next().text() == '是'){
					$("input[name=state]:eq(0)").attr("checked",true)
					$("input[class=checked]:eq(1)").attr("checked",false)
				}else{
					$("input[name=state]:eq(1)").attr("checked",true)
					$("input[name=state]:eq(0)").attr("checked",false)
					
				}
				$("input[name='title']").val("");
				$("input[name='temp_code']").val("");
				$("textarea[name='conten']").val("");
				pk_temp = $(this).attr('data');
				$('.modal-title').text('编辑短信模板');
				$("input[name='title']").val($(this).text());
				$("input[name='temp_code']").val($(this).attr('code'));
				$("textarea[name='conten']").val($(this).attr('info'));
				$('#message').show();
			})
			$('.cancel').click(function(){
				$("input[name='title']").val("");
				$("textarea[name='conten']").val("");
				$('#message').hide();
			})
			$("button[type='submit']").click(function(){
				var title = $("input[name='title']").val();
				var temp_code = $("input[name='temp_code']").val();
				var conten = $("textarea[name='conten']").val();
				var status = $(':radio[name="status"]:checked').val();
				$.ajax({
					type:'POST',
					url:'updates',
					data:{pk_temp:pk_temp,title:title,temp_code:temp_code,conten:conten,status:status},
					dataType: "json",
					success:function(data){
						require.async('base/jtDialog',function(jtDialog){
							jtDialog.showTip(data.msg,1);
							location.reload();
						});
					}
				})
			})
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