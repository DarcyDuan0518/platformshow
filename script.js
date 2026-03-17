// 全局变量
let currentFilter = {
    category: 'all',
    field: '',
    era: '',
    search: ''
};

// 页面加载完成初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    console.log('人物数据数量:', peopleData ? peopleData.length : '数据未加载');

    initPage();
    initEventListeners();

    // 处理URL参数（支持直接链接到特定人物）
    handleURLParams();
});

// 初始化页面
function initPage() {
    console.log('开始渲染页面...');

    // 渲染统计数字
    renderStats();

    // 渲染特色人物（选择前3位）
    renderFeaturedPeople();

    // 分别渲染科学家和工匠
    renderScientists();
    renderCraftsmen();

    // 数字动画
    animateNumbers();

    console.log('页面渲染完成');
}

// 初始化事件监听
function initEventListeners() {
    // 搜索框输入事件 - 显示自动完成建议
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            showSearchSuggestions(this.value);
        });

        // 搜索框回车事件
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
                hideSuggestions();
            }
        });

        // 失去焦点时延迟隐藏建议（给点击建议留时间）
        searchInput.addEventListener('blur', function() {
            setTimeout(hideSuggestions, 200);
        });
    }

    // 类别筛选按钮点击事件 - 自动触发筛选
    document.querySelectorAll('.filter-tag').forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有active类
            document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
            // 添加active到当前按钮
            this.classList.add('active');
            // 自动应用筛选
            applyFiltersFromUI();
        });
    });

    // 领域和年代选择框改变时自动触发筛选
    const fieldFilter = document.getElementById('fieldFilter');
    const eraFilter = document.getElementById('eraFilter');

    if (fieldFilter) {
        fieldFilter.addEventListener('change', applyFiltersFromUI);
    }

    if (eraFilter) {
        eraFilter.addEventListener('change', applyFiltersFromUI);
    }

    // 按键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            hideSuggestions();
            const sidebar = document.getElementById('searchSidebar');
            if (sidebar) {
                sidebar.classList.remove('active');
            }
        }
    });

    // 点击页面其他地方隐藏建议
    document.addEventListener('click', function(e) {
        const searchWrapper = document.querySelector('.search-input-wrapper');
        if (searchWrapper && !searchWrapper.contains(e.target)) {
            hideSuggestions();
        }
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// 显示搜索建议
function showSearchSuggestions(query) {
    const suggestionsDiv = document.getElementById('searchSuggestions');

    if (!query || query.trim().length < 1) {
        hideSuggestions();
        return;
    }

    const lowerQuery = query.toLowerCase().trim();

    // 匹配姓名、领域、标签
    const matches = peopleData.filter(person => {
        return person.name.toLowerCase().includes(lowerQuery) ||
               person.field.toLowerCase().includes(lowerQuery) ||
               person.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    }).slice(0, 5); // 最多显示5个建议

    if (matches.length === 0) {
        hideSuggestions();
        return;
    }

    // 生成建议列表HTML
    suggestionsDiv.innerHTML = matches.map(person => `
        <div class="suggestion-item" onclick="selectSuggestion('${person.name}')">
            <div style="flex: 1;">
                <div class="suggestion-name">${highlightMatch(person.name, query)}</div>
                <div class="suggestion-meta">${person.field}</div>
            </div>
            <span class="suggestion-badge ${person.category}">
                ${person.category === 'scientist' ? '科学家' : '工匠'}
            </span>
        </div>
    `).join('');

    suggestionsDiv.classList.add('show');
}

// 高亮匹配的文字
function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong style="color: var(--primary);">$1</strong>');
}

// 选择建议
function selectSuggestion(name) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = name;
    }
    hideSuggestions();
    performSearch();
}

// 隐藏建议
function hideSuggestions() {
    const suggestionsDiv = document.getElementById('searchSuggestions');
    if (suggestionsDiv) {
        suggestionsDiv.classList.remove('show');
    }
}

// 渲染统计数字
function renderStats() {
    const scientists = peopleData.filter(p => p.category === 'scientist').length;
    const craftsmen = peopleData.filter(p => p.category === 'craftsman').length;

    console.log('统计: 科学家', scientists, '工匠', craftsmen);

    const scientistCount = document.getElementById('scientistCount');
    const craftsmanCount = document.getElementById('craftsmanCount');

    if (scientistCount) scientistCount.setAttribute('data-target', scientists);
    if (craftsmanCount) craftsmanCount.setAttribute('data-target', craftsmen);
}

// 数字动画
function animateNumbers() {
    const counters = document.querySelectorAll('.stat-number[data-target]');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// 渲染特色人物
function renderFeaturedPeople() {
    const featured = peopleData.slice(0, 3);
    const grid = document.getElementById('featuredGrid');

    if (!grid) {
        console.error('找不到 featuredGrid 元素');
        return;
    }

    console.log('渲染特色人物:', featured.length);

    grid.innerHTML = featured.map(person => `
        <div class="featured-card" onclick="showDetail(${person.id})" style="background-image: url('${person.image}');">
            <div class="featured-card-content">
                <span class="featured-badge">
                    ${person.category === 'scientist' ? '🔬 科学家' : '🔧 大国工匠'}
                </span>
                <h3>${person.name}</h3>
                <div class="featured-field">${person.field} · ${person.birth}-${person.death || '至今'}</div>
                <p class="featured-desc">${person.shortDesc}</p>
            </div>
        </div>
    `).join('');
}

// 渲染科学家
function renderScientists() {
    const scientists = getFilteredPeople().filter(p => p.category === 'scientist');
    const grid = document.getElementById('scientistGrid');

    if (!grid) {
        console.error('找不到 scientistGrid 元素');
        return;
    }

    console.log('渲染科学家:', scientists.length);

    if (scientists.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">未找到符合条件的科学家</div></div>';
        return;
    }

    grid.innerHTML = scientists.map(person => createPersonCard(person)).join('');
}

// 渲染工匠
function renderCraftsmen() {
    const craftsmen = getFilteredPeople().filter(p => p.category === 'craftsman');
    const grid = document.getElementById('craftsmanGrid');

    if (!grid) {
        console.error('找不到 craftsmanGrid 元素');
        return;
    }

    console.log('渲染工匠:', craftsmen.length);

    if (craftsmen.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">未找到符合条件的工匠</div></div>';
        return;
    }

    grid.innerHTML = craftsmen.map(person => createPersonCard(person)).join('');
}

// 创建人物卡片
function createPersonCard(person) {
    return `
        <div class="person-card" onclick="showDetail(${person.id})">
            <div class="card-header-bg" style="background-image: url('${person.image}');">
                <span class="card-badge badge-${person.category}">
                    ${person.category === 'scientist' ? '科学家' : '工匠'}
                </span>
            </div>
            <div class="card-body">
                <h3 class="card-name">${person.name}</h3>
                <div class="card-meta">
                    <span class="card-meta-item">🔬 ${person.field}</span>
                    <span class="card-meta-item">📅 ${person.era}</span>
                </div>
                <p class="card-desc">${person.shortDesc}</p>
                <div class="card-tags">
                    ${person.tags.slice(0, 3).map(tag =>
                        `<span class="card-tag">${tag}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;
}

// 获取过滤后的人物
function getFilteredPeople() {
    return peopleData.filter(person => {
        // 类别过滤
        if (currentFilter.category !== 'all' && person.category !== currentFilter.category) {
            return false;
        }

        // 领域过滤
        if (currentFilter.field && person.field !== currentFilter.field) {
            return false;
        }

        // 年代过滤
        if (currentFilter.era && person.era !== currentFilter.era) {
            return false;
        }

        // 搜索过滤
        if (currentFilter.search) {
            const searchLower = currentFilter.search.toLowerCase();
            return person.name.toLowerCase().includes(searchLower) ||
                   person.field.toLowerCase().includes(searchLower) ||
                   person.shortDesc.toLowerCase().includes(searchLower) ||
                   person.tags.some(tag => tag.toLowerCase().includes(searchLower));
        }

        return true;
    });
}

// 执行搜索
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    currentFilter.search = searchInput.value.trim().toLowerCase();

    applyFiltersFromUI();

    console.log('执行搜索:', currentFilter.search);

    // 搜索后关闭侧边栏，让用户聚焦搜索结果
    if (currentFilter.search) {
        const sidebar = document.getElementById('searchSidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }

        // 平滑滚动到结果区域
        const resultSection = document.getElementById('scientists');
        if (resultSection) {
            setTimeout(() => {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }
}

// 应用筛选（从UI读取所有筛选条件）
function applyFilters() {
    applyFiltersFromUI();
}

// 从UI读取筛选条件并应用
function applyFiltersFromUI() {
    // 获取类别筛选
    const activeCategory = document.querySelector('.filter-tag.active');
    currentFilter.category = activeCategory ? activeCategory.getAttribute('data-category') : 'all';

    // 获取领域筛选
    const fieldFilter = document.getElementById('fieldFilter');
    currentFilter.field = fieldFilter ? fieldFilter.value : '';

    // 获取年代筛选
    const eraFilter = document.getElementById('eraFilter');
    currentFilter.era = eraFilter ? eraFilter.value : '';

    // 获取搜索关键词
    const searchInput = document.getElementById('searchInput');
    currentFilter.search = searchInput ? searchInput.value.trim().toLowerCase() : '';

    console.log('应用筛选:', currentFilter);

    // 重新渲染
    renderScientists();
    renderCraftsmen();
}

// 清空过滤器
function clearFilters() {
    currentFilter = {
        category: 'all',
        field: '',
        era: '',
        search: ''
    };

    // 重置UI状态
    const searchInput = document.getElementById('searchInput');
    const fieldFilter = document.getElementById('fieldFilter');
    const eraFilter = document.getElementById('eraFilter');

    if (searchInput) searchInput.value = '';
    if (fieldFilter) fieldFilter.value = '';
    if (eraFilter) eraFilter.value = '';

    // 重置类别按钮
    document.querySelectorAll('.filter-tag').forEach(btn => {
        btn.classList.remove('active');
    });
    const allBtn = document.querySelector('[data-category="all"]');
    if (allBtn) {
        allBtn.classList.add('active');
    }

    // 隐藏搜索建议
    hideSuggestions();

    console.log('清空筛选');

    // 重新渲染
    renderScientists();
    renderCraftsmen();
}

// 切换搜索侧边栏
function toggleSearch() {
    const sidebar = document.getElementById('searchSidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// 显示详情模态框
function showDetail(personId) {
    const person = peopleData.find(p => p.id === personId);
    if (!person) {
        console.error('找不到ID为', personId, '的人物');
        return;
    }

    console.log('显示详情:', person.name);

    // 记录浏览历史
    addToHistory(personId);

    // 统计访问
    trackView(personId);

    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');

    if (!modal || !content) {
        console.error('找不到模态框元素');
        return;
    }

    // 检查是否已收藏
    const favorited = isFavorite(personId);

    // 生成视频播放器HTML
    let videoHTML = '';
    if (person.video) {
        videoHTML = `
            <div class="content-section">
                <h3 class="content-title">🎬 相关视频</h3>
                <div class="video-container">
                    <video controls>
                        <source src="${person.video}" type="video/mp4">
                        您的浏览器不支持视频播放。
                    </video>
                </div>
            </div>
        `;
    }

    // 生成音频播放器HTML
    let audioHTML = '';
    if (person.audio) {
        audioHTML = `
            <div class="content-section">
                <h3 class="content-title">🎵 语音讲解</h3>
                <div class="audio-player">
                    <audio controls>
                        <source src="${person.audio}" type="audio/mpeg">
                        您的浏览器不支持音频播放。
                    </audio>
                </div>
            </div>
        `;
    }

    content.innerHTML = `
        <div class="modal-header">
            <div class="modal-header-content">
                <h2 class="modal-name">${person.name}</h2>
                <div class="modal-meta">
                    ${person.category === 'scientist' ? '🔬 科学家' : '🔧 大国工匠'} ·
                    ${person.field} ·
                    ${person.birth}-${person.death || '至今'}
                </div>
            </div>
        </div>

        <div class="modal-content-section">
            <!-- 操作按钮 -->
            <div class="action-buttons">
                <button class="action-btn favorite-btn ${favorited ? 'favorited' : ''}"
                        id="favoriteBtn-${personId}"
                        onclick="toggleFavorite(${personId})">
                    ${favorited ? '❤️ 已收藏' : '🤍 收藏'}
                </button>
                <button class="action-btn share-btn" onclick="socialShare(${personId})">
                    🔗 分享
                </button>
            </div>

            <!-- 人物简介 -->
            <div class="content-section">
                <h3 class="content-title">📖 人物简介</h3>
                <p class="content-text">${person.fullDesc}</p>
            </div>

            ${videoHTML}
            ${audioHTML}

            <!-- 人生历程 -->
            <div class="content-section">
                <h3 class="content-title">⏰ 人生历程</h3>
                <div class="timeline">
                    ${person.timeline.map(item => `
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-year">${item.year}</div>
                            <div class="timeline-content">
                                <div class="timeline-title">${item.title}</div>
                                <div class="timeline-desc">${item.desc}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- 主要成就 -->
            <div class="content-section">
                <h3 class="content-title">🏆 主要成就</h3>
                <div class="achievements">
                    ${person.achievements.map(ach => `
                        <div class="achievement-item">
                            <div class="achievement-title">${ach.title}</div>
                            <div class="achievement-desc">${ach.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- 精神品质 -->
            <div class="content-section">
                <h3 class="content-title">✨ 精神品质</h3>
                <div class="spirit-grid">
                    ${person.spirit.map(s => `
                        <div class="spirit-item">
                            <div class="spirit-icon">${s.icon}</div>
                            <div class="spirit-name">${s.name}</div>
                            <div class="spirit-desc">${s.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- 相关标签 -->
            <div class="content-section">
                <h3 class="content-title">🏷️ 相关标签</h3>
                <div class="card-tags">
                    ${person.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
