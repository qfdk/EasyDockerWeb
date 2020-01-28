const {override, fixBabelImports, addLessLoader, addDecoratorsLegacy} = require('customize-cra');
const modifyVars = require('./lessVars')
module.exports = override(
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
    addDecoratorsLegacy(),
    addLessLoader({
        javascriptEnabled: true,
        modifyVars,
    }),
);