MYAPP.ready(function (){
    //回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});

    //兼容app和浏览器调试
    var comId = getComId();

    $.ajax({
        url:ApiUrl+"/index.php?act=index&op=getAppId",
        data:{comId:comId},
        type:'post',
        dataType:'json',
        success:function(result){
            if(result.datas){
                var app_id = result.datas.app_id;
                load(app_id);
            }else{
                var app_id = 1;
                load(app_id);
            }
        }
    });

    function load(app_id){
        $.ajax({
            url:ApiUrl+"/index.php?act=index",
            data:{app_id:app_id},
            type:'get',
            dataType:'json',
            success:function(result){
                var rData =  result.datas;
                rData.WapSiteUrl = WapSiteUrl;
                var home2 = rData.home2;
                var homeMap = [];
                for(var i=0;2*i<home2.length;i++){
                    homeMap.push([home2[2*i],home2[2*i+1]]);
                }
                rData.homeMap = homeMap;
                var html = template.render('home_body',rData);
                $("#home-cnt-wp").html(html);
                banner();
                addPaginat();
                //mySwipe();

                $('.home1').click(function(){
                    var keyword = encodeURIComponent($(this).attr('keyword'));
                    location.href = WapSiteUrl+'/tmpl/product_list.html?keyword='+keyword;
                });

                $('.home2').click(function(){
                    var keyword = encodeURIComponent($(this).attr('keyword'));
                    location.href = WapSiteUrl+'/tmpl/product_list.html?keyword='+keyword;
                });
                saleArea();
            }
        });
    }

    

    function banner(){
        var gallery = $('.swiper-container-banner').swiper({
            watchActiveIndex: true,
            centeredSlides: true,
            pagination:'.pagination',
            paginationClickable: true,
            resizeReInit: true,
            keyboardControl: true,
            grabCursor: true,
            autoplay:3000,
            loop:true,
            onSwiperCreated:function(){

            }
        });
        var paginationLength=$(".pagination").children().length;
        $(".swiper-pagination-switch").css("width",(100/paginationLength)+"%");
    }


    function addPaginat(){
		var swipeSpan= '<span class="swipe-paginat-switch current"></span>';
		var swipeItem = $("#mySwipe .swipe-item");
		for(var i = 1;i< swipeItem.length;i++){
			swipeSpan += '<span class="swipe-paginat-switch"></span>';
		}
		$(".swipe-paginat").html(swipeSpan);
	}

	function mySwipe(){
		// pure JS
		var elem = $("#mySwipe")[0];
		window.mySwipe = Swipe(elem, {
		  auto: 5000,
		  continuous: true,
		  disableScroll: true,
		  stopPropagation: true,
		  callback: function(index, element) {
		  	var paginat = $(".swipe-paginat-switch");
		  	paginat.eq(index).addClass("current").siblings().removeClass("current");
		  }
		});
	}

	function saleArea(){
  		$.ajax({
  			type:'post',
  			url:ApiUrl+"/index.php?act=goods&op=get_saleArea",	
  			
  			dataType:'json',
  			success:function(result){
  				checklogin(result.login);
  				var data = result.datas;
  				var html = template.render('salearea', data);
  				//alert(html);
  				$("#salearea-wp").html(html);
  				
  			}
  		});
  	}
	
	$('.search-btn').click(function(){
		var keyword = encodeURIComponent($('#keyword').val());
		location.href = WapSiteUrl+'/tmpl/product_list.html?keyword='+keyword;
	});


});