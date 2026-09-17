create table stockInfo(
    stockID int primary key,
    stockName varchar(20),
    stockPrice int,
    availableQty int
)
insert into stockInfo values(1, 'Pepsi', 5, 100)
insert into stockInfo values(2, 'Coke', 5, 100)
insert into stockInfo values(3, 'Chips', 3, 100)
insert into stockInfo values(4, 'Yeti', 10, 100)
insert into stockInfo values(5, 'Apple', 230, 100)

SELECT * from stockInfo

CREATE TABLE billing(
    saleID int PRIMARY KEY,
    stockID int FOREIGN KEY(stockID) REFERENCES stockInfo,
    saleQty int,
    amount int
)

-- when the user insert into billing values(101, 5, 12, variable)

-- CREATE TRIGGER trig_sales
-- ON billing
-- AFTER INSERT AS
-- BEGIN
--     DECLARE @prodcutPrice int;
--     SET @prodcutPrice = (SELECT stockPrice FROM stockInfo WHERE stockID = inserted.stockID)

-- END