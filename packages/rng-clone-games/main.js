module.exports = {
    load() {
        Editor.log("===========Loaded rng-clone-games===========");
    },

    unload() {
        Editor.log("===========Unloaded rng-clone-games===========");
    },

    messages:
    {
        reload() {
            Editor.Package.reload('rng-clone-games');
            Editor.log("===========Reload rng-clone-games===========");
        },

        clone() {
            Editor.Panel.open('rng-clone-games.clone');
        },

        test()
        {

        }
    },
};