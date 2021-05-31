$(document).ready(function () {

    function highlightAnchor() {
        if (window.location.hash) {
            $(window.location.hash).parent().click();
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

    $('.accordion-header').click(function () {
        var topic = $(this);
        var text = $(this).parent().find('.accordion-body .text');
        var trans = $(this).parent().find('.accordion-body .trans');
        var id = $(this).data('id');
        $.get({
            url: '/r/' + id
        }).done(function (data) {
            var content = '';
            for (var i = 0; i < data.text.length; i++) {
                content += data.text[i].text + '&nbsp;<span title="' + data.text[i].index + '">۝</span> ';
            }
            text.html(content);
            content = '';
            for (var i = 0; i < data.trans.length; i++) {
                content += '<sup>';
                if (i == 0)
                    content += id.split('_')[0] + ':' + data.trans[i].index;
                else
                    content += data.trans[i].index;
                content += '</sup>&nbsp;' + data.trans[i].text + ' ';
            }
            trans.html(content);
            gtag('event', 'view', {
                "topics": id
            });
        });
    });

    $('.accordion-body').bind('DOMSubtreeModified', function(e) {
        var id = $(e.currentTarget).parent().attr('aria-labelledby');
        id = $('#' + id);
        id.scroll();
    });

    highlightAnchor();
    showBookmarksList();
    showBookmarks();

});