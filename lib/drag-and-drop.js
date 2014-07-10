/*
 * frood
 * https://github.com/Ben/frood
 *
 * Copyright (c) 2013 Ben Boyle
 * Licensed under the MIT license.
 */

/*global frood:true*/
var frood = frood || {};
frood.dragAndDrop = (function( $ ) {
	'use strict';


	// http://www.html5rocks.com/en/tutorials/dnd/basics/#toc-creating-dnd-content

	var dragSrcEl,
		module
	;


	// start dragging (css style)
	function handleDragStart( e ) {
		/*jshint validthis:true */

		// stop nested handlers from firing on containing elements
		e.stopImmediatePropagation();

		var question = $( this );

		dragSrcEl = question;
		question.addClass( 'no-drop' );
		question.next().addClass( 'no-drop' );

		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData( 'text/html', question.html() );
	}


	// fires once when dragging over drop targets (apply css)
	function handleDragEnter() {
		/*jshint validthis:true */

		var target = $( this );
		if ( ! target.hasClass( 'no-drop' )) {
			$( this ).addClass( 'drop-target' );	
		}
	}


	// suppress: fires continuously while dragging over target
	function handleDragOver( e ) {
		if ( e.preventDefault ) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}
		e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
		return false;
	}


	// fires when leaving a drop target (reset css)
	function handleDragLeave() {
		/*jshint validthis:true */
		$( this ).removeClass( 'drop-target' );
	}


	function handleDrop( e ) {
		/*jshint validthis:true */
		// this / e.target is current target element.
		// stops the browser from redirecting. both required for firefox and chrome
		if ( e.preventDefault ) {
		    e.preventDefault();
        }
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// Don't do anything if dropping the same column we're dragging.
		if ( dragSrcEl[ 0 ] !== this ) {
			// Set the source column's HTML to the HTML of the column we dropped on.
			$( this ).before( dragSrcEl );
		}
		// See the section on the DataTransfer object.
		return false;
	}


	function handleDragEnd() {
		$( '.questions > li' ).removeClass( 'no-drop drop-target' );
	}


	module = {};


	module.init = function() {
		$( '.questions > li' ).each(function() {
			// setup drag and drop
			this.addEventListener( 'dragstart', handleDragStart, false );
			this.addEventListener( 'dragenter', handleDragEnter, false );
			this.addEventListener( 'dragover', handleDragOver, false );
			this.addEventListener( 'dragleave', handleDragLeave, false );
			this.addEventListener( 'drop', handleDrop, false );
			this.addEventListener( 'dragend', handleDragEnd, false );

			$( this ).prop( 'draggable', true );
		});
	};


	// on DOM ready
	$( module.init() );

	// return module
	return module;

}( jQuery ));
