$path = "src\components\auth\AuthModal.jsx"
$content = [System.IO.File]::ReadAllText($path)
$old = "    </div>`r`n  );`r`n}"
$new = "    </div>`r`n  </div>`r`n  );`r`n}"
$updated = $content.Replace($old, $new)
[System.IO.File]::WriteAllText($path, $updated)
Write-Host "Done. Total chars: $($updated.Length)"
