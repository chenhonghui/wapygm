MYAPP.ready(function(){
	var key = getLocalStorage('key');
	if(key==''){
		gotoLoginPage();
		return false;
	}

	var order_id = GetQueryString("order_id");

	var goods_id = GetQueryString("goods_id");

	function initPage(){
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=member_order&op=refund_return_detail",
			data:{key:key,order_id:order_id,goods_id:goods_id},
			dataType:'json',
			beforeSend:ajaxLoading,
			success:function(result){
				checklogin(result.login);//检测是否登录了
				var data = result.datas;

				//获取数据 渲染模板

				//渲染模板
	            var html = template.render('refund_return_detail', data);
	            //console.log(data);

	            $("#exchange-protocol-wp").html(html);

				//回到顶部 监听及效果
				$(window).scroll(scrollTopIcon);
				$('#gotop').click(function () {scroll('0px', 50);});
			},
			complete:ajaxLoadingComplete,
		});
	}
	//初始化页面
	initPage();
});