/**
 * 在 body 中注入 dom
 */
$('body').append(`
    <div class="search-bar">
        <div class="keyword-container">
            <input class="keyword-input" type="text" placeholder="请输入文件关键字" autofocus/>
        </div>
        <ul class="file-list">
            <li class="active">
                <span>package.json</span>
                website
            </li>
            <li>
                <span>App.js</span>
            </li>
        </ul>
    </div>
`);

/*
 * 事件监听
 */
$(window).on('keydown', function(event) {
    const searchBar = $('.search-bar');
    // 用户按住了 cmd+p 快捷键，唤起
    if (String.fromCharCode(event.keyCode) === 'P' && event.metaKey && !searchBar.hasClass('show')) {
        event.preventDefault();
        searchBar.addClass('show');
        searchBar.find('.keyword-input').attr('autofocus');
    }

    // 用户按下了 esc 键
    if (String(event.keyCode) === '27') {
        searchBar.removeClass('show');
    }
});