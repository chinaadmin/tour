	var Calender = (function(){
		/**
		 * 对Date的扩展，将 Date 转化为指定格式的String 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
		 * 可以用 1-2 个占位符 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) eg: (new
		 * Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 (new
		 * Date()).format("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04 (new
		 * Date()).format("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04 (new
		 * Date()).format("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04 (new
		 * Date()).format("yyyy-M-d h:m:s.S q ") ==> 2006-7-2 8:9:4.18
		 */
		Date.prototype.format = function(fmt) {
			var o = {
				"Y+" : this.getFullYear(),
				"M+" : this.getMonth() + 1,
				// 月份
				"d+" : this.getDate(),
				// 日
				"h+" : this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
				// 小时
				"H+" : this.getHours(),
				// 小时
				"m+" : this.getMinutes(),
				// 分
				"s+" : this.getSeconds(),
				// 秒
				"q+" : Math.floor((this.getMonth() + 3) / 3),
				// 季度
				"S" : this.getMilliseconds()
			// 毫秒
			};
			var week = {
				"0" : "日",
				"1" : "一",
				"2" : "二",
				"3" : "三",
				"4" : "四",
				"5" : "五",
				"6" : "六"
			};
			if (/(y+)/.test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
						.substr(4 - RegExp.$1.length));
			}
			if (/(E+)/.test(fmt)) {
				fmt = fmt
						.replace(
								RegExp.$1,
								((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f"
										: "/u5468")
										: "")
										+ week[this.getDay() + ""]);
			}
			for ( var k in o) {
				if (new RegExp("(" + k + ")").test(fmt)) {
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
							: (("00" + o[k]).substr(("" + o[k]).length)));
				}
			}
			return fmt;
		};
		var KeCalender = function(opts,callback,successCallback){
			this.id = opts.id;
			this.defaults = {
				width:"",
				height:"auto",
				background:"#fff",
				color:"#999",
				format:"yyyy-MM-dd"
			},
			this.options = mix(this.defaults,opts); //jquery extend原理
			this.yrange = this.options.yrange || KeCalender.YEARS;
			this.monthTag = this.options.monthTag || KeCalender.MONTHS;
			this.weekTag = this.options.weekTag || KeCalender.WEEKS;
			this.callback = callback;
			this.success = successCallback;

		};
		
		//静态常量
		KeCalender.WEEKS = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
		KeCalender.MONTHS = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
		KeCalender.YEARS = [2015,2017];

		KeCalender.prototype = {
			consturctor:KeCalender,
			init:function(){
				var args = arguments;
				var year = "",month="";
				if(args.length==2){
					year = args[0];
					month = args[1];
				}else{
					var date = new Date();
					year = date.getFullYear();
					month = date.getMonth()+1;
				};
				thisMonth =month;  //将月份初始化给当前显示日期的月份
				//初始化模板
				var domObj = this.template(year,month);
				
				var json ={};
				domClass(domObj,"ke_calcd").forEach(function(obj){
					json[obj.getAttribute("ymd")] = obj;
				});
				if(this.success)this.success.call(json);
			},
			template:function(year,month){
				var $calc = this;
				var boxDom = dom($calc.id);
				var html = 
				"<div class='kecalc'>"+
				"	<div class='kcalcr'>"+
				"		<div class='kecln-controls'>"+
				"			<div class='kecln-control-button'>"+
				"				<p class='ke_calc_prev ke_prev'></p>"+
				"			</div>"+
				"			<div class='month'>"+year+"年"+$calc.monthTag[month-1]+"</div>"+
				"			<div class='kecln-control-button rightalign'>"+
				"				<p class='ke_calc_next ke_next'></p>"+
				"			</div>"+
				"			<div class='kecalc_box' id='ke_cacle_"+$calc.id+"'></div>"+
				"		</div>"+
				"	</div>"+
				"</div>";
				boxDom.innerHTML = html;
				//给盒子添加样式，比如说宽度，高度，背景色，
				$calc.css(boxDom,$calc.options);
				//绑定事件,上一年，下一年
				$calc.prevEvent(boxDom,year,month);
				$calc.nextEvent(boxDom,year,month);

				//创建一个表格
				var tableDom = $calc.element("table");
				var tbodyDom = $calc.element("tbody");
//				console.log($calc.options.height);
//				$calc.css(tbodyDom,{height:$calc.options.height-102}); //box高度-title高度    
				$calc.addClass(tableDom,"kecln-table"); 
				//创建表头
				var theadDom = $calc.element("thead");
				//创建一个tr
				var trDom =  $calc.element("tr");
				$calc.addClass(trDom,"header-days");
				for(var i=0,len=$calc.weekTag.length;i<len;i++){
					var tdDom = $calc.element("td");
					$calc.addClass(tdDom,"header-day");
					tdDom.innerHTML = $calc.weekTag[i];
					trDom.appendChild(tdDom);
				};
				//将行添加到表头中
				$calc.append(theadDom,trDom);
				  
				//创建表体
				var tbodyDom = $calc.element("tbody");
				
				//获取当月的天数
				var days = $calc.getMonthDay(year,month);
				//拿到上一个月的总天数，补齐前面的空格
				var pdays = $calc.getMonthDay(year,month-1);
				//创建每个月的第一天的日期对象
				var date = new Date(year,month-1,1);
				var currentDate = new Date();
				var cdate =  currentDate.getDate();
				//获取每个月的第一天是星期几
				var week =date.getDay();
				var j = 0;//记录天数
				var tdHtml = "";
				var cmark = false;
				var nindex = 1;
				var pwdays = pdays -week +1;
				while(true){
					tdHtml+="<tr>";
					//拿到一个月有多少天
					//拿到这个月第一天是星期几
					for(var i=0;i<7;i++){
						var mark = "day";
						if(j==0 && i==week){//就去是寻找每个月第一天是星期几
							j++;
							if(j==cdate)mark = "day  today";
							tdHtml +="<td ymd='"+year+"/"+month+"/"+j+"' class='ke_calcd "+mark+"'><p class='top'></p><p>1</p><p class='bottom'></p><p class='last d-hide'></p></td>";
							cmark = true;
						}else if(j>0 && j<days){
							j++;
							if(j==cdate)mark = "day today";
							tdHtml +="<td ymd='"+year+"/"+month+"/"+j+"' class='ke_calcd "+mark+"'><p class='top'></p><p>"+j+"</p><p class='bottom'></p><p class='last d-hide'></p><p class='d-hide shijian'></p></td>";
						}else{
							//td填空格
							if(!cmark){
								var oy = year;
								if(month==1){
									oy = year-1;
								}
								tdHtml +="<td ymd='"+oy+"/"+(month-1==0?12:month-1)+"/"+pwdays+"' class='ke_calcd day empt'>"+pwdays+"</td>";
								pwdays++;
							}else{
								var oy = year;
								if(month==12)oy = year+1;
								tdHtml +="<td ymd='"+oy+"/"+(month+1)+"/"+nindex+"' class='ke_calcd day empt'>"+nindex+"</td>";
								nindex++;
							}
						}
					}
					tdHtml+="</tr>";
					if(j>=days)break;
				};
				//节假日[]
				//农历
				
				//追加拼接的日期文本
				tbodyDom.innerHTML = tdHtml;
				//追加元素
				$calc.append(tableDom,theadDom);
				$calc.append(tableDom,tbodyDom);
				$calc.append(dom("ke_cacle_"+$calc.id),tableDom);

				//给所有的td元素绑定点击事件
				/*domClass(tbodyDom,"ke_calcd").forEach(function(obj){
					if(!obj.classList.contains('empt')){
						obj.onclick = function(){
							var ymd = this.getAttribute("ymd");
							var date = new Date();
							var hour = date.getHours();
							var min = date.getMinutes();
							var sec = date.getSeconds();
							var dataStr = ymd+" "+hour+":"+min+":"+sec;
							var rdate = new Date(dataStr);
							var adultPrice = this.childNodes[2].innerHTML||"";
							var childPrice = this.childNodes[3].innerHTML||"";
							if(adultPrice){
								document.getElementById("adultPrice").innerHTML = adultPrice;
							};
							if(childPrice){
								document.getElementById("childPrice").innerHTML = childPrice;
							};
							if($calc.callback){
								$calc.callback.call(rdate,rdate.format($calc.options.format))
							};
						}
					}
				});*/
//				domClass(tbodyDom,"ke_calcd").onclick = function(){
//					addClass(this,"green");
//					console.log(this)
//				};

				return boxDom;
			},
			nextEvent:function(dom,year,month){//下一年
				var $calc = this;
				domClass(dom,"ke_next")[0].onclick = function(){
					var m = month+1;
					var y = year;
					if(year==$calc.yrange[1] && m>12){
						alert("你已经到最大年限了...");
						return;
					}
					if(m > 12){
						y = year+1;
						m = 1;
					}
					
					$calc.template(y,m);
					thisMonth = m;
					toShow();
				};
			},
			prevEvent:function(dom,year,month){//上一年
				var $calc = this;
				domClass(dom,"ke_prev")[0].onclick = function(){
					var m = month-1;
					var y = year;
					if(year==$calc.yrange[0] && m==0){
						alert("你已经到最小年限了...");
						return;
					}
					if(m ==0){
						y = year-1;
						m = 12;
					}
					$calc.template(y,m);
					thisMonth = m;
					toShow();
				};
			},
			getMonthDay:function(year,month){//拿到一个月有多少天，getDate()拿到今天是几号
				return new Date(year,month,0).getDate();//拿到上个月最后一天
			},
			addClass:function(dom,className){//添加样式
				dom.className = className;
			},
			append:function(dom,subdom){//追加元素
				dom.appendChild(subdom);
			},
			element:function(ele){//创建元素
				return document.createElement(ele);
			},
			css:function(dom,opts){
				for(var key in opts){
					var v = opts[key];
					dom.style[key] = (typeof v==="number"?v+"px":v);
				}
			}
		};
		return KeCalender;
	})();
	


//	var smtag = ["Jan","Feby","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"];
	var smtag = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
//  var swtag = ["Sun","Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
	var swtag = ["日","一", "二", "三", "四", "五", "六"];

	var Width =  document.documentElement.scrollWidth;//浏览器缩放也可适用
	//var Width =  Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);//浏览器缩放也可适用
	//var Width =100%;
	if(Width>=1024){
		Width = 1024
	};
//	console.log(Width);
//	var Height = Width;
	var c1 = new Calender({id:"date1",width:Width,color:"#5c5c5c",monthTag:smtag,weekTag:swtag,format:"yyyy年MM月dd日"},function(formatStr){
		dom("#start_time").innerHTML = formatStr;
	},function(){ //此处只能执行当月的事件，左右切换月份不会执行，会报错
//		console.log(this["2016/9/5"].childNodes[1]);
//		this["2016/9/5"].style.background = "red";
		return;
		this["2016/8/5"].childNodes[1].innerHTML += "★";
		this["2016/8/5"].style.background = "red";
		this["2016/8/5"].onclick = function(){
			console.log("k.o")
		};
	});
	c1.init();
//	console.log(cc);
//	console.log(cc.length);
//	console.log(cc[5].getAttribute("ymd"));
	function getChildNode(str){  //获取（ymd = date）子节点
		var tbody = dom("ke_cacle_date1");
		var cc = domClass(tbody,"day");
		var cc = $(tbody).find('.day');
		for(var i=0;i<cc.length;i++){
			if(cc[i].getAttribute("ymd") == str){
				return cc[i]
			}
		}
	};
	var thisMonth; //当前显示的月份
	function toShow(){
		var dateArray = dateArr; //['2016/8/7','2016/8/8','2016/8/9','2016/8/10','2016/8/11']格式
		for(var i=0;i<dateArray.length;i++){
			var that = getChildNode(dateArray[i]);
//			console.log(dateArray[i].split("/"));
			var theMouth = dateArray[i].split("/")[1]; //获取数组中日期的月份
//			console.log(theMouth +"==="+ thisMonth)
			var adultPrice = parseFloat(adultPriceArr[i]);
			var childPrice = parseFloat(childPriceArr[i]);
			var shijian = dateArr[i];
			var stock = stockArr[i];
			if(theMouth==thisMonth){
				if(stock>10){
				   that.childNodes[0].style.visibility = "hidden"; //余票
				   that.childNodes[0].innerHTML = "余 "+stock; //余票
				}else{
				that.childNodes[0].innerHTML = "余 "+stock; //余票
			    }
				that.childNodes[2].innerHTML = "¥ "+adultPrice; //成人价格
				that.childNodes[3].innerHTML = "¥ "+childPrice; //儿童价格
				that.childNodes[4].innerHTML = shijian; //时间
				that.style.color = "#606060"; //字体颜色
				that.className += " has";  
//				that.onclick = function(){
//					console.log("k.o")
//				};
			}
		}
	};
	
	var dateArr = [];
	var adultPriceArr = [];
	var childPriceArr = [];
	var stockArr = [];
	
	var gid = window.location.search.replace(/[^0-9]/ig,""); //获取gid
	$.post(interfaceURL.commodity.goodsPrice,{goods_id:gid},function(res){
		console.log(res);
		for(var i=0;i<res.data.length;i++){
			//获取时间、价格、余票
			var days = res.data[i].date_time;
			var newdays = formatDate(days).replace(/-/g,"/");
			var adult_price = res.data[i].adult_price;
			var child_price = res.data[i].child_price;
			var stock = res.data[i].stock;
			//放入数组中
			dateArr.push(newdays);
			adultPriceArr.push(adult_price);
			childPriceArr.push(child_price);
			stockArr.push(stock);
		};
		console.log(dateArr)
		toShow(); //等dateArr 都渲染完成后执行
	});
	
//	function getLocalTime(nS) {    //转换成 (2016/12/12 上午11:11)  手机上没用，坑啊！！！
//	  return new Date(parseInt(nS)*1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");      
//	};
	function formatDate(date){  //转换成 (2016-12-12)
		var now = new Date(date*1000);
		var year=now.getFullYear();     
		var month=now.getMonth()+1;     
		var date=now.getDate();     
		return year+"-"+month+"-"+date;     
   	};
/*	$.post(interfaceURL.commodity.goodsPrice,{goods_id:gid},function(res){
		console.log(res);return false;
		console.log(res.data.date_time.contens)
		var date_time = res.data.date_time.contens;
		var startT = new Date(Date.parse("2016/8/12"));
		var endT = new Date(Date.parse("2016/9/30"));
		iDays  =  parseInt(Math.abs(endT - startT)  /  1000  /  60  /  60  /24) + 1; //相差天数 +1
//		console.log(iDays);
		var newdays = startT.getDate();
		for(var i=0;i<iDays;i++){
//			console.log(i);
			console.log(newdays);
			var aa = new Date(Date.parse("2016/8/12")).setDate(newdays+i);
			var bb = getLocalTime(aa).split(" ");
			dateArr.push(bb[0])
		};
//		GetDateStr(0,startT);
		console.log(dateArr);
		
	});*/
	
