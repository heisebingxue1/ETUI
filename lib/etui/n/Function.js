/*!require: etui.n */

!function(){
	"use strict";
	var prvt = {};
	
	/**
	 * @function etui.n.Function
	 * The function instance build, copy over all our function helper to
	 * the function instance
	 * 
	 * @usage var foo = function(){};
	 * etui.n.Function(foo).once();
	 * 
	 */
	etui.n.Function = function(func){
		etui.clone(func, prvt);
		return func;
	};

	/**
	 * @function etui.n.Function.once
	 * Do nothing if current function already executed once.
	 * @param context the context to run the function
	 * @param arguments the arguments to be passed.
	 **/
	!function(){
		var calledFuncs = [];
		
		function has(callback){
			var l = calledFuncs.length;
			while(l--){
				if (calledFuncs[l] === callback){
					return true;
				}
			}
			
			return false;
		};
		
		prvt.once = function(){
			var callback = this;
			if (callback != null && 
				Object.prototype.toString.call(callback).toLowerCase() !==
				'[object function]'){
				throw new Error('etui.n.Function.once.ownerNotFunction');
			}
			if (has(callback)){
				return null;
			}
			
			return callback.call.apply(callback, arguments);
			
		};
	}
}();
