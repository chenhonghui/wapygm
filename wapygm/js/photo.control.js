/**
 * Created by Administrator on 2014/12/26.
 */
    var photoZoom=function(ele){
        this.ele=document.getElementById(ele);
        this.opts={/*
            touch1:[0,0],
            touch2:[0,0],
            */
            lastTouchStart:0,
            isDouble:false,
            isOne:false,
            scale:true,
            isScale:false,
            scaleVal:1,
            move:[]

        };
        this.init();
    };
    photoZoom.prototype.init=function(){
        var _this=this;
        this.ele.style.transform="scale("+this.opts.scaleVal+")";
        this.ele.style.webkitTransform="scale("+this.opts.scaleVal+")";
        this.ele.addEventListener("touchstart",function(e){
            var time = (new Date()).getTime();
            alert(e.touches.length);
            _this.control(e);
        },false);
        this.ele.addEventListener("touchmove",function(e){
            e.preventDefault();
            _this.move(e);
        },false);
        this.ele.addEventListener("touchend",function(e){
            _this.end(e);
        },false);
    };
    photoZoom.prototype.control=function(e){
        var _this=this;
        if(!this.opts.isOne){
            this.opts.touch1=[e.touches[0].pageX,e.touches[0].pageY];
            this.opts.isOne=true;
        }
        this.opts.touch2=[e.touches[0].pageX,e.touches[0].pageY];
        setTimeout(function(){
            _this.opts.isOne=false;
            if(_this.opts.touch1[0]==_this.opts.touch2[0] && _this.opts.touch1[1]==_this.opts.touch2[1] ){
                 console.log("应该是点击");
                _this.opts.isDouble=false;
                document.getElementById("p").innerText="Double false";
            }else{
                console.log("应该是两只手");
                _this.opts.isDouble=true;
                document.getElementById("p").innerText="Double true";
            }
        },500);
    };
    photoZoom.prototype.move=function(e){
        //this.opts.move=[(e.touches[0].pageX-this.opts.touch2[0]),(e.touches[0].pageY-this.opts.touch2[1])];
        //alert(this.opts.move[0]);
        if(this.opts.isDouble){
            this.ele.style.webkitTransform="scale(2)";
            //alert(1);
            console.log(this.opts.move[0]+"--"+this.opts.move[1]);
            if(this.opts.move[0]>this.opts.move[1]){
                    //if(this.opts.move[0]<0) this.opts.move[0]=-(this.opts.move[0]);
                    this.opts.scaleVal=parseFloat(1+"."+parseInt(this.opts.move[0]/4));

            }else{

            }
            if(parseFloat(this.opts.scaleVal)>4){
                this.opts.scaleVal=4;
            }

        };
    };
    photoZoom.prototype.end=function(e){
        if(this.opts.isDouble){
            console.log(this.opts.move[0]+"--"+this.opts.move[1]);
            if(this.opts.move[0]>this.opts.move[1]){

            }else{

            }
        }
    };
    photoZoom.prototype.config=function(){


    };
function cancelEvent(e){
    e.preventDefault();
}
