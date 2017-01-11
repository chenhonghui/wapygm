MYAPP.ready(function (){
    // WAP子商品页面跳转到WAP2 http跳转https
    var old_url = document.URL;
    if (window.location.hostname == "myshop.moyuntv.com" && window.location.protocol == "http:") {
     var new_url = old_url.replace("http://", "https://");
     window.location.href = new_url;
    }

    //回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});

    //com_id 写入cookie
    var com_id = getComId();

    var member_id = GetQueryString("member_id");

    //渲染页面
    function init(){
        $.ajax({
            url:ApiUrl+"/index.php?act=store_show_child&op=index",
            type:"get",
            data:{member_id:member_id},
            dataType:"json",
            success:function(result){
                var data = result.datas;
                var html = template.render('store_show_template', data);
                $("#store_show").html(html);

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

                $('.g_tag1').click(search_goods);
                $('.g_tag2').click(search_goods);
                $('#searchBtn').click(search_goods);

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

    //搜索商品
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

        $.ajax({
            url:ApiUrl+"/index.php?act=store_show_child&op=index",
            type:"get",
            data:{member_id:member_id,keyword:keyword,type:type,stc_id:stc_id},
            dataType:"json",
            beforeSend:ajaxLoading,
            success:function(result){
                // var data = result.datas;
                // var html = template.render('store_goods_template', data);
                // $(".recommend-product").html(html);

                var data = result.datas;
                var html = template.render('store_show_template', data);
                $("#store_show").html(html);

                if (type == '2') {
                    $("div[data-type='1']").removeClass('g_tag1_act');
                    $("div[data-type='2']").addClass('g_tag1_act');
                }else{
                    $("div[data-type='2']").removeClass('g_tag1_act');
                    $("div[data-type='1']").addClass('g_tag1_act');
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

                $('.g_tag1').click(search_goods);
                $('.g_tag2').click(search_goods);
                $('#searchBtn').click(search_goods);
                
            },
            complete:ajaxLoadingComplete
        });
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
});
