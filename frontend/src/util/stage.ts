export const isProd = () => {
    const isAlpha = window.location.hostname === 'localhost';
    const isBeta = window.location.hostname.startsWith('beta.ticket-manager');
    return !isAlpha && !isBeta;
};
