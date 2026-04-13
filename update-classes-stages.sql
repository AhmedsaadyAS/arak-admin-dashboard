-- Update existing classes to add Stage values
-- Run this in SQL Server Management Studio or Azure Data Studio

-- Update Grade 4 classes to primary stage
UPDATE Classes 
SET Stage = 'primary', Grade = 'Grade 4'
WHERE Name LIKE '%Grade 4%';

-- Update Grade 5 classes to primary stage  
UPDATE Classes
SET Stage = 'primary', Grade = 'Grade 5'
WHERE Name LIKE '%Grade 5%';

-- Update Grade 7 classes to preparatory stage
UPDATE Classes
SET Stage = 'preparatory', Grade = 'Grade 7'
WHERE Name LIKE '%Grade 7%';

-- Update Grade 8 classes to preparatory stage
UPDATE Classes
SET Stage = 'preparatory', Grade = 'Grade 8'
WHERE Name LIKE '%Grade 8%';

-- Update Grade 10 classes to secondary stage
UPDATE Classes
SET Stage = 'secondary', Grade = 'Grade 10'
WHERE Name LIKE '%Grade 10%';

-- Update Grade 11 classes to secondary stage
UPDATE Classes
SET Stage = 'secondary', Grade = 'Grade 11'
WHERE Name LIKE '%Grade 11%';

-- Verify the updates
SELECT Id, Name, Grade, Stage, Description FROM Classes;
