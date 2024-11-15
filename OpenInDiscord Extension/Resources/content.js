const defaultSettings = {
    showBanner: true,
    instantOpen: false,
    urlScheme: 'com.hammerandchisel.discord',
    enableInvites: true,
    enableUsers: true,
    enableChannels: true,
    enableFavorites: true
};

let settings = { ...defaultSettings };

browser.storage.local.get(defaultSettings).then(stored => {
    settings = { ...defaultSettings, ...stored };
    checkUrl();
});

function transformUrl(url) {
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    
    if (!settings.enableInvites) {
        if (urlObj.hostname === 'discord.gg' || path.startsWith('/invite/')) {
            return null;
        }
    } else if (urlObj.hostname === 'discord.gg') {
        path = `/invite/${path.slice(1)}`;
    }
    
    if (path.startsWith('/users/') && !settings.enableUsers) {
        return null;
    } else if (path.startsWith('/channels/') && !settings.enableChannels) {
        return null;
    } else if (path.startsWith('/favorites/') && !settings.enableFavorites) {
        return null;
    }
    
    return path ? `${settings.urlScheme}://discord.com${path}` : null;
}

function showBanner(discordUrl) {
    if (document.getElementById('discordBanner')) return;
    
    const banner = `
        <div id="discordBanner">
            <div class="logo-wrapper">
                <img src="${browser.runtime.getURL('images/icon-128.png')}">
                <span>Open this page in Discord</span>
            </div>
            <a href="${discordUrl}" class="open-button">Open</a>
        </div>
    `;
    
    if (!document.body) return;
    
    const insertBanner = () => {
        const existingBanner = document.getElementById('discordBanner');
        if (existingBanner) return;
        
        document.body.style.marginTop = '44px';
        document.body.insertAdjacentHTML('afterbegin', banner);
        
        document.querySelector('#discordBanner .open-button').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = discordUrl;
        });
    };
    
    insertBanner();
    
    const observer = new MutationObserver(() => {
        requestAnimationFrame(insertBanner);
    });
    
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    
    window.addEventListener('load', insertBanner);
    document.addEventListener('DOMContentLoaded', insertBanner);
}

function handleUrl(url) {
    const discordUrl = transformUrl(url);
    
    if (!discordUrl) return;
    
    if (settings.instantOpen) {
        window.location.href = discordUrl;
    } else if (settings.showBanner) {
        showBanner(discordUrl);
    }
}

function checkUrl() {
    if (!document.body) {
        setTimeout(checkUrl, 10);
        return;
    }
    if (window.location.hostname.match(/discord\.(com|gg)/)) {
        handleUrl(window.location.href);
    }
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'checkUrl') {
        handleUrl(request.url);
    }
});

document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && (link.href.match(/discord\.(com|gg)/) || link.href.includes('discordapp.page.link'))) {
        e.preventDefault();
        handleUrl(link.href);
    }
});

let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        checkUrl();
    }
}).observe(document, { subtree: true, childList: true });
