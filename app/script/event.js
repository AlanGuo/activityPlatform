'use strict';

(function(exports){
	var eventHandler = {
		_handlers:{
		},
		init:function(){
		},
		bindEvent:function(eventName){
			var self = this;
			var func = document.body.addEventListener?'addEventListener':'attachEvent';
			var type = document.body.addEventListener?eventName:'on'+eventName;

			if(/mobile|ios|iphone|android|ipad/i.test(navigator.userAgent)){
				type = 'touchstart';
			}
			
			document.body[func](type,function(evt){
				evt = evt || window.event;
				var target = evt.target || evt.srcElement;

				var handler = target.getAttribute('data-'+eventName+'-event');

				var execute = function(target,handler){
					var handlers = self._handlers[handler];
					if(handlers && handlers.length){
						for(var i=0;i<handlers.length;i++){
							handlers[i].call(target,evt);
						}
					}
				};

				if(handler){
					execute(target,handler);
				}
				else{
					while(target && target!==document.body){
						target = target.parentNode;
						handler = target.getAttribute('data-'+eventName+'-event');
						if(handler){
							execute(target,handler);
							break;
						}
					}
				}
			});
		},
		on:function(eventName,handler){
			this._handlers[eventName] = this._handlers[eventName] || [];
			this._handlers[eventName].push(handler);
		},
		off:function(){

		}
	};
	exports.eventHandler = eventHandler;
})(webapp);
