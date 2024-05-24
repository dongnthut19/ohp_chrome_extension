
function ContentScriptHelper() {
    var self = this;

    self.getExchangeRate = function () {
        $.getJSON(apiURL + "cart/GetExChangeRate", function (data) {
            ndt_vnd = data.ErrorMessage; alert(JSON.stringify(data));
        });
        /*$.ajax({
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    url: apiURL + "cart/GetExChangeRate",
                    success: function (data, textStatus, xhr) {
                        ndt_vnd = data.ErrorMessage;
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.log('Error in Operation');
                    }
                });*/
    };

    self.initScript = function(src) {

        var scriptObj = document.createElement('script');
        scriptObj.src = chrome.extension.getURL(src);
        document.getElementsByTagName('body')[0].appendChild(scriptObj);
    };

    self.initCss = function (src) {

        var scriptObj = document.createElement('link');
        scriptObj.href = chrome.extension.getURL(src);
        scriptObj.rel = "stylesheet";
        document.getElementsByTagName('body')[0].appendChild(scriptObj);
    };

    self.checkSidebarIsOpening = function () {

        var iframe = $('#v4sf-sidebar-container').length;
        return iframe > 0;
    };

    self.removeDuplicates = function (objectsArray) {
        var usedObjects = {};

        for (var i = objectsArray.length - 1; i >= 0; i--) {
            var email = objectsArray[i].email;
            if (!email)
                email = objectsArray[i];

            if (email.isValidEmail()){
                if (usedObjects[email]) {
                    objectsArray.splice(i, 1);

                } else {
                    usedObjects[email] = true;
                }
            }else{
                objectsArray.splice(i, 1);
            }
        }

        return objectsArray;
    };

    var toolbarStringResult = '';
    self.loadToolbarExtension = function(url, callbackFunction) {

        $.get(
            chrome.extension.getURL(url), function (htmlContent) {
                toolbarStringResult = htmlContent;
                callbackFunction(toolbarStringResult);
            });
    };

    function sortByTime(obj) {
        var result = obj;
        result.sort(function (a, b) {
            return new Date(a.StartDateTime).getTime() - new Date(b.StartDateTime).getTime();
        });
        return result;
    };

    self.loadClickRedirectToCvc = function () {
        var redirectCart = $("#tbe-btn-show-cart");
        redirectCart.click(function () {
           window.chrome.runtime.sendMessage({ func: 'bg-open-cart-page' });
        });
    };

    self.loadTotalCart = function(){
        var totalProduct = 0;
        window.chrome.storage.local.get("cvc-cart-storage", function (result) {
            if(result && result["cvc-cart-storage"])
            {
                var listCart = result["cvc-cart-storage"];
                for(var i=0; i < listCart.length; i++)
                {
                    if(listCart[i].CartProductDto.length > 0)
                    {
                        for (var index = 0; index < listCart[i].CartProductDto.length; index++) {
                            var product = listCart[i].CartProductDto[index];
                            totalProduct = parseInt(totalProduct) + parseInt(product.Quantity);
                        }
                    }
                }
            }
           $("#total-product").html(totalProduct); 
        });       
    };

    self.loadTotalCart1688 = function(){
        var totalProduct = 0;
        window.chrome.storage.local.get("cvc-cart-storage-1688", function (result) {
            if(result && result["cvc-cart-storage-1688"])
            {
                var listCart = result["cvc-cart-storage-1688"];
                for(var i= 0; i< listCart.length; i++)
                {
                    totalProduct = parseInt(totalProduct) + parseInt(listCart[i].Quantity);
                }
                $("#total-product").html(totalProduct); 
            }
        });        
    };
}

var contentScriptHelper = new ContentScriptHelper();

