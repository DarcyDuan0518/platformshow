// 收藏管理系统（使用LocalStorage）

// 获取收藏列表
function getFavorites() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
}

// 添加收藏
function addFavorite(personId) {
    const favorites = getFavorites();
    if (!favorites.includes(personId)) {
        favorites.push(personId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        showToast('收藏成功！');
        updateFavoriteButton(personId, true);
        return true;
    }
    showToast('已经收藏过了');
    return false;
}

// 取消收藏
function removeFavorite(personId) {
    let favorites = getFavorites();
    favorites = favorites.filter(id => id !== personId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showToast('已取消收藏');
    updateFavoriteButton(personId, false);
}

// 检查是否已收藏
function isFavorite(personId) {
    const favorites = getFavorites();
    return favorites.includes(personId);
}

// 切换收藏状态
function toggleFavorite(personId) {
    if (isFavorite(personId)) {
        removeFavorite(personId);
    } else {
        addFavorite(personId);
    }
}

// 更新收藏按钮状态
function updateFavoriteButton(personId, isFav) {
    const btn = document.querySelector(`#favoriteBtn-${personId}`);
    if (btn) {
        if (isFav) {
            btn.innerHTML = '❤️ 已收藏';
            btn.classList.add('favorited');
        } else {
            btn.innerHTML = '🤍 收藏';
            btn.classList.remove('favorited');
        }
    }
}

// 获取收藏的人物列表
function getFavoritePeople() {
    const favoriteIds = getFavorites();
    return peopleData.filter(person => favoriteIds.includes(person.id));
}

// 显示收藏列表
function showFavorites() {
    const favorites = getFavoritePeople();

    if (favorites.length === 0) {
        showToast('暂无收藏');
        return;
    }

    // 可以创建一个收藏列表页面或弹窗
    console.log('收藏列表:', favorites);
    // TODO: 实现收藏列表UI
}

// 分享功能

// 复制链接分享
function shareLink(personId) {
    const person = peopleData.find(p => p.id === personId);
    if (!person) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}?person=${personId}`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('链接已复制到剪贴板！');
        }).catch(() => {
            // 降级方案
            fallbackCopyTextToClipboard(shareUrl);
        });
    } else {
        fallbackCopyTextToClipboard(shareUrl);
    }
}

// 降级复制方案
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showToast('链接已复制！');
    } catch (err) {
        showToast('复制失败，请手动复制');
    }

    document.body.removeChild(textArea);
}

// 社交分享（如果支持Web Share API）
function socialShare(personId) {
    const person = peopleData.find(p => p.id === personId);
    if (!person) return;

    const shareData = {
        title: `${person.name} - 科学工匠精神`,
        text: person.shortDesc,
        url: `${window.location.origin}${window.location.pathname}?person=${personId}`
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => showToast('分享成功！'))
            .catch(() => {
                // 如果用户取消分享，降级为复制链接
                shareLink(personId);
            });
    } else {
        // 不支持Web Share API，使用复制链接
        shareLink(personId);
    }
}

// 提示消息显示
function showToast(message, duration = 2000) {
    // 移除已存在的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 显示动画
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // 隐藏动画
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// 浏览历史记录

// 记录浏览历史
function addToHistory(personId) {
    const history = getHistory();

    // 移除旧的记录（如果存在）
    const filtered = history.filter(item => item.id !== personId);

    // 添加到开头
    filtered.unshift({
        id: personId,
        timestamp: Date.now()
    });

    // 只保留最近20条
    const limited = filtered.slice(0, 20);

    localStorage.setItem('history', JSON.stringify(limited));
}

// 获取浏览历史
function getHistory() {
    const history = localStorage.getItem('history');
    return history ? JSON.parse(history) : [];
}

// 获取浏览历史人物列表
function getHistoryPeople() {
    const history = getHistory();
    const peopleList = [];

    history.forEach(item => {
        const person = peopleData.find(p => p.id === item.id);
        if (person) {
            peopleList.push({
                ...person,
                viewTime: item.timestamp
            });
        }
    });

    return peopleList;
}

// 清空浏览历史
function clearHistory() {
    localStorage.removeItem('history');
    showToast('浏览历史已清空');
}

// 页面加载时的URL参数处理
function handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const personId = urlParams.get('person');

    if (personId) {
        // 直接打开指定人物的详情
        setTimeout(() => {
            showDetail(parseInt(personId));
        }, 500);
    }
}

// 统计功能（本地统计）

// 记录访问
function trackView(personId) {
    const stats = getStats();

    if (!stats[personId]) {
        stats[personId] = {
            views: 0,
            lastView: null
        };
    }

    stats[personId].views++;
    stats[personId].lastView = Date.now();

    localStorage.setItem('stats', JSON.stringify(stats));
}

// 获取统计数据
function getStats() {
    const stats = localStorage.getItem('stats');
    return stats ? JSON.parse(stats) : {};
}

// 获取热门人物
function getPopularPeople(limit = 5) {
    const stats = getStats();
    const peopleWithViews = peopleData.map(person => ({
        ...person,
        views: stats[person.id] ? stats[person.id].views : 0
    }));

    return peopleWithViews
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
}

// 导出到其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getFavorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        shareLink,
        socialShare,
        addToHistory,
        getHistoryPeople,
        trackView,
        getPopularPeople
    };
}
