/*!require: etui , etui.debug */
!function(window,undefined){
    'use strict';
    
    /**
     * Syntax Parser
     **/

    var rgxs = {
        LAST_BRACES: /\((.*?)\)$/,
        LAST_BRACKETS: /\[.*?\]$/,
        LAST_PROP: /\.(\w+)$/
    };

    var getSyntaxErr = function(code, innerErr){
        var ret = new Error("MWM binding syntax error, at: " + code);
        ret.innerErr = innerErr;
        return ret;
    };
    /**
     * @function syntaxParser parse a string which considered as member syntax
     * and return its info
     **/
    var syntaxParser = function(syntax){
        var ret = {
            isFunc: false,
            isArr: false,
            isProp: false,
            args: []
        };
        var strArgs, rgxResult;
        ret.isFunc = rgxs.LAST_BRACES.test(syntax);
        ret.isArr = rgxs.LAST_BRACKETS.test(syntax);
        if (ret.isFunc){
            ret.name = syntax.replace(rgxs.LAST_BRACES,'');
            // get hard coded arguments
            rgxResult = rgxs.LAST_BRACES.exec(syntax);
            if (rgxResult.length > 1){
                strArgs = rgxResult[1];

                // TODO: check if the syntax in strArgs is correct?

                // including "" and whitespaces
                if (strArgs != null && strArgs != false){
                    strArgs = '[' + strArgs + ']';
                    try{
                        ret.args = window.JSON?JSON.parse(strArgs):etui.gEval(strArgs);
                    }
                    catch(ex){
                        throw getSyntaxErr(strArgs);
                    }
                }
            }
        }
        if (ret.isArr){
            ret.name = syntax.replace(rgxs.LAST_BRACKETS,'');
        }
        if (!ret.isFunc && !ret.isArr){
            ret.isProp = true;
            ret.name = syntax;
        }
        
        // TODO: check if there is unexpected chars in .name
        
        return ret;
    };

    var mwm = {};
    
    var prvt = {
        /**
         * @function updateTarget
         * invoke or subscribe to  the target according to the given value
         **/
        updateTarget: function(value){
            var args = [], cursor, type, tmp;
            var i, l = this.maps.length;
            if (l <= 0){
                // if there is no maps function
                // simply put the value into args
                args.push(value);
            }
            
            for(i = 0; i < l; i++ ){
                cursor = this.maps[i];
                type = etui.n.type(cursor);
                if (type === 'String'){
                    args.push(cursor);
                }
                else if(type === 'Function'){
                    try{
                        tmp = cursor.call(this.source, value);
                    }
                    catch(ex){
                        tmp = null
                    }
                    finally{
                        args.push(tmp)
                    }
                }
            }
            prvt.evalTarget(this.target, this.to, args);
        },
        /**
         * @function evalTarget
         * @params args the arguments to be passed to the member of target.
         */
        evalTarget: function(target, fullSyntax, args){
            var members = fullSyntax.split('.'),
                len = members.length,
                member, cursor, parent, memberInfo;
            memberInfo = syntaxParser(members[0]);

            cursor = prvt.evalMember(target, memberInfo, 1 >= len ?args:null );

            for(var i = 1; i < len && cursor != null; i++){
                member = members[i];
                memberInfo = syntaxParser(member);

                parent = cursor;
                cursor = prvt.evalMember(parent, memberInfo, i >= len - 1? args: null);
            }

            return cursor;
        },
        /**
         * @param args: if set, means it is the last member, need to be called with specified arguments
         * or be assigned
         */
        evalMember: function(target, memberInfo, args){
            if (memberInfo.isProp){
                if (args != null){
                    target[memberInfo.name] = args[0];
                }
                return target[memberInfo.name]
            }
            else if(memberInfo.isFunc){
                if (args == null){
                    args = [];
                }
                
                if (memberInfo.args != null && memberInfo.args.length > 0){
                    args = memberInfo.args.concat(args);
                }
                return target[memberInfo.name].apply(target, args)
            }
            else if(memberInfo.isArr){
                // TODO
                return null
            }
        }
    };
    
    var hndl = {
        obUpdate: function(){
            prvt.updateTarget.apply(this, arguments);
        }
    };

    /**
     * @function bind bind the view according to binding rule
     **/
    mwm.bind = function(target,source,binding){        
        var cursor, data, to, from, maps;
        
        if (binding == null || !binding){
            throw etui.debug.ERR_ARG_NULL;
        }
        
        if (binding == null){
            binding = [];
        }
        else if (etui.n.type(binding) !== 'Array'){
            binding = [binding];
        }
        
        for(var l = binding.length; l--;){
            cursor = binding[l],
                to = cursor.to,
                from = cursor.from,
                maps = cursor.map || cursor.maps;
            
            // normalize
            if (maps == null){
                maps = [];
            }
            else if(etui.n.type(maps) !== 'Array') {
                maps = [maps];
            }
            
            data = {to: to, 
                from: from, 
                maps: maps, 
                target: target, 
                source: source};
            
            var toBeBound = source[from];
            if (toBeBound){
                // check it is to be bound
                if (toBeBound && toBeBound.hook && toBeBound.unhook
                    && etui.n.type(toBeBound) === 'Function'
                    && etui.n.type(toBeBound.hook) === 'Function'){
                    toBeBound.hook(hndl.obUpdate.bind(data));
                    
                    // call inner hooked function to trigger obUpdate to update the view
                    toBeBound.invoke.call(source, toBeBound());
                }
                else{
                    // subscribe to the event
                    prvt.updateTarget.call(data, toBeBound);
                }
            }
            else{
                // TODO: throw?
            }

        }
    };
    
    etui.mwm = mwm;
}(window);