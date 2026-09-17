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

create procedure bankAccountProc
(
    @action varchar(10),
    @accNo int,
    @accName varchar(20), 
    @accType varchar(20),
    @accBal int,
    @accIsActive bit,
    @accTransAmt int,
    @accTransferToAccNo int,
    @result varchar(30) out
)
as
begin
    if (@action = 'newAcc')
    begin
        declare @newAccNo int = (select max(accNo) + 1 from bankAccount)
        insert into bankAccount (accNo, accName, accType, accBalance, accIsActive)
        values(@newAccNo, upper(@accName), @accType, @accBal, @accIsActive);
        set @result = 'Account Created, new Account Number is : ' + convert(varchar, @newAccNo);
    end
    else if (@action = 'DelAcc')
    begin
        delete from bankAccount where accNo = @accNo
        set @result = 'Account Deleted Successfully'
    end
    else if (@action = 'Withdraw')
    begin
        update bankAccount set accBalance = accBalance - @accTransAmt
        set @result = 'Withdrawal Successful'
    end
    else if (@action = 'Deposit')
    begin
        update bankAccount set accBalance = accBalance + @accTransAmt
        set @result = 'Deposit Successful'
    end
    else if (@action = 'Transfer')
    begin
        update bankAccount set accBalance = accBalance - @accTransAmt where accNo = @accNo
        update bankAccount set accBalance = accBalance + @accTransAmt where accNo = @accTransferToAccNo
        set @result = 'Transfer Successful'
    end
    else
    begin
        set @result = 'Invalid Action'
    end

end