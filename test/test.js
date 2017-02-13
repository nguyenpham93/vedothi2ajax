var math = require("../math/hambac2");
var chai = require("chai");
chai.should();

describe("Test Ve do thi bac 2 2",() => {
    it("Should throw error a is not number",() => {
        (() => {
            math.validate_abc("num1",2,3);
        }).should.throw("a is not number");
    });
    it("Should throw error b is not number",() => {
        (() => {
            math.validate_abc(1,"num2",3);
        }).should.throw("b is not number");
    });
    it("Should throw error c is not number",() => {
        (() => {
            math.validate_abc(1,2,"num3");
        }).should.throw("c is not number");
    });
    it("Should throw error a equal zero",() => {
        (() => {
            math.validate_abc(0,2,4);
        }).should.throw("a equal to zero");
    });
    it("Should throw error delta less than zero",() => {
        (() => {
            math.findX(4,2,3);
        }).should.throw("delta less than zero");
    });
    it("Should have result [-4,0]",() => {
        math.findX(1,4,0).should.deep.equal([-4,0]);
    });
    it("Should have result 9",() => {
        math.findY(1,2,1,2).should.equal(9);
    });

});
