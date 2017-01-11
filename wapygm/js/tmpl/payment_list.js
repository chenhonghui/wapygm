$(function(){
    var key = getLocalStorage('key');
    if(key==''){
        gotoLoginPage();
        return false;
    }

    var pay_sn = GetQueryString("pay_sn");

    //库存判断
    var goods_storage = new Array();
    $.ajax({
        url:ApiUrl+"/index.php?act=member_buy&op=check_goods_storage",
        data:{pay_sn:pay_sn,key:key},
        type:'get',
        dataType:'json',
        success:function(result){
            goods_storage = result.datas;
            initPage();
        }
    });

    //初始化页面
    function initPage(){
        $.ajax({
            type:'post',
            url:ApiUrl+"/index.php?act=payment_list&op=list",
            data:{key:key},
            dataType:'json',
            beforeSend:ajaxLoading,
            success:function(result){
                checklogin(result.login);
                var data = result.datas;
                data.WapSiteUrl = WapSiteUrl;
                var html = template.render('spayment_list', data);
                $("#payment_list").html(html);

                // 选择支付通道
                $('.ncc-payment-list > li').on('click',function(){
                    $('.ncc-payment-list > li').removeClass('using');
                    $(this).addClass('using');
                    $('#payment_code_tmp').val($(this).attr('payment_code'));
                });

                //只在微信内核中显示微信支付
                if (!isWeiXin()) {
                    $("li[payment_code='wxpay']").remove();
                }

                // 不是app，屏蔽亲友代付
                if (!isMoyunApp()) {
                    $("li[payment_code='friend']").remove();
                }

                //默认选中第一个li
                $(".ncc-payment-list li:first").click();

                //屏蔽ios
                /*var mobile_os = MYAPP.getOSName();
                if (mobile_os == 'ios') {
                    $(".ncc-payment-list li:last").hide();
                }*/

                //库存判断
                if(goods_storage.goods_storage == 0 && goods_storage.goods_name.length){
                    $('#confirm_button').hide();
                    var html = '<div id="payment-order-content">';
                    for(var i=0;i<goods_storage.goods_name.length;i++){
                        html += '<p class="hint">' + goods_storage.goods_name[i]+'</p>';
                    }
                    html += '<h2>对不起，该商品被抢光了，下次动作快点哦！</h2></div>';
                    $("#payment_order").html(html);
                }

                // 支付方式确认检测
                var button_laoding = false;
                $('#confirm_button').on('click',function(){
                    if(button_laoding) return false;
                    button_laoding=true;
                    setTimeout(function(){button_laoding=false;}, 3000);

                    $('#payment_code').val($('#payment_code_tmp').val());

                    //检测数据是否完整
                    var pay_sn = $('input[name=pay_sn]').val();
                    var order_type = $('input[name=order_type]').val();
                    var key = $('input[name=key]').val();

                    // 满足条件才进行下一步
                    if(typeof(pay_sn) != 'undefined' && typeof(order_type) != 'undefined' && typeof(key) != 'undefined'){

                        //检测亲友代付 实现路由分发 此js与payment_info是异步的，一定要注意
                        if ($('#payment_code').val() == '') {
                            $('#msg').html("请选择支付方式");
                        }else if($('#payment_code').val() == 'friend'){
                            MYAPP.gopage('friendPayApply', WapSiteUrl+'/tmpl/friend_pay_apply.html?key=' + key + '&pay_sn=' + pay_sn  + '&order_type=' + order_type,{title:'亲友代付',showCart:0,headerAlpha:1});
                        }else if($('#payment_code').val() == 'alipay' && isWeiXin() ){ //如果选择支付宝 且 在微信里面
                                window.scrollTo(0,0);
                                $('.transparent_bg').show();
                        }else{
                            postPayData();
                        }

                    }else{
                        postPayData();
                    }

                    $('.transparent_bg').on('click', function(){
                        $(this).hide();
                    });

                });
            },
            complete:ajaxLoadingComplete,
        });
    }

    function postPayData() {
        $.ajax({
            url:ApiUrl+"/index.php?act=member_buy&op=check_goods_storage",
            data:{pay_sn:pay_sn,key:key},
            type:'get',
            dataType:'json',
            success:function(result){
                if(result.datas.goods_storage == 0){
                    var html = '';
                    if(result.datas.error){
                        html = result.datas.error;
                    }else{
                        for(var i =0; i < result.datas.goods_name.length; i++){
                            html += result.datas.goods_name[i];
                            html += ';<br>';
                        }
                        html += '对不起，该商品被抢光了，下次动作快点哦！';
                    }

                    $.sDialog({
                        skin:"block",
                        content:html,
                        okBtn:true,
                        cancelBtn:false,
                        okFn:function (){
                            MYAPP.gopage('orderList', WapSiteUrl + '/tmpl/member/order_list.html',{title:'我的订单',showCart:0,headerAlpha:1});
                            $('#confirm_button').hide();
                        }
                    });

                }else{
                    $('#buy_form').submit();
                }
            }
        });
    }

});