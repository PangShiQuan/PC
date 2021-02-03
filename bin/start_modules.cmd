cd ./modules
for /d %%i in (*) do (
  if exist %%i/webpack.config.js (
    start nodemon --watch webpack-parts/  --watch ./%%i/webpack.config.js --exec "webpack-dev-server --config ./%%i/webpack.config.js"
  )
)
