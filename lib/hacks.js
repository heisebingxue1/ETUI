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
