'use strict';

const log = require('npmlog');

// 判断debug模式；default level,低于的info（2000）不显示
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

// 前缀
log.heading = 'gykjcs';
log.headingStyle = { fg: 'blue', bg: 'black' }

// 自定义日志样式
log.addLevel('success', 2000, { fg: 'green', bold: true });

module.exports = log;