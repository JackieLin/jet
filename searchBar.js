let data = [];
let query = {};
// 初始化下标，缓存在内存
let currentIndex = 0;
let lastIndex = 0;
const pageNum = 17;
const itemHeight = 22;

/**
 * 根据关键字搜索，按照路径匹配
 * @param {Array} list 列表
 * @param {String} keyword 关键字信息
 */
function searchListByKeyWord(list, keyword) {
    return list.map(function (v) {
        if (v.path.indexOf(keyword) >= 0) {
            return v;
        }
        return null;
    }).filter(function (v) { return v && v.type === 'blob'; });
}

/**
 * 根据用户传入的文件列表渲染
 * @param {Array} list
 */
function renderFileList(list) {
    const keyword = $('.jet-keyword-input').val();
    const searchList = searchListByKeyWord(list, keyword);
    let html = '';
    if (searchList.length) {
        html = searchList.map(function (v, ix) {
            const fileName = v.path.substring(v.path.lastIndexOf('/') + 1);
            return `<li class="${ix ? '' : 'active'}" data-path="${v.path}">
                <span>${fileName}</span>
                ${v.path}
            </li>`
        }).join('');
    } else {
        html = '<li class="active"><span>无搜索结果</span></li>';
    }
    // 每次渲染前需要初始化高亮的下标
    currentIndex = 0;
    lastIndex = searchList.length - 1;
    $('.jet-file-list').html(html);
}

/**
 * 在 body 中注入 dom
 */
$('body').append(`
    <div class="jet-search-bar">
        <div class="jet-keyword-container">
            <input class="jet-keyword-input" type="text" placeholder="请输入文件关键字" autofocus/>
        </div>
        <div class="jet-content-container">
            <ul class="jet-file-list">
                <li class="active">
                    <span>正在请求数据，请稍候...</span>
                </li>
            </ul>
        </div>
    </div>
`);

/*
 * 事件监听
 */
$(document).on('keydown', throttle(function (event) {
    const searchBar = $('.jet-search-bar');
    // 用户按住了 cmd+p 快捷键，唤起
    if (String.fromCharCode(event.keyCode) === 'P' && event.metaKey && !searchBar.hasClass('show')) {
        // 禁止系统弹出打印信息
        event.preventDefault();
        // 每次显示前清空搜索信息
        searchBar.find('.jet-keyword-input').val('');
        renderFileList(data);
        searchBar.addClass('show');
        searchBar.find('.jet-keyword-input').focus();

        $('html, body').css({
            overflow: 'hidden'
        });
    }

    // 用户按下了 esc 键
    if (String(event.keyCode) === '27') {
        searchBar.removeClass('show');
        $('html, body').css({
            overflow: 'auto'
        });
    }

    // 用户按下了上方向键, 向上高亮
    if (String(event.keyCode) === '38' && currentIndex > 0) {
        const $child = $('.jet-file-list').children();
        // 滚动条向下滚动
        const offset = currentIndex - pageNum;
        if (offset > 0) {
            $('.jet-content-container').scrollTop(itemHeight * (offset - 1));
        }
        
        $child.eq(currentIndex).removeClass('active');
        $child.eq(currentIndex - 1).addClass('active');
        currentIndex--;
    }

    // 用户按下了下方向键, 向下高亮
    if (String(event.keyCode) === '40' && currentIndex < lastIndex && lastIndex > 0) {
        const $child = $('.jet-file-list').children();
        // 滚动条向下滚动
        const offset = currentIndex - pageNum;
        if (offset >= 0) {
            $('.jet-content-container').scrollTop(itemHeight * (offset + 1));
        }
        $child.eq(currentIndex).removeClass('active');
        $child.eq(currentIndex + 1).addClass('active');
        currentIndex++;
    }

    // 当用户按下 enter 的时候, 跳转 url
    if (String(event.keyCode) === '13') {
        const path = $('.jet-file-list').children().eq(currentIndex).attr('data-path');
        if (path) {
            window.open(`https://${query.hostname}/${query.owner}/${query.repo}/blob/${query.sha}/${path}`, '_blank');
        }
    }
}))

$('body').on('input', '.jet-keyword-input', function (event) {
    renderFileList(data);
});


// 接收来自 background 的信息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    data = request.data.tree || [];
    query = request.query;
    renderFileList(data);
});