#!/usr/bin/env node

const importLocal = require('import-local');
// __dirname 表示当前文件所在的目录的绝对路径
// __filename 表示当前文件的绝对路径
if(importLocal(__filename)) {
  rquire('npmlog').info('cli', '正在使用gykjcs-cli-dev本地版本')
} else {
  require('../lib')(process.argv.slice(2))
}