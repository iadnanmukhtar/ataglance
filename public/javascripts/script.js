$(document).ready(function () {

    function highlightAnchor() {
        if (window.location.hash) {
            console.log(window.location.hash);
            $('#'+$(window.location.hash).data('id')).click();
        }
        return true;
    }

    function getBookmarks() {
        var bookmarks = [];
        var bookmarksVal = localStorage.getItem('bookmarks');
        if (bookmarksVal)
            bookmarks = JSON.parse(bookmarksVal);
        return bookmarks;
    }

    function showBookmarks() {
        var bookmarks = getBookmarks();
        if (bookmarks.length > 0) {
            $('.fa-bookmark').each(function (i, elem) {
                for (var i = 0; i < bookmarks.length; i++) {
                    if ($(this).data('id') == bookmarks[i]) {
                        $(this).removeClass('far');
                        $(this).addClass('fas');
                    }
                }
            });
        }
    }

    function showBookmarksList() {
        var bookmarks = getBookmarks();
        var html = '';
        if (bookmarks.length > 0) {
            for (var i = 0; i < bookmarks.length; i++) {
                html += '<li><a class="dropdown-item" href="#TOPICHEAD_' + bookmarks[i]
                    + '"><i class="fas fa-bookmark"></i>&nbsp;' + bookmarks[i].replace(/_/, ':') + '</li>';
            }
            html += '<li><hr class="dropdown-divider"></li>'
        }
        html += '</ul>';
        $("#BOOKMARKS").html(html);
    }

    $('.fa-bookmark').click(function () {
        var id = $(this).data('id');
        var bookmarks = getBookmarks();
        if ($(this).hasClass('far')) {
            bookmarks.push(id);
            $(this).removeClass('far');
            $(this).addClass('fas');
        } else if ($(this).hasClass('fas')) {
            bookmarks = bookmarks.filter(function (value, i, arr) {
                return value != id;
            });
            $(this).removeClass('fas');
            $(this).addClass('far');
        }
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        showBookmarksList();
    });

    $('.tag').click(function () {
        location.href = '/t/' + $(this).html();
    });

    $('.list-group-item').click(function () {
        var topic = $(this);
        var id = topic.data('id');
        var topicsDetail = $(topic.attr('data-bs-target'));
        var text = topicsDetail.find('.card-body .text');
        var trans = topicsDetail.find('.card-body .trans');
        $.get({
            url: '/r/' + id
        }).done(function (data) {
            var content = '';
            for (var i = 0; i < data.text.length; i++) {
                content += (data.text[i].key ? '<em>' : '') + data.text[i].text 
                    + '&nbsp;<span title="' + data.text[i].index + '">۝</span>' + (data.text[i].key ? '</em>' : '') + ' ';
            }
            text.html(content);
            content = '';
            for (var i = 0; i < data.trans.length; i++) {
                content += (data.text[i].key ? '<em>' : '') + '<sup>';
                if (i == 0)
                    content += id.split('_')[0] + ':' + data.trans[i].index;
                else
                    content += data.trans[i].index;
                content += '</sup>&nbsp;' + data.trans[i].text
                    + (data.text[i].key ? '</em>' : '') + ' ';
            }
            trans.html(content);
            gtag('event', 'view', {
                "topics": id
            });
            topic.addClass('active');
            topic.find('.collapse-icon').removeClass('fa-chevron-down');
            topic.find('.collapse-icon').addClass('fa-chevron-up');
        });
    });

    $('.topics-detail').on('hidden.bs.collapse', function (event) {
        var detailId = event.target.id;
        var id = $('#' + detailId).data('id');
        var topic = $('#TOPICHEAD_' + id);
        topic.removeClass('active');
        topic.find('.collapse-icon').removeClass('fa-chevron-up');
        topic.find('.collapse-icon').addClass('fa-chevron-down');
    });

    highlightAnchor();
    showBookmarksList();
    showBookmarks();

});