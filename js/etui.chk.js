/*!require:*/
/**
* Below are Native Object extension methods which already defined in 
* ECMAScript spec but missing on some older browsers.
* 
* The extension methods/hacks here should be always compatible with the 
* standard
* 
* * this module should not depend on any other module
* 
* @fileoverview
* @author EnglishTown Lab
* @license BSD
*/
(function () {
    
    /**
    * Hacks for native Function constructor
    * 
    * @class Function
    */
    
    /**
    * Binds function execution context to specified object, locks its execution scope to an object.
    *
    * @member Function
    * @return {Function} Return a new function that its execution context is bond.
    * @param {Object} Context The context to be bond to.
    */
    Function.prototype.bind || (Function.prototype.bind = function (context) {
        var slice = Array.prototype.slice;
        var __method = this, args = slice.call(arguments);
        args.shift();
        return function () {
            return __method.apply(context, args.concat(slice.call(arguments)));
        };
    });

})();

/*!require:hacks */
/* Root namespace for etui */
etui = {};

etui.ver = isNaN("/*@=VERSION */" * 1) ?0:"/*@=VERSION */" * 1;

/**
 * @function ctor
 * A contructor helper, it returns a contructor which its prototype has 
 * same member methods as the prototype of base, also calls into 
 * the constructor of base when the new constructor is get called.
*/
!function(){
	"use strict";
	etui.ctor = function(ctor, base) {
		
		var hasBase = base != null;
		
		// the function which will be returned as an constructor wrapper
		var ret = function() {
			if (hasBase) {
				// calls into base ctor before call into current ctor
				base.apply(this, arguments);
			}
			
			// calls into current ctor with all arguments
			ctor.apply(this, arguments);
		};
		
		// create a obj to holds info
		var coreInfo = {};
		
		if (hasBase){
			// set .base to appropriate base constructor
			if (base.prototype.__core__ != null &&
				base.prototype.__core__.ctor != null) {
				coreInfo.base = base.prototype.__core__.ctor;
			}
			else {
				coreInfo.base = base;
			}
		}
		else{
			coreInfo.base = null;
		}
		
		// store the ref to original constructor;
		coreInfo.ctor= ctor; 
		coreInfo.wrapper = ret;

		if (hasBase) {
			// create an empty constructor so ret can safely have
			// all members of base.prototype
			var temp = function() { };
			temp.prototype = base.prototype;
			ret.prototype = new temp();
			
		}
		
		ret.prototype.__core__ = coreInfo;
		
		// repoint it in case the prototype is been overrided.
		ret.prototype.constructor = ret;

		return ret;
	};

}();

/**
 * @function: event
 * Create a event-like delegate object, supports multicast
	
 * sample:
 * Create a event:
 * obj.onMouseDown = $event()
 * 
 * sample:
 * Hook a function to the event:
 * Obj.onMouseDown.hook(function(){});
 * 
 * sample:
 * Remove a function reference from the event:
 * Obj.onMouseDown.unhook(funcVariable);
 * 
 * sample:
 * Cast the event
 * onMouseDown(arg1, arg2);
 * 
 **/
!function(){
	"use strict";
	/**
	 * @function newBox
	 * @private
	 * Create a node
	 **/
	function newBox() {
		return new function() {
			this.ref = null;
			this.next = null;
		};
	};
	
	function checkIsFunc(func){
		if (Object.prototype.toString.call(func).toLowerCase() !==
			'[object function]'){
			throw new Error('hookee is not a function');
		}
	};
	
	function hookFunc(func){
		checkIsFunc(func);
		
		this.cur.next = newBox();
		
		this.cur = this.cur.next;
		this.cur.ref = func;

		return true;
	};
	
	function unhookFunc(func){
		checkIsFunc(func);
		
		// traversing link ds
		var c = this.head;
		var p = null;
		while (c.next != null) {
			p = c;
			c = c.next;
			if (c.ref === func) {
				p.next = c.next;
				c = null;
				return true;
			}
		}

		return false;
	};
	
	function invokeFunc(){
		var c = this.head;
		var p = null, tmp = null, result=null;
		while (c.next != null) {
			p = c;
			c = c.next;
			if (c.ref != null) {

				tmp = null;
				try {
					tmp = c.ref.apply(this, arguments);
				}
				catch (ex) { }
				if (tmp != null) {
					result = tmp;
				}
			}
		}

		return result;
	};
	
	// empty fn
	var headFn = function() {
	};
	
    var eventCtor = function() {
        
        var result = null;
        var ret = function(){
			return invokeFunc.apply(ret, arguments);
		};
		
		ret.head = newBox();
		
        // init head node
        ret.head.ref = headFn;
        
        // point cursor to head
        ret.cur = ret.head;
        
        // hook a func
        ret.hook = hookFunc;
        // unhook a func
        ret.unhook = unhookFunc;

        return ret;
    };
    
    etui.event = eventCtor;
}();

/**
 * @function etui.clone
 * clone object
 * @param target optional the target to be cloned to.
 * @param source 
 **/
etui.clone = function(target, source){
	
	// in case only source specified
	if (source == null){
		source = target;
		target= {};
	}
	
	for(var key in source){
		if (source.hasOwnProperty(key)){
			continue;
		}
		
		target[key] = source[key]
	}
	
	return target;
};

/*!require: etui*/
/**
 * @class: steps
 * An async step helper.
 * 
 * Well organize your code when calling nested async operation.
 * 
 * sample:
 * 
 * // original code:
 * function step3(){
 * 		console.log('all done');
 * }
 * function step2(){
 * 		asyncCall2(step3);
 * }
 * function step1(){
 * 		asyncCall1(step2);
 * }
 * 
 * // optimized code
 * var s = new Steps();
 * s.step(function step1(){
 * 		asyncCall1(this.go);
 * });
 * s.step(function step2(){
* 		asyncCall2(this.go);
 * });
 * s.step(function step3(){
 * 		this.go();
 * });
 * s.go();
 * 
 * 
 **/
!function(undef){
	var steps = function(){
	
		this.steps = [this._createNode(function(){
			this.next();
		})];
		this.cursor = this.steps[0];
		
		// wrap go(), make sure the context of go() is always current
		// instance
		this.go = this.go.bind(this);
		this.defer = this.defer.bind(this);
	};
	var sp = steps.prototype;
	sp._createNode = function(callback, next){
		if (next === undef){
			next = null;
		}
		var ret = {callback: callback, next: next};
		return ret;
	};
	/**
	 * @function step
	 * define a step
	 **/
	sp.step = function(callback){
		var stepStruct = this._createNode(callback);
		this.steps[this.steps.length - 1].next = stepStruct;
		this.steps.push(stepStruct);
		
		// if already called go(), this.cursor will pointed to null
		// repoint it so this.next() can continue calls the newly added
		// steps
		if (this.cursor == null){
			this.cursor = stepStruct;
		}
		
		return this;
	};
	/**
	 * @function go
	 * Start next step immediately
	 **/
	sp.next = function(){
		
		var callback;
		
		if (this.cursor == null){
			return this;
		}
		
		callback = this.cursor.callback;
		
		if (callback == null){
			return this;
		}
		
		// advance to next
		this.cursor = this.cursor.next;

		callback.apply(this, arguments);
		
		return this;
	};
	/**
	 * @function go
	 * Start next step immediately 
	 * (this function will always be executed
	 * with context pointed to current instance of steps)
	 **/
	sp.go = function(){
		return this.next();
	};
	/**
	 * @function go
	 * Start next step when code execution thread idle
	 * (this function will always be executed
	 * with context pointed to current instance of steps)
	 **/
	sp.defer = function(){
		setTimeout(this.go, 0);
		return this;
	};
	
	etui.steps = steps;
}();

/*!require: etui.steps*/
!function($, undef){
	"use strict";
	
	/**
	 * Font Info
	 * 
	 */
	var FONTS = {};
	FONTS['ETDINGS'] = {
		path: '/_imgs/etui/fonts/EtLabWebDings_400.font.js',
		css:'.et-fs-dings',
		family: 'EtLabWebDings'
	};
	FONTS['HELV_NEUE_LT_250'] = {
		path: '/_imgs/etui/fonts/Helvetica_Neue_LT_Std_250.font.js',
		css:'html.et-lng-en .et-fs-helvetical-neue-lt-th,' +
			'html.et-lng-pt .et-fs-helvetical-neue-lt-th,' +
			'html.et-lng-sp .et-fs-helvetical-neue-lt-th,' +
			'html.et-lng-de .et-fs-helvetical-neue-lt-th,' +
			'html.et-lng-it .et-fs-helvetical-neue-lt-th,' +
			'html.et-lng-in .et-fs-helvetical-neue-lt-th,' +
			'html.et-lng-fr .et-fs-helvetical-neue-lt-th',
		family: 'Helvetica Neue LT Std'
	};
	
	var CSS_SHADOW = 'et-textshadow';
	
	var defaultSettings = {
		cacheSvr: 'http://ak.englishtown.com',
		textShadowCss: '0 -1px rgba(0,0,0,.4)'
	};
	
	/**
	 * Private Methods
	 **/
	 

	/**
	 * @cu function
	 * The constructor
	 **/
	var cu = function(options){
		
		this.opts = $.extend({}, defaultSettings, options);
		
		this.elementCache = [];
		this.loaded = false;
	};
	var p = cu.prototype;
	
	/**
	 * @function load
	 * Load all fonts
	 **/
	p.load = function(cacheSvr){
		if (!window.Cufon){
			return;
		}
		
		if (!cacheSvr){
			cacheSvr = this.opts.cacheSvr;
		}
		
		var s = new etui.steps;
		var context = this;
		
		for (var key in FONTS){
			if (!FONTS.hasOwnProperty(key)){
				continue;
			}
			
			s.step((function(key){
				$.getScript(cacheSvr + FONTS[key].path, this.go);
			}).bind(s, key));
			s.step((function(key){
				try
				{
					var all = $(FONTS[key].css);
					var shadow = all.filter('.' + CSS_SHADOW);
					var nonshadow = all.not('.' + CSS_SHADOW);
					shadow.each(function(i, el){
						// cufon with shadow
						Cufon.replace(el,{
							textShadow: context.opts.textShadowCss,
							fontFamily: FONTS[key].family
						});

					});
					
					nonshadow.each(function(i, el){
						Cufon.replace(el, {fontFamily: FONTS[key].family});
					});
					
					FONTS[key].loaded = true;
				}
				catch(ex){
					FONTS[key].loaded = false;
				}
				
				this.go();
			}).bind(s, key));
		}
		
		s.go();
		
		this.loaded = true;

	};
	
	etui.cufon = new cu;
}(jQuery);

/*!require: etui */
etui.mvc = {};

/*!require: etui.mvc */
!function($, mvc, undef){
	'use strict';
	var model = etui.ctor(function(){
		
		/**
		 * Publics
		 **/
		// data holder
		this.data = {};
		
		/**
		 * Events
		 **/
		this.onUpdate = etui.event();
		
		
	});
	
	var p = model.prototype;
	
	p.set = function(name, value){
		
		if (name === undef){
			return;
		}
		
		this.data[name] = value;
		
		this.onUpdate();
	};
	p.get = function(value){
		
	};
	
	mvc.model = model;
}(jQuery, etui.mvc);


/*!require: etui.mvc.model */
!function($, mvc, undef){
	
	var init = {
		hookEvent: function(){
			this.onUpdate.hook(hOnUpdate);
		}
	};
	
	/**
	 * Event Hanlders
	 **/
	
	function hOnUpdate(){
		// refresh bounded views
		var l = this._views.length,
			view;
			
		while(l--){
			view = this._views[l];
			view && view.refresh && view.refresh();
		}
	};
	
	var vmodel = etui.ctor(function(){
		/**
		 * Privates
		 **/
		this._views = [];
		
		init.hookEvent.call(this);
		
	}, mvc.model);
	
	var p = vmodel.prototype;
	
}(jQuery, etui.mvc);

/*!require: etui.mvc */
!function($, mvc, undef){
	'use strict';
	var view = etui.ctor(function(){
		
		
	});
	
	var p = view.prototype;
	
	p.refresh = function(){
		
	};
	
	mvc.view = view;
}(jQuery, etui.mvc);


/*!requrie: etui */

/**
 * @namespace etui.n
 * contains all extension methods for native javascript objects
 */
etui.n = {};

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

