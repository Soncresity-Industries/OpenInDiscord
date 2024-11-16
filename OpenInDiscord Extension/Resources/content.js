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
});

function transformUrl(url) {
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    
    if (urlObj.hostname === 'discord.gg' || path.startsWith('/invite/')) {
        if (!settings.enableInvites) return null;
        const inviteCode = urlObj.hostname === 'discord.gg' ? 
            path.slice(1) : 
            path.split('/').filter(Boolean).pop();
        return `${settings.urlScheme}://discord.com/invite/${inviteCode}`;
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

function handleLink(link) {
    if (!link || !link.href) return;
    
    try {
        const url = new URL(link.href);
        if (url.hostname.match(/discord\.(com|gg)/)) {
            const discordUrl = transformUrl(link.href);
            if (discordUrl) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = discordUrl;
                });
            }
        }
    } catch (e) {
        console.error('Invalid URL', link.href, e);
    }
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
        
        document.body.style.marginTop = '48px';
        document.body.insertAdjacentHTML('afterbegin', banner);
        
        document.querySelector('#discordBanner .open-button').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = discordUrl;
        });
    };
    
    insertBanner();
}

function checkUrl() {
    if (!document.body) {
        setTimeout(checkUrl, 10);
        return;
    }
    
    const url = window.location.href;
    const urlObj = new URL(url);
    
    if (urlObj.hostname.match(/discord\.(com|gg)/)) {
        const discordUrl = transformUrl(url);
        if (discordUrl) {
            if ((urlObj.hostname === 'discord.gg' || urlObj.pathname.startsWith('/invite/')) || settings.instantOpen) {
                window.location.href = discordUrl;
            }
            if (settings.showBanner) {
                showBanner(discordUrl);
            }
        }
    }
}

checkUrl();

let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        checkUrl();
    }
}).observe(document, { subtree: true, childList: true });

document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        document.querySelectorAll('a').forEach(handleLink);
    }
};

new MutationObserver(() => {
    if (document.readyState === "complete") {
        requestAnimationFrame(() => {
            document.querySelectorAll('a').forEach(handleLink);
        });
    }
}).observe(document.documentElement, {
    childList: true,
    subtree: true
});

