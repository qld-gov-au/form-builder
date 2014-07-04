/*globals style_html */
/*exported formBuilder */
var actUponAction = false;

var formBuilder = (function( $, style_html ) {
	'use strict';

	function resetDragging(enable) {
	    var action = $("#edit-text-or-drag-btn");
	    if (enable) {
	        action.text("select text");
	    } else {
	        action.text("drag");
	    }
	    $( '.questions > li' ).each(function() {
            $( this ).prop( 'draggable', enable );
        });
	}

    var currentHtml = '';
	var KEY = {
			ASTERISK: 106, // * (numpad)
			DELETE: 46,
			ENTER: 13,
			INSERT: 45,
			DOWN: 40,
			MINUS: 109,
			PAGEDOWN: 34,
			PLUS: 107,
			// r: 82,
			// NUM_SLASH: 111, (numpad)
			SLASH: 191, // slash/question mark key
			TILDE: 192, // ` or ~ (with Shift)
			UP: 38
		},
		editable = [
			'h1',
			'.status h2',
			'.h2',
			'.h3',
			'p',
			'.preamble li',
			'.instructions li',
			'.hint',
			'.relevance',
			'.label',
			'.choices label',
			'input + label',
			'.actions a',
			'.actions button'
		],
		config = { appendToRedirect: [] },

		createQuestion = function( data ) {
			data = $.extend( {}, {
				// id : override if you do not want to use the label
				label : 'What is your answer?',
				required : true
			}, data );

			// TODO other control types
			var widget = $( '<input/>' ).generateId( data.id || data.label ),
			// TODO use legend instead of label when required
				label = $( '<label/>' ).attr( 'for', widget[ 0 ].id )
			;

			// label text
			label.append( '<span class="label">' + data.label + '</span>' );

			// required fields?
			if ( data.required === true ) {
				label.append( '<abbr title="(required)">*</abbr>' );
				widget.attr( 'required', 'required' );
			}

			// TODO hints, help
			return $( '<li/>' ).append( label ).append( widget );
		},

		formFromMarkdown = function( markdown ) {
			// process each line
			var html = $.map( markdown.split( /\n/ ), function( line ) {
				if ( /\S/.test( line )) {
					return createQuestion({ label: line }).wrap( '<ol/>' ).parent().html();
				} else {
					// blank lines
					return null;
				}
			}).join( '\n' );

			return html;
		}
	;

	// clean HTML
	$.fn.cleanHtml = function() {
		var html = this.clone();

		html
			// UI states added by SWE template
			.find( '.focus' ).removeClass( 'focus' ).end()
			.find( '.keyboard-focus' ).removeClass( 'keyboard-focus' ).end()
			.find( '.mouse-focus' ).removeClass( 'mouse-focus' ).end()
			.find( '.active' ).removeClass( 'active' ).end()
			// form attributes that should be reset to defaults
			.find( '[class=""]' ).removeAttr( 'class' ).end()
			.find( '[style]' ).removeAttr( 'style' ).end()
			.find( '[tabindex]' ).removeAttr( 'tabindex' ).end()
			// @disabled, @hidden and @aria-hidden added by relevance lib
			.find( '[disabled]' ).removeAttr( 'disabled' ).end()
			.find( '[hidden]' ).removeAttr( 'hidden' ).end()
			.find( '[aria-hidden]' ).removeAttr( 'aria-hidden' ).end()
			// ARIA landmark @id added by SWE template
			.find( '[id^="landmark-label"]' ).removeAttr( 'id' ).end()
			// @novalidate and label@id added by form validation UI
			.find( '[novalidate]' ).removeAttr( 'novalidate' ).end()
			.find( '[id^="label-"]' ).removeAttr( 'id' ).end()
			// @draggable added by drag and drop lib
			.find( '[draggable]' ).removeAttr( 'draggable' ).end()
			// remove dynamic UI elements
            // Cant just remove all status messages since they could be intentionally added via import.
            // The dynamic UI elements for status would have been added by validation in preview mode and
            // now we dont have a export function within preview mode.
			//.find( '.status' ).remove().end()
		;

		// convert to markup
		html = style_html( html.html(), {
			'indent_size': 1,
			'indent_char': '\t',
			'max_char': 1000//, // reduce word wrap
			// 'brace_style': 'expand',
			// 'unformatted': ['a', 'sub', 'sup', 'b', 'i', 'u']
		})
			// empty tags
			.replace( /<(input)\s+([^>]*?)[\s\/]*?>/g, '<$1 $2 />' )
			// escape HTML
			// .replace( /</g, '&lt;' )
		;

		return html;
	};

	// sidebar functions
	$( '#toggle button' ).click(function() {
		var action = $( this ),
			content = $( '#content' ),
			html;

		switch ( action.text() ) {
			
		case 'select text':
			resetDragging(false);
		break;
		
		case 'drag':
			resetDragging(true);
		break;

		case 'Configuration':
			$( document ).status( 'show', {
				status : 'info',
				lightbox : true,
				title : 'Form configuration',
				body : $( '#form-configuration' ).html(),
				callbackPostOpen: function() {
					// populate list of fields
					$( $( 'form', '#content' )[ 0 ].elements ).each(function() {
						if ( this.name ) {
							$( '#fields' ).append( $( '<option value="' + this.name + '" />' ));
						}
					});
				},
				callbackPreClose: function() {
					var footer = $( '.footer', '#content' );
					// TODO special handling for @action, @method and @enctype
					// set hidden fields in form
					$( 'input', '#content' ).filter( ':hidden' ).remove();
					$( 'input,select,textarea', '#jb-window-content' ).each(function() {
						footer.prepend( '<input type="hidden" name="' + this.name + '" value="' + this.value + '" />' );
					});
				}
			});
			break;

		case 'preview':
		    currentHtml = $( '.article > div > div', '#content' ).html();
			action.text("edit");
            resetDragging(false);
			$( 'body' ).toggleClass( 'lofi' );
			// TODO clean up heavy handed relevance recalculations
			$( 'form', '#content' ).removeData('relevance').forcesRelevance( 'instructions' );
			$( '#toolbox' ).slideUp();
			$( '#editButtons').slideUp();
			$( '.constructiform', '#content' ).removeClass( 'constructiform' );
			$( '[draggable]' ).removeAttr( 'draggable' );

			break;
			
		case 'edit':
		    $( '.article > div > div', '#content' ).html(currentHtml);
			action.text("preview");
			
			$( 'body' ).toggleClass( 'lofi' );
			// TODO clean up heavy handed relevance recalculations
			// $( 'form', '#content' ).forcesRelevance( 'instructions' );
			$( '.article', '#content' ).addClass( 'constructiform' );
			$( '#toolbox' ).slideDown();
			$( '#editButtons' ).slideDown();
            resetDragging(true);
			break;

		case 'export html':
			if ( content.find( 'pre' ).length > 0 ) {
				$( '#pre' ).remove();
				content.find( 'pre' ).remove();
			}

			// get html and cleanup
			html = $( '.article > div > div', '#content' ).cleanHtml();

			// lightbox
			content.after( '<div id="pre" style="display: none"><a href="#export-html">view html</a><textarea id="export-html" readonly>' + html.replace( /</g, '&lt;' ) + '</textarea></div>' );
			$( 'a', '#pre' ).butterfly().click();

			break;

		case 'import html':
			$( document ).status( 'show', {
				status : 'info',
				lightbox : true,
				title : 'Import HTML',
				body : '<textarea rows="10" cols="5"></textarea><ul class="actions"><li><strong><input type="button" value="Import HTML" onclick="actUponAction=true;$(\'#jb-close-button\').click();"/></strong></li></ul>',
				callbackPostOpen: function() {
					actUponAction = false;
					// focus on textarea
					$( 'textarea', this ).focus();
				},
				callbackPreClose: function() {
					if (!actUponAction) {
						return;
					}					
					// paste textarea contents in
					$( '.article > div > div', '#content' ).html( $( 'textarea', this.href.replace( /^[^#]*/, '' )).val() );
					// reset form handlers
					frood.dragAndDrop.init();
				}
			});
			break;

		case 'lofi/hifi':
			$( 'body' ).toggleClass( 'lofi' );
			// TODO clean up heavy handed relevance recalculations
			$( 'form', '#content' ).forcesRelevance( 'instructions' );

			break;

		case 'new form':
		    currentHtml = '';
			$( document ).status( 'show', {
				status : 'info',
				lightbox : true,
				title : 'New form',
				body : '<p>A form is <em>a list of questions</em>.</p><p>List your questions below</p><textarea rows="10" cols="5"></textarea><ul class="actions"><li><strong><input type="button" value="Create new form" onclick="actUponAction=true;$(\'#jb-close-button\').click();"/></strong></li></ul>',
				callbackPostOpen: function() {
					actUponAction = false;
					// focus on textarea
					$( 'textarea', this ).focus();
				},
				callbackPreClose: function() {
					if (!actUponAction) {
						return;
					}
					// preserve the form footer
					var footer = $( '.footer', '#content' );
					// paste textarea contents in, convert via markdown
					$( '.questions', '#content' ).eq( 0 )
						.html( formFromMarkdown( $( 'textarea', this.href.replace( /^[^#]*/, '' )).val() ) )
						.append( footer )
					;
					// click each label to check @id (ensures they are unique now they are inserted in document)
					$( '.label', '#content' ).click();
					// focus on first field that was added (blurs last clicked label above)
					$( 'input, select, textarea', '#content' ).eq( 0 ).focus();

					// reset form handlers
					frood.dragAndDrop.init();
				}
			});
			break;
		}
		return false;
	});

	$( '#toolbox' ).on( 'click', '#toolbox .actions li', function( event ) {
		event.preventDefault();
		$( this ).clone().appendTo( '#content .actions' );
	});

	$( '#toolbox' ).on( 'click', '#toolbox h2 + .questions > li:not(".footer")', function( event ) {

		// create new "clone" function that handles @id and @name
		var control = $( this ).clone().removeClass( 'active' ),
			input = control.find( 'input, select, textarea' ),
			names = {};

		// id (also handle radio/checkbox)
		input.each(function() {
			var clonedId = this.id;
			$( this ).removeAttr( 'id' ).generateId( clonedId );
			control.find( 'label' ).filter( '[for=' + clonedId + ']' ).attr( 'for', this.id );
		});

		// fix @name
		input.not( ':radio, :checkbox' ).each(function() {
			this.name = this.id;
		});
		// fix @name and @id for radio and checkboxes
		input.filter( ':radio, :checkbox' ).each(function() {
			var clonedId = this.id;
			if ( ! names[ this.name ]) {
				names[ this.name ] = clonedId;
			}
			this.name = names[ this.name ];
			$( this ).removeAttr( 'id' ).generateId( this.name + '-' + this.value );
			control.find( 'label' ).filter( '[for=' + clonedId + ']' ).attr( 'for', this.id );
		});

		$( '.footer', '#content' ).before( control.fadeIn( 500 ));
		// reset drag and drop
		frood.dragAndDrop.init();

		event.preventDefault();
		return false;
	});

	$( '.article' )
		// edit on click
		.on( 'click', $.map( editable, function( value ) { return '.constructiform ' + value; }).join( ',' ), function( event ) {
			var target = $( this ),
				input;

			// suppress if .editinplace
			if ( $ ( event.target ).is( '.editinplace' )) {
				return false;
			}

			// TODO when should this be an input and when a textarea and when a HTML input?
			input = $( '<input type="text" class="editinplace" list="toolboxData" />' ).val( target.html() ).data( 'target', target );
			target.html( input );

			input.focus();
			return false;
		})

		// list of values for select
		.on( 'click', '.constructiform select', function( event ) {
			var target = $( this ),
				input;

			// suppress if .editinplace
			if ( $ ( event.target ).is( '.editinplace' )) {
				return false;
			}

			event.preventDefault();

			// edit list of options
			input = $( '<textarea class="editinplace select" rows="2" cols="30"></textarea>' ).val( $.map( target.find( 'option' ), function( option ) {
				return $( option ).text();
			}).join( ', ' )).data( 'target', target );
			target.before( input );
			target.hide();

			input.focus();
			return false;
		})

		// click '*' to remove @required constraint
		.on( 'click', '.constructiform abbr[title="(required)"]', function( event ) {
			$( event.target ).closest( 'li' ).find( 'input, select, textarea' ).toggleRequired( false );
			return false;
		})

		// keydown controls on input/textarea
		.on( 'keydown', '.constructiform input, .constructiform textarea', function( event ) {
			var handled = false,
				target;

			// console.log( event );

			// ignore if .editinplace
			if ( $ ( event.target ).is( '.editinplace' )) {
				return true;
			}

			// * (ON NUMPAD) = toggle required
			if ( event.which === KEY.ASTERISK ) {
				target = $( event.target );
				target.toggleRequired( ! target.attr( 'required' ));
				handled = true;
			}

			if ( handled ) {
				event.preventDefault();
				return false;
			}
		})

		// keydown on questions
		.on( 'keydown', '.constructiform .questions > li:not(.footer)', function( event ) {
			var handled = false,
				$this;

			// ignore if .editinplace
			if ( $ ( event.target ).is( '.editinplace' )) {
				return true;
			}

			// UP move question
			if ( event.which === KEY.UP ) {
				$this = $( this );
				if ( $this.prev( 'li' ).length > 0 ) {
					// check if previous item is a group or section
					if ( $this.prev( 'li' ).find( '.questions' ).length > 0 ) {
						// make this the last item in the group/section
						$this.appendTo( $this.prev( 'li' ).find( '.questions' ).eq( -1 ));
					} else {
						// swap with preceding question
						$this.insertBefore( $this.prev( 'li' ));
					}
				} else if ( $this.parents( 'li' ).length > 0 ) {
					// place before parent group/section container
					$this.insertBefore( $this.parents( 'li' ).eq( 0 ));
				}
				$this.find( 'input, select, textarea' ).eq( 0 ).focus();
				handled = true;

			// DOWN move question
			} else if ( event.which === KEY.DOWN ) {
				$this = $( this );
				if ( $this.next( 'li' ).not( '.footer' ).length > 0 ) {
					// check if next item is a group or section
					if ( $this.next( 'li' ).find( '.questions' ).not( '.footer' ).length > 0 ) {
						// make this the first item in the group/section
						$this.prependTo( $this.next( 'li' ).not( '.footer' ).find( '.questions' ).eq( 0 ));
					} else {
						// swap with following question
						$this.insertAfter( $this.next( 'li' ));
					}
				} else if ( $this.parents( 'li' ).length > 0 ) {
					// place after parent group/section container
					$this.insertAfter( $this.parents( 'li' ).eq( 0 ));
				}
				$this.find( 'input, select, textarea' ).eq( 0 ).focus();
				handled = true;

			// HTML CODE for question
			} else if ( event.which === KEY.TILDE ) {
				$( document ).status( 'show', {
					lightbox : true,
					title : 'HTML code',
					body : '<pre>' + $( this ).cleanHtml().replace( /</g, '&lt;' ) + '</pre>'
				});
				handled = true;

			// cycle through question types
			} else if ( event.which === KEY.PAGEDOWN ) {
				// change text input into select
				(function( question ) {
					var input = question.find( ':text' ),
						select = $( '<select><option value="">— select ' + ( question.find( '.label' ).text().toLowerCase() ) + ' —</option><option>' + input.val() + '</option></select>' ).attr({
							id: input[ 0 ].id,
							name: input[ 0 ].name
						})
					;

					input.replaceWith( select );

				}( $( this ) ));
				handled = true;

			// add a hint
			} else if ( event.which === KEY.SLASH ) {
				// add a hint, if one doesn't already exist
				(function( question ) {
					var hint = question.find( '.hint' );

					if ( hint.length === 0 ) {
						hint = $( '<small class="hint"/>' );
						question.find( '.label' ).after( hint );
					}
					hint.click();

				}( $( this ) ));
				handled = true;

			// add a relevance instruction
			} else if ( event.which === KEY.INSERT ) {
				// add a hint, if one doesn't already exist
				(function( question ) {
					var hint = question.find( '.relevance' ),
						value = question.prev().find( ':radio,:checkbox' )
					;

					if ( value.length > 0 ) {
						value = value.val();
					} else {
						value = 'Yes';
					}

					if ( hint.length === 0 ) {
						hint = $( '<small class="hint relevance">(If you chose ‘'+ value +'’ above)</small>' );
						question.find( '.label' ).after( hint );
					}
					hint.click();

				}( $( this ) ));
				handled = true;

			// DELETE remove question
			} else if ( event.which === KEY.DELETE ) {
				$( this ).remove();
				handled = true;
			}

			if ( handled ) {
				event.preventDefault();
				return false;
			}
		})
	;

//  Chrome requires that the element is focused to capture key events.
    $( document ).on( 'click', '.constructiform .choices > li', function( event ) {
        event.target.focus();
    });

	// manipulate radio button / checkbox choices
	$( document ).on( 'keyup', '.constructiform .choices > li', function( event ) {
		var handled = false,
			element,
			target;

		// ignore if .editinplace
		if ( $ ( event.target ).is( '.editinplace' )) {
			return true;
		}

		switch ( event.which ) {
		case KEY.PLUS:
			// add a new option after this one
			target = $( this );

			element = target.clone();
			element.find( 'input' ).removeAttr( 'id' ).generateId( this.id );
			element.find( 'label' ).attr( 'for', element.find( 'input' ).attr( 'id' ));

			target.after( element );

			// click to invoke 'edit in place'
			element.find( 'label' ).click();

			handled = true;
			break;

		case KEY.MINUS:
		case KEY.DELETE:
			// TODO focus on next/prev button?
			// if removing last item, should this remove the question?
			$( this ).remove();
			handled = true;
			break;
		}

		if ( handled ) {
			event.preventDefault();
			return false;
		}
	});


	// edit form actions
	$( document ).on( 'click', '.constructiform .actions input:submit, .constructiform .actions input:reset, ', function( event ) {
		event.preventDefault();

		var action = $( this );
		var input = $( '<input class="editinplace">' ).val( action.val() || action.text() );
		input.data( 'target', action );
		
		action.hide();
		input.insertAfter( action ).show().focus();
	});


	// edit in place handling
	$( document ).on( 'blur', 'input.editinplace', function() {
		var target = $( this ),
			val = $.trim( target.val() ),
			widget,
			name
		;

		target = target.data( 'target' );
		if ( target.is( 'input' )) {
			$( this ).remove();
			target.val( val ).show();
		} else {
			target.html( val );
		}

		// delete when label/heading is deleted
		if ( val.length === 0 && target.is( '.label,.h2,.h3,.actions input,.actions a,.actions button' )) {
			target.closest( 'li' ).remove();
			return;
		}

		if ( target.is( '.label' )) {

			if ( target.parent().is( 'label' )) {
				// change @id
				target = target.parent();
				widget = target.next( 'input, select, textarea' );
				widget.removeAttr( 'id' ).generateId( val.split( /\s+/ ).splice( 0, 7 ).join( '-' ) );
				widget.attr( 'name', widget[ 0 ].id );
				target.attr( 'for', widget[ 0 ].id );

			} else if ( target.parent().is( 'legend' )) {
				// set @name for radio buttons and checkboxes and then update all @id/@for attrs too
				widget = target.closest( 'fieldset' ).find( 'input' ).eq( 0 );
				name = widget[ 0 ].id;
				widget.removeAttr( 'id' ).generateId( val );
				widget.attr( 'name', widget[ 0 ].id );
				// restore id
				widget.attr( 'id', name );
				// get @name
				name = widget[ 0 ].name;

				target.closest( 'fieldset' ).find( 'input' ).each(function() {
					widget = $( 'label' ).filter( '[for=' + this.id + ']' );
					this.name = name;
					$( this ).removeAttr( 'id' ).generateId( this.name + '-' + this.value );
					widget.attr( 'for', this.id );
				});
			}

		} else if ( target.is( 'label' )) {

			if ( target.prev( ':checkbox' ).length === 1 && target.closest( '.choices', 'ul, ol' ).length === 0 ) {
				// single checkbox not in '.choices' wrapper
				if ( val.length === 0 ) {

					target.closest( '.questions > li' ).remove();

				} else {

					widget = $( document.getElementById( target.attr( 'for' )));
					widget.val( 'true' );
					widget.removeAttr( 'id' ).generateId( val );
					widget.attr( 'name', widget[ 0 ].id );
					widget.attr( 'value', widget[ 0 ].id );
					target.attr( 'for', widget[ 0 ].id );
				}

			} else {

				if ( val.length === 0 ) {

					target.closest( '.choices > li' ).remove();

				} else {

					widget = $( document.getElementById( target.attr( 'for' )));
					widget.val( val );
					widget.removeAttr( 'id' ).generateId( widget[ 0 ].name + '-' + val );
					target.attr( 'for', widget[ 0 ].id );
				}
			}

		} else if ( val.length === 0 ) {
			target.remove();
		}

		// append to datalist for future reuse?
		// needs to be unique, should be sorted in alphabetical order
		// $( '#toolboxData' ).append( '<option value="' + target.val() + '" />' );

	}).on( 'blur', 'textarea.editinplace.select', function() {
		var target = $( this ),
			options = target.val().split( /[\n,;]\s*/ )
		;

		target = target.data( 'target' );

		if ( options.length ) {
			// map text to option elements
			target.html( $.map( options, function( option ) {
				return '<option>' + option + '</option>';
			}).join( '' ));

			// show the select element
			target.show();

		} else {
			// no options, remove select
			target.remove();
		}

		// remove .editinplace for select
		$( this ).remove();

	}).on( 'keydown', 'input.editinplace', function( event ) {
		if ( event.which === KEY.ENTER ) {
			// trigger blur
			$( this ).blur();
		}

	}).on( 'focus', '.editinplace', function() {
		this.select();
	});

	// don't submit forms
	// but allow validation will run (desirable)
	$( document ).on( 'submit', 'form', function() {
		return false;
	});

	return {
		config: config,

		configure: function( newConfig ) {
			$.extend( config, newConfig );
		}
	};

}( jQuery, style_html ));
