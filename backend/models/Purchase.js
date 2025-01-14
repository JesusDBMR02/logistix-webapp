class Purchase {
    constructor(supplier, products, totalAmount, purchaseDate, status , notes ) {
        this.supplier = supplier;
        this.products = products;
        this.totalAmount = totalAmount;
        this.purchaseDate = purchaseDate;
        this.status = status;
        this.notes = notes;
    }
}

module.exports = Purchase;
