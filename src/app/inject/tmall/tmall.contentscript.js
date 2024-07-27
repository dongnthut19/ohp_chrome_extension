
function tmallWorker() {
    var self = this;
    /* ------------ Cached DOM ------------ */
    var $tmallToolbar;
    var $tmallContainerPrice;
    var listPropSelected = [];

    function checkSelectedProp(alertArea) {
        listPropSelected = [];
        var areaProductProp = $("#J_DetailMeta .tb-key");
        var listProp = areaProductProp.find("dl.tm-sale-prop");
        var isSelectEnoughProp = false;
        if (listProp && listProp.length > 0) {
            var countCheck = 0;
            listPropSelected = [];
            listProp.each(function () {
                var itemProp = {};
                var listSubProp = $(this).find("dd ul li");
                var propTitle = $(this).find("dt");
                itemProp.propTitle = propTitle["0"].innerText;
                for (var i = 0; i < listSubProp.length; i++) {
                    var owner = listSubProp[i];
                    if (owner.className.indexOf("tb-selected") > -1) {
                        countCheck++;
                        var propValue = owner.children[0].innerText;
                        itemProp.propValue = propValue;
                        break;
                    }
                }
                if (countCheck === listProp.length)
                    isSelectEnoughProp = true;
                listPropSelected.push(itemProp);
            });
        }
        if (!isSelectEnoughProp) {
            areaProductProp.addClass('invalid-prop');
            alertArea.html("Bạn phải chọn đầy đủ thuộc tính cho sản phẩm.").show();
            setTimeout(function () {
                alertArea.hide();
            }, 7000);
            $("html,body").animate({ scrollTop: $("#J_DetailMeta .tb-key")[0].offsetTop }, 1000);
            return false;
        }
        else
            return true;
    }

    function loadToolbar() {
        $.get(chrome.runtime.getURL('app/assets/template/toolbar-taobao.html'), function (toolbarHtml) {
            /* set cached global dom */
            $tmallToolbar = $(toolbarHtml);
            $("body").append($tmallToolbar);
            var buttonAddCart = $tmallToolbar.find("#tbe-btn-submit");
            var alertArea = $tmallToolbar.find("#tbe-warning-bar");
            /*event click of add cart button */
            buttonAddCart.click(function () {
                var isValidate = checkSelectedProp(alertArea);
                if (isValidate) {
                    var objProduct = {};
                    var productTitle = $(".tb-detail-hd h1");
                    var productPricePro;
                    var proTemp = $(".tm-promo-price .tm-price");
                    if(proTemp.length > 0)
                    {
                        productPricePro = $(".tm-promo-price .tm-price");
                    }
                    else if($("#J_StrPriceModBox dd span.tm-price") != null)
                    {
                        productPricePro = $("#J_StrPriceModBox dd span.tm-price");
                    }
                    //productPricePro = $(".tm-promo-price .tm-price");
                    var quantity = $("#J_Amount input.mui-amount-input");
                    var productImg = $("#J_ImgBooth");
                    var shopName = $("#J_DcShopArchive .shop-intro h3.hd a.shopLink");
                    objProduct.productTitle = productTitle["0"].innerText;
                    objProduct.productPricePro = productPricePro["0"].innerText.replace("¥", "");
                    objProduct.quantity = quantity["0"].value;
                    objProduct.productImg = productImg["0"].src;
                    objProduct.productLink = window.location.href;
                    objProduct.listProp = listPropSelected;
                    objProduct.shopName = shopName["0"].innerText;
                    objProduct.shopLink = shopName["0"].href;
                    cartHelp.flyingCart("J_ImgBooth");
                    cartHelp.addCartToTabaoTmall(objProduct);
                }
                else
                    return false;
            });

            /* event  onclich of property product */
            var propProduct = $("#J_DetailMeta .tb-key dl.tb-prop dd ul li");
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
            $tmallContainerPrice = $(containerPriceHtml);
            $("#J_DetailMeta .tb-detail-hd").append($tmallContainerPrice);
            $("#J_DetailMeta .tm-fcs-panel").ready(function () {
                $("#box-price").html(accounting.formatNumber(ndt_vnd));
                var pricePro = "";

                //detail.tmall
                if ($("#J_DetailMeta #J_StrPriceModBox .tm-price").text() !== '') {
                    pricePro = $("#J_DetailMeta #J_StrPriceModBox .tm-price").text().replace("¥", "").trim();
                    var tranScatPrice = pricePro.split("-");
                    if (tranScatPrice.length > 1) {
                        var priceTo = tranScatPrice[0];
                        var priceFrom = tranScatPrice[1];
                        var parePriceProFrom = parseFloat(priceFrom);
                        var priceFromVnd = parePriceProFrom * ndt_vnd;

                        var parePriceProTo = parseFloat(priceTo);
                        var priceToVnd = parePriceProTo * ndt_vnd;
                        $tmallContainerPrice.find("b.tbe-rate.tbe-color-price").html(accounting.formatNumber(priceFromVnd) + " - " + accounting.formatNumber(priceToVnd));
                    }
                    else {
                        var parePricePro = parseFloat(tranScatPrice[0]);
                        var priceVnd = parePricePro * ndt_vnd;
                        $tmallContainerPrice.find("b.tbe-rate.tbe-color-price").html(accounting.formatNumber(priceVnd));
                    }
                }
                else if ($("#J_DetailMeta #J_PromoPrice .tm-price").text() !== '') {//world.tmall
                    pricePro = $("#J_DetailMeta #J_PromoPrice .tm-price").text().replace("¥", "").trim();
                    var tranScatPrice = pricePro.split("-");
                    if (tranScatPrice.length > 1) {
                        var priceTo = tranScatPrice[0];
                        var priceFrom = tranScatPrice[1];
                        var parePriceProFrom = parseFloat(priceFrom);
                        var priceFromVnd = parePriceProFrom * ndt_vnd;

                        var parePriceProTo = parseFloat(priceTo);
                        var priceToVnd = parePriceProTo * ndt_vnd;
                        $tmallContainerPrice.find("b.tbe-rate.tbe-color-price").html(accounting.formatNumber(priceToVnd) + " - " + accounting.formatNumber(priceFromVnd));
                    }
                    else {
                        var parePricePro = parseFloat(tranScatPrice[0]);
                        var priceVnd = parePricePro * ndt_vnd;
                        $tmallContainerPrice.find("b.tbe-rate.tbe-color-price").html(accounting.formatNumber(priceVnd));
                    }
                }
            });
        });
    }

    /**
	* initialize the app
	*/
    self.initialize = function () {

        contentScriptHelper.initScript("app/assets/js/jquery/jquery.min.js");
        $(document).ready(function () {
            
            contentScriptHelper.getExchangeRate();
            loadToolbar();
            loadContainerPrice();
        });

    };
}
var tmallCs = new tmallWorker();
tmallCs.initialize();