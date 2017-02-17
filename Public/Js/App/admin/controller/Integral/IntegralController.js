define(function(require , exports ,module){
	var $ = require('jquery');
	var common = require('common');
	
	require('jquery_validate');
    var tool = require('model/tool');

	$.validator.addMethod("credits",function(value,element){
		var num = $("input[name='credits']").val();

		if(num <=0 || num == '-'){
			return false;
		}

		return true;
	},"不能小于0");
	var add_validate = function(){
        $('#seller_postscript').validate($.extend({
            rules: {
				credits:{
                    required: true,
					number:true,
					credits:true
                },
            },
            messages: {
				credits:{
                    required: "余额不能为空",
					number:'必须是数字'
                },
            }
        },tool.validate_setting));
	};
	var edit_validate = function(){
		$('#seller_postscript').validate($.extend({
			rules: {
				credits:{
					required: true,
					digits:true,
					credits:true,
				},
			},
			messages: {
				credits:{
					required: "积分不能空",
					digits:'只能填写整数'
				},
			}
		},tool.validate_setting));
	};
	var set_validate = function(){
		$('#user_edit').validate($.extend({
			rules: {
				consumption_integral:{
					required: true,
					digits:true
				},
				deductible:{
					required: true,
					digits:true
				},
			},
			messages: {
				consumption_integral:{
					required: "余额不能为空",
					digits:"只能填写整数"
				},
				deductible:{
					required: '不能空',
					digits:'只能填写整数'
				},
			}
		},tool.validate_setting));
	};

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
		},
        add : function(){
        },
        edit : function(type){
			if(type){
				edit_validate();
			}else{
				add_validate();
			}
			$('.tag-edit').click(function () {
				$("#user_info").show();
			})
			$('.close ,.closes').click(function(){
				$("#user_info").hide();
			})
	
		},
		set:function () {
			set_validate();
		}
	}
	module.exports = main;
});