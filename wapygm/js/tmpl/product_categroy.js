MYAPP.ready(function(){
    //兼容app和浏览器调试
    var comId = getComId();

    //回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});

    // 初始化一级目录
    $.ajax({
        type:'get',
        url:ApiUrl+"/index.php?act=index&op=gettopgoodsclass",
        data:{comId:comId},
        dataType:'json',
        success:function(result){
            var data =  result.datas;
            if(!data.error){
                var html = template.render('stpl_top_level_goods_class',data);
                $("#top-class").html(html);

                //首次加载
                if (window.sessionStorage && sessionStorage.getItem("current_gc_id") != null) {
                    var gc_id = sessionStorage.getItem("current_gc_id");
                }else{
                    var gc_id = $('.top-categroy .current').attr("data-gc-id"); //html已经将第一条的class设置成current了
                }

                renderChildClass(gc_id);

                $(".swiper-slide").click(function (){
                    $(this).addClass('nav-active');

                    $('.nav-active').css({background:'#fff'});
                    $(this).siblings().css({background:'#F2F3F5'});

                    var gc_id = $(this).attr("data-gc-id");
                    renderChildClass(gc_id);

                    // 记住当前点击的分类
                    if(window.sessionStorage){
                        sessionStorage.setItem("current_gc_id", gc_id);
                    }

                });
                $('.nav-list').slimScroll({width: '80px', height: '100vh',alwaysVisible: false, size: '0'})
            }
        },
    });

    function renderChildClass(gc_id){
        //激活当前子分类样式
        var active = $("li[data-gc-id='"+ gc_id +"']");
        active.siblings().removeClass('current');
        active.addClass('current');

        if (window.sessionStorage && sessionStorage.getItem("child-class-" + gc_id) != null) {
            $("#child-class").html(sessionStorage.getItem("child-class-" + gc_id));
        }else{
            //获取当前子分类内容并渲染
            $.ajax({
                type:'get',
                url:ApiUrl+"/index.php?act=index&op=getchildgoodsclass",
                data:{gc_id: gc_id},
                dataType:'json',
                success:function(result){
                    var data =  result.datas;
                    if(!data.error){
                        var html = template.render('stpl_child_level_goods_class',data);
                        $("#child-class").html(html);

                        if(window.sessionStorage){
                            sessionStorage.setItem("child-class-" + gc_id, html);
                        }
                    }
                },
            });

        };
    }

});