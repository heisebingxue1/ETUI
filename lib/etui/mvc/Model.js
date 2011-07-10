/*!require: etui.mvc.model */
!function($, mvc, undef){
    'use strict';
    /**
     * Initializers
     **/
    var init = {
        hookEvent: function(){
            this.onUpdate.hook(hndl.update);
        }
    };

    /**
     * Private methods
     **/
    var prvt = {
        refreshView: function(view){
            if (view && view.refresh ){
                view.refresh();
                return true;
            }

            return false;
        }
    };

    /**
     * Event Hanlders
     **/
    var hndl = {
        update: function(){
            // refresh bounded views
            var l = this._views.length,
                view;

            while(l--){
                view = this._views[l];
                prvt.refreshView(view);
            }
        }
    };

    /**
     * Constructor
     **/
    var model = etui.ctor(function(){
        /**
         * Private Members
         **/
        this._views = [];

        init.hookEvent.call(this);

    }, mvc.KeyValue);

    var p = model.prototype;

    /**
     * Public methods
     **/
    p.bind = function(view){
        // check if it is refreshable
        if (prvt.refreshView(view)){
            this._views.push(view);
        }
    };

    etui.mvc.Model = model;

}(jQuery, etui.mvc);
