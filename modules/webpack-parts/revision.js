const GitRevisionPlugin = require('git-revision-webpack-plugin');
const webpack = require('webpack');
const {version} = require('../../package.json');

const attachRevision = ({branch = false, lightweightTags = false} = {}) => {
  const gitRevision = new GitRevisionPlugin({
    branch,
    lightweightTags,
    commithashCommand: 'rev-parse --short HEAD',
    versionCommand: 'describe --always --tags --dirty',
  });

  return {
    plugins: [
      new webpack.BannerPlugin({
        // suppose to use release tag
        banner: `${version}-${gitRevision.commithash()}`,
      }),
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(gitRevision.version()),
        COMMITHASH: JSON.stringify(gitRevision.commithash()),
        BRANCH: JSON.stringify(gitRevision.branch()),
      }),
    ],
  };
};

module.exports = attachRevision;
