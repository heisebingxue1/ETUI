/*!require: etui.mvc.model */
!function($, mvc, undef){
	
	var init = {
		hookEvent: function(){
			this.onUpdate.hook(hOnUpdate);
		}
	};
	
	/**
	 * Event Hanlders
	 **/
	
	function hOnUpdate(){
		// refresh bounded views
		var l = this._views.length,
			view;
			
		while(l--){
			view = this._views[l];
			view && view.refresh && view.refresh();
		}
	};
	
	var vmodel = etui.ctor(function(){
		/**
		 * Privates
		 **/
		this._views = [];
		
		init.hookEvent.call(this);
		
	}, mvc.model);
	
	var p = vmodel.prototype;
	
}(jQuery, etui.mvc);
