/*!require: etui */

/**
 * @namespace etui.n
 * contains all extension methods for native javascript objects
 */
 
/**
 * @function etui.n
 * attach helpers according to the type of obj
 **/
etui.n = function(obj){
    var n = etui.n,
        typ = n.type(obj),
        creator = n[typ];
        
    if (creator != null && n.type(creator) === 'Function'){
        return creator(obj);
    }
    
    return obj;
};

/**
 * @function type
 * return the actual type of object
 */
!function(n){
    n.type = function(obj){
        var typ = Object.prototype.toString.call(obj);
        var closingIndex = typ.indexOf(']');
        return typ.substring(8, closingIndex);
    };
}(etui.n);