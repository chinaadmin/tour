//补全轮播图
(function (){
	$.post(interfaceURL.home.banners,{type:2},function(res){
		var bannerPoint = '';
//		console.log(res.data.length);
		for (var i = 0; i < res.data.length; i++) {
			bannerPoint += '<div class="swiper-slide"><img src="'+res.data[i].img_url+'"/></div>';
		};
		$('.swiper-container1 .swiper-wrapper').html(bannerPoint);
		$('.swiper-container1 .swiper-wrapper img').bind('error',function(){
			$(this).attr('src','../images/banner.jpg');
		});
		
		$(document).ready(function(){
			var swiper1 = new Swiper('.swiper-container1', {
				pagination: '.swiper-pagination',
			    paginationClickable: true,
			    centeredSlides: true,
			    autoplay: 4000,
			    autoplayDisableOnInteraction: false,
				loop: true,
//				freeMode : true,
				speed:1000
			});
		});
		
	});
	
	$.post(interfaceURL.home.rementuijian,function(res){
		var bannerPoint = '';
	    console.log(res);
	    
		for (var i = 0; i < res.data.length; i++) {
			for(var y=0;y<res.data[i].setplace.length;y++){
			bannerPoint += '<div class="swiper-slide"><img src="'+res.data[i].setplace[y].img_url+'"/>'
						//+	'<a href="html/commodity/detail.html?gid='+res.data[i].goods_id+'"><div class="bg">'
						+	'<a href="html/commodity/searchlist.html?searchkey='+res.data[i].setplace[y].place_keyword+'"><div class="bg">'
						+		res.data[i].setplace[y].place_name
						+	'</div></a>'
						+'</div>';
		  }
		};
		$('.swiper-container2 .swiper-wrapper').html(bannerPoint);
		$('.swiper-container2 .swiper-wrapper img').bind('error',function(){
			$(this).attr('src','../images/banner.jpg');
		});
		
		$(document).ready(function(){
			var swiper2 = new Swiper('.swiper-container2', {
	   			slidesPerView: 'auto',
			});
		});
	   
	});
//测试接口		
//	$.post(interfaceURL.commodity.goodsInfo,{goods_id:3},function(res){
//		console.log(res)
//	});
})()

