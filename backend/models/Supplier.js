class Supplier {
    constructor(name, contact, phone, email, address, supplierType,status, notes, suppliedProducts) {
        this.name = name;
        this.contact = contact;
        this.phone = phone;
        this.email = email;
        this.address = {
            street: address.street || '',
            city: address.city || '',
            state: address.state || '',
            postalCode: address.postalCode || '',
            country: address.country || ''
        };
        this.suppliedProducts = suppliedProducts;
        this.supplierType = supplierType;
        this.status = status;
        this.notes = notes||'';
    }
}

module.exports = Supplier;
