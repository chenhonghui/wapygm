MYAPP.ready(function(){
    //回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});

    //com_id 写入cookie
    var com_id = getComId();
    var store_id = GetQueryString("store_id");

    //洋姑妈站点数据迁移,以前收藏地址 强制变更站点
    if(com_id == '1023' && store_id == '1097'){
        addLocalStorage('com_id','2');
    }

    $('#header').removeClass('hide');
    //渲染页面
    function init(){
        $.ajax({
            url:ApiUrl+"/index.php?act=store_show&op=index",
            type:"get",
            data:{store_id:store_id},
            dataType:"json",
            success:function(result){
                var data = result.datas;
                var html = template.render('store_show_template', data);
                $("#store_show").html(html);
                //app取消顶部显示个人中心按钮
                if(isMoyunApp()){
                	$("#store_show .g_shop_search_line").css("paddingLeft","10px");
                }

                //wap pc打开跳转pc版
                if(IsPC() && data.store_info.is_ygm == '1'){
                    window.location.href = data.store_info.ygm_url;
                }

                //实例化swiper
                var banner = new Swiper("#banner", {
                    autoplay: 3000,
                    speed: 600,
                    autoplayDisableOnInteraction: false, //用户操作后是否禁止自动滑动
                    pagination: '.swiper-pagination',
                    paginationClickable: true
                });
                var swiper = new Swiper('#swiper', {
                    slidesPerView: 'auto',
                    spaceBetween: 10
                });

                document.title = data.store_info.store_name;
                $('#headTitle').html(data.store_info.store_name);

                $('.g_tag1').click(search_goods);
                $('.g_tag2').click(search_goods);
                $('#searchBtn').click(search_goods);
				
				//渲染二级菜单筛选弹窗
				initTagsFixView("tagMenu", data, function(id) {
					search_goods_ajax("", "", id);
					var sp=$("#swiper");
					sp.find(".g_tag1_act").removeClass("g_tag1_act");
					sp.find(".g_tag2_act").removeClass("g_tag2_act");
				});
                //微信分享数据
                if(isWeiXinOrQQ()){
                    weixin_share_data = new Object();
                    weixin_share_data.title = data.store_info.store_name;
                    weixin_share_data.imgUrl = data.store_info.store_label_url;
                    weixin_share_data.desc = data.store_info.store_description ? data.store_info.store_description : data.store_info.store_name;
                    weiXinHandle();
                }
            }
        });
    }

    init();

    //搜索商品(ajax)
    function search_goods_ajax(keyword,type,stc_id){
        $.ajax({
            url:ApiUrl+"/index.php?act=store_show&op=store_goods",
            type:"get",
            data:{store_id:store_id,keyword:keyword,type:type,stc_id:stc_id},
            dataType:"json",
            beforeSend:ajaxLoading,
            success:function(result){
                var data = result.datas;
                var html = template.render('store_goods_template', data);
                $(".recommend-product").html(html);
            },
            complete:ajaxLoadingComplete
        });
    }
    //搜索商品(通过按钮)
    function search_goods(){
        var keyword = '';
        var type = '';
        var stc_id = '';
        if($(this).attr('id') == 'searchBtn'){
            $('.g_tag1').removeClass('g_tag1_act');
            $('.g_tag2').removeClass('g_tag2_act');
            keyword = $('#searchInput').val();
        }
        if($(this).hasClass('g_tag1')){
            $('.g_tag1').removeClass('g_tag1_act');
            $('.g_tag2').removeClass('g_tag2_act');
            $(this).addClass('g_tag1_act');
            type = $(this).attr('data-type');
        }
        if($(this).hasClass('g_tag2')){
            $('.g_tag1').removeClass('g_tag1_act');
            $('.g_tag2').removeClass('g_tag2_act');
            $(this).addClass('g_tag2_act');
            stc_id = $(this).attr('data-stc-id');
        }
        search_goods_ajax(keyword,type,stc_id);
    }

    function weiXinHandle(){
        weixinShare();
    }
    //微信分享
    function weixinShare(){
        var dynamicLoadJs = function (src) {
            var oHead = document.getElementsByTagName('HEAD').item(0);
            var oScript = document.createElement("script");
            oScript.type = "text/javascript";
            oScript.src = src;
            oHead.appendChild(oScript);
        }
        dynamicLoadJs('https://res.wx.qq.com/open/js/jweixin-1.0.0.js');
        dynamicLoadJs('../js/weixin.share.js');
    }
    
    /*初始化二级分类筛选弹窗*/
	function initTagsFixView(id,data,searchFn){
		var bg=$("#tagsFixView");
		var toy=bg.find(".tags_fixview_toy")
		var ul=bg.find(".tags_fixview");
		var list=null;
		
		//渲染列表
		var str="",temp1,temp2;
		for(var i=0;i<data["stc_info"].length;i++){
			temp1=data["stc_info"][i];
			str+='<li class="tags_fixview_list">'
			+'<h3 class="tags_fixview_header" data-id="'+temp1.stc_id+'">'+temp1.stc_name+'</h3>'
			+'<ul class="tags_fixview_children">';
			if(temp1["children"]){
				for(var j=0;j<temp1["children"].length;j++){
					temp2=temp1["children"][j];
					str+='<li class="tags_fixview_classify" data-id="'+temp2.stc_id+'">'+temp2.stc_name+'</li>';
				}
			}
			str+='</ul></li>'
		}
		ul.html(str);
		list=bg.find(".tags_fixview_list");
		
		//关闭弹窗
		var closeFixView=function(){
			toy.css("top","5px");
			ul.find(".tags_fixview_checked").removeClass("tags_fixview_checked");
			bg.hide();
		}
		//点击打开弹窗
		$("#"+id).click(function(e){
			bg.show();
		});
		//代理所有内部点击事件
		bg.on("click",function(e){
			if($(e.target).hasClass("tags_fixview_bg")){
				closeFixView();
			}
		});
		list.on("click",function(e){
			var t=$(this);
			var eve=$(e.target);
			var type=t.hasClass("tags_fixview_checked");
			//展开列表
			if(eve.hasClass("tags_fixview_header")){
				if(type){
					t.removeClass("tags_fixview_checked");
				}
				else {
					ul.find(".tags_fixview_checked").removeClass("tags_fixview_checked");
					t.addClass("tags_fixview_checked");
					//没有子分类则直接筛选副分类条件
					if(!eve.siblings(".tags_fixview_children").find("li").length){
						searchFn&&typeof searchFn==="function"&&searchFn(eve.data("id"));
						closeFixView();
					}
				}
				//toy物件滑动
				toy.css("top",eve[0].offsetTop+5+"px");
				return false;
			}
			//选择分类
			if(eve.hasClass("tags_fixview_classify")){
				searchFn&&typeof searchFn==="function"&&searchFn(eve.data("id"));
				closeFixView();
			}
		});
	}

    function IsPC() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    }
});
