function cartHelper() {
  var self = this;

  self.checkUrlWebType = function () {
    var urlweb = window.location.href;
    if (urlweb.indexOf("taobao.com") > -1) {
      return "http://www.taobao.com/favicon.ico";
    } else if (urlweb.indexOf("tmall.com") > -1) {
      return "http://g.alicdn.com/mui/global/1.2.35/file/favicon.ico";
    } else if (urlweb.indexOf("1688.com") > -1) {
      return "http://cbu01.alicdn.com/favicon.ico";
    }
  };

  self.totalVND = function (PricePro) {
    var parePricePro = parseFloat(PricePro);
    var priceVnd = parePricePro * ndt_vnd;
    return priceVnd;
  };

  self.totalWeb = function (PricePro, quantity) {
    var parePricePro = parseFloat(PricePro);
    var priceWeb = parePricePro * quantity;
    return priceWeb;
  };

  self.totalFeeOrder = function (totalfee) {
    var priceWeb = parseFloat(totalfee) + parseFloat(serviceFee);
    return priceWeb;
  };

  self.addCart = function (productInfo) {
    self.checkIsExistProduct(productInfo);
  };

  self.checkIsExistProduct = function (productInfo) {
    window.chrome.storage.local.get("cvc-cart-storage", function (result) {
      var totalProduct = 0;
      var tempCart = [];
      var listProductProp = [];
      var productCurrent = {
        CartProductId: 0,
        CartShopId: 0,
        ProductName: "",
        ProductImage: "",
        ProductLink: 0,
        ProductNote: "",
        NoteForMySelf: "",
        Quantity: 0,
        PriceWeb: 0,
        ToltalWeb: 0,
        TotalVnd: 0,
        CartProductPropDto: [],
      };
      var cartCurrent = {
        CartShopId: 0,
        CartShopName: "",
        CartShopLink: "",
        WebType: "",
        NoteForChivican: "",
        NoteForMySelf: "",
        OrderFee: 0,
        TotalFee: 0,
        Id: 0,
        CartProductDto: [],
      };

      for (var i = 0; i < productInfo.listProp.length; i++) {
        var item = productInfo.listProp[i];
        var itemProp = {};
        itemProp.PropLabel = item.propTitle;
        itemProp.PropValue = item.propValue;
        listProductProp.push(itemProp);
      }

      productCurrent.ProductName = productInfo.productTitle;
      productCurrent.productLink = productInfo.productLink;
      productCurrent.ProductImage = productInfo.productImg;
      productCurrent.Quantity = productInfo.quantity;
      productCurrent.PriceWeb = parseFloat(productInfo.productPricePro);
      productCurrent.ToltalWeb = self.totalWeb(
        productInfo.productPricePro,
        productInfo.quantity
      );
      productCurrent.CartProductPropDto = listProductProp;
      productCurrent.TotalVnd = self.totalVND(productCurrent.ToltalWeb);

      cartCurrent.CartShopName = productInfo.shopName;
      cartCurrent.CartShopLink = productInfo.shopLink;
      cartCurrent.OrderFee = productCurrent.TotalVnd;
      cartCurrent.TotalFee = self.totalFeeOrder(cartCurrent.OrderFee);
      cartCurrent.WebType = self.checkUrlWebType();
      cartCurrent.CartProductDto.push(productCurrent);

      if (result && result["cvc-cart-storage"]) {
        /* Nếu đã có sản phẩm trong giỏ hàng */
        var carts = result["cvc-cart-storage"];
        var isExistShop = false;
        var isExistProduct = false;
        for (var i = 0; i < carts.length; i++) {
          var item = carts[i];
          var listProduct = [];
          //đã có shop rồi
          if (
            cartCurrent.CartShopName === item.CartShopName &&
            cartCurrent.CartShopLink === item.CartShopLink
          ) {
            var totalOrderFee = 0;
            //lấy ra sản phẩm đã đã được lưu lại
            for (var j = 0; j < item.CartProductDto.length; j++) {
              var itemProduct = item.CartProductDto[j];
              //sản phẩm đã tồn tại trong giỏ hàng
              if (
                _.isEqual(
                  itemProduct.CartProductPropDto.sort(),
                  listProductProp.sort()
                ) &&
                productCurrent.productLink === itemProduct.productLink &&
                productCurrent.ProductName === itemProduct.ProductName
              ) {
                itemProduct.Quantity =
                  parseInt(itemProduct.Quantity) +
                  parseInt(productCurrent.Quantity);
                isExistProduct = true;
              }
              totalProduct =
                parseInt(totalProduct) + parseInt(itemProduct.Quantity);
              listProduct.push(itemProduct);
            }
            if (!isExistProduct) {
              listProduct.push(productCurrent);
              totalProduct =
                parseInt(totalProduct) + parseInt(productCurrent.Quantity);
            }
            isExistShop = true;
          } else {
            for (var j = 0; j < item.CartProductDto.length; j++) {
              var itemProduct = item.CartProductDto[j];
              totalProduct =
                parseInt(totalProduct) + parseInt(itemProduct.Quantity);
              listProduct.push(itemProduct);
            }
          }
          item.CartProductDto = listProduct;
          tempCart.push(item);
        }
        if (!isExistShop) {
          //khong ton tai shop
          tempCart.push(cartCurrent);
          totalProduct =
            parseInt(totalProduct) + parseInt(productCurrent.Quantity);
        }
      } else {
        /* nếu không có sản phẩm nào trong giỏ hàng thì add sản phẩm vào giỏ hàng */

        totalProduct = productInfo.quantity;
        tempCart.push(cartCurrent);
      }
      window.chrome.storage.local.set({ "cvc-cart-storage": tempCart });
      $("#total-product").html(totalProduct);
    });
  };

  self.addCartToTabaoTmall = async function (productInfo) {
    try {
      var listProductProp = [];
      var productCurrent = {
        CartProductId: 0,
        CartShopId: 0,
        ProductName: "",
        ProductImage: "",
        ProductLink: 0,
        ProductNote: "",
        NoteForMySelf: "",
        Quantity: 0,
        PriceWeb: 0,
        ToltalWeb: 0,
        TotalVnd: 0,
        CartProductPropDto: [],
      };
      if (productInfo.listProp.length > 0) {
        for (var i = 0; i < productInfo.listProp.length; i++) {
          var item = productInfo.listProp[i];
          var itemProp = {};
          itemProp.PropLabel = item.propTitle;
          itemProp.PropValue = item.propValue;
          listProductProp.push(itemProp);
        }
      }

      productCurrent.ProductName = productInfo.productTitle;
      productCurrent.productLink = productInfo.productLink;
      productCurrent.ProductImage = productInfo.productImg;
      productCurrent.Quantity = productInfo.quantity;
      productCurrent.PriceWeb = parseFloat(productInfo.productPricePro);
      productCurrent.ToltalWeb = self.totalWeb(
        productInfo.productPricePro,
        productInfo.quantity
      );
      productCurrent.CartProductPropFor1688Dto = listProductProp;
      productCurrent.TotalVnd = self.totalVND(productCurrent.ToltalWeb);
      productCurrent.ShopName = productInfo.shopName;
      productCurrent.ShopLink = productInfo.shopLink;
      productCurrent.WebType = self.checkUrlWebType();

      const result = await new Promise((resolve, reject) => {
        window.chrome.storage.local.get("cvc-cart-storage", (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });

      let totalProductHtml = 0;
      if (result && result["cvc-cart-storage"]) {
        /* Nếu đã có sản phẩm trong giỏ hàng */
        const carts = result["cvc-cart-storage"];
        const tempCart = carts.concat(productCurrent);

        for (let i = 0; i < tempCart.length; i++) {
          totalProductHtml += parseInt(tempCart[i].Quantity);
        }

        await new Promise((resolve, reject) => {
          window.chrome.storage.local.set(
            { "cvc-cart-storage": tempCart },
            () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve();
              }
            }
          );
        });

        $("#total-product").html(totalProductHtml);
      } else {
        const temp = [productCurrent];

        await new Promise((resolve, reject) => {
          window.chrome.storage.local.set({ "cvc-cart-storage": temp }, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });

        $("#total-product").html(productCurrent.Quantity);
      }
    } catch (error) {
      console.error("Error updating cart storage:", error);
    }
  };

  self.flyingCart = function (imgFlyElement) {
    var cart = $("#tbe-btn-show-cart");
    var imgtodrag = $(imgFlyElement);
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
  };
}

var cartHelp = new cartHelper();
