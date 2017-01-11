MYAPP.ready(function(){

	$(function() {
		$('#mobile').bind('input propertychange', function() {
			if ($(this).val().length == 11 && $(this).val().match(/^1[3|4|5|7|8][0-9]\d{8,8}$/)) {
				$('#sendbtn').css('color','#29AAE3').click(sendSMS);
			} else {
				$('#sendbtn').css('color','gray').unbind("click");
			}
		});				
	});

	function sendSMS(){	
		var com_id = GetQueryString("com_id");
		$('#sendbtn').removeClass('sendbtn-valid').unbind("click");
		var mobile = $('#mobile').val();
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=register&op=get_verify_code",	
			data:{mobile:mobile,com_id:com_id},
			dataType:'json',
			success:function(ret){
				if(ret){
					if(!ret.datas.error){
						time(document.getElementById("sendbtn"));
					}else{
						if(ret.datas.error){
							$("#sendbtn").unbind("click");	
							$('#sendbtn').removeClass('sendbtn-valid');
							$.sDialog({
					        	skin:"red",
					        	content:ret.datas.error,
					        	cancelBtn: false,
					        })
							return;
						}
					}
				}
			}
		})				
	}
	
	//倒计时
	var wait = 90;
	document.getElementById('sendbtn').disabled = false;
	function time(o) {
		if (wait == 0) {
			o.removeAttribute("disabled");
			$('#sendbtn').addClass('sendbtn-valid').click(sendSMS);
			o.value = "获取验证码";
			wait = 90;
		} else {
			o.setAttribute("disabled", true);
			$('#sendbtn').removeClass('sendbtn-valid');
			o.value = "" + wait + "秒后重发";
			wait--;
			setTimeout(function() {
				time(o)
			}, 1000)
		}
	}
	
	$('#reg').click(function(){	
		var mobile = $("#mobile").val();
		var verify = $("#yzm").val();
		var password = $("#password").val();
		var repassword = $("#repassword").val();
		var invite = GetQueryString("invite");
		var com_id = GetQueryString("com_id");
		if(mobile.length == 0){
	        $.sDialog({
	        	skin:"red",
	        	content:"手机号不能为空!",
	        	cancelBtn: false,
	        })	        
			return;
		}
		if (mobile.length != 11 || mobile != mobile.match(/^1[3|4|5|7|8][0-9]\d{8,8}$/)) {
	        $.sDialog({
	        	skin:"red",
	        	content:"手机号不正确",
	        	cancelBtn: false,
	        })
			return;
		}
		if(verify.length == 0){
			$.sDialog({
	        	skin:"red",
	        	content:"验证码不能为空",
	        	cancelBtn: false,
	        })
			return;
		}
		if(password.length == 0){
			$.sDialog({
	        	skin:"red",
	        	content:"密码不能为空",
	        	cancelBtn: false,
	        })
			return;
		}
		if (password.length < 6) {
			$.sDialog({
	        	skin:"red",
	        	content:"密码不足6位",
	        	cancelBtn: false,
	        })
			return;
		}
		if (password.length > 16) {
			$.sDialog({
	        	skin:"red",
	        	content:"密码不能超过16位",
	        	cancelBtn: false,
	        })
			return;
		}
		if(password != repassword){
			$.sDialog({
	        	skin:"red",
	        	content:"两次输入的密码不相同",
	        	cancelBtn: false,
	        })
			return;
		}
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=register&op=index",	
			data:{mobile:mobile,verify:verify,password:password,repassword:repassword,invite:invite,com_id:com_id},
			dataType:'json',
			success:function(result){
				if(!result.datas.error){					
					$.sDialog({
	                    skin:"green",
	                    content:"注册成功!请下载app登录",
	                    okBtn:true,
	                    cancelBtn: false,
	                    okFn:function() {
	                    	if(com_id==1035){ //奉节橙
	                    		MYAPP.gopage({'url':'http://a.app.qq.com/o/simple.jsp?pkgname=com.moyun.fjc'});
	                    	}else if(com_id==1029){//互助
	                    		MYAPP.gopage({'url':'http://a.app.qq.com/o/simple.jsp?pkgname=com.moyun.mhtgx'});
	                    	}
	                    	
	                    }
	                  });
					
				}else{
					$.sDialog({
			        	skin:"red",
			        	content:result.datas.error,
			        	cancelBtn: false,
			        })
					return;
					
				}
			}
		});			
		
	});
});