$(function() {
    var url = location.href.split('#')[0];
    // 微信JS接口配置
    var wx_config = {
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: '', // 必填，企业号的唯一标识，此处填写企业号corpid
        timestamp: '', // 必填，生成签名的时间戳
        nonceStr: '', // 必填，生成签名的随机串
        signature: '',// 必填，签名，见附录1
        jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo'] //必填，需要使用的JS接口列表，所有JS接口列表见附录2
    };

    var wxShare = {
        title: '',// 分享标题
        link: '',// 分享链接
        imgUrl: '',// 分享图标
        type: 'link',// 分享类型,music、video或link，不填默认为link
        dataUrl: '',// 如果type是music或video，则要提供数据链接，默认为空
        desc: '', // 分享描述
        init: function () {
            // 后台生成签名
            $.get(ApiUrl + "/index.php?act=weixin_share&op=JsSdkSign&url=" + encodeURIComponent(url), function (result) {
                if(!result.datas.error) {

                    wx_config.appId = result.datas.appId;
                    wx_config.timestamp = result.datas.time;
                    wx_config.signature = result.datas.sign;
                    wx_config.nonceStr = result.datas.noncestr;

                    // 初始化配置
                    wx.config(wx_config);
                    // 初始化微信接口
                    wx.ready(function(){
                        // 分享到微信朋友
                        wxShare.shareToWeiXinFriend();
                        // 分享到朋友圈
                        wxShare.shareToWeiXinFriendCircle();
                        // 分享到QQ
                        wxShare.shareToQQ();
                        // 分享到腾讯微博
                        wxShare.shareToTencentWeibo();
                        // 收藏到微信
                        wxShare.collectToWeiXin();
                    });

                    wx.error(function(res){
                        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                    });
                }
            },'json');
        },
        collectToWeiXin:function (){
            wx.onMenuItemfavorite({
                title: this.title,
                desc: this.desc,
                link: this.link,
                imgUrl: this.imgUrl,
                type: this.type,
                dataUrl: this.dataUrl,
                success: function () {
                    // 用户确认收藏后执行的回调函数
                    // alert('收藏成功');
                },
                cancel: function () {
                    // 用户取消收藏后执行的回调函数
                    // alert('收藏失败');
                }
            });
        },
        shareToWeiXinFriend:function () {
            wx.onMenuShareAppMessage({
                title: this.title,
                desc: this.desc,
                link: this.link,
                imgUrl: this.imgUrl,
                type: this.type,
                dataUrl: this.dataUrl,
                success: function () {
                    // 用户确认分享后执行的回调函数
                    // alert('分享成功');
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                    // alert('分享失败');
                }
            });
        },
        shareToWeiXinFriendCircle: function () {
            wx.onMenuShareTimeline({
                title: this.title,
                link: this.link,
                imgUrl: this.imgUrl,
                success: function () {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });
        },
        shareToQQ: function () {
            wx.onMenuShareQQ({
                title: this.title,
                desc: this.desc,
                link: this.link,
                imgUrl: this.imgUrl,
                success: function () {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });
        },
        shareToTencentWeibo: function () {
            wx.onMenuShareWeibo({
                title: this.title,
                desc: this.desc,
                link: url,
                imgUrl: this.imgUrl,
                success: function () {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });
        }
    };

    //微信分享数据
    wxShare.title = weixin_share_data.title, // 分享标题
    wxShare.link = url, // 分享链接
    wxShare.imgUrl = weixin_share_data.imgUrl, // 分享图标
    wxShare.desc = weixin_share_data.desc, // 分享描述
    // 初始化分享
    wxShare.init();

});