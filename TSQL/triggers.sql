-- create table stockInfo(
--     stockID int primary key,
--     stockName varchar(20),
--     stockPrice int,
--     availableQty int
-- )
-- insert into stockInfo values(1, 'Pepsi', 5, 100)
-- insert into stockInfo values(2, 'Coke', 5, 100)
-- insert into stockInfo values(3, 'Chips', 3, 100)
-- insert into stockInfo values(4, 'Yeti', 10, 100)
-- insert into stockInfo values(5, 'Apple', 230, 100)

-- SELECT * from stockInfo

USE employeeDBTraining;

-- CREATE TABLE billing(
--     saleID int PRIMARY KEY,
--     stockID int FOREIGN KEY(stockID) REFERENCES stockInfo,
--     saleQty int,
--     amount int
-- )

-- when the user insert into billing values(101, 5, 12, variable)

-- CREATE TRIGGER trig_sales
-- ON billing
-- AFTER INSERT AS
-- BEGIN
--     DECLARE @prodcutPrice int;
--     SET @prodcutPrice = (SELECT stockPrice FROM stockInfo WHERE stockID = inserted.stockID)

-- END


CREATE TRIGGER emp_info_BlockDML
ON dbo.emp_info
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON; -- stop program from counting data selected (improve performance for large #)

    -- Block DML on Saturday and Sunday
    IF DATEDIFF(DAY, '19000101', CAST(GETDATE() AS date)) % 7 IN (5, 6)
                   -- mins in a day                           5th (Sat) & 6th (Sun) day in a week
    BEGIN
        RAISERROR(
            'DML operations are not allowed on Saturday or Sunday.',
            16, 1 -- severity: 1/16 
        );
        ROLLBACK TRANSACTION; -- control + z
        RETURN;
    END;

    -- Block DML before 9:30 AM or after 6:00 PM
    IF CAST(GETDATE() AS time) < '09:30:00'
       OR CAST(GETDATE() AS time) >= '18:00:00'
    BEGIN
        RAISERROR(
            'DML operations are allowed only between 9:30 AM and 6:00 PM.',
            16, 1 -- severity: 1/16 
        );
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;
GO