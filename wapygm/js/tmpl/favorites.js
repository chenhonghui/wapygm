MYAPP.ready(function(){
	var key = getLocalStorage('key');
	if(key==''){
		gotoLoginPage();
		return false;
	}
	//回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});

	
    var page=1;//当前页
    var pages;//总页数
    var ajax=!1;//是否加载中

	function initPage(){
		//初始化页面
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=member_favorites&op=favorites_list&page="+pagesize+"&curpage=1",
			data:{key:key},
			dataType:'json',
			success:function(result){
				
				if(!result.hasmore){
            		$('#more-btn').html('没有更多内容...');
				}else{
					//$('.pre-page').removeClass('disabled');
					$('#more-btn').html('正在加载...');
				}
				checklogin(result.login);
				var data = result.datas;
				//data.hasmore = result.hasmore;
				data.WapSiteUrl = WapSiteUrl;
				//data.curpage = curpage;
				var html = template.render('sfavorites_list', data);
				$("#favorites_list").append(html);
				$("input[name=page]").val(pagesize);
				//删除收藏
				$('.i-del').click(delFavorites);
				//获取总页数
				pages = result.page_total;
				//下拉加载
				Zepto(downScrool);
				
				
			}
		});
	}
		
		
	 function downScrool(){
	        $(window).scroll(function(){
	            if(($(window).scrollTop() + $(window).height() > $(document).height()-40) && !ajax && pages > page){
	                //滚动条拉到离底40像素内，而且没ajax中，而且没超过总页数
	                //json_ajax(cla,++page);
	            	var curpage = eval(parseInt($("input[name=curpage]").val())+1);
	                page = curpage;//当前页增加1
	                ajax=!0;//注明开始ajax加载中
	                //page = parseInt($("input[name=page]").val());
	                //$(".favorites-list").append('<div class="loading">正在加载...</div> ');//出现加载图片
	                $.ajax({
	                	type:'post',
	                    url:ApiUrl+"/index.php?act=member_favorites&op=favorites_list&page="+pagesize+"&curpage="+curpage,
	                    dataType: 'json',
	                    data:{key:key},
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
	        				var html = template.render('sfavorites_list', data);

	        				console.log('34234');
	        				
	        				$("#favorites_list").append(html);
	        				//删除收藏
	        				$('.i-del').click(delFavorites);
	        				//删除加载图片
	                        $(".loading").remove();
	                        ajax=!1;//注明已经完成ajax加载
	                      
	        				//更新当前页
	        				$("input[name=curpage]").val(curpage);
	        				
//	        				if(!result.hasmore ){
//	        					$(".favorites-list").append('<div class="loading">没有更多内容</div> ');//出现加载图片
//	            			}
	                    },
	                    error: function(xhr, type){
	                        $(".loading").html("暂无内容！");
	                    }
	                });
	            }
	        });
	    }
	
	//删除收藏
	function delFavorites(){
		var goods_id = $(this).attr('goods_id');
		$.sDialog({
              skin: "block",
              content: "您确定要删除吗?",
              "cancelBtnText": "取消",
              "okBtnText": "确定",
              
              cancelFn: function() {},
              okFn: function() {
		    	$.ajax({
					type:'post',
					url:ApiUrl+"/index.php?act=member_favorites&op=favorites_del",
					data:{fav_id:goods_id,key:key},
					dataType:'json',
					success:function(result){
						checklogin(result.login);
						if(result){
							$("#"+goods_id).hide();
						}
					}
				});
            },
        });
	}

	
	
	$('.more-vailable').click(function(){//下一页
		return false;
		var page = parseInt($("input[name=page]").val());
		var curpage = eval(parseInt($("input[name=curpage]").val())+1);
		
		var url = ApiUrl+"/index.php?act=member_favorites&op=favorites_list&page="+page+"&curpage="+curpage;
		$.ajax({
			url:url,
			type:'post',
			data:{key:key},
			dataType:'json',
			success:function(result){
				
				$("input[name=hasmore]").val(result.hasmore);
				if(!result.hasmore){
					$('#more-btn').hide();
				}else{
					$('.pre-page').removeClass('disabled');
					$('#more-btn').html('正在加载...');
				}
				var html = template.render('sfavorites_list', result.datas);
				$("#favorites_list").append(html);
				$("input[name=curpage]").val(curpage);
				
				//删除收藏
				$('.i-del').click(delFavorites);
				
			}
		});
	});

	initPage();

	

	$('body').click(function(){
		$("#favorites_list").empty();
		initPage();
	});
});