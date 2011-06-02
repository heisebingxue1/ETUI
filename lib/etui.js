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
 * @function etui.chn
 * Convert members of any object to return object itself so we can use
 * that object 'chain-style'.
 **/
!function(undef){
    "use strict";

    var chn = function(obj){
        return new wrapperCtor(obj);
    };
    
   
    var wrappers = {
        func: function(context, propName){
            return function(){
                var ret = context[propName].apply(context, arguments);
                    
                // if no return value, return myself
                if (ret === undef){
                    return this;
                }
                return ret;
            };
        },
        prop: function(context, propName){
            return function(value){
                if (value === undef){
                    return context[propName];
                }
                else{
                    context[propName] = value;
                    return this;
                }
            };
        }
    };
    
    /**
     * Wrapper Private Methods
     */
    var wrapperPrvt = {
        /**
         * @function init
         * Copy over all members from obj and create corresponding chain-style
         * wrapping function.
         */
        init: function(obj){
            this._0_target = obj;
            var type;
            for(var name in obj){
                type = Object.prototype.toString.call(obj[name]).toUpperCase();
                if (type.indexOf('FUNCTION') > 0){
                    this[name] = wrappers.func(obj, name);
                }
                else{
                    this[name] = wrappers.prop(obj, name);
                }
            }
        }
    };
    
    var wrapperCtor = function(obj){
        wrapperPrvt.init.call(this, obj);
    };
    
    wrapperCtor.prototype = {
        _0_rebuild: function(){
            wrapperPrvt.init.call(this, this._0_target);
            return this;
        }
    };
    
    etui.chn = chn;
    
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
		var p = null, tmp = null;
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
