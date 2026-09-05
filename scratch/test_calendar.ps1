$holidays = Invoke-RestMethod -Uri 'http://localhost:5001/api/calendar/holidays' -Method Get
Write-Host "Holidays loaded from SQLite: $($holidays.Count)"
foreach ($h in $holidays | Select-Object -First 3) {
    Write-Host " - $($h.date): $($h.name) [$($h.type)]"
}

$settings = Invoke-RestMethod -Uri 'http://localhost:5001/api/calendar/settings' -Method Get
Write-Host "Calendar Settings from SQLite:"
Write-Host " - Shift: $($settings.shiftStartTime) to $($settings.shiftEndTime)"
Write-Host " - Grace Period: $($settings.gracePeriodMinutes) mins"
Write-Host " - Half Day: $($settings.halfDayThresholdHours) hrs"
Write-Host " - Full Day: $($settings.fullDayThresholdHours) hrs"
Write-Host " - Weekly Off Days: $($settings.weeklyOffDays -join ', ')"
