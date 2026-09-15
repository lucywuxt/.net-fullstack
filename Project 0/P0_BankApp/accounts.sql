CREATE DATABASE accountsDB;
GO

-- USE accountsDB;
-- GO

CREATE TABLE accounts
(
    accNo INT PRIMARY KEY,
    username VARCHAR(30),
    password VARCHAR(30),
    accBalance DECIMAL(18, 2)
)
insert into accounts values(111,'Peter','123', 100.00);		
insert into accounts values(002,'Mary','123', 0.0);

select * from accounts