function DoEntireFormat(event, eventType, elemId, rawInput, pattern, mask) {  
    // Error Handling 
   if(pattern.length != mask.length){
     throw new Error("data-format length must be equal to data-mask length");
   }
   // Don't break when the event gets fired unexpectedly.
   if(!rawInput || !mask || rawInput.length == 0 || rawInput.length > pattern.length + 1){
     if(mask){    
       return {
         value: mask,
         cursorPosition: 0,
       };
     } else{
       return {
         value: "",
         cursorPosition: 0,
       };
     }
   }
   
   var input = document.getElementById(elemId);
   var startPosition = input.selectionStart;
   var cursorPosition = startPosition - 1;
   var formatted = '';
   var toBeFormatted = '';  
   var moveCursor = true;
   // RegEx/data-format mattings
   var regExs = [
     {patternVal: "*", regEx: /^\d+$/},
     {patternVal: "a", regEx: /^[A-Z]+$/i},
     {patternVal: "A", regEx:  /[^a-z0-9]/gi},    
   ];  
   
   var i = 0;  
     
   if(event.inputType == 'insertText'){      
     formatted = rawInput.substring(0, cursorPosition);
     i = formatted.length;
     toBeFormatted = rawInput.substring(cursorPosition, pattern.length);
   } else if (event.inputType == 'deleteContentBackward'){
     formatted = rawInput.substring(0, cursorPosition);
     i = formatted.length;
     toBeFormatted = rawInput.substring(cursorPosition, pattern.length);
   } else if (event.inputType == 'insertFromPaste'){
     formatted = "";
     i = 0;
     toBeFormatted = rawInput.substring(0, pattern.length);
   }
 
   while(formatted.length < pattern.length){
       //The cursor will jump forward past up to 2 mask chararacters
       var patternChar = pattern[formatted.length];
       var nextPatternChar = pattern[formatted.length + 1];
       var nextNextPatternChar = pattern[formatted.length + 2];
       var matchingRegEx = regExs.filter(x => x.patternVal == patternChar);
       var nextCharMatchingRegEx = regExs.filter(x => x.patternVal == nextPatternChar);
       var nextNextCharMatchingRegEx = regExs.filter(x => x.patternVal == nextNextPatternChar);
       
       if(matchingRegEx.length == 1){
         //This character must be validated
         if(matchingRegEx[0].regEx.test(toBeFormatted[0])){
           formatted += toBeFormatted[0];
           toBeFormatted = toBeFormatted.substring(2, pattern.length);
         } else {
           if(formatted.length == cursorPosition){
             startPosition--;
           }
           formatted += mask[formatted.length];
           toBeFormatted = toBeFormatted.substring(2, pattern.length);          
         }
       } else {
         formatted += mask[formatted.length];
         if(nextCharMatchingRegEx.length == 1){
           if(nextCharMatchingRegEx[0].regEx.test(toBeFormatted[0])){
             toBeFormatted = toBeFormatted.substring(0, 1) + toBeFormatted.substring(2, pattern.length - formatted.length);
             formatted += toBeFormatted[0];
             toBeFormatted = toBeFormatted.substring(2, pattern.length - formatted.length);
             startPosition++;
           }
         } else if(nextNextCharMatchingRegEx.length == 1){
            if(nextNextCharMatchingRegEx[0].regEx.test(toBeFormatted[0])){
             formatted += mask[formatted.length];
             startPosition++;
             toBeFormatted = toBeFormatted.substring(0, 1) + toBeFormatted.substring(3, pattern.length - formatted.length);
             formatted += toBeFormatted[0];
             startPosition++;
             toBeFormatted = toBeFormatted.substring(2, pattern.length - formatted.length);            
           }  
         } else {
           toBeFormatted = toBeFormatted.substring(2, pattern.length - formatted.length); 
         }        
       }
   }
   
   return {
     value: formatted,
     cursorPosition: startPosition,
     moveCursor: moveCursor,
     eventType: eventType,
   };
 }
 
 
 
 document.querySelectorAll('[data-mask]').forEach(function(e) {
   function format(elem, eventType, event) {
     var result = DoEntireFormat(event, eventType, elem.id, elem.value, elem.getAttribute('data-format'), elem.getAttribute('data-mask'));    
     elem.value = result.value;
     
     var positionToMoveCursorTo = 0;
     if(result.moveCursor && result.cursorPosition){
       positionToMoveCursorTo = result.cursorPosition;
     } 
     
     if (elem.createTextRange && result.moveCursor) {
       var range = elem.createTextRange();
       range.move('character', positionToMoveCursorTo);
       range.select();
     } else if (elem.selectionStart && result.moveCursor) {      
       elem.setSelectionRange(positionToMoveCursorTo, positionToMoveCursorTo);
     }
   }
   e.addEventListener('input', function(event) {    
     format(e, 'input', event);
   });
   e.addEventListener('paste', function(event) {    
     format(e, 'paste', event);
   });
   format(e)
 });
 