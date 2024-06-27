
function taobaoWorker() {
    var self = this;
    var $taobaoToolbar;
    var $taobaoContainerPrice;
    var listPropSelected = [];     
    
    function checkSelectedProp(alertArea) {  
        listPropSelected = [];      
        const listProp = document.querySelectorAll('[class*="SkuContent--skuItem"]');
        var isSelectEnoughProp = false;
        if (listProp.length > 0) {
            var countCheck = 0;
            listProp.forEach(function (element) {
                var itemProp = {};
                var listSubProp = element.querySelectorAll('[class*="SkuContent--valueItem"]');
                var propTitle = element.querySelectorAll('[class*="ItemLabel--labelText"]');
                itemProp.propTitle = propTitle[0]?.innerText || '';
                for (var i = 0; i < listSubProp.length; i++) {
                    var owner = listSubProp[i];
                    if (owner.className.indexOf("SkuContent--isSelected") > -1) {
                        countCheck ++;
                        var skuValueName = owner.querySelectorAll('[class*="SkuContent--valueItemText"]');
                        itemProp.propValue = skuValueName[0]?.innerText || '';
                        break;
                    }
                }
                if(countCheck === listProp.length)
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
            $("html,body").animate({scrollTop:$("#J_isku")[0].offsetTop}, 1000);
            return false;
        }
        else
            return true;
    }
    
    /* ------------ Cached DOM ------------ */
    function loadToolbar() {
        $.get(chrome.extension.getURL('app/assets/template/toolbar-taobao.html'), function (toolbarHtml) {
            /* set cached global dom */
            $taobaoToolbar = $(toolbarHtml);
            $("body").append($taobaoToolbar);
            var buttonAddCart = $taobaoToolbar.find("#tbe-btn-submit");
            var alertArea = $taobaoToolbar.find("#tbe-warning-bar");
            /*event click of add cart button */
            buttonAddCart.click(function () {
                var isValidate = checkSelectedProp(alertArea);
                if(isValidate)
                {
                    var objProduct = {};
                    var productTitle = document.querySelectorAll('[class*="ItemHeader--mainTitle"]');
                    var promotionPro = $("#J_PromoPriceNum");
                    var productPricePro = document.querySelectorAll('[class*="Price--priceText"]');
                    var quantity = document.querySelector('.countValueForPC');
                    var productImg = document.querySelectorAll('[class*="PicGallery--mainPic"]');
                    var productImageWrappClass = '';
                    var shopName = document.querySelectorAll('[class*="ShopHeader--title"]');
                    var shopLink = document.querySelectorAll('[class*="ShopHeader--board"]');
                    if(promotionPro.length > 0)
                    {
                        objProduct.productPricePro = promotionPro["0"]?.innerText || 0;
                    }
                    else
                    {
                        if (productPricePro.length > 0) {
                            objProduct.productPricePro = productPricePro[0]?.innerText || 0;
                        }
                    }
                    if (productTitle.length > 0) {
                        objProduct.productTitle = productTitle[0]?.innerText || "";
                    }
                    objProduct.quantity = quantity?.value || 1;
                    if (productImg.length > 1) {
                        productImageWrappClass = productImg[0]?.className;
                        objProduct.productImg = productImg[1]?.src || "";
                    }
                    objProduct.productLink = window.location.href;
                    objProduct.listProp = listPropSelected;

                    if (shopName.length > 0) {
                        objProduct.shopName = shopName[0]?.innerText || "";
                    }
                    else {
                        shopName = document.querySelectorAll('[class*="ShopHeaderNew--shopName"]');
                        if (shopName.length > 0) {
                            objProduct.shopName = shopName[0]?.innerText || "";
                        }
                        else {
                            shopName = document.querySelectorAll('[class*="ShopHeader--shopName"]');
                            objProduct.shopName = shopName[0]?.innerText || "";
                        }
                    }

                    if (shopLink.length > 0) {
                        objProduct.shopLink = shopLink[0]?.href || "";
                    }
                    else {
                        shopLink = document.querySelectorAll('[class*="ShopHeaderNew--detailWrap"]');
                        if (shopLink.length > 0) {
                            objProduct.shopLink = shopLink[0]?.href || "";
                        }
                        else {
                            shopLink = document.querySelectorAll('[class*="ShopHeader--detailWrap"]');
                            objProduct.shopLink = shopLink[0]?.href || "";
                        }
                    }

                    cartHelp.flyingCart(`.${productImageWrappClass}`);
                    cartHelp.addCartToTabaoTmall(objProduct);
                }
                else
                    return false;
            });
            
            /* event  onclick of property product */
            var propProduct = $("#J_isku dl.J_Prop ul li");
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
        $.get(chrome.extension.getURL('app/assets/template/container-price.html'), function (containerPriceHtml) {
            /* set cached global dom */
            $taobaoContainerPrice = $(containerPriceHtml);
            $("#J_Title").append($taobaoContainerPrice);
            $("#J_PromoWrap").ready(function () {
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
        $(document).ready(function () {
            contentScriptHelper.getExchangeRate();
            loadToolbar();
            loadContainerPrice();
        });
        
    };
}
var taobaoCs = new taobaoWorker();
taobaoCs.initialize();