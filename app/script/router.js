'use strict';

(function(exports){
	var router = {
		route:function(hash){
			hash = hash || '';
			if(!hash){
				hash = 'home';
			}
			webapp.show(hash);
		}
	};
	exports.router = router;
})(webapp);
