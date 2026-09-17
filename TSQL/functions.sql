-- create function greetUser(@userName varchar(30))
-- returns varchar(max)
-- as
-- begin
--     return 'Hello and Welcome to TSQL ' + @userName
-- end
-- select dbo.greetUser ('Lucy') as Greetings

----------------------------------------------------------

-- create function calculate(@num1 int, @num2 int, @opt char)
-- returns int
-- as
-- begin
--     declare @result int = 0;
--     if(@opt = '+')
--     begin
--         set @result = @num1 + @num2;
--     end

--     else if (@opt = '-')
--     begin
--         set @result = @num1 - @num2;
--     end

--     else if (@opt = '*')
--     begin
--         set @result = @num1 * @num2;
--     end

--     else if (@opt = '/')
--     begin
--         set @result = @num1 / @num2;
--     end

--     return @result;
-- end

-- SELECT dbo.calculate(10,5,'+') AS calculate

---------------------------------------------

CREATE FUNCTION dbo.CTC
(
    @Education NVARCHAR(50),
    @YearsExperience INT
)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @EducationSalary DECIMAL(18,2);
    DECLARE @ExperienceSalary DECIMAL(18,2);
    DECLARE @TravelAllowance DECIMAL(18,2) = 750; -- Travel Allowance = $750
    DECLARE @FoodCoupons DECIMAL(18,2) = 900; -- Food Coupons = $900
    DECLARE @TaxRate DECIMAL(5,4) = 0.075; -- 7.5% tax
    DECLARE @GrossMonthly DECIMAL(18,2);
    DECLARE @NetMonthly DECIMAL(18,2);
    DECLARE @AnnualCTC DECIMAL(18,2);

    -- Education-based monthly salary
    SET @EducationSalary = 
        CASE @Education
            WHEN 'Elementary' THEN 2000
            WHEN 'Middle'     THEN 3000
            WHEN 'High School' THEN 4000
            WHEN 'Masters'    THEN 6000
            ELSE 0
        END;

    -- Experience-based monthly salary
    SET @ExperienceSalary =
        CASE 
            WHEN @YearsExperience BETWEEN 0 AND 3  THEN 500
            WHEN @YearsExperience > 3 AND @YearsExperience <= 6 THEN 1500
            WHEN @YearsExperience > 6 AND @YearsExperience <= 10 THEN 2500
            WHEN @YearsExperience > 10 THEN 4000
            ELSE 0
        END;

    -- Gross monthly = education + experience + allowances
    SET @GrossMonthly = @EducationSalary + @ExperienceSalary + @TravelAllowance + @FoodCoupons;

    -- Apply 7.5% tax deduction
    SET @NetMonthly = @GrossMonthly - (@GrossMonthly * @TaxRate);

    -- Annualize
    SET @AnnualCTC = @NetMonthly * 12;

    RETURN @AnnualCTC;
END

-- returns annual salary of a Master with 6 years of experiences
-- SELECT dbo.CTC('Masters', 6) 

----------------------------------------------------------