function Worker1688() {
  var self = this;
  var $Toolbar1688;
  var $ContainerPrice1688;
  var tempLstProduct = []; // chỉ dành cho UI mới
  var siteName = "ohp.vn";
  var siteLink = "https://ohp.vn";

  function flyingCart() {
    var cart = $("#tbe-btn-show-cart");
    const imgtodrag = $(".od-gallery-preview .ant-image-img.preview-img");
    
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

  function addPropertyForNewUI() {
    const noAffixWrapper = $("#skuSelection");
    var alertArea = $Toolbar1688.find("#tbe-warning-bar");

    if (
      tempLstProduct.length === 0 &&
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

    if (tempLstProduct.length > 0) {
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
            addPropertyForNewUI();
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
      const titleElement = $("#productTitle h1");
      let shopNameElement = $(".winport-title h1");

      // tìm cặp sku 1
      const sku1Element = $(".gyp-sku-selector-wrap .sku-selector-flex-box .sku-selector-name");
      if (sku1Element.length > 0) {
        const skuName1 = sku1Element.length > 0 ? sku1Element[0].innerText : "";
        const skuValue1Element = $(".gyp-sku-selector-wrap .sku-selector-flex-box .sku-selector-props .sku-props-list .selector-prop-item.selected .prop-item-text");
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
        const priceBox = skuItemLeft.children[2];
        if (priceBox.children.length > 0) {
          propPrice = priceBox.children[0].innerText.replace("￥", "");
        }

        if (propValue !== "") { 
          listProp.push({
            PropLabel: skuName,
            PropValue: propValue,
          });
        }
      }
      // Lấy quantity từ input có class ant-input-number-input
      const quantityInput = $($button).closest('.ant-input-number-wrapper').find('.ant-input-number-input');
      const quantity = quantityInput.length > 0 ? quantityInput.val() || quantityInput[0].value : "";

      // ảnh - lấy ảnh đang được hiển thị (có class prepic-active)
      let productImage = "";
      const activeImage = $(".od-gallery-preview .ant-image-img.preview-img");
      if (activeImage.length > 0) {
        productImage = activeImage.attr('src') || activeImage[0].src;
      }

      let shopName = "";
      let shopLink = "";
      if (shopNameElement.length > 0) {
        shopName = shopNameElement[0].innerText;
        // Lấy shop link từ thẻ a.shop-company-name
        const shopLinkElement = $(".winport-title .shop-company-name");
        if (shopLinkElement.length > 0) {
          const rawShopLink = shopLinkElement.attr("href") || siteLink;
          shopLink = rawShopLink.split("?")[0];
        } else {
          shopLink = siteLink;
        }
      } else {
        shopNameElement = $("div#hd_0_container_0 div div div div div div div span");
        if (shopNameElement.length > 0) {
          shopName = shopNameElement[0].innerText;
          shopLink = siteLink;
        } else {
          shopNameElement = $(".cjt-header-container .left-logo .logo-two .logo-name a");
          if (shopNameElement.length > 0) {
            shopName = shopNameElement[0].innerText;
            shopLink = shopNameElement[0].attributes ? shopNameElement[0].attributes[0].nodeValue : siteLink;
          } else {
            shopName = siteName;
            shopLink = siteLink;
          }
        }
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
      const titleElement = $("#productTitle h1");
      const shopNameElement = $(".winport-title h1");
      
      // Tìm SKU 1: từ feature-item đầu tiên, lấy button có class active
      const firstFeatureItem = $("#skuSelection .feature-item").first();
      if (firstFeatureItem.length > 0) {
        const sku1Name = firstFeatureItem.find(".feature-item-label h3").text();
        const sku1ActiveButton = firstFeatureItem.find(".transverse-filter .sku-filter-button.active");
        if (sku1ActiveButton.length > 0) {
          const sku1Value = sku1ActiveButton.find(".label-name").text();
          if (sku1Name && sku1Value) {
            listProp.push({
              PropLabel: sku1Name,
              PropValue: sku1Value,
            });
          }
        }
      }

      // Tìm SKU 2: từ $button, tìm expand-view-item cha và lấy thông tin
      let propPrice = 0;
      const expandViewItem = $($button).closest(".expand-view-item");
      if (expandViewItem.length > 0) {
        // Lấy tên thuộc tính từ feature-item thứ 2
        const secondFeatureItem = $("#skuSelection .feature-item").eq(1);
        const sku2Name = secondFeatureItem.find(".feature-item-label h3").text();
        
        // Lấy giá trị từ item-label
        const sku2Value = expandViewItem.find(".item-label").text();
        
        // Lấy giá từ item-price-stock đầu tiên
        const priceElement = expandViewItem.find(".item-price-stock").first();
        if (priceElement.length > 0) {
          const priceText = priceElement.text().replace("¥", "").replace("￥", "");
          propPrice = parseFloat(priceText) || 0;
        }

        if (sku2Name && sku2Value) {
          listProp.push({
            PropLabel: sku2Name,
            PropValue: sku2Value,
          });
        }
      }
      // Lấy quantity từ input có class ant-input-number-input
      const quantityInput = $($button).closest('.ant-input-number-wrapper').find('.ant-input-number-input');
      const quantity = quantityInput.length > 0 ? quantityInput.val() || quantityInput[0].value : "";

      // ảnh - lấy ảnh đang được hiển thị (có class prepic-active)
      let productImage = "";
      const activeImage = $(".od-gallery-preview .ant-image-img.preview-img");
      if (activeImage.length > 0) {
        productImage = activeImage.attr('src') || activeImage[0].src;
      }

      let shopName = "";
      let shopLink = "";
      if (shopNameElement.length > 0) {
        shopName = shopNameElement[0].innerText;
        // Lấy shop link từ thẻ a.shop-company-name
        const shopLinkElement = $(".winport-title .shop-company-name");
        if (shopLinkElement.length > 0) {
          const rawShopLink = shopLinkElement.attr("href") || siteLink;
          shopLink = rawShopLink.split("?")[0];
        } else {
          shopLink = siteLink;
        }
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
            injectHtmlNoDiscountForNewUI();
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
      $("#promotionBanner").html(strInfo);
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

      $("#promotionBanner").html(strInfo);
      $ContainerPrice1688
        .find("b.tbe-rate.tbe-color-price")
        .html(lstStepInfo[0].price); // show main price
    }
  }

  function injectHtmlNoDiscountForNewUI() {
    var pricePro = 0;
      var minProduct = 0;
      var strInfo = "";
      
      // Tìm container chứa các mức giá
      var priceContainer = $(".price-component.step-price");
      
      if (priceContainer.length === 0) {
        console.error("Không tìm thấy container giá");
        return;
      }
      
      // Lấy tất cả các mức giá
      var priceComps = priceContainer.find(".price-comp");
      
      if (priceComps.length === 0) {
        console.error("Không tìm thấy các mức giá");
        return;
      }
      
      // Xử lý từng mức giá
      priceComps.each(function(index) {
        var $priceComp = $(this);
        
        // Lấy giá từ các span trong .price-info.currency
        var priceSpans = $priceComp.find(".price-info.currency span");
        var priceText = "";
        
        if (priceSpans.length >= 3) {
          // Ghép các phần giá: ¥ + 80 + .75 = ¥80.75
          priceText = priceSpans.eq(1).text() + priceSpans.eq(2).text();
        } else if (priceSpans.length === 2) {
          // Trường hợp chỉ có 2 span: ¥ + 80
          priceText = priceSpans.eq(1).text();
        }
        
        // Lấy số lượng từ thẻ p > span
        var quantityText = $priceComp.find("p span").text();
        
        if (priceText && quantityText) {
          var price = parseFloat(priceText);
          var quantity = quantityText;
          
          // Xử lý số lượng tối thiểu từ mức giá đầu tiên
          if (index === 0) {
            if (quantity.indexOf("起批") > -1) {
              // "1个起批" -> minProduct = 1
              minProduct = parseInt(quantity.replace("个起批", ""));
            } else if (quantity.indexOf("≥") > -1) {
              // "≥100个" -> minProduct = 100
              minProduct = parseInt(quantity.replace("≥", "").replace("个", ""));
            } else if (quantity.indexOf("-") > -1) {
              // "20-99个" -> minProduct = 20
              var arr = quantity.split("-");
              minProduct = parseInt(arr[0]);
            }
            
            // Lấy giá từ mức giá đầu tiên
            pricePro = price;
          }
          
          // Tạo HTML cho từng mức giá
          strInfo += "<dl>";
          strInfo += "    <dd>Mua: " + quantity + "</dd>";
          strInfo += "    <dd>Giá: <span class='tbe-color-price'>¥" + priceText + "</span></dd>";
          strInfo += "</dl>";
        }
      });
      
      // Thêm thông tin số lượng tối thiểu
      strInfo += "<dl>";
      strInfo += "    <dd style='width:100%'>";
      strInfo += "       <b class='text-danger'>Shop yêu cầu mua tối thiểu " + 
        minProduct + " sản phẩm</b>";
      strInfo += "    </dd>";
      strInfo += "</dl>";
      
      // Cập nhật HTML
      $("#promotionBanner").html(strInfo);
      
      // Tính toán giá VND
      if (pricePro > 0) {
        var priceVnd = pricePro * ndt_vnd;
        $ContainerPrice1688
          .find("b.tbe-rate.tbe-color-price")
          .html(accounting.formatNumber(priceVnd));
      }
  }

  /**
   * initialize the app
   */
  self.initialize = function () {
    // Bắt sự kiện click trực tiếp vào element có class ant-input-number-group-addon
    $(document).on('click', '.ant-input-number-group-addon', function(e) {
      btnAddProductForNewUI(this);
    });

    loadToolbar();
    loadContainerPrice();
  };
}
var Cs1688 = new Worker1688();
Cs1688.initialize();
