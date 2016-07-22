require.config({
    baseUrl: 'js',
    paths: {
        'jquery': 'lib/jquery',
        'jquery-ui': 'lib/jquery-ui',
        'lodash': 'lib/lodash',
        'backbone': 'lib/backbone',
        'machina': 'lib/machina',
        'leaflet': 'lib/leaflet',
        'markercluster': 'lib/leaflet.markercluster.min',
        'skobbler': 'lib/skobbler-2.0',
        'chartist': 'lib/chartist-0.9.2.min',
        'tooltipster': 'lib/jquery.tooltipster.min',
        'bootstrap': 'lib/bootstrap.min',
        'slick': 'lib/slick.min',
		'jquery-download': 'lib/jquery.fileDownload'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'jquery-ui': {
            deps: ['jquery']
        },
        'lodash': {
            exports: '_'
        },
        'backbone': {
            deps: ['lodash', 'jquery'],
            exports: 'Backbone'
        },
        'leaflet': {
        	exports: 'L'
        },
        'markercluster': {
        	deps: ['leaflet']
        },
        'skobbler': {
            deps: ['leaflet']
        },
        'chartist': {
        	exports: 'Chartist'
        },
        'tooltipster': {
        	deps: ['jquery'],
        	exports: 'tooltipster'
        },
        'bootstrap': {
        	deps: ['jquery']
        },
        'slick': {
        	deps: ['jquery'],
        	exports: 'slick'
        },
	'jquery-download': {
		deps: ['jquery'],
		exports: 'fileDownload'
	},	
        'routers/MainR': ['jquery', 'jquery-ui', 'backbone', 'machina', 'leaflet', 'markercluster', 'skobbler', 'chartist', 'tooltipster', 'bootstrap', 'slick', 'jquery-download']
    }
});

require(['routers/MainR', 'jquery-ui', 'slick', 'jquery-download'], function(MainR) {
    new MainR();
});