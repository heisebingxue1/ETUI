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

