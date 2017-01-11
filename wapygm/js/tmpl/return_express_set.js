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
				url:ApiUrl+"/index.php?act=return&op=ship",	
				data:{key:key, order_id:order_id, goods_id:goods_id},
				dataType:'json',
				success:function(result){
					checklogin(result.login);
					if(result.datas.express_list==null){
						return false;
					}
					var data = result.datas;
					var html = template.render('sexpress_list', data);
					
					$("#express_list").html(html);

					//点击提交退款的post数据
					$('#express_confirm_button').click(postExpress);
				}
			});
		}
		initPage();

		// 表单的提交
		function postExpress(){


			var express_id = $('#express_id').val();
			var invoice_no = $('input[name=invoice_no]').val();
			if (express_id  == '') {
				$('#return_notice').html("请选择快递公司");
                return false;
			}
            if (invoice_no == '') {
				$('#return_notice').html("请填写物流单号");
			}
			
			if (invoice_no != '') {
				$('#return_notice').hide();

				$.ajax({
				type:'post',
				url:ApiUrl+"/index.php?act=return&op=add_ship",
				
				data:{
					key:key,
					express_id:express_id,
					invoice_no:invoice_no,
					order_id:order_id,
					order_goods_id:goods_id,
				},
			
				dataType:'json',
				success:function(result){
//					$('#express_confirm_button').empty();
					//var back_url="<a onclick=" + '"'+"MYAPP.gopage("+"'returnResult'," +"WapSiteUrl+" + "'/tmpl/member/refund_return_detail.html?order_id="+ order_id +"&goods_id="+ goods_id +"');"+'"' +" class="+'"'+""+'"' + ">上传成功 返回</a>";
					//$('#express_confirm_button').html('上传成功');
                    if(result.datas == '1'){
                        MYAPP.gopage('orderDetail', WapSiteUrl + '/tmpl/member/refund_return_detail.html?order_id='+order_id+'&goods_id='+goods_id,{title:'订单详情',showCart:0,headerAlpha:1});
                    }else{
                        alert('提交失败');
                    }
				}
				});
			}
		}
});