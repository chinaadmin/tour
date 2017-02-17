define(function(require , exports ,module){
  require('calendar');
	var $ = require('jquery');
	var common = require('common');
	var template = require('template');
	require('jquery_validate');
  require('jquery-json');
	var base = require('base/controller/adminbaseController');
  var tool = require('model/tool');


    jQuery.validator.addMethod("times_required", function(value, element, param) {
        if($('#start_time').val() == ''||$('#end_time').val() == ''){
            return false;
        }
        return true;
    }, "请选择活动时间");
    jQuery.validator.addMethod("price", function(value, element, param) {
        if($('#start_time').val() == ''||$('#end_time').val() == ''){
            return false;
        }
        return true;
    }, "请选择活动时间");

	var edit_validate = function(){
        $('#user_edit').validate($.extend({
          rules: {
              sel_times :{
                  times_required: true,
              },
                promotions_name: {
                  required: true,
                  rangelength:[3,30]
                },
              ordinary_price: {
                  number: true,
                },
              one_price: {
                  number: true,
                },
              family_price: {
                  number: true,
                },
              number: {
                  number: true,
                },
              travel:{
                  number: true,
              }
      				
             
          },
          messages: {
                // promotions_name: {
                //   required: "线路名称不能为空"
                // },
                day: {
                    required: "出发天数不能为空"
                },
                night: {
                    required: "出发晚数不能为空"
                },
                cat_id: {
                    required: "所属分类不能为空"
                },
                traffic: {
                    required: "交通方式不能为空"
                },
                accommodation: {
                    required: "住宿标准不能为空"
                },
                stocks: {
                    required: "每日库存不能为空"
                },
              travel:{
                  required: ""
              }
      				
          }
        },$.extend(tool.validate_setting,{
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
    		}
    	)
    ));
  };
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
    var main = {
         index :function(){
            put_in_time();
            edit_validate();
        },
        discount:function () {
            put_in_time();
            edit_validate();
            $('.discount_add').click(function () {
                var str = ' <div class="controls discount"><span class="help-inline">当产品单价在&nbsp;</span>'
                    +'<input name="min_price[]" class="m-wrap" value="0" style="width: 50px" type="text">~&nbsp;'
                    +'<input name="man_price[]" class="m-wrap" value="0" style="width: 50px" type="text">'
                    +'<span class="help-inline">&nbsp;之间，则价格最低的游客享受&nbsp;</span>'
                    +'<input name="discount[]" class="m-wrap" value="0" style="width: 50px" type="text">'
                    +'<span class="help-inline">&nbsp;折</span>&nbsp;'
                    +'<a class="btn green discount_del">'
                    +'<i class="icon-minus"></i>'
                    +'</a></div>';
                $('.discounts').append(str);
            })
            $('body').on('click','.discount_del',function () {
                $(this).parent('div'). remove();
            })
        }
    };
	
	/**
	 * 时间段
	 */
	main.time_sole = function(){
		require.async("pulgins/bootstrap/datepicker/bootstrap-datepicker",function(){
			$('.start_time').datepicker({
        autoclose:true
      });
      $('.end_time').datepicker({
        autoclose:true
      });
    });
  },

  main.edit=function(){
    edit_validate; //编辑验证
    
    tool.del($('.js-del'));
    tool.saveSort($('#save-sort'));
     
    require.async("pulgins/bootstrap/datepicker/bootstrap-datepicker",function(){
      $('.start_time').datepicker({
				autoclose:true
			});
			$('.end_time').datepicker({
				autoclose:true
			});
		});
		
		/*是否选择儿童*/
    
		$('#childs').click(function(){
			if($(this).parents('span').hasClass('checked')){
			  $('#child-price').show();
			}else{
			  $('#child-price').hide();
			}
		});
		
		if($('#childs').parents('span').hasClass('checked')){
		  $('#child-price').show();
		}else{
		  $('#child-price').hide();
		}
		
   /*判断所选时间是否超过一个月*/
   /*
   $("#end_time").blur( function () { 
    alert("kkkk"); 
  } );
   */


   /*
   $('#end_time').blur(function(){
    alert('kkkk');
    //alert($('#end_time').val());
   })
   */

 function formatDate(now)   {     
              var   year=now.getFullYear();     
              var   month=now.getMonth()+1;     
              var   date=now.getDate();     
              var   hour=now.getHours();     
              var   minute=now.getMinutes();     
              var   second=now.getSeconds();     
              return year+"-"+month+"-"+date;     
              }  

		/*打开日历*/
    var nums=0;
    var childpri=0;
    var adult=0;
    var starttimes=0;
    var endtimes=0;
		$('.rililiston').click(function(){
      //alert(nums);alert(childpri);alert(adult);alert(starttimes);alert(endtimes);
			$('#display-on').show();
      /*
			nums=$('#kucen-num').val();
      childpri=$('#childprice').val();
      adult=$('#adult-price').val();
      starttimes=$('#start_time').val();
      endtimes=$('#end_time').val();
      alert(nums);alert(childpri);alert(adult);alert(starttimes);alert(endtimes);
      */
		});

    /*批量修改*/
    $('#piliang').click(function(){
     //alert('uuuuu');
     $('#checkAll').val('1');   //修改团期的标识

     nums=$('#kucen-num').val();
      childpri=$('#childprice').val();
      adult=$('#adult-price').val();
      starttimes=$('#start_time').val();
      endtimes=$('#end_time').val();
      
      starchuo=Date.parse(new Date(starttimes));//alert(starchuo);
      endchuo=Date.parse(new Date(endtimes));//alert(endchuo);
      var cha=30*24*60*60*1000;
      if((endchuo-starchuo)>cha){
        alert('日期范围不能超过31天');
        endtimes=new Date(parseInt(starchuo+cha));
        endtimes=formatDate(endtimes);
        //alert(endchuo2);
        $('#end_time').val(endtimes);
        //alert($('#end_time').val());
      }
      if(endchuo<starchuo){
        alert('团期结束时间不能小于开始时间');
        return false; 
        //alert($('#end_time').val());
      }
      if(!adult){
        alert('成人价格不能为0');
        return false; 
      }
      if(!starttimes){
        alert('开始时间不能为空');
        return false; 
      }
      if(!endtimes){
        alert('结束时间不能为空');
        return false; 
      }
      if(!childpri){
        childpri=0;
      }
      if(!nums){
        nums=0;
      }
      //alert(starttimes);
      //alert(endtimes);
      var d=new Date(parseInt(starchuo));
      var years=d.getFullYear();
      var months=d.getMonth()+1;

        //c:容器,y:年,m:月,a:出发时间json,f:是否显示双日历,fu:回调调
       var para={'c':'calendarcontainer',
         'y':years,
     'm':months,
     'a':{
       //最早时间
       'd1':starttimes,//最早时间
       'd2':endtimes//最晚时间
       },
     'f':1,//显示双日历用1，单日历用0
     'clickfu':function (to) {//回调函数，to为点击对象，点击日期是调用的函数,参数to为点击的日期的节点对象，可以把用户选定的日期通过此函数存入服务端或cookies，具体请自行编写
               if(to.id!=""){//alert(to.id)
                riqi=to.id;
               }   
       },
     'showFu':function(d){  //回调函数，d为要显示的当前日期，主要用于判断是否要在该日期的格子里显示出指定的内容，在日期格子里额外显示内容的函数,返回值必须为字符串，参数d为显示的日期对象（日期类型）
             var t=new Date();
         if(t.toLocaleDateString()==d.toLocaleDateString()){    
          return "";
         }
         else{
         return "";  
           }
       }     
     }
     
CreateCalendar(para,"para"); //参数前一个是对象，后一个是对象名称

var objlist=$('#calendarcontainer td');
//alert(objlist);
var arrays=new Array();
var hh=0;
objlist.each(function(){
       //alert($(this).find('.acs').attr('data'));
       //var idsst=$(this).find('.acs').attr('data');
      if($(this).find('.acs').hasClass('acs')){
      //alert('点击');
      var objss=$(this);
      //if(!obj==0){
       //$.each(obj,function(n,v){
        //alert((v.date_time*1000));
        //var da=new Date(v.date_time*1000).getDate();
         //alert(da);
       // if(da==idsst){
          //alert(idsst);
          //alert(starchuo);
          //alert(hh);

          //alert(objss.find('.acs').html());
          objss.find('.acs').html('成人：￥'+adult);
          objss.find('.cns').html('儿童：￥'+childpri);
          objss.find('.cnsh').html('余：'+nums);
          objss.find('.acs').attr('rel',adult);
          objss.find('.acs').attr('datass',starchuo);
          objss.find('.cns').attr('rel',childpri);
          objss.find('.cnsh').attr('rel',nums);
          
          arrays[hh]={
         "time":starchuo,
         "adult":adult,
         "child":childpri,
         "stock":nums,
         }

          /*
          arrays['time']=v.date_time*1000;
          arrays['adult']=v.adult_price;
          arrays['child']=v.child_price;
          arrays['stock']=v.stock;
          */
          //arrays['adult']=v.adult_price;
          //arraylist[0]=arrays;
         starchuo+=24*60*60*1000;
         hh++;

      //return false;
     } 
       
        //}

     //})
     //}
      })
 // console.log(arrays);
 arrays=$.toJSON(arrays);
 $('#datetuqi').val(arrays);



})
    
      
         
 

    $('#closedma').click(function(){
       $('#display-on').hide();
    })
    
   
    /*日期控件js*/

     // JavaScript Document
//扎俊 修改版本
//仅做学习研究之用，修改者不承担版权相关责任。
Date.prototype.dateDiff = function (interval, objDate2) { var d = this, i = {}, t = d.getTime(), t2 = objDate2.getTime(); i['y'] = objDate2.getFullYear() - d.getFullYear(); i['q'] = i['y'] * 4 + Math.floor(objDate2.getMonth() / 4) - Math.floor(d.getMonth() / 4); i['m'] = i['y'] * 12 + objDate2.getMonth() - d.getMonth(); i['ms'] = objDate2.getTime() - d.getTime(); i['w'] = Math.floor((t2 + 345600000) / (604800000)) - Math.floor((t + 345600000) / (604800000)); i['d'] = Math.floor(t2 / 86400000) - Math.floor(t / 86400000); i['h'] = Math.floor(t2 / 3600000) - Math.floor(t / 3600000); i['n'] = Math.floor(t2 / 60000) - Math.floor(t / 60000); i['s'] = Math.floor(t2 / 1000) - Math.floor(t / 1000); return i[interval]; }

Date.prototype.DateAdd=function(strInterval,Number){var dtTmp=this;switch(strInterval){case's':return new Date(Date.parse(dtTmp)+(1000*Number));case'n':return new Date(Date.parse(dtTmp)+(60000*Number));case'h':return new Date(Date.parse(dtTmp)+(3600000*Number));case'd':return new Date(Date.parse(dtTmp)+(86400000*Number));case'w':return new Date(Date.parse(dtTmp)+((86400000*7)*Number));case'q':return new Date(dtTmp.getFullYear(),(dtTmp.getMonth())+Number*3,dtTmp.getDate(),dtTmp.getHours(),dtTmp.getMinutes(),dtTmp.getSeconds());case'm':return new Date(dtTmp.getFullYear(),(dtTmp.getMonth())+Number,dtTmp.getDate(),dtTmp.getHours(),dtTmp.getMinutes(),dtTmp.getSeconds());case'y':return new Date((dtTmp.getFullYear()+Number),dtTmp.getMonth(),dtTmp.getDate(),dtTmp.getHours(),dtTmp.getMinutes(),dtTmp.getSeconds());}}

Date.prototype.DateToParse=function(){var d=this;return Date.parse(d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate());}


function CreateCalendar(para,paraJsonName) {//c:容器,y:年,m:月,a:出发时间json,f:是否显示双日历,clickfu:点击事件回调函数,showFu:在日历里显示附加内容的回调函数
    var c=para.c;var y=para.y;
  var m=para.m;
  if(arguments.length!=3){
    var m=para.m;
    }
    else if(arguments[2]=="pre") {
    var m=para.m=para.m-1;      
    }
    else if(arguments[2]=="next"){
    var m=para.m=para.m+1;  
    }
    else{
    var m=para.m; 
    }

  var a=para.a;
  var f=para.f;
  var clickfu=para.clickfu;
  var showFu=para.showFu;
  
    var today = new Date(); 
    today = new Date(today.getFullYear(),today.getMonth(),today.getDate());
    if (y == 0 || m == 0) { y = today.getFullYear(); m = today.getMonth() + 1; };
  //var dmin=Date.parse(a.first().attr('d').replace(/-/g, '/')),dmax =Date.parse(a.last().attr('d').replace(/-/g, '/'));
  var dmin=a.d1.replace(/-/g,"/"),dmax =a.d2.replace(/-/g,"/");
  
    var i1 = 0, i2 = 0, i3 = 0, d2;
  var d1 = new Date(dmin), 
    today = today.DateToParse();
    if (Date.parse(d1.getFullYear() + '/' + (d1.getMonth() + 1) + '/1') > Date.parse(new Date(y,m-1,1))) {
        y = d1.getFullYear(); m = d1.getMonth() + 1;
   }
    $('#' + c).html('');
  //农历
  var ca=new Calendar();
  tmp='';   
  for(var i=0;i<=f;i++){
    d1=new Date(y,m-1+i);
    y=d1.getFullYear();
    m=d1.getMonth() + 1;
    
    tmp += '<table cellpadding="0">';
    tmp += '<tr class="month"><th colspan="7"><div class="clearfix"><div class="prevMonth">';
    if(i==0){
      i1=Date.parse(y + '/' + m + '/1');
      d1 = new Date(dmin);
      if(Date.parse(d1.getFullYear() + '/' + (d1.getMonth() + 1) + '/1')<i1){
        d1 = new Date(y,m-2-f,1);
        tmp += '<a class="prev" href="javascript:;" onclick="CreateCalendar(' + paraJsonName + ',\'' + paraJsonName + '\',\'pre\');" title="上个月">&nbsp;</a>';
      }else{
        tmp += '<a class="prev0" href="javascript:;" title="上个月">&nbsp;</a>';
      }
    }
    tmp+='</div>';
    tmp += '<div class="dates"><em>' + y + '</em>年<em>' + m + '</em>月</div>';
    tmp+='<div class="nextMonth">';
    if(i==f){
      i1=Date.parse(y + '/' + m + '/1');
      d1 = new Date(dmax);
      i2=Date.parse(d1.getFullYear() + '/' + (d1.getMonth() + 1) + '/1');
      if(i2>i1){
        d1 = new Date(y,Date.parse(new Date(y,m+1,1))>i2?m-f:m,1);
        tmp += '<a class="next" href="javascript:;" onclick="CreateCalendar(' + paraJsonName + ',\'' + paraJsonName + '\',\'next\');" title="下个月">&nbsp;</a>';
      }else{
        tmp += '<a class="next0" href="javascript:;" title="下个月">&nbsp;</a>';
      }
    }
    tmp += '</div></div></th></tr>';
    tmp += '  <tr class="week">';
    tmp += '    <th class="weekEnd">星期日</th>';
    tmp += '    <th>星期一</th>';
    tmp += '    <th>星期二</th>';
    tmp += '    <th>星期三</th>';
    tmp += '    <th>星期四</th>';
    tmp += '    <th>星期五</th>';
    tmp += '    <th class="weekEnd">星期六</th>';
    tmp += '  </tr>';
    var maxdays = (new Date(Date.parse(new Date(y,m,1)) - 86400000)).getDate();  //当前月的天数
    d1 = new Date(y,m-1); //要显示的日期
    i1 = d1.getDay(); //这个月的第一天是星期几
    //alert('ppp');
    //var zhi=1;
    for (var j = 1; j <= 6; j++) {
      tmp += '<tr>';
      for (var k = 1; k <= 7; k++) {
        i2 = (j - 1) * 7 + k - i1;
        if (i2 < 1 || i2 > maxdays) {
          tmp += '<td class="aba"></td>';
        } else {
          i3 = Date.parse(new Date(y,m-1,i2));
          d1=new Date(i3);
          //农历(ll的值为农历)
          //ca=new Calendar(y,m-1,i2)
          var ll=ca.getlf(d1);
          if(ll==''){
            ll=ca.getsf(d1);
            if(ll==''){
              ll=ca.getst(d1) ;
              if(ll=='')ll=ca.getls(d1)[3];
            }
          }
          tmp+='<td '
          if (today == i3){tmp+=' class="cur"'};
          var dmins=Date.parse(new Date(dmin));
          var dmaxs=Date.parse(new Date(dmax));
          
          if (i3 < dmins || i3 > dmaxs) {
            
            tmp+=' class="curs"'
            tmp += '><p><em>' + i2 + '</em></td>';
          } else {
            
            
            tmp += ' week="' + (k - 1) + '" id="' + y + '-' + m + '-' + i2 + '" title="' + ca.getl(d1,false) + ' ' + ca.getst(d1) + ' ' + ca.getsf(d1) + ' ' + ca.getlf(d1) +'"><p><em>' + i2 + '</em><em class="nl">' +  ll + '</em><br/><em class=" acs hides" rel=" " data="'+i2+'" datass=" "> </em><br/><em class=" cns hides" rel=" " data="'+i2+'"> </em><br/><em class=" cnsh hides" rel=" " data="'+i2+'"> </em>' + (function (t){if($.isFunction(showFu)){return showFu(t);}else{return ""}}(new Date(y,m-1,i2))) +'</p></td>';
            
          }
          
        }
      }
      tmp += '</tr>';
    }
    tmp += '</table>';
  
  }
    $('#' + c).append(tmp);
    if ($.isFunction(clickfu)){
    //fu(this);
    $('#' + c +' td').click(function (){
     if(!$(this).find('.acs').hasClass('acs')){
      //alert('不能点击');
      return false;
     } 
      clickfu(this);
      //alert(riqi);
      var bigid=$(this).find('.acs').attr('data');
      //alert(bigid);
      //alert($(this).html());
      $('#' + c +' td').removeClass('cur');
      //$('#' + c +' td').find('.hides').hide();

      $(this).addClass('cur');
      //alert($(this).find('.acn').html());
      //var bigprice=$(this).find('.hides').show();
      $('.cur').find('.hides').show();
      var bigprice=$(this).find('.acs').attr('rel');
      var idtt=$(this).find('.acs').attr('datass');
      var minprice=$(this).find('.cns').attr('rel');
      var nums=$(this).find('.cnsh').attr('rel');
       $('#idsss').val(idtt);
      $('#manjiage').val(bigprice);
      $('#childjiage').val(minprice);
      $('#kucen').val(nums);
      
      
      //alert('kkk');
      $('#tanchuss').css('display','block');
      $('#zzjs_net').css('display','block');
      $(document.body).css('overflow','hidden');
      $('#edittitles span').html('('+riqi+')');
      
      //alert(bigprice);
    }).hover(  function () {
      $(this).addClass("hover");
      
      
      $(this).find('.hides').show();
      
    var isture=$(this).find('.acs').attr('rel');
    //alert(isture);
      if(isture==" "){
        //alert('111');
         var bigid=$(this).find('.acs').attr('data');
      objss=$(this);
      //alert(bigid);
      $.each(obj,function(n,v){
        var da=new Date(v.date_time*1000).getDate();
        if(da==bigid){
          //alert('ppp');
          //alert(v.gd_id);
          objss.find('.acs').html('成人：￥'+v.adult_price);
          objss.find('.cns').html('儿童：￥'+v.child_price);
          objss.find('.cnsh').html('余：'+v.stock);
          objss.find('.acs').attr('rel',v.adult_price);
          objss.find('.acs').attr('datass',v.gd_id);
          objss.find('.cns').attr('rel',v.child_price);
          objss.find('.cnsh').attr('rel',v.stock);
        }
     })
      }else{
         //alert('222');
          var bigprice=$(this).find('.acs').attr('rel');
          var minprice=$(this).find('.cns').attr('rel');
          var nums=$(this).find('.cnsh').attr('rel');
          $(this).find('.acs').html('成人：￥'+bigprice);
          $(this).find('.cns').html('儿童：￥'+minprice);
          $(this).find('.cnsh').html('余：'+nums);
      }
      

      },
      function () {
      //$(this).removeClass("hover");
      //$(this).removeClass('cur');
      //$(this).find('.hides').hide();
      //$('.cur').find('.hides').show();
    
     
      
      }
    );

    $(document).ready(function(){
  
      //alert(bigid);
      var objlist=$('#calendarcontainer td');
      var arrays=[];
      //var arrays={};
      var ff=0;
      objlist.each(function(){
       //alert($(this).find('.acs').attr('data'));
       var idsst=$(this).find('.acs').attr('data');
       //console.log(idsst);
       var objss=$(this);
      //if(!obj==0){
      //var ids=0;
      
       $.each(obj,function(n,v){
        //alert((v.date_time*1000));
        var da=new Date(v.date_time*1000).getDate();
         //console.log(da);
         
        if(da==idsst){
          //console.log(idsst);
          //console.log(v.date_time);

          //arrays={
          /*
          arrays[v.date_time*1000]=new Array();
          //arrays['time']=v.date_time*1000;
          arrays[v.date_time*1000]['adult']=v.adult_price;
          arrays[v.date_time*1000]['child']=v.child_price;
          arrays[v.date_time*1000]['stock']=v.stock;
          */

         /*
         "time":v.date_time*1000,
         "adult":v.adult_price,
         "child":v.child_price,
         "stock":v.stock,
        };
         */
        arrays[ff]={
         //"id":v.gd_id,
         "time":v.date_time*1000,
         "adult":v.adult_price,
         "child":v.child_price,
         "stock":v.stock,
         }
          /*
          arrays['time']=v.date_time*1000;
          arrays['adult']=v.adult_price;
          arrays['child']=v.child_price;
          arrays['stock']=v.stock;
          */
          //arrays['adult']=v.adult_price;
          //arraylist[0]=arrays;
         
          
          objss.find('.acs').html('成人：￥'+v.adult_price);
          objss.find('.cns').html('儿童：￥'+v.child_price);
          objss.find('.cnsh').html('余：'+v.stock);
          objss.find('.acs').attr('rel',v.adult_price);
          objss.find('.acs').attr('datass',v.date_time*1000);
          objss.find('.cns').attr('rel',v.child_price);
          objss.find('.cnsh').attr('rel',v.stock);
          //ids++;
          ff++
          //console.log(ff);
        }

     })
     //}
      })
      //alert(typeof(arrays));
      // console.log(arrays);
      //console.log(arrays.length);
      //var arr=arrays
      //arrays=$.parseJSON(arrays);
      arrays=$.toJSON(arrays);
      //arrays=$(arrays).serializeArray();
       //console.log(arrays);
      $('#datetuqi').val(arrays);
   //alert($('#datetuqi').val());
});
  }
}
function closenum(){
$('#tanchuss').css('display','none');
$('#zzjs_net').css('display','none');
$(document.body).css("overflow","visible"); 
}
$('#edittitles a').click(function(){
  closenum();
})
$('#send_form').live('click',function(){
  //var datas=$('#formdataymy input').serializeArray();
  var gd_id=$('#idsss').val();
  //console.log(gd_id);
  var manjiage=$('#manjiage').val();
  var childjiage=$('#childjiage').val();
  var kucen=$('#kucen').val();
  //alert(gd_id);
  //var datass=$('#formdataymy').html();
 /*
  tool.doAjax({
        url:common.U('Product/updateDate'),
        data:{'gd_id':gd_id,'adult_price':manjiage,'child_price':childjiage,'stock':kucen}
      },function(result){
       
        //alert(result.adult_price);
        //alert($('.cur').html());
        $('.cur').find('.acs').html('成人：￥'+result.adult_price);
        $('.cur').find('.cns').html('儿童：￥'+result.child_price);
        $('.cur').find('.cnsh').html('余：'+result.stock);
        $('.cur').find('.acs').attr('rel',result.adult_price);
        $('.cur').find('.cns').attr('rel',result.child_price);
        $('.cur').find('.cnsh').attr('rel',result.stock);
      
     //window.location.reload();

  //console.log(strss);
      });
*/
var inputlist=$("#datetuqi").val();
inputlist=$.parseJSON(inputlist);
$.each(inputlist,function(n,v){
  // console.log(v);
  if(gd_id==v.time){
    //alert('kkk');
    v.adult=manjiage;
    v.child=childjiage;
    //alert(v.stock);
    v.stock=kucen;
    //alert(v.stock);
  }
});
//return false;
inputlist=$.toJSON(inputlist);
$("#datetuqi").val(inputlist);
 $('.cur').find('.acs').html('成人：￥'+manjiage);
    $('.cur').find('.cns').html('儿童：￥'+childjiage);
    $('.cur').find('.cnsh').html('余：'+kucen);
    $('.cur').find('.acs').attr('rel',manjiage);
    $('.cur').find('.cns').attr('rel',childjiage);
    $('.cur').find('.cnsh').attr('rel',kucen);
    // alert('修改成功');
closenum();
})
$('#del_form').click(function(){
  closenum();
})

function getJsonLength(jsonData){

var jsonLength = 0;

for(var item in jsonData){

jsonLength++;

}

return jsonLength;

}



var riqi="";

    var dateList = $('#dateList').val();
    //alert(dateList);
    if(dateList){
      //alert(dateList);
      //alert('no');
      //var obj=0;
    //}else{
     var obj=$.parseJSON(dateList);
     //alert(typeof(obj));
     //console.log(obj[0].date_time);
     var d=new Date(parseInt(obj[0].date_time) * 1000);
     var numss=getJsonLength(obj);
     //alert(numss);
     var ds=new Date(parseInt(obj[numss-1].date_time) * 1000);
      //alert(ds);
      var years=d.getFullYear();
      var months=d.getMonth()+1;    
      var monthss = ds.getMonth()+1;
      var stime=formatDate(d);
      var etime=formatDate(ds);
      //alert(stime);alert(etime);
       var cal = 1;//默认双日历显示
        //判断是单日历显示还是双日历显示
        if(months == monthss){
            cal = 0;
        };

        $('#start_time').val(stime);
        $('#end_time').val(etime);
 
       //c:容器,y:年,m:月,a:出发时间json,f:是否显示双日历,fu:回调调
       var para={'c':'calendarcontainer',
         'y':years,
     'm':months,
     'a':{
       //最早时间
       'd1':stime,//最早时间
       'd2':etime//最晚时间
       },
     'f':cal,//显示双日历用1，单日历用0
     'clickfu':function (to) {//回调函数，to为点击对象，点击日期是调用的函数,参数to为点击的日期的节点对象，可以把用户选定的日期通过此函数存入服务端或cookies，具体请自行编写
               if(to.id!=""){//alert(to.id)
                riqi=to.id;
               }   
       },
     'showFu':function(d){  //回调函数，d为要显示的当前日期，主要用于判断是否要在该日期的格子里显示出指定的内容，在日期格子里额外显示内容的函数,返回值必须为字符串，参数d为显示的日期对象（日期类型）
             var t=new Date();
         if(t.toLocaleDateString()==d.toLocaleDateString()){    
          return "";
         }
         else{
         return "";  
           }
       }     
     }
     
CreateCalendar(para,"para"); //参数前一个是对象，后一个是对象名称

    }else{
      //alert('kkk');
      var d=new Date();
      var years=d.getFullYear();
      var months=d.getMonth()+1;
      var stime=formatDate(d);
     //var ds=new Date(parseInt(obj[29].date_time) * 1000);
     d=Date.parse(d);//alert(starchuo);
      //endchuo=Date.parse(new Date(endtimes));//alert(endchuo);
      var cha=30*24*60*60*1000;
    var ds=new Date(parseInt(d+cha));
      //alert(d);
          
      
      
      var etime=formatDate(ds);
      //alert(stime);alert(etime);
      dateList=[];
      for(i=0;i<30;i++){
        
        dateList[i]={
         "time":d,
         "adult":0,
         "child":0,
         "stock":0,
        }
        //alert(i);
        d+=24*60*60*1000;
         //hh++;
      }
      //alert(dateList);//return false;
      dateList=$.toJSON(dateList);
      var obj=$.parseJSON(dateList);
      //c:容器,y:年,m:月,a:出发时间json,f:是否显示双日历,fu:回调调
       var para={'c':'calendarcontainer',
         'y':years,
     'm':months,
     'a':{
       //最早时间
       'd1':stime,//最早时间
       'd2':etime//最晚时间
       },
     'f':1,//显示双日历用1，单日历用0
     'clickfu':function (to) {//回调函数，to为点击对象，点击日期是调用的函数,参数to为点击的日期的节点对象，可以把用户选定的日期通过此函数存入服务端或cookies，具体请自行编写
               if(to.id!=""){//alert(to.id)
                riqi=to.id;
               }   
       },
     'showFu':function(d){  //回调函数，d为要显示的当前日期，主要用于判断是否要在该日期的格子里显示出指定的内容，在日期格子里额外显示内容的函数,返回值必须为字符串，参数d为显示的日期对象（日期类型）
             var t=new Date();
         if(t.toLocaleDateString()==d.toLocaleDateString()){    
          return "";
         }
         else{
         return "";  
           }
       }     
     }
     
CreateCalendar(para,"para"); //参数前一个是对象，后一个是对象名称
    }
   
   
  /*日期控件js*/

		
		/*选择出发点地址*/
		/*打开选择*/
		var xiabiao='';
		$('.new-sels').click(function(){
      //alert('kkkk');
			xiabiao=$(this).attr('rel');
            $('#gg'+xiabiao).css('display','block');
            $('#star-address'+xiabiao).empty();
            $('#span-content'+xiabiao).empty();
            var str="<div class='select-input'><ul>";
				
			tool.doAjax({
				url:common.U('Product/getChildAddress'),
				data:{'pid':0}
			},function(result){
				$.each(result,function(n,v){
					//console.log(result);
          //alert(result);
					str+='<li><label class="checkbox inline"><input type="checkbox" class="checkss" rel="'+v.name+'" dataid="'+v.pid+'" name="depart_id'+xiabiao+'[]" value="'+v.depart_id+'">'+v.name+'</label><a href="javascript:" class="third_add display'+v.num+'" depart_id="'+v.depart_id+'" rel="'+v.depart_id+'" ><span class="badge badge-info">'+v.num+'</span></a></li>';
				});
				
				str+="</ul></div>";
        //alert(str);
				$('#span-content'+xiabiao).append(str);
			});	

		});
		
        /*打开选择*/
        /*载入子元素*/
		$('.third_add').live('click',function(){
			var ids=$(this).attr('rel');
			//alert(ids);
			var objs=$(this).parents('.select-input');
			objs.nextAll().remove();
			var str="<div class='select-input'><ul>";
		   
			tool.doAjax({
				url:common.U('Product/getChildAddress'),
				data:{'pid':ids}
			},function(result){
				$.each(result,function(n,v){
					str+='<li><label class="checkbox inline"><input type="checkbox" class="checkss" rel="'+v.name+'" dataid="'+v.pid+'" name="depart_id'+xiabiao+'[]" value="'+v.depart_id+'">'+v.name+'</label><a href="javascript:" class="third_add display'+v.num+'" depart_id="'+v.depart_id+'" rel="'+v.depart_id+'" ><span class="badge badge-info">'+v.num+'</span></a></li>';
				});
				
				str+="</ul></div>";
				$('#span-content'+xiabiao).append(str);
			});
		});
		
        /*载入子元素*/
        /*选中或删除*/ 
        $('.span-content .checkss').live('click',function(){
         	//alert($(this).val());
         	 if($(this).attr("checked")){
         	 	//alert('kk');
                   $(this).removeAttr("checked");
                      var vals=$(this).val();
                         $('#star-address'+xiabiao+' button').each(function(){
                             if($(this).attr('rel')==vals){
                                 $(this).nextAll().remove();
                                 $(this).remove();
                                 
                             }
                           }) 
                      
                      var allcheck=$(this).parents('.select-input').nextAll().find('.checkss');
                      //alert(allcheck);
                      allcheck.each(function(){
                       $(this).removeAttr("checked");
                      })
                        }else{
                           var arraylist=new Array();
                           var but="";
                           $(this).attr("checked",'true');
                           var vals=$(this).val();
                           var rels=$(this).attr('rel');
                           var pids=$(this).attr('dataid');

                           var objlist1=$(this).parents('.select-input').prev().find('.checkss');
                              
                              objlist1.each(function(){
                           	    if($(this).val()==pids){
                                   var vals1=$(this).val();
                               var rels1=$(this).attr('rel');
                               var pids1=$(this).attr('dataid');
                                 
                               $(this).attr("checked",'true');
                               //alert(rels1);
                               var objlist2=$(this).parents('.select-input').prev().find('.checkss');
                                  objlist2.each(function(){
                           	        if($(this).val()==pids1){
                           		       var vals2=$(this).val();
                                       var rels2=$(this).attr('rel');
                                       var pids2=$(this).attr('dataid');
                                       $(this).attr("checked",'true');
                                        var objlist3=$(this).parents('.select-input').prev().find('.checkss');
                                        objlist3.each(function(){
                                        	if($(this).val()==pids2){
                                        		 var vals3=$(this).val();
                                                var rels3=$(this).attr('rel');
                                                var pids3=$(this).attr('dataid');
                                                $(this).attr("checked",'true');
                                                var arrays=new Array();
                                                arrays['id']=vals3;
                                                arrays['name']=rels3;
                                                arraylist[3]=arrays;
                                                //alert(arrays);
                                                //but+="<button class='btn' type='button' rel='"+vals3+"'>"+rels3+"<i class='icon-remove'></i></button>";
                                        	}
                                        })
                                        var arrays=new Array();
                                        arrays['id']=vals2;
                                        arrays['name']=rels2;
                                        arraylist[2]=arrays;
                           	}	
                           })
                            var arrays=new Array();
                            arrays['id']=vals1;
                            arrays['name']=rels1;
                           arraylist[1]=arrays;
                           	}
                           })
                            var arrays=new Array();
                            arrays['id']=vals;
                            arrays['name']=rels;
                           arraylist[0]=arrays;
                           
                           $("#star-address"+xiabiao+" button").each(function(){
                             var nowid=$(this).attr('rel');
                            
                             $.each(arraylist,function(n,row){
                           	      
                           	     if(row["id"]==nowid){
                           	     arraylist.splice($.inArray(row['id'],arraylist),1);
                           	     }
                                 
                           })
                              
                           })
                           arraylist.reverse();
                           var allstr="";
                           $.each(arraylist,function(n,row){
                           	   allstr +="<button class='btn' type='button' rel='"+row["id"]+"'>"+row["name"]+"</button>"; 
                           })
                          $('#star-address'+xiabiao).append(allstr);
                   }
        });
        /*选中或删除*/ 
        /*按钮删除*/
        /*
        $('#star-address button').live('click',function(){
        	//alert($(this).html());

        	var relsid=$(this).attr('rel');
        	//alert(relsid);
        	$('#span-content .checkss').each(function(){
                if($(this).val()==relsid){
                	//alert($(this).attr('rel'));
                	$(this).removeAttr("checked");
                	var allche=$(this).parents('.select-input').nextAll().find('.checkss');
                	allche.each(function(){
                       $(this).removeAttr("checked");
                      })
                }
        	})
        	$(this).nextAll().remove();
        	$(this).remove();
        })
            */
        /*提交*/
        $('.weizhit').live('click',function(){
          var strs="";
          $("#star-address"+xiabiao+" button").each(function(){
          var ids=$(this).attr('rel');
          var names=$(this).text();
          strs+='<label class="checkbox inline"><input type="checkbox" class="checkss" rel="'+names+'" checked="true" onclick="return false;" name="depart_ids[]" value="'+ids+'">'+names+'</label>';
          })
          $('#inp-checkboxs').empty();
          $('#inp-checkboxs').append(strs);
          clocks();
        })
       /*提交*/
        $('.weizhitmd').live('click',function(){
          var strs="";
          $("#star-address"+xiabiao+" button").each(function(){
          var ids=$(this).attr('rel');
          var names=$(this).text();
          strs+='<label class="checkbox inline"><input type="checkbox" class="checkss" rel="'+names+'" checked="true" onclick="return false;"  name="depart_idsmd[]" value="'+ids+'">'+names+'</label>';
          })
          $('#inp-checkboxsmd').empty();
          $('#inp-checkboxsmd').append(strs);
          clocks();
        })

        /*取消*/
         $('.weizhits').live('click',function(){
          clocks();
        })
         /*
         全选或等
         $('.selsall').live('click',function(){
         	//alert('kkk');
         	$('#span-content').find('.checkss').prop("checked",true);
         })
         全部
         $('.sesall').live('click',function(){
         	//alert('kkk');
         	var obj=$('#span-content .select-input').first();
         	obj.nextAll().hide();
         })
         反选
         $('.noselsall').live('click',function(){
            $('#span-content .checkss').each(function(){
             if($(this).prop("checked")){
               	   //alert($(this).val());
                   $(this).removeAttr("checked");
                           }else{
                           	//alert($(this).val());
                           $(this).prop("checked",'true');
                            }            
         	})
         })
         */
		function clocks(){
         $('#gg'+xiabiao).css('display','none');
         //$(document.body).css("overflow","visible");	
        }
        $('.span-height a').click(function(){
          clocks();
        })
	   /*选择出发点地址*/

	},
		
	module.exports = main;
});