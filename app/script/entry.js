'use strict';


//程序入口
window.onhashchange = function(){
     var newHash = location.hash.substring(2) || location.pathname.substring(1);
     //路由
     webapp.router.route(newHash);
};

window.onhashchange();
_hmt.push(['_trackEvent','page','speed','renderTime',new Date()-window.startTime]);
webapp.eventHandler.bindEvent('click');
