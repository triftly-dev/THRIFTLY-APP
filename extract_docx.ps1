Add-Type -AssemblyName System.IO.Compression.FileSystem

$docxPath = 'E:\laporan kp\template_kp_sti_fik_udinus.docx'
$outputPath = 'E:\secondnesia\extracted_kp.txt'

$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$reader = New-Object System.IO.StreamReader($entry.Open())
$xml = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()

# Hapus semua XML tag
$xml = $xml -replace '<[^>]+>', ' '
$xml = $xml -replace '\s+', ' '
$text = $xml.Trim()

$text | Out-File $outputPath -Encoding UTF8
Write-Host "✅ Berhasil! File disimpan di: $outputPath"
Write-Host "📄 Preview 500 karakter pertama:"
Write-Host $text.Substring(0, [Math]::Min(500, $text.Length))
