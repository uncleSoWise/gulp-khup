// base path globs
const src = 'src/';
const dist = 'dist/';

const deployGlobs = [
    `${dist}**/*`,
    `!${dist}**/.DS_Store`,
    `!${dist}wp-config.php`,
    `!${dist}nginx.conf`
];

const imgGlobs = '**/*.{jpg,JPG,png,PNG,gif,GIF,svg,SVG}';
const imgGlobsDist = `${dist}${imgGlobs}`;
const imgGlobsSrc = `${src}${imgGlobs}`;

const staticGlobs = [
    `${src}*.htaccess`,
    `${src}*.txt`,
    `${src}*.ico`,
    `${src}*.xml`,
    `${src}*.conf`,
    `${src}*.json`,
    `${src}*.eot`,
    `${src}*.woff`,
    `${src}*.woff2`,
    `${src}*.otf`,
    `${src}*.ttf`,
    `${src}**/*.php`
];

// task path globs
const globs = {
    to: {
        src,
        dist,
        serve: dist,
        clean: ['!.gitignore', '!.gitkeep', '!.keep', `${dist}**/*`],
        deploy: {
            globs: deployGlobs
        },
        deployBase: dist,
        html: `${src}**/*.html`,
        img: imgGlobsSrc,
        inline: `${dist}**/*.html`,
        js: `${src}**/[^_]*.js`,
        nunjucks: `${src}**/[^_]*.njk`,
        scss: `${src}**/[^_]*.scss`,
        size: {
            all: `${dist}**/*`,
            css: `${dist}**/*.css`,
            html: `${dist}**/*.html`,
            img: imgGlobsDist,
            js: `${dist}**/js/*.js`
        },
        static: staticGlobs,
        watch: {
            deploy: deployGlobs,
            html: `${src}**/*.html`,
            img: imgGlobsSrc,
            js: `${src}**/*.js`,
            nunjucks: [`${src}**/*.njk`, `${src}**/*.md`],
            scss: [`${src}**/*.scss`, `!${src}**/reset.scss`],
            static: staticGlobs
        }
    }
};

export default globs;
