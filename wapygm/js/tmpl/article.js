MYAPP.ready(function(){
    var article_id = GetQueryString("article_id");
    //初始化列表
    function initArticle(){
        $.ajax({
            type:'get',
            url:ApiUrl+"/index.php?act=article&op=article_detail",
            data:{article_id:article_id},
            // dataType:'json',
            beforeSend:ajaxLoading,
            success:function(result){
                $("#article").html(result);
            },
           complete:ajaxLoadingComplete,
        });
    }
    initArticle();
});