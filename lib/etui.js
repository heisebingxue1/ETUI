/*!require: */
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
