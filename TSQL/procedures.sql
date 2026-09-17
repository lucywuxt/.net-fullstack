-- CREATE OR ALTER PROCEDURE addDept(
--     @deptName VARCHAR(20),
--     @deptLocation VARCHAR(20)
-- ) AS
-- BEGIN
--     DECLARE @formattedLocation VARCHAR(20) = UPPER(@deptLocation)
--     INSERT INTO dept_info VALUES(@deptName, @formattedLocation)
-- END
-- EXEC addDept 'Cafeteria', 'Paris'
-- SELECT * FROM dept_info

----------------------------------------------------------

-- CREATE TABLE credInfo(
--     userName VARCHAR(20) PRIMARY KEY,
--     pwd VARCHAR(20) constraint ck_pwdLen CHECK(len(pwd) >= 3)
-- )

-- INSERT INTO credInfo VALUES('user1', '111')
-- INSERT INTO credInfo VALUES('user2', '222')
-- INSERT INTO credInfo VALUES('user3', '333')
-- INSERT INTO credInfo VALUES('user4', '444')
-- INSERT INTO credInfo VALUES('user5', '555')

-- CREATE PROCEDURE credSP(
--     @uName VARCHAR(20),
--     @pwd VARCHAR(20),
--     @newPwd VARCHAR(20) = '',
--     @action VARCHAR(20),
--     @result VARCHAR(40) OUTPUT
-- ) AS
-- BEGIN
--     if @action = 'login'
--     BEGIN
--         -- count how many credentials matches
--         DECLARE @loginreult INT = (SELECT count(*) FROM credInfo WHERE userName = @uName AND pwd = @pwd)
--         IF(@loginreult = 1)
--             SET @result = 'Login Successful'
--         ELSE
--             SET @result = 'Invalid Credentials'
--     END

--     else if @action = 'new user'
--     BEGIN
--         INSERT INTO credInfo VALUES(@uName, @pwd)
--         SET @result = 'User Added Successfully'
--     END

--     else if @action = 'change password'
--     BEGIN 
--         UPDATE credInfo SET pwd = @newPwd WHERE userName = @uName
--         SET @result = 'Password Changed'
--     END

--     else if @action = 'delete account' 
--     BEGIN
--         DELETE FROM credInfo WHERE userName = @uName
--         SET @result = 'Account Deleted'
--     END

--     else SET @result = 'Invalid Operation'
-- END;

-- SELECT * FROM credInfo

-- DECLARE @res VARCHAR(40)
-- EXEC credSP 'user5', '555', '', 'login', @res output
-- PRINT @res

----------------------------------------------------------

-- create table bankAccount
-- (
--     accNo int,
--     accName varchar(20),
--     accType varchar(20),
--     accBalance int,
--     accIsActive bit
-- )

-- insert into bankAccount values(101,'Lucy','Savings', 3000, 0)
-- insert into bankAccount values(103,'Bill','Checking', 2000, 0)

ALTER procedure bankAccountProc
(
    @action varchar(10),
    @accNo int out, 
    @accName varchar(20),
    @accType varchar(20),
    @accBal int,
    @accIsActive bit,
    @accTransAmt int,
    @transferToAccNo int,
    @result varchar(60) out
) as
begin
    if (@action = 'newAcc')
    begin
        declare @newAccNo int = (select max(accNo) + 1 from bankAccount)
        insert into bankAccount values(@newAccNo, upper(@accName), @accType, @accBal, @accIsActive)
        set @result = 'Account created, new account number  is : ' + convert(varchar, @newAccNo)
    end

    else if(@action = 'DelAcc')
    begin
        delete from bankAccount where accNo = @accNo
        set @result = 'Account deleted successfully.'
    end

    else if(@action = 'Withdraw')
    begin
        update bankAccount set accBalance = accBalance - @accTransAmt where accNo = @accNo
        --we can select the new transaction number from transaction table and return the transaction number to user
        set @result = 'Withdraw successfully.'
    end

    else if(@action = 'Deposit')
    begin
        update bankAccount set accBalance = accBalance + @accTransAmt where accNo = @accNo
        --we can select the new transaction number from transaction table and return the transaction number to user
        set @result = 'Deposit successfully.'
    end

    else if(@action = 'Transfer')
    begin
        update bankAccount set accBalance = accBalance - @accTransAmt where accNo = @accNo
        update bankAccount set accBalance = accBalance + @accTransAmt where accNo = @transferToAccNo
        set @result = 'Transfer successfully.'
    end

    else
        set @result = 'Invalid Action'
end

-- create a new saving account for Harry with $70
declare @res1 varchar(70)
exec bankAccountProc 'newAcc',0,'Harry','Saving',70,0,0,0,@res1 out
print @res1
        
-- transfer $10 from Lucy (101) to Harry (102)
declare @res2 varchar(70)
exec bankAccountProc 'Transfer',101,'','',0,0,10,102,@res2 out
print @res2

-- withdraw $500 from Bill (103)
declare @res3 varchar(70)
exec bankAccountProc 'Withdraw',103,'','',0,0,500,0,@res3 out
print @res3

-- deposit $10 to Harry (102)
declare @res4 varchar(70)
exec bankAccountProc 'Deposit',102,'','',0,0,10,0,@res4 out
print @res4

select * from bankAccount