/*!require: etui.n */

!function(){
	"use strict";
	var fn = {};
	
	/**
	 * @function etui.n.String
	 * The String object builder, copy over all our helpers to
	 * the instance
	 * 
	 * @usage var foo = 'abc';
	 * etui.n.String(foo).toUpperCase(1,2);
	 * 
	 */
	etui.n.String = fn = function(str){
		str = new String(str);
		etui.clone(str, fn);
		return str;
	};
	
    /**
     * @function toUpperCase
     * Upper case specified substring
     *
     * @return {String} Upper cased string
     */
    fn.toUpperCase = function(startIndex, endIndex){
        if (startIndex == null && endIndex == null){
            return String.prototype.toUpperCase.call(this);
        }
        
        if (endIndex == null){
            endIndex = this.length;
        }
        
        var substr = this.substring(startIndex, endIndex).toUpperCase();
        // concat and return
        return this.substring(0, startIndex) + substr + this.substring(endIndex, this.length);
    };
}();
