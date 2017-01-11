MYAPP.ready(function(){
	var key = getLocalStorage('key');
	if(key==''){
		gotoLoginPage();
	}

	//初始化
	function initPage(){
		$('#friend-mobile-btn').click(postFriendPay); //提交数据
	}
	initPage();

	// 表单的提交 让后台去发短信
	function postFriendPay(){
		var pay_sn = GetQueryString("pay_sn");
		var order_type = GetQueryString("order_type");
		var mobile = ''; // 在客户端让用户自己选号码

		// ajax请求 用于提交代付人手机号并发送短消息
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=friend_pay_apply&op=apply",
			beforeSend:ajaxPosting,
			data:{
				key:key,
				pay_sn:pay_sn,
				order_type:order_type,
			},
		
			dataType:'json',
			success:function(result){
				if(result.datas.company_name==null){
					result.datas.company_name='购物网站上';
				}
				if (result.datas.state == 1) {

					var msg_txt = '我在'+ result.datas.company_name +'买了' + result.datas.buy_num +'件商品，需要付款￥' + result.datas.pay_amount_online +'元，帮我付一下。这是付款链接：'+ result.datas.friend_pay_url +'';

					// 调用app 发送短信
					MYAPP.sendShortMessage(mobile, msg_txt);

					// 成功
					$.sDialog({
                        skin:"green",
                        content:"成功，即将进入发短信界面！",
                        okBtn:false,
                        cancelBtn:false
                	});
				}else{
					// 失败
					$.sDialog({
                        skin:"red",
                        content:"抱歉，申请失败，一会儿再试！",
                        okBtn:false,
                        cancelBtn:false
                	});
				}	
			}
		});
	}
});