MYAPP.ready(function(){
    var key = getLocalStorage('key');
    if(key==''){
        gotoLoginPage();
        return false;
    }

    var order_id = GetQueryString("order_id");
    var pay_sn = GetQueryString("pay_sn");

    function initPage(){
        $.ajax({
            type:'post',
            url:ApiUrl+"/index.php?act=member_order&op=order_detail_more",
            data:{key:key,order_id:order_id,pay_sn:pay_sn},
            dataType:'json',
            beforeSend:ajaxLoading,
            success:function(result){
                checklogin(result.login);
                var data = result.datas;
                if (result.page_total=="0") {
                    var error_html = '<div class="no-record" style="margin:10px;">订单已删除</div>';
                    $("#order-detail-wp").html(error_html);
                    return false;
                }

                data.key =getLocalStorage('key');
                if (data.error) {
                    var error_html = '<div class="no-record" style="margin:10px;">暂无此订单记录</div>';
                    $("#order-detail-wp").html(error_html);
                    return false;
                };

                var html = template.render('order-detail', data);
                $("#order-detail-wp").html(html);

                var order_ids="";
                for(var i in data.order_group_list[0].order_list){
                    order_ids+=data.order_group_list[0].order_list[i].order_id;
                    order_ids+=",";

                }
                order_ids = order_ids.substring(0,order_ids.length-1);

                $(".event-cancel-order").attr("order_ids",order_ids);

                //取消订单
                $(".event-cancel-order").click(cancelOrder);
                //自动取消订单
                //$(".countdown").click(autoCancelOrder);
                //取消并退款
                $(".event-cancel-refund-order").click(cancelRefundOrder);
                //确认订单
                $(".event-sure-order").click(sureOrder);
                //删除订单
                $(".event-delete-order").click(deleteOrder);
                //提醒发货
                $(".event-remind-delivery").click(remindDelivery);

                //计算自动收货时间
                autoFinishOrder();
                //加载店铺信息
//                initStoreLogo();
                //自提信息
                pick_shipment_extend(data.order_group_list[0]['order_list'][0]);

            },
            complete:ajaxLoadingComplete,
        });
    }
    //初始化页面
    initPage();

    //js倒计时 自动取消订单
    function autoCancelOrder(){
        var self = $(this);
        var order_id = self.attr("order_id");

        $.ajax({
            type:"post",
            url:ApiUrl+"/index.php?act=member_order&op=auto_order_cancel",
            data:{order_id:order_id,key:key},
            dataType:"json",
            success:function(result){
                if(result.datas && result.datas == 1){
                    initPage();
                }
            }
        });

    }

    //取消多店铺订单
    function cancelOrderById(order_ids,buyer_message){
        var ids_arr=order_ids.split(",");
        $(".l-btn-login").removeAttr('onclick');
        for(var k=0;k<ids_arr.length;k++){
            $.ajax({
                type:"post",
                url:ApiUrl+"/index.php?act=member_order&op=order_cancel",
                data:{order_id:ids_arr[k],key:key,buyer_message:buyer_message},
                dataType:"json",
                success:function(result){
//					if(result.datas && result.datas == 1){
//						initPage();
//					}
                }
            });

        }
        initPage();

    }

    //取消订单
    function cancelOrder(e){
        cancelWin.show(this,function(t,d){
            var self = $(d);
            var order_ids = self.attr("order_ids");
            var ids_arr=order_ids.split(",");
            var buyer_message=t;
            $(".l-btn-login").removeAttr('onclick');

            for(var k=0;k<ids_arr.length;k++){
                $.ajax({
                    type:"post",
                    url:ApiUrl+"/index.php?act=member_order&op=order_cancel",
                    data:{order_id:ids_arr[k],key:key,buyer_message:buyer_message},
                    dataType:"json",
                    success:function(result){
//					if(result.datas && result.datas == 1){
//						initPage();
//					}
                    }
                });

            }

            initPage();
        })
    }

    //取消订单并完成退款 适用已支付 未发货订单
    function cancelRefundOrder(e){
        cancelWin.show(this,function(t,d){//这里的this指向事件dom对象
            var self = $(d);
            var order_id = self.attr("order_id");
            var buyer_message=t;
            $.ajax({
                type:"post",
                url:ApiUrl+"/index.php?act=member_order&op=order_cancel_refund",
                data:{order_id:order_id,key:key,buyer_message:buyer_message},
                dataType:"json",
                success:function(result){
                    if(result.datas && result.datas == 1){
                        initPage();
                    }
                }
            });
        });
    }

    //确认订单
    function sureOrder(){
        var self = $(this);
        var order_id = self.attr("order_id");
        $(this).unbind();
        $.ajax({
            type:"post",
            url:ApiUrl+"/index.php?act=member_order&op=order_receive",
            data:{order_id:order_id,key:key},
            dataType:"json",
            success:function(result){
                if(result.datas && result.datas == 1){
                    initPage();
                }
            }
        });
    }

    //删除订单
    function deleteOrder(){
        var self = $(this);
        var order_id = self.attr("order_id");

        $.sDialog({
            skin: "block",
            content: "是否删除此订单?",
            "cancelBtnText": "否",
            "okBtnText": "是",
            cancelFn: function() {},
            okFn: function() {
                $.ajax({
                    type:"post",
                    url:ApiUrl+"/index.php?act=member_order&op=order_delete",
                    data:{order_id:order_id,key:key},
                    dataType:"json",
                    success:function(result){
                        if(result.datas && result.datas == 1){
                            MYAPP.goBack();
                        }
                    }
                });
            },
        });
    }

    //支付成功的订单 提醒发货
    function remindDelivery(){
        var self = $(this);
        var order_id = self.attr("order_id");
        $(this).html("已提醒");
    }

    //计算自动收货时间
    function autoFinishOrder(){
        var delay_time = parseInt($("#auto-finish-order").attr("delay_time"));
        var shipping_time = parseInt($("#auto-finish-order").attr("shipping_time"));

        //是否有延期
        if(delay_time > shipping_time){
            shipping_time = shipping_time + (delay_time - shipping_time);
        }
        shipping_time = shipping_time + 60*60*24*15;
        shipping_time = shipping_time * 1000;

        var date = new Date();
        var nowTime = date.getTime();
        var time = shipping_time - nowTime;
        if(time<0){ return;}
        //计算出相差天数
        var days=Math.floor(time/(24*3600*1000));
        //计算出小时数
        var leave1 = time%(24*3600*1000) ;   //计算天数后剩余的毫秒数
        var hours=Math.floor(leave1/(3600*1000));
        if(hours <= 0){ hours=1;};
        //计算相差分钟数
        var leave2=leave1%(3600*1000) ;       //计算小时数后剩余的毫秒数
        var minutes=Math.floor(leave2/(60*1000));
        //计算相差秒数
        var leave3=leave2%(60*1000) ;     //计算分钟数后剩余的毫秒数
        var seconds=Math.round(leave3/1000);

        if(days>0){
            $("#auto-finish-order").append("自动收货还有 : "+days+" 天 "+hours+" 小时");
        }else{
            $("#auto-finish-order").append("自动收货还有 : "+hours+" 小时 ");
        }
    }

    //加载店铺信息
    function initStoreLogo(){
        var distribute_id = $("#store_label").attr('data-distribute-id');
        var store_id = $("#store_label").attr('data-store-id');

        var url  = ApiUrl+"/index.php?act=store_show&op=store_info";
        if(distribute_id){
            url = ApiUrl+"/index.php?act=store_show_child&op=store_info";
        }
        $.ajax({
            type:"get",
            url:url,
            data:{store_id:store_id,distribute_id:distribute_id},
            dataType:"json",
            success:function(result){
                if(result.datas){
                    $("#store_label").attr('src',result.datas.store_info.store_label_url);
                    //打开QQ
                    var store_aftersales = result.datas.store_info.store_aftersales;
                    if(store_aftersales){
                        $(".order_detail_control_fixed").click(function(e){
                            e.stopPropagation();
                            MYAPP.jump('openQQ', {"QQ": store_aftersales[0].num});
                        });
                    }

                }
            }
        });
    }

    //获取自提信息
    function pick_shipment_extend(order_data){
        var pick_shipment_extend_id = order_data['extend_order_goods'][0]['pick_shipment_extend_id'];
        if(pick_shipment_extend_id != 0){
            $.ajax({
                type:'post',
                url:ApiUrl+'/index.php?act=member_address&op=pick_shipment_info',
                data:{pick_shipment_extend_id:pick_shipment_extend_id,key:key},
                dataType:'json',
                success:function(result){
                    var data = result.datas;
                    if(data){
                        var html ='<h2>自提信息</h2>'+
                            '<p>自提地点：'+data.pick_shipment_info.address+'</p>'+
                            '<p>自提时间：'+data.pick_shipment_info.time+'</p>'+
                            '<p>联系电话：'+data.pick_shipment_info.phone+'</p>'+
                            '<div id="qrcodeBtn" class="order_detail_myod"><img src="../../images/myorder-code.png" alt="点击扫描二维码" /><span>提货二维码</span></div>';
                        $('#pick_shipment').html(html);
                        $('#pick_shipment').show();

                        //生成二维码
                        createQRCode(order_data['order_id'],order_data['store_id']);
                    }
                }
            });
        }
    }

    //生成二维码
    function createQRCode(order_id,store_id){
        var btn=$('#qrcodeBtn');
        var bg=$("#qrcodeWin");
        var cv=$("#qrcode");
        //生成二维码之前清空 防止重复生成
        cv.empty();

        var content = '{"order_id":'+order_id+',"store_id":'+store_id+'}';
        //二维码渲染
        cv.qrcode({
            text	: content,
            render  : "canvas",//设置渲染方式
            width   : 200,   //设置宽度
            height  : 200,   //设置高度
        });
        btn .click(function(){
            bg.show();
        });
        bg.click(function(){
            $(this).hide();
        });
    }



    //取消退款弹窗对象
    var cancelWin = {};
    (function() {
        var df, sf;
        cancelWin.init = function() {//初始化
            this.win = $("#cancelwin");
            this.list = this.win.find("li");
            this.btns = this.win.find(".order_detail_cancelwin_btns");
            //触摸灰色区域禁止body滚动
            this.win.bind("touchmove", function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
            //设置切换选项
            this.list.on("touchend", function() {
                var t = $(this);
                var me = t.find("i");
                if (me.hasClass("icon-weigouxuan")) {
                    cancelWin.list.find(".icon-gouxuanjian").removeClass("icon-gouxuanjian").addClass("icon-weigouxuan");
                    me.removeClass("icon-weigouxuan").addClass("icon-gouxuanjian");
                }
            });
            //确定与取消
            this.btns.on("touchend", function(e) {
                var eve = $(e.target);
                var index, text;
                if (eve.hasClass("order_detail_cancelwin_btn")) {
                    index = eve.index();
                    text = cancelWin.list.find(".icon-gouxuanjian").siblings("span").eq(0).text();
                    if (index === 0) {
                        df !== undefined ? df(text, cancelWin.triggerBtn[0]) : void(0);
                    } else if (index === 1) {
                        sf !== undefined ? sf(text, cancelWin.triggerBtn[0]) : void(0);
                    }
                    cancelWin.hide();
                }
            });
        }
        cancelWin.show = function(dom, successFn, defeatFn) { //打开弹窗
            this.triggerBtn = $(dom);
            sf = typeof successFn === "function" ? successFn : function() {};
            df = typeof defeatFn === "function" ? defeatFn : function() {};
            this.win.show();
        }
        cancelWin.hide = function() { //关闭弹窗
            df = sf = undefined;
            this.win.hide();
            this.list.find(".icon-gouxuanjian").removeClass("icon-gouxuanjian").addClass("icon-weigouxuan");
            this.list.eq(0).find("i").removeClass("icon-weigouxuan").addClass("icon-gouxuanjian");
        }
        cancelWin.init();
    })();
});