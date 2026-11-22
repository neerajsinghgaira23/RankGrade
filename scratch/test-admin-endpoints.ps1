$loginBody = @{
    usernameOrEmail = "admin"
    password = "admin123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginRes.data.token
Write-Host "Admin token acquired successfully."

$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "`n--- Testing /api/admin/stats ---"
$stats = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/stats" -Method Get -Headers $headers
$stats.data | ConvertTo-Json -Depth 3

Write-Host "`n--- Testing /api/admin/analytics ---"
$analytics = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/analytics" -Method Get -Headers $headers
$analytics.data | ConvertTo-Json -Depth 3

Write-Host "`n--- Testing /api/admin/attempts ---"
$attempts = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/attempts" -Method Get -Headers $headers
Write-Host "Total attempts found:" $attempts.data.Count

Write-Host "`n--- Testing /api/admin/categories ---"
$cats = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/categories" -Method Get -Headers $headers
$cats.data | ConvertTo-Json -Depth 2

Write-Host "`n--- Testing /api/admin/students ---"
$studs = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students" -Method Get -Headers $headers
$studs.data | ConvertTo-Json -Depth 2

