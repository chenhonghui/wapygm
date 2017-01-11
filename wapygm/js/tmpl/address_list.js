MYAPP.ready(function(){
	var key = getLocalStorage('key');
	if(key==''){
		gotoLoginPage();
		return false;
	}

	initPage('');

	//初始化列表
	function initPage(keyword){
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=member_address&op=address_list" +'&keyword='+keyword,
			data:{key:key},
			dataType:'json',
			beforeSend:ajaxLoading,
			success:function(result){
				checklogin(result.login);
				if(result.datas.address_list==null){
					return false;
				}
				var data = result.datas;
				var html = template.render('saddress_list', data);
				$("#address_list").empty();
				$("#address_list").append(html);
				//点击删除地址
				$('.adr-del').click(delAddress);
			},
			complete:ajaxLoadingComplete,
		});
	}


	//点击删除地址
	function delAddress(){
		var address_id = $(this).attr('address_id');

		$.sDialog({
			skin: "block",
			content: "您确定要删除吗?",
			"cancelBtnText": "取消",
			"okBtnText": "确定",
			cancelFn: function() {},
			okFn: function() {
				$.ajax({
					type: 'post',
					url: ApiUrl + "/index.php?act=member_address&op=address_del",
					data: {address_id:address_id, key:key},
					dataType: 'json',
					success: function(result) {
						checklogin(result.login);
						if (result) {
							initPage('');
						}
					}
				});
			},
		});
	}
});