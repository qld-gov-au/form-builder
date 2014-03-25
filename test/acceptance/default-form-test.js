casper.test.begin( 'Open the default form', 1, function suite( test ) {
	casper
	.start()

	.thenOpen( 'src/form-builder.html', function() {
		test.assertTitle( 'Form builder', 'opened default form' );
	})

	.run(function() {
		test.done();
	});
});