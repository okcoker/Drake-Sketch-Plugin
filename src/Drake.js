import path from '@skpm/path';
import fs from '@skpm/fs';
import UI from 'sketch/ui';
import { Image, Document, Style } from 'sketch/dom';

import lyrics from '../assets/lyrics/index';
import { shuffle, pluginPath } from './util';

export function generateLyrics(context) {
    const doc = Document.getSelectedDocument();
    const selection = doc.selectedLayers;
    const label = 'Drake ipsum';

    for (var i = 0, l = selection.length; i < l; i++) {
        const layer = selection.layers[i];
        const randomLyric = lyrics[Math.floor(Math.random() * lyrics.length)];

        switch (layer.type) {
            case 'Text': {
                layer.text = randomLyric;
                layer.name = label;
                layer.adjustToFit();
                break;
            }

            case 'SymbolInstance': {
                const expectedType = 'stringValue';
                const oneSubLayerisText = layer.overrides.some((override) => {
                    return override.property === expectedType;
                });

                if (!oneSubLayerisText) {
                    UI.message('Symbol must have at least 1 text layer pre-filled');
                    return;
                }

                // Only fill the first text layer found with the lyrics
                layer.overrides.some((override) => {
                    if (override.property === expectedType) {
                        layer.setOverrideValue(override, randomLyric);

                        return true;
                    }

                    return false;
                });
            }

            default:
                break;
        }
    }
}

function loadImages(context, selectionCount) {
    const dataPath = 'plugin.sketchplugin/Contents/Resources/photos/';
    const imagesPath =  path.join(pluginPath(context), dataPath);
    const imageFiles = shuffle(fs.readdirSync(imagesPath));
    const imageCount = imageFiles.length;
    const validExtensions = ['.jpeg', '.jpg', '.png', '.gif'];
    const regex = new RegExp(validExtensions.join('|'), 'i');
    const validImages = imageFiles.filter((image) => {
        return image.match(regex) !== null;
    });
    const selectedPaths = [];

    for (let i = 0; i < selectionCount; i++) {
        const index = i % selectionCount;
        const fileName = validImages[index];
        const filePath = imagesPath + fileName;

        selectedPaths.push(filePath);
    }

    return selectedPaths.map((imagePath) => {
        if (fs.existsSync(imagePath)) {
            return new Image({
                image: imagePath
            });
        }

        return null;
    }).filter(Boolean);
}

function fillLayerWithImage(layer, imageObj, symbolOverride = null) {
    let layerStyle = layer.style.fills[0]

    if (symbolOverride) {
        if (symbolOverride.property !== 'image') {
            return false;
        }

        layer.setOverrideValue(symbolOverride, imageObj.image.nsimage);
        return true;
    }

    layerStyle.fill = Style.FillType.Pattern;

    let imageData;

    if (MSImageData.alloc().initWithImage_convertColorSpace !== undefined) {
        imageData = MSImageData.alloc().initWithImage_convertColorSpace(imageObj.image.nsimage, false);
    }
    else {
        imageData = MSImageData.alloc().initWithImage(imageObj.image.nsimage);
    }

    layerStyle.sketchObject.setImage(imageData);
    layerStyle.sketchObject.setPatternFillType(1);

    return true;
}

export function generatePhotos(context) {
    const doc = Document.getSelectedDocument();
    const selection = doc.selectedLayers;
    const imagesCollection = loadImages(context, selection.length);


    if (!selection.length) {
        UI.message('Select at least one vector shape');
        return;
    }

    for (let i = 0; i < selection.length; i++) {
        const layer = selection.layers[i];
        const imageObj = imagesCollection[i];

        switch (layer.type) {
            case 'Shape': {
                fillLayerWithImage(layer, imageObj);
                break;
            }

            case 'SymbolInstance': {
                const expectedType = 'image';
                const oneSubLayerIsImage = layer.overrides.some((override) => {
                    return override.property === expectedType;
                });

                if (!oneSubLayerIsImage) {
                    UI.message('Symbol must have at least 1 image pre-filled');
                    return;
                }

                // Only replace first shape layer found with image
                layer.overrides.some((override) => {
                    if (override.property === expectedType) {
                        return fillLayerWithImage(layer, imageObj, override);
                    }

                    return false;
                });
            }

            default:
                break;
        }
    }
}
