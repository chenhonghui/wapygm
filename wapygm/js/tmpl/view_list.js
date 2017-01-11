MYAPP.ready(function(){
	//回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});
	var goods = getLocalStorage('goods');
	var goods_info = goods.split('@');

	if(goods_info.length>0 && goods){
		for(var i=0;i<goods_info.length;i++){
			AddViewGoods(goods_info[i]);
		}
	}else{
		var html = '<li><div class="more-btn">没有符合条件的记录</div></li>';
		$('#viewlist').append(html);
	}	
});

function AddViewGoods(goods_id){
    var com_id = getComId();
	$.ajax({
		type:'get',
		url:ApiUrl+'/index.php?act=goods&op=goods_detail&goods_id='+goods_id+'&com_id='+com_id,
		dataType:'json',
		success:function(result){
            if(result.datas.goods_info){
                var pic = result.datas.goods_image.split(',');
                var html = '<li onclick="MYAPP.gopage(\'goodsDetail\', WapSiteUrl + \'/tmpl/product_detail.html?goods_id='+result.datas.goods_info.goods_id+'\',{title:\'商品详情\',showCart:1,headerAlpha:0});">'
                    +'<a href="javascript: void(0);" class="mf-item clearfix">'
                    +'<span class="mf-pic">'
                    +'<img src="'+pic[0]+'"/>'
                    +'</span>'
                    +'<div class="mf-infor">'
                    +'<p class="mf-pd-name">'+result.datas.goods_info.goods_name+'</p>'
                    +'<p class="mf-pd-price">￥'+result.datas.goods_info.goods_price+'</p></div>';
                +'</a></li>';
                $('#viewlist').append(html);
            }

		}
	});
}