MYAPP.ready(function(){
	var key = getLocalStorage('key');
	if(key==''){
		gotoLoginPage();
		return false;
	}
    var keyword_length = 0;

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
                //选择跳转
                $('div[data-address-id]').click(gotoBuy);
			},
			complete:ajaxLoadingComplete,
		});
	}

    var search_history = localStorage.getItem('address_search_history');
    if(search_history){
        var history_arr = search_history.split(',');
        var html = '';
        for(var i=0; i<history_arr.length; i++){
            html += '<li>'+history_arr[i]+'</li>';
        }
        $('#search_history').html(html);

        $('#search_history').find('li').click(function(){
            var keyword = $(this).html();
            $('input[name=addr-search]').val(keyword);
            initPage(keyword);
        });
    }

    //清空历史记录
    $('#orderClean').click(function(){
        localStorage.removeItem('address_search_history');
        $('#search_history').html('');
    });

    function search(keyword){
        if(keyword){
            if(search_history){
                //保存前检测重复
                var history_arr = search_history.split(',');
                for(var i=0; i<history_arr.length; i++){
                    if(history_arr[i] == keyword) break;
                }
                if(i == history_arr.length){
                    localStorage.setItem('address_search_history', keyword+','+search_history);
                }
            }else{
                localStorage.setItem('address_search_history',keyword);
            }
        }
        initPage(keyword);
    }

    $('input[name=addr-search]').on('blur keyup', function(e){
        var keyword = $('input[name=addr-search]').val();
        if(keyword.length > 0 && keyword.length != keyword_length){
            keyword_length = keyword.length;
            initPage(keyword);
        }else{
            keyword_length = keyword.length;
        }
        if (e.type == 'blur') {
            search(keyword);
    	}
    	if (e.type == 'keyup' && e.keyCode === 13) {
            search(keyword);
    	}
    });

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

    //选择跳转
    function gotoBuy(){
        var address_id = $(this).attr('data-address-id');
        addLocalStorage('address_id',address_id);
        if (isMoyunApp()) {
            //app
            if(getLocalStorage('buy_step1_url')){
                MYAPP.gopage({'url':getLocalStorage('buy_step1_url')});
            }else{
                MYAPP.goBack({'jsCallback':"backRefresh"});
            }
        }else{
            if(getLocalStorage('buy_step1_url')){
                window.location.href = decodeURIComponent(getLocalStorage('buy_step1_url'));
            }else{
                window.location.href = document.referrer;
            }
        }
    }
});