MYAPP.ready(function() {
	var activity_id = GetQueryString("activity_id");
    function initPage(){
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=activity&op=detail",
			data:{activity_id:activity_id},
			dataType:'json',
			beforeSend:ajaxLoading,
			success:function(result){
				var data = result.datas;
	            var html = template.render('activity_detail_list', data);
	            $("#activity_detail_show").html(html);
			},
			complete:ajaxLoadingComplete,
		});
	}
	//初始化页面
	initPage();
});