MYAPP.ready(function(){
	//倒计时函数
	function updateEndTime(){
	  var date = new Date();
	  var time = date.getTime();  //当前时间距1970年1月1日之间的毫秒数
	   
	   $(".countdown").each(function(i){
	      var promotionLong = 10825; //促销活动时间 单位秒
	      var addTimeStamp = parseInt(this.getAttribute("addTimeStamp")); //秒

	      var lag = addTimeStamp + promotionLong - time/1000;

	        if(lag > 0){
	         var second = Math.floor(lag % 60);
	         if(second <= 9) second = '0' + second;

	         var minute = Math.floor((lag / 60) % 60);
	         if(minute <= 9) minute = '0' + minute;

	         var hour = Math.floor((lag / 3600) % 24);
	         var day = Math.floor((lag / 3600) / 24);
	         $(this).html(day+"天"+hour+"小时"+minute+"分"+second+"秒");
	        }else{
	          $(this).html("活动已结束，订单被系统取消");
	        }
	   });

	  setTimeout("updateEndTime()",1000);
	}
});

MYAPP.ready(function(){updateEndTime();});