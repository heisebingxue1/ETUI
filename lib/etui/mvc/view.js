/*!require: etui.mvc */
!function($, mvc, undef){
    'use strict';
    var view = etui.ctor(function(model){
        if (!(model instanceof mvc.model)){
        }
        
    }, etui.base);
    
    var p = view.prototype;
    
    p.refresh = function(){
    
        if (this._refresh){
            this._refresh();
        }
    };
    
    mvc.view = view;
}(jQuery, etui.mvc);

