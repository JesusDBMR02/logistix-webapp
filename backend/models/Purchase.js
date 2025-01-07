class Purchase {
    constructor(supplierId, products, totalAmount, purchaseDate, status = 'pending', notes = '') {
        this.supplierId = supplierId;
        this.products = products;
        this.totalAmount = totalAmount;
        this.purchaseDate = purchaseDate;
        this.status = status;
        this.notes = notes;
    }
}

module.exports = Purchase;
