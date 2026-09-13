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
);