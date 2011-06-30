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
        var formated = this.valueOf() + '';
        var floatIndex = formated.indexOf('.');
        var chars = formated.split('');
		var delimiterIndex, len = chars.length;
		
        for(var i = 0; i < len; i++){
			// don't put commas to the end
			if (i >= len - 1) continue;
			if (i < floatIndex - 1){
				delimiterIndex = (floatIndex - 1 - i);
				if (delimiterIndex != 0 && delimiterIndex % 3 == 0)
					chars[i] = chars[i] + ',';
            }
            else if (i > floatIndex - 1){
				delimiterIndex = (i - floatIndex);
				if (delimiterIndex != 0 && delimiterIndex % 3 == 0)
					chars[i] = chars[i] + ',';
			}
        }
		
        formated = chars.join('');
        
        if (fixedLength != null){
			floatIndex = formated.indexOf('.');
			// this is for the dot
			var shift = (fixedLength> 0?1:0);
			
			formated = formated.substring(0, floatIndex + fixedLength + shift);
		}
        
        return formated;
    };
}();
