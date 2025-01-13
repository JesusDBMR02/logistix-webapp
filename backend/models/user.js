class User{
    constructor(email, password, name, lastName, company, role, address, phone, profile){
        this.email = email;
        this.password = password;
        this.name = name;
        this.lastName = lastName;
        this.company = company;
        this.role = role;
        this.address= address;
        this.phone = phone;
        this.profile = profile;
    }
}
module.exports = User;