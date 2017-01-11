MYAPP.ready(function(){
	$("input[name=keyword]").val(GetQueryString('keyword'));
	$("input[name=gc_id]").val(GetQueryString('gc_id'));
	$("input[name=store_id]").val(GetQueryString('store_id'));
	$("input[name=stc_id]").val(GetQueryString('stc_id'));
	$("input[name=brand_id]").val(GetQueryString('brand_id'));

	var key = getLocalStorage('key');
	if(key==''){
		gotoLoginPage();
		return false;
	}

    //兼容app和浏览器调试
    var com_id = getComId("com_id");
    $("input[name=com_id]").val(com_id);

    var nowpage=1;//当前页
	var pages;//总页数
	var ajax=!1;//是否加载中
	var curpage=1;

	//回到顶部 监听及效果
	$(window).scroll(scrollTopIcon);
	$('#gotop').click(function () {scroll('0px', 50);});

    var store_id = $("input[name=store_id]").val();
    var stc_id = $("input[name=stc_id]").val();
    var keyword = $("input[name=keyword]").val();
    var comId = $("input[name=comId]").val();
    var gc_id = $("input[name=gc_id]").val();
    var brand_id = $("input[name=brand_id]").val(); if(typeof(brand_id) == "undefined") {brand_id = null};

	// 切换页面
	$('.product-order').click(function(){

		$('#more-btn').html('正在加载...');
		scroll('0px', 50);

		var state = parseInt($("input[name=state]").val());
		var order = parseInt($("input[name=order]").val());
		var page = parseInt($("input[name=page]").val());
		var gc_id = parseInt($("input[name=gc_id]").val());
		var keyword = $("input[name=keyword]").val();
		var com_id = $("input[name=com_id]").val();
		var brand_id = $("input[name=brand_id]").val(); if(typeof(brand_id) == "undefined") {brand_id = null}

		$("input[name=curpage]").val(1);

		var curstate = $(this).attr('state');//1.全部 2.拼团中 3.已成团 4.拼团失败
		var curorder;

		if($(this).hasClass("textblue")){
			//这里判断是否点击的是排序
			if($(this).hasClass("up")){
				$(this).removeClass("up");
				$(this).addClass("down");
				//向下排序
				curorder=2;
			}else{
				$(this).removeClass("down");
				$(this).addClass("up");
				//向上排序
				curorder=1;
			}
		}else{
			var index=$(this).index();
			$(".product-order").removeClass("textblue");
			$(this).addClass("textblue");
			var left=index+"00";
			$(".product-list-nva span").css("-webkit-transform","translate("+left+"%,0px)");
			//切换列表
			if($(this).hasClass("up")){
				//向上
				curorder=1;
			}else{
				//向下
				curorder=2;
			}
		}

		var url = ApiUrl+"/index.php?act=fitgroup&op=fitgroup_list&state="+curstate+"&order="+curorder+"&page="+page+"&curpage=1&keyword="+keyword+'&store_id='+store_id+'&stc_id='+stc_id+'&com_id='+com_id+'&brand_id='+brand_id+'&gc_id='+gc_id;

		$.ajax({
			url:url,
			type:'get',
			dataType:'json',
			data:{key:key},
			beforeSend:ajaxLoading,
			success:function(result){
				if(!result.hasmore){
					$('#more-btn').html('没有更多内容...');
				}else{
					//$('.pre-page').removeClass('disabled');
					$('#more-btn').html('正在加载...');
				}

				var html = template.render('home_body', result.datas);
				$("#product_list").empty();
				$("#product_list").append(html);

				$("input[name=state]").val(curstate);
				$("input[name=order]").val(curorder);
				$("input[name=curpage]").val(1);
				curpage = 1;
			},
			complete:ajaxLoadingComplete,
		});
	});

	// 加载更多
	$('.more-vailable').click(function(){
		return false;
		var state = parseInt($("input[name=state]").val());
		var order = parseInt($("input[name=order]").val());
		var page = parseInt($("input[name=page]").val());
		var curpage = eval(parseInt($("input[name=curpage]").val())+1);
		var gc_id = parseInt($("input[name=gc_id]").val());
		var keyword = $("input[name=keyword]").val();
		var com_id = $("input[name=com_id]").val();
		var brand_id = $("input[name=brand_id]").val(); if(typeof(brand_id) == "undefined") {brand_id = null}

		var store_id = $("input[name=store_id]").val();
		var stc_id = $("input[name=stc_id]").val();

		var url = ApiUrl+"/index.php?act=fitgroup&op=fitgroup_list&state="+state+"&order="+order+"&page="+page+"&curpage="+curpage+"&keyword="+keyword+'&store_id='+store_id+'&stc_id='+stc_id+'&com_id='+com_id+'&brand_id='+brand_id+'&gc_id='+gc_id;
		$.ajax({
			url:url,
			type:'get',
			dataType:'json',
			data:{key:key},
			success:function(result){
				$("input[name=hasmore]").val(result.hasmore);
				if(!result.hasmore){
					$('#more-btn').hide();
				}else{
					$('.pre-page').removeClass('disabled');
					$('#more-btn').html('点击加载更多...');
				}
				var html = template.render('home_body', result.datas);
				$("#product_list").append(html);
				$("input[name=curpage]").val(curpage);

			}
		});
	});

	// 加载当前页数据
    $.ajax({
        url:ApiUrl+"/index.php?act=fitgroup&op=fitgroup_list&state=1&order=2&page="+pagesize+"&curpage=1"+'&store_id='+store_id+'&stc_id='+stc_id+'&keyword='+keyword+'&com_id='+com_id+'&brand_id='+brand_id+'&gc_id='+gc_id,
        type:'get',
        dataType:'json',
		data:{key:key},
        success:function(result){

            if(!result.hasmore){
                $('#more-btn').html('没有更多内容...');
            }else{
                //$('.pre-page').removeClass('disabled');
                $('#more-btn').html('正在加载...');
            }

            var html = template.render('home_body', result.datas);
            $("#product_list").append(html);
            $("input[name=page]").val(pagesize);

            //获取总页数
            pages = result.page_total;
            //下拉加载 S
            Zepto(downScrool);
        }
    });

	// 滚动处理函数
    function downScrool(){
    	var state = parseInt($("input[name=state]").val());
		var order = parseInt($("input[name=order]").val());
		var page = parseInt($("input[name=page]").val());
		var gc_id = parseInt($("input[name=gc_id]").val());
		var keyword = $("input[name=keyword]").val();
        var com_id = $("input[name=com_id]").val();
        var brand_id = $("input[name=brand_id]").val(); if(typeof(brand_id) == "undefined") {brand_id = null}
        var store_id = $("input[name=store_id]").val();
        var stc_id = $("input[name=stc_id]").val();

    	 $(window).scroll(function(){
	            if(($(window).scrollTop() + $(window).height() > $(document).height()-40) && !ajax && pages > curpage){
	                //滚动条拉到离底40像素内，而且没ajax中，而且没超过总页数
	                //json_ajax(cla,++page);
	            	curpage = eval(parseInt($("input[name=curpage]").val())+1);
	            	nowpage = curpage;//当前页增加1
	                ajax=!0;//注明开始ajax加载中
	                //page = parseInt($("input[name=page]").val());

                    var url = TestUrl+"/index.php?act=fitgroup&op=fitgroup_list&state="+state+"&order="+order+"&page="+page+"&curpage="+curpage+"&keyword="+keyword+'&store_id='+store_id+'&stc_id='+stc_id+'&com_id='+com_id+'&brand_id='+brand_id+'&gc_id='+gc_id;

	                $.ajax({
	                	type:'get',
	                	url:url,
	                    dataType: 'json',
	                    data:{key:key,state:state},
	                    success: function(result){
	                        //pages=json.pages;//更新总页数
	                        //page=json.page;//更新当前页

	                    	if(!result.hasmore){
	                    		$('#more-btn').html('没有更多内容...');
	        				}else{
	        					//$('.pre-page').removeClass('disabled');
	        					$('#more-btn').html('正在加载...');
	        				}

	                    	var data = result.datas;
	        				data.WapSiteUrl = WapSiteUrl;
	        				var html = template.render('home_body', result.datas);

        					$("#product_list").append(html);
	        				//删除加载图片
	                        $(".loading").remove();
	                        ajax=!1;//注明已经完成ajax加载

	        				//更新当前页
	        				$("input[name=curpage]").val(curpage);

	        				if(!result.hasmore){
	        					// $("#product_list").append('<div class="loading">没有更多内容</div> ');//出现加载图片
	            			}
	                    },
	                    error: function(xhr, type){
	                        $(".loading").html("暂无内容！");
	                    }
	                });
	            }
	        });
    }
});