-- CREATE VIEW empRecords AS
-- SELECT * FROM emp_info

SELECT * FROM empRecords
WHERE empDesignation = 'Developer'

CREATE VIEW empTopPaidEmployees AS
SELECT * FROM emp_info
WHERE empSalary = (SELECT MAX(empSalary) FROM emp_info) 
SELECT * FROM empTopPaidEmployees


-- CREATE VIEW empSummary AS
-- SELECT COUNT(empNo) AS [Total Employees],
-- MAX(empSalary) AS [Max Salary],
-- MIN(empSalary) AS [Min Salary],
-- SUM(empSalary) AS [Total Salary],
-- AVG(empSalary) AS [Average Salary]
-- FROM emp_info
SELECT * FROM empSummary