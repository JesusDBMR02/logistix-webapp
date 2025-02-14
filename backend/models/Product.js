class Product {
    constructor(name, description, category, brand, supplier, purchasePrice, salePrice, discount ,tax , stock , measuring, status , img , attributes,total) {
      this.name = name;
      this.description = description;
      this.category = category; 
      this.brand = brand; 
      this.supplier = supplier; 
      this.purchasePrice = purchasePrice;
      this.salePrice = salePrice;
      this.discount = discount; 
      this.tax = tax;
      this.stock = stock;
      this.measuring = measuring;
      this.status = status; 
      this.img = img;
      this.attributes = attributes;
      this.total= total;
    }
}
module.exports = Product