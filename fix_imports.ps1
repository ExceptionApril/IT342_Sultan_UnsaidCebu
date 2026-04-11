Get-ChildItem -Path 'Z:\L13Y12W35\IT342_Sultan_UnsaidCebu\unsaidcebu\unsaidcebu\src\main\java' -Recurse -Filter '*.java' | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace 'jakarta\.', 'javax.'
    Set-Content -Path $_.FullName -Value $newContent -NoNewline
}
Write-Host "Done - replaced jakarta with javax in all .java files"
