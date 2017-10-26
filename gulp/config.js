const config = {
    gulpflow: {
        isDeployFTP: false,
        isDeploySFTP: false,
        isBrowserSync: true
    },
    autoprefixer: {
        browsers: ['last 2 versions']
    },
    base64: {
        maxImageSize: 8 * 1024 // bytes
    },
    mustache: {
        loop_count: 100
    },
    psi_url: 'http://google.com'
};

export default config;
