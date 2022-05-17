'use strict';

const axios = require('axios');
const urlJoin = require('url-join'); // url地址拼接
const semver = require('semver');

// 获取npm-info信息
function getNpmInfo(npmName, registry) {
  // TODO
  if (!npmName) return null;
  const registryUrl = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(registryUrl, npmName);
  return axios.get(npmInfoUrl).then(res => {
    if ( res.status === 200 ) {
      return res.data;
    }
    return null;
  }).catch(err => {
    return Promise.reject(err);
  })
}

// 通过npm源还是淘宝源获取
function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}

// 获取当前包的版本号数组
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return []
  }
}

// 获取所有满足条件的版本号
function getSemverVersions(baseVersion, versions) {
  return versions.filter(version => semver.satisfies(version, `^${baseVersion}`)).sort((a, b) => semver.gt(b, a) ? 1 : -1);
}

// 获取最新的当前npm包版本
async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersions = getSemverVersions(baseVersion, versions);
  if (newVersions && newVersions.length > 0) {
    return newVersions[0];
  }
  return null;
}

module.exports = { 
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion, 
};
