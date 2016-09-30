// Makes sure our functions are always catching errors in the system
// log and not crashing sketch
function tryCatch(fn) {
    return function() {
        try {
            return fn.apply(null, Array.prototype.slice.call(arguments));
        }
        catch (e) {
            debug('Drake plugin error:', e);
        }
    };
}

function generateLyrics(context, data, label) {
    var selection = context.selection;

    label = label || 'Drake ipsum';

    for (var i = 0, l = selection.count(); i < l; i++) {
        var layer = selection[i];
        var randomData = data[Math.floor(Math.random() * data.length)];


        if (randomData) {
            debug(layer.adjustFrameToFit);
            layer.setStringValue(randomData);
            layer.setName(label);
            layer.adjustFrameToFit();
        }
    }

    utility.checkPluginUpdate(context);
}

function generatePhotos(context, dataPath) {
    function loadImages(imgAmount) {
        var fileManager = [NSFileManager defaultManager];
        var imagesPath =  utility.pluginPath(context) + dataPath;
        var imagesFileNames = shuffle([fileManager contentsOfDirectoryAtPath:imagesPath error:nil]);
        var imageCount = [imagesFileNames count];
        var validExtensions = ['.jpeg', '.jpg', '.png', '.gif'];
        var regex = new RegExp(validExtensions.join('|'), 'i');
        var validImages = toJSArray(imagesFileNames).filter(function(image) {
            return image.match(regex) != null;
        });
        var selectedPaths = [];

        for (var i = 0; i < imgAmount; i++) {
            var index = i % imgAmount;
            var fileName = validImages[index];
            var filePath = imagesPath + fileName;
            selectedPaths.push(filePath);
        }

        return selectedPaths.map(function(imagePath) {
            if ([fileManager fileExistsAtPath: imagePath]) {
                var image = [[NSImage alloc] initWithContentsOfFile:imagePath];
                return image;
            }
        });
    }

    function main() {
        var selection = context.selection;
        var imagesCollection = loadImages(selection.count());

        for (var i = 0; i < selection.count(); i++) {
            var layer = selection[i];

            if (layer instanceof MSShapeGroup) {
                var image = imagesCollection[i];
                var fill = layer.style().fills().firstObject();
                fill.setFillType(4);
                fill.setImage(MSImageData.alloc().initWithImage_convertColorSpace(image, false));
                fill.setPatternFillType(1);
            }
        }

        if (selection.count() == 0) {
            [doc showMessage:'Select at least one vector shape'];
        }
    }

    main();
    utility.checkPluginUpdate(context);
}


var Drake = {
    generateLyrics: tryCatch(generateLyrics),
    generatePhotos: tryCatch(generatePhotos)
};
