window._comm = {
    $api: {
        url: 'https://datasow.69939.uk/api/',
        param: {
            // key: '' // ?key=e8701ad48ba05a91604e480dd60899a3
            // key: 'e8701ad48ba05a91604e480dd60899a3'
        }
    },
    $user: {id: '', name: '', email: ''}
    // $user: {
    //     id: '11',
    //     name: 'Allen Wu',
    //     email: 'allenwu8098@gmail.com'
    // }
}

window.assetsPath = '/public';
window.tw_xy = {
    // 'test': [470, 190],
    '台北': [620, 180],
    '宜蘭': [675, 335],
    '花蓮': [605, 655],
    '台東': [485, 1020],
    '屏東': [305, 1160],
    '高雄': [195, 1090],
    '台南': [130, 945],
    '嘉義': [125, 815],
    '雲林': [140, 715],
    '彰化': [195, 610],
    '台中': [315, 510],
    '苗栗': [365, 385],
    '新竹': [435, 295],
    '桃園': [470, 190]
};

window.mappingTWName = {
    'ntpc': '新北市',
    'tpe': '臺北市',
    'kel': '基隆市',
    'ila': '宜蘭縣',
    'tyn': '桃園市',
    'hszc': '新竹縣',
    'hsz': '新竹市',
    'zmi': '苗栗縣',
    'txg': '臺中市',
    'chw': '彰化縣',
    'ntc': '南投市',
    'yun': '雲林縣',
    'cyic': '嘉義市',
    'cyi': '嘉義縣',
    'tnn': '臺南市',
    'khh': '高雄市',
    'pif': '屏東縣',
    'hun': '花蓮縣',
    'ttt': '臺東縣',
    'peh': '澎湖縣',
    'knh': '金門縣',
    'mzw': '連江縣',
};

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //

// call api to show form select
window.formriver_select = [
    {
        id: 1,
        value: '表單1',
    },
    {
        id: 2,
        value: '表單2',
    },
];

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //


// annual Banner // [PAGE]river/ocean
window.annualTopic = [
'https://fakeimg.pl/1100x400/?text=年度倡議主題A&font=noto',
'https://fakeimg.pl/1100x400/?text=年度倡議主題B&font=noto'
];

// river Trash Hot Point // [PAGE]river
window.riverTrashHotP = [
    [ // 左
        '/public/img/hotpoint-1.png', // 圖連結
        '#官網連結1', // 官網連結
        '#影片連結1'  // 影片連結
    ],
    [ // 右
        '/public/img/hotpoint-2.png', // 圖連結
        '#官網連結2', // 官網連結
        '#影片連結2'  // 影片連結
    ]
];

// // annual Datas // [PAGE]index/data/member
// window.annualDatas = {
//     freq: 17,
//     people: 389,
//     meter: 500,
//     kg: 419,
//     top: ['寶特瓶', '煙蒂', '塑膠瓶蓋'],
//     scale: ['30', '17', '15', '12', '9', '6', '4', '4', '3']
// };


// // annual Area Ocean // [PAGE]ocean
// window.annualAreaOcean = {
//     '台南': { // tnn
//         freq: 10,
//         top: ['塑膠瓶蓋', '寶特瓶', '煙蒂'],
//     },
//     '高雄': { // khh
//         freq: 11,
//         top: ['寶特瓶', '塑膠瓶蓋', '煙蒂'],
//     },
//     '台北': { // tpe
//         freq: 12,
//         top: ['煙蒂', '寶特瓶', '塑膠瓶蓋'],
//     },
//     '新竹': { // hsz
//         freq: 13,
//         top: ['塑膠瓶蓋', '煙蒂', '寶特瓶'],
//     },
// };

// // annual Area River // [PAGE]river
// window.annualAreaRiver = {
//     '台南': { // tnn
//         freq: 10,
//         top: ['塑膠瓶蓋', '寶特瓶', '煙蒂'],
//     },
//     '高雄': { // khh
//         freq: 11,
//         top: ['寶特瓶', '塑膠瓶蓋', '煙蒂'],
//     },
//     '台北': { // tpe
//         freq: 12,
//         top: ['煙蒂', '寶特瓶', '塑膠瓶蓋'],
//         oceanside: {
//             survey: 40.5,
//             trash: 44049,
//             top: ['塑膠瓶蓋', '煙蒂', '寶特瓶'],
//         },
//         riverside: {
//             survey: 175,
//             trash: 34000,
//             top: ['寶特瓶', '塑膠瓶蓋', '煙蒂'],
//         },
//     },
//     '新竹': { // hsz
//         freq: 13,
//         top: ['塑膠瓶蓋', '煙蒂', '寶特瓶'],
//     },
// };


/*
// postcards // [PAGE]index
window.postcards = ['/wp-content/assets/img/postcard-demo.png?1', '/wp-content/assets/img/postcard-demo.png?2', '/wp-content/assets/img/postcard-demo.png?3', '/wp-content/assets/img/postcard-demo.png?4', '/wp-content/assets/img/postcard-demo.png?8'];


// member data // [PAGE]member
window.member = {
    avatar: 'https://fakeimg.pl/100x100/?text=會員頭照&font=noto',
    name: '阿倫',
    campaign: ['1', '3', '6', '8'],
    postcard: ['/wp-content/assets/img/postcard-demo.png?a', '/wp-content/assets/img/postcard-demo.png?bb', '/wp-content/assets/img/postcard-demo.png?ccc', '/wp-content/assets/img/postcard-demo.png?dd'],
    banner: ['https://fakeimg.pl/900x350/fff/?text=年度活動A&font=noto', 'https://fakeimg.pl/900x350/fff/?text=年度活動B&font=noto'],
};


// totla campaign // [PAGE]member
window.campaigns = {
    '1': {
        id: 1,
        area: '彰化',
        date: ['2020', '02', '24'],
        kg: 50,
        campaign: '王功淨灘',
        owner: '尼古拉拉科技股份有限公司',
        featured: '/wp-content/assets/img/album-pic-a.png'
    },
    '3': {
        id: 3,
        area: '宜蘭',
        date: ['2021', '03', '03'],
        kg: 101,
        campaign: '烏石港淨灘',
        owner: '尼古拉拉科技股份有限公司',
        featured: '/wp-content/assets/img/album-pic-a.png'
    },
    '5': {
        id: 5,
        area: '台北',
        date: ['2020', '10', '19'],
        kg: 78,
        campaign: '白沙灣淨灘',
        owner: '尼古拉拉科技股份有限公司',
        featured: '/wp-content/assets/img/album-pic-a.png'
    },
    '6': {
        id: 6,
        area: '高雄',
        date: ['2021', '03', '03'],
        kg: 99,
        campaign: '高雄港淨灘',
        owner: '尼古拉拉科技股份有限公司',
        featured: '/wp-content/assets/img/album-pic-a.png'
    },
    '7': {
        id: 7,
        area: '桃園',
        date: ['2019', '01', '31'],
        kg: 87,
        campaign: '竹圍漁港 淨灘',
        owner: '尼古拉拉科技股份有限公司',
        featured: '/wp-content/assets/img/album-pic-a.png'
    },
    '8': {
        id: 8,
        area: '台北',
        date: ['2020', '03', '04'],
        kg: 66,
        campaign: '淡水淨灘',
        owner: '尼古拉拉科技股份有限公司',
        featured: '/wp-content/assets/img/album-pic-a.png'
    },
};

window.albumPics = {
    '1': {
        '22': {
            id: '22',
            src: '/wp-content/assets/img/album-pic-a.png?22'
        },
        '27': {
            id: '27',
            src: '/wp-content/assets/img/album-pic-a.png?27'
        },
        '89': {
            id: '89',
            src: '/wp-content/assets/img/album-pic-a.png?89'
        },
        '32': {
            id: '32',
            src: '/wp-content/assets/img/album-pic-a.png?32'
        },
        '9': {
            id: '9',
            src: '/wp-content/assets/img/album-pic-a.png?9'
        }
    },
    '3': {
        '71': {
            id: '71',
            src: '/wp-content/assets/img/album-pic-a.png?71'
        },
        '32': {
            id: '32',
            src: '/wp-content/assets/img/album-pic-a.png?32'
        }
    },
    '5': {
        '19': {
            id: '19',
            src: '/wp-content/assets/img/album-pic-a.png?19'
        },
        '18': {
            id: '18',
            src: '/wp-content/assets/img/album-pic-a.png?18'
        },
        '61': {
            id: '61',
            src: '/wp-content/assets/img/album-pic-a.png?61'
        },
        '2': {
            id: '2',
            src: '/wp-content/assets/img/album-pic-a.png?2'
        },
        '3': {
            id: '3',
            src: '/wp-content/assets/img/album-pic-a.png?3'
        }
    },
    '6': {
        '8': {
            id: '8',
            src: '/wp-content/assets/img/album-pic-a.png?8'
        },
        '7': {
            id: '7',
            src: '/wp-content/assets/img/album-pic-a.png?7'
        },
        '88': {
            id: '88',
            src: '/wp-content/assets/img/album-pic-a.png?88'
        },
        '87': {
            id: '87',
            src: '/wp-content/assets/img/album-pic-a.png?87'
        }
    },
    '7': {
        '11': {
            id: '11',
            src: '/wp-content/assets/img/album-pic-a.png?11'
        }
    },
    '8': {
        '12': {
            id: '12',
            src: '/wp-content/assets/img/album-pic-a.png?12'
        },
        '13': {
            id: '13',
            src: '/wp-content/assets/img/album-pic-a.png?13'
        },
        '20': {
            id: '20',
            src: '/wp-content/assets/img/album-pic-a.png?20'
        },
        '51': {
            id: '51',
            src: '/wp-content/assets/img/album-pic-a.png?51'
        },
        '66': {
            id: '66',
            src: '/wp-content/assets/img/album-pic-a.png?66'
        },
        '78': {
            id: '78',
            src: '/wp-content/assets/img/album-pic-a.png?78'
        }
    }
};


// info post // [PAGE]info
window.info = {
    'articles': [
        {
            id: '1',
            link: '#p1',
            featured: '/wp-content/assets/img/post-background.png',
            title: '我是標題我是標題我是標題我是標題我是標題我是標題我是標題',
            cat: '分類1',
            author: 'Allen',
            date: '2022.06.11',
            description: '我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要',
        },
        {
            id: '2',
            link: '#p2',
            featured: '/wp-content/assets/img/post-background.png',
            title: '22我是標題我是標題我是標題我是標題我是標題我是標題我是標題',
            cat: '分類3',
            author: 'Jerry',
            date: '2022.06.09',
            description: '22我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要',
        },
        {
            id: '3',
            link: '#p3',
            featured: '/wp-content/assets/img/post-background.png',
            title: '33我是標題我是標題我是標題我是標題我是標題我是標題我是標題',
            cat: '分類2',
            author: 'Allen',
            date: '2021.10.30',
            description: '33我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要我是摘要',
        },
    ],
    'hots': [
        {
            id: '11',
            title: '標題',
            link: '#hotp1',
        },
        {
            id: '23',
            title: '標題標',
            link: '#hotp2',
        },
        {
            id: '33',
            title: '標題題',
            link: '#hotp3',
        },
        {
            id: '45',
            title: '標題標題',
            link: '#hotp4',
        },
        {
            id: '55',
            title: '標題題標',
            link: '#hotp5',
        },
    ],
    'cats': [
        {
            id: '333',
            title: '分類1',
            link: '#cat1',
            total: '11',
        },
        {
            id: '666',
            title: '分類2',
            link: '#cat2',
            total: '1',
        },
        {
            id: '987',
            title: '分類3',
            link: '#cat3',
            total: '9',
        },
    ]
};

*/