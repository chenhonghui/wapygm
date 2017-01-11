MYAPP.ready(function() {
	//数据搜集
	var key = getLocalStorage('key');
	var ifcart = GetQueryString('ifcart');
	//添加当前页面url地址cookie 新添加收货地址后，用于返回跳转
    addLocalStorage("buy_step1_url", window.location.href);
	//传到后台的address_id 用于用户收货地址的切换
	if (getLocalStorage('address_id') != '') {
		var address_id = getLocalStorage('address_id');
	}else{
		var address_id = '';
	}
	if(ifcart==1){
		var cart_id = GetQueryString('cart_id');
		var fitgroup_id = GetQueryString("fitgroup_id");
		var data = {key:key,ifcart:1,cart_id:cart_id,address_id:address_id,fitgroup_id:fitgroup_id};
        var pick_shipment_extend_id = GetQueryString("pick_shipment_extend_id");
	}else{
		var goods_id = GetQueryString("goods_id");
		var child_goods_id = GetQueryString("child_goods_id");
		var agency = GetQueryString("agency");
        if (child_goods_id == 'null' || child_goods_id == null || typeof(child_goods_id) == 'undefined' || child_goods_id=="") {
            child_goods_id = 0;
        }if (agency == 'null' || agency == null || typeof(agency) == 'undefined' || agency=="") {
            agency = 0;
        }
		var number = GetQueryString("buynum");
		var cart_id = goods_id+'_'+number;
		var fitgroup_id = GetQueryString("fitgroup_id");
		var data = {key:key,cart_id:cart_id,address_id:address_id,child_goods_id:child_goods_id,agency:agency,fitgroup_id:fitgroup_id};
		var pick_shipment_extend_id = GetQueryString("pick_shipment_extend_id");
		var quick = GetQueryString("quick");
		var promotions_id = GetQueryString("promotions_id");
		var upper_limit = GetQueryString("upper_limit");
	}
	if (pick_shipment_extend_id == null || typeof(pick_shipment_extend_id) == 'undefined' || pick_shipment_extend_id=="") {
		pick_shipment_extend_id = 0;
	}
	// 初始化页面
	$.ajax({//提交订单信息
		type:'post',
		url:ApiUrl+'/index.php?act=member_buy&op=buy_step1',
		dataType:'json',
		data:data,
		beforeSend:ajaxLoading,
		success:function(result){
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

			var htmldata = '';
			var total_price = '';
			var i = 0;
			var j = 0;
			$.each(data.store_cart_list,function(k,v){//循环店铺
				if(i==0){
					htmldata+=	'<li class="store-panel">';
				}else{
					htmldata+=	'<li class="store-panel">';
				}
				i++;
				htmldata+='<p class="buys-yt-tlt"><span class="iconfont icon-lnicon31"></span>'+v.store_name+'</p>';
				$.each(v.goods_list,function(k1,v1){//循环商品列表
					if(j==0){
						htmldata+=	'<div class="buys1-pdlist">';
					}else{
						htmldata+=	'<div class="buys1-pdlist">';
					}
					j++;
	                //子商品与最父级商品 详情地址区分
	                if(child_goods_id){
	                    var goods_url = WapSiteUrl+'/tmpl/goods_child.html?goods_id='+child_goods_id;
	                }else{
	                    var goods_url = WapSiteUrl+'/tmpl/product_detail.html?goods_id='+v1.goods_id;
	                }
	                htmldata+=
	                    '<div class="buys1-pdlcnt">'
	                        +'<div class="pdlcnt-pic clear" onclick="MYAPP.gopage(\'goodsDetail\', \''+goods_url+'\',{title:\'商品详情\',showCart:1,headerAlpha:0});">'
	                        +'<div class="img-wp fleft">'
	                        +'<img src="'+v1.goods_image_url+'"/>'
	                        +'</div>'
	                        +'<div class="pdlcnt-info fleft"><div class="p-i-hd clear"><p class="fleft p-i-l" ><a class="buys1-pdlc-name two-rows-txt-ellipsis">'+v1.goods_name+'</a></p>'
	                        + '</div>'
	                        + '<div class="p-i-bd clear"><div class="fleft p-i-r">¥'+v1.goods_price+'</div>'
	                        + '<div class="fleft">x<span>'+v1.goods_num+'</span></div></div>'
	                        + '</div>'
	                        +'</div></div><input type="hidden" name="child_price" class="child_price" value="'+v1.child_price+'">'
	                        +'</div>';
				});
						// 优惠券
				htmldata+='<p class="hide"><select name="voucher" store_id="'+k+'">';
				htmldata+='<option value="0">请选择代金券...</option>';
				$.each(v.store_voucher_list,function(k2,v2){
					htmldata+='<option value="'+v2.voucher_t_id+'|'+k+'|'+v2.voucher_price+'">'+v2.voucher_title+'</option>'
				});
				htmldata+='</select>:¥-<span id="sv'+k+'">0.00</span></p>';
				//优惠券
				htmldata+='<div class="store_voucher choice_item clearfix hide" data-store-voucher-value="0" data-store-id="'+ k +'"><i class="iconfont icon-go"></i>	<div class="fleft">代金券<span class="voucher-num-hint">1张可用</span></div> <div class="fright choice_r"><span class="choice_txt">未选择</span></div> </div>';
				//店铺留言
				htmldata += '<div class="buys1-pay-message"><input type="text" data-store-id="'+ k +'" value="" placeholder="给卖家留言：" class="pay_message"></div>';
				//优惠券优惠
				htmldata+='<div class="shop-total"><p id="store_voucher_white'+k+'" class="hide">优惠券:-¥<span id="voucher'+k+'">0.00</span></p>'
				// 运费
				htmldata+= '<p>运费: +¥<span id="store'+k+'">0.00</span></p>';
				if(v.store_mansong_rule_list != null){
					htmldata+= '<p>满即送:'+v.store_mansong_rule_list.desc+':-'+v.store_mansong_rule_list.discount+'</p>';
				}
				if(v.store_mansong_rule_list != null){
					var sp_total = eval(v.store_goods_total-v.store_mansong_rule_list.discount);
					htmldata+='<p class="clr-c07">本店合计: ¥<span id="st'+k+'" store_price="'+sp_total+'" class="store_total" data_store_total="">'+sp_total+'</span></p>';
				}else{
					var sp_total = v.store_goods_total;
					htmldata+='<p class="clr-c07">本店合计: ¥<span id="st'+k+'" store_price="'+sp_total+'" class="store_total" data_store_total="">'+sp_total+'</span></p>';
				}
				htmldata+='</div>';
				htmldata+='</li>';
				total_price = eval(parseFloat(sp_total)+total_price);
			});
			$("#goodslist_before").html(htmldata);
            //初始化支付方式
            initPaymentList();
            init_pick_shipment();
            //子商品屏蔽跳转
            if(child_goods_id){
                $(".buys1-pdlcnt").css("background","none");
                $(".pdlcnt-pic").removeAttr("onclick");
            }
            //拼团屏蔽稍后付款按钮
            if (fitgroup_id) {
                $('#buy_step2').remove();
                $('.buys-btn .buys-l').width("60%");
                $('.buys-btn .buys-r').width("40%");
            }

			//收获地址是否存在
            if(data.address_info == ''){
            	$.sDialog({
				    skin:"red",
				    content:"你还没有收货地址 马上去填写",
				    okBtn:true,
				    cancelBtn:false,
				    okFn:function (){
                       MYAPP.gopage('addressOpera', WapSiteUrl+'/tmpl/member/address_new.html',{title:'添加收货地址',showCart:0,headerAlpha:1});
                    }
				});
            }else{//有收获地址 填充内容
                $('#true_name').html(data.address_info.true_name);
                $('#address').html(data.address_info.area_info+' '+data.address_info.address);
                $('#mob_phone').html(data.address_info.mob_phone);
                $('.buys1-address-cnt').show();
                if(data.address_info.is_ygm == '1' && data.address_info.postcode == ''){
                    $.sDialog({
                        skin:"red",
                        content:"你还没有填写邮政编码 马上去填写",
                        okBtn:true,
                        cancelBtn:false,
                        okFn:function (){
                            MYAPP.gopage('addressOpera', WapSiteUrl+'/tmpl/member/address_new.html?address_id='+data.address_info.address_id,{title:'添加收货地址',showCart:0,headerAlpha:1});
                        }
                    });
                }
            }
            // 此时total_price只是 各店铺商品总额，还没包含运费
            $('input[name=init_goods_total]').val(total_price.toFixed(2));
            //总后台支付 和 所有商品 是否支持货到付款
            if (data.ifshow_offpay && data.all_goods_offpay) {
            	$('input[name=off_pay_allow_admin_and_goods]').val('1');
            }
			//优惠券横栏隐藏或者显示
			$('select[name=voucher]').each(function(){
				var tmp_store_id = $(this).attr('store_id');
				// 有优惠券具体信息 显示选择横条
				var voucher_num = $(this).children("option").length;
				var voucher_num_avaible = voucher_num - 1;
				if (voucher_num > 1) {
					$(".store_voucher[data-store-id='"+ tmp_store_id +"']").show();
					$(".store_voucher_white"+tmp_store_id).show();
					$(".store_voucher[data-store-id='"+ tmp_store_id +"']").find(".voucher-num-hint").html('本次可用' + voucher_num_avaible + '张');
				}
			});
			
			//预存款数据填充
			if(data.available_predeposit != null && data.available_predeposit != 0){
				$('#available_predeposit').html(data.available_predeposit);
				$('input[name=available_predeposit]').val(data.available_predeposit);
//				$('#predeposit').show();//隐藏钱包功能，改为弹出支付窗口中使用
			}
			$('#inv_content').html(data.inv_info.content);
			//$('#inv_content').html(data.inv_info.inv_title+"&nbsp;"+data.inv_info.inv_content);//发票信息
			$('input[name=address_id]').val(data.address_info.address_id);
            $("input[name=idcard_number]").val(data.address_info.idcard_number);
			$('input[name=area_id]').val(data.address_info.area_id);
			$('input[name=city_id]').val(data.address_info.city_id);
			$('input[name=freight_hash]').val(data.freight_hash);
			$('input[name=vat_hash]').val(data.vat_hash);
			$('input[name=offpay_hash]').val(data.offpay_hash);
			$('input[name=invoice_id]').val(data.inv_info.inv_id);
			var area_id = data.address_info.area_id;
			var city_id = data.address_info.city_id;
			var freight_hash = data.freight_hash;
			// 即便不更改地址，这个ajax也必须执行，用于运费的计算
			$.ajax({
				type:'post',
				url:ApiUrl+'/index.php?act=member_buy&op=change_address',
				data:{key:key,area_id:area_id,city_id:city_id,freight_hash:freight_hash},
				dataType:'json',
				success:function(result){
					if(result.datas.state == 'success'){
						var sp_s_total = 0;
						$.each(result.datas.content,function(k,v){
                            v = parseFloat(v);
                            if(pick_shipment_extend_id == 0){
                                $('#store'+k).html(v.toFixed(2));
                            }else{
                                v = 0;
                            }
	        				var sp_toal = parseFloat($('#st'+k).attr('store_price'));//店铺商品价格
	        				sp_s_total = v + sp_s_total;
	        				var this_store_total = parseFloat(sp_toal)+parseFloat(v);
	        				$('#st'+k).html(this_store_total.toFixed(2));
	        				$('#st'+k).attr("data_store_total", this_store_total.toFixed(2));
						});
						// 此时 各店铺商品总价 + 各店铺总运费
						var init_needpay = parseFloat($('input[name=init_goods_total]').val()) + sp_s_total;
						$('input[name=freight_cost]').val(sp_s_total.toFixed(2));
						$('input[name=init_needpay]').val(init_needpay.toFixed(2));
						$('#final_needpay_show').html(init_needpay.toFixed(2));
                        $('input[name=order_amount]').val(init_needpay.toFixed(2));
						$('input[name=offpay_hash]').val(result.datas.offpay_hash);
						//初始化支付方式 默认在线支付
						if (getLocalStorage("payment_choice") == "" || getLocalStorage("payment_choice") == null) {
							addLocalStorage("payment_choice","online");
						}
						//是否显示货到付款 需要的条件 总后台放开&所有下单商品支持&地区允许
						if (parseInt(result.datas.allow_offpay) && parseInt($('input[name=off_pay_allow_admin_and_goods]').val())) {
 							//支持货到付款
//							$("#bar-offline").show();
                            $("li[data-pay='offline']").show();
						}else{
							//不允许货到付款
//							$("#bar-online").show();
						}
//						//根据cookie设置 支付方式 文字内容
//						if(getLocalStorage("payment_choice") == "offline"){
//							$("#bar-offline-hint").html("货到付款");
//						}
//						//获取显示的支付方式
//						var pay_name_txt = $(".payment-method:visible").find(".pay_name").text();
//						if (pay_name_txt == "货到付款") {
//							$("input[name=pay_name]").val("offline");
//							$("#predeposit").hide();
//						}else{
//							$("input[name=pay_name]").val("online");
//						}
					}
				}
			});
			calcuFinalNeedPay();
			//切换优惠券的新效果
			$('.store_voucher').click(function(){
				//弹出选择界面
				var this_store_id = $(this).attr("data-store-id");
				var cur_optionds = $("select[store_id='"+ this_store_id +"']").children('option');
				//遍历当前options对象，形成用于弹出的html
				var voucher_pop_html = '';
				for (var i = 1; i < cur_optionds.length; i++) {
					voucher_pop_html += '<div class="c_b_bd_item" data-store-voucher-value="';
					voucher_pop_html += cur_optionds[i].value;
					voucher_pop_html += '">';
					voucher_pop_html += cur_optionds[i].innerText;
					voucher_pop_html += "<i class='iconfont icon-gouxuan'></i>";//新增 选中标示
					voucher_pop_html += '</div>';
				}
				$('.c_d_bd_list').html(voucher_pop_html);
				//记住上次的选择
				var last_choose = $(this).attr("data-store-voucher-value");
				if (last_choose != 0) {
					$(".c_b_bd_item[data-store-voucher-value='"+ last_choose +"']").addClass("choose-active");
				}
				$('.choice_mask').show();
                $('.choice_mask .choice_dialog').addClass("fadeInUp").removeClass("fadeInUpDown");
                //弹出界面中 选择优惠券
				$('.c_b_bd_item').click(function(){
					if ($(this).hasClass("choose-active")) {
						// 样式处理
						$(this).removeClass("choose-active");
						//  该店铺不使用优惠券
						$("select[store_id='"+ this_store_id +"']").val("0");
						//更新相应店铺优惠券横栏 信息
						$(".store_voucher[data-store-id='"+ this_store_id +"'] .choice_txt").html("未选择");
						$(".store_voucher[data-store-id='"+ this_store_id +"']").attr("data-store-voucher-value", "0");
						//本店合计重新计算
						$("#voucher"+this_store_id).text("0.00");
						$('#st'+ this_store_id).html(  $('#st'+ this_store_id).attr("data_store_total") );
						calcuFinalNeedPay();
					}else{
						// 样式处理
						$(this).addClass("choose-active");
						$(this).siblings().removeClass("choose-active");
						//数据处理 模拟选择option
						var data_store_voucher_value = $(this).attr("data-store-voucher-value");
						$("select[store_id='"+ this_store_id +"']").val(data_store_voucher_value);
						//更新相应店铺优惠券横栏 信息
						$(".store_voucher[data-store-id='"+ this_store_id +"'] .choice_txt").html($(this).text());
						$(".store_voucher[data-store-id='"+ this_store_id +"']").attr("data-store-voucher-value", data_store_voucher_value);
						//当前优惠券的价格
						var this_voucher_value = $(this).attr("data-store-voucher-value");
						if (this_voucher_value != 0) {
			        		var this_voucher_value_price = parseFloat(this_voucher_value.split('|')[2]);
			        	}else{
			        		var this_voucher_value_price = 0;
			        	}
			        	var  this_store_total_show = parseFloat($('#st'+ this_store_id).attr("data_store_total")) - this_voucher_value_price;
						//本店合计重新计算
						$("#voucher"+this_store_id).text(this_voucher_value_price.toFixed(2));
						$('#st'+ this_store_id).html(this_store_total_show.toFixed(2));
						calcuFinalNeedPay();
					}
				});
			});
			//关闭弹窗
			$('#choice_close').click(function(){
				$('.choice_mask').find(".choice_dialog").addClass("fadeInUpDown").removeClass("fadeInUp");
                 setTimeout(function(){
                     $('.choice_mask').hide();
                 },500);
			});
			//是否显示上传身份证
			if(data.is_idcard==1){
			    $("#uploadImgBox").removeClass('hide');
				if(isMoyunApp()){
					$("#uploadImgBox .add_comment_photo_add ").removeClass("hide");
					//app中上传图片操作...
                    $(".add_comment_photo_add").click(function(){
                        //上传图片js 在这调用 原生代码
                        MYAPP.uploadPhoto({"selector": 'add_comment_photo_add',"hiddenNavBar": 1, "uploadUrl":ApiUrl+"/index.php?act=member_buy&op=upload_idcard_app&key="+key});
                    });
                    if(data.address_info.idcard_photo != ''){
                        for(var i = 0;i < data.address_info.idcard_photo_url.length; i++){
                            var tmp = {};
                            tmp.host = data.address_info.idcard_photo_url[i].path;
                            tmp.url = data.address_info.idcard_photo_url[i].img_name;
                            tmp.selector = 'add_comment_photo_add';
                            afterPhotoUpload(tmp);
                        }
                    }
				}
				else {
					
					if(data.address_info.idcard_photo_url!==""){
						window.initUploadImg(data.address_info.idcard_photo_url,function(img,closeX){
		                	closeX();
//					        var key = getLocalStorage('key');
//					        $.ajax({
//					            type:'post',
//					            url:ApiUrl+"/index.php?act=member_buy&op=del_photo",
//					            data:{key:key,del_photo:$(img).data("src")},
//					            dataType:'json',
//					            success:function(result){
////					                if(result.datas.error){
////					                    $.sDialog({
////					                        skin:"red",
////					                        content:result.datas.error,
////					                        okBtn:false,
////					                        cancelBtn:false
////					                    });
////					                }else{
////					                	closeX();
////					                }
//					            }
//					        });
						});
					}
					else {
						window.initUploadImg();
					}
				}
			}
		},
		complete:ajaxLoadingComplete,
	});

    //自提点信息获取
    function init_pick_shipment(){
        if(pick_shipment_extend_id != 0 && pick_shipment_extend_id){
            $.ajax({//获取区域列表
                type:'post',
                url:ApiUrl+'/index.php?act=member_address&op=pick_shipment_info',
                data:{pick_shipment_extend_id:pick_shipment_extend_id,key:key},
                dataType:'json',
                success:function(result){
                    var data = result.datas;
                    if(data){
                        var html ='<div class="buys1-cnt"><ul class="buys-ycnt buys1-hide-detail">'+
                            '<li class="clearfix"><div class="value fleft">自提地址：'+data.pick_shipment_info.address+'</div><li>'+
                            '<li class="clearfix"><div class="value fleft">自提时间：'+data.pick_shipment_info.time+'</div></li>'+
                            '<li class="clearfix"><div class="value fleft">联系电话：'+data.pick_shipment_info.phone+'</div></li>'+
                            '</ul></div>';
//                  $('.buys1-address-cnt').after(html);
                        $("#psfs").append(html).find(".bar-box-panel").eq(1).show()
                    }
                }
            });
        }
        else {
            $("#psfs").find(".bar-box-panel").eq(0).show();
        }
    }

    //获取发票内容
	$.ajax({
		type:'post',
		url:ApiUrl+'/index.php?act=member_invoice&op=invoice_content_list',
		data:{key:key},
		dataType:'json',
		success:function(result){
			checklogin(result.login);
			var data = result.datas;
			var html = '';
			$.each(data.invoice_content_list,function(k,v){
				html+='<option value="'+v+'">'+v+'</option>';
			});
			$('#inc_content').append(html);
		}
	});
	//获取发票列表
	$.ajax({
		type:'post',
		url:ApiUrl+'/index.php?act=member_invoice&op=invoice_list',
		data:{key:key},
		dataType:'json',
		success:function(result){
			checklogin(result.login);
			var invoice = result.datas.invoice_list;
			if(invoice.length>0){
				var html = '';
				$.each(invoice,function(k,v){
					html+= '<li>'
								+'<label>'
									+'<input type="radio" name="invoice" class="rdo inv-radio" checked="checked" value="'+v.inv_id+'">'
									+'<span class="mr5 rdo-span" id="inv_'+v.inv_id+'">'+v.inv_title+'&nbsp;&nbsp;'+v.inv_content+'</span>'
								+'</label>'
								+'<a class="del-invoice" href="javascript:void(0);" inv_id="'+v.inv_id+'">[删除]</a>'
							+'</li>';
				});
				$('#invoice_add').before(html);
				$('.del-invoice').click(function(){
                    var $this = $(this);
					var inv_id = $(this).attr('inv_id');
					$.ajax({
						type:'post',
						url:ApiUrl+'/index.php?act=member_invoice&op=invoice_del',
						data:{key:key,inv_id:inv_id},
						success:function(result){
							if(result){
								$this.parent('li').remove();
							}
							return false;
						}
					});
				});
			}
		}
	});
	
    $(".head-invoice").click(function (){
        $(this).parent().find(".inv-tlt-sle").prop("checked",true);
    });
    $(".buys1-edit-invoice").click(function(){
        var self = this;
        var thisPrarent = $(this).parents(".buys1-invoice-cnt");
        hideDetail(thisPrarent);
    });
    //保存发票信息
    $(".save-invoice").click(function (){
        var self = this;
        //获取address_id
        var invRadio = $('.inv-radio');
        var inv_id;
        for(var i =0;i<invRadio.length;i++){
            if(invRadio[i].checked){
            	inv_id = invRadio[i].value;
            }
        }
        if(inv_id>0){//选择发票信息
        	var inv_info = $('#inv_'+inv_id).html();
        	$('#inv_content').html(inv_info);//发票信息
        	$("input[name=invoice_id]").val(inv_id);
        }else{//添加发票信息
            var invtRadio = $('input[name=inv_title_select]');
            var inv_title_select;
            for(var i =0;i<invtRadio.length;i++){
                if(invtRadio[i].checked){
                	inv_title_select = invtRadio[i].value;
                }
            }
            var inv_content = $('select[name=inv_content]').val();
            if(inv_title_select == 'company'){
            	var inv_title = $("input[name=inv_title]").val();
            	var data = {key:key,inv_title_select:inv_title_select,inv_title:inv_title,inv_content:inv_content};
            	var html = '公司  ';
            }else{
            	var data = {key:key,inv_title_select:inv_title_select,inv_content:inv_content};
            	var html = '个人  ';
            }
            $.ajax({
            	type:'post',
            	url:ApiUrl+'/index.php?act=member_invoice&op=invoice_add',
            	data:data,
            	dataType:'json',
            	success:function(result){
            		if(result.datas.inv_id>0){
    					var html1 = '<li>'
										+'<label>'
											+'<input type="radio" name="invoice" class="rdo inv-radio" checked="checked" value="'+result.datas.inv_id+'">'
											+'<span class="mr5 rdo-span" id="inv_'+result.datas.inv_id+'">'+html+'&nbsp;&nbsp;'+inv_content+'</span>'
										+'</label>'
										+'<a class="del-invoice" href="javascript:void(0);" inv_id="'+result.datas.inv_id+'">[删除]</a>'
									+'</li>';
    					$('#invoice_add').before(html1);
            			$('#inv_content').html(html+inv_content);//发票信息
            			$('input[name=invoice_id]').val(result.datas.inv_id);
        				$('.del-invoice').click(function(){
                            var $this = $(this);
        					var inv_id = $(this).attr('inv_id');
        					$.ajax({
        						type:'post',
        						url:ApiUrl+'/index.php?act=member_invoice&op=invoice_del',
        						data:{key:key,inv_id:inv_id},
        						success:function(result){
        							if(result){
        								$this.parent('li').remove();
        							}
        							return false;
        						}
        					});
        				});
            		}
            	}
            });
        }
        var thisPrarent = $(this).parents(".buys1-invoice-cnt");
        showDetial(thisPrarent);
    });
    $(".no-invoice").click(function (){
        $('#inv_content').html("不需要发票");
        $('input[name=invoice_id]').val('');
        var thisPrarent = $(this).parents(".buys1-invoice-cnt");
        showDetial(thisPrarent);
    });


    //点击[提交订单]按钮后触发
    $("#buy_wait").click(function(){
    	if(!$("#uploadImgBox").hasClass("hide")){
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
    		if(isMoyunApp()){
    			//...app提交操作
                var images = $("input[name=image]");
                $(images).each(function(m){
                    if($(images[m]).val()!=""){
                        var idcard_photo= $("input[name=idcard_photo]").val();
                        if(idcard_photo){
                            $("input[name=idcard_photo]").val(idcard_photo+','+$(images[m]).val());
                        }else{
                            $("input[name=idcard_photo]").val($(images[m]).val());
                        }
                    }
                });
                if(($("input[name=idcard_photo]").val().split(',')).length-1 != 1){
                    $.sDialog({
                        content:"您选择的商品需要提供身份证正反面照片(2张)以供清关",
                        okBtn:true,
                        cancelBtn:false
                    });
                    return false;
                }
            }
    		else {
		    	var checkEnd=[];
				var imgs=$(".add_comment_preview_bg2");
				if(imgs.length){
					checkEnd= Array.prototype.map.call(imgs,function(t){
						return $(t).find("img").data("src");
					});
				}
		    	if(checkEnd.length===2){
		        	$("input[name=idcard_photo]").val(checkEnd.join(","));
		    	}
		    	else {
		            $.sDialog({
		                content:"您选择的商品需要提供身份证正反面照片(2张)以供清关",
		                okBtn:true,
		                cancelBtn:false
		            });
		            return ;
		    	}
    		}
    	}
        //var predeposit = parseFloat($('input[name=available_predeposit]').val());
        var order_amount = parseFloat($('input[name=order_amount]').val());
        if(isNaN(order_amount) || order_amount == 0){return false;}
        //if(isNaN(predeposit)){predeposit = 0;}
        var predeposit = 0; //对接陌云支付,取消混合支付
    	window.showPayWin("payul",order_amount,predeposit,function(li,method){
            method.lock();
            var data_pay = $(li).attr('data-pay');
            if (data_pay == "offline") {
                $("input[name=pay_name]").val("offline");
            }else{
                $("input[name=pay_name]").val("online");
            }
            //微信中选择支付宝提示
            if(data_pay == 'alipay' && isWeiXinOrQQ() ){
                window.scrollTo(0,0);
                $('.transparent_bg').show();
                return false;
            }
			//拼团订单的特殊处理
			var fitgroup_id = GetQueryString('fitgroup_id');

            //订单生成返回数据
            var step2_data = submitOder(method);
            if(step2_data === false){method.unlock();return false;}
            if(!step2_data.pay_sn){
                $.sDialog({
                    skin:"red",
                    content:"订单提交失败",
                    okBtn:true,
                    cancelBtn:false
                });
                method.unlock();
                return false;
            }else if(step2_data.go_payment_list == 'no'){
                MYAPP.gopage('orderList', WapSiteUrl+'/tmpl/member/order_list.html',{title:'我的订单',showCart:0,headerAlpha:1});
            }else{
                if(data_pay == 'friend'){
                    $.ajax({
                        type:'get',
                        url:ApiUrl+"/index.php?act=member_order&op=get_friend_info",
                        data:{key:key, pay_sn:step2_data.pay_sn},
                        dataType:'json',
                        success:function(result){
                            var friend_info =  result.datas;
                            if(friend_info.error){
                                method.hide();
                                $.sDialog({
                                    skin:"block",
                                    content:friend_info.error,
                                    okBtn:true,
                                    cancelBtn: false,
                                    okFn:function(){
                                        MYAPP.gopage('orderList', WapSiteUrl+'/tmpl/member/order_list.html?order_state=10',{title:'我的订单',showCart:0,headerAlpha:1});
                                    }
                                });
                                return false;
                            }else{
                                var smsBody = '我在陌云商城买了'+friend_info.goods_sum+'件商品，需付款¥'+friend_info.pay_amount+'，是不是真感情，就看你戳不戳下面这个付款链接了，快来帮我付款吧～'+friend_info.pay_url
                                MYAPP.SMS({'smsBody':smsBody,'jsCallback':"afterSMS"});
                                method.unlock();
                                method.hide();
                            }
                        }
                    });
                }else if(data_pay == 'predeposit'){
                    method.hide();
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
                                        data:{key:key,pay_sn:step2_data.pay_sn,payment_code:data_pay,inApp:MYAPP.inapp(),password:pwd,fitgroup_id:fitgroup_id},
                                        dataType:'json',
                                        success:function(result){
                                            if(!result.datas.error){
                                                MYPAY.init(result.datas);
                                                method.hide();
                                            }else{
                                                method.unlock();//开锁
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
//                    $('#buy_form').attr('action',ApiUrl+'/index.php?act=payment_moyun');
//                    $('#form_key').val(key);
//                    $('#form_pay_sn').val(step2_data.pay_sn);
//                    $('#form_payment_code').val(data_pay);
//                    $('#buy_form').submit();
                    $.ajax({
                        type:'get',
                        url:ApiUrl+'/index.php?act=payment_moyun',
                        data:{key:key,pay_sn:step2_data.pay_sn,payment_code:data_pay,inApp:MYAPP.inapp(),fitgroup_id:fitgroup_id},
                        dataType:'json',
                        success:function(result){
                            if(!result.datas.error){
                                MYPAY.init(result.datas);
                                method.hide();
                            }else{
                                method.unlock();//开锁
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
    	},function(value,method,error){
            method.lock();//锁定
            $.ajax({
                type:'post',
                url:ApiUrl+'/index.php?act=member_buy&op=check_password',
                data:{key:key,password:value},
                dataType:'json',
                success:function(result){
                    method.unlock();//开锁
                    if(result.datas == 1){
                        $('input[name=passwd_verify]').val('1');
                        $('input[name=use_predeposit]').val('1');
                        $('input[name=pwd]').val(value);
                        if(predeposit >= order_amount){
                            //订单生成返回数据
                            var step2_data = submitOder();
                            if(step2_data === false){return false;}
                            if(!step2_data.pay_sn){
                                method.hide();
                                $.sDialog({
                                    skin:"red",
                                    content:"订单提交失败",
                                    okBtn:true,
                                    cancelBtn:false
                                });
                                return false;
                            }else{
                                MYAPP.gopage('orderList', WapSiteUrl+'/tmpl/member/order_list.html?order_state=20',{title:'我的订单',showCart:0,headerAlpha:1});
                            }
                        }
                    }else{
                        method.unlock();//开锁
                        error("密码错误，请重新输入");
                    }
                }
            });
            setTimeout(function(){
                method.unlock();
            },3000);
    	});
    });

    //点击稍后付款-执行之前提交的事件
    $('#buy_step2').click(function(){
    	//验证是否上传足够的身份证以供清关
    	if(!$("#uploadImgBox").hasClass("hide")){
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
    		if(isMoyunApp()){
    			//...app提交操作
                var images = $("input[name=image]");
                $(images).each(function(m){
                    if($(images[m]).val()!=""){
                        var idcard_photo= $("input[name=idcard_photo]").val();
                        if(idcard_photo){
                            $("input[name=idcard_photo]").val(idcard_photo+','+$(images[m]).val());
                        }else{
                            $("input[name=idcard_photo]").val($(images[m]).val());
                        }
                    }
                });
                if(($("input[name=idcard_photo]").val().split(',')).length-1 != 1){
                    $.sDialog({
                        content:"您选择的商品需要提供身份证正反面照片(2张)以供清关",
                        okBtn:true,
                        cancelBtn:false
                    });
                    return false;
                }
    		}
    		else {
		    	var checkEnd= Array();
				var imgs=$(".add_comment_preview_bg2");
				if(imgs.length){
					checkEnd= Array.prototype.map.call(imgs,function(t){
						return $(t).find("img").data("src");
					});
				}
		    	if(checkEnd.length===2){
		        	$("input[name=idcard_photo]").val(checkEnd.join(","));
		    	}
		    	else {
		            $.sDialog({
		                content:"您选择的商品需要提供身份证正反面照片(2张)以供清关",
		                okBtn:true,
		                cancelBtn:false
		            });
		            return false;
		    	}
    		}
    	}
        var order_amount = parseFloat($('input[name=order_amount]').val());
        if(isNaN(order_amount) || order_amount == 0){return false;}
        //订单生成返回数据
        var step2_data = submitOder();
        if(step2_data === false){return false;}
        if(!step2_data.pay_sn){
            $.sDialog({
                skin:"red",
                content:"订单提交失败",
                okBtn:true,
                cancelBtn:false
            });
            return false;
        }else{
            MYAPP.gopage('orderList', WapSiteUrl+'/tmpl/member/order_list.html?order_state=10',{title:'我的订单',showCart:0,headerAlpha:1});
        }
    });

    function submitOder(fn){
        // 防止重复提交订单
        if ($('input[name=post_times]').val() != "0") {
            fn && fn.hide();
            $.sDialog({
                skin:"red",
                content:"本订单已提交，请到“个人中心-全部订单”中查看。",
                okBtn:true,
                cancelBtn:false,
                okFn:function(){
                    MYAPP.gopage('orderList', WapSiteUrl+'/tmpl/member/order_list.html?order_state=',{title:'我的订单',showCart:0,headerAlpha:1});
                }
            });
            return false;
        };
        // 团购，秒杀等限购商品购买数量检查  后面的结果依赖与此 所以采用同步请求
        var promotions_limit = false;
        if (parseInt(promotions_id) && !isNaN(promotions_id)) {
            $.ajax({
                type:'post',
                async:false,
                url:ApiUrl+'/index.php?act=member_bought&op=promotions_num',
                data:{key:key, goods_id:goods_id, promotions_id:promotions_id},
                dataType:'json',
                success:function(result){
                    var bought_promotions_num = parseInt(result.datas);
                    var buynum = parseInt(GetQueryString("buynum"));
                    var upper_limit = parseInt(GetQueryString("upper_limit"));
                    if (buynum + bought_promotions_num > upper_limit) {
                        promotions_limit = true;
                        fn && fn.hide();
                        $.sDialog({
                            skin:"red",
                            content:"该产品限购"+ upper_limit +"件 你已购买" + bought_promotions_num + "件",
                            okBtn:true,
                            cancelBtn:false
                        });
                    }
                }
            });
        }
        if(promotions_limit) { return false; }
        // 如果使用预存款 密码验证
//        if ($('input[name=use_predeposit]').val() == '1') {
//            $('#pwd-tip').html('您使用了钱包余额，请输入密码，进入安全验证。');
//            //弹出密码输入窗口
//            var bodyH=$("body").height(), scrollTop=$(window).scrollTop(), passDialog=$(".pass_dialog"), passMask=$(".pass_mask"), passClose=$("#p_d_hd_close"), winH=$(window).height();
//            passDialog.css({top:scrollTop+winH/2-110});
//            passMask.css({height:bodyH}).show().addClass("fadeIn").removeClass("fadeOut");
//            passClose.on("click",function(){
//                passMask.removeClass("fadeIn").addClass("fadeOut");
//                setTimeout(function(){
//                    passMask.hide();
//                },500);
//            })
//            // 验证密码
//            var loading_pduse=false;
//            $('#pwd_confirm').click(function(){//验证密码
//                var pwd = $("input[name=pwd]").val();
//                if(pwd == ''){
//                    $('#pwd-tip').html('<span class="clr-c07">登录密码不能为空，请重新输入。</span>');
//                    return false;
//                }
//                //防止重复提交
//                if(loading_pduse) return false;
//                loading_pduse=true;
//                $.ajax({
//                    type:'post',
//                    url:ApiUrl+'/index.php?act=member_buy&op=check_password',
//                    data:{key:key,password:pwd},
//                    dataType:'json',
//                    success:function(result){
//                        if(result.datas == 1){
//                            $('input[name=passwd_verify]').val('1');
//                            var available_predeposit = parseFloat($('input[name=available_predeposit]').val());
//                            confirmOder();
//                        }else{
//                            $('#pwd-tip').html('<span class="clr-c07">密码错误，请重新输入。</span>');
//                        }
//                        setTimeout(function(){loading_pduse=false;}, 5000);
//                    }
//                });
//            });
//        }
//        //如果使用预存款 但是密码验证失败
//        if($('input[name=use_predeposit]').val() == '1' && $('input[name=passwd_verify]').val() == '0'){
//            return false;
//        }

        //正式向后台提交订单
        return confirmOder();
    }

    function confirmOder(){
    	var buy_loading=false;
        var result_data = {};
    	//搜集数据--------------------begin--------------------------
    	var data = {};
    	data.key = key;
    	if(ifcart == 1){data.ifcart = ifcart; }
    	data.cart_id = cart_id;
    	data.address_id = $('input[name=address_id]').val();
    	data.vat_hash = $('input[name=vat_hash]').val();
    	data.offpay_hash = $('input[name=offpay_hash]').val();
        //在线支付与货到付款 兼容写法
        if ($("input[name=pay_name]").val() == "offline") {
			data.pay_name = "offline";
		}else{
			data.pay_name = "online";
		}
        data.invoice_id = $('input[name=invoice_id]').val();
        //优惠券使用情况
        var voucher = {};
        $(".store_voucher").each(function(){
        	var store_id = $(this).attr("data-store-id");
        	voucher[store_id] = $(this).attr("data-store-voucher-value");
        });
        data.voucher = voucher;
        //给商家留言
        var pay_message = {};
        $(".pay_message").each(function(){
        	var store_id = $(this).attr('data-store-id');
        	pay_message[store_id] = $(this).val();
        });
        data.pay_message = pay_message;
        //预存款使用情况
        var available_predeposit = parseFloat($('input[name=available_predeposit]').val());
        if(available_predeposit>0){
            if($('input[name=use_predeposit]').val() == '1' && $('input[name=passwd_verify]').val() == '1'){
            	data.pd_pay = 1;
            	data.password = $('input[name=pwd]').val();
            }else{
            	data.pd_pay = 0;
            }
        }else{
        	data.pd_pay = 0;
        }
        data.pick_shipment_extend_id = pick_shipment_extend_id;
        data.child_goods_id = child_goods_id;
        data.agency = agency;
        //获取已上传图片
        data.idcard_photo= $("input[name=idcard_photo]").val();
        data.idcard_number= $("input[name=idcard_number]").val();
		//获取拼团数据
		var fitgroup_id = GetQueryString("fitgroup_id");
		data.fitgroup_id = fitgroup_id;
		//(拼团使用)此商品的零售价格，用于计算拼团利润的差价
		var child_price = $("input[name=child_price]").val();;
		data.child_price = child_price;

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
        //搜集数据--------------------end--------------------------
        
        //下单购买 正式处理流程 处理堆栈导致的不能再次点击
        if(buy_loading) return false;
        buy_loading=true;
        setTimeout(function(){buy_loading=false;}, 5000);

		$.ajax({
        	type:'post',
            async:false,
        	url:ApiUrl+'/index.php?act=member_buy&op=buy_step2',
        	data:data,
        	dataType:'json',
        	beforeSend:ajaxLoading,
        	success:function(result){
        		checklogin(result.login);
        		if(result.datas.error){
        			$.sDialog({
                      skin:"red",
                      content:result.datas.error,
                      okBtn:false,
                      cancelBtn:false
                    });
                    result_data = false;
        		}else{
        			var go_payment_list =result.datas.pay_sn.go_payment_list;
	        		if(typeof(result.datas.pay_sn.pay_sn) == 'undefined'){
	        			$.sDialog({
	                      skin:"red",
	                      content:"请不要重复提交订单！",
	                      okBtn:true,
	                      cancelBtn:false
	                    });
                        result_data = false;
	        		}else{
	        			$('input[name=post_times]').val("1");
	        			delLocalStorage("address_id"); //提交订单成功后删除cookie
	        			delLocalStorage("buy_step1_url"); //提交订单成功后删除cookie
	        			delLocalStorage("payment_choice"); //提交订单成功后删除cookie
	        			setTimeout(function(){$('input[name=post_times]').val("0");}, 30000);

                        result_data =  result.datas.pay_sn;
//	        			var pay_sn =result.datas.pay_sn.pay_sn;
//                        if (quick == '1') {MYAPP.gopage('paymentList', WapSiteUrl+'/tmpl/quick_buy_payment_list.html?pay_sn=' + pay_sn,{title:'快捷下单',showCart:0,headerAlpha:1});return false;}
//						if (go_payment_list == "yes") {MYAPP.gopage('paymentList', WapSiteUrl+'/tmpl/member/payment_list.html?key=' + key + '&pay_sn=' + pay_sn,{title:'结算中心',showCart:0,headerAlpha:1});};
//						if (go_payment_list == "no") {MYAPP.gopage('orderList', WapSiteUrl+'/tmpl/member/order_list.html',{title:'我的订单',showCart:0,headerAlpha:1});};
	        		}
        		}
        	},
            complete:ajaxLoadingComplete
        });
        return result_data;

    }

    function showDetial(parent){
        $(parent).find(".buys1-edit-btn").show();
        $(parent).find(".buys1-hide-list").addClass("hide");
        $(parent).find(".buys1-hide-detail").removeClass("hide");
    }
    function hideDetail(parent){
        $(parent).find(".buys1-edit-btn").hide();
        $(parent).find(".buys1-hide-list").removeClass("hide");
        $(parent).find(".buys1-hide-detail").addClass("hide");
    }

    function calcuFinalNeedPay(){
    	var init_needpay = $('input[name=init_needpay]').val();
    	var final_need_pay = init_needpay;
    	//优惠券计算
    	var voucher_total = 0;
    	$(".store_voucher").each(function(){
    		var store_id = $(this).attr("data-store-id");
        	var store_voucher_value = $(this).attr("data-store-voucher-value");
        	if (store_voucher_value != 0) {
        		var store_voucher_value_price = parseFloat(store_voucher_value.split('|')[2]);
        	}else{
        		var store_voucher_value_price = 0;
        	}
        	voucher_total += store_voucher_value_price;
        });
        final_need_pay = final_need_pay - voucher_total;
    	//钱包(预存款)计算
    	final_need_pay = final_need_pay - parseFloat($('input[name=predeposit_pay]').val());
    	if (final_need_pay < 0) {
    		final_need_pay = 0.00;
    	}
    	$('#final_needpay_show').html(final_need_pay.toFixed(2));
        $('input[name=order_amount]').val(final_need_pay.toFixed(2));

    }

	var payCheck='';
	$("#payGouxuanChoice").click(function(){
		var t=$(this);
		var type=t.hasClass("pay-gouxuan-checked");
		if(type){
			t.removeClass("pay-gouxuan-checked");
            calcuFinalNeedPay();
		}
		else {
			t.addClass("pay-gouxuan-checked");
            calcuFinalNeedPay();
		}
	});

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
                $("#payul").prepend(html);

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
							closeFn(t,function(){
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

//删除图片
function removePhoto(obj){
    //删除图片进行判断
    var length=$(obj).closest(".add_comment_photo").children().length;
    if(length<5) $(obj).closest(".add_comment_photo").children(".add_comment_photo_add").show();
    $(obj).parent().remove();

//    var del_photo = $(obj).next().val();
//    if(del_photo){
//        var key = getLocalStorage('key');
//        $.ajax({
//            type:'post',
//            url:ApiUrl+"/index.php?act=member_buy&op=del_photo",
//            data:{key:key,del_photo:del_photo},
//            dataType:'json',
//            success:function(result){
////                if(result.datas.error){
////                    $.sDialog({
////                        skin:"red",
////                        content:result.datas.error,
////                        okBtn:false,
////                        cancelBtn:false
////                    });
////                }else{
////
////                }
//            }
//        });
//    }

}
//设置预览图片
function afterPhotoUpload(data){
    if (typeof(data) == 'string') {
        data = JSON.parse(decodeURIComponent(data));
    }
    var html = $('<div class="add_comment_photo_list fleft"><img src="'+data.host + data.url+'"><label class="delete"></label><input type="hidden" name="image" value="'+data.url+'" /></div>');
    html.insertBefore($("."+data.selector));
    html.find(".delete").on("click",function(){removePhoto(this)});
    if($("."+data.selector).parent().children().length>2) $("."+data.selector).hide();
}