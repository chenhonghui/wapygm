MYAPP.ready(function(){

    var key = getLocalStorage('key');
    if(key==''){
        gotoLoginPage();
        return false;
    }

	//回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});

	var goods_id = GetQueryString("goods_id");
	var store_id = GetQueryString("store_id");

	$.ajax({
		type:'get',
		url:ApiUrl+'/index.php?act=voucher&op=voucher_get',
		data:{goods_id:goods_id,store_id:store_id,key:key},
		dataType:'json',
		success:function(result){
            checklogin(result.login);
            var data = result.datas;
            var html = template.render('stpl_voucher_template', data);
            $(".voucher_template").html(html);
            //领取优惠券
            $('.butn').click(getVoucher);
		}
	});

    //领取优惠券
    function getVoucher(){
        var vid = $(this).attr("vid");
        var self = this;
        if(vid){
            $.ajax({
                type:'post',
                url:ApiUrl+'/index.php?act=voucher&op=voucherChange',
                data:{vid:vid,key:key},
                dataType:'json',
                success:function(result){
                    if(!result.datas.error && result.datas == 1){
                        $(self).html('已领取');
                        $(self).removeClass('butn');
                        $(self).unbind("click");
                        $.sDialog({
                            skin:"red",
                            content:'领取成功',
                            okBtn:true,
                            cancelBtn:false
                        });
                    }else{
                        $.sDialog({
                            skin:"red",
                            content:result.datas.error,
                            okBtn:true,
                            cancelBtn:false
                        });
                    }
                }
            });
        }
    }

});

