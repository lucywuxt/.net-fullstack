
CREATE VIEW SalaryUpgrade AS
-- update salary based on dept using switch case
SELECT empNo, empName, empSalary AS [Old Pay], 
CASE empDeptNo
    WHEN 10 THEN empSalary + 500
    WHEN 20 THEN empSalary + 1000
    WHEN 30 THEN empSalary + 1500
    WHEN 40 THEN empSalary + 200
    else empSalary + 250
END AS [New Pay]
FROM emp_info;

SELECT * FROM SalaryUpgrade;