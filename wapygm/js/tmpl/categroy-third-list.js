MYAPP.ready(function() {
	$.ajax({
		url:ApiUrl+"/index.php?act=goods_class&gc_id="+GetQueryString("gc_id"),
		type:'get',
		dataType:'json',
		success:function(result){
			var data = result.datas;
			data.WapSiteUrl = WapSiteUrl;
			var html = template.render('category-three', data);
			$("#content").html(html);
		}
	});
});