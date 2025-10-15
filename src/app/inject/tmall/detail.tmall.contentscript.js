function tmallWorker() {
  var self = this;
  /* ------------ Cached DOM ------------ */
  var $tmallToolbar;
  var $tmallContainerPrice;
  var listPropSelected = [];

  function checkSelectedProp(alertArea) {
    listPropSelected = [];
    var areaProductProp = $("#tbpcDetail_SkuPanelBody");
    const listProp = document.querySelectorAll('[class*="skuItem"]');
    var isSelectEnoughProp = false;
    if (listProp && listProp.length > 0) {
      var countCheck = 0;
      listProp.forEach(function (element) {
        var itemProp = {};
        var listSubProp = element.querySelectorAll('[class*="valueItem"]');
        var propTitle = element.querySelectorAll('[class*="ItemLabel"]');
        itemProp.propTitle = propTitle[0]?.innerText || "";
        for (var i = 0; i < listSubProp.length; i++) {
          var owner = listSubProp[i];
          if (owner.className.indexOf("isSelected") > -1) {
            countCheck++;
            var skuValueName = owner.querySelectorAll('[class*="f-els-1"]');
            itemProp.propValue = skuValueName[0]?.innerText || "";
            break;
          }
        }
        if (countCheck === listProp.length) isSelectEnoughProp = true;
        listPropSelected.push(itemProp);
      });
    }
    if (!isSelectEnoughProp) {
      areaProductProp.addClass("invalid-prop");
      alertArea.html("Bạn phải chọn đầy đủ thuộc tính cho sản phẩm.").show();
      setTimeout(function () {
        alertArea.hide();
      }, 7000);
      if ($(".skuItem ").length > 0) {
        $("html,body").animate({ scrollTop: $(".skuItem")[0].offsetTop }, 1000);
      }

      return false;
    } else return true;
  }

  // rerun the Product's properties
  function foundElement() {
    const proProperties = {};

    // product title
    const lstProductTitle = document.querySelectorAll('[class*="mainTitle"]');
    proProperties.productTitle =
      lstProductTitle.length > 0 ? lstProductTitle["0"].innerText : "";

    // product quantity element
    const proQuantity = document.querySelectorAll('[class*="countValue"]');
    if (proQuantity.length > 1) {
      proProperties.quantity = proQuantity[1]?.value || 1;
    }
    // product link element
    proProperties.productLink = window.location.href;

    // product properties
    proProperties.listProp = listPropSelected;

    const rootElement = $("#root");
    const divInRoots = rootElement.find("div");

    var productPricePro = document.querySelectorAll('[class*="priceWrap"]');
    if (productPricePro.length > 1) {
      const price = productPricePro[0].querySelectorAll('[class*="text"]');
      proProperties.productPricePro = price[0]?.innerText || 0;
    }

    // product image
    const productImg = document.querySelectorAll('img[class*="mainPic"]');
    if (productImg.length > 0) {
      proProperties.productImg = productImg[0]?.src || "";
    }

    // shop name and links
    let shopName = document.querySelectorAll('[class*="shopName"]');
    let shopLink = document.querySelectorAll('[class*="detailWrap"]');
    if (shopName.length > 0) {
      proProperties.shopName = shopName[0]?.innerText || "";
    } else {
      shopName = document.querySelectorAll(
        '[class*="ShopHeaderNew--shopName"]'
      );
      proProperties.shopName = shopName[0]?.innerText || "";
    }

    if (shopLink.length > 0) {
      proProperties.shopLink = shopLink[0]?.href || "";
    } else {
      shopLink = document.querySelectorAll(
        '[class*="ShopHeaderNew--detailWrap"]'
      );
      proProperties.shopLink = shopLink[0]?.href || "";
    }

    return proProperties;
  }

  function loadToolbar() {
    $.get(
      chrome.runtime.getURL("app/assets/template/toolbar-taobao.html"),
      function (toolbarHtml) {
        /* set cached global dom */
        $tmallToolbar = $(toolbarHtml);
        $("body").append($tmallToolbar);
        var buttonAddCart = $tmallToolbar.find("#tbe-btn-submit");
        var alertArea = $tmallToolbar.find("#tbe-warning-bar");
        /*event click of add cart button */
        buttonAddCart.click(function () {
          const isValidate = checkSelectedProp(alertArea);
          if (!isValidate) return false;

          const objProduct = foundElement();
          cartHelp.flyingCart("." + objProduct.imgClassName);

          delete objProduct.imgClassName;
          cartHelp.addCartToTabaoTmall(objProduct);
        });

        /* event  onclick of property product */
        var propProduct = $("#J_DetailMeta .tb-key dl.tb-prop dd ul li");
        propProduct.click(function () {
          alertArea
            .html(
              "<span class='text-white'><strong>Chú ý:</strong> Sản phẩm vừa được cập nhật giá theo thuộc tính đã chọn, vui lòng kiểm tra lại thông tin!</span>"
            )
            .show();
          setTimeout(function () {
            alertArea.hide();
          }, 7000);
        });

        contentScriptHelper.loadClickRedirectToCvc();
        contentScriptHelper.loadTotalCart1688();
      }
    );
  }

  function loadContainerPrice() {
    $.get(
      chrome.runtime.getURL("app/assets/template/container-price.html"),
      function (containerPriceHtml) {
        /* set cached global dom */
        $tmallContainerPrice = $(containerPriceHtml);
        $("#J_DetailMeta .tb-detail-hd").append($tmallContainerPrice);
        $("#J_DetailMeta .tm-fcs-panel").ready(function () {
          $("#box-price").html(accounting.formatNumber(ndt_vnd));
          var pricePro = "";
          pricePro = $("#J_DetailMeta #J_PromoPrice .tm-price");
          if (pricePro.length > 0) {
            //co gia khuyen mai
            var priceTo = pricePro[0].innerText;

            var parePriceProTo = parseFloat(priceTo);
            var priceToVnd = parePriceProTo * ndt_vnd;
            $tmallContainerPrice
              .find("b.tbe-rate.tbe-color-price")
              .html(accounting.formatNumber(priceToVnd));
          } else {
            pricePro = $("#J_DetailMeta #J_StrPriceModBox .tm-price")
              .text()
              .replace("¥", "")
              .trim();
            var tranScatPrice = pricePro.split("-");
            if (tranScatPrice.length > 1) {
              var priceTo = tranScatPrice[0];
              var priceFrom = tranScatPrice[1];
              var parePriceProFrom = parseFloat(priceFrom);
              var priceFromVnd = parePriceProFrom * ndt_vnd;

              var parePriceProTo = parseFloat(priceTo);
              var priceToVnd = parePriceProTo * ndt_vnd;
              $tmallContainerPrice
                .find("b.tbe-rate.tbe-color-price")
                .html(
                  accounting.formatNumber(priceFromVnd) +
                    " - " +
                    accounting.formatNumber(priceToVnd)
                );
            } else {
              var parePricePro = parseFloat(tranScatPrice[0]);
              var priceVnd = parePricePro * ndt_vnd;
              $tmallContainerPrice
                .find("b.tbe-rate.tbe-color-price")
                .html(accounting.formatNumber(priceVnd));
            }
          }
        });
      }
    );
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
