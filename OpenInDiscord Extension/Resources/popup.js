const defaultSettings = {
    showBanner: true,
    instantOpen: false,
    urlScheme: 'com.hammerandchisel.discord',
    enableInvites: true,
    enableUsers: true,
    enableChannels: true,
    enableFavorites: true
};

document.addEventListener('DOMContentLoaded', async () => {
    const stored = await browser.storage.local.get(defaultSettings);
    const settings = { ...defaultSettings, ...stored };
    
    const showBannerCheckbox = document.getElementById('showBanner');
    const instantOpenCheckbox = document.getElementById('instantOpen');
    
    Object.keys(settings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = settings[key];
            } else {
                element.value = settings[key];
            }
        }
    });
    
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
            const value = input.type === 'checkbox' ? input.checked : input.value;
            
            if (input.id === 'showBanner' && !value && !instantOpenCheckbox.checked) {
                instantOpenCheckbox.checked = true;
                browser.storage.local.set({ instantOpen: true });
            } else if (input.id === 'instantOpen' && !value && !showBannerCheckbox.checked) {
                showBannerCheckbox.checked = true;
                browser.storage.local.set({ showBanner: true });
            }
            
            browser.storage.local.set({ [input.id]: value });
        });
    });
});
