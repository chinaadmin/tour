@echo off
rem browser-sync node.jsģ��
echo. 
echo    path = %~dp0
echo    browser-sync start --server --files "css/*.css,html/*.html"
echo.
browser-sync start --server --files "css/*.css,html/*.html"