class Purchase {
    constructor(name, supplier, products, totalAmount, paymentMethod, purchaseDate, status , notes ) {
        this.name = name
        this.supplier = supplier;
        this.products = products;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.purchaseDate = purchaseDate;
        this.status = status;
        this.notes = notes;
    }
}

module.exports = Purchase;
