MYAPP.ready(function (){
    // WAP子商品页面跳转到WAP2 http跳转https
    var old_url = document.URL;
    if (window.location.hostname == "myshop.moyuntv.com" && window.location.protocol == "http:") {
     var new_url = old_url.replace("http://", "https://");
     window.location.href = new_url;
    }
    
    //快递方式选择
     // 图片轮播
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

    $(window).scroll(scrollTopIcon);
    $('#gotop').click(function () {scroll('0px', 50);});

    //点击加载更多 等同于下一页
    $('.more-vailable').click(nextPage);

    var page = 10; //每页评论数量
    var curpage = 1;
    var goods_parent_id = '';

    var goods_id = GetQueryString("goods_id");
    var fitgroup_id = GetQueryString("fitgroup_id");

    // 判断是否需要协议的商品，默认不是
    var crowdfunding = false;

    //渲染页面
    $.ajax({
       url:ApiUrl+"/index.php?act=goods&op=goods_child_detail",
       type:"get",
       data:{goods_id:goods_id,fitgroup_id:fitgroup_id},
       dataType:"json",
       beforeSend:ajaxLoading,
       success:function(result){
          var data = result.datas;
          if(!data.error){

            // 当前商品是否是需要协议的商品
            crowdfunding = data.goods_info.crowdfunding;

            goods_parent_id = data.goods_info.goods_id;
            //商品图片格式化数据
            if(data.goods_image){
              var goods_image = data.goods_image.split(",");
              data.goods_image = goods_image;
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
            document.title = data.goods_info.goods_name;
            //渲染模板 各种DOM的操作必须在渲染模板之后
            var html = template.render('product_detail', data);
            $("#product_detail_wp").html(html);

            // 判断是否显示协议
            if(crowdfunding){
              $('.protocol-div').css('display','block');
            }else{
              $('.protocol-div').css('display','none');
            }

            //立即购买按钮颜色 非秒杀商品和商品在秒杀周期内,按钮颜色都不变灰
            var counttime2 = $("#countzero").attr("addTimeStamp")
            if(counttime2){
                  $("#buy-fast").css('background','#808080')
              }

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
            //分享功能
            $(".i-share").click(function(){
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
                                  MYAPP.shareProduct(share_goods_name, share_goods_price, share_goods_url, share_goods_image);
                              }
                          }else{
                              if (typeof(share_goods_name) != "undefined" && typeof(share_goods_price) != "undefined" && typeof(share_goods_url) != "undefined" && typeof(share_goods_image) != "undefined"){
                                  //分享接口调用
                                  MYAPP.shareProduct(share_goods_name, share_goods_price, share_goods_url, share_goods_image);
                              }
                          }
                      }
                  });
              }else{
                  if (typeof(share_goods_name) != "undefined" && typeof(share_goods_price) != "undefined" && typeof(share_goods_url) != "undefined" && typeof(share_goods_image) != "undefined"){
                      //分享接口调用
                      MYAPP.shareProduct(share_goods_name, share_goods_price, share_goods_url, share_goods_image);
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
              var key = getLocalStorage('key');//登录标记
              var buy_num = parseInt($('.buy-num').val());
               if(key==''){
                   gotoLoginPage();
               }else{
                  var quantity = parseInt($(".buy-num").val());
                  //bof团购和限时折扣处理
                  var promotions_id = $('input[name=promotions_id]').val();

                  if(typeof(promotions_id) == 'undefined'){
                      $.ajax({
                          url:ApiUrl+"/index.php?act=member_cart&op=cart_add",
                          data:{key:key,goods_id:goods_id,quantity:quantity,m_id:m_id},
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
                                       data:{key:key,goods_id:goods_id,quantity:quantity,m_id:m_id},
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
            
            //立即购买
            var buy_laoding=false;
            $(".buy-now").click(function (){
               var key = getLocalStorage('key');//登录标记
               if(false){//业务调整暂不进这个跳转登陆页,走快捷注册
                   gotoLoginPage();
               }
               else{
               var counttime = $("#countzero").attr("addTimeStamp")
               //该商品在秒杀周期内或者不是秒杀商品都可继续往下 null和""
               
               if(counttime>0){
                  return false
               }
                var json = {};
                var buynum = parseInt($('.buy-num').val());
                var pick_shipment_extend_id = $('input[name=pick_shipment_choice]').val();

                if(typeof(pick_shipment_extend_id) == 'undefined'){
                  var pick_shipment_extend_id = 0;
                }
                var fitgroup_id = GetQueryString("fitgroup_id");

                json.key = key;
                json.cart_id = goods_id+'_'+buynum;
                json.pick_shipment_extend_id = pick_shipment_extend_id;
                json.fitgroup_id = fitgroup_id;

                var stocknum = parseInt($(".key-no").attr('stock-num'));

                if (stocknum < buynum) {
                  //库存不足
                  $.sDialog({
                    skin:"red",
                    content:"库存不足",
                    okBtn:false,
                    cancelBtn:false
                  });
                }else{
                    //处理堆栈导致的不能再次点击
                     if(buy_laoding) return false;
                     buy_laoding=true;
                     setTimeout(function(){buy_laoding=false;}, 3000);

                    //bof团购和限时折扣处理
                    var promotions_id = $('input[name=promotions_id]').val();

                    var protocol = document.getElementById('protocol');

                    if(typeof(promotions_id) == 'undefined'){
                      //无任何促销活动
                        //bof直接购买
                        $.ajax({
                        type:'post',
                        url:ApiUrl+'/index.php?act=member_buy&op=buy_step1',
                        data:json,
                        dataType:'json',
                        beforeSend:ajaxPosting,
                        success:function(result){
                          if(typeof(result.datas.error) == 'undefined'){
                              // if(crowdfunding){
                              //     if(protocol.checked){
                              //       //此处pgaename没有对应url使用orderDetail的原因 安卓客户端默认没有刷新页面,只是通监听特殊页面pagename(orderDetail)来刷新页面以后需开新的接口;
                              //       // MYAPP.gopage('orderDetail', WapSiteUrl+'/tmpl/order/buy_step1.html?goods_id='+goods_id+'&buynum='+buynum+'&pick_shipment_extend_id='+pick_shipment_extend_id,{title:'确认订单',showCart:0,headerAlpha:1});
                              //     }else{
                              //       window.location.hash = '#proa';
                              //       $.sDialog({
                              //           skin:"white",
                              //           content:'您还未确认购买协议',
                              //           okBtn:true,
                              //           cancelBtn:false
                              //         });
                              //     }
                              // }else{
                                //此处pgaename没有对应url使用orderDetail的原因 安卓客户端默认没有刷新页面,只是通监听特殊页面pagename(orderDetail)来刷新页面以后需开新的接口;
                                MYAPP.gopage('orderDetail', WapSiteUrl+'/tmpl/order/buy_step1.html?goods_id='+goods_id+'&buynum='+buynum+'&pick_shipment_extend_id='+pick_shipment_extend_id,{title:'确认订单',showCart:0,headerAlpha:1});
                              // }
                              
                          }else{

                              // if(checklogin(result.login))
                              //   $.sDialog({
                              //       skin:"red",
                              //       content:result.datas.error,
                              //       okBtn:false,
                              //       cancelBtn:false
                              //     });
                          }
                        }
                      });
                      //eof直接购买

                    }if(typeof(promotions_id) != 'undefined'){
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
                              //bof直接购买 在限时折扣和团购的情况下
                              $.ajax({
                              type:'post',
                              url:ApiUrl+'/index.php?act=member_buy&op=buy_step1',
                              data:json,
                              dataType:'json',
                              beforeSend:ajaxPosting,
                              success:function(result){
                                if(typeof(result.datas.error) == 'undefined'){
                                    //此处pgaename没有对应url使用orderDetail的原因 安卓客户端默认没有刷新页面,只是通监听特殊页面pagename(orderDetail)来刷新页面以后需开新的接口;
                                    MYAPP.gopage('orderDetail', WapSiteUrl+'/tmpl/order/buy_step1.html?goods_id='+goods_id+'&buynum='+buynum+'&pick_shipment_extend_id='+pick_shipment_extend_id+'&promotions_id='+promotions_id+'&upper_limit='+upper_limit,{title:'确认订单',showCart:0,headerAlpha:1});
                                    
                                    // if(crowdfunding){
                                    //   if(protocol.checked){
                                    //     //此处pgaename没有对应url使用orderDetail的原因 安卓客户端默认没有刷新页面,只是通监听特殊页面pagename(orderDetail)来刷新页面以后需开新的接口;
                                    //     // MYAPP.gopage('orderDetail', WapSiteUrl+'/tmpl/order/buy_step1.html?goods_id='+goods_id+'&buynum='+buynum+'&pick_shipment_extend_id='+pick_shipment_extend_id+'&promotions_id='+promotions_id+'&upper_limit='+upper_limit,{title:'确认订单',showCart:0,headerAlpha:1});
                                    //   }else{
                                    //     window.location.hash = '#proa';
                                    //     $.sDialog({
                                    //         skin:"white",
                                    //         content:'您还未确认购买协议',
                                    //         okBtn:true,
                                    //         cancelBtn:false
                                    //       });
                                    //   }
                                    // }else{
                                      //此处pgaename没有对应url使用orderDetail的原因 安卓客户端默认没有刷新页面,只是通监听特殊页面pagename(orderDetail)来刷新页面以后需开新的接口;
                                      // MYAPP.gopage('orderDetail', WapSiteUrl+'/tmpl/order/buy_step1.html?goods_id='+goods_id+'&buynum='+buynum+'&pick_shipment_extend_id='+pick_shipment_extend_id+'&promotions_id='+promotions_id+'&upper_limit='+upper_limit,{title:'确认订单',showCart:0,headerAlpha:1});
                                    // }
                                    
                                }else{
                                    // if(checklogin(result.login))
                                    //   $.sDialog({
                                    //       skin:"red",
                                    //       content:result.datas.error,
                                    //       okBtn:false,
                                    //       cancelBtn:false
                                    //     });
                                }
                              }
                            });
                            //eof直接购买
                          }
                        }
                      });
                    }
                    //eof团购和限时折扣处理
                }
               }

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
           // initGoodsBundling(); 子商品不需获取优惠套装信息
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

           if(isWeiXinOrQQ()){
             $('#cart').remove();
           }
           //默认不显示按钮
           $('.product-control').hide();
           $('.pd-fix-btn').hide();
           //检测是否是app访问
           checkIsAppPage();
           //关闭下载按钮
           closeDwonloadApp();
           //商品详情加载
           initProductInfo();

       },
       complete:ajaxLoadingComplete,
    });

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
            url:ApiUrl+"/index.php?act=store_show_child&op=store_info",
            data:{distribute_id:store_id},
            dataType:'json',
            success:function(result){
                var data = result.datas;
                if(data.store_info.hasOwnProperty('store_id')){
                    var html = template.render('store-info', data);
                    $("#store_info").html(html);

                    if(data.store_info.store_owner_mobile){
                      $("#store-owner-mobile").attr("href", "tel:" + data.store_info.store_owner_mobile);
                    }

                    //填充售前qq号码 此时goods_detail的html已经渲染好了
                    if(data.store_info.store_presales){
                      $("#store-qq").attr("qq", data.store_info.store_presales[0].num);
                    }

                    //打开QQ
                    $("#store-qq").click(function(){
                        MYAPP.jump('openQQ', {"QQ": $(this).attr('qq')});
                    });
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
           // var quantity = parseInt($(".buy-num").val());
            $.ajax({
               url:ApiUrl+"/index.php?act=member_cart&op=cart_add",
               data:{key:key,bl_id:bl_id},
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
      MYAPP.gopage('goodsDetail', WapSiteUrl+"/tmpl/goods_child.html?goods_id="+spec_goods_id,{title:'商品详情',showCart:1,headerAlpha:0});
  }

  function AddView(){
    var goods_info = getLocalStorage('goods');
    // var goods_id = GetQueryString('goods_id');
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

  //检查是否是App内打开的页面，不是则返回，用于分享判断
  function checkIsAppPage(){
    if (isMoyunApp()) {
      //app
      $('.product-control').show();
      $('.pd-fix-btn').remove();
      $('#share-collect-div').show();

    }else{
      //web
//      $('#cart').remove();
      $('.product-control').remove();
      $('.pd-fix-btn').show();
      $('#gocart').show();

      var comId = getComId("com_id");

      $("#buy-now").click(function(){
        var counttime = $("#countzero").html()       
        
        //该商品在秒杀周期内或者不是秒杀商品都可继续往下 null和""
        if(counttime){
          return false
       }
        event.stopPropagation(); //阻止里面的子元素冒泡
        var promotions_id = $('input[name=promotions_id]').val();
        var upper_limit = $("#upper_limit").attr("upper_limit");
        var pick_shipment_extend_id = $('input[name=pick_shipment_choice]').val();
        var buynum = parseInt($('.buy-num').val());
        var fitgroup_id = GetQueryString('fitgroup_id');

        if(typeof(promotions_id) == 'undefined'){ var promotions_id = 0; }
        if(typeof(upper_limit) == 'undefined'){ var upper_limit = 0; }
        if(typeof(pick_shipment_extend_id) == 'undefined'){ var pick_shipment_extend_id = 0; }

        if(crowdfunding){
          if(protocol.checked){
            MYAPP.gopage('quickBuy', WapSiteUrl+'/tmpl/quick_buy_1.html?goods_id='+goods_parent_id+'&buynum='+buynum+'&child_goods_id='+goods_id+'&pick_shipment_extend_id='+pick_shipment_extend_id+'&com_id='+comId+'&p_id='+promotions_id+'&upper_limit='+upper_limit,{title:'快捷下单',showCart:0,headerAlpha:1});
          }else{
            $('#maodian').click();
            $.sDialog({
              skin:"red",
              content:'您还未阅读并同意《棉花糖众筹支持者协议》',
              okBtn:false,
              cancelBtn:false
            });
          }
        }
        else{
            if(fitgroup_id){
                MYAPP.gopage('quickBuy', WapSiteUrl+'/tmpl/quick_buy_1.html?goods_id='+goods_parent_id+'&buynum='+buynum+'&child_goods_id='+goods_id+'&pick_shipment_extend_id='+pick_shipment_extend_id+'&com_id='+comId+'&p_id='+promotions_id+'&upper_limit='+upper_limit+'&fitgroup_id='+fitgroup_id,{title:'快捷下单',showCart:0,headerAlpha:1});
            }else{
                MYAPP.gopage('quickBuy', WapSiteUrl+'/tmpl/quick_buy_1.html?goods_id='+goods_parent_id+'&buynum='+buynum+'&child_goods_id='+goods_id+'&pick_shipment_extend_id='+pick_shipment_extend_id+'&com_id='+comId+'&p_id='+promotions_id+'&upper_limit='+upper_limit,{title:'快捷下单',showCart:0,headerAlpha:1});
            }
        }
        
      });

      if($('.goods-offline').css("display") != 'none'){
          $('.buy-now').css('background','#B8B9B9');
          $('.buy-now').unbind();
          $('#buy-now').unbind();
          $('.add-to-cart').css('background','#B8B9B9');
          $('#cart').unbind();
          $('.add-to-cart').unbind();
      }
    }
  }

  function closeDwonloadApp(){
    $('.close-btn-con').click(function () {
      $('.download-app').hide();
    });
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
            url: ApiUrl + "/index.php?act=goods&op=goods_child_body",
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
});