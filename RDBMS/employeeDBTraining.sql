-- CREATE DATABASE employeeDBTraining;
-- GO
-- USE employeeDBTraining;
-- GO
CREATE TABLE deptInfo (
    deptNO       INT          IDENTITY (10, 10), -- start at 10 and add 10 each time
    deptName     VARCHAR (20) NOT NULL,
    deptLocation VARCHAR (20) NOT NULL,
    CONSTRAINT pk_deptno PRIMARY KEY (deptNO),
    CONSTRAINT check_deptName_length CHECK (LEN(deptName) >= 2),
    CONSTRAINT unique_deptName UNIQUE (deptName),
    CONSTRAINT check_deptLocation_values CHECK (deptLocation IN ('New York', 'Chicago', 'Texas'))
)
INSERT INTO deptInfo VALUES('HR', 'Texas');
INSERT INTO deptInfo VALUES('Accounts', 'New York');
INSERT INTO deptInfo VALUES('IT', 'Chicago');
INSERT INTO deptInfo VALUES('Training', 'New York');
SELECT * FROM deptInfo


CREATE TABLE employeeInfo (
    empNO          INT          IDENTITY (001, 1) PRIMARY KEY,
    empName        VARCHAR (20) NOT NULL,
    empDesignation VARCHAR (20) NOT NULL,
    empSalary      DECIMAL(7,2) NOT NULL,
    empIsActive    BIT          NOT NULL, -- boolean type in SQL
    empDept        VARCHAR(20),
    empSSN         VARCHAR (11) NOT NULL UNIQUE,
    CONSTRAINT check_empName_length CHECK (LEN(empName) >= 3),
    CONSTRAINT check_desigantion_values CHECK (empDesignation IN ('HR', 'Developer', 'Accountant', 'Trainer')),
    CONSTRAINT check_empSalary CHECK (empSalary BETWEEN 8000 AND 25000), -- OR: empSalary <= 25000 and empSalary >=  8000
    FOREIGN KEY (empDept) REFERENCES deptInfo (deptName)
);

INSERT  INTO employeeInfo (empName, empDesignation, empSalary, empIsActive, empDept, empSSN) VALUES 
('Lucy', 'HR', 10000.00, 1, 'HR', '123-45-6789'),
('Kamya', 'HR', 10000.00, 1, 'HR', '123-45-6797'),
('Jay', 'HR', 10000.00, 1, 'HR', '123-45-6798'),
('Kennan', 'Developer', 25000.00, 1, 'IT', '123-45-6790'),
('Brandon', 'Developer', 25000.00, 1, 'IT', '123-45-6795'),
('Sebastian', 'Accountant', 20000.00, 1, 'Accounts', '123-45-6793'),
('Isaiah', 'Accountant', 20000.00, 1, 'Accounts', '123-45-6796'),
('Angela', 'Trainer', 8000.00, 1, 'Training', '123-45-6791'),
('Angela', 'Trainer', 8000.00, 1, 'Training', '123-45-6794'),
('Pranav', 'Trainer', 8000.00, 1, 'Training', '123-45-6792');

SELECT *
FROM   employeeInfo;

-- Sorting by desending
SELECT empNO AS [Employee Number], empName AS Name FROM employeeInfo
ORDER BY Name DESC

-- empNO > 5
SELECT empNO AS [Employee Number], empName AS Name FROM employeeInfo
WHERE empNO > 5
ORDER BY Name

-- empSalary > 20000 AND emp is active
SELECT empNO AS [Employee Number], empName AS Name FROM employeeInfo
WHERE empSalary > 20000 AND empIsActive = 1
ORDER BY Name

-- Aggregation
SELECT sum(empSalary) AS [Total Salary] FROM employeeInfo

SELECT sum(empSalary) AS [Total IT Salary] FROM employeeInfo
WHERE empDept = 'IT'

SELECT empDept, sum(empSalary) AS Salary, count(empNO) AS [Total Employees] FROM employeeInfo
GROUP BY empDept

-- Wild Card Characters
SELECT * FROM employeeInfo WHERE empName LIKE 'L%' -- name starts with L

SELECT * FROM employeeInfo WHERE empName LIKE '%N' -- name ends with N

SELECT * FROM employeeInfo WHERE empName LIKE '_A%' -- second char is A

-- Select only unique values (distinct)
SELECT DISTINCT empDept FROM employeeInfo

-- with functions
SELECT UPPER(empName) AS Names FROM employeeInfo
SELECT LOWER(empDept) AS Depts FROM employeeInfo
SELECT SUBSTRING(empName, 1, 3) FROM employeeInfo
SELECT 'Hello ' + empName FROM employeeInfo
SELECT CONCAT('My name is ', SUBSTRING(empName, 1, 3)) FROM employeeInfo

-- get email from dept 20 with the format: name_first 2 char of desgination@company.co.us
SELECT LOWER(CONCAT(empName, '_', SUBSTRING(empDesignation, 1, 2), '@company.co.us')) AS [Email Address] 
FROM employeeInfo e
JOIN deptInfo d ON e.empDept = d.deptName
WHERE d.deptNO = 20;

-- Date functions
SELECT GETDATE()        -- get current date
SELECT MONTH(GETDATE()) -- get current month
SELECT YEAR(GETDATE())  -- get current year
SELECT DATEADD(YEAR, 3, GETDATE()) -- add 3 years to current date
SELECT DATEADD(HOUR, 3, GETDATE()) -- add 3 hours to current date

-- DML
INSERT  INTO employeeInfo VALUES ('Lucy1', 'HR', 10000.00, 1, 'HR', '123-45-6700')

UPDATE employeeInfo SET empSalary += 200 
WHERE empDept = 'HR'

DELETE FROM employeeInfo
WHERE empName LIKE 'Lucy1'

-- Subquery
SELECT empNO, empName, empSalary FROM employeeInfo
WHERE empSalary = 
    (SELECT MAX(empSalary) FROM employeeInfo)

-- count number of rows
SELECT COUNT(*) FROM employeeInfo

-- Joins (to get data from more than 1 table)
-- Cross Join:
SELECT * FROM employeeInfo, deptInfo ORDER BY empNO

-- Inner/Equal Join:
SELECT empNO, empName, empSalary, deptInfo.deptName, deptInfo.deptLocation
FROM employeeInfo 
JOIN deptInfo ON employeeInfo.empDept = deptInfo.deptName
WHERE empName LIKE 'N%'

SELECT COUNT(empNO) AS [Total Emp], deptInfo.deptLocation AS City
FROM employeeInfo
JOIN deptInfo ON employeeInfo.empDept = deptInfo.deptName
GROUP BY deptInfo.deptLocation

-- Left Join:
INSERT  INTO employeeInfo VALUES ('Peter', 'HR', 10000.00, 1, NULL, '123-45-6000')
SELECT * FROM employeeInfo 
LEFT JOIN deptInfo ON employeeInfo.empDept = deptInfo.deptName

-- Right Join:
INSERT INTO deptInfo VALUES('Sales', 'Texas');
SELECT * FROM employeeInfo 
RIGHT JOIN deptInfo ON employeeInfo.empDept = deptInfo.deptName

-- Full Join:
SELECT * FROM employeeInfo e
FULL JOIN deptInfo d ON e.empDept = d.deptName

-- Null Join:
SELECT * FROM employeeInfo e
FULL JOIN deptInfo d ON e.empDept = d.deptName
WHERE e.empDesignation IS NULL

-- Self Join:
SELECT * FROM employeeInfo e1
JOIN employeeInfo e2 ON e1.empNO = e2.empNO