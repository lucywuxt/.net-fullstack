-- NEW TABLES (emp_info & dept_info) NEW EXAMPLES --

INSERT INTO dept_info VALUES('HR', 'DC');
INSERT INTO dept_info VALUES('Accounts', 'New York');
INSERT INTO dept_info VALUES('IT', 'Chicago');
INSERT INTO dept_info VALUES('Training', 'Potomac');
INSERT INTO dept_info VALUES(null, 'Potomac');

INSERT INTO emp_info VALUES('Lucy', null, 1000.00, null);
INSERT INTO emp_info VALUES('Josh', 'Developer', 5000.00, 30);
INSERT INTO emp_info VALUES('Vivi', null, 5000.00, 30);
INSERT INTO emp_info VALUES('Lily', 'HR', 2000.00, 10);
INSERT INTO emp_info VALUES('Anna', null, 0.0, 10);
INSERT INTO emp_info VALUES('Emma', 'Trainer', 100.00, 40);

-- Cartisian Product/Cross Join
select * from dept_info, emp_info

-- Equi join/Inner join
select empNo, empName, deptNo, deptLocation, deptName from emp_info 
join dept_info on emp_info.empDeptNo = dept_info.deptNo

-- Left join
select empNo, empName, deptNo, deptLocation, deptName from emp_info 
left join dept_info on emp_info.empDeptNo = dept_info.deptNo

-- Right join
select empNo, empName, deptNo, deptLocation, deptName from emp_info 
right join dept_info on emp_info.empDeptNo = dept_info.deptNo

-- Full join
select empNo, empName, deptNo, deptLocation, deptName from emp_info 
full join dept_info on emp_info.empDeptNo = dept_info.deptNo

-- Null join
select empNo, empName, deptNo, deptLocation, deptName from emp_info 
full join dept_info on emp_info.empDeptNo = dept_info.deptNo 
where emp_info.empDeptNo is null

-- Self join
UPDATE emp_info
SET empManager = CASE empNo
    WHEN 1 THEN NULL  -- Lucy has no manager
    WHEN 2 THEN 1     -- Josh reports to Lucy
    WHEN 3 THEN 1     -- Vivi reports to Lucy
    WHEN 4 THEN 1     -- Lily reports to Lucy
    WHEN 5 THEN 4     -- Anna reports to Lily
    WHEN 6 THEN 1     -- Emma reports to Lucy
END;
SELECT * FROM emp_info

SELECT e1.empName + ' reports to ' + e2.empName [Reports To]
FROM emp_info e1 JOIN emp_info e2 
ON e2.empNo = e1.empManager

SELECT 
    e2.empName AS Manager, 
    COUNT(e1.empNo) AS [Team Memebers]
FROM emp_info e1 
JOIN emp_info e2 
    ON e1.empManager = e2.empNo
GROUP BY e2.empName; 