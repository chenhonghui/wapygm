MYAPP.ready(function() {
	var comId = MYAPP.getAppInfo().comId;
	$.ajax({
		url:ApiUrl+"/index.php?act=goods_class",
		type:'get',
		jsonp:'callback',
		dataType:'jsonp',
		success:function(result){
			var data = result.datas;
			data.WapSiteUrl = WapSiteUrl;
			data.comId = comId;
			var html = template.render('category-one', data);
			$("#categroy-cnt").html(html);
		}
	});
});