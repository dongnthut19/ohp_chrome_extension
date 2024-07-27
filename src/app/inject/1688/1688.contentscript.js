function Worker1688() {
    var self = this;
    var $Toolbar1688;
    var $ContainerPrice1688;
    var minProduct = 0;
    var minPrice = 0;
    var tempLstProduct = []; // chỉ dành cho UI mới
    var siteName = "ohp.com";
    var siteLink = "http://ohp.com";
  
    function flyingCart() {
      var cart = $("#tbe-btn-show-cart");
      var imgtodrag = $(".box-img img");
      if (imgtodrag.length === 0) {
        imgtodrag = $(
          ".img-list-wrapper .detail-gallery-turn-wrapper img.detail-gallery-img"
        );
      }
      if (imgtodrag) {
        var imgclone = imgtodrag
          .clone()
          .offset({
            top: imgtodrag.offset().top,
            left: imgtodrag.offset().left,
          })
          .css({
            opacity: "0.5",
            position: "absolute",
            height: "150px",
            width: "150px",
            "z-index": "100",
          })
          .appendTo($("body"))
          .animate(
            {
              top: cart.offset().top + 10,
              left: cart.offset().left + 30,
              width: 75,
              height: 75,
              "z-index": 9999999999,
            },
            2000,
            "easeInOutExpo"
          );
  
        imgclone.animate(
          {
            width: 0,
            height: 0,
          },
          function () {
            $(this).detach();
          }
        );
      }
    }
  
    function addPropperty() {
      var listProducts = [];
      var areaProductProp = $(".mod-detail-purchasing .d-content");
      var alertArea = $Toolbar1688.find("#tbe-warning-bar");
      var leadingTitle = $(".d-content .obj-leading .obj-header .obj-title");
      var skduTitle = $(".d-content .obj-sku .obj-header .obj-title");
      var tableInfo = $(".obj-list .list-selected .list-info table.table-list");
      if (
        tableInfo.length > 0 &&
        tableInfo[0].children.length === 0 &&
        skduTitle.length > 0
      ) {
        //sản phẩm có thuộc tính nhưng chưa chọn thuộc tính sản phẩm
        areaProductProp.addClass("invalid-prop");
        alertArea.html("Bạn phải chọn đầy đủ thuộc tính cho sản phẩm.").show();
        setTimeout(function () {
          alertArea.hide();
        }, 7000);
        $("html,body").animate({ scrollTop: 500 }, 1000);
        return false;
      } else if (skduTitle.length === 0) {
        // sản phẩm không có thuộc tính
        var countProduct = 0;
        var skuArea = $(".d-content .obj-sku .obj-content table.table-sku tr");
        var objProduct = {};
        var listPropSelected = [];
        var productTitle = $("#mod-detail-title h1.d-title");
        if (productTitle === undefined) {
          productTitle = $(".title-first-column div.title-text");
        }
        var amount = $(
          ".d-content .unit-detail-amount-control input.amount-input"
        );
        var productImg = $(".box-img img");
        var shopName;
        if ($(".supplierinfo-common .company-name a").length > 0) {
          shopName = $(".supplierinfo-common .company-name a");
        } else if (
          $(".smt-info .content .abstract .nameArea a.name").length > 0
        ) {
          shopName = $(".smt-info .content .abstract .nameArea a.name");
        } else if (
          $(
            ".app-import_supplierInfoSmall .info .content .abstract .company a.name"
          ).length > 0
        ) {
          shopName = $(
            ".app-import_supplierInfoSmall .info .content .abstract .company a.name"
          );
        } else if ($(".logoContainer .logoName a").length > 0) {
          shopName = $(".logoContainer .logoName a");
        } else if (
          $("div#hd_0_container_0 div div div div div div div span").length > 0
        ) {
          shopName = $("div#hd_0_container_0 div div div div div div div span");
        }
        objProduct.ProductName = productTitle["0"].innerText;
        objProduct.Quantity = amount[0].value;
  
        objProduct.ToltalWeb = cartHelp.totalWeb(minPrice, amount[0].value);
        objProduct.TotalVnd = cartHelp.totalVND(minPrice);
        objProduct.ProductImage = productImg["0"].src;
        objProduct.ProductLink = window.location.href;
        objProduct.CartProductPropFor1688Dto = listPropSelected;
  
        if (shopName) {
          objProduct.ShopName = shopName["0"].innerText;
          objProduct.ShopLink = siteLink;
        } else {
          objProduct.ShopName = siteName;
          objProduct.ShopLink = siteLink;
        }
  
        objProduct.WebType = cartHelp.checkUrlWebType();
  
        listProducts.push(objProduct);
        countProduct += parseInt(objProduct.Quantity);
        if (countProduct >= minProduct) {
          alertArea.hide();
          saveCart(listProducts);
          flyingCart();
        } else {
          alertArea
            .html("Bạn phải mua ít nhất " + minProduct + " sản phẩm.")
            .show();
          setTimeout(function () {
            alertArea.hide();
          }, 7000);
          return false;
        }
      } else if (tableInfo.length > 0) {
        //có thuộc tính và chọn đấy đủ
        var countProduct = 0;
  
        //new code: update 30/11/2016
        var skuArea = $(".d-content .obj-sku .obj-content table.table-sku tr");
  
        for (var i = 0; i < tableInfo[0].children[0].children.length; i++) {
          var trCurrent = tableInfo[0].children[0].children[i];
          var tdPropLeading = trCurrent.children[0];
          var tdDesc;
          if (leadingTitle.length === 0) {
            tdDesc = trCurrent.children[1];
          } else {
            tdDesc = trCurrent.children[2];
          }
          var listLiProp = tdDesc.children[0].children;
          if (listLiProp.length > 0) {
            for (var j = 0; j < listLiProp.length; j++) {
              var liCurrent = listLiProp[j];
              var stringData;
              var objData;
  
              var objProduct = {};
              var listPropSelected = [];
              if (leadingTitle.length > 0) {
                stringData = liCurrent.attributes[0].nodeValue;
                objData = JSON.parse(stringData);
                var objLeading = {
                  PropLabel: leadingTitle[0].innerText,
                  PropValue: tdPropLeading.innerText,
                };
                listPropSelected.push(objLeading);
              } else {
                stringData = liCurrent.attributes[1].nodeValue;
                objData = JSON.parse(stringData);
              }
              var objSku = {
                PropLabel: skduTitle[0].innerText,
                PropValue: objData.skuName,
              };
              listPropSelected.push(objSku);
  
              var productTitle = $("#mod-detail-title h1.d-title");
              var productImg = $(".box-img img");
              var shopName;
              if ($(".supplierinfo-common .company-name a").length > 0) {
                shopName = $(".supplierinfo-common .company-name a");
              } else if (
                $(".smt-info .content .abstract .nameArea a.name").length > 0
              ) {
                shopName = $(".smt-info .content .abstract .nameArea a.name");
              } else if (
                $(
                  ".app-import_supplierInfoSmall .info .content .abstract .company a.name"
                ).length > 0
              ) {
                shopName = $(
                  ".app-import_supplierInfoSmall .info .content .abstract .company a.name"
                );
              } else if ($(".logoContainer .logoName a").length > 0) {
                shopName = $(".logoContainer .logoName a");
              } else if (
                $("div#hd_0_container_0 div div div div div div div span")
                  .length > 0
              ) {
                shopName = $(
                  "div#hd_0_container_0 div div div div div div div span"
                );
              }
  
              objProduct.ProductName = productTitle["0"].innerText;
              objProduct.Quantity = objData.amount;
  
              objProduct.ToltalWeb = cartHelp.totalWeb(minPrice, objData.amount);
              objProduct.TotalVnd = cartHelp.totalVND(minPrice);
              objProduct.ProductImage = productImg["0"].src;
              objProduct.ProductLink = window.location.href;
              objProduct.CartProductPropFor1688Dto = listPropSelected;
  
              if (shopName) {
                objProduct.ShopName = shopName["0"].innerText;
                objProduct.ShopLink = siteLink;
              } else {
                objProduct.ShopName = siteName;
                objProduct.ShopLink = siteLink;
              }
  
              objProduct.WebType = cartHelp.checkUrlWebType();
              for (var a = 0; a < skuArea.length; a++) {
                var skuAreaPropValue = skuArea[a].children[0].innerText;
                var skuAreaPropHeader = $(".obj-sku .obj-header .obj-title");
                var skuAreaPropPrice =
                  skuArea[a].children[1].children[0].children[0].innerText;
                if (listPropSelected.length > 1) {
                  if (
                    skuAreaPropHeader[0].innerText ===
                    listPropSelected[1].PropLabel &&
                    skuAreaPropValue === listPropSelected[1].PropValue
                  ) {
                    objProduct.PriceWeb = skuAreaPropPrice;
                  }
                } else {
                  if (
                    skuAreaPropHeader[0].innerText ===
                    listPropSelected[0].PropLabel &&
                    skuAreaPropValue === listPropSelected[0].PropValue
                  ) {
                    objProduct.PriceWeb = skuAreaPropPrice;
                  }
                }
              }
              listProducts.push(objProduct);
              countProduct += parseInt(objProduct.Quantity);
            }
          }
        }
        if (countProduct >= minProduct) {
          alertArea.hide();
          saveCart(listProducts);
          flyingCart();
        } else {
          alertArea
            .html("Bạn phải mua ít nhất " + minProduct + " sản phẩm.")
            .show();
          setTimeout(function () {
            alertArea.hide();
          }, 7000);
          return false;
        }
      }
    }
  
    function addPropertyForNewUI() {
      const noAffixWrapper = $(".no-affix-wrapper");
      var alertArea = $Toolbar1688.find("#tbe-warning-bar");
      const skuWrapper = $(".pc-sku-wrapper .sku-module-wrapper");
      const orderedWrapper = $(".order-price-wrapper");
  
      if (
        skuWrapper.length > 0 &&
        orderedWrapper.length === 0 &&
        noAffixWrapper.length > 0
      ) {
        //sản phẩm có thuộc tính nhưng chưa chọn thuộc tính sản phẩm
        noAffixWrapper.addClass("invalid-prop");
        alertArea.html("Bạn phải chọn đầy đủ thuộc tính cho sản phẩm.").show();
        setTimeout(function () {
          alertArea.hide();
        }, 7000);
        $("html,body").animate({ scrollTop: 500 }, 1000);
        return false;
      }
  
      if (skuWrapper.length > 0) {
        // sản phẩm có thuộc tính
        alertArea.hide();
        console.log("tempLstProduct = ", tempLstProduct);
        saveCart(tempLstProduct);
        flyingCart();
      }
    }
  
    function saveCart(listProduct) {
      var totalProductHtml = 0;
      window.chrome.storage.local.get("cvc-cart-storage", function (result) {
        if (result && result["cvc-cart-storage"]) {
          /* Nếu đã có sản phẩm trong giỏ hàng */
          var carts = result["cvc-cart-storage"];
          var tempCart = carts.concat(listProduct);
  
          for (var i = 0; i < tempCart.length; i++) {
            totalProductHtml =
              parseInt(totalProductHtml) + parseInt(tempCart[i].Quantity);
          }
          window.chrome.storage.local.set({ "cvc-cart-storage": tempCart });
          $("#total-product").html(totalProductHtml);
        } else {
          window.chrome.storage.local.set({ "cvc-cart-storage": listProduct });
          for (var i = 0; i < listProduct.length; i++) {
            totalProductHtml =
              parseInt(totalProductHtml) + parseInt(listProduct[i].Quantity);
          }
          $("#total-product").html(totalProductHtml);
        }
      });
    }
  
    function loadToolbar() {
      $.get(
        chrome.runtime.getURL("app/assets/template/toolbar-taobao.html"),
        function (toolbarHtml) {
          /* set cached global dom */
          $Toolbar1688 = $(toolbarHtml);
          $(document).ready(function () {
            $("body").append($Toolbar1688);
  
            // bắt sự kiện bấm nút tăng giảm số lượng (Chỉ dành cho UI mới)
            // addProductForNewUI();
  
            var buttonAddCart = $Toolbar1688.find("#tbe-btn-submit");
            /*event click of add cart button */
            buttonAddCart.click(function () {
              var newUIVersion = $("#recyclerview");
              if (newUIVersion.length > 0) {
                addPropertyForNewUI();
              } else {
                addPropperty();
              }
            });
  
            contentScriptHelper.loadClickRedirectToCvc();
            contentScriptHelper.loadTotalCart1688();
          });
        }
      );
    }
  
    function iconAddProductForNewUI($button) {
      setTimeout(() => {
        const listProp = [];
        const titleElement = $(
          ".od-pc-offer-title-contain .title-first-column .title-text"
        );
        const shopNameElement = $(
          "div#hd_0_container_0 div div div div div div div span"
        );
        const productImgs = $(
          ".img-list-wrapper .detail-gallery-turn-wrapper img.detail-gallery-img"
        );
        let productImage = "";
        if (productImgs.length > 0) {
          productImage = productImgs[0].attributes[2].nodeValue;
        }
  
        // tìm cặp sku 1
        const sku1Element = $(".pc-sku-wrapper .sku-module-wrapper .sku-prop-module-name");
        if (sku1Element.length > 0) {
          const skuName1 = sku1Element.length > 0 ? sku1Element[0].innerText : "";
          const skuValue1Element = $(".pc-sku-wrapper .sku-module-wrapper .prop-item-wrapper .prop-item .prop-item-inner-wrapper.active .prop-name");
          const skuValue1 = skuValue1Element.length > 0 ? skuValue1Element[0].innerText : "";
          if (skuValue1 !== "") {
            listProp.push({
              PropLabel: skuName1,
              PropValue: skuValue1,
            });
          }
        }
  
        // tìm cặp sku 2
        const parentNodeSkuName =
          $button.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
            .parentNode.parentNode.parentNode;
        const skuName = parentNodeSkuName.children[0].innerText;
        const parentNode =
          $button.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        const skuItemLeft = parentNode.children.length === 2 ? parentNode.children[0] : parentNode.children[1];
        let propPrice = 0;
        let propValue = "";
        if (skuItemLeft.children.length > 2) {
          propValue = skuItemLeft.children[0].innerText;
          propPrice = skuItemLeft.children[1].innerText.replace("元", "");
  
          if (propValue !== "") { 
            listProp.push({
              PropLabel: skuName,
              PropValue: propValue,
            });
          }
        }
        const quantityParentNode = $button.parentNode.parentNode.parentNode;
        const quantityInput = quantityParentNode.children[1].children[0];
        const quantity = quantityInput.value;
  
        let shopName = "";
        let shopLink = "";
        if (shopNameElement) {
          shopName = shopNameElement["0"].innerText;
          shopLink = siteLink;
        } else {
          shopName = siteName;
          shopLink = siteLink;
        }
  
        const objProduct = {
          ProductName: titleElement.length > 0 ? titleElement[0].innerText : "",
          Quantity: parseInt(quantity),
          ProductImage: productImage,
          ProductLink: window.location.href,
          ToltalWeb: cartHelp.totalWeb(propPrice, parseInt(quantity)),
          TotalVnd: cartHelp.totalVND(propPrice),
          PriceWeb: parseFloat(propPrice),
          CartProductPropFor1688Dto: listProp,
          ShopName: shopName,
          ShopLink: shopLink,
        };
  
        const checkExistLstProduct = JSON.parse(JSON.stringify(tempLstProduct));
        if (checkExistLstProduct.length > 0) {
          let isExist = false;
          for (let index = 0; index < checkExistLstProduct.length; index++) {
            const existProduct = checkExistLstProduct[index];
  
            // so sánh hai mảng, nếu trả về [] thì tức là hai mảng này có giá trị giống nhau
            const diff = _.differenceWith(
              existProduct.CartProductPropFor1688Dto,
              objProduct.CartProductPropFor1688Dto,
              _.isEqual
            );
            if (diff.length === 0) {
              // nếu đã tồn tại sản phẩm trong cart, thì update số lượng sản phẩm lên
              existProduct.Quantity = objProduct.Quantity;
              existProduct.ToltalWeb = objProduct.ToltalWeb;
              existProduct.TotalVnd = objProduct.TotalVnd;
              isExist = true;
            }
          }
  
          if (isExist) {
            tempLstProduct = checkExistLstProduct;
          } else {
            tempLstProduct.push(objProduct);
          }
  
        } else {
          tempLstProduct.push(objProduct);
        }
      }, 300);
    }
  
    function btnAddProductForNewUI($button) {
      setTimeout(() => {
        const listProp = [];
        const titleElement = $(
          ".od-pc-offer-title-contain .title-first-column .title-text"
        );
        const shopNameElement = $(
          "div#hd_0_container_0 div div div div div div div span"
        );
        const productImgs = $(
          ".img-list-wrapper .detail-gallery-turn-wrapper img.detail-gallery-img"
        );
        let productImage = "";
        if (productImgs.length > 0) {
          productImage = productImgs[0].attributes[2].nodeValue;
        }
  
        // tìm cặp sku 1
        const sku1Element = $(".pc-sku-wrapper .sku-module-wrapper .sku-prop-module-name");
        if (sku1Element.length > 0) {
          const skuName1 = sku1Element.length > 0 ? sku1Element[0].innerText : "";
          const skuValue1Element = $(".pc-sku-wrapper .sku-module-wrapper .prop-item-wrapper .prop-item .prop-item-inner-wrapper.active .prop-name");
          const skuValue1 = skuValue1Element.length > 0 ? skuValue1Element[0].innerText : "";
          if (skuValue1 !== "") {
            listProp.push({
              PropLabel: skuName1,
              PropValue: skuValue1,
            });
          }
        }
  
        // tìm cặp sku 2
        const parentNodeSkuName =
          $button.parentNode.parentNode.parentNode.parentNode.parentNode
            .parentNode.parentNode.parentNode;
        const skuName = parentNodeSkuName.children[0].innerText;
        const parentNode =
          $button.parentNode.parentNode.parentNode.parentNode.parentNode;
        const skuItemLeft = parentNode.children.length === 2 ? parentNode.children[0] : parentNode.children[1];
        let propPrice = 0;
        let propValue = "";
        if (skuItemLeft.children.length > 2) {
          propValue = skuItemLeft.children[0].innerText;
          propPrice = skuItemLeft.children[1].innerText.replace("元", "");
  
          if (propValue !== "") { 
            listProp.push({
              PropLabel: skuName,
              PropValue: propValue,
            });
          }
        }
        const quantityParentNode = $button.parentNode.parentNode;
        const quantityInput = quantityParentNode.children[1].children[0];
        const quantity = quantityInput.value;
  
        let shopName = "";
        let shopLink = "";
        if (shopNameElement) {
          shopName = shopNameElement["0"].innerText;
          shopLink = siteLink;
        } else {
          shopName = siteName;
          shopLink = siteLink;
        }
  
        const objProduct = {
          ProductName: titleElement.length > 0 ? titleElement[0].innerText : "",
          Quantity: parseInt(quantity),
          ProductImage: productImage,
          ProductLink: window.location.href,
          ToltalWeb: cartHelp.totalWeb(propPrice, parseInt(quantity)),
          TotalVnd: cartHelp.totalVND(propPrice),
          PriceWeb: parseFloat(propPrice),
          CartProductPropFor1688Dto: listProp,
          ShopName: shopName,
          ShopLink: shopLink,
        };
  
        const checkExistLstProduct = JSON.parse(JSON.stringify(tempLstProduct));
        if (checkExistLstProduct.length > 0) {
          let isExist = false;
          for (let index = 0; index < checkExistLstProduct.length; index++) {
            const existProduct = checkExistLstProduct[index];
  
            // so sánh hai mảng, nếu trả về [] thì tức là hai mảng này có giá trị giống nhau
            const diff = _.differenceWith(
              existProduct.CartProductPropFor1688Dto,
              objProduct.CartProductPropFor1688Dto,
              _.isEqual
            );
            if (diff.length === 0) {
              // nếu đã tồn tại sản phẩm trong cart, thì update số lượng sản phẩm lên
              existProduct.Quantity = objProduct.Quantity;
              existProduct.ToltalWeb = objProduct.ToltalWeb;
              existProduct.TotalVnd = objProduct.TotalVnd;
              isExist = true;
            }
          }
  
          if (isExist) {
            tempLstProduct = checkExistLstProduct;
          } else {
            tempLstProduct.push(objProduct);
          }
  
        } else {
          tempLstProduct.push(objProduct);
        }
      }, 300);
    }
  
    function loadContainerPrice() {
      $.get(
        chrome.runtime.getURL("app/assets/template/container-price-1688.html"),
        function (containerPriceHtml) {
          /* set cached global dom */
          $ContainerPrice1688 = $(containerPriceHtml);
          $(document).ready(function () {
            var newUIVersion = $("#recyclerview");
  
            if (newUIVersion.length > 0) {
              $(".od-pc-offer-price-common").append($ContainerPrice1688);
              $("#box-price").html(accounting.formatNumber(ndt_vnd));
              injectHtmlForNewUIVersion();
            } else {
              $("#mod-detail-price").append($ContainerPrice1688);
              $("#box-price").html(accounting.formatNumber(ndt_vnd));
              var tble = $("#mod-detail-price .d-content table");
              //không có giảm giá
              if (tble[0].className.indexOf("has-discount-sku") === -1) {
                injectHtmlNoDiscount();
              } //co giam gia
              else {
                injectHtmlHasDiscount();
              }
            }
          });
        }
      );
    }
  
    function injectHtmlForNewUIVersion() {
      var strInfo = "";
  
      var priceWrapper = $(".price-wrapper");
      if (priceWrapper.length > 0) {
        // chỉ có giá cao nhất và giá thấp nhất
        var priceBoxes = $(".price-wrapper .price-box");
        const lstProductPrice = [];
        for (let index = 0; index < priceBoxes.length; index++) {
          const priceBox = priceBoxes[index];
          const price = priceBox.children[1].innerText;
          if (price) {
            lstProductPrice.push(
              accounting.formatNumber(parseFloat(price) * ndt_vnd)
            );
          }
        }
  
        strInfo += "<dl>";
        strInfo +=
          "    <dd>Khoảng giá: <span class='tbe-color-price'>" +
          lstProductPrice.join(" - ") +
          "đ</span>";
        strInfo += "    </dd>";
        strInfo += "</dl>";
  
        const unitText = $(".price-wrapper .unit-box .unit-text");
        if (unitText.length > 0) {
          const filterNumber = unitText[0].innerText
            .replace("个起批", "")
            .replace("顶起批", "");
          strInfo += "<dl>";
          strInfo += "    <dd style='width:100%'>";
          strInfo +=
            "       <b class='text-danger'>Shop yêu cầu mua tối thiểu " +
            filterNumber +
            " sản phẩm</b>";
          strInfo += "    </d>";
          strInfo += "</dl>";
        }
        $("#load-info").html(strInfo);
        $ContainerPrice1688
          .find("b.tbe-rate.tbe-color-price")
          .html(lstProductPrice[0]); // show main price
      } else {
        priceWrapper = $(".step-price-wrapper");
        const stepItems = $(".step-price-wrapper .step-price-item");
        const lstStepInfo = [];
        for (let index = 0; index < stepItems.length; index++) {
          const stepItem = stepItems[index];
          const priceText = stepItem.children[0].children[1].innerText;
          let unitBox = stepItem.children[1].children[0].innerText;
          if (unitBox !== null) {
            unitBox = unitBox.replace("条起批", "").replace("条", "");
          }
          lstStepInfo.push({
            price: accounting.formatNumber(parseFloat(priceText) * ndt_vnd),
            unit: unitBox,
          });
        }
  
        strInfo += "<dl>";
        lstStepInfo.forEach((step) => {
          strInfo +=
            "    <dd>Giá: <span class='tbe-color-price'>" +
            step.price +
            " đ</span>, <small>Mua tối thiểu " +
            step.unit +
            " sản phẩm</small>";
          strInfo += "    </dd>";
        });
  
        strInfo += "</dl>";
  
        $("#load-info").html(strInfo);
        $ContainerPrice1688
          .find("b.tbe-rate.tbe-color-price")
          .html(lstStepInfo[0].price); // show main price
      }
    }
  
    function injectHtmlNoDiscount() {
      var pricePro = 0;
      var productElement = $("#mod-detail-price .d-content table tr.price td");
      var amountElement = $("#mod-detail-price .d-content table tr.amount td");
      var strInfo = "";
      for (var i = 0; i < productElement.length; i++) {
        if (i === 1) {
          pricePro = productElement[i].innerText.replace("¥", "");
          if (amountElement[i].innerText.indexOf("≥") > -1) {
            minProduct = parseInt(amountElement[i].innerText.replace("≥", ""));
          } else {
            var arr = amountElement[i].innerText.split("-");
            minProduct = parseInt(arr[0]);
          }
        }
        if (i > 0) {
          strInfo += "<dl>";
          strInfo +=
            "    <dd>Mua: " +
            amountElement[i].children[0].innerText +
            " sản phẩm";
          strInfo += "    </dd>";
          strInfo +=
            "    <dd>Giá: <span class='tbe-color-price'>" +
            productElement[i].innerText +
            "</span>";
          strInfo += "    </dd>";
          strInfo += "</dl>";
        }
      }
  
      strInfo += "<dl>";
      strInfo += "    <dd style='width:100%'>";
      strInfo +=
        "       <b class='text-danger'>Shop yêu cầu mua tối thiểu " +
        minProduct +
        " sản phẩm</b>";
      strInfo += "    </d>";
      strInfo += "</dl>";
  
      $("#load-info").html(strInfo);
      var parePricePro = (minPrice = parseFloat(pricePro));
      var priceVnd = parePricePro * ndt_vnd;
      $ContainerPrice1688
        .find("b.tbe-rate.tbe-color-price")
        .html(accounting.formatNumber(priceVnd));
    }
  
    function injectHtmlHasDiscount() {
      var pricePro = 0;
      var productElement = $("#mod-detail-price .d-content table tr.price");
      var amountElement = $("#mod-detail-price .d-content table tr.amount");
      var strInfo = "";
      pricePro = productElement[0].children[1].children[0].children[1].innerText;
      if (amountElement[0].children[0].children[0].innerText.indexOf("≥") > -1) {
        minProduct = parseInt(
          amountElement[0].children[0].children[0].innerText.replace("≥", "")
        );
      } else {
        var arr = amountElement[0].children[0].children[0].innerText.split("-");
        minProduct = parseInt(arr[0]);
      }
      strInfo += "<dl>";
      strInfo +=
        "    <dd>Mua: " +
        amountElement[0].children[0].children[0].innerText +
        " sản phẩm";
      strInfo += "    </dd>";
      strInfo +=
        "    <dd>Giá: <span class='tbe-color-price'>" + pricePro + "</span>";
      strInfo += "    </dd>";
      strInfo += "</dl>";
  
      strInfo += "<dl>";
      strInfo += "    <dd style='width:100%'>";
      strInfo +=
        "       <b class='text-danger'>Shop yêu cầu mua tối thiểu " +
        minProduct +
        " sản phẩm</b>";
      strInfo += "    </d>";
      strInfo += "</dl>";
  
      $("#load-info").html(strInfo);
      var parePricePro = (minPrice = parseFloat(pricePro));
      var priceVnd = parePricePro * ndt_vnd;
      $ContainerPrice1688
        .find("b.tbe-rate.tbe-color-price")
        .html(accounting.formatNumber(priceVnd));
    }
  
    function hasClass(elem, className) {
      return elem.className.split(' ').indexOf(className) > -1;
    }
  
    /**
     * initialize the app
     */
    self.initialize = function () {
      document.addEventListener('click', function (e) {
        if (hasClass(e.target, 'next-icon')) {
          iconAddProductForNewUI(e.target);
        } else if (hasClass(e.target, 'next-btn')) {
          btnAddProductForNewUI(e.target);
        }
      }, false);
  
      loadToolbar();
      loadContainerPrice();
    };
  }
  var Cs1688 = new Worker1688();
  Cs1688.initialize();
  