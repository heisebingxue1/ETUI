/*!require: etui */
!function(){
	etui.debug = {};
	
	etui.debug.log = window.console? function(msg){
		console.log(msg);
	}: etui.noop;
	
	etui.debug.ERR_ARG_NULL = function(msg){
		if (msg == null){
			msg = 'One of the arguments cannot be null or undefined.'
		}
		return new Error(msg);
	}
}();