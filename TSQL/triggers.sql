-- ======== BEFORE Trigger ========

ALTER TRIGGER emp_info_BlockDML
ON dbo.emp_info
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    -- improve performance by stoping the database from sending "rows affected" messages back to the client after each statement
    SET NOCOUNT ON;

    -- Block DML on Saturday and Sunday
    IF DATEDIFF(DAY, '19000101', CAST(GETDATE() AS date)) % 7 IN (5, 6)
                   -- 1900/01/01                           0 = Mon ... 5 = Sat, 6 = Sun
    BEGIN
        RAISERROR(
            'DML operations are not allowed on Saturday or Sunday.',
            16, 1 -- severity: 1/16 
        );
        ROLLBACK TRANSACTION; -- control + z
        RETURN;
    END;

    DECLARE @CurrentTime time =
    CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'Eastern Standard Time' AS time);

    -- Block DML before 9:30 AM or after 6:00 PM
     IF @CurrentTime < '09:30:00'
         OR @CurrentTime > '18:00:00'
    BEGIN
        RAISERROR(
            'DML operations are allowed only between 9:30 AM and 6:00 PM.',
            16, 1 -- severity: 1/16 
        );
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;


---------------------------------------------------------------
-- ======== AFTER Trigger ========

Stock Info Table
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

Sales Info Table
CREATE TABLE salesInfo
(
    saleID INT PRIMARY KEY,
    stockID INT FOREIGN KEY(stockID) REFERENCES stockInfo,
    saleQty INT NOT NULL,
    saleTime DATETIME NOT NULL DEFAULT GETDATE()
)

Update available qty automatically after a sale
CREATE TRIGGER trigger_salesInfo_UpdateStock
ON salesInfo
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE S
    SET S.availableQty = S.availableQty - I.TotalSaleQty
    FROM StockInfo S
    INNER JOIN
    (
        SELECT stockID, SUM(saleQty) AS TotalSaleQty
        FROM inserted
        GROUP BY stockID
    ) I
        ON S.stockID = I.stockID;
END;

-- sales 12 apples
insert into salesInfo values(901,5,12,GETDATE())
select * from stockInfo


---------------------------------------------------------------
-- ======== INSTEAD OF Trigger ========

create view emp_dept_view
as
select empNo, empName, empDesignation, empSalary, empDeptNo, empManager, dept_info.DeptNo, dept_info.DeptName, dept_info.DeptLocation
from emp_info
left join dept_info
on emp_info.empDeptNo = dept_info.DeptNo

select * from emp_dept_view

-- can NOT insert values to a join view
insert into emp_dept_view (empName, empDesignation, empSalary, empDeptNo, empManager) values('Hecter', 'Accountant', 15000, 30, 15)

create trigger instead_of_emp_dept_view
on emp_dept_view
instead of insert 
as
begin
insert into emp_info (empName, empDesignation, empSalary, empDeptNo, empManager)
select empName, empDesignation, empSalary, empDeptNo, empManager from inserted
end

select * from emp_info