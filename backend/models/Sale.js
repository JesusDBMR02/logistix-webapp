class Sale {
    constructor( products, totalAmount, paymentMethod, saleDate, notes) {
        this.products = products;      
        this.totalAmount = totalAmount; 
        this.paymentMethod = paymentMethod;
        this.saleDate = saleDate ;
        this.notes = notes;
    }
}

module.exports = Sale;
