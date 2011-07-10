/*!require: etui.mvc */
!function($, mvc, undef){
    'use strict';
    var view = etui.ctor(function(model){
        if (!(model instanceof mvc.model)){
            throw "etui.mvc.View: model is not instanceof etui.mvc.model"
        }
        
        model.bind(this);

    }, etui.Base);

    var p = view.prototype;

    p.refresh = function(){

        if (this._refresh){
            this._refresh();
        }
    };

    mvc.View = view;
}(jQuery, etui.mvc);

