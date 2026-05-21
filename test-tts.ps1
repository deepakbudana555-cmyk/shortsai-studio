Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = $synth.GetInstalledVoices()
Write-Host "Available voices:"
$voices | ForEach-Object { Write-Host " -" $_.VoiceInfo.Name }
$synth.SetOutputToWaveFile("F:\MY APP\public\uploads\test_tts.wav")
$synth.Speak("Hello! This is a test of the text to video voice feature in ShortsAI Studio.")
$synth.Dispose()
Write-Host "TTS_DONE"
