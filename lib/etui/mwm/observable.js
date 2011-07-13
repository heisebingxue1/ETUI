/*!require: etui.mwm */
!function(){
	function getter(data){
		return data.value;
	}
	/**
	 * @param data: contains the ref to observable and the value
	 * @param value: the value to be changed to.
	 */
	function setter(data, value){
		data.value = value;
		
		// only trigger when set
		data.prop.invoke.call(this, value)
	}
    var observable = function(){
		var data = {
			value:null
		};
        var prop = etui.prop(getter.bind(prop, data),
			setter.bind(prop, data));
		data.prop = prop;
        etui.observable(prop);
        return prop;
    };
    
    etui.mwm.observable = observable;
    
    // an alias make it short
    etui.mwm.ob = observable;
}();