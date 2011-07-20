/*!require: etui*/
/**
 * @class: steps
 * An async step helper.
 * 
 * Well organize your code when calling nested async operation.
 * 
 * sample:
 * 
 * // original code:
 * function step3(){
 * 		console.log('all done');
 * }
 * function step2(){
 * 		asyncCall2(step3);
 * }
 * function step1(){
 * 		asyncCall1(step2);
 * }
 * 
 * // optimized code
 * var s = new Steps();
 * s.step(function step1(){
 * 		asyncCall1(this.go);
 * });
 * s.step(function step2(){
* 		asyncCall2(this.go);
 * });
 * s.step(function step3(){
 * 		this.go();
 * });
 * s.go();
 * 
 * 
 **/
!function(undef){
	var steps = function(){
	
		this.steps = [this._createNode(function(){
			this.next();
		})];
		this.cursor = this.steps[0];
		
		// wrap go(), make sure the context of go() is always current
		// instance
		this.go = this.go.bind(this);
		this.defer = this.defer.bind(this);
	};
	var sp = steps.prototype;
	sp._createNode = function(callback, next){
		if (next === undef){
			next = null;
		}
		var ret = {callback: callback, next: next};
		return ret;
	};
	/**
	 * @function step
	 * define a step
	 **/
	sp.step = function(callback){
		var stepStruct = this._createNode(callback);
		this.steps[this.steps.length - 1].next = stepStruct;
		this.steps.push(stepStruct);
		
		// if already called go(), this.cursor will pointed to null
		// repoint it so this.next() can continue calls the newly added
		// steps
		if (this.cursor == null){
			this.cursor = stepStruct;
		}
		
		return this;
	};
	/**
	 * @function go
	 * Start next step immediately
	 **/
	sp.next = function(){
		
		var callback;
		
		if (this.cursor == null){
			return this;
		}
		
		callback = this.cursor.callback;
		
		if (callback == null){
			return this;
		}
		
		// advance to next
		this.cursor = this.cursor.next;

		callback.apply(this, arguments);
		
		return this;
	};
	/**
	 * @function go
	 * Start next step immediately 
	 * (this function will always be executed
	 * with context pointed to current instance of steps)
	 **/
	sp.go = function(){
		return this.next.apply(this, arguments);
	};
	/**
	 * @function go
	 * Start next step when code execution thread idle
	 * (this function will always be executed
	 * with context pointed to current instance of steps)
	 **/
	sp.defer = function(){
		setTimeout(this.go, 0);
		return this;
	};
	
	etui.steps = steps;
}();
