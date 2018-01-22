// see http://developer.chrome.com/extensions/contextMenus.html for details  
var createMenuProp = {  
    "title" : "note",  
    visible: true,
    "onclick" : noteIt  
};  
  
chrome.contextMenus.create(createMenuProp, function() {
    console.log(chrome.runtime.lastError);
});  
  
function noteIt(info, tab) {  
    console.log(222);
} 