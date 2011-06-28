/*!require: etui.mvc */
!function($, mvc, undef){
	'use strict';
	var controller = etui.ctor(function(){
		
		this.actions = {};
		
	});
	
	var p = controller.prototype;
	
	
	mvc.controller = controller;
}(jQuery, etui.mvc);

