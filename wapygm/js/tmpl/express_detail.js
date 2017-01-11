MYAPP.ready(function(){
	var key = getLocalStorage('key');
	if(key==''){
		gotoLoginPage();
		return false;
	}
	var order_id = GetQueryString("order_id");
    var express_return = false;
	//物流跟踪
	function initPage(){
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=member_order&op=express_detail",
			data:{key:key,order_id:order_id},
			dataType:'json',
			success:function(result){
				checklogin(result.login);//检测是否登录了
				var data = result.datas;
                if(typeof(data.error)!='undefined'){
                    $.sDialog({
                        skin:"red",
                        content: data.error,
                        okBtn:true,
                        cancelBtn:false
                    });
                    return false;
                }
				if (data) {
					var html = template.render('express-detail', {data:data});
				}

	            $("#express-detail-wp").html(html);

				//回到顶部 监听及效果
				$(window).scroll(scrollTopIcon);
				$('#gotop').click(function () {scroll('0px', 50);});

                if(data.length > 1){
                	
                    initDetailAlertwin(function(dom,index){
                        var shipping_trace_id = $(dom).attr('data-trace-id');
                        $.ajax({
                            type:'get',
                            url:ApiUrl+"/index.php?act=member_order&op=get_express_detail",
                            data:{key:key,shipping_trace_id:shipping_trace_id},
                            dataType:'json',
                            beforeSend:ajaxLoading,
                            success:function(result){
                                checklogin(result.login);//检测是否登录了
                                var data = result.datas;
                                var html = template.render('express-detail-new', data);
                                $("#shipping_code").html("物流公司："+data.shipping_code);
                                $("#express_name").html("物流单号："+data.express_name);
                                $(".express-detail").html(html);
                            },
                            complete:ajaxLoadingComplete
                        });
                    });
                }

			}
		});
	}
	//订单商品详情
	function initGoods(){
		$.ajax({
			type:'post',
			url:ApiUrl+"/index.php?act=member_order&op=order_detail_t",
			data:{key:key,order_id:order_id},
			dataType:'json',
			beforeSend:ajaxLoading,
			success:function(result){
				checklogin(result.login);//检测是否登录了
				var data = result.datas;
				if (data.error) {
					$("#order-detail-wp").html(data.error);
					return false;
				};
	            var html = template.render('order-detail', data);
	            $("#order-detail-wp").html(html);
			},
			complete:ajaxLoadingComplete,
		});
	}
	
	//初始化页面
	initPage();
//	initGoods();
	
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
});