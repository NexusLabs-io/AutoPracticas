Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
batchFile = currentDir & "\INICIAR.bat"
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & batchFile & chr(34), 0
