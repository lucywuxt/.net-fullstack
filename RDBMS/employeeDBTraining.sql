-- CREATE DATABASE employeeDBTraining;
-- GO
-- USE employeeDBTraining;
-- GO
-- CREATE TABLE deptInfo (
--     deptNO       INT          IDENTITY (10, 10), -- start at 10 and add 10 each time
--     deptName     VARCHAR (20) NOT NULL,
--     deptLocation VARCHAR (20) NOT NULL,
--     CONSTRAINT pk_deptno PRIMARY KEY (deptNO),
--     CONSTRAINT check_deptName_length CHECK (LEN(deptName) >= 2),
--     CONSTRAINT unique_deptName UNIQUE (deptName),
--     CONSTRAINT check_deptLocation_values CHECK (deptLocation IN ('New York', 'Chicago', 'Texas'))
-- )
-- INSERT INTO deptInfo VALUES('HR', 'Texas');
-- INSERT INTO deptInfo VALUES('Accounts', 'New York');
-- INSERT INTO deptInfo VALUES('IT', 'Chicago');
-- INSERT INTO deptInfo VALUES('Training', 'New York');
-- SELECT * FROM deptInfo
CREATE TABLE employeeInfo (
    empNO          INT          IDENTITY (001, 1) PRIMARY KEY,
    empName        VARCHAR (20) NOT NULL,
    empDesignation VARCHAR (20) NOT NULL,
    empSalary      DECIMAL(7,2) NOT NULL,
    empIsActive    BIT          NOT NULL, -- boolean type in SQL
    empDept        VARCHAR(20)  NOT NULL,
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

-- DROP Table employeeInfo;