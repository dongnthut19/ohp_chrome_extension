
function taobaoWorker() {
    var self = this;
    var $taobaoToolbar;
    var $taobaoContainerPrice;
    var listPropSelected = [];

    function checkSelectedProp(alertArea) {
        listPropSelected = [];
        var areaProductProp = $("#J_isSku");
        var listProp = $("#J_SKU").find("dl");
        var isSelectEnoughProp = false;
        if (listProp.length > 0) {
            var countCheck = 0;
            listPropSelected = [];
            listProp.each(function () {
                var itemProp = {};
                var listSubProp = $(this).find("li.J_SKU");
                var propTitle = $(this).find("dt");
                itemProp.propTitle = propTitle["0"].innerText;
                for (var i = 0; i < listSubProp.length; i++) {
                    var owner = listSubProp[i];
                    if (owner.className.indexOf("tb-selected") > -1) {
                        countCheck++;
                        var propValue = owner.lastElementChild.lastElementChild.innerText;
                        itemProp.propValue = propValue;
                        break;
                    }
                }
                if (countCheck === listProp.length)
                    isSelectEnoughProp = true;
                listPropSelected.push(itemProp);
            });
        }
        else
        {
             return true;
        }
        if (!isSelectEnoughProp) {
            areaProductProp.addClass('invalid-prop');
            alertArea.html("Bạn phải chọn đầy đủ thuộc tính cho sản phẩm.").show();
            setTimeout(function () {
                alertArea.hide();
            }, 7000);
            $("html,body").animate({ scrollTop: $("#J_isSku")[0].offsetTop }, 1000);
            return false;
        }
        else
            return true;
    }

    /* ------------ Cached DOM ------------ */
    function loadToolbar() {
        $.get(chrome.runtime.getURL('app/assets/template/toolbar-taobao.html'), function (toolbarHtml) {
            /* set cached global dom */
            $taobaoToolbar = $(toolbarHtml);
            $("body").append($taobaoToolbar);
            var buttonAddCart = $taobaoToolbar.find("#tbe-btn-submit");
            var alertArea = $taobaoToolbar.find("#tbe-warning-bar");
            /*event click of add cart button */
            buttonAddCart.click(function () {
                var isValidate = checkSelectedProp(alertArea);
                if (isValidate) {
                    var objProduct = {};
                    var productTitle = $("#J_Title h3.tb-main-title span.t-title");
                    var productPricePro = $("#J_PromoPrice .tb-rmb-num");
                    var quantity = $("#J_IptAmount");
                    var productImg = $("#J_ThumbView");
                    var shopName = $(".tb-shop-name h3 a");
                    objProduct.productTitle = productTitle["0"].innerText;
                    if (productPricePro.length > 0) {
                        objProduct.productPricePro = productPricePro["0"].innerText.replace("¥", "");
                    }
                    else {
                        productPricePro = $("#J_priceStd .tb-rmb-num span");
                        objProduct.productPricePro = productPricePro["0"].innerText;
                    }
                    objProduct.quantity = quantity["0"].value;
                    objProduct.productImg = productImg["0"].src;
                    objProduct.productLink = window.location.href;
                    objProduct.listProp = listPropSelected;
                    objProduct.shopName = shopName["0"].innerText;
                    objProduct.shopLink = shopName["0"].href;
                    cartHelp.flyingCart("J_ThumbView");
                    cartHelp.addCartToTabaoTmall(objProduct);
                }
                else
                    return false;
            });

            /* event  onclick of property product */
            var propProduct = $("#J_isSku .J_SKU");
            propProduct.click(function () {
                alertArea.html("<span class='text-white'><strong>Chú ý:</strong> Sản phẩm vừa được cập nhật giá theo thuộc tính đã chọn, vui lòng kiểm tra lại thông tin!</span>").show();
                setTimeout(function () {
                    alertArea.hide();
                }, 7000);
            });

            contentScriptHelper.loadClickRedirectToCvc();
            contentScriptHelper.loadTotalCart1688();
        });
    }

    function loadContainerPrice() {
        $.get(chrome.runtime.getURL('app/assets/template/container-price.html'), function (containerPriceHtml) {
            /* set cached global dom */
            $taobaoContainerPrice = $(containerPriceHtml);
            $("#J_Title").append($taobaoContainerPrice);
            $("#J_PromoWrap").ready(function () {
                ;
                $("#box-price").html(accounting.formatNumber(ndt_vnd));
                var pricePro = "";

                if ($("#J_PromoPrice .tb-rmb-num").text().replace("¥", "").trim() !== '') {
                    pricePro = $("#J_PromoPrice .tb-rmb-num").text().replace("¥", "").trim();
                }
                else if ($("#J_StrPrice .tb-rmb-num").text() !== '') {
                    pricePro = $("#J_StrPrice .tb-rmb-num").text().replace("¥", "").trim();
                }
                else if ($("#J_priceStd .tb-rmb-num").text() !== '') {
                    pricePro = $("#J_priceStd .tb-rmb-num").text().replace("¥", "").trim();
                }
                var parePricePro = parseFloat(pricePro);
                var priceVnd = parePricePro * ndt_vnd;
                $taobaoContainerPrice.find("b.tbe-rate.tbe-color-price").html(accounting.formatNumber(priceVnd));
            });
        });
    }

    /**
	* initialize the app
	*/
    self.initialize = function () {
        contentScriptHelper.initScript("app/assets/js/jquery/jquery.min.js");
        contentScriptHelper.initScript("app/assets/js/jquery/jquery-ui.min.js");
        $(document).ready(function () {
            contentScriptHelper.getExchangeRate();
            loadToolbar();
            loadContainerPrice();
        });

    };
}
var taobaoCs = new taobaoWorker();
taobaoCs.initialize();