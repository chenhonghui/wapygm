/*
 *此框架只依赖zepto.js
 *sDialog 是dialog弹出框
 */
(function($) {
    $.extend($, {
        sDialog: function(options) {
            //dialog弹出框
            var opts = $.extend({}, $.sDialog.defaults, options);

            function _init() {
                $(".simple-dialog-wrapper").remove(); //初始化之前移除原来的遮罩
                var mask_height = ($("body").height() > $(window).height()) ? $("body").height() : $(window).height();
                var windowH = parseInt($(window).height());
                var warpTop = windowH / 2;
                var dTmpl = '<div class="simple-dialog-wrapper">';
                if (opts.lock) { //是否有锁定
                    dTmpl += '<div class="s-dialog-mask" style="height:' + mask_height + 'px;"></div>';
                }
                dTmpl += '<div class="s-dialog-wrapper s-dialog-skin-' + opts.skin + '">' + '<div class="s-dialog-content">' + opts.content + '</div>'
                if (opts.okBtn || opts.cancelBtn) {
                    dTmpl += '<div class="s-dialog-btn-wapper">';
                    if (opts.okBtn) {
                        dTmpl += '<a href="javascript:void(0)" class="s-dialog-btn-ok">' + opts.okBtnText + '</a>';
                    }
                    if (opts.cancelBtn) {
                        dTmpl += '<a href="javascript:void(0)" class="s-dialog-btn-cancel">' + opts.cancelBtnText + '</a>';
                    }
                    dTmpl += '</div>';
                }
                dTmpl += '</div>';
                dTmpl += '</div>';
                $("body").append(dTmpl);
                var d_wrapper = $(".s-dialog-wrapper");
                var mLeft = -parseInt(d_wrapper.width()) / 2;
                var mTop = -parseInt(d_wrapper.height()) / 2;
                d_wrapper.css({
                    "margin-left": mLeft,
                    "left":"50%",
                    "margin-top": mTop,
                    "top":"50%",
                });
                //绑定事件
                _bind();
            }

            function _bind() {
                var okBtn = $(".s-dialog-btn-ok");
                var cancelBtn = $(".s-dialog-btn-cancel");
                okBtn.click(_okFn);
                cancelBtn.click(_cancelFn);
                if (!opts.okBtn && !opts.cancelBtn) {
                    setTimeout(function() {
                        _close();
                    }, opts.autoTime);
                }
            }

            function _okFn() {
                opts.okFn();
                _close();
            }

            function _cancelFn() {
                opts.cancelFn();
                _close();
            }

            function _close() {
                $(".simple-dialog-wrapper").remove();
            }
            return this.each(function() {
                _init();
            })();
        },
        sValid: function() {
            var $this = $.sValid;
            var sElement = $this.settings.sElement;
            for (var i = 0; i < sElement.length; i++) {
                var element = sElement[i];
                var sEl = $("#"+element).length >0 ? $("#"+element) : $("."+element);
                for(var j = 0;j<sEl.length;j++){
                     $this.check(element,sEl[j]);
                }
            }
            $this.callBackData();
            var cEid = $this.errorFiles.eId;
            var cEmsg = $this.errorFiles.eMsg;
            var cErules = $this.errorFiles.eRules;
            var isVlided = false;
            if (cEid.length > 0) {
                isVlided = false;
            } else {
                isVlided = true;
            }
            $this.settings.callback.apply(this, [cEid, cEmsg, cErules]);
            $this.destroyData();
            return isVlided;
        }
    });
    //sDialog
    $.sDialog.defaults = {
        autoTime: '1500', //当没有 确定和取消按钮的时候，弹出框自动关闭的时间
        "skin": 'block', //皮肤，默认黑色
        "content": "我是一个弹出框", //弹出框里面的内容
        "width": 100, //没用到
        "height": 100, //没用到
        "okBtn": true, //是否显示确定按钮
        "cancelBtn": true, //是否显示确定按钮
        "okBtnText": "确定", //确定按钮的文字
        "cancelBtnText": "取消", //取消按钮的文字
        "lock": true, //是否显示遮罩
        "okFn": function() {}, //点击确定按钮执行的函数
        "cancelFn": function() {} //点击取消按钮执行的函数
    };
    //sValid
    $.extend($.sValid, {
        defaults: {
            rules: {},
            messages: {},
            callback: function() {}
        },
        init: function(options) {
            //初始化控件参数
            var opt = $.extend({}, this.defaults, options);
            var rules = opt.rules;
            var messages = opt.messages;
            var sElement = [];
            $.map(rules, function(item, idx) {
                sElement.push(idx);
            });
            this.settings = {};
            this.settings["sElement"] = sElement;
            this.settings["sRules"] = rules;
            this.settings["sMessages"] = messages;
            this.settings['callback'] = opt.callback;
        },
        optional: function(element) {
            var val = this.elementValue(element);
            return !this.methods.required.call(this, val, element);
        },
        methods: {
            required: function(value, element) {
                if (element.nodeName.toLowerCase() === "select") {
                    var val = $(element).val();
                    return val && val.length > 0;
                }
                return $.trim(value).length > 0;
            },
            maxlength: function(value, element, param) {
                var length = $.trim(value).length;
                return this.optional(element) || length <= param;
            },
            minlength: function(value, element, param) {
                var length = $.trim(value).length;
                return this.optional(element) || length >= param;
            },
            //是否是合法数字（包括正数、负数）
            number: function(value, element, param) {
                return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
            },
            digits: function(value, element, param) {
                return this.optional(element) || /^\d+$/.test(value);
            },

            mobile: function(value, element, param) { //中国境内手机格式检查
                return this.optional(element) || /^1[3|4|5|7|8][0-9]\d{8,8}$/.test(value);
            },

            email: function(value, element, param) {
                return this.optional(element) || /[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{3}/.test(value);
            }
        },
        elementValue: function(element) {
            var type = $(element).attr("type");
            var value = $(element).val();
            if (typeof value === "string") {
                return value.replace(/\r/g, "");
            }
            return value;
        },
        rulesFormat: {
            required: true,
            email: true
        },
        errorFiles: {
            eId: [],
            eRules: {},
            eMsg: {}
        },
        check: function(element,mEl) {
            var settingsRules = [];
            var methods = this.methods;
            var rules = this.settings["sRules"];
            var mVal = this.elementValue.call(this, mEl);
            var mParam = "";
            var errorFiles = this.errorFiles;
            var errRules = [];
            //rules
            if (typeof rules[element] === "string") {
                if ($.inArray(rules[element], settingsRules) < 0) {
                    settingsRules.push(rules[element]);
                }
            } else {
                $.each(rules[element], function(idx, item) {
                    if ($.inArray(idx, settingsRules) < 0) {
                        settingsRules.push(idx);
                        if (idx == "maxlength" || idx == "minlength") {
                            mParam = parseInt(item);
                        }
                    }
                })
            }
            //checked
            for (var i = 0; i < settingsRules.length; i++) {
                if (!methods[settingsRules[i]].call(this, mVal, mEl, mParam)) {
                    errRules.push(settingsRules[i]);
                    errorFiles['eRules'][element] = errRules;
                    if ($.inArray(element, errorFiles['eId']) < 0) {
                        errorFiles['eId'].push(element);
                    }
                }
            }
        },
        callBackData: function() {
            var errorFiles = this.errorFiles;
            var errId = errorFiles.eId;
            var eMsg = errorFiles.eMsg;
            var eRules = errorFiles.eRules;
            var sMessages = this.settings.sMessages;
            for (var i = 0; i < errId.length; i++) {
                if (typeof sMessages[errId[i]] === "string") {
                    eMsg[errId[i] + "_" + eRules[errId[i]]] = sMessages[errId[i]];
                } else {
                    if ($.isArray(eRules[errId[i]])) {
                        for (var j = 0; j < eRules[errId[i]].length; j++) {
                            eMsg[errId[i] + "_" + eRules[errId[i]][j]] = sMessages[errId[i]][eRules[errId[i]][j]]
                        }
                    }
                }
            }
        },
        destroyData: function() {
            this.errorFiles = {
                eId: [],
                eRules: {},
                eMsg: {}
            };
        }
    });
})(Zepto);

function ajaxLoading() {
    $(".body-wrapper").remove(); //初始化之前移除原来的遮罩
    var wrapperHtml = '<div class="body-wrapper"></div>';
    $("body").append(wrapperHtml);
}

function ajaxLoadingComplete() {
    $(".body-wrapper").remove();
}

function ajaxSaving() {
    $.sDialog({
        skin:"black",
        content:"保存中...",
        okBtn:false,
        cancelBtn:false
    });
}

function ajaxPosting() {
    $.sDialog({
        skin:"black",
        content:"提交中...",
        okBtn:false,
        cancelBtn:false
    });
}

function scroll(scrollTo, time) {
    var scrollFrom = parseInt(document.body.scrollTop);
    var i = 0;
    var runEvery = 5; // run every 5ms

    scrollTo = parseInt(scrollTo);
    time /= runEvery;

    var interval = setInterval(function () {
        i++;
        document.body.scrollTop = (scrollTo - scrollFrom) / time * i + scrollFrom;
        if (i >= time) {
            clearInterval(interval);
        }
    }, runEvery);
}

function scrollTopIcon(){
    var scrollFrom = parseInt(document.body.scrollTop);
    var clientheight = document.documentElement.clientHeight;
    if(scrollFrom >0){
        $('#gotop').show();
    }else{
        $('#gotop').hide();
    }
}

/*
 禁用窗口手势滑动(用于弹窗之类的，禁止窗口滑动)
 * */
(function(w){
    var disWin, enaWin, lockWin, lockKeyWin;
    //禁用窗口滚动事件
    lockWin = function (e) {
        e.preventDefault();
        e.returnValue = false;
        return false
    };
    //禁用上下左右 pagedown等翻页键
    lockKeyWin = function (e) {
        if (e.keyCode) {
            if (e.keyCode > 32 && e.keyCode < 41) {
                e.preventDefault();
                return false
            }
        }
    };
    //启动禁用滚动
    disWin = function () {
        if (document.addEventListener) {
            //禁用火狐鼠标滚轮事件
            window.addEventListener("DOMMouseScroll", lockWin, false);
            //禁用ie9+,chrome滚轮事件
            window.addEventListener("mousewheel", lockWin, false);
            //手机touch事件
            window.addEventListener("touchmove", lockWin, false);
            //禁用键盘输入滚动事件
            document.addEventListener("keydown", lockKeyWin, false);
        }
    };
    //解除滚动禁用
    enaWin = function () {
        if (document.removeEventListener) {
            //禁用火狐鼠标滚轮事件
            window.removeEventListener("DOMMouseScroll", lockWin, false);
            //禁用ie9+,chrome滚轮事件
            window.removeEventListener("mousewheel", lockWin, false);
            //手机touch事件(使用move避免输入框无法获得焦点)
            window.removeEventListener("touchmove", lockWin, false);
            //禁用键盘输入滚动事件
            document.removeEventListener("keydown", lockKeyWin, false);
        }
    };
    w.lockWinScroll=disWin;
    w.openWinScroll=enaWin;
})(window||{});