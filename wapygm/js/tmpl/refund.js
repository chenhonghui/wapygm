MYAPP.ready(function(){
		var key = getLocalStorage('key');
		if(key==''){
			gotoLoginPage();
			return false;
		}

		var order_id = GetQueryString("order_id");
		var goods_id = GetQueryString("goods_id");

		//初始化列表
		function initPage(){
			$.ajax({
				type:'post',
				url:ApiUrl+"/index.php?act=refund&op=refund_apply",	
				data:{key:key, order_id:order_id, goods_id:goods_id},
				dataType:'json',
				success:function(result){
					checklogin(result.login);
					if(result.datas.address_list==null){
						return false;
					}
					var data = result.datas;
					var html = template.render('saddress_list', data);
					
					$("#address_list").html(html);

					//点击提交退款的post数据
					$('#refund_confirm_button').click(postAddRefund);

					// 退款金额验证
					$("#refund_amount").focus(function(){
						$('#refund_amount_hint').html("");
					});
					$('#refund_amount').blur(function(){
						var ketui_amount = $("#ketui_amount").attr('value');

						var refund_amount = $('input[name=refund_amount]').val();

						//金额正则验证
						var reg = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;
						var reg_result = reg.test(refund_amount);
						if(!reg_result){
							$('#refund_amount_hint').html("请输入正确的退款金额");
						}
						
						if (parseFloat(refund_amount) > parseFloat(ketui_amount)) {
							$('#refund_amount_hint').html("退款金额不能超过可退金额");
						}
					});

                    //退货类型选择
                    $(".select-mode").click(function(){
                        $(this).parent().children('label').removeClass("selected");
                        $(this).addClass("selected");
                        $("#refund_type").val($(this).attr('value'));
                    });

					// 退货数量验证
					$("#goods_num").focus(function(){
						$('#goods_num_hint').html("");
					});
					$('#goods_num').blur(function(){
						var buy_goods_num = $("#buy_goods_num").val();
						
						if ($('input[name=goods_num]').val() > buy_goods_num) {
							$('#goods_num_hint').html("退货数量不能大于购买数量");
						}

						if ($('input[name=goods_num]').val() < 0) {
							$('#goods_num_hint').html("请输入合适的退货数量");
						}
					});
                    $('.refund_add').click(function(){
                        var buy_goods_num = $("#buy_goods_num").val();
                        var goods_num = Number($('input[name=goods_num]').val());
                        goods_num = goods_num + 1;
                        if (goods_num > buy_goods_num) {
                            $('#goods_num_hint').html("退货数量不能大于购买数量");
                            return false;
                        }
                        $('input[name=goods_num]').val(goods_num)
                        if (goods_num < 0) {
                            $('#goods_num_hint').html("请输入合适的退货数量");
                        }
                    });
                    $('.refund_reduce').click(function(){
                        var goods_num = Number($('input[name=goods_num]').val());
                        goods_num = goods_num - 1;
                        if (goods_num <= 0) {
                            $('#goods_num_hint').html("请输入合适的退货数量");
                            return false;
                        }
                        $('input[name=goods_num]').val(goods_num)
                    });

					// 退款原因验证
					$("#buyer_message").focus(function(){
						$('#buyer_message_hint').html("");
					});
					$('#buyer_message').blur(function(){
						var buy_goods_num = $("#buy_goods_num").html();
						
						if ($('textarea[name=buyer_message]').val().length ==0 ) {
							$('#buyer_message_hint').html("请输入退款原因");
						}
					});

                    //申请退款选择换货时，隐藏退款金额
                    $(".select-mode").on("click",function(){
                    	var select_type=$(this).attr('value');
                    	if(select_type==2){
                    		$(".select-type").css("display","none");
                    	}else{
                    		$(".select-type").css("display","block");
                    	}
                    	
                    	
                    });
                    if(MYAPP.inapp()){
                        //退货上传照片
                        $(".add_comment_photo_add").on("click",upload_image);
                        $(".add_comment_photo_add").removeClass('hide');
                    }else{
                        //初始化上传部分
                        $(".uploadImg").removeClass('hide');
                        initUploadImg();
                    }

				}
			});

		}
		initPage();

		//点击删除地址

		// 表单的提交
		function postAddRefund(){
			var refund_type = $('input[name=refund_type]').val();
			var refund_amount = parseFloat($('input[name=refund_amount]').val());
			var goods_num = $('input[name=goods_num]').val();
			var buyer_message = $('textarea[name=buyer_message]').val();
			var ketui_amount = parseFloat($("#ketui_amount").attr('value'));
            var buy_goods_num = $("#buy_goods_num").val();

            if(MYAPP.inapp()){
                var images = $("input[name=image]");
                var refund_image = new Array();
                $(images).each(function(m){
                    if($(images[m]).val()!=""){
                        refund_image.push($(images[m]).val());
                    }
                });
            }else{
                //包括上面的images变量，这块由app提交替换为ajaxformdata提交
                var images=$(".add_comment_preview_bg");
                var refund_image = [];
                images.each(function(index){
                    var t=$(this);
                    if(t.hasClass("add_comment_preview_bg2")){
                        refund_image.push(t.find("img").attr("data-src"));
                    }
                });
            }


            
            var bool_refund_amount = false;
			if (refund_type !=1 && refund_type !=2) {
				$('#refund_type_notice').html("请选择申请类型");
			}else{
                bool_refund_amount = true;
            }

			if ((refund_amount == '') || isNaN(refund_amount) || (refund_amount > ketui_amount) || (refund_amount <= 0)) {
				$('#refund_amount_hint').html("请输入正确的退款金额");
			}else{
				bool_refund_amount = true;
			}

			if (goods_num == '' || isNaN(goods_num) || ($('input[name=goods_num]').val() > buy_goods_num) || ($('input[name=goods_num]').val() < 0) ) {
				$('#goods_num_hint').html("请输入正确的退款数量");
			}else{
				bool_goods_num = true;
			}

			if (buyer_message == '') {
				$('#buyer_message_hint').html("请输入原因");
			}

			// 判断条件是否提交数据
			var bool_refund_type = (refund_type==1 || refund_type==2);
			if (bool_refund_type && bool_refund_amount && bool_goods_num && buyer_message!='') {
				$('#refund_confirm_button').hide();
				$.ajax({
					type:'post',
					url:ApiUrl+"/index.php?act=refund&op=add_refund&order_id="+order_id+"&goods_id="+goods_id,
					
					data:{
						key:key,
						refund_type:refund_type,
						refund_amount:refund_amount,
						goods_num:goods_num,
						buyer_message:buyer_message,
                        refund_image:refund_image

					},
				
					dataType:'json',
					success:function(result){
						MYAPP.gopage('refundNotice', WapSiteUrl+'/tmpl/member/refund_notice.html',{title:'退货提示',showCart:0,headerAlpha:1});
					}
				});

			}
		}

    //上传图片
    function upload_image(){
        //上传图片js 在这调用 原生代码
        MYAPP.uploadPhoto({"selector": 'add_comment_photo_add',"hiddenNavBar": 1, "uploadUrl":ApiUrl+"/index.php?act=comment&op=upload&key="+key});
    };

	
//处理上传

(function(w){
    var max=3;//最多三张图片
    var longer=2;//上传文件大小限制为2M
    var timeout=30000;//上传时间最大30秒，超出则判定为超时
    var  uploadImg,rdk;
    var coverMack=0;
	//初始化上传
	function initUploadImg(){
		uploadImg=$(".uploadImg");
		//代理关闭操作
		uploadImg.on("click",function(e){
			var t=$(this);
			var eve=$(e.target);
			var p=eve.parents(".add_comment_preview");
			var sbl=p.siblings(".add_comment_preview");//这个是指已经有图片的input数量
			//关闭
			if(eve.hasClass("add_comment_preview_close")){
				if($(this).find(".add_comment_preview_bg1").length===0){//3个已选中
    						p.remove();
    						addUploadImgView(t);
				}
				else if(p.find(".add_comment_preview_bg2").length){//当前为非空
					if(sbl.length!==0){//不止一个
						p.remove();
					}
					else {//仅剩自己
    					p.find(".add_comment_preview_bg").removeClass("add_comment_preview_bg2").addClass("add_comment_preview_bg1");
    					p.find("input").val("");
					}
				}
			}
		});
		//添加第一个view
		addUploadImgView();
		//设置reader
		if(FileReader!==undefined){
			rdk=true;
		}
	}
	//获取所有上传图片信息
	function getUploadImg(){
		var fs=uploadImg.find("input[type=file]");
		var sendForm;
		if(!FormData){
				$.sDialog({
					content:"上传失败，当前设备不支持上传图片",
					cancelBtn:false
				});
				return null
		}
		sendForm=new FormData();
		for(var i=0;i<fs.length;i++){
			if(fs.eq(i).val()!=""){
			sendForm.append("img["+i+"]",fs[i].files[0])
			}
		}
		return sendForm;
	}
	//添加新的上传接口（没有参数表示所有的.uploadImg都新建一个，否则在参数中的节点内新建）
	function addUploadImgView(u){
		var tUploadImg=(u!==undefined)?u:uploadImg;
		var html='<div class="add_comment_preview"><div class="add_comment_preview_bg add_comment_preview_bg1">'+
		'<i class="iconfont icon-jia"></i><img src="" alt="" /></div>'+
		'<div class="add_comment_preview_close iconfont icon-jian"></div><input type="file" name="img[]" /></div>';
		tUploadImg.append(html);
		var newView=tUploadImg.find(".add_comment_preview");
		//除了input，其他事件都使用代理
		newView.find("input").on("change",function(){
			var t=$(this);//- -
			var bg=t.siblings(".add_comment_preview_bg");//背景样式
			var img=bg.find("img");//预览图片
			var ff=this.files[0];//inputfile对象
			var parent=t.parents(".uploadImg").eq(0);//父节点,用于新建上传位置时addUploadImgView的参数
			if(t.val()===""){
				return true
			}
			//验证上传必须图片 
			if(ff.type.search(/(jpg)|(jpeg)|(png)/)===-1){
				$.sDialog({
					content:"添加失败！上传图片仅限 JPG,JPEG,PNG格式。",
					cancelBtn:false
				});
				return false
			}
			//验证上传文件大小必须小于2M
			if(ff.size>longer*Math.pow(1024,2)){
				$.sDialog({
					content:"添加失败！上传图片大小必须小于"+longer+"MB。",
					cancelBtn:false
				});
				return false
			}
			if(bg.hasClass("add_comment_preview_bg1")){
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
			var fd=new FormData();
			fd.append("filedata",t[0].files[0]);
			
			//上传此图片，并返回图片地址
			var nowMack=coverMack++;
			$("body").append("<div class='cover cover"+nowMack+"'></div>");
			//上传成功回调
			var successFn=function(res){
				var imgPath=res.datas.path;
				var imgSrc=res.datas.thumb_name;
				var imgName=res.datas.img_name;
				img.attr({"src":imgPath+imgSrc,"data-src":imgName});
				//新增上传 最多三张 
				var len=parent.find(".add_comment_preview").length;
				var n=parent.find(".add_comment_preview_bg1").length;
				if(len<max&&!n){
					addUploadImgView(parent);
				}
				successFn=nowMack=null;
			}
			//上传失败回调
			var defeatFn=function(msg){
				$.sDialog({
					content:""+msg,
					cancelBtn:false
				});
				t.val("");
				bg.removeClass("add_comment_preview_bg2").addClass("add_comment_preview_bg1");
				defeatFn=nowMack=null;
			}
			//超时执行失败
			setTimeout(function(){
				var lastCover=$(".cover"+nowMack);
				if(lastCover.length){
					lastCover.remove();
					defeatFn("网络超时，请重试");
				}
			},timeout);
			$.ajax({
				url:ApiUrl+"/index.php?act=comment&op=upload_wap&key="+key,
				type:"post",
				data:fd,
				contentType:false,
				processData:false,
        	    dataType:"json",
				success:function(res){
						//如果此元素已经在异步时段被删除或者已经超时，则直接终止
						var lastCover=$(".cover"+nowMack);
						if(!t.parents(".uploadImg").length||!lastCover.length){
							return 
						}
						lastCover.remove();
						//提交失败
						if(res.datas.error){
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
	w.initUploadImg=initUploadImg;
	//抛出获取上传图片的formdata对象
	w.getUploadImg=getUploadImg;
	//抛出清空所有上传图片的方法
	w.clearUploadImg=function(){
		uploadImg.html("");
		addUploadImgView();
	}
})(window);
});

//删除图片
function removePhoto(obj){
    //删除图片进行判断
    var length=$(obj).closest(".add_comment_photo").children().length;
    if(length<5) $(obj).closest(".add_comment_photo").children(".add_comment_photo_add").show();
    $(obj).parent().remove();
}

//设置预览图片
function afterPhotoUpload(data) {
    if (typeof(data) == 'string') {
        data = JSON.parse(decodeURIComponent(data));
    }
    var html = $('<div class="add_comment_photo_list fleft"><img src="'+data.host + data.url+'"><label class="delete"></label><input type="hidden" name="image" value="'+data.url.replace(/_240\./, '\.')+'" /></div>');
    html.insertBefore($("."+data.selector));
    html.find(".delete").on("click",function(){removePhoto(this)});
    if($("."+data.selector).parent().children().length>3) $("."+data.selector).hide();
}

