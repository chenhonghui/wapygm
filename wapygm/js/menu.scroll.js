/**
 * Created by luowei on 2015/1/20.
 */
var scrollMenu=function(ele){
    var _this=this;
    //滑动DOM ID
    this.domid=ele || "menu-view";
    //获取宽度
    this._width=0;
    $("#"+this.domid).children().each(function(){
        _this._width=_this._width+$(this).width();
    });
    $("#"+this.domid).css("width",this._width+"px");
    //屏幕宽度
    var _winWidth=$("#"+this.domid).parent().width();
    //可滑动宽度
    var scrollXtrue=this._width-_winWidth;
    if(scrollXtrue<0){
        scrollXtrue=0;
    }
    //获取元素
    this.ele=document.getElementById(this.domid);
    //初始滑动为0
    this.scrollX=0;
    this.scroll=0;
    //初始方法
    this.init=function(){
        //绑定事件
        this.ele.addEventListener("touchstart",function(e){
            _this.touchStart(e);
        },true);
        this.ele.addEventListener("touchmove",function(e){
            _this.touchMove(e);
        },true);
        this.ele.addEventListener("touchend",function(e){
            _this.touchEnd(e);
        },true);
    };
    this.touchStart=function(e){
        var location=e.touches[0];
        //计算滑动起点位置
        this.startX=location.pageX;
        this.startY=location.pageY;
    };
    this.touchMove=function(e){
        e.preventDefault();
        //$("#"+this.domid).css("transition","all 0s");
        this.ele.style.webkitTransition="all 0s";
        var location=e.touches[0];
        //计算滑动位置
        this.moveX=location.pageX;
        this.moveY=location.pageY;
        //获取本次滑动距离
        this.sx=this.moveX-this.startX;
        //console.log(this.moveX+"---"+this.startX);
        //滑动距离=上次所滑动+本次滑动
        this.scroll=this.scrollX+this.sx;
        //console.log(this.scroll+"---");
        //判断滑动距离是否超过可滑动距离
        if(this.scroll<-scrollXtrue){
            var cha=scrollXtrue-this.scroll;
            //设置可超出滑动距离的30PX
            if(cha>30) this.scroll=-(scrollXtrue+30);
        }
        if(this.scroll>30){
            this.scroll=30;
        }
        //$("#"+this.domid).css("transform","translate("+this.scroll+"px,0px)");
        this.ele.style.webkitTransform="translate("+this.scroll+"px,0px)";
    };
    this.touchEnd=function(){
        $("#"+this.domid).off("click");
        this.scrollX=this.scroll;
        this.ele.style.webkitTransition="all 0.3s";
        if(this.scroll>0){
            this.scroll=0;
        }
        if(this.scroll<-scrollXtrue){
            this.scroll=-scrollXtrue
        }
        //$("#"+this.domid).css("transform","translate("+this.scroll+"px,0px)");
        this.ele.style.webkitTransform="translate("+this.scroll+"px,0px)";
        //var scrollX=this.scrollX+this.scroll;
        //$("#"+this.domid).css("transition","all 0s");
        //console.log(scrollX);
    };
    this.init();
};