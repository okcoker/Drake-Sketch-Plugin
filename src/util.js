export function debug() {
    return log(Array.prototype.slice.call(arguments).join(' '));
}

export function pluginPath(context) {
    const pluginFolder = context.scriptPath.match(/Plugins\/([\w -])*/)[0] + '/';

    return context.scriptPath.split(pluginFolder)[0] + pluginFolder;
}

export function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

export function capitalize(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}
