MYAPP.ready(function (){
    //回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});

    //点击加载更多 等同于下一页
    $('.more-vailable').click(nextPage);

    var goods_id = GetQueryString("goods_id");
    var page = 10; //每页评论数量
    var curpage = 1;

    //渲染页面
    function initPage(page,curpag){
        $.ajax({
            url:ApiUrl+"/index.php?act=goods&op=goods_comment&page="+page+"&curpage="+curpage,
            type:"get",
            data:{goods_id:goods_id},
            dataType:"json",
            success:function(result){
                var data = result.datas;
                data.hasmore = result.hasmore;
                data.WapSiteUrl = WapSiteUrl;
                data.curpage = curpage;
                var html = template.render('scomment_list', data);
                $("#comment_list").html($("#comment_list").html()+html);

                //加载更多
                if(data.hasmore){
                    $(".more-vailable").html('点击加载更多...');
                }else{
                    $(".more-vailable").hide();
                }

                //图片放大
                $(".pc-photo-view img").click(zoom);
            }
        });
    }
    initPage(page,curpage);
    //下一页
    function nextPage (){
        curpage = curpage+1;
        initPage(page,curpage);
    }

    //图片放大
    function zoom(){
        /*var scrollTOP=$(window).scrollTop();
        $(".more-vailable").hide();
        $("#photo").show();
        $("#photo").css({
            width:$(window).width(),
            height:$(window).height()
        });
        $(".product-comment").hide();
        $("#gotop").hide();
        $("body").css("background","#000");
        $("#meta").attr("content","width=device-width");
        $("#photo").find("img").attr("src",$(this).attr("big-src"));
        document.addEventListener("click",function(e){
            if($(e.toElement).hasClass("pinch-zoom")){
                $("body").css("background","#fff");
                $(".product-comment").show();
                $("#gotop").show();
                $("#opacity").hide();
                $("#photo").hide();
                $("#meta").attr("content","width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
                window.scrollTo(0,scrollTOP);
            }
        });*/
        var big_url = $(this).attr("big-src");
        MYAPP.gopage('productCommentPhoto', WapSiteUrl + '/tmpl/product_comment_photo.html?url='+encodeURIComponent(big_url),{title:'商品评论',showCart:0,headerAlpha:1});

    }

});