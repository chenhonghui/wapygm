MYAPP.ready(function(){
	// 亲友代付 不需要cookie验证
	var pay_sn = GetQueryString("pay_sn");

	//初始化
	initPage();

	//获取订的商品信息
	function initPage(){
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=friend_order_info&op=info",
			data:{pay_sn:pay_sn},
			dataType:'json',
			beforeSend:ajaxLoading,
			success:function(result){
				var data = result.datas;
				var html = template.render('order-list-tmpl', data);
				$("#order-list").html(html);
                initPayMentPage();
			},
			complete:ajaxLoadingComplete,
		});
	}

	//获取该pay_sn的支付状况
	function initPayMentPage(){
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=friend_payment_list&op=info",
			data:{pay_sn:pay_sn},
			dataType:'json',
			success:function(result){
				if(result==null || result.datas.payment_info.order_state != 10){
					//无法支付
                    $('#error_msg').show();
                    if(result && result.datas.payment_info.order_state > 10){
					    $('#error_msg').html("已完成支付");
					    document.title='付款页面(已支付)';
					    $('#header-title').html("付款页面(已支付)");
                        if(!isMoyunApp()){
                            $('.wxpay-hint').show();
                        }
                    } else if (result && result.datas.payment_info.order_state == 0){
					    document.title='付款页面(已取消)';
					    $('#header-title').html("付款页面(已取消)");
                        $('#error_msg').html("订单已取消");
                    } else {
					    $('#error_msg').html("订单状态异常，请联系客服");
					    document.title='付款页面(订单异常)';
					    $('#header-title').html("付款页面(订单异常)");
                    }

					//完成了支付也显示订单信息
					var data = result.datas;
					var html = template.render('spayment_info', data);
					$('#payment_info').html(html);
					return false;
				}else{
					$('#confirm_button').unbind();
					var data = result.datas;
					var order_state = result.datas.payment_info.order_state;
					if (order_state == 10) {
						var html = template.render('spayment_info', data);
						$('#payment_info').html(html);

						//可以支付
						initPaymentList();
					}
				}
			}
		});
	}

	//支付方式初始化 获取支付通道
	function initPaymentList(){
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=friend_payment_list&op=list",
			dataType:'json',
			success:function(result){
				var data = result.datas;
				data.WapSiteUrl = WapSiteUrl;
                var still_pay_amount_sum= parseFloat($('#still_pay_amount_sum').val());
                if(!isNaN(still_pay_amount_sum) && still_pay_amount_sum > 0){
                    data.still_pay_amount_sum = still_pay_amount_sum;
                }else{
                    $.sDialog({
                        skin:"red",
                        content:"支付金额获取失败",
                        okBtn:true,
                        cancelBtn:false
                    });
                    return false;
                }
				var html = template.render('spayment_list', data);
				$("#payment_list").html(html);

                if (!isWeiXin()) {
                    $("li[payment_code='wxpay']").remove();
                }else{
                    $("li[payment_code='alipay']").remove();
                }

				// 支付方式确认检测
				var loading=false;

				$('.pay_line').on('click',function(){
                    $('#payment_code').val($(this).attr('payment_code'));
                    if ($('#payment_code').val() == '') {
                        $.sDialog({
                            skin:"red",
                            content:"请选择支付方式",
                            okBtn:true,
                            cancelBtn:false
                        });
                    } else {
                        if(loading) return false;
                        loading=true;
                        setTimeout(function(){loading=false;}, 3000);
                        $('#buy_form').submit();
                    }
				});
			}
		});
	}

});