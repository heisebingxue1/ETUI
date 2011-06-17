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
			
			calledFuncs.push(callback);
			
			return callback.call.apply(callback, arguments);
			
		};
	}();
	
	/**
	 * @function etui.n.Function.memorize
	 **/
	!function(undef){
		function node(){
			this.subs = [];
			this.value = null;
		};
		
		node.prototype.get = function(value){
			var subs = this.subs;
			var l = subs.length;
			while(l--){
				if (subs[l].value === value){
					return subs[l];
				}
			}
			
			return undef;
		};
		
		node.prototype.add = function(value){
			var subs = this.subs;
			var ret = new node;
			ret.value = value;
			subs[subs.length] = ret;
			return ret;
		};
		
		prvt.memorize = function(){
			var callback = this;
			
			if (callback != null && 
				Object.prototype.toString.call(callback).toLowerCase() !==
				'[object function]'){
				throw new Error('etui.n.Function.memorize.ownerNotFunction');
			}
			
			if (!callback.__memorizeData__){
				callback.__memorizeData__ = new node;
			}
			
			var root = callback.__memorizeData__;
			var i, l, cursor = root;
			
			var ret = null;
			
			
			// cache it and then return it
			for(i = 0, l= arguments.length; i < l; i++){
				var arg = arguments[i],
					argNode = cursor.get(arg);
					
				if (argNode === undef){
					
					// cache the arguments to the tree
					for(;i < l; i++){
						cursor = cursor.add(arguments[i]);
					}
					
					// call original function and cache the result
					cursor.ret = callback.call.apply(callback, arguments);
					return cursor.ret;
				}
				else{
					cursor = argNode;
				}
				
			};
			
			ret = cursor.ret;
			
			return ret;
			
		};
	}();
}();
