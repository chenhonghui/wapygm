MYAPP.ready(function(){
		var key = getLocalStorage('key');
		if(key==''){
			gotoLoginPage();
			return false;
		}

		var pay_sn = GetQueryString("pay_sn");

		//初始化列表
		function initPage(){
			$.ajax({
				type:'post',
				url:ApiUrl+"/index.php?act=payment_list&op=info",	
				data:{key:key, pay_sn:pay_sn},
				dataType:'json',
				success:function(result){
					checklogin(result.login);
					if(result.datas.payment_info==null){
						return false;
					}
					var data = result.datas;

					var html = template.render('spayment_info', data);
					
					$("#payment_info").html(html);

				}
			});
		}
		initPage();


});