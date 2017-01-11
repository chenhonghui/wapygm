MYAPP.ready(function (){

    // $(window).scroll(scrollTopIcon);
    //$('#gotop').click(function () {scroll('0px', 50);});

    //该页面需要登录才能添加评论
    var key= getLocalStorage('key');
    if(key==''){
      gotoLoginPage();
      return false;
    }

    var order_id = GetQueryString("order_id");

    //根据order_id判断该单是否完成收货，符合添加评论的条件。并且拉取该订单的产品信息。

    //渲染页面
    $.ajax({
       url:ApiUrl+"/index.php?act=comment&op=add",
       type:"post",
       data:{order_id:order_id,key:key},
       dataType:"json",
       success:function(result){
           checklogin(result.login);
           var data = result.datas;
           if(typeof(data.order_goods) == 'undefined'){
               data.order_goods = new Array();
           }
           data.hasmore = result.hasmore;
           data.WapSiteUrl = WapSiteUrl;
           var html = template.render('product_comment', data);
           $("#product_detail_wp").html(html);

           //评分
           $(".icon-grade").on("click",score);
           //发表评论
           $(".btn-one").on("click",add_comment);
           //输入限制
           $(".add_comment_text_val").on("keyup",maxlength);

           if (isMoyunApp()) {
               $('.add_comment_photo').show();
           }
           //上传
           if(MYAPP.inapp()){
               $(".add_comment_photo_add").removeClass('hide');
               $(".add_comment_photo_add").on("click",upload_photo);
           }else{
               $(".uploadImg").removeClass('hide');
               initUploadImg();
           }
       }

    });


    //添加事件
    /*$(".delete").on("click",function(){
        //这是删除图片，可在这里先弹出确认框
        removePhoto(this);
        //操作dom结束，该进行值的保存
    });*/

    //输入限制
    function maxlength(){
        if($(this).val().length>=150){
            $.sDialog({
                skin:"block",
                content:"请输入小于150个字!",
                cancelBtn: false
            });
        }
    }

    //上传图片
    function upload_photo(){
        var goods_id = $(this).attr('id');
        //上传图片js 在这调用 原生代码
        MYAPP.uploadPhoto({"selector": goods_id,"hiddenNavBar": 1, "uploadUrl":ApiUrl+"/index.php?act=comment&op=upload&key="+key});

    };



    //商品打分
    function score(){
        var _this=$(this);
        var meIndex=_this.index()-1;
//      var isGood=false;
        var parent=_this.parent();
        var siblings=parent.children(".icon-grade");
//      var grade;
        var num,type;
        //3种情况
       	if(meIndex===0){
       		siblings.each(function(i){
       			if(!i){
       				$(this).addClass("icon-shixing").removeClass("icon-kongxing");
       			}
       			else {
         			$(this).removeClass("icon-shixing").addClass("icon-kongxing");
       			}
       		})
        }
        else{
        	_this.hasClass("icon-shixing")?type=1:type=0;
       		siblings.each(function(i){
       			if(i<meIndex){
       				$(this).addClass("icon-shixing").removeClass("icon-kongxing");
       			}
       			else if(i===meIndex){
       				if(type===0||type===1&&siblings.eq(i+1).hasClass("icon-shixing")){
       					$(this).addClass("icon-shixing").removeClass("icon-kongxing");
       				}
       				else {
         			$(this).removeClass("icon-shixing").addClass("icon-kongxing");
       				}
       			}
       			else {
         			$(this).removeClass("icon-shixing").addClass("icon-kongxing");
       			}
       		})
        }
        num=parent.find(".icon-shixing").length;
        parent.attr("val",num).find('input').val(num);
        return  false;
        //判断是否是最低
//      if(meIndex==0) return false;
//
//      if(_this.hasClass("icon-shixing")){
//          grade="icon-kongxing";
//      }else{
//          grade="icon-shixing";
//      };
//      if(_this.next().hasClass("icon-shixing")) isGood=true;
//      $(parent).find(".icon-grade").each(function(index){
//          if(grade=="icon-shixing"){
//              if(index<=meIndex){
//                  _this.removeClass("icon-shixing");
//                  _this.removeClass("icon-kongxing");
//                  _this.addClass(grade);
//                  $(parent).attr("val",index+1);
//              }
//          }else{
//              if(index>=meIndex){
//                  _this.removeClass("icon-shixing");
//                  _this.removeClass("icon-kongxing");
//                  _this.addClass(grade);
//                  $(parent).attr("val",meIndex);
//              }
//          }
//          if(isGood){_this.removeClass("icon-kongxing");_this.addClass("icon-shixing");}
//      });
//      var len = parent.find('.icon-shixing').length;
//      $(parent).find('input').val(len);
    };


    //提交
    var add_laoding = false;
    function add_comment(){
        if(add_laoding) return false;
        add_laoding = true;

        var goods_comments = $(".goods_comment");
        var goods = new Object();

        $(goods_comments).each(function(i){
            var comment_row = new Object();
            var goods_id = $(goods_comments[i]).attr('goods_id');
            var score = $(goods_comments[i]).find("input[name=score-product]").val();
            var comment = $(goods_comments[i]).find(".add_comment_text_val").val();

            if (comment == '___输入5-150个字之间的评价。例如：该商品的使用感受，或遇到的问题等') {
                var comment = '';
            }


            if(MYAPP.inapp()){
                var images = $(goods_comments[i]).find("input[name=image]");
                var img = new Array();
                $(images).each(function(m){
                    if($(images[m]).val()!=""){
                      img.push($(images[m]).val());
                    }
                });
            }else{
                var images = $(goods_comments[i]).find(".add_comment_preview_bg");
                var img=[];
                images.each(function(m){
                    var t=$(this);
                    if(t.hasClass("add_comment_preview_bg2")){
                        img.push(t.find("img").attr("data-src"));
                    }
                })
            }

            

            comment_row["score"] = score;
            comment_row["comment"] = comment;
            comment_row["image"] = img;

            goods[goods_id] = comment_row;
        });

        var store_desccredit = $("#score-store-describe").val();
        var store_servicecredit = $("#score-store-service").val();
        var store_deliverycredit = $("#score-store-delivery").val();
        var endData={
                key:key,
                order_id:order_id,
                goods:goods,
                store_desccredit:store_desccredit,
                store_servicecredit:store_servicecredit,
                store_deliverycredit:store_deliverycredit
           };

        $.ajax({
            url:ApiUrl+"/index.php?act=comment&op=add",
            type:"post",
            data:endData,
            dataType:"json",
            success:function(result){
                if(result.datas && result.datas == 1){
                    add_laoding = false;
                    $.sDialog({
                        skin:"block",
                        content:"评论完成！",
                        cancelBtn: false,
                        okFn:function (){
                            MYAPP.goBack({'jsCallback':"backRefresh"});
                        }
                    });
                }
            }
        });
        
    }


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
function afterPhotoUpload(data){
    if (typeof(data) == 'string') {
        data = JSON.parse(decodeURIComponent(data));

    }
    var html = $('<div class="add_comment_photo_list fleft"><img src="'+data.host + data.url+'"><label class="delete"></label><input type="hidden" name="image" value="'+data.url.replace(/_240\./, '\.')+'" /></div>');
    html.insertBefore($("#"+data.selector));
    html.find(".delete").on("click",function(){removePhoto(this)});
    if($("#"+data.selector).parent().children().length>3) $("#"+data.selector).hide();
}
