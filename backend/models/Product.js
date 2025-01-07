class Product {
    constructor(name, description, categoryId, brandId, supplierId, purchasePrice, salePrice, discount = 0 ,tax=0, stock = 0, measuring = "unidades", status , img = "", atributes = {} ) {
      this.name = name;
      this.description = description;
      this.categoryId = categoryId; 
      this.brandId = brandId; 
      this.supplierId = supplierId; 
      this.purchasePrice = purchasePrice;
      this.salePrice = salePrice;
      this.discount = discount; 
      this.tax = tax; 
      this.stock = stock;
      this.measuring = measuring;
      this.status = status;
      this.img = img;
      this.atributes = atributes;
    }
}
module.exports = Product