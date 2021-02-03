cd ./modules
for /d %%i in (*) do (
  if exist %%i/webpack.config.js (
    start webpack --config ./%%i/webpack.config.js ^& shx cp -r "./%%i/build/" "../dist/%%i/"
  )
)
IF %ERRORLEVEL% NEQ 0 (
  echo "Build Failed, Exiting"
  EXIT 1
)
