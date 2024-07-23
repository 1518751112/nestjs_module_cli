const download = require("download-git-repo");
const ora = require("ora");
const start = async ()=>{
    const spinner = ora('Downloading component...').start();
    download("", 'components', (err) => {
        if (err) {
            spinner.fail('Failed to download component');
            console.error(err);
        } else {
            spinner.succeed('Component downloaded successfully');
            console.log('Component is available in ./components directory');
        }
    });
}
start();
