define(function(require , exports ,module){
	var $ = require('jquery');
	var common = require('common');
	
	require('jquery_validate');
    var tool = require('model/tool');

    var index_validate = function(){
        $('#form_edit').validate($.extend(tool.validate_setting,{
            submitHandler: function (form) {
                tool.formAjax(form,function(data){
                    require.async('base/jtDialog',function(jtDialog){
                        if(data.status != tool.success_code){
                            jtDialog.showTip(data.msg);
                        }else{
                            jtDialog.showTip('保存配置成功',2,function(){
                                location.reload();
                            });
                        }
                    });
                    return false;
                });
            }
        }));
    };

	var main ={
        index : function(){
            index_validate();
        },
	};
	module.exports = main;
});