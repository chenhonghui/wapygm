MYAPP.ready(function(){

    //选择国家区号(默认选择带有.place-act样式名的国家)
    var placeName=$("#placeName");
    var placeNumber=$("#placeNumber");
    var placeList=$("#placeModal");
    var placeComments=$("#placeComments");
    var cookiePlaceNumber=null;
    placeName.on("click",function(){
    	placeList.show();
    });
    placeList.on("click",function(e){
    	var eve=$(e.target);
    	if(eve.hasClass("place-modal")){
    		placeList.hide();
    		return false
    	}
    	else if(eve[0].tagName==="LI"){
    		eve.addClass("place-act");
    		eve.siblings(".place-act").removeClass("place-act");
    		placeName.find("p").text(eve.text());
    		cookiePlaceNumber=eve.data("number");
    		placeNumber.text(cookiePlaceNumber);
    		if(eve.data("number")==="0049"){
    			placeComments.show();
    		}
    		else {
    			placeComments.hide();
    		}
    		placeList.hide();
    		return false
    	}
    });
    placeList.find(".place-act").click();
    var com_id = getComId();

    //获取上级url
    var reg = new RegExp("(^|&)url=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if(r){
        var referurl = decodeURIComponent(r[2]);
    }else{
        var referurl = '';
    }

	$.sValid.init({
        rules:{
            username:"required",
            userpwd:"required"
        },
        messages:{
            username:"请填写手机号码",
            userpwd:"请输入密码"
        },
        callback:function (eId,eMsg,eRules){
            if(eId.length >0){
                var errorHtml = "";
                $.map(eMsg,function (idx,item){
                    errorHtml += "<p>"+idx+"</p>";
                });
                $(".error-tips").html(errorHtml).show();
            }else{
                 $(".error-tips").html("").hide();
            }
        }  
    });
	$('#loginbtn').click(function(){//会员登陆
		var username = $('#username').val();
		var pwd = $('#userpwd').val();
		var client = 'wap';
		if($.sValid()){
	          $.ajax({
				type:'post',
				url:ApiUrl+"/index.php?act=login",
				data:{username:username,password:pwd,client:client,com_id:com_id,areacode:cookiePlaceNumber},
				dataType:'json',
				success:function(result){
					if(!result.datas.error){
						if(typeof(result.datas.token)=='undefined'){
							return false;
						}else{
							MYAPP.setUserInfo(result.datas);
                            if(result.datas.account && result.datas.account == 1){
                                window.location.href = "../attestation.html?url="+encodeURIComponent(referurl);
                                return false;
                            }
                            if(referurl){
                                location.href = referurl;
                            }else{
                                MYAPP.gopage('member', WapSiteUrl + '/tmpl/member/member.html',{title:'个人中心',showCart:0,headerAlpha:1});
                            }
						}
						$(".error-tips").hide();
					}else{
						$(".error-tips").html(result.datas.error).show();
					}
				}
			 });  
        }
	});

});