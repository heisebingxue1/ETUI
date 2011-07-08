/*!require: etui.mvc.Model */
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
    var vmodel = etui.ctor(function(){
        /**
         * Private Members
         **/
        this._views = [];

        init.hookEvent.call(this);

    }, mvc.Model);

    var p = vmodel.prototype;

    /**
     * Public methods
     **/
    p.bind = function(view){
        // check if it is refreshable
        if (prvt.refreshView(view)){
            this._views.push(view);
        }
    };

    etui.mvc.ViewModel = vmodel;

}(jQuery, etui.mvc);
