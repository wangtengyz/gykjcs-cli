'use strict';
module.exports = core;

// require引入文件： .js/.json/.node
// .js -> module.exports/exports 
// .json -> JSON.parse
// .node -> c++ 解析
// any -> 当js文件执行
const path = require('path');
const semver = require('semver'); // node版本号比较工具
const colors = require('colors/safe'); // 字体颜色工具
const userHome = require('user-home'); // 获取用户主目录
const pathExists = require('path-exists'); // 判断目录是否存在
const commander = require('commander'); // 脚手架命令注册库

const log = require('@gykjcs-cli-dev/log');
const init = require('@gykjcs-cli-dev/init');
const pkg = require('../package.json');
const constant = require('./constant');

let args;
const program = new commander.Command(); // 生成commander实例对象

async function core(params) {
  // TODO
  try {
    // 第一阶段：脚手架启动过程
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    // checkInputArgs();
    checkEnv();
    await checkGlobalUpdate();
    // log.verbose('debug', 'test debug log'); // 开启debug模式的信息展示
    // 第二阶段：脚手架命令注册过程
    registerCommand()
  } catch (error) {
    log.error(error.message);
  }
}

// 脚手架命令注册
function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)

  // 项目初始化命令注册
  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制初始化项目')
    .action(init)

  // debug模式处理 
  program.on('option:debug', function () {
    if (program.debug) {
      process.env.LOWEST_LEVEL = 'verbose';
    } else {
      process.env.LOWEST_LEVEL = 'info';
    }
    log.level = process.env.LOWEST_LEVEL;
    log.verbose('debug test');
  })

  // 未知命令进行监听
  program.on('command:*', function (obj) {
    // 获取所有可用命令 给出友好提示
    const availableCommands = program.commands.map(cmd => cmd.name());
    console.log(colors.red('未知命令：' + obj[0]));
    console.log(colors.red('可用命令：' + availableCommands.join(',')));
  })

  program.parse(process.argv);

  // 没有输入命令给出帮助提示
  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }

}

// 检查包版本号
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
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`gykjcs-cli-dev 需要安装v${lowestVersion} 以上版本的 Node.js`));
  }
}

// 检查root账号权限和自动降级,防止出现莫名权限报错问题 
function checkRoot() {
  const rootCheck = require('root-check'); // 如果是root用户权限自动降级普通
  rootCheck();
  // console.log(process.geteuid()); // 普通501  管理员 0
}

// 检查用户主目录
function checkUserHome() {
  // console.log('userHome', userHome);
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登陆用户主目录不存在'))
  }
}

// 检查输入参数
function checkInputArgs() {
  const minimist = require('minimist'); // 脚手架参数解析
  args = minimist(process.argv.slice(2));
  checkArgs(); // 检查是否开发debug模式
}

// 检查log是否debug开启
function checkArgs() {
  if (args.debug) {
    process.env.LOWEST_LEVEL = 'verbose'; // debug级别 log显示
  } else {
    process.env.LOWEST_LEVEL = 'info'; // 正常log信息显示
  }
  log.level = process.env.LOWEST_LEVEL;
}

// 检查环境变量
function checkEnv() {
  const dotenv = require('dotenv');
  const dotenvPath = path.resolve(userHome, '.env'); // 读取根目录.env文件路径
  if (pathExists(dotenvPath)) {
    // 解析对应.env文件配置赋值到process.env的库
    dotenv.config({
      path: dotenvPath,
    });
  }
  createDefaultConfig()
  log.verbose('环境变量', process.env);
}

// 创建默认环境变量配置
function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

// 检查更新
async function checkGlobalUpdate() {
  // 1.获取当前版本号和模块名
  const { version: currentVersion, name: npmName } = pkg;
  // 2.调取npmAPI获取所有版本号
  const { getNpmSemverVersion } = require('@gykjcs-cli-dev/get-npm-info');
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  // 3.获取最新版本号, 如果用户小于最新版本，提示用户更新到最新版本
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动更新${npmName}, 当前版本：${currentVersion}, 最新版本：${lastVersion}
    更新命令：npm install -g ${npmName}`)
    )
  }

}