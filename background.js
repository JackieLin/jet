/**
 * 通过 url 获取必要的参数信息
 * 支持匹配两种方式，1. github.com/:owner/:repo   2. github.com/:owner/:repo/tree/:sha
 * @param {String} url 
 */
function getMessageByUrl(url) {
    const result = {};
    const link = document.createElement('a');
    link.href = url;
    const pathname = link.pathname.slice(1);
    const params = pathname.split('/');
    result.hostname = link.hostname;
    if (params.length > 0) {
        result.owner = params[0];
        result.repo = params[1];
        if (params[3]) {
            result.sha = params[3];
        } else {
            result.sha = 'master';
        }
    }

    return result;
}

/**
 * 发送 github trees 请求
 * @param {Object} data 发送请求
 */
function sendGitTreesRequest(data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 
        `https://api.github.com/repos/${data.owner}/${data.repo}/git/trees/${data.sha}?recursive=1&_=${new Date().getTime()}`,
        true
    );
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            callback(JSON.parse(xhr.responseText));
        }
    }
    xhr.send();
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.get(tabId, function(tab) {
        const url = tab.url;        
        /*
         * github api 获取 repo 中的数据
         * wiki: https://developer.github.com/v3/git/trees/
         * eg: GET /repos/:owner/:repo/git/trees/:sha?recursive=1
         */
        const query = getMessageByUrl(url);
        if (query.hostname === 'github.com' && query.owner) {
            sendGitTreesRequest(query, function(data) {
                // 数据收集成功，推送给前端解析展示
                chrome.tabs.sendMessage(tabId, {
                    data,
                    query
                });
            });
        }
    })
})