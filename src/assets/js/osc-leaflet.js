L.Symbol.ArrowHeadOSC = L.Symbol.ArrowHead.extend({
    isZoomDependant: false,

});

L.Symbol.arrowHeadOSC = function (options) {
    return new L.Symbol.ArrowHeadOSC(options);
};