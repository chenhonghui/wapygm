MYAPP.ready(function() {
    var news_id = GetQueryString("news_id");
    //获取新鲜事数据
    function initNews() {
        $.ajax({
            type: 'get',
            url: ApiUrl + "/index.php?act=news&op=index",
            data: { news_id: news_id },

            dataType: 'json',
            success: function(result) {
                if(result.datas.member_name==null){
                    $("#news").empty();
                    var html2 = template.render('del');
                    $("#news").append(html2);
                    return false;
                }
                var data = result.datas;
                var html = template.render('snews', data);
                $("#news").empty();
                $("#news").append(html);
            }
        });
    }
    initNews();
});
