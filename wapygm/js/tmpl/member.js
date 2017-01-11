MYAPP.ready(function(){
    var com_id = getComId("com_id");

    var key =getLocalStorage('key');
    if(key=='' && MYAPP.inapp()){
        gotoLoginPage();
        return false;
    }
    if(key != ''){
        $.ajax({
            type:'post',
            url:ApiUrl+"/index.php?act=member_index",
            data:{key:key},
            dataType:'json',
            success:function(result){
                if(!result.datas.error){

                    var member_info = result.datas.member_info;

                    $('#avatar').attr("src",member_info.avatar);

                    if(member_info.username){
                        $('#username').html(member_info.username);
                    }else{
                        $('#username').html('暂无昵称');
                    }
                    if(member_info.mobile){
                        $('#mobile').html(member_info.mobile);
                    }

                    $('.member_head').click(function(){
                        MYAPP.gopage('memberInfo', WapSiteUrl + '/tmpl/member/member_info.html',{title:'个人中心',showCart:0,headerAlpha:1});
                    });
                    return false;
                }else{
                    $('#avatar').attr("src",LiveUrl+"/template/new/images/ranking/avatar.png");
                    $('#mobile').html("暂未绑定手机");
                    $('.member_head').click(function(){
                        MYAPP.gopage('login', WapSiteUrl + '/tmpl/member/login.html',{title:'用户登录',showCart:0,headerAlpha:1});
                    });
                }
            }
        });
    }else{
        $('#avatar').attr("src",LiveUrl+"/template/new/images/ranking/avatar.png");
        $('#mobile').html("暂未绑定手机");
        $('.member_head').click(function(){
            MYAPP.gopage('login', WapSiteUrl + '/tmpl/member/login.html',{title:'用户登录',showCart:0,headerAlpha:1});
        });
    }

    getRecommended();

    function getRecommended(){
        var store_id = GetQueryString("store_id");
        if (store_id != "") {
            $.ajax({
                type:'get',
                url:ApiUrl+"/index.php?act=store_show&op=get_recommended",
                data:{store_id:store_id},
                dataType:'json',
                success:function(result){
                    if(!result.datas.error){
                        var data = result.datas;
                        var html = template.render('abcdxx', data);
                        $("#recommended_goods_list").html(html);
                    }
                }
            });
        }
    }

    if(IsPC()){
        $('#create_order').removeClass('hide');
    }

    function IsPC() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    }
});