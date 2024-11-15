function handleNavigation(details) {
    if (details.url.match(/discord\.(com|gg)/)) {
        browser.tabs.sendMessage(details.tabId, {
            type: 'checkUrl',
            url: details.url
        }).catch(() => {
            const retryWithDelay = (attempt = 0) => {
                if (attempt > 5) return;
                setTimeout(() => {
                    browser.tabs.sendMessage(details.tabId, {
                        type: 'checkUrl',
                        url: details.url
                    }).catch(() => retryWithDelay(attempt + 1));
                }, Math.pow(2, attempt) * 100);
            };
            retryWithDelay();
        });
    }
}

browser.webRequest.onBeforeRequest.addListener(
    handleNavigation,
    { 
        urls: ["*://*.discord.com/*", "*://*.discord.gg/*"],
        types: ["main_frame"]
    },
    ["blocking"]
);

browser.webNavigation.onBeforeNavigate.addListener(handleNavigation);
browser.webNavigation.onCommitted.addListener(handleNavigation);

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.greeting === "hello") {
        return Promise.resolve({ farewell: "goodbye" });
    }
});
