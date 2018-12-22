const CROP_KEY = 'crop';
const OUTPUT_FILE_KEY = 'outputfile';
const DSSAT_BASE_PATH_KEY = 'basePath';

class StorageController {

    constructor(window) {
        this._localStorage = window.localStorage;
    }

    set(key, value){
        this._localStorage.setItem(key, value);
    }
    get(key) {
        return this._localStorage.getItem(key);
    }
    delete(key) {
        this._localStorage.removeItem(key);
    }
    setCrop(value) {
        this._localStorage.setItem(CROP_KEY, value);
    }
    getCrop() {
        return this._localStorage.getItem(CROP_KEY);
    }
    setOutputFile(value) {
        this._localStorage.setItem(OUTPUT_FILE_KEY, value);
    }
    getOutputFile() {
        return this._localStorage.getItem(OUTPUT_FILE_KEY);
    }
    setDssatBasePath(value) {
        this._localStorage.setItem(DSSAT_BASE_PATH_KEY, value);
    }
    getDssatBasePath() {
        return this._localStorage.getItem(DSSAT_BASE_PATH_KEY);
    }
    updateDssatBasePath(value) {
        this.delete(DSSAT_BASE_PATH_KEY);
        this.setDssatBasePath(value);
        return;
    }
}

module.exports = StorageController;