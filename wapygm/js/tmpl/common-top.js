$(function (){
    if(MYAPP.inapp()){
        var headTitle = document.title;
        var headerNode=$("#header");
        var headerNodeData = headerNode.attr("data-refresh");
        headerNodeData = headerNodeData ? headerNodeData : '';
        var typeClass="top-bg-transparent"//ui上头部有差异，通过header上是否有此class来决定是否应用透明头部
        var borderClass="top-no-border";//ui上头部有差异，通过header是否有此class来判断是否加下边框
        var tmpl = !headerNode.hasClass(typeClass)?'<div class="header-wrap">'
//	        		+'<a href="javascript:history.back();" class="header-back"><span>返回</span></a>'
            +'<a href="javascript:MYAPP.goBack('+((headerNodeData==="")?"":headerNodeData)+');void(0);" class="header-back no-border"><span class="iconfont icon-jiantou-copy"></span></a>'						+'<h2 id="headTitle">'+headTitle+'</h2>'
            +'<a href="javascript:void(0)" id="btn-opera" class="i-main-opera">'
//					 	+'<span></span>'
            +'</a>'
            +'</div>'
            +'<div class="main-opera-pannel">'
            +'<div class="main-op-table main-op-warp">'
            +'<a href="'+WapSiteUrl+'/index.html" class="quarter">'
            +'<span class="i-home"></span>'
            +'<p>首页</p>'
            +'</a>'
            +'<a href="'+WapSiteUrl+'/tmpl/product_first_categroy.html" class="quarter">'
            +'<span class="i-categroy"></span>'
            +'<p>分类</p>'
            +'</a>'
            +'<a href="'+WapSiteUrl+'/tmpl/cart_list.html" class="quarter">'
            +'<span class="i-cart"></span>'
            +'<p>购物车</p>'
            +'</a>'
            +'<a href="'+WapSiteUrl+'/tmpl/member/member.html?act=member" class="quarter">'
            +'<span class="i-mine"></span>'
            +'<p>我的商城</p>'
            +'</a>'
            +'</div>'
            +'</div>'
            :'<div class="header-wrap"><a href="javascript:MYAPP.goBack('+"'"+((headerNodeData==="")?"":headerNodeData)+"'"+');void(0);">'
            +'<label class="iconfont icon-jiantou-copy"></label>'
            +'</a><a href="javascript:MYAPP.gopage({\'url\':WapSiteUrl+\'/tmpl/cart_list.html\'});void(0);"><label class="iconfont icon-gouwuche"></label></div>';

        //渲染页面
        var html = '';
        if(typeof(window.Device) == 'undefined' || typeof(window.Device.moyunapp()) == 'undefined'){
            var render = template.compile(tmpl);
            html = render();
        }
        headerNode.html(html);
        //根据两种头部重绘Header标签
        if(headerNode.hasClass(typeClass)){
            $("body").css("position","relative");
            headerNode.css({height:0}).find(".header-wrap").css({position:"fixed",left:0,right:0,top:0,"z-index":8888,"background":"transparent"});//透明内容且头部不占位
//		headerNode.find(".header-wrap").css({"position":"absolute","left":0,"top":0});
        }
        else{
            headerNode.css("height","45px").find(".header-wrap").css({position:"fixed",left:0,right:0,top:0,"z-index":8888});//头部占位且内容浮动
            if(!headerNode.hasClass(borderClass)){
                headerNode.find(".header-wrap").css("border-bottom","1px solid #b2b2b2");//去掉下边框
            }
        }
//	$("#btn-opera").click(function (){
//		$(".main-opera-pannel").toggle();
//	});
        //当前页面
//	if(headTitle == "商品分类"){
//		$(".i-categroy").parent().addClass("current");
//	}else if(headTitle == "购物车列表"){
//		$(".i-cart").parent().addClass("current");
//	}else if(headTitle == "我的商城"){
//		$(".i-mine").parent().addClass("current");
//	}
    }else{
        $('#header').remove();
        $('.after-header').removeClass('after-header');
    }

});