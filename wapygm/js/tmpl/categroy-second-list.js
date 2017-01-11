MYAPP.ready(function(){

    //回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});

	$.ajax({
		url:ApiUrl+"/index.php?act=goods_class&gc_id="+GetQueryString("gc_id"),
		type:'get',
		dataType:'json',
		success:function(result){
			var html = template.render('category-two', result.datas);
			$("#content").append(html);
            //判断是否有下级
			$(".second-menu-list").each(function (){
				var gc_id = $(this).attr('gc_id');
				var self = this;
				$.ajax({
					url:ApiUrl+"/index.php?act=goods_class&gc_id="+gc_id,
					type:'get',
					dataType:'json',
					success:function(result){
						if(result.datas.class_list.length > 0){
                            var locUrl = WapSiteUrl+"/tmpl/product_second_categroy.html?gc_id="+gc_id;
							$(self).attr("onclick","MYAPP.gopage('productList', '"+locUrl+"',{title:'商品分类',showCart:0,headerAlpha:1})");
						}else{
                            var locUrl = WapSiteUrl+"/tmpl/product_list.html?gc_id="+gc_id;
                            $(self).attr("onclick","MYAPP.gopage('productList', '"+locUrl+"',{title:'商品列表',showCart:0,headerAlpha:1})");
						}
					}
				});
			});
		}
	});

    //请求新品
    $.ajax({
        url:ApiUrl+"/index.php?act=goods&op=goods_list&gc_id="+GetQueryString("gc_id")+"&page=10&key=4",
        type:'get',
        dataType:'json',
        success:function(result){
            if(result.datas){
                var html = template.render('new-products', result.datas);
                $("#products-list").append(html);
            }
        }
    });
});