MYAPP.ready(function(){
    //回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});

    //兼容app和浏览器调试
    var comId = getComId();
    $("input[name=comId]").val(comId);

    $.ajax({
        url:ApiUrl+"/index.php?act=goods&op=goods_list&price=1&key=3&order=1&page="+pagesize+"&curpage=1"+'&comId='+comId,
        type:'get',
        dataType:'json',
        success:function(result){
            if(!result.hasmore){
                $('#more-btn').hide();
            }else{
                $('#more-btn').html('点击加载更多...');
            }

            var html = template.render('home_body', result.datas);
            $("#product_list").append(html);
            $("input[name=page]").val(pagesize);
        }
    });

    // 切换排序方式 需要初始化 重新从第一页开始
    $('.product-order').click(function(){
        var page = parseInt($("input[name=page]").val());

        var price = $(this).attr('price');//1.9元区 2.19元区 3.39元区
        var order;

        if($(this).hasClass("current")){
            //这里判断是否点击的是排序
            if($(this).hasClass("up")){
                $(this).removeClass("up");
                $(this).addClass("down");
                //向下排序
                order=2;
            }else{
                $(this).removeClass("down");
                $(this).addClass("up");
                //向上排序
                order=1;
            }
        }else{
            var index=$(this).index();
            $(".product-order").removeClass("current");
            $(this).addClass("current");
            var left=index+"00";
            $(".product-list-nva span").css("-webkit-transform","translate("+left+"%,0px)");
            //切换列表
            if($(this).hasClass("up")){
                //向上
                order=1;
            }else{
                //向下
                order=2;
            }
        }

        var url = ApiUrl+"/index.php?act=goods&op=goods_list&key=3&price="+price+"&order="+order+"&page="+page+"&curpage=1"+'&comId='+comId;

        $.ajax({
            url:url,
            type:'get',
            dataType:'json',
            beforeSend:ajaxLoading,
            success:function(result){

                if(!result.hasmore){
                    $('#more-btn').hide();
                }else{
                    $('#more-btn').html('点击加载更多...');
                    $('#more-btn').show();
                }

                var html = template.render('home_body', result.datas);
                $("#product_list").empty();
                $("#product_list").append(html);

                $("input[name=price]").val(price);
                $("input[name=order]").val(order);
                $("input[name=curpage]").val(1);
            },
            complete:ajaxLoadingComplete,
        });
    });

    $('.more-vailable').click(function(){//下一页
        var price = parseInt($("input[name=price]").val());
        var order = parseInt($("input[name=order]").val());
        var page = parseInt($("input[name=page]").val());
        var curpage = eval(parseInt($("input[name=curpage]").val())+1);

        var url = ApiUrl+"/index.php?act=goods&op=goods_list&key=3&price="+price+"&order="+order+"&page="+page+"&curpage="+curpage+'&comId='+comId;
        $.ajax({
            url:url,
            type:'get',
            dataType:'json',
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
});