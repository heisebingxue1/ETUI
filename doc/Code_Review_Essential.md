#Reviewing CSS and static file

1. Coding style

    1. Properly line-break.
    
    2. Class, id should always start with 'et-projectname' to avoid conflict. even if you are creating a common functional class which can be used across project, you still need to add 'et-' as a prefix in order to avoid conflict with css in 3rdparty header and footer.
    
    3. Use existing functional css class, such as et-clr.
    
    4. Use semantically correct class name, for example, when element is activated,
    the class name that gives element highlight style should be et-active

    5. Put '/* Module Name { */' before module block starts,
    /* Module Name } */ after module block ends.

    6. The root wrapper element of each page should have a UNIQUE id. Let's say our project name is foo and the page we are developing is bar, then the root wrapper shall be something like this: <div id='et-foo-bar' >blah</div>

    7. Becasuse of the nature of merging css and the ie 6 multiple id definition bug, the id should be named very carefully to make sure it is not used in the other pages.

    A bad case is when you named your element id as #et-badpart and you defined the style as #et-badpart.page1 { background-color: red; }, because of 'badpart' is too general. someone took it and use in in his page with a different class name, and defined it as #et-badpart.page2 { background-color: red; }, althought those 2 css definitions work fine on modern browser, the second defintion will be ignored by ie6.

    the solution would be: 
        1. Use class instead
        2. Be more specific. e.g et-projectname-whichpage-whatfunction

    8. Minimal the affection
    
    when adding a page specific css defintion, keep in mind that it should only affect the elemenet which place on your page.

    for example, when you trying to modify the textarea style on your page. you should always include the page id before the css defintion of textarea.

    bad: -> textarea { background-color: transparent}
    good: -> #et-projectname-pagename textarea { background-color: transparent }
    

2. iOS compatibilities
    
    1. Image size limitation:
    
        * JPEG 2 mega pixel
        
        * PNG/GIF 1024 * 1024 * 3
    
    2. 'Position: fixed' need to get fixed. (use webkit transform!)
    
    3. UI elements that combined by sprites will has gap between edges.

    4. Be careful font-size generally has 2 pixel larger then the one on mac or pc.
    
3. IE6 compatibilities
    
    For IE6, below degradations is acceptable
    
    1. No alpha transparecy on background (when using png8)
    
    2. -TBD-
    
#JavaScript

1. Coding style:
    
    * General
    
        1. Every statement ends with a semicolon ';', be careful when assign a function to a variable,
        a semi colon is needed as well after the ending bracket '}', otherwise you may accidentally 
        execute the function:
        
            var func = function $_func(){

                blahblah
                
                blah
                
                ...
                
            }; <-- semicolon is important!
            
            // think if anyone wrote some code like this:
            
            var func = function $_func(){
            
                blahblah
                
                blah
                
                ...
                
            }
            
            
            (function($){
            
                $.blahblah
                
            })(jQuery);
            
        what will happened when code was compressed?
        
        2. No global pollution, all variables go inside to a closure.
        
    * Naming Style
    
        1. lowerCamelCase
        
        2. UPPER_CASE_FOR_CONSTANTS
        
        3. _underlineBeforeVirtual
        
        4. Recommand to use ''var prvt = {}'' in your closure to holds all private methods.
        
        5. Small **simple** words for namespaces.
    
    * Comparing
    
        1. Use String.isNOE or String.isNOWS to check if a string is null or empty or whitespace,
        shall never use ``if (String) {} ``
        
            // detect if a string is empty or null is convinient when using 'if'
            // below code will never write '1' to console if str = null or str = ''
            
            str = ''
            if (str) { console.log(1); }
            
            // however, what about it is not a primitive string but a String Object?
            if (new String('')) { console.log(1);}

        2. Comparing if a variable is undefined should always reference to etui.undef rather than
        the original undefined.
            
            if (a === undefined ) { ... } // bad, people can over write undefined as it is not a keyword
            
            if (a === etui.undef ) { ... } // good, at least
            
            if (!etui.notdef(a)) { ... } // best
    
    * DOM
    
        1. All in-tree DOM operation (except operatoin on `<html />`) should be executed when/after DOM Ready.

2. Only functional CSS classes or HTMLs are allowed in JavaScript Code. Let's say:
    
    We are going to encapsulate the 'overlay' which display a masking alpha transparency
    layer on the top of page, this encapsulation should do the trick that displays the 
    marker and make sure it is covering the page no matter user 'scrolls', 'tabs' and 
    'clicks', so the logical that make sure marker is covering is essential and closely related
    to what people expect the overlay does, in this case, setting marker element's position
    to 'fixed' is one of the ways to implement and this is allowed in the code.
    
    For the other HTMLs that for decoration, the default value should be defined
    in constructor.opts.tmpl and all CSSs go to /css/ folder.

3. Correct dependencies, no circular references.
    -TBD- more detailed instruction

4. Function that is important to be loaded at the startup should not be placed under etui namespace,
    instead, they should under 'premier' namespace and should not depend on any function under etui 
    namespace (norm Jan26 2011: what about jQuery should we load it at startup?). so the script that 
    gets loaded in `<head />` won't be too much and block the downloading thread of browser.
    
5. Cross-browser compatibilies

    1. Use feature detection rather than browser detection when there is a method available:
    [[http://kangax.github.com/cft/]]

    2. iOS
        * Any `fixed` css property will not work on iOS browser, so think carefully and make sure the
        function won't broken on iOS, (one popular solution is to set translateY rather than top when
        onScroll).

6. jQuery
	
	1. Check jQuery.fn.length rather than check existance of jQuery wrapper object:
		* bad: -> `if (jQuery('#foo')) { blahblah }`
		* good: -> `if (jQuery('#foo').length) { blahblah }`
		
	2. Rethink selector syntax, when you found same subset of the selector formed
	a non-standard selector, and it is natively not supported by queryAllSelector().
	You may want to do those non-standard filtering later by using jQuery.fn.filter()
		* bad: -> `jQuery('#foo > .bar:visible')`
		* good: -> `jQuery('#foo > .bar').filter(':visible')`
		
	3. Hook event handler on root element when necessary. (use jQuery.fn.live())
	TBD: more details
	
		
	
        
#Process

__Content in this section may or may not applicable for pure front-end etui development, most of 
them applys to Englishtown internal project check in process.__

1. Every JavaScript commitment should contains a compressed version by using jsmin, the compressed 
    JavaScript file should be named in this format: [original name].min.js
    JSMin can be downloaded here: [[http://www.crockford.com/javascript/jsmin.html]]
    
    
