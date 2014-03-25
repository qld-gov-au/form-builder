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
					'test/.jshintrc',
					'.jshintrc'
				]
			},
			
			test: {
				options: { jshintrc: 'test/.jshintrc' },
				src: [
					'test/**/*.js'
				]
			}
		},


		casper: {
			defaultForm: {
				options: {
					test: true,
					concise: true,
					// parallel: true
				},
				files: {
					'build/casper/default-form.xml' : [ 'test/acceptance/default-form-test.js' ]
				}
			}
		},


		// QA and recompile while you work
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: [ 'jshint:gruntfile' ]
			},

			test: {
				files: 'test/**/*',
				tasks: [ 'jshint:test', 'casper' ]
			}
		},
	});


	// These plugins provide necessary tasks
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-casper' );


	// build targets
	grunt.registerTask( 'test', [ 'jshint' ]);


	// default task
	grunt.registerTask( 'default', [ 'test' ]);


};
