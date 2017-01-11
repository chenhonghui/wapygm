MYAPP.ready(function (){
    var key = getLocalStorage('key');
    //回到顶部 监听及效果
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});
    if(key==''){
        gotoLoginPage();
    }else{
        //初始化页面数据
        function initCartList(){
             $.ajax({
                url:ApiUrl+"/index.php?act=member_cart&op=cart_list",
                type:"post",
                dataType:"json",
                data:{key:key},
                success:function (result){
                    if(checklogin(result.login)){
                        if(!result.datas.error){
                            var rData = result.datas;
                            rData.WapSiteUrl = WapSiteUrl;
                            var html = template.render('cart-list', rData);
                            $(".goods-car").html(html);
                            //显示结算
                            if(result.datas.cart_list.length){$(".all-goods-count").show();}else{$(".all-goods-count").hide()}
                            //价格计算
                            goodsPriceTotal();
                            //删除购物车
                            $(".del-icon").click(delCartList);
                            //购买数量，减
                            $(".goods-sub").click(minusBuyNum);
                            //购买数量加
                            $(".goods-add").click(addBuyNum);
                            //商品编辑
                            $('.shop-car-edit').click(editGoods);
                            //单个商品选择
                            $('.car-goods-sel').click(chooseGoods);
                            //商品全选
                            $('.all-goods-status').click(chooseAll);
                            //去结算
                            $(".goods-btn-r").click(goSettlement);
                            //change:店铺商品全选
                            $(".shop-tit  .icon-status-all").click(chooseStore);
                        }else{
                           alert(result.datas.error);
                        }
                    }
                }
            });
        }
        initCartList();
        //添加店铺全选
        function chooseStore(){
        	var t=$(this);
        	if(t.hasClass("icon-status-all-active")){
        		t.removeClass("icon-status-all-active").parents(".shops-list").eq(0).find(".icon-status").addClass("icon-gray").removeClass('goods-active');
        	}
        	else {
                t.addClass("icon-status-all-active").parents(".shops-list").eq(0).find(".icon-status").addClass("goods-active").removeClass('icon-gray');
        	}
            goodsPriceTotal();
			//查询全部商品是否都已选中，来更改全选按钮状态
            hasChooseAll();
        }
        //商品价格计算
        function goodsPriceTotal(){
            var total = 0; //合计
            var num = 0; //总件数
            $('.shops-list').each(function(){
                var store_total = 0; //店铺小计
                $(this).find('.goods-active').each(function(){
                    var goods_num = $(this).parent().parent().find("input[name='goods-num']");
                    store_total += parseFloat($(goods_num).attr('data-paice')) * parseInt($($(goods_num)).val());
                    num += parseInt($($(goods_num)).val());
                });
                $(this).find('.shop-car-count').find('span').html(store_total.toFixed(2));
                total += store_total;
            });
            $('.all-goods-price').find('span').html(total.toFixed(2));
            $('.goods-btn-r').find('span').html(num);
        }

        //商品编辑
        function editGoods(){
            if($(this).html() == '编辑'){
                $(this).parent().parent().find('.goods-edit-tool').show();
                $(this).html('完成');
            }else{
                $(this).parent().parent().find('.goods-edit-tool').hide();
                $(this).html('编辑');
            }

        }

        //全选事件
        function chooseAll(){
            if($('.all-goods-status').attr('data-all') == 'true'){
                $('.icon-status').removeClass('goods-active');
                $('.all-goods-status').attr('data-all','false');
                $('.all-goods-status').find('div').addClass("icon-gray");
                $(".icon-status-all-active").removeClass("icon-status-all-active");
            }else{
                $('.icon-status').addClass('goods-active');
                $('.all-goods-status').attr('data-all','true');
                $('.all-goods-status').find('div').removeClass("icon-gray");
                $(".icon-status-all").addClass("icon-status-all-active");
            }
            goodsPriceTotal();
        }
        
        //被动全选事件
        function hasChooseAll(){
            var all_choose = true;
            $('.goods-car').find('.icon-status').each(function(){
                if(!$(this).hasClass("goods-active")){all_choose = false;}
            });
        	if(all_choose){
                $('.all-goods-count .icon-status').addClass('goods-active');
                $('.all-goods-count .all-goods-status').attr('data-all','true').find('div').addClass("icon-gray");
                $(".all-goods-count .icon-status-all-active").removeClass("icon-status-all-active");
        	}
        	else {
                $('.all-goods-count .icon-status').removeClass('goods-active');
                $('.all-goods-count .all-goods-status').attr('data-all','false').find('div').removeClass("icon-gray");
                $(".all-goods-count .icon-status-all").addClass("icon-status-all-active");
            }
        }
        
        //商品选择
        function chooseGoods(){
            if($(this).find('.icon-status').hasClass("goods-active")){
                $(this).find('.icon-status').removeClass("goods-active");
            }else{
                $(this).find('.icon-status').addClass("goods-active");
            }
            //查询同组商品，如果全部未选择 则取消全选按钮
            var itemp=$(this).parents(".shops-list").eq(0);
//          var allitemp=itemp.find(".icon-status");
            var titleitem=itemp.find(".icon-status-all");
            if(itemp.find(".goods-active").length===0){
            	titleitem.removeClass("icon-status-all-active").attr('data-all','false');
            }
            else {
            	titleitem.addClass("icon-status-all-active").attr('data-all','true');
            }
            
            goodsPriceTotal();

			//查询全部商品是否都已选中，来更改全选按钮状态
            hasChooseAll();
        }

        //删除购物车
        function delCartList(){
            var  cart_id = $(this).parent().attr("cart_id");
            var self = this;
            event.stopPropagation(); //阻止向父节点冒泡
            $.sDialog({
              skin: "block",
              content: "您确定要删除吗?",
              "cancelBtnText": "取消",
              "okBtnText": "确定",

              cancelFn: function() {},
              okFn: function() {
                    $.ajax({
                        url:ApiUrl+"/index.php?act=member_cart&op=cart_del",
                        type:"post",
                        data:{key:key,cart_id:cart_id},
                        dataType:"json",
                        success:function (res){
                            if(checklogin(res.login)){
                                if(!res.datas.error && res.datas == "1"){
                                    if($(self).parents('.shop-car-list').find('.shop-car-item').length > 1){
                                        $(self).parents('.shop-car-item').remove();
                                    }else{
                                        $(self).parents('.shops-list').remove();
                                        if($('.goods-car').find('.shops-list').length <= 0){
                                            initCartList();
                                        }
                                    }
                                    goodsPriceTotal();
                                }else{
                                    alert(res.datas.error);
                                }
                            }
                        }
                    });
              },
            });
        }

        //购买数量减
        function minusBuyNum(){
            var self = this;
            editQuantity(self,"minus");
        }
        //购买数量加
        function addBuyNum(){
            var self = this;
            editQuantity(self,"add");
        }
        //购买数量增或减，请求获取新的价格
        function editQuantity(self,type){
            event.stopPropagation(); //阻止向父节点冒泡
            var sPrents = $(self).parents(".goods-edit-tool")
            var cart_id = sPrents.attr("cart_id");
            var numInput = sPrents.find("input[name='goods-num']");
            var buynum = parseInt(numInput.val());
            var quantity = 1;
            if(type == "add"){
                quantity = parseInt(buynum+1);

                var promotions_id = parseInt($(self).attr('promotions-id'));
                var goods_id = $(self).attr('goods-id');
                var upper_limit = parseInt($(self).attr('upper-limit'));

                if(promotions_id){
                    //发起ajax请求
                    $.ajax({
                        type:'post',
                        url:ApiUrl+'/index.php?act=member_bought&op=promotions_num',
                        data:{goods_id:goods_id, promotions_id:promotions_id, key:key},
                        dataType:'json',
                        success:function(result){
                            var bought_promotions_num = parseInt(result.datas); //已经购买过的促销产品数量
                            var buynum = quantity;

                            if(buynum > upper_limit){
                                $.sDialog({
                                    skin:"red",
                                    content:"该产品限购"+ upper_limit +"件",
                                    okBtn:true,
                                    cancelBtn:false
                                });
                            }else if (buynum + bought_promotions_num > upper_limit) {
                                $.sDialog({
                                    skin:"red",
                                    content:"该产品限购"+ upper_limit +"件 你已购买" + bought_promotions_num + "件",
                                    okBtn:true,
                                    cancelBtn:false
                                });
                            }else{
                                cartEditQuantity(self,quantity);
                            }
                        }
                    });
                }else{
                    cartEditQuantity(self,quantity);
                }

            }else {
                if(buynum >1){
                    quantity = parseInt(buynum-1);
                    cartEditQuantity(self,quantity);
                }else {
                    $.sDialog({
                        skin:"red",
                        content:'购买数目必须大于1',
                        // content:'购买数目必须大于0',
                        okBtn:false,
                        cancelBtn:false
                    });
                    return;
                }
            }
        }
        //修改购物车商品数量
        function cartEditQuantity(self,quantity){
            var sPrents = $(self).parents(".goods-edit-tool")
            var cart_id = sPrents.attr("cart_id");
            var numInput = sPrents.find("input[name='goods-num']");
            $.ajax({
                url:ApiUrl+"/index.php?act=member_cart&op=cart_edit_quantity",
                type:"post",
                data:{key:key,cart_id:cart_id,quantity:quantity},
                dataType:"json",
                success:function (res){
                    if(checklogin(res.login)){
                        if(!res.datas.error){
                            numInput.val(res.datas.quantity);
                            sPrents.find(".change-goods-num").html(res.datas.quantity);
                            sPrents.parent().find(".goods-num").find('span').html(res.datas.quantity);
                            goodsPriceTotal();
                        }else{
                            $.sDialog({
                                skin:"red",
                                content:res.datas.error,
                                okBtn:false,
                                cancelBtn:false
                            });
                        }
                    }
                }
            });
        }

        //去结算
        var buy_laoding=false;
        function goSettlement(){
            //购物车ID
            var cartIdArr = [];
            var cartIdEl = [];
            $('.goods-car .goods-active').each(function(){
                cartIdEl.push($(this).parent().parent().find(".goods-edit-tool"));
            });
            if(cartIdEl.length <= 0){
                $.sDialog({
                    skin:"red",
                    content:'您还没选择商品',
                    okBtn:true,
                    cancelBtn:false
                });
                return false;
            }

            if(buy_laoding){return false;}
            buy_laoding = true;
            var check = true; //检验是否有购买资格

            for(var i = 0;i<cartIdEl.length;i++){
                var cartId = $(cartIdEl[i]).attr("cart_id");
                var cartNum = parseInt($(cartIdEl[i]).find("input[name='goods-num']").val());
                var cartIdNum = cartId+"_"+cartNum;
                cartIdArr.push(cartIdNum);

                var promotions_id = $(cartIdEl[i]).find(".goods-add").attr('promotions-id');

                if(promotions_id){
                    var goods_name = $(cartIdEl[i]).find(".goods-add").attr('goods-name');
                    var goods_id = $(cartIdEl[i]).find(".goods-add").attr('goods-id');
                    var upper_limit = $(cartIdEl[i]).find(".goods-add").attr('upper-limit');
                    $.ajax({
                        type:'post',
                        url:ApiUrl+'/index.php?act=member_bought&op=promotions_num',
                        data:{goods_id:goods_id, promotions_id:promotions_id, key:key},
                        dataType:'json',
                        async: false,
                        success:function(result){
                            var bought_promotions_num = parseInt(result.datas); //已经购买过的促销产品数量
                            var buynum = cartNum;
                            if(buynum > upper_limit){
                                check = false;
                                $.sDialog({
                                    skin:"red",
                                    content:goods_name+ upper_limit +"件",
                                    okBtn:true,
                                    cancelBtn:false
                                });
                            }else if (buynum + bought_promotions_num > upper_limit) {
                                check = false;
                                $.sDialog({
                                    skin:"red",
                                    content:goods_name+'限购'+ upper_limit +"件 你已购买" + bought_promotions_num + "件",
                                    okBtn:true,
                                    cancelBtn:false
                                });
                            }
                        }
                    });
                }
            }
            var cart_id = cartIdArr.toString();
            buy_laoding=false;
            if(check){
                //此处pgaename没有对应url使用orderDetail的原因 安卓客户端默认没有刷新页面,只是通监听特殊页面pagename(orderDetail)来刷新页面以后需开新的接口;
                MYAPP.gopage('orderDetail', WapSiteUrl + "/tmpl/order/buy_step1.html?ifcart=1&cart_id=" + cart_id,{title:'确认订单',showCart:0,headerAlpha:1});
            }

        }
    }
});