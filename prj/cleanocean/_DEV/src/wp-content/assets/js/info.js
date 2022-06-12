$(function() {
    var INFO = {
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),
            $articles: $('#articles'),
            $article_hots: $('#post-hots'),
            $article_cats: $('#post-cats'),
        },
        var: {
            $api: {},
            $searcher: '',
        },
        init: function() {
            console.log('info');
            this.bindEvent();
            if (window.helper.getUrlParams(window.location.href, 'search')) {
                this.var.$searcher = window.helper.getUrlParams(window.location.href, 'search');
                this.searchArticle();
            } else {
                this.loadArticles();
            }
            this.loadHots();
            this.loadCats();
        },
        bindEvent: function() {
            let $this = this;
        },
        searchArticle: function() { // window.info
            console.log(this.var.$searcher);
            // // ajax url
            // let _url = $this.var.api.article_searcher + '&__r=' + (new Date()).getTime();
            // // ajax handle
            // $.ajax({
            //     url: _url,
            //     type: 'get',
            //     dataType: 'json',
            //     success: (response) => {
            //         console.log(response);
            //         if (response.error === 0) {
            //             doSuccess(response.counts);
            //         }
            //         return;
            //     },
            //     error: function(response) {
            //         console.log('error');
            //         console.log(response);
            //     }
            // });

            let $this = this
            , _source = window.info.articles
            , _target = $this.el.$articles
            , _template_article = window.helper.getTemplate('info__article')
            , _templates = '';
            for (let i = 0; i < _source.length; i++) {
                let _template = _template_article;
                _template = _template.replace(/\[PID\]/g, _source[i]['id']);
                _template = _template.replace(/\[LINK\]/g, _source[i]['link']);
                _template = _template.replace(/\[FEATURED\]/g, _source[i]['featured']);
                _template = _template.replace(/\[TITLE\]/g, _source[i]['title']);
                _template = _template.replace(/\[CAT\]/g, _source[i]['cat']);
                _template = _template.replace(/\[AUTHOR\]/g, _source[i]['author']);
                _template = _template.replace(/\[DATE\]/g, _source[i]['date']);
                _template = _template.replace(/\[DESCRIPTION\]/g, _source[i]['description']);
                _template = _template.replace(/data-src/g,  'src');
                _templates += _template;
            }
            _target.html(_templates);
        },
        loadArticles: function() { // window.info
            let $this = this
            , _source = window.info.articles
            , _target = $this.el.$articles
            , _template_article = window.helper.getTemplate('info__article')
            , _templates = '';
            for (let i = 0; i < _source.length; i++) {
                let _template = _template_article;
                _template = _template.replace(/\[PID\]/g, _source[i]['id']);
                _template = _template.replace(/\[LINK\]/g, _source[i]['link']);
                _template = _template.replace(/\[FEATURED\]/g, _source[i]['featured']);
                _template = _template.replace(/\[TITLE\]/g, _source[i]['title']);
                _template = _template.replace(/\[CAT\]/g, _source[i]['cat']);
                _template = _template.replace(/\[AUTHOR\]/g, _source[i]['author']);
                _template = _template.replace(/\[DATE\]/g, _source[i]['date']);
                _template = _template.replace(/\[DESCRIPTION\]/g, _source[i]['description']);
                _template = _template.replace(/data-src/g,  'src');
                _templates += _template;
            }
            _target.html(_templates);
        },
        loadHots: function() { // window.info
            console.log('loadHots');
            let $this = this
            , _source = window.info.hots
            , _target = $this.el.$article_hots
            , _template_hot = window.helper.getTemplate('info__article-hot')
            , _templates = '';
            for (let i = 0; i < _source.length; i++) {
                let _template = _template_hot;
                _template = _template.replace(/\[PID\]/g, _source[i]['id']);
                _template = _template.replace(/\[TITLE\]/g, _source[i]['title']);
                _template = _template.replace(/\[LINK\]/g, _source[i]['link']);
                _templates += _template;
            }
            _target.html(_templates);
        },
        loadCats: function() { // window.info
            console.log('loadCats');
            let $this = this
            , _source = window.info.cats
            , _target = $this.el.$article_cats
            , _template_cat = window.helper.getTemplate('info__article-cat')
            , _templates = '';
            for (let i = 0; i < _source.length; i++) {
                let _template = _template_cat;
                _template = _template.replace(/\[CID\]/g, _source[i]['id']);
                _template = _template.replace(/\[CAT\]/g, _source[i]['title']);
                _template = _template.replace(/\[CAT_TOTAL\]/g, _source[i]['total']);
                _template = _template.replace(/\[LINK\]/g, _source[i]['link']);
                _templates += _template;
            }
            _target.html(_templates);
        },
    };
    INFO.init();
});