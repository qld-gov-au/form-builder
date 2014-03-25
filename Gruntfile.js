'use strict';

module.exports = function( grunt ) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON( 'package.json' ),


		jshint: {
			gruntfile: {
				options: { jshintrc: '.jshintrc' },
				src: [
					'Gruntfile.js',
					'package.json',
					'.jshintrc'
				]
			}
		},


		// QA and recompile while you work
		watch: {
			// https://github.com/gruntjs/grunt-contrib-watch/issues/35#issuecomment-18508836
			options: { interval: 5007 },

			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: [ 'jshint:gruntfile' ]
			}

		},
	});


	// These plugins provide necessary tasks
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );


	// build targets
	grunt.registerTask( 'test', [ 'jshint' ]);


	// default task
	grunt.registerTask( 'default', [ 'test' ]);


};
