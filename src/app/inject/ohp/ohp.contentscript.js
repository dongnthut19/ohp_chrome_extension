function chivicanWorker() {
    var self = this;

    function startLoading() {
        var strhtml = "<div class='background-mask'></div>";
        strhtml += "<div id='loading-bar-spinner'>";
        strhtml += "   <div class='spinner-icon'></div>";
        strhtml += "</div>";
        $("body").append(strhtml);
    }

    function removeLoading() {
        $(".background-mask").remove();
        $("#loading-bar-spinner").remove();
    }

    function addCartToDb() {
        window.chrome.storage.local.get("cvc-cart-storage", function (result) {
            if(result && result["cvc-cart-storage"])
            {
                var currentUserId = $("#hdCustomerId").val();
                result["cvc-cart-storage"].Id = currentUserId;
                $.ajax({
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    url: apiURL + "cart/savecart",
                    data: JSON.stringify(result["cvc-cart-storage"]),
                    success: function (data, textStatus, xhr) {
                        window.chrome.storage.local.set({ 'cvc-cart-storage': null });
                        window.location.reload();
                     },
                     error: function (xhr, textStatus, errorThrown) {
                         console.log('Error in Operation');
                     }
                });
            }
        });
    }

    function addCartToDb1688() {
        window.chrome.storage.local.get("cvc-cart-storage", function (result) {
            if (result && result["cvc-cart-storage"]) {
                var currentUserId = $("#hdCustomerId").val();
                var apiURI = apiURL + "cart/savecart1688";
                console.log('apiURI = ', apiURI);
                $.ajax({
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    url: apiURI,
                    data: JSON.stringify({
                        CustomerId: currentUserId,
                        CartProductFor1688Dto: result["cvc-cart-storage"]}),
                    beforeSend: function () {
                        startLoading();
                    },
                    success: function (data, textStatus, xhr) {
                        removeLoading();
                        window.chrome.storage.local.set({ 'cvc-cart-storage': null });
                        window.location.reload();
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.log('xhr = ', xhr);
                        removeLoading();
                        window.chrome.storage.local.set({ 'cvc-cart-storage': null });
                        // window.location.reload();
                    }
                });
            }
        });
    }

    /**
        * initialize the app
        */
    self.initialize = function () {
        $(document).ready(function(){
            addCartToDb1688();
        });
    };
}

var chivicanCs = new chivicanWorker();
chivicanCs.initialize();