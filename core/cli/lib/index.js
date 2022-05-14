'use strict';
module.exports = core;

// require： .js/.json/.node
// .js -> module.exports/exports 
// .json -> JSON.parse
// .node -> c++ 解析
// any -> 当js文件执行
const semver = require('semver'); // node版本号比较工具
const colors = require('colors/safe'); // 字体颜色工具

const log = require('@gykjcs-cli-dev/log');
const pkg = require('../package.json');
const constant = require('./constant');

function core(params) {
    // TODO
    try {
      checkPkgVersion();
      checkNodeVersion();
      checkRoot();
    } catch (error) {
      log.error(error.message);
    }

}

// 检查版本号
function checkPkgVersion() {
  log.notice('当前cli版本', pkg.version); // 版本号提示
  // log.success('success', 'test......'); // 自定义日志demo
}

// 检查node版本 设置最低node版本号
function checkNodeVersion() {
  // 第一步 获取当前node版本号
  const currentVersion = process.version;
  // 第二步 比对最低版本
  const lowestVersion = constant.LOWEST_NODE_VERSION; 
  if(!semver.gte(currentVersion,lowestVersion)) {
    throw new Error(colors.red(`gykjcs-cli-dev 需要安装v${lowestVersion} 以上版本的 Node.js`));
  }
}

// 检查root账号权限和自动降级,防止出现莫名权限报错问题 
function checkRoot() {
  const rootCheck = require('root-check'); // 如果是root用户权限自动降级普通
  rootCheck();
  console.log(process.geteuid()); // 普通501  管理员 0
}