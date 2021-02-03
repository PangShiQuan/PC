const {sep, dirname, basename} = require('path');
const {transformFile} = require('@babel/core');
const jscrambler = require('jscrambler').default;
const getProtectionDefaultFragments = require('jscrambler/dist/get-protection-default-fragments')
  .default;
const {intoObjectType} = require('jscrambler/dist/introspection');
const gitAdd = require('./gitAdd').default;
const unzip = require('./unzip').default;
const transformConfig = require('../babel.config');

/* eslint-disable no-console */
const fileList = process.argv.slice(2);
const jscrambleConfig = {
  keys: {
    accessKey: '618A52EE73CB119D52F9B6CE1361716FD725BEA5',
    secretKey: '31D618C8D8C70982990C70EF4CC6A93D90E35FC2',
  },
  host: 'api4.jscrambler.com',
  port: 443,
  applicationId: '5b0645cd73698000154d0d5e',
  params: [
    {
      name: 'booleanToAnything',
    },
    {
      name: 'charToTernaryOperator',
    },
    {
      name: 'commaOperatorUnfolding',
    },
    {
      name: 'dotToBracketNotation',
    },
    {
      name: 'functionOutlining',
      options: {
        features: ['opaqueFunctions'],
      },
    },
    {
      name: 'identifiersRenaming',
    },
    {
      name: 'stringConcealing',
    },
    {
      name: 'stringEncoding',
      options: {
        freq: 0.5,
      },
    },
    {
      name: 'variableGrouping',
    },
    {
      name: 'constantFolding',
    },
    {
      name: 'whitespaceRemoval',
    },
    {
      name: 'duplicateLiteralsRemoval',
      options: {
        mode: ['optimization'],
      },
    },
  ],
  areSubscribersOrdered: false,
  applicationTypes: {
    webBrowserApp: true,
    desktopApp: false,
    serverApp: false,
    hybridMobileApp: false,
    javascriptNativeApp: true,
    html5GameApp: false,
  },
  languageSpecifications: {
    es5: true,
    es6: true,
    es7: false,
  },
  useRecommendedOrder: true,
};
const client = new jscrambler.Client(jscrambleConfig);

function errorHandler(res) {
  if (res.errors && res.errors.length) {
    res.errors.forEach(error => {
      throw new Error(`Error: ${error.message}`);
    });
  }

  if (res.data && res.data.errors) {
    res.data.errors.forEach(e => console.error(e.message));
    throw new Error('GraphQL Query Error');
  }

  if (res.message) {
    throw new Error(`Error: ${res.message}`);
  }

  return res;
}

function normalizeParameters(parameters) {
  let result;

  if (!Array.isArray(parameters)) {
    result = [];
    Object.keys(parameters).forEach(name => {
      result.push({
        name,
        options: parameters[name],
      });
    });
  } else {
    result = parameters;
  }

  return result;
}

// reference implementation of https://github.com/jscrambler/jscrambler/blob/master/packages/jscrambler-cli/src/index.js#L106
// changes source is removed from application once it protect and download
async function protectAndDownload(files) {
  const applicationSources = files.map((file, index) =>
    jscrambler.addApplicationSource(client, jscrambleConfig.applicationId, {
      content: file.code,
      filename: basename(file.filename).replace('obfuscate', 'min'),
      extension: 'js',
    }),
  );

  await Promise.all(applicationSources).catch(err => errorHandler(err));

  const applicationProtection = await jscrambler.createApplicationProtection(
    client,
    jscrambleConfig.applicationId,
    {bail: true},
  );

  errorHandler(applicationProtection);

  const protectionId =
    applicationProtection.data.createApplicationProtection._id;

  const protection = await jscrambler.pollProtection(
    client,
    jscrambleConfig.applicationId,
    protectionId,
    await getProtectionDefaultFragments(client),
  );

  const errors = protection.errorMessage
    ? [{message: protection.errorMessage}]
    : [];
  protection.sources.forEach(s => {
    if (s.errorMessages && s.errorMessages.length > 0) {
      if(s.filename.indexOf("index")>-1){
        return;
      }
      errors.push(
        ...s.errorMessages.map(e => ({
          filename: s.filename,
          ...e,
        })),
      );
    }
  });

  if (protection.state === 'errored') {
    errors.forEach(e =>
      console.error(
        `Error: "${e.message}"${
          e.filename ? `in ${e.filename}${e.line ? `:${e.line}` : ''}` : ''
        }`,
      ),
    );
    throw new Error('Protection failed');
  }

  console.log(`Proctection ID: ${protectionId}`);

  const download = await jscrambler.downloadApplicationProtection(
    client,
    protectionId,
  );

  errorHandler(download);

  const fileNames = files.map(
    ({filename}) =>
      dirname(filename) + sep + basename(filename).replace('obfuscate', 'min'),
  );

  const unzipRes = await unzip(download, fileNames);

  gitAdd(unzipRes);
  unzipRes.forEach(async (filepath, index) => {
    const removal = await jscrambler.removeSourceFromApplication(
      client,
      basename(filepath),
      jscrambleConfig.applicationId,
    );

    console.log(JSON.stringify(removal));
  });
}

async function updateApplicationProtectionConfig() {
  const updateData = {
    _id: jscrambleConfig.applicationId,
  };

  if (jscrambleConfig.params && Object.keys(jscrambleConfig.params).length) {
    updateData.parameters = normalizeParameters(jscrambleConfig.params);
    updateData.areSubscribersOrdered = Array.isArray(jscrambleConfig.params);
  }
  if (typeof jscrambleConfig.areSubscribersOrdered !== 'undefined') {
    updateData.areSubscribersOrdered = jscrambleConfig.areSubscribersOrdered;
  }
  if (jscrambleConfig.applicationTypes) {
    updateData.applicationTypes = jscrambleConfig.applicationTypes;
  }
  if (typeof jscrambleConfig.useRecommendedOrder !== 'undefined') {
    updateData.useRecommendedOrder = jscrambleConfig.useRecommendedOrder;
  }
  if (jscrambleConfig.languageSpecifications) {
    updateData.languageSpecifications = jscrambleConfig.languageSpecifications;
  }

  if (
    updateData.parameters ||
    updateData.applicationTypes ||
    typeof updateData.areSubscribersOrdered !== 'undefined'
  ) {
    const applicationUpdate = await intoObjectType(
      client,
      updateData,
      'Application',
    );
    const updateApplicationRes = await jscrambler.updateApplication(
      client,
      applicationUpdate,
    );

    errorHandler(updateApplicationRes);
  }
}

updateApplicationProtectionConfig();

const filesInTransform = fileList.map(
  (filename, index) =>
    new Promise((resolve, reject) => {
      transformFile(filename, transformConfig, (err, result) => {
        if (result && result.code)
          resolve({
            filename,
            code: result.code,
          });
        else reject(err);
      });
    }),
);

Promise.all(filesInTransform)
  .then(([...transformedFile]) => protectAndDownload(transformedFile))
  .catch(err => {
    throw new Error(err);
  });
