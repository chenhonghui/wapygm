;(function() {
    if (window.WebViewJavascriptBridge) { return }
    var messagingIframe
    var sendMessageQueue = []
    var receiveMessageQueue = []
    var messageHandlers = {}

    var CUSTOM_PROTOCOL_SCHEME = 'wvjbscheme'
    var QUEUE_HAS_MESSAGE = '__WVJB_QUEUE_MESSAGE__'

    var responseCallbacks = {}
    var uniqueId = 1

    function _createQueueReadyIframe(doc) {
        messagingIframe = doc.createElement('iframe')
        messagingIframe.style.display = 'none'
        doc.documentElement.appendChild(messagingIframe)
    }

    function init(messageHandler) {
        if (WebViewJavascriptBridge._messageHandler) { throw new Error('WebViewJavascriptBridge.init called twice') }
        WebViewJavascriptBridge._messageHandler = messageHandler
        var receivedMessages = receiveMessageQueue
        receiveMessageQueue = null
        for (var i=0; i<receivedMessages.length; i++) {
            _dispatchMessageFromAPP(receivedMessages[i])
        }
    }

    function send(data, responseCallback) {
        _doSend({ data:data }, responseCallback)
    }

    function registerHandler(handlerName, handler) {
        messageHandlers[handlerName] = handler
    }

    function callHandler(handlerName, data, responseCallback) {
        _doSend({ handlerName:handlerName, data:data }, responseCallback)
    }

    function _doSend(message, responseCallback) {
        if (responseCallback) {
            var callbackId = 'cb_'+(uniqueId++)+'_'+new Date().getTime()
            responseCallbacks[callbackId] = responseCallback
            message['callbackId'] = callbackId
        }
        sendMessageQueue.push(message)
        messagingIframe.src = CUSTOM_PROTOCOL_SCHEME + '://' + QUEUE_HAS_MESSAGE
    }

    function toUnicode(s){
        return s.replace(/([\u4E00-\u9FA5]|[\uFE30-\uFFA0])/g,function(){
            return "\\u" + RegExp["$1"].charCodeAt(0).toString(16);
        });
    }

    function _fetchQueue() {
        var messageQueueString = toUnicode(JSON.stringify(sendMessageQueue))
        sendMessageQueue = []
        return messageQueueString
    }

    function _dispatchMessageFromAPP(messageJSON) {
        setTimeout(function _timeoutDispatchMessageFromObjC() {
            var message = JSON.parse(messageJSON)
            var messageHandler

            if (message.responseId) {
                var responseCallback = responseCallbacks[message.responseId]
                if (!responseCallback) { return; }
                responseCallback(message.responseData)
                delete responseCallbacks[message.responseId]
            } else {
                var responseCallback
                if (message.callbackId) {
                    var callbackResponseId = message.callbackId
                    responseCallback = function(responseData) {
                        _doSend({ responseId:callbackResponseId, responseData:responseData })
                    }
                }

                var handler = WebViewJavascriptBridge._messageHandler
                if (message.handlerName) {
                    handler = messageHandlers[message.handlerName]
                }

                try {
                    handler(message.data, responseCallback)
                } catch(exception) {
                    if (typeof console != 'undefined') {
                        console.log("WebViewJavascriptBridge: WARNING: javascript handler threw.", message, exception)
                    }
                }
            }
        })
    }

    function _handleMessageFromAPP(messageJSON) {
        if (receiveMessageQueue) {
            receiveMessageQueue.push(messageJSON)
        } else {
            _dispatchMessageFromAPP(messageJSON)
        }
    }

    window.WebViewJavascriptBridge = {
        init: init,
        send: send,
        registerHandler: registerHandler,
        callHandler: callHandler,
        _fetchQueue: _fetchQueue,
        _handleMessageFromAPP: _handleMessageFromAPP
    }

    var doc = document
    _createQueueReadyIframe(doc)
    var readyEvent = doc.createEvent('Events')
    readyEvent.initEvent('WebViewJavascriptBridgeReady',true,false)
    readyEvent.bridge = WebViewJavascriptBridge
    doc.dispatchEvent(readyEvent)
})();


function connectWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        callback(WebViewJavascriptBridge)
    } else {
        document.addEventListener('WebViewJavascriptBridgeReady', function() {
            callback(WebViewJavascriptBridge)
        }, false)
    }
}

connectWebViewJavascriptBridge(function (bridge) {
    //返回上个页面刷新
    bridge.registerHandler('backRefresh', function (data, responseCallback) {
        window.location.reload();
    });
    //登陆后页面刷新
    bridge.registerHandler('loginAfterRefresh', function (data, responseCallback) {
        WebViewJavascriptBridge.callHandler('initMYAPP', {}, function(responseData){
            responseData = typeof(responseData) == 'undefined' ? {} : JSON.parse(decodeURIComponent(responseData));
            if(typeof(responseData.userInfo) != 'undefined'){
                location.replace(location.href);
            }
        });


    });
    //图片上传成功后设置预览
    bridge.registerHandler('afterPhotoUpload', function (data) {
        afterPhotoUpload(data);
    });
    // 支付成功回调
    bridge.registerHandler('payRstCallBack', function (data, responseCallback) {
        MYAPP.gopage({'url':WapSiteUrl+'/tmpl/member/order_list.html'});
    });
    // 发送短信后回调
    bridge.registerHandler('afterSMS', function (data, responseCallback) {
        MYAPP.gopage({'url':WapSiteUrl+'/tmpl/member/order_list.html'});
    });
});

MYAPP = {
    inapp: function(){
        return /moyunappUA/i.test(navigator.userAgent);
    },
    ready: function (callback) {
        if(MYAPP.inapp()){
            WebViewJavascriptBridge.init(function (message, responseCallback) {});
            WebViewJavascriptBridge.callHandler('initMYAPP', {}, function(responseData){
                MYAPP.setMYSiteInfo(responseData);
                callback();
            });
        } else {
//            MYAPP.setMYSiteInfo();
            MYAPP.addComId();
            downloadApp();
            callback();
        }
    },
    setMYSiteInfo:function(data) {
        // 为了在防止退出再进入时未把用户信息转过来
        data = typeof(data) == 'undefined' ? {} : JSON.parse(decodeURIComponent(data));
        this.appInfo = typeof(data.appInfo) != 'undefined' ? data.appInfo : {appId: '', comId: 1, unique: '', channelCpid: 0, appVersion: '', appName: ''};
        this.userInfo = typeof(data.userInfo) != 'undefined' ? data.userInfo : {uid: 0, token: '', username: '', mobile: '', gender: '', avatar: '', birthday: ''};
        if (window.localStorage) {
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        }
        if(typeof(MYAPP.afterSetMYSiteInfo) == 'function') {
            MYAPP.afterSetMYSiteInfo();
        }
    },
    getAppInfo: function () {
        return this.appInfo;
    },
    afterSetMYSiteInfo: function(){
        return true;
    },
    getUserInfo: function () {
        if (window.localStorage) {
            var userInfo = localStorage.getItem('userInfo');
            this.userInfo = eval('(' + userInfo + ')');
        }
        return this.userInfo;
    },
    setUserInfo: function (userInfo) {
        this.userInfo = typeof(userInfo) != 'undefined' ? userInfo : {uid: 0, token: '', username: '', mobile: '', gender: '', avatar: '', birthday: ''};
        if (window.localStorage) {
            localStorage.setItem('userInfo' , JSON.stringify(this.userInfo));
        }
    },
    share: function (params){
        WebViewJavascriptBridge.callHandler('share',params);
    },
    uploadPhoto: function (params){
        WebViewJavascriptBridge.callHandler('uploadPhoto',params);
    },
    goBack: function (params) {
        if(typeof(params) == 'undefined' || params == ''){
            params = {};
        }
        if(MYAPP.inapp()){
            WebViewJavascriptBridge.callHandler('goBack',params);
        }else{
            window.history.back(); //兼容浏览器端的返回
        }
    },
    goLogin: function () {
        if(MYAPP.inapp()){
            WebViewJavascriptBridge.callHandler('login',{'jsCallback':'loginAfterRefresh'});
        }else{
            window.location.href = WapSiteUrl + '/tmpl/member/login.html?com_id=' + GetQueryString("com_id");
        }
    },
    goPayment: function (params) {
        WebViewJavascriptBridge.callHandler('apppay', params, function (responseData) {
        });
    },
    SMS: function (params) {
        WebViewJavascriptBridge.callHandler('SMS', params, function (responseData) {
        });
    },
    openQQ: function (params) {
        WebViewJavascriptBridge.callHandler('openQQ', params, function (responseData) {
        });
    },
    goNavite: function (params) {
        var pages = 'login|hongbao|home|myMessage|myHome|circle|personalPage|topicList|circleDetail|baoliao|replyTopic|'; // 跳原生的pagename
        WebViewJavascriptBridge.callHandler('gonative', params, function (responseData) {
        });
    },
    gopage: function (param1,param2,param3) {
        //使用三个参数,为兼容以前的跳转方式,新版只使用第一个参数(类型必须为对象)
        if (typeof(param1) == 'object') {
            var params = param1;
        }else{
            //兼容以前的跳转参数
            var params = {};
            params.url = param2; //旧跳转,第二个参数为URL
            params.pageTitle =  param3 ?  param3.title : ''; //旧跳转,第三个参数为标题和其它
        }

        if(MYAPP.inapp()){
            params.url = typeof(params.url) != 'undefined' ? params.url : '';
            params.pageTitle = typeof(params.pageTitle) != 'undefined' ? params.pageTitle : '';
            params.refresh = typeof(params.refresh) != 'undefined' ? params.refresh : 1;
            params.pagename = typeof(params.pagename) != 'undefined' ? params.pagename : 'shop';
            connectWebViewJavascriptBridge(function (bridge) {
                bridge.callHandler('goh5', params, function (response) {
//                    alert(JSON.stringify(response));
                });
            })
        }else{
            var com_id = getLocalStorage("com_id");
            if (com_id) {
                if (params.url.indexOf("?") > 0) {
                    window.location.href = params.url + "&com_id=" + com_id;
                } else {
                    window.location.href = params.url + "?com_id=" + com_id;
                }
            } else {
                window.location.href = params.url;
            }
        }


    },
    //添加com_id
    addComId: function() {
        var com_id = GetQueryString("com_id");
        if (isNaN(com_id) || com_id == null) {
            var com_id = GetQueryString("comId");
            if (isNaN(com_id) || com_id == null) {
                var com_id = null;
            }
        }
        if(!isNaN(com_id) && com_id > 0){
            if(getLocalStorage('com_id')){
                if(com_id != getLocalStorage('com_id')){
                    addLocalStorage('com_id',com_id);
                    delLocalStorage('userInfo');
                }
            }else{
                addLocalStorage('com_id',com_id);
            }

        }
    }

};


function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]); //unescape函数已经弃用 ECMAScript v3明确删除并反对 不能正确解码中文字符等
    return null;
}


function checklogin(state) {
    if (state == 0) {
        gotoLoginPage();
        return false;
    } else {
        return true;
    }
}

function contains(arr, str) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === str) {
            return true;
        }
    }
    return false;
}

/*
 *获取LocalStorage
 */
function getLocalStorage(name) {
    if (name == "key"){
        var userInfo = localStorage.getItem('userInfo');
        if(!userInfo){return '';}
        userInfo = eval('(' + userInfo + ')');
        var uid = userInfo.uid;
        if(uid < 1){return '';}

        var token = userInfo.token;
        return uid + "_" + token;
    }else{
        var value = localStorage.getItem(name);
        if(!value){
            return '';
        }
        value = eval('(' + value + ')');
        return value;

    }
}
/**
 * 添加LocalStorage
 */
function addLocalStorage(name, value) {
    if (window.localStorage) {
        localStorage.setItem(name , JSON.stringify(value));
    }
}
/**
 * 删除LocalStorage
 */
function delLocalStorage(name) {
    if (window.localStorage) {
        if (name == "key"){
            localStorage.removeItem('userInfo');
        }else{
            localStorage.removeItem(name);
        }
    }
}

function gotoLoginPage() {
    if (MYAPP.inapp()) {
        MYAPP.goLogin();
    } else {
        window.location.href = WapSiteUrl + '/tmpl/member/login.html?com_id=' + getLocalStorage("com_id");
    }
}

function isMoyunApp() {
    if (MYAPP.inapp()) {
        return true;
    } else {
        return false;
    }
}

function isWeiXinOrQQ() {
    var ua = window.navigator.userAgent.toLowerCase();
    if ((ua.match(/MicroMessenger/i) == 'micromessenger') || ((ua.match(/QQ/i) == 'qq') && (ua.match(/MQQ/i) != 'mqq'))) {
        return true;
    } else {
        return false;
    }
}

function isWeiXin() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        return true;
    } else {
        return false;
    }
}

function isQQ() {
    var ua = window.navigator.userAgent.toLowerCase();
    if ( ua.match(/QQ/i) == 'qq' && ua.match(/MQQ/i) != 'mqq') {
        return true;
    } else {
        return false;
    }
}


function getComId() {
    if(MYAPP.inapp()){
        return MYAPP.getAppInfo().comId;
    }else{
        var com_id = getLocalStorage("com_id");
        if(com_id){
            return com_id;
        }else{
            return 1;
        }
    }
}

function isIos() { // 是否是苹果客户端
    return /ipad|iphone|mac/i.test(navigator.userAgent.toLowerCase())
}

//下载洋姑妈app
function downloadApp(){
    if (window.sessionStorage && !sessionStorage.getItem("first_load") && (getComId() == 10080 || getComId() == 2)){
        window.location.href = WapSiteUrl+'/tmpl/ygmApp.html';
    }
}
