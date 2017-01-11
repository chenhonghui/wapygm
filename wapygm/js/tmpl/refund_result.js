MYAPP.ready(function(){
		var key = getLocalStorage('key');
		if(key==''){
			gotoLoginPage();
			return false;
		}

		var order_id = GetQueryString("order_id");
		var goods_id = GetQueryString("goods_id");

		//初始化列表
		function initPage(){
			$.ajax({
				type:'get',
				url:ApiUrl+"/index.php?act=refund_result&op=view",	
				data:{key:key, order_id:order_id, goods_id:goods_id},
				dataType:'json',
				success:function(result){
					checklogin(result.login);
					if(result.datas.address_list==null){
						return false;
					}
					var data = result.datas;
					var html = template.render('saddress_list', data);
					
					$("#address_list").html(html);

					//点击提交退款的post数据
					$('#refund_confirm_button').click(postAddRefund);
				}
			});
		}
		initPage();
		//点击删除地址


		// 表单的提交
		function postAddRefund(){

			var refund_type = $('input[name=refund_type]:checked').val();
			var refund_amount = $('input[name=refund_amount]').val();
			var goods_num = $('input[name=goods_num]').val();
			var buyer_message = $('input[name=buyer_message]').val();
			

			// 收集表单数据

			$.ajax({
				type:'post',
				url:ApiUrl+"/index.php?act=refund_result&op=add_refund&order_id="+order_id+"&goods_id="+goods_id,
				
				data:{
					key:key,
					refund_type:refund_type,
					refund_amount:refund_amount,
					goods_num:goods_num,
					buyer_message:buyer_message,
				},
			
				dataType:'json',
				success:function(result){
					// checklogin(result.login);
					// if(result){
					// 	initPage();
					// }
					$('#refund_confirm_button').append("ajxa已经执行");
				}
			});

			$('#refund_confirm_button').hide();

			$('#shiny_back_button').html("已提交，待审核");

			return false;
		}



});