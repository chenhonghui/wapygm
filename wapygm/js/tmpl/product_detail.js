MYAPP.ready(function(){
    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});

    //点击加载更多 等同于下一页
    $('.more-vailable').click(nextPage);

    var page = 10; //每页评论数量
    var curpage = 1;

    var goods_id = GetQueryString("goods_id");
    //商品统计 --------------------live+系统和原生才需要-业务已经分离--------------
    // if(MYAPP.inapp()){
    //     var stat_params = MYAPP.getAppInfo().appId +'_'+ MYAPP.getAppInfo().comId +'_'+ MYAPP.getAppInfo().unique +'_'+ getLocalStorage('key');
    // }else{
    //     var stat_params = '';
    // }



    //渲染页面
    $.ajax({
       url:ApiUrl+"/index.php?act=goods&op=goods_detail",
       type:"get",
       data:{goods_id:goods_id},
       dataType:"json",
       beforeSend:ajaxLoading,
       success:function(result){
          var data = result.datas;
          if(!data.error){
            //商品图片数据 格式化并重写
            if(data.goods_image){
              data.goods_image = data.goods_image.split(",");
            }else{
               data.goods_image = [];
            }

            //商品规格格式化数据
            if(data.goods_info.spec_name){
              var goods_map_spec = $.map(data.goods_info.spec_name,function (v,i){
                var goods_specs = {};
                goods_specs["goods_spec_id"] = i;
                goods_specs['goods_spec_name']=v;
                if(data.goods_info.spec_value){
                  $.map(data.goods_info.spec_value,function(vv,vi){
                      if(i == vi){
                        goods_specs['goods_spec_value'] = $.map(vv,function (vvv,vvi){
                          var specs_value = {};
                          specs_value["specs_value_id"] = vvi;
                          specs_value["specs_value_name"] = vvv;
                          return specs_value;
                        });
                      }
                    });
                    return goods_specs;
                }else{
                  data.goods_info.spec_value = [];
                }
              });
              data.goods_map_spec = goods_map_spec;
            }else {
              data.goods_map_spec = [];
            }

            //如过有多规格的商品(单规格也有data.spec_list)，将share_mid应用于其他规格的商品
            if(data.spec_list){
              var share_mid = GetQueryString("share_mid");

              //记录谁分享的该商品 数据结构是一个子对象
              $.each(data.spec_list, function(spec_key, goods_id){
                if(goods_id && share_mid){
                  has_stored = getLocalStorage("share_key"); //记录每个商品是由谁分享的 值为：对象 OR 空字串
                  //+------------------------+
                  //+ goods_id1 -> share_mid1+
                  //+ goods_id2 -> share_mid2+
                  //+------------------------+
                  if (has_stored == "") {
                    need_share_data = {};
                    need_share_data[goods_id] = share_mid;
                    addLocalStorage("share_key", need_share_data);
                  } else {
                    //已经有了该对象
                    has_stored[goods_id] = share_mid; //暗含update和insert功能
                    addLocalStorage("share_key", has_stored);
                  }
                }
              });
            }

            //重置页面标题 供分享使用
            document.title = data.goods_info.goods_name;

            //渲染模板 各种DOM的操作必须在渲染模板之后
            var html = template.render('product_detail', data);
            $("#product_detail_wp").html(html);
			//渲染sell弹窗
			var sellAlert=initSellAlert(data,function(shopping,num){
				buyGoodsSubmit(shopping,num);
			});
			$("#chooseType,.buy-now").click(function(){
				sellAlert.show();
			});
			//设置展开赠品
			$("#giftOnoff").click(function(){
				var t= $(this);
				var type=t.hasClass("icon-xiajiantou");
				var childBlock=t.siblings(".gift-block");
				if(type){//立即展开
					t.removeClass("icon-xiajiantou").addClass("icon-jiantou");
					childBlock.show();
				}
				else {//立即收起
					t.removeClass("icon-jiantou").addClass("icon-xiajiantou");
					childBlock.hide();
				}
			});
            //图片轮播
            picSwipe();
            //商品描述
            $(".pddcp-arrow").click(function (){
              $(this).parents(".pddcp-one-wp").toggleClass("current");
            });
            //规格属性
            var myData = {};
            myData["spec_list"] = data.spec_list;
            $(".select-label").parent('a').click(function (){
              var self = this;
              arrowClick(self,myData);
            });
            //商品下架或者违规
            if(data.goods_info.goods_state != 1) {
              $('.goods-offline').show();
            }
            //商品售罄
            if(data.goods_info.goods_storage < 1) {
              $('.goods-offline').show();
              if(Object.size(data.spec_list) > 1){
                  $('.goods-offline').html('此规格已售罄，请选择其它规格');
              }else{
                  $('.goods-offline').html('商品已售罄');
              }

            }
            //是否显示多格规
            if(Object.size(data.spec_list) <= 1){
                $("#chooseType").hide().unbind();
            }

            //购买数量，减
            $(".minus-wp").click(function (){
               var buynum = $(".buy-num").val();
               if(buynum >1){
                  $(".buy-num").val(parseInt(buynum-1));
               }
            });
            //购买数量加
            $(".add-wp").click(function (){
               var buynum = parseInt($(".buy-num").val());
               var upper_limit = $("#upper_limit").attr("upper_limit");
               if(typeof(upper_limit) != 'undefined'){
                 var bool_add_judge = (buynum < data.goods_info.goods_storage && buynum < upper_limit);
               } else{
                 var bool_add_judge = (buynum < data.goods_info.goods_storage);
               }
               if(bool_add_judge){
                  $(".buy-num").val(parseInt(buynum+1));
               }
            });

            //初始化选中 自提
             $(".oneself-address-0").addClass("current");
             $(".selected-info-0").addClass("current").show();
            //选择自提地点
            $(".oneself-address").on("click",function(){
               if($(this).hasClass("current")){
                  return;
               }else{
                   $(".oneself-address").removeClass("current");
                   $(this).addClass("current");
                   var cs=$(this).attr("data");
                   $(".selected-info-time").removeClass("current").hide();
                   $(".selected-info-phone").removeClass("current").hide();
                   $("."+cs).show();
                   $("."+cs).addClass("current");
                   $('input[name=pick_shipment_choice]').val($(this).attr('value'));
               }
            })
            //分享功能(原：i-share)
            $("#doShare").click(function(){
              //获取商品信息
              var share_goods_name = data.goods_info.goods_name;
              if (data.goods_info.promotion_price) {
                var share_goods_price = data.goods_info.promotion_price;
              }else{
                var share_goods_price = data.goods_info.goods_price;
              }

              var share_goods_url = WapSiteUrl + "/tmpl/product_detail.html?goods_id=" + data.goods_info.goods_id +"&comId=" + MYAPP.getAppInfo().comId;
              var share_goods_image = data.goods_image[0];

              //登陆判断
              var key = getLocalStorage('key');
              if(key){
                  $.ajax({
                      type:'get',
                      url:ApiUrl+"/index.php?act=member_index&op=getMemberAffiliate&key="+key,
                      dataType:'json',
                      success:function(result){
                          if(!result.datas.error && result.datas.is_affiliate == '1'){
                              share_goods_url = WapSiteUrl + "/tmpl/product_detail.html?goods_id=" + data.goods_info.goods_id +"&comId=" + MYAPP.getAppInfo().comId;
                              if (typeof(share_goods_name) != "undefined" && typeof(share_goods_price) != "undefined" && typeof(share_goods_url) != "undefined" && typeof(share_goods_image) != "undefined"){
                                  //分享接口调用
                                  var params = {'title':share_goods_name,'imgUrl':share_goods_image,'link':share_goods_url};
                                  MYAPP.share(params);
                              }
                          }else{
                              if (typeof(share_goods_name) != "undefined" && typeof(share_goods_price) != "undefined" && typeof(share_goods_url) != "undefined" && typeof(share_goods_image) != "undefined"){
                                  //分享接口调用
                                  var params = {'title':share_goods_name,'imgUrl':share_goods_image,'link':share_goods_url};
                                  MYAPP.share(params);
                              }
                          }
                      }
                  });
              }else{
                  if (typeof(share_goods_name) != "undefined" && typeof(share_goods_price) != "undefined" && typeof(share_goods_url) != "undefined" && typeof(share_goods_image) != "undefined"){
                      //分享接口调用
                      var params = {'title':share_goods_name,'imgUrl':share_goods_image,'link':share_goods_url};
                      MYAPP.share(params);
                  }
              }

            });

            //计算评分
            evaluation_star(data['goods_info']);
            //收藏
            $(".pd-collect-icon").click(function (){
                var key = getLocalStorage('key');//登录标记
                if(key==''){
                    gotoLoginPage();
                }else{
                  $.ajax({
                    url:ApiUrl+"/index.php?act=member_favorites&op=favorites_add",
                    type:"post",
                    dataType:"json",
                    data:{goods_id:goods_id,key:key},
                    success:function (fData){
                     if(checklogin(fData.login)){
                        if(!fData.datas.error){
                          $.sDialog({
                            skin:"green",
                            content:"收藏成功！",
                            okBtn:false,
                            cancelBtn:false
                          });
                        }else{
                          $.sDialog({
                            skin:"red",
                            content:fData.datas.error,
                            okBtn:false,
                            cancelBtn:false
                          });
                        }
                      }
                    }
                  });
                }
            });
            //加入购物车
            $(".add-to-cart").click(function (){
            	sellAlert.show(function(param,count){
            		  var key = getLocalStorage('key');//登录标记
		              var buy_num = count;
		              var goods_id = param.goods_id;
		               if(key==''){
		                   gotoLoginPage();
		               }else{
		                  var quantity =count;

                      //谁分享此该商品 暂时不考虑购物车---------2016年12月2日------在buy_step1也有此方法
                      var has_stored_share_data = getLocalStorage("share_key");
                      if (has_stored_share_data != "") {
                          share_mid = has_stored_share_data[goods_id];
                          //当前购买商品并没人分享
                          if(typeof(share_mid) == 'undefined'){
                              share_mid = 0;
                          }
                      } else{
                          share_mid = 0;
                      }

		                  //bof团购和限时折扣处理
		                  var promotions_id = $('input[name=promotions_id]').val();
		                  if(typeof(promotions_id) == 'undefined'){
		                      $.ajax({
		                          url:ApiUrl+"/index.php?act=member_cart&op=cart_add",
		                          data:{key:key,goods_id:goods_id,quantity:quantity,share_mid:share_mid},
		                          type:"post",
		                          success:function (result){
		                              var rData = $.parseJSON(result);
		
		                              if(checklogin(rData.login)){
		                                  if(!rData.datas.error){
		                                      $.sDialog({
		                                          skin:"block",
		                                          content:"添加购物车成功！",
		                                          okBtn:false,
		                                          cancelBtn:false
		                                      });
		                                  }else{
		                                      $.sDialog({
		                                          skin:"red",
		                                          content:rData.datas.error,
		                                          okBtn:false,
		                                          cancelBtn:false
		                                      });
		                                  }
		                              }
		                          }
		                      })
		                  }

	                   //促销活动处理 start
	                   if(typeof(promotions_id) != 'undefined'){
	                       //有促销活动 获取buyer_id, goods_id, promotions_id 供后台查询已经参与当前活动的购买数量
	                       var promotions_id = parseInt(promotions_id);
	
	                       //发起ajax请求
	                       $.ajax({
	                           type:'post',
	                           url:ApiUrl+'/index.php?act=member_bought&op=promotions_num',
	                           data:{goods_id:goods_id, promotions_id:promotions_id, key:key},
	                           dataType:'json',
	                           success:function(result){
	                               var bought_promotions_num = parseInt(result.datas); //已经购买过的促销产品数量
	                               var buynum = parseInt($(".buy-num").val());
	                               var upper_limit = parseInt($("#upper_limit").attr("upper_limit"));
	
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
	                                   //bof直接加入购物车 在限时折扣和团购的情况下
	                                   $.ajax({
	                                       url:ApiUrl+"/index.php?act=member_cart&op=cart_add",
	                                       data:{key:key,goods_id:goods_id,quantity:quantity,share_mid:share_mid},
	                                       type:"post",
	                                       success:function (result){
	                                           var rData = $.parseJSON(result);
	
	                                           if(checklogin(rData.login)){
	                                               if(!rData.datas.error){
	                                                   MYAPP.jump('refreshCartIcon', {});//刷新客户端购物车图标
	                                                   $.sDialog({
	                                                       skin:"block",
	                                                       content:"添加购物车成功！",
	                                                       okBtn:false,
	                                                       cancelBtn:false
	                                                   });
	                                               }else{
	                                                   $.sDialog({
	                                                       skin:"red",
	                                                       content:rData.datas.error,
	                                                       okBtn:false,
	                                                       cancelBtn:false
	                                                   });
	                                               }
	                                           }
	                                       }
	                                   })
	                               }
	                           }
	                       });
	                   }
	                   //团购和限时折扣处理 end
		               }
            	});
            });

            }else {
              var html = '<div class="no-record" style="margin-top: 40px;">'+data.error+'</div>';
              $("#product_detail_wp").html(html);
            }
            //验证购买数量是不是数字
            $("#buynum").blur(buyNumer);

            ////增加浏览记录
            AddView();

            //店铺信息
           initStoreInfo();
           //套装信息
           initGoodsBundling();
           //送货方式设置
           $('.flex1-select').click(function(){
               if ($('input[name=pick_shipment_choice]').val() != '0') {
                  $("#pick").hide();
                  $("#delivery").show();
               }else{
                  $("#pick").show();
                  $("#delivery").hide();
               }
              $('.delivery-box').show(500);
           });
           $('.delivery-box').click(function(e){
               var pBox = $(this);
               var obj = e.target || e.srcElement;
               if(obj.tagName == 'LI'){
                    if($(obj).attr('val') == 1){
                        $("#pick_shipment").hide();
                        $("#transport").html($(obj).html());
                        $('input[name=pick_shipment_choice]').val('0');
                    }else{
                        $("#pick_shipment").show();
                        $("#transport").html($(obj).html());
                        var current = $(".current").attr("value");
                        $('input[name=pick_shipment_choice]').val(current);
                    }
               }
               setTimeout(function(){
                   pBox.css({'display':'none','border-right':'solid 1px #dadada'});
               },100);
           });
           //判断商品属性为空的情况下 attr_s_title
           $('.attr_f_title').each(function(){
             if($(this).children('.attr_s_title').text()==null){
               $(this).css('display','none');
             }

           });

           //针对微信一系列事件
           if(isWeiXin()){
             weiXinHandle();
           }
           //检测是否是app访问
           checkIsAppPage();
           //关闭下载按钮
           closeDwonloadApp();
           //商品详情加载
           initProductInfo();

       },
       complete:ajaxLoadingComplete,
    });

    //图片轮播
    function picSwipe(){
        var elem = $("#mySwipe")[0];

        var tsize = $(".pds-tsize").text();
        var cursize = $(".pds-cursize").text();

        window.mySwipe = Swipe(elem, {
            continuous: true,
            // disableScroll: true,
            stopPropagation: true,

            callback: function(index, element) {

                if(((index+1)>tsize) && (index+1)!=tsize){
                    $(".pds-cursize").html((index-1));
                }else if(tsize==(index+1)){
                    $(".pds-cursize").html(tsize);
                }else{
                    $(".pds-cursize").html(index+1);
                }
            }
        });
    }

    //套装信息
    function initGoodsBundling(){
      var store_id= $("#store_info").attr("store_id");
      $.ajax({
        type:'post',
        url:ApiUrl+"/index.php?act=goods&op=get_bundling",
        data:{goods_id:goods_id,store_id:store_id},
        dataType:'json',
        success:function(result){
          if(result){
            var data = result.datas;
            var html = template.render('bundling-detail', data);
            $("#bundling_info").html(html);
            $(".bl_add-to-cart").click(bladdtocart);
            //优惠套装滚动
            new scrollMenu("product-suit-scroll");
          }
        }
      });
    }

    //店铺信息
    function initStoreInfo(){
        var store_id= $("#store_info").attr("store_id");
        $.ajax({
            type:'get',
            url:ApiUrl+"/index.php?act=store_show&op=store_info",
            data:{store_id:store_id},
            dataType:'json',
            success:function(result){
                var data = result.datas;
                if(data.store_info.hasOwnProperty('store_id')){
                    var html = template.render('store-info', data);
                    $("#store_info").html(html);

                    if(data.store_info.store_owner_mobile){
                      $("#store-owner-mobile").attr("href", "tel:" + data.store_info.store_owner_mobile);
                    }
                }else{
                    $("#store_info").hide();
                }
            }
        });
    }

    function bladdtocart(){
       var bl_id= $(".bl_add-to-cart").attr("bl_id");
       var key = getLocalStorage('key');//登录标记
         if(key==''){
             gotoLoginPage();
         }else{
            //谁分享此该商品 暂时不考虑购物车---------2016年12月2日
            var has_stored_share_data = getLocalStorage("share_key");
            if (has_stored_share_data != "") {
                data.share_mid = has_stored_share_data[goods_id];

                //当前购买商品并没人分享
                if(typeof(data.share_mid) == 'undefined'){
                    data.share_mid = 0;
                }
            } else{
                data.share_mid = 0;
            }

            $.ajax({
               url:ApiUrl+"/index.php?act=member_cart&op=cart_add",
               data:{key:key,bl_id:bl_id,share_mid:share_mid},
               type:"post",
               success:function (result){
                  var rData = $.parseJSON(result);
                  if(checklogin(rData.login)){
                    if(!rData.datas.error){
                       $.sDialog({
                          skin:"block",
                          content:"添加购物车成功！",
                          "okBtnText": "再逛逛",
                          "cancelBtnText": "去购物车",
                          okFn:function (){
                            MYAPP.gopage('goodsList', WapSiteUrl + '/tmpl/product_list.html?store_id=0',{title:'商品列表',showCart:0,headerAlpha:1});
                          },
                          cancelFn:function (){
                            MYAPP.gopage('cartList', WapSiteUrl+'/tmpl/cart_list.html',{title:'购物车',showCart:0,headerAlpha:1});
                          }
                        });
                    }else{
                      $.sDialog({
                        skin:"red",
                        content:rData.datas.error,
                        okBtn:false,
                        cancelBtn:false
                      });
                    }
                  }
               }
            })
         }
    }
    //计算评分
    function evaluation_star(evaluation){
        var evaluation_star = evaluation['evaluation_star'];
        var star_count = evaluation['evaluation_count']*5;
        var sum = 0;
        for(var i in evaluation_star){
            if(i>=3){
                sum += evaluation_star[i]*i;
            }
        }
        function fomatFloat(src,pos){
            return Math.round(src*Math.pow(10, pos))/Math.pow(10, pos);
        }
        var percentage = 0.85;
        if(fomatFloat(sum/star_count, 1)>percentage){
            percentage = fomatFloat(sum/star_count, 1);
        }
        if(fomatFloat(sum/star_count, 1) > 1) {
            percentage = 1;
        }
        $("#evaluation_star").html(percentage*100+"%好评");
    }

      //点击商品规格，获取新的商品
      function arrowClick(self,myData){
          $(self).parent().find('label').removeClass("selected");
          $(self).children('label').addClass("selected");
          //拼接属性
          var curEle = $("#stock-spec").find("label.selected");
          var curSpec = [];
          $.each(curEle,function (i,v){
            curSpec.push($(v).attr("specs_value_id"));
          });
          //js自带sort方法是按照asc码排序
          var specTemp = curSpec.sort(function(a,b){return a-b;});
          var spec_string = specTemp.join("|");
          //获取商品ID
          var spec_goods_id = myData.spec_list[spec_string];
          MYAPP.gopage('goodsDetail', WapSiteUrl+"/tmpl/product_detail.html?goods_id="+spec_goods_id,{title:'商品详情',showCart:1,headerAlpha:0});
      }

      function AddView(){
        var goods_info = getLocalStorage('goods');
        var goods_id = GetQueryString('goods_id');
        if(goods_id<1){
          return false;
        }

        if(goods_info==''){
          goods_info+=goods_id;
        }else{

          var goodsarr = goods_info.split('@');
          if(contains(goodsarr,goods_id)){
            return false;
          }
          if(goodsarr.length<5){
            goods_info+='@'+goods_id;
          }else{
            goodsarr.splice(0,1);
            goodsarr.push(goods_id);
            goods_info = goodsarr.join('@');
          }
        }

        addLocalStorage('goods',goods_info);
        return false;
      }

      function contains(arr, str) {//检测goods_id是否存入
          var i = arr.length;
          while (i--) {
                 if (arr[i] === str) {
                 return true;
                 }
          }
          return false;
      }

      //检测商品数目是否为正整数
      function buyNumer(){
        var buynum_input = $("#buynum").val();
        var stocknum = parseInt($(".key-no").attr('stock-num'));

        //input输入 购买数量正则验证
        var reg = /^(([1-9]\d{0,6}))$/; //1到999999的自然数
        var reg_result = reg.test(buynum_input);

        if(reg_result && buynum_input > stocknum){
          $.sDialog({
            skin:"black",
            content:"库存不足",
            okBtn:true,
            cancelBtn:false
          });
          $("#buynum").val("1");
          return false;
        }

        if(!reg_result){
          $.sDialog({
            skin:"black",
            content:"请输入正确的购买数量",
            okBtn:true,
            cancelBtn:false
          });
          $("#buynum").val("1");
          return false;
        }

      }
      //检查是否是App内打开的页面
      function checkIsAppPage(){
        if (isMoyunApp()) {
          //app
          $('#wap_button').remove();
          $('.pd-fix-btn').show();
//        $('#share-collect-div').show();
		  $("#doShare").show();
        }else{
          //web
          $('#app_button').remove();
          $('.pd-fix-btn').show();
          $('#gocart').show();

          var comId = getComId("com_id");
          var goods_id = GetQueryString("goods_id");
          if($('.goods-offline').css("display") != 'none'){
//  	    	  $("#chooseType").hide().unbind();
              $('.buy-now').css('background','#B8B9B9').unbind();
              $('.add-to-cart').css('background','#B8B9B9').unbind();
              $('#cart').unbind();
          }
        }
      }

      function closeDwonloadApp(){
        $('.close-btn-con').click(function () {
          $('.download-app').hide();
        });
      }
    //商品立即购买处理
    function buyGoodsSubmit(shopping,num){
        if(isMoyunApp()){//app中
            //在app端购买
            var buy_laoding=false;
            var key = getLocalStorage('key'); //登录标记
            if (key == '') {
                gotoLoginPage();
            } else {
                var json = {};
                var buynum = parseInt(num);
                var pick_shipment_extend_id = $('input[name=pick_shipment_choice]').val();

                if (typeof(pick_shipment_extend_id) == 'undefined') {
                    var pick_shipment_extend_id = 0;
                }

                json.key = key;
                json.cart_id = shopping.goods_id + '_' + buynum;
                json.pick_shipment_extend_id = pick_shipment_extend_id;

//                var stocknum = parseInt($(".key-no").attr('stock-num'));

//                if (stocknum < buynum) {
//                    //库存不足
//                    $.sDialog({
//                        skin: "red",
//                        content: "库存不足",
//                        okBtn: false,
//                        cancelBtn: false
//                    });
//                } else {
                    //处理堆栈导致的不能再次点击
                    if (buy_laoding) return false;
                    buy_laoding = true;
                    setTimeout(function() {
                        buy_laoding = false;
                    }, 3000);

                    //bof团购和限时折扣处理
                    var promotions_id = $('input[name=promotions_id]').val();

                    if (typeof(promotions_id) == 'undefined') {
                        //无任何促销活动
                        //bof直接购买
                        $.ajax({
                            type: 'post',
                            url: ApiUrl + '/index.php?act=member_buy&op=buy_step1',
                            data: json,
                            dataType: 'json',
                            beforeSend: ajaxPosting,
                            success: function(result) {
                                if (typeof(result.datas.error) == 'undefined') {
                                    //此处pgaename没有对应url使用orderDetail的原因 安卓客户端默认没有刷新页面,只是通监听特殊页面pagename(orderDetail)来刷新页面以后需开新的接口;
                                    MYAPP.gopage('orderDetail', WapSiteUrl + '/tmpl/order/buy_step1.html?goods_id=' + shopping.goods_id + '&buynum=' + buynum + '&pick_shipment_extend_id=' + pick_shipment_extend_id, {
                                        title: '确认订单',
                                        showCart: 0,
                                        headerAlpha: 1
                                    });
                                } else {
                                    if (checklogin(result.login))
                                        $.sDialog({
                                            skin: "red",
                                            content: result.datas.error,
                                            okBtn: false,
                                            cancelBtn: false
                                        });
                                }
                            }
                        });
                        //eof直接购买

                    }
                    if (typeof(promotions_id) != 'undefined') {
                        //有促销活动 获取buyer_id, goods_id, promotions_id 供后台查询已经参与当前活动的购买数量
                        var promotions_id = parseInt(promotions_id);

                        //发起ajax请求
                        $.ajax({
                            type: 'post',
                            url: ApiUrl + '/index.php?act=member_bought&op=promotions_num',
                            data: {
                                goods_id: shopping.goods_id,
                                promotions_id: promotions_id,
                                key: key
                            },
                            dataType: 'json',
                            success: function(result) {
                                var bought_promotions_num = parseInt(result.datas); //已经购买过的促销产品数量
                                var buynum = parseInt(num);
                                var upper_limit = parseInt($("#upper_limit").attr("upper_limit"));

                                if (buynum > upper_limit) {
                                    $.sDialog({
                                        skin: "red",
                                        content: "该产品限购" + upper_limit + "件",
                                        okBtn: true,
                                        cancelBtn: false
                                    });
                                } else if (buynum + bought_promotions_num > upper_limit) {
                                    $.sDialog({
                                        skin: "red",
                                        content: "该产品限购" + upper_limit + "件 你已购买" + bought_promotions_num + "件",
                                        okBtn: true,
                                        cancelBtn: false
                                    });
                                } else {
                                    //bof直接购买 在限时折扣和团购的情况下
                                    $.ajax({
                                        type: 'post',
                                        url: ApiUrl + '/index.php?act=member_buy&op=buy_step1',
                                        data: json,
                                        dataType: 'json',
                                        beforeSend: ajaxPosting,
                                        success: function(result) {
                                            if (typeof(result.datas.error) == 'undefined') {
                                                //此处pgaename没有对应url使用orderDetail的原因 安卓客户端默认没有刷新页面,只是通监听特殊页面pagename(orderDetail)来刷新页面以后需开新的接口;
                                                MYAPP.gopage('orderDetail', WapSiteUrl + '/tmpl/order/buy_step1.html?goods_id=' + shopping.goods_id + '&buynum=' + buynum + '&pick_shipment_extend_id=' + pick_shipment_extend_id + '&promotions_id=' + promotions_id + '&upper_limit=' + upper_limit, {
                                                    title: '确认订单',
                                                    showCart: 0,
                                                    headerAlpha: 1
                                                });
                                            } else {
                                                if (checklogin(result.login))
                                                    $.sDialog({
                                                        skin: "red",
                                                        content: result.datas.error,
                                                        okBtn: false,
                                                        cancelBtn: false
                                                    });
                                            }
                                        }
                                    });
                                    //eof直接购买
                                }
                            }
                        });
//                    }
                    //eof团购和限时折扣处理
                }
            }

        }else{//wap中
            //在wap端中购买
            var promotions_id = $('input[name=promotions_id]').val();
            var upper_limit = $("#upper_limit").attr("upper_limit");
            var pick_shipment_extend_id = $('input[name=pick_shipment_choice]').val();
            var buynum = num;
            var comId= getComId();
            if(typeof(promotions_id) == 'undefined'){ var promotions_id = 0; }
            if(typeof(upper_limit) == 'undefined'){ var upper_limit = 0; }
            if(typeof(pick_shipment_extend_id) == 'undefined'){ var pick_shipment_extend_id = 0; }
            MYAPP.gopage('quickBuy', WapSiteUrl+'/tmpl/quick_buy_1.html?goods_id='+shopping.goods_id+'&buynum='+buynum+'&pick_shipment_extend_id='+pick_shipment_extend_id+'&com_id='+comId+'&p_id='+promotions_id+'&upper_limit='+upper_limit,{title:'快捷下单',showCart:0,headerAlpha:1});
        }
    }

    //下一页
    function nextPage (){
        curpage = curpage+1;
        initComment(page,curpage);
    }
    //商品评论加载
    function initComment(page,curpag){
        $.ajax({
            url:ApiUrl+"/index.php?act=goods&op=goods_comment&page="+page+"&curpage="+curpage,
            type:"get",
            data:{goods_id:goods_id},
            dataType:"json",
            success:function(result){
                var data = result.datas;
                data.hasmore = result.hasmore;
                data.WapSiteUrl = WapSiteUrl;
                data.curpage = curpage;
                if(data.comment_list.length){
                    var html = template.render('scomment_list', data);
                    $("#comment_list").append(html);

                    //加载更多
                    if(data.hasmore){
                        $(".more-vailable").html('点击加载更多...');
                    }else{
                        $(".more-vailable").hide();
                    }
                    $('.more-vailable').click(nextPage);
                    //图片放大
                    $(".pc-photo-view img").click(zoom);
                }else{
                    $(".more-vailable").hide();
                }
            }
        });
    }
    //商品详情加载
    function initProductInfo(){
        //切换商品详情
        $('#product_info').click(function(){
            $(this).addClass('active');
            $('#product_comment').removeClass('active');
            $('#product_info_body').show();
            $('#product_comment_list').hide();
        });
        //切换商品评论
        $('#product_comment').click(function(){
            $(this).addClass('active');
            $('#product_info').removeClass('active');
            $('#product_info_body').hide();
            $('#product_comment_list').show();
            if(!$('#comment_list').html()){
                initComment(page,curpage);
            }
        });

        $.ajax({
            url: ApiUrl + "/index.php?act=goods&op=goods_body",
            data: {goods_id: goods_id},
            type: "get",
            success: function(result) {
                if(result.trim()){
                  $("#product_info_body").html(result);

                  //lazyload
                  $('.lazyload').picLazyLoad({
                    threshold: 100,
                  });
                }
            }
        });
    }

    //图片放大
    function zoom(){
        var big_url = $(this).attr("big-src");
        MYAPP.gopage('productCommentPhoto', WapSiteUrl + '/tmpl/product_comment_photo.html?url='+encodeURIComponent(big_url),{title:'商品评论',showCart:0,headerAlpha:1});

    }

      function weiXinHandle(){
          $('#cart').remove();
          weixinShare();
      }

    //微信分享
    function weixinShare(){
      //微信分享数据
      weixin_share_data = new Object();
      weixin_share_data.title = document.title;
      weixin_share_data.imgUrl = $(".goods_image")[0].src;
      if($(".goods_jingle").text()) {
        weixin_share_data.desc = $(".goods_jingle").text();
      }else{
        weixin_share_data.desc = document.title;
      }
      
      var dynamicLoadJs = function (src) {
          var oHead = document.getElementsByTagName('HEAD').item(0);
          var oScript = document.createElement("script");
          oScript.type = "text/javascript";
          oScript.src = src;
          oHead.appendChild(oScript);
      }
      dynamicLoadJs('https://res.wx.qq.com/open/js/jweixin-1.0.0.js');
      dynamicLoadJs('../js/weixin.share.js');
    }

    //判断对象长度
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };
    
    
    //初始化弹出窗口，传入数据对象和提交执行的函数
    	function initSellAlert(data,endFn){
    		var fixview=$("#fixview");
    		if(!fixview.length)throw Error("没有找到fixview");
    		var sell_img=fixview.find(".sell_img img");//图片
    		var sell_price=fixview.find(".sell_info h2");//单价
    		var sell_name=fixview.find(".sell_info p");//名称
    		var sell_storage=fixview.find("#spec_goods_storage");//库存
    		var sell_all=fixview.find("#spec_sell_submit");//总计
    		
    		var listBox =fixview.find(".sell_type");//列表容器
    		var listBtn =null;//各个列表
    		var sell_count=fixview.find(".sell_count");//输入
    		var sell_sub=fixview.find("#sell_submit_btn");//确定
    		var maxStore=0;//库存
    		var blurMack=true;//防止在输入未结束时提交错误数量
    		var sendMack=true;//防止多次购买
    		
    		var tempFn=null;
    		
    		//同步单价和总计，获取用户需求(传入参数id表示指定某商品)
    		var countAll=function (firstId){
    			var nb=parseInt(sell_count.val());
    			var types,shopping;
    			if(firstId){
    				shopping=data["spec_goods_list"][firstId];
    			}
    			else {
    				if(listBtn.length){
	    				types=[];
		    			listBtn.each(function(index){
		    				types.push(parseInt($(this).find(".sell_act").data("specs_value_id")));
		    			});
		    			types.sort(function(a,b){
		    				return a-b
		    			});
		    			types=data["spec_list"][types.join("|")];
	    			}
	    			else {
	    				types=data["spec_list"][""];
	    			}
    				shopping=data["spec_goods_list"][types];
    			}
    			maxStore=parseInt(shopping["goods_storage"]);
    			
    			if(maxStore===0){//库存为0无法购买
    				nb=0;
    				sell_count.val(nb);
					sell_sub.addClass("sell_submit_btn_gray");
    			}
    			else {//否则开放购买
	    			if(nb===0){
	    				nb=1;
	    				sell_count.val(nb);
	    			}
	    			else if(nb>maxStore){
	    				nb=maxStore;
	    				sell_count.val(nb);
	    			}
					sell_sub.removeClass("sell_submit_btn_gray");
    			}
    			sell_price.text(parseFloat(shopping["goods_price"]).toFixed(2));//写入单价
    			sell_all.text("合计："+(parseFloat(shopping["goods_price"])*nb).toFixed(2));//写入合计
    			sell_storage.text(maxStore);//写入库存
    			sell_img.attr("src",shopping["goods_image_url"]);//写入图片
    			sell_name.text(shopping["goods_name"]);//写入商品名
    			return {
    				data:shopping,
    				nb:nb
    			}
    		}
    		
    		//获取初始的商品id
    		var tempId,tempData=data["goods_info"]["goods_spec"],tempArray=[];
    		for(var i in tempData){
    			tempArray.push(i);
    		}
    		tempId=data["spec_list"][tempArray.join("|")]||data["spec_list"][""];
    		
    		//初始化填充规格
    			var str="";
    			var i,j,goods_map_spec=data.goods_map_spec;
    			for(i =0;i<goods_map_spec.length;i++){
    				str+='<div class="sell_line sell_line_border" data-goods_spec_id="'+goods_map_spec[i].goods_spec_id+'">'+
                        '<h3>'+goods_map_spec[i].goods_spec_name+'：</h3>'+
                        '<div class="sell_line_btn clearfix">';
	                     for(j=0;j<goods_map_spec[i].goods_spec_value.length;j++){
	                     	str+='<span class="'+(goods_map_spec[i].goods_spec_value[j].specs_value_id in tempData?"sell_act":"")+'" data-specs_value_id ="'+goods_map_spec[i].goods_spec_value[j].specs_value_id+'">'+goods_map_spec[i].goods_spec_value[j].specs_value_name+'</span>'
	                     }
                    str+='</div></div>';
    			}
    			listBox.prepend(str);
    			listBtn=fixview.find(".sell_line_btn");

    		//初始化默认规格商品信息
    		countAll(tempId);
    		
    		//代理除输入外的所有点击事件
    		fixview.on("touchmove",function(e){e.preventDefault()})
    		.on("click",function(e){
    			var t= $(this);
    			var eve=$(e.target);
    			//关闭操作
    			if(eve.hasClass("sell_close")||eve.hasClass("fixView")){
    				t.hide();
    				return false
    			}
    			//选择规格
    			var ep=eve.parent();
    			if(eve[0].tagName==="SPAN"&&ep.hasClass("sell_line_btn")&&!eve.hasClass("sell_act")){
    				ep.find(".sell_act").removeClass("sell_act");
    				eve.addClass("sell_act");
    				countAll();
    			}
    			//增减、修改数量
				var nowNum=parseInt(sell_count.val());
    			if(eve.hasClass("sell_minus")&&maxStore!==0){
					sell_count.val(nowNum===1?1:--nowNum);
    				countAll();
    				return false;
    			}
    			else if(eve.hasClass("sell_add")&&maxStore!==0){
					sell_count.val(nowNum>=maxStore?maxStore:++nowNum);
    				countAll();
    				return false;
    			}
    			//提交确定
    			if(eve.hasClass("sell_submit_btn")&&maxStore!==0){
    				sell_count.blur();
    				var data=countAll();
    				if(!blurMack||!sendMack){
    					return ;
    				}
    				
    				sendMack=false;
					eve.addClass("sell_submit_btn_gray");
    				setTimeout(function(){
    					sendMack=true;
    					eve.removeClass("sell_submit_btn_gray");
    				},3000);
    				if(tempFn){
    					tempFn(data.data,data.nb);
    					tempFn=null;
    				}
    				else {
    					endFn&&typeof endFn==="function"&&endFn(data.data,data.nb);
    				}
                    fixview.hide();
    			}
    		});
    		
    		//手动输入数量纠错与限制
    		sell_count.on("change",function(){
    			var val=parseInt($(this).val());
    			isNaN(val)?val=1:val<=0?val=0:val>maxStore?val=maxStore:true;
    			this.value=val;
    			
    				countAll();
    			if(blurMack){
					blurMack=false
					setTimeout(function(){
						blurMack=true;
					},500);
    			}
    		});
    		return {
    			show:function(fn){
    				fixview.show();
    				tempFn=fn;
    			}
    		};
    	}
});