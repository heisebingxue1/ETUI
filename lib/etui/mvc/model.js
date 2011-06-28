/*!require: etui.mvc */
!function($, mvc, undef){
    'use strict';
    
    /**
     * Private methods
     **/
    var prvt = {
        fireUpdate: function(){
            this.onUpdate();
        },
        isUpdatable: function(){
            /* check if value is another model
             * if it is, make sure the update event will
             * bubbling up */
            if (!(value instanceof model) ||
                $.type(value.onUpdate) !== 'function'){
                return false;
            }
            
            return true;
        },
        tryAddModel: function(model){
            if (!prvt.isUpdatable(model)){
                return false;
            }
            value.onUpdate.hook(this._fireUpdate);
            
            // push model to submodel array for later unhooking 
            this._subModels.push(model);
            
            return true;
        },
        tryRemoveModel: function(model){
            if (!prvt.isUpdatable(model)){
                return false;
            }
            var l = this._subModels.length,
                lModel;
            while(l--){
                lModel = this._subModels[l];
                if (lModel === model){
                    // found it! 
                    
                    // unhooking event
                    model.onUpdate.unhook(this._fireUpdate);
                    
                    // remove it from cache
                    this._subModels.splice(l, 1);
                    return true;
                }
            }
            return false;
        }
    };
    
    /**
     * Constructor
     **/
    var model = etui.ctor(function(){
        
        /**
         * Public Members
         **/
        // data holder
        this.data = {};
        
        /**
         * Private Members
         **/
        this._fireUpdate = prvt.fireUpdate.bind(this);
        
        this._subModels = [];
        
        /**
         * Events
         **/
        this.onUpdate = etui.event();
        
        
    });
    
    var p = model.prototype;
    
    /**
     * Public methods
     **/
    p.set = function(name, value){
        
        if (name === undef){
            return;
        }
        
        if (value != null){
            // try add it as model
            prvt.tryAddModel.call(this, value);
        }
        else{
            // try remove it from subModels
            prvt.tryRemoveModel.call(this, this.data[name]);
        }
        
        this.data[name] = value;
        
        this._fireUpdate();
    };
    p.get = function(value){
        
    };
    
    mvc.model = model;
}(jQuery, etui.mvc);

