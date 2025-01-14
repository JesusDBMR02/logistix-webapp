class Sale {
    constructor(name, products, totalAmount,status, paymentMethod, saleDate, notes) {
        this.name=name
        this.products = products;      
        this.totalAmount = totalAmount; 
        this.paymentMethod = paymentMethod;
        this.status = status
        this.saleDate = saleDate ;
        this.notes = notes;
    }
}

module.exports = Sale;
