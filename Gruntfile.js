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
			},
			src: {
				options: { jshintrc: '.jshintrc' },
				src: 'form-builder.js'
			}
		},

		codepainter: {
			// individual files
			src: {
				options: {
					predef: 'idiomatic',
					style: {
						indent_style: 'tab'
					}
				},
				files: { 'form-builder.js' : 'form-builder.js' }
			},
		},

		// QA and recompile while you work
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: [ 'jshint:gruntfile' ]
			},

			js: {
				files: 'form-builder.js',
				tasks: [
					'codepainter:src',
					'jshint:src'
				]
			}
		},
	});


	// These plugins provide necessary tasks
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-codepainter' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );


	// build targets
	grunt.registerTask( 'test', [ 'jshint' ]);


	// default task
	grunt.registerTask( 'default', [ 'test' ]);


};
