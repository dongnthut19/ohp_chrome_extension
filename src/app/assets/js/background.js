
/*------------------------------- Chrome Extension Listeners -------------------------------*/


chrome.browserAction.onClicked.addListener(function(tab) {

});


chrome.runtime.onInstalled.addListener(function() {
 

});

function sendMessageToContentScripts(tabId, message, sendResponse) {
    chrome.tabs.sendMessage(tabId, message, sendResponse);
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

    var tabId = sender.tab.id;
    var url = sender.tab.url;
    var func = message.func;
    if (func.indexOf('bg-', 0) > -1) {
        message.func = message.func.substring(3);
    }

    switch (func) {
     
    case 'bg-open-cart-page':
         window.chrome.tabs.create({ url: cartURL });
        break;
    
    default:
        break;
    }
    return true;
});

