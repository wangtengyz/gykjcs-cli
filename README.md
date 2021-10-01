# `@gykjcs-cli-dev`

# 原生脚手架开发痛点分析
我们在使用lerna之前，要知道我们为什么要用lerna，我们不妨看看原生开发脚手架存在什么痛点。

1. 重复操作
* 多package本地link
* 多package安装依赖
* 多package代码提交
* 多package单元测试
* 多package代码发布

2. 版本一致性
* 发布时的版本一致性问题
* 发布后相互依赖版本升级问题

# Lerna介绍
> Lerna is a tool that optimizes the workflow around managing multi-package repositories with git and npm.

Lerna是一个优化基于git+npm的多package项目的管理工具
优势

* 大幅减少重复操作
* 提升操作的标准化

Lerna是架构优化的产物，它揭示了一个架构真理：项目复杂度提升后，就需要对项目进行架构优化。架构优化的主要目标往往都是以效能为核心。

## Lerna基础-框架搭建

[Lerna官网](https://www.lernajs.cn/)
[github地址](https://github.com/lerna/lerna)

### 前置步骤

先去[npm官网](https://www.npmjs.com/)注册一个组织，可以避免我们的包使用简短名字的时候重名，比如“@gykjcs-cli-dev/core”这样的；

## lerna开发脚手架流程

### 第一步脚手架项目初始化

* 初始化npm项目
* 安装lerna
* lerna init初始化项目

### 第二步脚手架创建package

* lerna create创建package
* lerna add 安装依赖
* lerna link链接依赖

### 第三步脚手架开发和测试

* lerna exec执行shell脚本
* lerna run 执行npm命令
* lerna clean 清空依赖
* lerna bootstrap重装依赖

### 第四步脚手架发布上线

* lerna version 更新版本
* lerna changed查看上版本以来的所有变更
* lerna diff 查看diff
* lerna publish 项目发布

## Lerna流程使用命令
```
npm init -y
npm install -g lerna (// 全局安装)
npm install lerna
lerna -v ( // 输出版本号说明安装成功)
lerna init (// 初始化lerna项目，会创建一个lerna.json)
// 经过上面init这一步，会初始化git仓库，再搞一个.gitignore 配置一些不用上传的目录
git remote xxx (// 添加远程仓库)
lerna create core (// 创建一个package)
lerna create utils(// 又创建了一个package)
lerna add (// 批量给两个package都安装依赖)
lerna publish (// 发布项目)

```

## lerna命令注意事项

#### lerna init
会自动完成git初始化，但不会创建.gitignore文件，这个必须要手动添加，否则会将node_modules目录都上传到git，如果node_modules已经加入到git stage，可使用：
```
git reset HEAD <file>
```
执行unstage操作，如果文件已经被git监听到变更，可使用：
```
git checkout -- <filename>
```
将变更作废，记得在执行操作之前将文件加入：.gitignore

##### lerna create
创建package的时候，要保证我们的组织名在npm上可以使用。需要先去npm上创建组织，防止发布的时候

#### lerna add

第一个参数：添加npm包名

第二个参数：本地package的路径(如果不加所有package都会装上此包)
选项：

--dev：将依赖安装到devDependencies，不加时安装到dependencies
```
lerna add <package> [loc] --dev
```

#### lerna link
如果未发布上线，需要手动将依赖添加到`package.json`，再执行`npm link`

#### lerna clean
只会删除node_modules，不会删除package.json中的依赖

#### lerna exec和lerna run
`--scope`属性后添加的是包名，而不是package的路径，这点和lerna add用法不同
```
lerna exec --scope @@cli-dev-zy/utils -- rm -rf node_modules
```
#### lerna publish
* 发布时会自动执行：git add package-lock.json，所以package-lock.json不要加入.gitignore文件
* 先创建远程仓库，并且同步一次master分支
* 执行lerna publish前先完成npm login
* 如果发布的npm包名为：@xxx/yyy的格式，需要先在npm注册名为：xxx的organization，否则可能会提交不成功
* 发布到npm group时默认为private，所以我们需要手动在package.json中添加如下设置
```
"publishConfig":{
  "access":"public"
}
```