MYAPP.ready(function(){
	$.ajax({
		url:ApiUrl+"/index.php?act=store_show&op=getStoreCategroy&store_id="+GetQueryString("store_id"),
		type:'get',
		dataType:'json',
		success:function(result){
			var html = template.render('category2', result.datas);
			$("#content").append(html);

			$(".category-seciond-item").click(function (){
                if($(this).hasClass('open-sitem')){
                    $(this).removeClass('open-sitem');
                }else{
                   $(this).addClass('open-sitem');
                }
			});

		}
	});
});