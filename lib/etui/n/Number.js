/*!require: etui.n */

!function(){
	"use strict";
	var prvt = {};
	
	/**
	 * @function etui.n.Number
	 * The Number object builder, copy over all our number helper to
	 * the instance
	 * 
	 * @usage var foo = 123;
	 * etui.n.Number(foo).toCurrency();
	 * 
	 */
	etui.n.Number = function(num){
		num = new Number(num);
		etui.clone(num, prvt);
		return num;
	};
	
    /**
     * @function toCurrency
     * Return a string that with commas seperated every 3 char.
     *
     * @return {String} a string that represent the number and seperated with commas every 3 chars.
     */
    prvt.toCurrency = function(fixedLength){
		if (!fixedLength || isNaN(fixedLength * 1) ){
			fixedLength = 2;
		}
        var formated = this.toFixed(fixedLength);
        var floatIndex = formated.indexOf('.');
        var chars = formated.split('');

        for(var i = 0; i < chars.length; i++){
            if (i >= floatIndex - 1){
                break;
            }

            if ((floatIndex - 1 - i) % 3 == 0)
                chars[i] = chars[i] + ',';
        }

        formated = chars.join('');
        return formated;
    };
}();
