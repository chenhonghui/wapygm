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
			url:ApiUrl+"/index.php?act=member_order&op=order_detail",
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

				data.key = getLocalStorage('key');
				if (data.error) {
					var error_html = '<div class="no-record" style="margin:10px;">暂无此订单记录</div>';
					$("#order-detail-wp").html(error_html);
					return false;
				};

	            var html = template.render('order-detail', data);
	            $("#order-detail-wp").html(html);

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
                initStore();
                //自提信息
                pick_shipment_extend(data.order_group_list[0]['order_list'][0]);
                //初始化弹窗(请在页面初始化后调用，函数为选择包裹后执行的回调)
                if(data.order_group_list[0]['order_list'][0]['order_state'] == 30 && data.order_group_list[0]['order_list'][0]['has_shipping'] == '1' && data.order_group_list[0]['order_list'][0]['shipping_list'].length > 1){
                    initDetailAlertwin(function(dom,index){
                        var shipping_code = $(dom).attr('data-code');
                        var express_name = $(dom).attr('data-name');
                        var state_txt = $(dom).attr('data-state-txt');
                        if(state_txt == ''){state_txt='暂无物流信息';};
                        $("#shipping_code").html("物流公司："+shipping_code);
                        $("#express_name").html("物流单号："+express_name);
                        $("#state_txt").html(state_txt);
                    });
                }

                //确认付款
                $(".event-pay-order").click(function(){
                    var order_id = parseInt($(this).attr('order_id'));

                    if(!isNaN(order_id) && order_id > 0){
                        showPayWin(payOrder,[order_id]);
                    }else{
                        $.sDialog({
                            skin:"block",
                            content:'订单错误,不能支付',
                            cancelBtn: false
                        });
                    }
                });
                initPaymentList();
				//初始化上传图片
				var imgMsg=data.order_group_list[0].order_list[0].extend_order_common;
				if(imgMsg.is_idcard == '1'){
                    $("input[name=idcard_number]").val(imgMsg.idcard_number);
					//立即保存图片
					$("#subCard").on("click",function(){
				    	var checkEnd=[];
						var imgs=$(".add_comment_preview_bg2");
                        var idcard_number= $("input[name=idcard_number]").val();
                        if(!idcard_number){
                            $.sDialog({
                                content:"您选择的商品需要提供身份证号",
                                okBtn:true,
                                cancelBtn:false
                            });
                            return false;
                        }
                        if(!IdentityCodeValid(idcard_number)){
                            $.sDialog({
                                content:"请输入正确的身份证号",
                                okBtn:true,
                                cancelBtn:false
                            });
                            return false;
                        }
						if(imgs.length){
							checkEnd= Array.prototype.map.call(imgs,function(t){
								return $(t).find("img").data("src");
							});
						}
				    	if(checkEnd.length!==2){
				            $.sDialog({
				                content:"您选择的商品需要提供身份证正反面照片(2张)以供清关",
				                okBtn:true,
				                cancelBtn:false
				            });
				            return ;
				    	}
				    	else {
				        	$("input[name=idcard_photo]").val(checkEnd.join(","));

				        	$.ajax({
				        		type:"post",
					            url:ApiUrl+"/index.php?act=member_order&op=orderUploadIdcardPhote",
					            data:{key:key,order_id:order_id,idcard_photo:checkEnd.join(","),idcard_number:idcard_number},
					            dataType:"json",
					            success:function(data){
					            	if(data.datas.error==undefined){
						            	$("#subCard div").hide();
						            	$("#subCard span").show();
					            	}
					            	else {
							            $.sDialog({
							                content:"上传失败："+data.datas.error,
							                okBtn:true,
							                cancelBtn:false
							            });
					            	}
					            }
				        	})
				    	}
					});
	            	$("#subCard div").show();
	            	//显示上传身份证
					$("#needCard").removeClass("hide");
					if(imgMsg.idcard_photo_url&&imgMsg.idcard_photo_url.length){//如果已有身份证
						window.initUploadImg(imgMsg.idcard_photo_url,function(img,closeX){
		                	closeX();
//					        var key = getLocalStorage('key');
//					        $.ajax({
//					            type:'post',
//					            url:ApiUrl+"/index.php?act=member_buy&op=del_photo",
//					            data:{key:key,del_photo:$(img).data("src")},
//					            dataType:'json',
//					            success:function(result){
	//					                if(result.datas.error){
	//					                    $.sDialog({
	//					                        skin:"red",
	//					                        content:result.datas.error,
	//					                        okBtn:false,
	//					                        cancelBtn:false
	//					                    });
	//					                }else{
	//					                	closeX();
	//					                }
//					            }
//					        });
						});
					}
					else{
							window.initUploadImg();
					}
                    //仅在侍付款和侍发货状态显示上传
                    if(data.order_group_list[0].order_list[0].order_state != '10' && data.order_group_list[0].order_list[0].order_state != '20'){
                        $("#subCard").hide();
                    }

				}
				//立即上传
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

	//取消订单
	function cancelOrder(e){
		cancelWin.show(this,function(t,d){
				var self = $(d);
				var order_id = self.attr("order_id");
				var buyer_message=t;
                $(".l-btn-login").removeAttr('onclick');
//              console.log({order_id:order_id,key:key,buyer_message:buyer_message});
				$.ajax({
					type:"post",
					url:ApiUrl+"/index.php?act=member_order&op=order_cancel",
					data:{order_id:order_id,key:key,buyer_message:buyer_message},
					dataType:"json",
					success:function(result){
						if(result.datas && result.datas == 1){
							initPage();
                            $('.header-back').attr('href','javascript:MYAPP.goBack({"jsCallback":"backRefresh"});void(0);');
						}
					}
				});
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
                            $('.header-back').attr('href','javascript:MYAPP.goBack({"jsCallback":"backRefresh"});void(0);');
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
                            MYAPP.goBack({'jsCallback':"backRefresh"});
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
    function initStore(){
        var distribute_id = parseInt($("#kefu").attr('data-distribute-id'));
        var store_id = parseInt($("#kefu").attr('data-store-id'));

        var url  = ApiUrl+"/index.php?act=store_show&op=store_info";
        if(distribute_id > 0){
            url = ApiUrl+"/index.php?act=store_show_child&op=store_info";
        }
        $.ajax({
            type:"get",
            url:url,
            data:{store_id:store_id,distribute_id:distribute_id},
            dataType:"json",
            success:function(result){
                var data = result.datas;
                if(!data.error){
                    $("#store_label").attr('src',result.datas.store_info.store_label_url);
                    if(data.store_info.store_owner_mobile){
                        $("#kefu").attr("href", "tel:" + data.store_info.store_owner_mobile);
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

    //包裹按钮信息
    function initDetailAlertwin(fn){
        var packageMenu=$("#packageMenu ul");//3个包裹按钮
        var packageLi;
        var moreMenu=$("#packageMenu button");//打开弹窗按钮
        var alertwin=$("#alertwin");//弹窗
        var all=alertwin.find("li span");//所有包裹
        var cookie=[];//缓存当前三个index
        /*初始化3个包裹的值*/
        var lis="";
        for(var i=0;i<3;i++){
            if(all.eq(i).length){
                lis+='<li class="'+(!i?"order_detail_package_active":"")+'" data-package="'+i+'">'+all.eq(i).text()+'</li>';
                cookie[i]=i;
            }
            else {
                break;
            }
        }
        packageMenu.html(lis);
        packageLi=packageMenu.find("li");
        /*初始化打开弹窗，如果大于3个包裹，则可以通过弹窗来查看*/
        if(all.length>=3){
            moreMenu.show();
            moreMenu.on("click",function(e){
                alertwin.show();
            });
        }

        /*查询某个包裹*/
        function selectBag(index){
            var temp,mack;
            //更改弹窗中的选择
            alertwin.find(".order_detail_alertwin_active").removeClass("order_detail_alertwin_active");
            all.eq(index).addClass("order_detail_alertwin_active");
            //更改快捷按钮的选择
            for(var i=0;i<cookie.length;i++){
                if(cookie[i]===index){
                    packageMenu.find(".order_detail_package_active").removeClass("order_detail_package_active");
                    packageLi.eq(i).addClass("order_detail_package_active");
                    mack=true;
                    break;
                }
            }
            //如果没有此包裹，重构3个按钮
            if(!mack){
                var start=all.length-index<3?all.length-3:index;
                for(var j=0;j<3;j++){
                    cookie[j]=start+j;
                    if((start+j)===index){
                        packageLi.eq(j).attr({"class":"order_detail_package_active","data-package":start+j}).text(all.eq(start+j).text());
                    }
                    else {
                        packageLi.eq(j).attr({"data-package":start+j,"class":""}).text(all.eq(start+j).text());
                    }
                }
            }
            //关闭弹窗
            alertwin.hide();
            //触发回调
            fn&&fn(all.eq(index),index);
        }
        /*点击3个包裹按钮进行查询*/
        packageLi.on("click",function(e){
            var eve=$(e.target);
            if(!eve.hasClass("order_detail_package_active")){
                var p=parseInt(eve.attr("data-package"));
                //触发查询
                selectBag(p);
            }
        });
        /*点击弹窗按钮查询*/
        all.on("click",function(e){
            var t=$(this);
            var parentLi=t.parent();
            var index=parentLi.index();
            selectBag(index);
        });
        /*点击灰色区域关闭弹窗*/
        alertwin.on("click",function(e){
            var eve=$(e.target);
            if(eve.hasClass("order_detail_alertwin_bg")){
                alertwin.hide();
            }
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
			this.list.on("click", function() {
				var t = $(this);
				var me = t.find("i");
				if (me.hasClass("icon-weigouxuan")) {
					cancelWin.list.find(".icon-gouxuanjian").removeClass("icon-gouxuanjian").addClass("icon-weigouxuan");
					me.removeClass("icon-weigouxuan").addClass("icon-gouxuanjian");
				}
			});
			//确定与取消
			this.btns.on("click", function(e) {
				e.stopPropagation();
				var eve = $(e.target);
				var index, text;
				if (eve.hasClass("order_detail_cancelwin_btn")) {
					e.preventDefault();
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

    //初始化支付方式
    function initPaymentList(){
        $.ajax({
            type:'post',
            url:ApiUrl+"/index.php?act=payment_list&op=list",
            data:{key:key},
            dataType:'json',
            success:function(result){
                var data = result.datas;
                data.WapSiteUrl = WapSiteUrl;
                var html = template.render('spayment_list', data);
                $("#payWin").html(html);

                //只在微信内核中显示微信支付
                if(!MYAPP.inapp()){
                    $("li[data-pay='friend']").remove();
                    if (!isWeiXin()) {
                        $("li[data-pay='wxpay']").remove();
                    }else{
                        //$("li[data-pay='alipay']").remove();
                    }
                }

            }
        });
    }

    //选择支付方式弹窗(选择支付方式后的弹窗)
    function showPayWin(f,data){
        var payCover=$("#payWin");
        var payWin=payCover.find(".pay_win");
        var lis=payWin.find("li");
        var fn=typeof f==="function"?f:function(){};
        var win=$(window);
        var sc=win.scrollTop();
        var ht=win.height();
        if(payCover.css("display")==="none"){
            window.lockWinScroll();
            payCover.show();
            payWin.css("top",sc+ht-payWin[0].offsetHeight);
            payCover.on("click",function(e){
                e.preventDefault();
                var eve=$(e.target);
                var eLi=(eve[0].tagName==="LI")?eve:eve.parents("li");
                if(eLi.length){
                    fn(eLi.data("pay"),data);
                    window.openWinScroll();
                }
                else if(eve.hasClass("pay_win_cover")){
                    $(this).hide();
                    window.openWinScroll();
                }
                else {
                    return ;
                }
                payCover.hide();
                payCover.off("click");
                return ;
            });
        }
    }
    //写入支付结果处理
    function payOrder (payType,ids){
        //微信中选择支付宝提示
        if(payType == 'alipay' && isWeiXinOrQQ() ){
            window.scrollTo(0,0);
            $('.transparent_bg').show();
            return false;
        }

        ids = ids.join("_");
        $.ajax({
            type:'get',
            url:ApiUrl+"/index.php?act=member_order&op=merge_payment",
            data:{key:key, order_id:ids},
            dataType:'json',
            success:function(result){
                var data = result.datas;
                if(data.error){
                    $.sDialog({
                        skin:"block",
                        content:data.error,
                        cancelBtn: false
                    });
                }else{
                    if(!data.pay_sn){
                        $.sDialog({
                            skin:"block",
                            content:'获取订单信息失败',
                            cancelBtn: false
                        });
                    }else{
                        //区分亲友代付和其它支付方式
                        if(payType == 'friend'){
                            $.ajax({
                                type:'get',
                                url:ApiUrl+"/index.php?act=member_order&op=get_friend_info",
                                data:{key:key, pay_sn:data.pay_sn},
                                dataType:'json',
                                success:function(result){
                                    var friend_info =  result.datas;
                                    if(friend_info.error){
                                        $.sDialog({
                                            skin:"block",
                                            content:friend_info.error,
                                            cancelBtn: false
                                        });
                                        return false;
                                    }else{
                                        var smsBody = '我在陌云商城买了'+friend_info.goods_sum+'件商品，需付款¥'+friend_info.pay_amount+'，是不是真感情，就看你戳不戳下面这个付款链接了，快来帮我付款吧～'+friend_info.pay_url;
                                        MYAPP.SMS({'smsBody':smsBody,'jsCallback':"afterSMS"});
                                    }
                                }
                            });

                        }else if(payType == 'predeposit'){
                            //如果使用预存款 密码验证
                            $('#pwd-tip').html('您使用了预存款支付，请输入登录密码，进入安全验证。');
                            //弹出密码输入窗口
                            var bodyH=$("body").height(), scrollTop=$(window).scrollTop(), passDialog=$(".pass_dialog"), passMask=$(".pass_mask"), passClose=$("#p_d_hd_close"), winH=$(window).height();
                            passDialog.css({top:scrollTop+winH/2-110});
                            passMask.css({height:bodyH}).show().addClass("fadeIn").removeClass("fadeOut");
                            passClose.on("click",function(){
                                passMask.removeClass("fadeIn").addClass("fadeOut");
                                setTimeout(function(){
                                    passMask.hide();
                                },500);
                            })
                            // 验证密码
                            var loading_pduse=false;
                            $('#pwd_confirm').click(function(){//验证密码
                                var pwd = $("input[name=pwd]").val();
                                if(pwd == ''){
                                    $('#pwd-tip').html('<span class="clr-c07">登录密码不能为空，请重新输入。</span>');
                                    return false;
                                }
                                //防止重复提交
                                if(loading_pduse) return false;
                                loading_pduse=true;
                                $.ajax({
                                    type:'post',
                                    url:ApiUrl+'/index.php?act=member_buy&op=check_password',
                                    data:{key:key,password:pwd},
                                    dataType:'json',
                                    success:function(result){
                                        if(result.datas == 1){
                                            $.ajax({
                                                type:'get',
                                                url:ApiUrl+'/index.php?act=payment_moyun',
                                                data:{key:key,pay_sn:data.pay_sn,payment_code:payType,inApp:MYAPP.inapp(),password:pwd},
                                                dataType:'json',
                                                success:function(result){
                                                    if(!result.datas.error){
                                                        MYPAY.init(result.datas);
                                                        passMask.hide();
                                                    }else{
                                                        $.sDialog({
                                                            skin:"red",
                                                            content:result.datas.error,
                                                            okBtn:true,
                                                            cancelBtn:false
                                                        });
                                                    }
                                                }
                                            });
                                        }else{
                                            $('#pwd-tip').html('<span class="clr-c07">密码错误，请重新输入。</span>');
                                        }
                                        setTimeout(function(){loading_pduse=false;}, 5000);
                                    }
                                });
                            });
                        }else{
//                            $('#buy_form').attr('action',ApiUrl+'/index.php?act=member_payment&op=pay');
//                            $('#form_key').val(key);
//                            $('#form_pay_sn').val(data.pay_sn);
//                            $('#form_payment_code').val(payType);
//                            $('#buy_form').submit();

                            $.ajax({
                                type:'get',
                                url:ApiUrl+'/index.php?act=payment_moyun',
                                data:{key:key,pay_sn:data.pay_sn,payment_code:payType,inApp:MYAPP.inapp()},
                                dataType:'json',
                                success:function(result){
                                    if(!result.datas.error){
                                        MYPAY.init(result.datas);
                                    }else{
                                        $.sDialog({
                                            skin:"red",
                                            content:result.datas.error,
                                            okBtn:true,
                                            cancelBtn:false
                                        });
                                    }
                                }
                            });
                        }

                    }
                }
            }
        });

    }
    //处理图片上传
	(function(w) {
		var uploadUrl = ApiUrl + "/index.php?act=member_buy&op=upload_idcard_wap&key=" + key;
		var max = 2; //最多2张图片
		var longer = 2; //上传文件大小限制为2M
		var timeout = 30000; //上传时间最大30秒，超出则判定为超时
		var uploadImg, rdk;
		var coverMack = 0;
		//初始化上传
		function initUploadImg(ary,closeFn) {
			uploadImg = $(".uploadImg");
			//代理关闭操作
			uploadImg.on("click", function(e) {
				var t = $(this);
				var eve = $(e.target);
				var p = eve.parents(".add_comment_preview");
				var sbl = p.siblings(".add_comment_preview"); //这个是指已经有图片的input数量
				//关闭
				if (eve.hasClass("add_comment_preview_close")) {
					var mack=0;
					if ($(this).find(".add_comment_preview_bg1").length === 0) { //已选中
						mack++;
						addUploadImgView(t);
					} 
					else if (p.find(".add_comment_preview_bg2").length) { //当前为非空
						if (sbl.length !== 0) { //不止一个
							mack++;
						} else { //仅剩自己
							p.find(".add_comment_preview_bg").removeClass("add_comment_preview_bg2").addClass("add_comment_preview_bg1");
							p.find("input").val("");
						}
					}
					//执行关闭回调
					if(mack){
						if(typeof closeFn==="function"){
							var t=p.find(".add_comment_preview_bg2 img")[0];
							closeFn&&closeFn(t,function(){
								p.remove();
							});
						}
						else {
								p.remove();
						}
					}
				}
			});
			//添加第一个view
			if(ary!==undefined){
				//特别的，如果已经上传过图片，这里会显示已上传的图片
				for(var i=0;i<max;i++){
					if(ary[i]){
						addUploadImgView(undefined,ary[i]);
					}
					else {
						addUploadImgView();
					}
				}
			}
			else {
				addUploadImgView();
			}
			//设置reader
			if (FileReader !== undefined) {
				rdk = true;
			}
		}
		//获取所有上传图片信息
		function getUploadImg() {
			var fs = uploadImg.find("input[type=file]");
			var sendForm;
			if (!FormData) {
				$.sDialog({
					content: "上传失败，当前设备不支持上传图片",
					cancelBtn: false
				});
				return null
			}
			sendForm = new FormData();
			for (var i = 0; i < fs.length; i++) {
				if (fs.eq(i).val() != "") {
					sendForm.append("img[" + i + "]", fs[i].files[0])
				}
			}
			return sendForm;
		}
		//添加新的上传接口（没有参数表示所有的.uploadImg都新建一个，否则在参数中的节点内新建）
		function addUploadImgView(u,imgSrc) {
			var tUploadImg = (u !== undefined) ? u : uploadImg;
			var html = '<div class="add_comment_preview"><div class="add_comment_preview_bg add_comment_preview_bg1">' +
				'<i class="iconfont icon-jia"></i><img src="'+(imgSrc!==undefined?imgSrc.path+imgSrc.img_name:'')+'" alt="" data-src="'+(imgSrc!==undefined?imgSrc.img_name:'')+'"/></div>' +
				'<div class="add_comment_preview_close iconfont icon-jian"></div><input type="file" name="img[]" /></div>';
			tUploadImg.append(html);
			var newView = tUploadImg.find(".add_comment_preview");
			newView=newView.eq(newView.length-1);
			//特别的，如果传入了图片地址，
			if(imgSrc){
				newView.find(".add_comment_preview_bg1").removeClass("add_comment_preview_bg1").addClass("add_comment_preview_bg2");
			}
			//除了input，其他事件都使用代理
			newView.find("input").on("change", function() {
				var t = $(this); //- -
				var bg = t.siblings(".add_comment_preview_bg"); //背景样式
				var img = bg.find("img"); //预览图片
				var ff = this.files[0]; //inputfile对象
				var parent = t.parents(".uploadImg").eq(0); //父节点,用于新建上传位置时addUploadImgView的参数
				if (t.val() === "") {
					return true
				}
				//验证上传必须图片 
				if (ff.type.search(/(jpg)|(jpeg)|(png)/) === -1) {
					$.sDialog({
						content: "添加失败！上传图片仅限 JPG,JPEG,PNG格式。",
						cancelBtn: false
					});
					return false
				}
				//验证上传文件大小必须小于2M
				if (ff.size > longer * Math.pow(1024, 2)) {
					$.sDialog({
						content: "添加失败！上传图片大小必须小于" + longer + "MB。",
						cancelBtn: false
					});
					return false
				}
				if (bg.hasClass("add_comment_preview_bg1")) {
					bg.removeClass("add_comment_preview_bg1").addClass("add_comment_preview_bg2");
				}
				//是否支持本地预览
				//			if(rdk===undefined){
				//				$.sDialog({
				//						content:"您的手机暂不支持上传预览功能",
				//						cancelBtn:false
				//				});
				//				rdk=false;
				//			}
				//			else {
				//				var rd=new FileReader()
				//				rd.readAsDataURL(ff);
				//				rd.onload=function(e){
				//				img.attr("src",e.target.result);
				//				}
				//			}
				//考虑上传图片会很多，采用选择一张图片提交一张的方式
				var fd = new FormData();
				fd.append("filedata", t[0].files[0]);

				//上传此图片，并返回图片地址
				var nowMack = coverMack++;
				$("body").append("<div class='cover cover" + nowMack + "'></div>");
				//上传成功回调
				var successFn = function(res) {
						var imgSrc = res.datas.path;
						var imgName = res.datas.img_name;
						img.attr({
							"src": imgSrc + imgName,
							"data-src": imgName
						});
						//新增上传 最多三张 
						var len = parent.find(".add_comment_preview").length;
						var n = parent.find(".add_comment_preview_bg1").length;
						if (len < max && !n) {
							addUploadImgView(parent);
						}
						successFn = nowMack = null;
					}
					//上传失败回调
				var defeatFn = function(msg) {
						$.sDialog({
							content: "" + msg,
							cancelBtn: false
						});
						t.val("");
						bg.removeClass("add_comment_preview_bg2").addClass("add_comment_preview_bg1");
						defeatFn = nowMack = null;
					}
					//超时执行失败
				setTimeout(function() {
					var lastCover = $(".cover" + nowMack);
					if (lastCover.length) {
						lastCover.remove();
						defeatFn("网络超时，请重试");
					}
				}, timeout);
				$.ajax({
					url: uploadUrl,
					type: "post",
					data: fd,
					contentType: false,
					processData: false,
					dataType: "json",
					success: function(res) {
						//如果此元素已经在异步时段被删除或者已经超时，则直接终止
						var lastCover = $(".cover" + nowMack);
						if (!t.parents(".uploadImg").length || !lastCover.length) {
							return
						}
						lastCover.remove();
						//提交失败
						if (res.datas.error) {
							defeatFn(res.datas.error);
							return false
						}
						//提交成功，则新增一个提交栏
						else {
							successFn(res);
						}
					}
				})
			});
		};
		//抛出初始化
		w.initUploadImg = initUploadImg;
		//抛出获取上传图片的formdata对象
		w.getUploadImg = getUploadImg;
		//抛出清空所有上传图片的方法
		w.clearUploadImg = function() {
			uploadImg.html("");
			addUploadImgView();
		}
	})(window);

    //身份证号合法性验证
    //支持15位和18位身份证号
    //支持地址编码、出生日期、校验位验证
    function IdentityCodeValid(idCard) {
        var Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ];// 加权因子
        var ValideCode = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ]; // 身份证验证位值.10代表X
        var sum = 0;
        var isValidityBrith = function(year,month,day){
            var temp_date = new Date(year,parseFloat(month)-1,parseFloat(day));
            if(year.length == 2){
                var temp_year = temp_date.getYear();
            }else if(year.length == 4){
                var temp_year = temp_date.getFullYear();
            }else{
                return false;
            }
            if(temp_year != parseFloat(year)
                || temp_date.getMonth() != parseFloat(month) - 1
                || temp_date.getDate() != parseFloat(day)){
                return false;
            }else{
                return true;
            }
        }

        idCard = idCard.replace(/ /g, "").replace(/(^\s*)|(\s*$)/g, "");
        if(idCard.length == 15){
            var year = idCard.substring(6,8);
            var month = idCard.substring(8,10);
            var day = idCard.substring(10,12);
            return isValidityBrith(year,month,day);
        }
        if(idCard.length != 18) return false;
        var a_idCard = idCard.split("");
        if (a_idCard[17].toLowerCase() == 'x') a_idCard[17] = 10;
        for ( var i = 0; i < 17; i++) {
            sum += Wi[i] * a_idCard[i];
        }
        valCodePosition = sum % 11; // 得到验证码所在位置
        if (a_idCard[17] != ValideCode[valCodePosition]) return false;
        var year = idCard.substring(6,10);
        var month = idCard.substring(10,12);
        var day = idCard.substring(12,14);
        return isValidityBrith(year,month,day);
    }

});