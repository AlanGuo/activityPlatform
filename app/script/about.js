'use strict';

(function(exports){
	var aboutView = {
		/** 
		 * 显示指定内容
		 * @method show
		 */
		init:function(){
		},
		show:function(){
			_hmt.push(['_trackEvent', 'page', 'view', 'about','']);
			
				return 'about view';
			
		},
		events:{
			'confirm':function(){
			}
		}
	};

	exports.aboutView = aboutView;
})(webapp);
