/*
 * 弹出支付窗口
 * 使用:
 * window.showPayWin("已渲染ul的id",需支付的总金额，预存款金额，liFn点击列表函数，walletFn提交预存款支付函数)
 * liFn(li对象,窗口操作对象)
 * walletFn(value值,窗口操作对象,密码报错函数)
 * 
 * 窗口操作对象:lock:锁闭当前的窗口，不能点击和关闭 unlock:解锁 hide:销毁当前窗口
 * 密码报错函数:error(msg)，会通过input的placeholder抛出这个信息
 * */
(function(w) {
	/*默认内容 * */
	var defaultMessage = {
			wallet: {
				checkedClass: "iconfont icon-gouxuanjian",
				unCheckedClass: "iconfont icon-weigouxuan"
			},
			param: {
				formAction: "",
				reg: /^[\s\S]*$/,
				regText: "请输入正确的密码"
			},
			mack: false
		}
		/*默认配置*/
	var defaultOption = {
			dom: null, //待复制的ul节点
			pay: 0, //需要支付的金额
			wallet: false, //是否开启钱包
			listFn: null, //点击列表回调
			walletFn: null //提交钱包密码回调
		}
		//报错
	function _showError(msg) {
		throw new Error(msg);
	}
	//初始化参数
	function _testParam(id, pay, wallet, listFn, walletFn) {
		var opt = {};
		if (id === undefined || pay === undefined || wallet === undefined) {
			showError("参数错误");
		}
		//配置
		$.extend(true, opt, {
			dom: $("#" + id).length ? $("#" + id) : defaultOption.dom,
			pay: (typeof pay === "number" && !isNaN(pay) && pay >= 0) ? pay : defaultOption.pay,
			wallet: wallet === false ? wallet : ((typeof wallet === "number" && !isNaN(pay) && wallet >= 0) ? wallet : defaultOption.wallet),
			listFn: typeof listFn === "function" ? listFn : defaultOption.listFn,
			walletFn: typeof walletFn === "function" ? walletFn : defaultOption.walletFn
		});
		return opt
	}
	//创建html
	function _createHtml(option) {
		var htmlCover = '<div class="pay_order_panel_cover" id="payOrderPanelCover"></div>';
		var htmlHead = '<div class="pay_order_panel" id="payOrderPanel">' +
			'<h3 class="' + ((option.wallet == 0) ? '">请选择支付方式' : 'pay_order_panel_wallet">预存款支付')+
			'<span>-¥' + (option.pay >= option.wallet ? option.wallet : option.pay).toFixed(2) + '</span>' +
			'<i class="' + defaultMessage.wallet.unCheckedClass + '"></i></h3>';
		var htmlInput = '<p class="pay_order_panel_password"><label>' +
			'<input type="password" placeholder="输入登录密码" /></label><button>确认</button></p>';
		var htmlPay = '<h4 class="pay_order_panel_money">支付<b>¥' + option.pay.toFixed(2) + '</b></h4>';
		var htmlList = '';
		var temp = null;
		if (option.dom) {
			var htmlList = '<ul>' + option.dom.html() + '</ul>';
		} else {
			htmlList = '<p class="pay_order_panel_none">无支付通道可以支付</p>';
		}
		return htmlCover + htmlHead + htmlInput + htmlPay + htmlList;
	}
	//设置事件
	function _bindEvent(nodes, option,out) {
		var focusMack = false;
		//开启预存款
		if (option.wallet !== false && option.wallet !== 0) {
			nodes.walletSwich.on("click", function() {
				if (nodes.disabled) {
					return false
				}
				if (nodes.walletSwich.attr("class") === defaultMessage.wallet.checkedClass) {
					nodes.walletSwich.attr("class", defaultMessage.wallet.unCheckedClass);
					nodes.walletInput.blur().attr({
						"placeholder": "输入登录密码"
					}).val("");
					nodes.walletPass.hide();
					nodes.pay.html("支付<b>¥" + option.pay.toFixed(2) + "</b>");
				} else {
					nodes.walletSwich.attr("class", defaultMessage.wallet.checkedClass);
					nodes.walletPass.show();
					nodes.walletInput.focus();
					nodes.pay.html("支付<b>¥" + (option.pay > option.wallet ? (option.pay - option.wallet) : 0).toFixed(2) + "</b>");
				}
			});
			//解决安卓手机浮动框上飘
			nodes.walletInput.on("blur", function() {
				setTimeout(function() {
					focusMack = false;
					nodes.panel.show().css("bottom", $("body").height() - $(window).scrollTop() - $(window).height() + "px");
				}, 400)
			}).on("focus", function() {
				focusMack = true;
			});
		}
		//确定预存款支付
		nodes.walletButton.on("click", function() {
			if (nodes.disabled) {
				return false
			}
			var value = nodes.walletInput.val();
			if (!defaultMessage.param.reg.test(value)) {
				nodes.walletInput.attr({
					"placeholder": defaultMessage.param.regText
				}).val("");
			} else {
				var errorFn=function(error){
					nodes.walletInput.attr({
					"placeholder": String(error)
					}).val("");
				}
				option.walletFn(value, out,errorFn);
			}
		});
		//列表事件点击
		nodes.list.on("click", function() {
			if (nodes.disabled) {
				return false
			}
			option.listFn(this, out);
		});
		//点击遮罩
		nodes.cover.on("click", function() {
			//		    				alert(focusMack);
			if (nodes.disabled || focusMack) {
				return false
			}
			hideWin();
		});
	}
	/*创建窗口*/
	function showWin(id, pay, wallet, listFn, walletFn) {
		if (window.$ === undefined) {
			_showError("没有找到jquery/zepto!");
		}
		if (window.openWinScroll === undefined) {
			_showError("没有找到openWinScroll方法!");
		}
		var option = _testParam(id, pay, wallet, listFn, walletFn);
		/*创建对应的html*/
		hideWin();
		$('body').append(_createHtml(option));
		/*获取节点*/
		var nodes = {};
		nodes.cover = $("#payOrderPanelCover");
		nodes.panel = $("#payOrderPanel");
		nodes.walletSwich = nodes.panel.find("h3 i");
		nodes.walletMoney = nodes.panel.find("h3 span");
		nodes.walletPass = nodes.panel.find(".pay_order_panel_password");
		nodes.walletInput = nodes.panel.find("input");
		nodes.walletButton = nodes.panel.find("button");
		nodes.pay = nodes.panel.find(".pay_order_panel_money");
		nodes.list = nodes.panel.find("li");
		nodes.form = nodes.panel.find("form");
		nodes.disabled = false; //暂时禁用所有按钮
		var out = {};
		out.lock = function() {
			nodes.disabled = true;
			nodes.panel.css("opacity", .5);
		};
		out.unlock = function() {
			nodes.disabled = false;
			nodes.panel.css("opacity", 1);
		};
		out.hide = hideWin;
		/*设置各节点事件*/
		_bindEvent(nodes, option,out);
		/*显示浮窗*/
		window.lockWinScroll();
		nodes.panel.show().css("bottom", $("body").height() - $(window).scrollTop() - $(window).height()+ "px");
		nodes.cover.show();
		return out;
	}

	function hideWin(animate) {
		if ($("#payOrderPanelCover").length) {
			$("#payOrderPanelCover").remove();
			$("#payOrderPanel").remove();
			window.openWinScroll();
		}
	}
	w.showPayWin = showWin;
})(window);