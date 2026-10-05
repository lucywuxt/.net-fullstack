Ctslass Person {
    firstName:string;
    lastName:string;

    constructor(firstName:string, lastName:string) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    greetUser():string {
        return `Hello, ${this.firstName} ${this.lastName}`;
    }
}