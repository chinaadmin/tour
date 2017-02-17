define(function(require, exports, module) {
    require('calendar');
    var $ = require('jquery');
    var common = require('common');
    var template = require('template');
    require('jquery_validate');
    require('jquery-json');
    var base = require('base/controller/adminbaseController');
    var tool = require('model/tool');

    var main = {};
     main.edit = function() {
        var html = '',
            j = 1,
            k = $("#tab_3 h4").length;
        require.async("pulgins/bootstrap/datepicker/bootstrap-datepicker",
            function() {
                $('.start_time').datepicker({
                    autoclose: true
                });
                $('.end_time').datepicker({
                    autoclose: true
                });
            });
        function formatDate(now) {
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var date = now.getDate();
            var hour = now.getHours();
            var minute = now.getMinutes();
            var second = now.getSeconds();
            return year + "-" + month + "-" + date;
        }

        /*打开日历*/
        var nums = 0;
        var childpri = 0;
        var adult = 0;
        var starttimes = 0;
        var endtimes = 0;
        /*日期控件js*/

        // JavaScript Document
        //扎俊 修改版本
        //仅做学习研究之用，修改者不承担版权相关责任。
        Date.prototype.dateDiff = function(interval, objDate2) {
            var d = this,
                i = {},
                t = d.getTime(),
                t2 = objDate2.getTime();
            i['y'] = objDate2.getFullYear() - d.getFullYear();
            i['q'] = i['y'] * 4 + Math.floor(objDate2.getMonth() / 4) - Math.floor(d.getMonth() / 4);
            i['m'] = i['y'] * 12 + objDate2.getMonth() - d.getMonth();
            i['ms'] = objDate2.getTime() - d.getTime();
            i['w'] = Math.floor((t2 + 345600000) / (604800000)) - Math.floor((t + 345600000) / (604800000));
            i['d'] = Math.floor(t2 / 86400000) - Math.floor(t / 86400000);
            i['h'] = Math.floor(t2 / 3600000) - Math.floor(t / 3600000);
            i['n'] = Math.floor(t2 / 60000) - Math.floor(t / 60000);
            i['s'] = Math.floor(t2 / 1000) - Math.floor(t / 1000);
            return i[interval];
        }

        Date.prototype.DateAdd = function(strInterval, Number) {
            var dtTmp = this;
            switch (strInterval) {
                case 's':
                    return new Date(Date.parse(dtTmp) + (1000 * Number));
                case 'n':
                    return new Date(Date.parse(dtTmp) + (60000 * Number));
                case 'h':
                    return new Date(Date.parse(dtTmp) + (3600000 * Number));
                case 'd':
                    return new Date(Date.parse(dtTmp) + (86400000 * Number));
                case 'w':
                    return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));
                case 'q':
                    return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number * 3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
                case 'm':
                    return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
                case 'y':
                    return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
            }
        }

        Date.prototype.DateToParse = function() {
            var d = this;
            return Date.parse(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate());
        }

        function CreateCalendar(para, paraJsonName) { //c:容器,y:年,m:月,a:出发时间json,f:是否显示双日历,clickfu:点击事件回调函数,showFu:在日历里显示附加内容的回调函数
            var c = para.c;
            var y = para.y;
            var m = para.m;
            if (arguments.length != 3) {
                var m = para.m;
            } else if (arguments[2] == "pre") {
                var m = para.m = para.m - 1;
            } else if (arguments[2] == "next") {
                var m = para.m = para.m + 1;
            } else {
                var m = para.m;
            }

            var a = para.a;
            var f = para.f;
            var clickfu = para.clickfu;
            var showFu = para.showFu;

            var today = new Date();
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            if (y == 0 || m == 0) {
                y = today.getFullYear();
                m = today.getMonth() + 1;
            };
            var dmin = a.d1.replace(/-/g, "/"),
                dmax = a.d2.replace(/-/g, "/");

            var i1 = 0,
                i2 = 0,
                i3 = 0,
                d2;
            var d1 = new Date(dmin),
                today = today.DateToParse();
            if (Date.parse(d1.getFullYear() + '/' + (d1.getMonth() + 1) + '/1') > Date.parse(new Date(y, m - 1, 1))) {
                y = d1.getFullYear();
                m = d1.getMonth() + 1;
            }
            $('#' + c).html('');
            //农历
            var ca = new Calendar();
            tmp = '';
            for (var i = 0; i <= f; i++) {
                d1 = new Date(y, m - 1 + i);
                y = d1.getFullYear();
                m = d1.getMonth() + 1;

                tmp += '<table cellpadding="0">';
                tmp += '<tr class="month"><th colspan="7"><div class="clearfix"><div class="prevMonth">';
                if (i == 0) {
                    i1 = Date.parse(y + '/' + m + '/1');
                    d1 = new Date(dmin);
                    if (Date.parse(d1.getFullYear() + '/' + (d1.getMonth() + 1) + '/1') < i1) {
                        d1 = new Date(y, m - 2 - f, 1);
                        tmp += '<a class="prev" href="javascript:;" onclick="CreateCalendar(' + paraJsonName + ',\'' + paraJsonName + '\',\'pre\');" title="上个月">&nbsp;</a>';
                    } else {
                        tmp += '<a class="prev0" href="javascript:;" title="上个月">&nbsp;</a>';
                    }
                }
                tmp += '</div>';
                tmp += '<div class="dates"><em>' + y + '</em>年<em>' + m + '</em>月</div>';
                tmp += '<div class="nextMonth">';
                if (i == f) {
                    i1 = Date.parse(y + '/' + m + '/1');
                    d1 = new Date(dmax);
                    i2 = Date.parse(d1.getFullYear() + '/' + (d1.getMonth() + 1) + '/1');
                    if (i2 > i1) {
                        d1 = new Date(y, Date.parse(new Date(y, m + 1, 1)) > i2 ? m - f: m, 1);
                        tmp += '<a class="next" href="javascript:;" onclick="CreateCalendar(' + paraJsonName + ',\'' + paraJsonName + '\',\'next\');" title="下个月">&nbsp;</a>';
                    } else {
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
                var maxdays = (new Date(Date.parse(new Date(y, m, 1)) - 86400000)).getDate(); //当前月的天数
                d1 = new Date(y, m - 1); //要显示的日期
                i1 = d1.getDay(); //这个月的第一天是星期几
                for (var j = 1; j <= 6; j++) {
                    tmp += '<tr>';
                    for (var k = 1; k <= 7; k++) {
                        i2 = (j - 1) * 7 + k - i1;
                        if (i2 < 1 || i2 > maxdays) {
                            tmp += '<td class="aba"></td>';
                        } else {
                            i3 = Date.parse(new Date(y, m - 1, i2));
                            d1 = new Date(i3);
                            //农历(ll的值为农历)
                            //ca=new Calendar(y,m-1,i2)
                            var ll = ca.getlf(d1);
                            if (ll == '') {
                                ll = ca.getsf(d1);
                                if (ll == '') {
                                    ll = ca.getst(d1);
                                    if (ll == '') ll = ca.getls(d1)[3];
                                }
                            }
                            tmp += '<td '
                            if (today == i3) {
                                tmp += ' class="cur"'
                            };
                            var dmins = Date.parse(new Date(dmin));
                            var dmaxs = Date.parse(new Date(dmax));

                            if (i3 < dmins || i3 > dmaxs) {

                                tmp += ' class="curs"';
                                tmp += '><p><em>' + i2 + '</em></td>';
                            } else {

                                tmp += ' week="' + (k - 1) + '" id="' + y + '-' + m + '-' + i2 + '" title="' + ca.getl(d1, false) + ' ' + ca.getst(d1) + ' ' + ca.getsf(d1) + ' ' + ca.getlf(d1) + '"><p><em>' + i2 + '</em><em class="nl">' + ll + '</em><br/><em class=" acs hides" rel=" " data="' + i2 + '" datass=" "> </em><br/><em class=" cns hides" rel=" " data="' + i2 + '"> </em><br/><em class=" cnsh hides" rel=" " data="' + i2 + '"> </em>' + (function(t) {
                                        if ($.isFunction(showFu)) {
                                            return showFu(t);
                                        } else {
                                            return ""
                                        }
                                    } (new Date(y, m - 1, i2))) + '</p></td>';

                            }

                        }
                    }
                    tmp += '</tr>';
                }
                tmp += '</table>';

            }
            $('#' + c).append(tmp);
            if ($.isFunction(clickfu)) {

                $('#' + c + ' td').click(function() {
/*                    if (!$(this).find('.acs').hasClass('acs')) {
                        return false;
                    }*/
                    clickfu(this);
                    var bigid = $(this).find('.acs').attr('data');
                    $('#' + c + ' td').removeClass('cur');
                    $(this).addClass('cur');
                    $('.cur').find('.hides').show();
                    var bigprice = $(this).find('.acs').attr('rel');
                    var idtt = $(this).find('.acs').attr('datass');
                    var minprice = $(this).find('.cns').attr('rel');
                    var nums = $(this).find('.cnsh').attr('rel');
                    $('#idsss').val(idtt);
                    $('#manjiage').val(bigprice);
                    $('#childjiage').val(minprice);
                    $('#kucen').val(nums);
                    $("#data").val(riqi);
                    $(document.body).css('overflow', 'hidden');
                    $('#edittitles span').html('(' + riqi + ')');

                }).hover(function() {
                        $(this).addClass("hover");

                        $(this).find('.hides').show();

                        var isture = $(this).find('.acs').attr('rel');
                        if (isture == " ") {
                            var bigid = $(this).find('.acs').attr('data');
                            objss = $(this);
                            $.each(obj,
                                function(n, v) {
                                    var da = new Date(v.date_time * 1000).getDate();
                                    if (da == bigid) {
                                        objss.find('.acs').html('成人：￥' + v.adult_price);
                                        objss.find('.cns').html('儿童：￥' + v.child_price);
                                        objss.find('.cnsh').html('余：' + v.stock);
                                        objss.find('.acs').attr('rel', v.adult_price);
                                        objss.find('.acs').attr('datass', v.gd_id);
                                        objss.find('.cns').attr('rel', v.child_price);
                                        objss.find('.cnsh').attr('rel', v.stock);
                                    }
                                })
                        } else {
                            var bigprice = $(this).find('.acs').attr('rel');
                            var minprice = $(this).find('.cns').attr('rel');
                            var nums = $(this).find('.cnsh').attr('rel');
                            $(this).find('.acs').html('成人：￥' + bigprice);
                            $(this).find('.cns').html('儿童：￥' + minprice);
                            $(this).find('.cnsh').html('余：' + nums);
                        }

                    },
                    function() {
                        //$(this).removeClass("hover");
                        //$(this).removeClass('cur');
                        //$(this).find('.hides').hide();
                        //$('.cur').find('.hides').show();
                    });

                $(document).ready(function() {
                    $('#display-on').show();
                    $('.get-date').click(function () {
                        var goodsid = $('input[name="goodsid"]').val();
                        var uid = $('input[name="uid"]').val();
                        var outdate = $('#data').val();
                        var kucun = $('#kucen').val();
                        if(kucun){
                            window.location.href=common.U('Order/addOrderMsg',{goods_id:goodsid,uid:uid,outdate:outdate,kucun:kucun});
                        }
                    });
                    var objlist = $('#calendarcontainer td');
                    var arrays = [];
                    var ff = 0;
                    objlist.each(function() {
                        var idsst = $(this).find('.acs').attr('data');
                        var objss = $(this);
                        $.each(obj,
                            function(n, v) {
                                var da = new Date(v.date_time * 1000).getDate();
                                if (da == idsst) {
                                    arrays[ff] = {
                                        "time": v.date_time * 1000,
                                        "adult": v.adult_price,
                                        "child": v.child_price,
                                        "stock": v.stock,
                                    }
                                    objss.find('.acs').html('成人：￥' + v.adult_price);
                                    objss.find('.cns').html('儿童：￥' + v.child_price);
                                    objss.find('.cnsh').html('余：' + v.stock);
                                    objss.find('.acs').attr('rel', v.adult_price);
                                    objss.find('.acs').attr('datass', v.date_time * 1000);
                                    objss.find('.cns').attr('rel', v.child_price);
                                    objss.find('.cnsh').attr('rel', v.stock);
                                    ff++
                                }

                            })
                    })
                    arrays = $.toJSON(arrays);
                    $('#datetuqi').val(arrays);
                });
            }
        }
        function closenum() {
            $(document.body).css("overflow", "visible");
        }
        $('#send_form').live('click',
            function() {
                var gd_id = $('#idsss').val();
                var manjiage = $('#manjiage').val();
                var childjiage = $('#childjiage').val();
                var kucen = $('#kucen').val();
                var inputlist = $("#datetuqi").val();
                inputlist = $.parseJSON(inputlist);
                $.each(inputlist,
                    function(n, v) {
                        if (gd_id == v.time) {
                            v.adult = manjiage;
                            v.child = childjiage;
                            v.stock = kucen;
                        }
                    });
                inputlist = $.toJSON(inputlist);
                $("#datetuqi").val(inputlist);
                $('.cur').find('.acs').html('成人：￥' + manjiage);
                $('.cur').find('.cns').html('儿童：￥' + childjiage);
                $('.cur').find('.cnsh').html('余：' + kucen);
                $('.cur').find('.acs').attr('rel', manjiage);
                $('.cur').find('.cns').attr('rel', childjiage);
                $('.cur').find('.cnsh').attr('rel', kucen);
                $('#checkAll').val('1'); //修改团期的标识
                closenum();
            })
        $('#del_form').click(function() {
            closenum();
        })

        function getJsonLength(jsonData) {

            var jsonLength = 0;

            for (var item in jsonData) {

                jsonLength++;

            }

            return jsonLength;

        }

        var riqi = "";

        var dateList = $('#dateList').val();
        if (dateList) {
            var obj = $.parseJSON(dateList);
            var d = new Date(parseInt(obj[0].date_time) * 1000);
            var numss = getJsonLength(obj);
            var ds = new Date(parseInt(obj[numss - 1].date_time) * 1000);
            var years = d.getFullYear();
            var months = d.getMonth() + 1;
            var monthss = ds.getMonth() + 1;
            var stime = formatDate(d);
            var etime = formatDate(ds);
            var cal = 1; //默认双日历显示
            //判断是单日历显示还是双日历显示
            if (months == monthss) {
                cal = 0;
            };

            $('#start_time').val(stime);
            $('#end_time').val(etime);

            //c:容器,y:年,m:月,a:出发时间json,f:是否显示双日历,fu:回调调
            var para = {
                'c': 'calendarcontainer',
                'y': years,
                'm': months,
                'a': {
                    //最早时间
                    'd1': stime,
                    //最早时间
                    'd2': etime //最晚时间
                },
                'f': cal,
                //显示双日历用1，单日历用0
                'clickfu': function(to) { //回调函数，to为点击对象，点击日期是调用的函数,参数to为点击的日期的节点对象，可以把用户选定的日期通过此函数存入服务端或cookies，具体请自行编写
                    if (to.id != "") { //alert(to.id)
                        riqi = to.id;
                    }
                },
                'showFu': function(d) { //回调函数，d为要显示的当前日期，主要用于判断是否要在该日期的格子里显示出指定的内容，在日期格子里额外显示内容的函数,返回值必须为字符串，参数d为显示的日期对象（日期类型）
                    var t = new Date();
                    if (t.toLocaleDateString() == d.toLocaleDateString()) {
                        return "";
                    } else {
                        return "";
                    }
                }
            }

            CreateCalendar(para, "para"); //参数前一个是对象，后一个是对象名称
        } else {
            var d = new Date();
            var years = d.getFullYear();
            var months = d.getMonth() + 1;
            var stime = formatDate(d);
            d = Date.parse(d); //alert(starchuo);
            var cha = 30 * 24 * 60 * 60 * 1000;
            var ds = new Date(parseInt(d + cha));
            var etime = formatDate(ds);
            dateList = [];
            for (i = 0; i < 30; i++) {

                dateList[i] = {
                    "time": d,
                    "adult": 0,
                    "child": 0,
                    "stock": 0,
                }
                d += 24 * 60 * 60 * 1000;
            }
            dateList = $.toJSON(dateList);
            var obj = $.parseJSON(dateList);
            //c:容器,y:年,m:月,a:出发时间json,f:是否显示双日历,fu:回调调
            var para = {
                'c': 'calendarcontainer',
                'y': years,
                'm': months,
                'a': {
                    //最早时间
                    'd1': stime,
                    //最早时间
                    'd2': etime //最晚时间
                },
                'f': 1,
                //显示双日历用1，单日历用0
                'clickfu': function(to) { //回调函数，to为点击对象，点击日期是调用的函数,参数to为点击的日期的节点对象，可以把用户选定的日期通过此函数存入服务端或cookies，具体请自行编写
                    if (to.id != "") { //alert(to.id)
                        riqi = to.id;
                    }
                },
                'showFu': function(d) { //回调函数，d为要显示的当前日期，主要用于判断是否要在该日期的格子里显示出指定的内容，在日期格子里额外显示内容的函数,返回值必须为字符串，参数d为显示的日期对象（日期类型）
                    var t = new Date();
                    if (t.toLocaleDateString() == d.toLocaleDateString()) {
                        return "";
                    } else {
                        return "";
                    }
                }
            }

            CreateCalendar(para, "para"); //参数前一个是对象，后一个是对象名称
        }

        /*日期控件js*/

        /*选择出发点地址*/
        /*打开选择*/
        var xiabiao = '';
        function clocks() {
            $('#gg' + xiabiao).css('display', 'none');
            //$(document.body).css("overflow","visible");
        }

    },

        module.exports = main;
});