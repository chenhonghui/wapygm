MYAPP.ready(function(){
    //传递token值
    var key = getLocalStorage('key');
    if(key==''){
        gotoLoginPage();
        return false;
    }

    //兼容app和浏览器调试
    var com_id = getComId("com_id");
    $("input[name=com_id]").val(com_id);

    //回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});

    var fitgroup_id = GetQueryString('fitgroup_id');

    // 加载当前页数据
    $.ajax({
        url:ApiUrl+"/index.php?act=fitgroup&op=fitgroup_invite"+'&com_id='+com_id,
        type:'get',
        dataType:'json',
        data:{key:key,fitgroup_id:fitgroup_id},
        success:function(result){

            var html = template.render('home_body', result.datas);
            $("#content").html(html);
        }
    });
});
