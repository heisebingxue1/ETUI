/*!require:hacks */
/* Root namespace for etui */
var etui = {};

etui.ver = isNaN("/*@=VERSION */" * 1) ?0:"/*@=VERSION */" * 1;

/**
 * @function noop
 * do nothing
 **/
etui.noop = function(){};

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
                base.prototype.__core__.wrapper != null) {
                coreInfo.base = base.prototype.__core__.wrapper;
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
 * @function: observable
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

    var observableCtor = function(retFunc) {

        var result = null;
        var ret = retFunc?function(){
                try{
                    return retFunc.apply(this, arguments)
                }
                finally{
                    invokeFunc.apply(ret, arguments);
                }
            }:function(){
                return invokeFunc.apply(ret, arguments);
            };

        ret.head = newBox();

        // init head node
        ret.head.ref = etui.noop;

        // point cursor to head
        ret.cur = ret.head;

        // hook a func
        ret.hook = hookFunc;
        // unhook a func
        ret.unhook = unhookFunc;

        return ret;
    };

    etui.observable = observableCtor;
}();

/**
 * @function: event
 * Create a event-like delegate object, supports multicast

 * sample:
 * Create a observable object:
 * obj.onMouseDown = etui.event();
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
etui.event = function(){
    return etui.observable();
};

/**
 * @function prop
 * Property creator.
 *
 * It returns a function. when called with parameter,
 * it is considered as 'setting', then setter will be invoked in current
 * context and the value to be set will be passed in as is.
 *
 * when called without parameter or the first parameter is undefined,
 * it is considered as 'getting', then getter will be invoked in current
 * context and the return value of getter will be returned.
 *
 **/
!function(undef){
    etui.prop = function(getter, setter){
        var ret = function(value){
            if (value === undef){
                return getter.apply(this);
            }
            else{
                return setter.apply(this, arguments);
            }
        };

        return ret;
    };
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
        if (!source.hasOwnProperty(key)){
            continue;
        }

        target[key] = source[key]
    }

    return target;
};
