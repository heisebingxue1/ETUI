/*!require: etui */

!function($){
	"use strict";
	var base = etui.ctor(function(){
		
		/**
		 * Public Members
		 **/
		this.dom = $('<div></div>');
		
		/**
		 * Private Members
		 **/
		this._domParent = null; 
		
		
	});
	
	var p = base.prototype;
	
	/**
	 * @function suspend
	 * @public
	 * suspend layout to avoid of triggering repaint and reflow
	 **/
	p.suspend = function(){
		// record the original place of current element
		this._originalNext = this.dom.next();
		if (this._originalNext == null || this._originalNext.length <= 0){
			this._originalParent = this._dom.parent();
		}
		
		this.dom.css('display', 'none').detach();
	};
	
	/**
	 * @function resume
	 * @public
	 * resume suspended layout
	 **/
	p.resume = function(){
		if (this._originalNext != null
			&& this._originalNext.length > 0){
			this._originalNext.before(this._dom);
		}
		else if (this._originalParent != null
			&& this._originalParent.length > 0){
			this._originalParent.append(this._dom);
		}
		else{
			throw "Original hierachical position cannot be determined.";
		}
	};
}(jQuery, undef);
