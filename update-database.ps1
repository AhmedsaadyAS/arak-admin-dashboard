# PowerShell script to update Classes table with Stage values
# Run this from PowerShell in the project directory

Write-Host "Updating Classes with Stage values..." -ForegroundColor Cyan

# SQL command to update the database
$sql = @"
UPDATE Classes 
SET Stage = 'primary', Grade = 'Grade 4'
WHERE Name LIKE '%Grade 4%';

UPDATE Classes
SET Stage = 'preparatory', Grade = 'Grade 7'
WHERE Name LIKE '%Grade 7%';

UPDATE Classes
SET Stage = 'preparatory', Grade = 'Grade 8'
WHERE Name LIKE '%Grade 8%';

UPDATE Classes
SET Stage = 'secondary', Grade = 'Grade 10'
WHERE Name LIKE '%Grade 10%';

UPDATE Classes
SET Stage = 'secondary', Grade = 'Grade 11'
WHERE Name LIKE '%Grade 11%';

SELECT Id, Name, Grade, Stage, Description FROM Classes;
"@

Write-Host "SQL to execute:" -ForegroundColor Yellow
Write-Host $sql
Write-Host "`nPlease run this SQL in SQL Server Management Studio or use the .sql file" -ForegroundColor Green
