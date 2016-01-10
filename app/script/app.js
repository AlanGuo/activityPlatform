'use strict';


//app
(function(exports){
	var webapp = {
		_container:document.getElementById('body-container'),
		show:function(page){
			var viewName = page+'View';
			this._container.innerHTML = this[viewName].show();
			if(this[viewName].events && !this[viewName].events.binded){
				//绑定事件
				for(var p in this[viewName].events){
					this.eventHandler.on(p,this[viewName].events[p]);
				}
				this[viewName].events.binded = true;
			}
			if(this[viewName].init){
				this[viewName].init();
			}
		},
		/**
		 * 隐藏主界面
		 */
		hide:function(){
			this._container.innerHTML = '';
		}
	};

	exports.webapp = webapp;
})(window);