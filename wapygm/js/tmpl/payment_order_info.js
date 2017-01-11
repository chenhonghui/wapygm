$(function(){
		var key = getLocalStorage('key');
		if(key==''){
			gotoLoginPage();
			return false;
		}

		var pay_sn = GetQueryString("pay_sn");

		initPage();

		//初始化列表
		function initPage(){
			$.ajax({
				type:'get',
				url:ApiUrl+"/index.php?act=payment_list&op=getOrderInfo",
				data:{key:key, pay_sn:pay_sn},
				dataType:'json',
				success:function(result){
					var data = result.datas;
					var html = template.render('spayment_order', data);
					$("#payment_order").html(html);
					//计算还有多少秒钟过期
					var time_left = parseInt($('input[name=time_left]').val());
					var intDiff = time_left;
					timer(intDiff);
				}
			});
		}

	    function timer(intDiff){
	        window.setInterval(function(){

	        var day=0,
	            hour=0,
	            minute=0,
	            second=0;//时间默认值
	        if(intDiff > 0){
	            day = Math.floor(intDiff / (60 * 60 * 24));
	            hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
	            minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
	            second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
	        }
	        if (hour <= 9) hour = '0' + hour;
	        if (minute <= 9) minute = '0' + minute;
	        if (second <= 9) second = '0' + second;

	        // $('#day_show').html(day+"天");
	        $('#hour_show').html('<s id="h"></s>'+hour+'时');
	        $('#minute_show').html('<s></s>'+minute+'分');
	        $('#second_show').html('<s></s>'+second+'秒');
	        intDiff--;

	        }, 1000);
	    }
	    MYAPP.ready(function(){
	        // timer(intDiff);
	    });
});