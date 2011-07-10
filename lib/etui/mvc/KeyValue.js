/*!require: etui.mvc */
!function($, mvc, undef){
    'use strict';

    /**
     * Private methods
     **/
    var prvt = {
        fireUpdate: function(){
            this.onUpdate.apply(this, arguments);
        },
        fireCreate: function(){
            this.onCreate.apply(this, arguments);
        },
        fireDelete: function(){
            this.onDelete.apply(this, arguments);
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
    var keyValue = etui.ctor(function(){

        /**
         * Public Members
         **/
        // data holder
        this.data = {};

        /**
         * Private Members
         **/
        this._fireUpdate = prvt.fireUpdate.bind(this);
        this._fireCreate = prvt.fireCreate.bind(this);
        this._fireDelete = prvt.fireDelete.bind(this);

        this._subModels = [];

        /**
         * Events
         **/
         
        /* fire when any value changed */
        this.onUpdate = etui.event();
        
        this.onDelete = etui.event();
        this.onCreate = etui.event();


    });

    var p = keyValue.prototype;

    /**
     * Public methods
     **/
    p.set = function(name, value){

        if (value !== undef){
            // try add it as model
            prvt.tryAddModel.call(this, value);
        }
        else{
            // try remove it from subModels
            this.del(name);
        }
        if (this.data[name] == null){
            this._fireCreate(name);
        }
        this.data[name] = value;

        this._fireUpdate(name, value);
    };
    p.get = function(value){
        return this.data[name];
    };
    p.del = function(name){
        prvt.tryRemoveModel.call(this, this.data[name]);
        
        delete this.data[name];
        
        this._fireDelete(name);
        this._fireUpdate(name, undef);
    }

    mvc.KeyValue = keyValue;
}(jQuery, etui.mvc);

