// 发起支付的参数
var _this;

var channelMap = [
    'WX_APP',// 微信手机原生APP支付
    "WX_NATIVE",// 微信公众号二维码支付
    'WX_JSAPI', // 微信公众号支付
    "ALI_APP",// 支付宝手机原生APP支付
    'ALI_WAP',// 支付宝移动网页支付
    'MY_BALANCE'// 陌云余额支付
];
MYPAY = {
    _params: {},
    moyunPayUrl: '',
    init: function (_params) {
        _this = MYPAY;
        // 验证登录
        if (getLocalStorage('key')=='') {
            return false;
        }
        // 初始化参数
        _this.initParams(_params);
        // 下单支付
        _this.bill();

    },
    initParams:function(params) {
        _params = params.data;
        moyunPayUrl = params.moyunPayUrl;
        var userInfo = MYAPP.getUserInfo();
        // 设置用户信息
        _params.uid = userInfo.uid;
        _params.loginToken = userInfo.token;
        // 解析参数
        if (typeof (_params.channel) == 'undefined') {
            $.sDialog({
                skin:"red",
                content:"支付渠道为空",
                okBtn:true,
                cancelBtn:false
            });
            return false;
        }
        var channel = _params.channel.toUpperCase().replace('PAY','');
        if ($.inArray(channel, ['ALI', 'WX']) != -1) {
            if (MYAPP.inapp()) {
                _params.channel = channel + '_APP';
            } else {
                var _suffix = channel == 'WX' ? 'JSAPI' : 'WAP';
                _params.channel = channel + '_' + _suffix;
            }
        }
        if ($.inArray(_params.channel, channelMap) == -1) {
            $.sDialog({
                skin:"red",
                content:"支付渠道错误",
                okBtn:true,
                cancelBtn:false
            });
            return false;
        }
        if (typeof (_params.subject) == 'undefined' || _params.subject.length <= 0) {
            $.sDialog({
                skin:"red",
                content:"商品名称参数错误",
                okBtn:true,
                cancelBtn:false
            });
            return false;
        }
        if (typeof (_params.outTradeNo) == 'undefined' || _params.outTradeNo.length <= 0) {
            $.sDialog({
                skin:"red",
                content:"商户唯一订单号参数错误",
                okBtn:true,
                cancelBtn:false
            });
            return false;
        }
        if (typeof (_params.totalFee) == 'undefined' || _params.totalFee.length <= 0 || _params.totalFee == 0) {
            $.sDialog({
                skin:"red",
                content:"交易余额参数错误",
                okBtn:true,
                cancelBtn:false
            });
            return false;
        }
        if (_params.channel == 'MY_BALANCE' && (typeof (_params.tradePassword) == 'undefined' || _params.tradePassword.length < 0)) {
            $.sDialog({
                skin:"red",
                content:"交易密码参数错误",
                okBtn:true,
                cancelBtn:false
            });
            return false;
        }
    },
    bill: function () {
        // 如果是app内打开则使用sdk支付,否则wap支付
        if (MYAPP.inapp()) {
            _params.appId = MYAPP.getAppInfo().myPayAppId ? MYAPP.getAppInfo().myPayAppId : _params.appId;
            MYAPP.goPayment(_params);
        } else {
            _this.buildBillRequestForm();
        }
    },
    buildBillRequestForm: function () { // 构建一个提交表单
        //微信特殊性,wxjsapi get 请求
        if(_params.channel == 'WX_JSAPI'){
            $.each(_params, function (key, val) {
                if(moyunPayUrl.indexOf('?') < 0){
                    moyunPayUrl += "?"+key+"="+val;
                }else{
                    moyunPayUrl += "&"+key+"="+val;
                }
            });
            var html = "<form style='display: none' id='billForm' name='billForm' action='" + moyunPayUrl + "' method='POST'>";
        }else{
            var html = "<form style='display: none' id='billForm' name='billForm' action='" + moyunPayUrl + "' method='POST'>";
            $.each(_params, function (key, val) {
                html += "<input type='hidden' name='" + key + "' value='" + val + "'/>";
            });
        }

        html += "<input type='submit' value='提交'></form>";
        $('body').after(html);
        $('#billForm').submit();
    }
}

