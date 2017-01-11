MYAPP.ready(function(){
	var key = getLocalStorage('key');
	if(key==''){
		gotoLoginPage();
		return false;
	}
	var page = pagesize;
    //var page = 10;
	var curpage = 1;
	var hasMore = true;

	var order_state =getLocalStorage('order_state');

	var url_order_state = GetQueryString("order_state");
	//用于全选
	var allOrderSum=0;//所有订单合计数量
	var allOrderCount=0;//所有订单合计金额
	var isCheckedAll=false;//用于判断是否已经手动全选
	//html传过来的参数优先级高
	if (url_order_state) {
		order_state = url_order_state; 
	}

	//导航菜单初始化
    changeLabel(order_state);

    //回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});
	//去除header下边线
	$(function(){
		$("#header .header-wrap").css("border-bottom",0);
	});

    var pages;//总页数
	var ajax=!1;//是否加载中

	function initPage(page,curpage){
        $("#noMoreContent").hide();//隐藏  没有订单
        $('#more-btn').show();//显示 下拉信息框
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=member_order&op=order_list&page="+page+"&curpage="+curpage,
			data:{key:key,order_state:order_state},
			dataType:'json',
			beforeSend:ajaxLoading,
			success:function(result){
                checklogin(result.login);//检测是否登录了
    			hasMore=result.hasmore;
				if(!result.hasmore){
            		//一条数据都没有，显示没有订单版块
            		if(curpage===1&&result.datas.order_group_list.length===0){//没有任何数据，显示 没有订单
            			$('#more-btn').hide();
            			$("#noMoreContent").show();
            		}
            		else {
         	  	 		$('#more-btn').html('没有更多内容...');
            		}
				}else{
					//$('.pre-page').removeClass('disabled');
					$('#more-btn').html('正在加载...');
				}
				var data = result.datas;
				data.hasmore = result.hasmore;//是不是可以用下一页的功能，传到页面里去判断下一页是否可以用
				data.WapSiteUrl = WapSiteUrl;//页面地址
				data.curpage = curpage;//当前页，判断是否上一页的disabled是否显示
				data.ApiUrl = ApiUrl;
				data.order_state = order_state;
				data.key = getLocalStorage('key');

				template.helper('$getLocalTime', function (nS) {
					return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
				});

				var html = template.render('order-list-tmpl', data);
				$("#order-list").html(html);

                //tab 标签切换
                changeLabel(order_state);
                //合并付款
                initPaymentList();
                merge_payment(order_state,true);
                if(order_state == '10' && data.order_sum && data.order_sum_amount){
                    allOrderSum = parseInt(data.order_sum);//所有订单合计数量
                    allOrderCount = parseFloat(data.order_sum_amount);//所有订单合计金额
                }

				//取消订单
				$(".cancel-order").click(cancelOrder);
				//自动取消订单
				$(".countdown").click(autoCancelOrder);
				//取消并退款 适用已支付 未发货订单
				$(".cancel-refund-order").click(cancelRefundOrder);
				//确认订单
				$(".sure-order").click(sureOrder);
                //删除订单
                $(".delete-order").click(deleteOrder);
				//提醒发货
				$(".remind-delivery").click(remindDelivery);
				//下一页
				$(".next-page").click(nextPage);
				//上一页
				$(".pre-page").click(prePage);
                //点击加载更多
                $('.get-more_t').click(getMore);
				//提交单个订单
				$(".pay-order").click(oneSub);
				//获取总页数
				pages = result.page_total;
                //下拉加载 S
                Zepto(downScrool);
			},
			complete:ajaxLoadingComplete,
		});
	}

	//下拉
	function downScrool(){
     $(window).scroll(function(){
        //console.log("总页数:"+pages+"===当前页"+curpage);
            if(($(window).scrollTop() + $(window).height() > $(document).height()-40) && !ajax && pages > curpage){

                //滚动条拉到离底40像素内，而且没ajax中，而且没超过总页数
                //json_ajax(cla,++page);
                curpage = eval(parseInt($("input[name=curpage]").val())+1);
//                nowpage = curpage;//当前页增加1
                ajax=!0;//注明开始ajax加载中
                $.ajax({
                    type:'post',
                    url:ApiUrl+"/index.php?act=member_order&op=order_list&page="+page+"&curpage="+curpage,
                    data:{key:key,order_state:order_state},
                    dataType:'json',
                    success: function(result){
    					hasMore=result.hasmore;
                        if(!result.hasmore){
                            $('#more-btn').html('没有更多内容...');
                        }else{
                            $('#more-btn').html('正在加载...');
                        }

                        var data = result.datas;
                        data.order_state = order_state;
                        data.WapSiteUrl = WapSiteUrl;
                        var html = template.render('order-list-tmpl', data);
                        $("#order-list").append(html);

                		merge_payment(order_state);//附加新列表选中事件
                        //取消订单
                        $(".cancel-order").click(cancelOrder);
                        //自动取消订单
                        $(".countdown").click(autoCancelOrder);
                        //取消并退款 适用已支付 未发货订单
                        $(".cancel-refund-order").click(cancelRefundOrder);
                        //确认订单
                        $(".sure-order").click(sureOrder);
                        //删除订单
                        $(".delete-order").click(deleteOrder);
                        //提醒发货
                        $(".remind-delivery").click(remindDelivery);
                        //下一页
                        $(".next-page").click(nextPage);
                        //上一页
                        $(".pre-page").click(prePage);
                        //点击加载更多
                        $('.get-more_t').click(getMore);
						//提交单个订单
						$(".pay-order").click(oneSub);

                        ajax=!1;//注明已经完成ajax加载
                        //加载更多时验证全选
                        if(order_state == '10' &&isCheckedAll){
                            checkByIndex((parseInt(curpage)-1)*parseInt(page));
                        }
                        //更新当前页
                        $("input[name=curpage]").val(curpage);

                    },
                    error: function(xhr, type){

                    }
                });
            }
        });

	 }

	//切换
    $(".flex1").click(function(){
    	$('#more-btn').html('正在加载...');
    	scroll('0px', 50);
    	$("input[name=curpage]").val(1);
		curpage = 1;

    	var state=$(this).attr("order_state");
        //记录cookie
        addLocalStorage('order_state', state);
        order_state = state;

    	var index=$(this).index();
 		$(".order-list-nva label").removeClass("current");
 		$(this).addClass("current");
 		selectState();

    });

	//初始化页面
	initPage(page,curpage);

    function selectState(state){
        curpage = 1;
    	initPage(page,curpage);
    }
    //打开QQ
    $(".openQQ").click(function(){
        MYAPP.openQQ("3149611689");
    });
	//取消订单
	function cancelOrder(){
		var self = $(this);
		var order_id = self.attr("order_id");

		$.sDialog({
              skin: "block",
              content: '是否取消此订单?<br/><br/><div class="s-dialog-small">便宜不等人，下次可就没优惠了。</div><div class="s-dialog-small">订单取消后将会永久失效，</div><div class="s-dialog-small">请确认是否取消该订单？</div>',
              "okBtnText": "是",
              "cancelBtnText": "否",

              cancelFn: function() {},
              okFn: function() {
              	$('#pay_btn_' + order_id).removeAttr('onclick');
				$.ajax({
					type:"post",
					url:ApiUrl+"/index.php?act=member_order&op=order_cancel",
					data:{order_id:order_id,key:key},
					dataType:"json",
					success:function(result){
						if(result.datas && result.datas == 1){
                            curpage = 1;
							initPage(page,curpage);
						}
					}
				});
              },
            });
	}

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
                    curpage = 1;
					initPage(page,curpage);
				}
			}
		});

	}

	//取消订单并完成退款 适用已支付 未发货订单
	function cancelRefundOrder(){
		var self = $(this);
		var order_id = self.attr("order_id");

		$.sDialog({
              skin: "block",
              content: '是否取消此订单?<br/><br/><div class="s-dialog-small">便宜不等人，下次可就没优惠了。</div><div class="s-dialog-small">订单取消后将会永久失效，</div><div class="s-dialog-small">请确认是否取消该订单？</div>',
              "cancelBtnText": "否",
              "okBtnText": "是",

              cancelFn: function() {},
              okFn: function() {
				$.ajax({
					type:"post",
					url:ApiUrl+"/index.php?act=member_order&op=order_cancel_refund",
					data:{order_id:order_id,key:key},
					dataType:"json",
					success:function(result){
						if(result.datas && result.datas == 1){
                            curpage = 1;
							initPage(page,curpage);
						}
					}
				});
              },
            });
	}

	//确认收货
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
                    curpage = 1;
					initPage(page,curpage);
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
                            curpage = 1;
                            initPage(page,curpage);
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

	//下一页
	function nextPage (){
		var self = $(this);
		var hasMore = self.attr("has_more");
		if(hasMore == "true"){
			curpage = curpage+1;
			initPage(page,curpage);
		}
	}
	//上一页
	function prePage (){
		var self = $(this);
		if(curpage >1){
			self.removeClass("disabled");
			curpage = curpage-1;
			initPage(page,curpage);
		}
	}
    //点击加载更多
    function getMore(){
        var self = $(this);
        var hasMore = self.attr("has_more");
        if(hasMore == "true"){
            var morepage = page+10;
            page = page+10;
            initPage(morepage,curpage);
        }
    }

    //标签切换
    function changeLabel(order_state){
        $(".flex1").removeClass("current");
        $(".flex1").each(function(){
            if($(this).attr('order_state') == order_state){
                var index=$(this).index();
                $(this).addClass("current");
            }
        });
    }

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

    //合并付款
    function merge_payment(order_state,isfirst){
        if(order_state == '10'){
            if($('#noMoreContent').css("display") != 'block'){
                $('.fix_pay_checked_blank').removeClass('hide');
            }
            //单选此订单
            $("#order-list .order_pay_checked_box").each(function(index){
                this.onclick=checkPay;
            });
            $("#allChecked").unbind('click').click(allChecked);
            $("#allSub").unbind('click').click(allSub);//提交
            if(isfirst){//首次加载或重新加载，重置全选状态
	            $("#allChecked .order_pay_checked_box").removeClass("pay_checked");
	    		isCheckedAll=false;
	    		examineCheckPay();
            }
        }else{
            $('.fix_pay_checked_blank').addClass('hide');
        }
    }

    //统计当前加载页内所有的未选择订单信息(附带更新统计信息)
    function examineCheckPay(){
    	var allBox=$("#order-list .order_pay_checked_box");
    	var noCheck=check={};
        var order_count1 = 0,order_count2= 0;
        var order_sum1 = 0,order_sum2 = 0;
        var order_ids1=[],order_ids2=[];
    	if(!allBox.length){
//    		throw new Error("没有查找到列表");
            return false;
    	}
    	else {
	    	allBox.each(function(index){
	    		var t=$(this);
                var pay_parent =  (t.hasClass("one_order")?t:t.parents('.one_order'));
                var amount = parseFloat(pay_parent.find('.pay_amount').html());
                var id=pay_parent.find(".add_comment_rows_title").eq(0).data("orderid");
	    		if(!t.hasClass("pay_checked")){
                    if(!isNaN(amount)){
                        order_count1 += amount;
                    }
                    order_sum1++;
                    order_ids1.push(id);
	    		}else{
                    if(!isNaN(amount)){
                        order_count2 += amount;
                    }
                    order_sum2++;
                    order_ids2.push(id);
                }
	    	});
    	}
        noCheck={//统计当前页未选择
        	count:order_count1,
        	len:order_sum1,
        	ids:order_ids1
        };
        check={//统计当前页已选中
        	count:order_count2,
        	len:order_sum2,
        	ids:order_ids2
        }
        //更新统计节点
        if(isCheckedAll){
	        $('#order_count').html((allOrderCount-order_count1).toFixed(2));
	        $('#order_sum').html((allOrderSum-order_sum1));
        }
        else {
	        $('#order_count').html(order_count2.toFixed(2));
	        $('#order_sum').html(order_sum2);
        }
    	return {noCheck:noCheck,check:check}
    }
    
    //返回所有选择的商家id
    function getAllCheckPay(){
    	var allBox=$("#order-list .order_pay_checked_box");
    	var ary=[];
    	allBox.each(function(index){
    		var t=$(this);
    		var id=t.parents(".add_comment_rows_title").eq(0).data("orderid");
    		if(t.hasClass("pay_checked")&&id!==undefined){
    			ary.push(id);
    		}
    	});
    	return ary
    }
    //选择此订单
    function checkPay(e){
    	e.stopPropagation&&e.stopPropagation();
    	if(e.returnValue){e.returnValue=false}
    	var checkBtn=$(this);
    	if(checkBtn.hasClass("order_pay_checked_box")){
	    	checkBtn.hasClass("pay_checked")?checkBtn.removeClass("pay_checked"):checkBtn.addClass("pay_checked");
	    	//检查全选
	    	var allBtn=$("#allChecked .order_pay_checked_box");
	    	if(examineCheckPay().noCheck.len===0){
	    		if(isCheckedAll||!hasMore){//已经操作过全选按钮
	    			allBtn.addClass("pay_checked");
	    			isCheckedAll=true
	    			return false
	    		}
	    	}
	    	else {
	    			allBtn.removeClass("pay_checked");
	    	}
    	}
		return false;
    };

    //全选所有订单
    function allChecked(){
        var allBtn=$(this).find(".order_pay_checked_box");
        //全选则全不选
        if(allBtn.hasClass("pay_checked")){
            $(".order_pay_checked_box").removeClass("pay_checked");
	    		isCheckedAll=false;
        }
        //否则全选
        else {
            $(".order_pay_checked_box").addClass("pay_checked");
	    		isCheckedAll=true;
        }
        examineCheckPay();//统计一下节点数据
    }
	//全选列表中指定索引的订单
	function checkByIndex(start){
        var listOrder=$("#order-list .order_pay_checked_box");
    	if(typeof start==="number"&&!isNaN(start)&&isCheckedAll){
    		listOrder.slice(start).addClass("pay_checked");
    	}
	}
    //提交所有订单
    function allSub(){
        var ids=getAllCheckPay();
        if($('.pay_checked').parents('.add_comment_rows').find("input[name='is_idcard']").length > 0){
            $.sDialog({
                skin:"block",
                content:'您选择的商品需要提供身份证,请传身份证',
                okBtn:true,
                cancelBtn:false
            });
            return false;
        };
        if(ids.length){
            //展开选择支付方式
            showPayWin(payOrder,ids);
        }
        else {
            $.sDialog({
                skin:"block",
                content:"您当前没有选择订单",
                cancelBtn: false
            });
        }
    }
	//提交当前订单
	function oneSub(e){
        if($(this).parents('.one_order').find("input[name='is_idcard']").length > 0){
            $.sDialog({
                skin:"block",
                content:'您选择的商品需要提供身份证,请传身份证',
                okBtn:true,
                cancelBtn:false
            });
            return false;
        };
		var id=parseInt($(e.target).parents(".one_order").eq(0).find(".add_comment_rows_title").eq(0).data("orderid"));
		if(!isNaN(id)){
            showPayWin(function(a,b){ payOrder(a,b,true)},[id]);
		}
		else {
			throw new Error("订单参数id出错");
		}
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
    function payOrder (payType,ids,onlyOne){
        //微信中选择支付宝提示
        if(payType == 'alipay' && isWeiXinOrQQ() ){
            window.scrollTo(0,0);
            $('.transparent_bg').show();
            return false;
        }

        var jsonData={
    		key:key
    	}
    	//如果有全选状态且不是单个提交，则只传未选中值，否则传所有页面id
    	if(isCheckedAll&&!onlyOne){
    		jsonData.order_id="";
    		jsonData.is_all=1;
    		jsonData.not_pay=examineCheckPay().noCheck.ids.join("_");
    	}
    	else {
    		jsonData.order_id=ids.join("_");
    		jsonData.is_all=0;
    		jsonData.not_pay="";
    	}
        $.ajax({
            type:'get',
            url:ApiUrl+"/index.php?act=member_order&op=merge_payment",
            data:jsonData,
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

});