/**ID
 * fullscreenForm.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
	
	'use strict';



	/**
	 * extend obj function
	 */
	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	/**
	 * createElement function
	 * creates an element with tag = tag, className = opt.cName, innerHTML = opt.inner and appends it to opt.appendTo
	 */
	function createElement( tag, opt ) {
		var el = document.createElement( tag )
		if( opt ) {
			if( opt.cName ) {
				el.className = opt.cName;
			}
			if( opt.inner ) {
				el.innerHTML = opt.inner;
			}
			if( opt.appendTo ) {
				opt.appendTo.appendChild( el );
			}
		}	
		return el;
	}

	/**
	 * FForm function
	 */
	function FForm( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
  		extend( this.options, options );
  		this._init();
	}
	/**
	 * FForm options
	 */
	FForm.prototype.options = {
		// show progress bar
		ctrlProgress : true,
		// show navigation dots
		ctrlNavDots : true,
		// show [current field]/[total fields] status
		ctrlNavPosition : true,
		// reached the review and submit step
		onReview : function() { return false; }
	};

	/**
	 * init function
	 * initialize and cache some vars
	 */
	FForm.prototype._init = function() {
		// the form element
		this.formEl = this.el.querySelector( 'form' );
      
      	// Submit button
      	this.submitBtn = this.formEl.querySelector('button[type="submit"]');
      
		// list of fields
		this.fieldsList = this.formEl.querySelector( 'ol.fs-fields' );


      
		// current field position
		this.current = 0;

		// all fields
		this.fields = [].slice.call( this.fieldsList.children );
		
		// total fields
		this.fieldsCount = this.fields.length;
		
		// show first field
        this.fields[ this.current ].classList.add('fs-current');

		// create/add controls
		this._addControls();

		// create/add messages
		this._addErrorMsg();
		
		// init events
		this._initEvents();
      
        // init fieldPlugins
		this._fieldPlugins();
      
        // init posts
		this._post();
	};
  
  

    
    /**
	 * look for field types that need plugins and init
	 */
	FForm.prototype._fieldPlugins = function() {
       this.fields.forEach( function( fld ) {
         var phone_input = fld.querySelector( 'input[type="tel"]' )
         var website_input = fld.querySelector( 'input[type="url"]' )
         if(phone_input) {
           var phoneMask = IMask(
           phone_input, {
           mask: '(000) 000-0000'
           });
         }
         if(website_input) {
           var regex =/^.+$/;
           var websiteMask = IMask(
           website_input, {
             mask: 'https://***********************************', 
             placeholderChar: ''  
           });
         }
     }
    )
	}
    
    
    /**
	 * Post Form Data to appropriate places
	 */
    	FForm.prototype._post = function() {
     
	}
    

	/**
	 * addControls function
	 * create and insert the structure for the controls
	 */
	FForm.prototype._addControls = function() {
		// main controls wrapper
		this.ctrls = createElement( 'div', { cName : 'fs-controls', appendTo : this.el } );

		// continue button (jump to next field)
		this.ctrlContinue = createElement( 'button', { cName : 'fs-continue', inner : 'Continue', appendTo : this.ctrls } );
		this._showCtrl( this.ctrlContinue );

		// navigation dots
		if( this.options.ctrlNavDots ) {
			this.ctrlNav = createElement( 'nav', { cName : 'fs-nav-dots', appendTo : this.ctrls } );
			var dots = '';
			for( var i = 0; i < this.fieldsCount; ++i ) {
				dots += i === this.current ? '<button class="fs-dot-current"></button>' : '<button disabled></button>';
			}
			this.ctrlNav.innerHTML = dots;
			this._showCtrl( this.ctrlNav );
			this.ctrlNavDots = [].slice.call( this.ctrlNav.children );
		}

		// field number status
		if( this.options.ctrlNavPosition ) {
			this.ctrlFldStatus = createElement( 'span', { cName : 'fs-numbers', appendTo : this.ctrls } );

			// current field placeholder
			this.ctrlFldStatusCurr = createElement( 'span', { cName : 'fs-number-current', inner : Number( this.current + 1 ) } );
			this.ctrlFldStatus.appendChild( this.ctrlFldStatusCurr );

			// total fields placeholder
			this.ctrlFldStatusTotal = createElement( 'span', { cName : 'fs-number-total', inner : this.fieldsCount } );
			this.ctrlFldStatus.appendChild( this.ctrlFldStatusTotal );
			this._showCtrl( this.ctrlFldStatus );
		}

		// progress bar
		if( this.options.ctrlProgress ) {
			this.ctrlProgress = createElement( 'div', { cName : 'fs-progress', appendTo : this.ctrls } );
			this._showCtrl( this.ctrlProgress );
		}
	}

	/**
	 * addErrorMsg function
	 * create and insert the structure for the error message
	 */
	FForm.prototype._addErrorMsg = function() {
		// error message
		this.msgError = createElement( 'span', { cName : 'fs-message-error', appendTo : this.el } );
	}

	/**
	 * init events
	 */
	FForm.prototype._initEvents = function() {
		var self = this;
      
      	// attach trigger to submit button
        this.formEl.addEventListener('submit', (e) => this._onSubmit(e));
      
        // attach update event to check conditionals
        this.formEl.addEventListener('update', (e) => this._conditional(e));  
       
        

		// show next field
		this.ctrlContinue.addEventListener( 'click', function() {
			self._nextField(); 
		} );

		// navigation dots
		if( this.options.ctrlNavDots ) {
			this.ctrlNavDots.forEach( function( dot, pos ) {
				dot.addEventListener( 'click', function() {
					self._showField( pos );
				} );
			} );
		}

		// jump to next field without clicking the continue button (for fields/list items with the attribute "data-input-trigger")
		this.fields.forEach( function( fld ) {

          
          		if( fld.hasAttribute( 'data-link-trigger' ) ) {
				var a = fld.querySelector( 'a' );
                if( !a ) return;
                a.addEventListener( 'click', function() { 
                  self._nextField(); 
                });
                }
          
          
      

            // handle payment logic
            if($(fld).hasClass('payment') && !$(fld).hasClass('paymentreceived')) {
              // disable continue button
              var button = $(fld).closest('.fs-form-wrap').find('.fs-continue');
              $('body').off('paymentreceived').on('paymentreceived', function() {
               $(fld).addClass('paymentreceived');  
               button.attr("disabled", false); 
               self._nextField();
              }) 
            }   
          
			if( fld.hasAttribute( 'data-input-trigger' ) ) {
				var input = fld.querySelector( 'input[type="radio"]' ) || /*fld.querySelector( '.cs-select' ) ||*/ fld.querySelector( 'select' ); // assuming only radio and select elements (TODO: exclude multiple selects)
                if( !input ) return;

				switch( input.tagName.toLowerCase() ) {
					case 'select' : 
						input.addEventListener( 'change', function() { self._nextField(); } );
						break;

					case 'input' : 
						[].slice.call( fld.querySelectorAll( 'input[type="radio"]' ) ).forEach( function( inp ) {
							inp.addEventListener( 'change', function(ev) { self._nextField(); } );
						} ); 
						break;

					/*
					// for our custom select we would do something like:
					case 'div' : 
						[].slice.call( fld.querySelectorAll( 'ul > li' ) ).forEach( function( inp ) {
							inp.addEventListener( 'click', function(ev) { self._nextField(); } );
						} ); 
						break;
					*/
				}
			}
          
	
		} );

		// keyboard navigation events - jump to next field when pressing enter
		document.addEventListener( 'keydown', function( ev ) {
			if( !self.isLastStep && ev.target.tagName.toLowerCase() !== 'textarea' ) {
				var keyCode = ev.keyCode || ev.which;
				if( keyCode === 13 ) {
					ev.preventDefault();
					self._nextField();
				}
			}
		} );
	};

	/**
	 * nextField function
	 * jumps to the next field
	 */
	FForm.prototype._nextField = function( backto ) {
		if( this.isLastStep || !this._validade() || this.isAnimating ) {
			return false;
		}
		this.isAnimating = true;

        //let everyone know we are moving on
        const eventCon = new CustomEvent('update', { detail: this.fields[ this.current ].id });
        this.formEl.dispatchEvent(eventCon);
      
      
		// check if on last step
		this.isLastStep = this.current === this.fieldsCount - 1 && backto === undefined ? true : false;
		
		// clear any previous error messages
		this._clearError();

		// current field
		var currentFld = this.fields[ this.current ];

		// save the navigation direction
		this.navdir = backto !== undefined ? backto < this.current ? 'prev' : 'next' : 'next';

		// update current field
		this.current = backto !== undefined ? backto : this.current + 1;

		if( backto === undefined ) {
			// update progress bar (unless we navigate backwards)
			this._progress();

			// save farthest position so far
			this.farthest = this.current;
		}

		// add class "fs-display-next" or "fs-display-prev" to the list of fields
        this.fieldsList.classList.add('fs-display-' + this.navdir);
      
  


		// remove class "fs-current" from current field and add it to the next one
		// also add class "fs-show" to the next field and the class "fs-hide" to the current one
        currentFld.classList.remove('fs-current');
        currentFld.classList.add('fs-hide');
		
		if( !this.isLastStep ) {
			// update nav
			this._updateNav();

			// change the current field number/status
			this._updateFieldNumber();

			var nextField = this.fields[ this.current ];

          nextField.classList.add('fs-current');
          nextField.classList.add('fs-show');
		}
      
      
              if( !this.isLastStep ) {
              // check for variable blocks and replace them
              var label = nextField.querySelector('label');        
              var answerblock = label.querySelector('answer');  
                if(answerblock) {

                 var variable =  answerblock.dataset.id;
                   var formValue = [];
                this.fields.forEach(function (field, index) {
                  console.log(variable + ' == ' + field.id);
                  if(variable == field.id) {
                   switch(field.querySelector('[name]').type) { 
                   case 'radio':
                     formValue.push(field.querySelector('[name]:checked').value); 
                   break    
                   default:
                     formValue.push(field.querySelector('[name]').value);
                   }
                  }
                 });
               formValue = formValue[0];
               answerblock.innerHTML = formValue;
              }
             }   

		// after animation ends remove added classes from fields
		var self = this,
			onEndAnimationFn = function( ev ) {
			
                  "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend".split(" ").map(animEndEventName => this.removeEventListener(animEndEventName, onEndAnimationFn));
		
				
				
                self.fieldsList.classList.remove('fs-display-' + self.navdir );
                currentFld.classList.remove('fs-hide' );
              
                //if has youtube stop it
                var youtube = currentFld.querySelector('iframe');
                  if(youtube) {
                   var youtube_src = youtube.getAttribute('src');
                   youtube.setAttribute('src',youtube_src);
                  }

				if( self.isLastStep ) {
					// show the complete form and hide the controls
					self._hideCtrl( self.ctrlNav );
					self._hideCtrl( self.ctrlProgress );
					self._hideCtrl( self.ctrlContinue );
					self._hideCtrl( self.ctrlFldStatus );
					// replace class fs-form-full with fs-form-overview

                  self.formEl.classList.remove('fs-form-full');
                  self.formEl.classList.add('fs-form-overview');
                  self.formEl.classList.add('fs-show' );
				
					// callback
					self.options.onReview();
				}
				else {
				
                   nextField.classList.remove('fs-show');
					
					if( self.options.ctrlNavPosition ) {
						self.ctrlFldStatusCurr.innerHTML = self.ctrlFldStatusNew.innerHTML;
						self.ctrlFldStatus.removeChild( self.ctrlFldStatusNew );
                        self.ctrlFldStatus.classList.remove('fs-show-' + self.navdir );
					}
				}
				self.isAnimating = false;
              
    // focus on next field          
	if(!jQuery(self.formEl).hasClass('fs-form-overview')) {		 
	  jQuery(nextField).find('input, textarea').focus();
	}else{
		jQuery(self.formEl).find('.fs-current input, .fs-current textarea').blur();
	}
              
              
  

  
              //if(nextField.querySelector('label').includes('[' + blockId + ']'))

             
    // jump if conditional          
   	if(jQuery('.fs-current').hasClass('skip')) {
		self._nextField();		
	}
              
              
      // stop continue if payment   
   	if(jQuery('.fs-current').hasClass('payment') && !jQuery('.fs-current').hasClass('paymentreceived')) {
		      var button = jQuery('.fs-current').closest('.fs-form-wrap').find('.fs-continue');
              button.attr("disabled", true);
	}          
              

           
              
              
              
			};

	
			if( this.navdir === 'next' ) {
				if( this.isLastStep ) {
              "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend".split(" ").map(animEndEventName => currentFld.querySelector( '.fs-anim-upper' ).addEventListener(animEndEventName, onEndAnimationFn));

				}
				else {
        "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend".split(" ").map(animEndEventName => nextField.querySelector( '.fs-anim-lower' ).addEventListener(animEndEventName, onEndAnimationFn));

				}
			}
			else {
       "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend".split(" ").map(animEndEventName => nextField.querySelector( '.fs-anim-upper' ).addEventListener(animEndEventName, onEndAnimationFn));

			}

	}

	/**
	 * showField function
	 * jumps to the field at position pos
	 */
	FForm.prototype._showField = function( pos ) {
		if( pos === this.current || pos < 0 || pos > this.fieldsCount - 1 ) {
			return false;
		}
		this._nextField( pos );
	}

	/**
	 * updateFieldNumber function
	 * changes the current field number
	 */
	FForm.prototype._updateFieldNumber = function() {
		if( this.options.ctrlNavPosition ) {
			// first, create next field number placeholder
			this.ctrlFldStatusNew = document.createElement( 'span' );
			this.ctrlFldStatusNew.className = 'fs-number-new';
			this.ctrlFldStatusNew.innerHTML = Number( this.current + 1 );
			
			// insert it in the DOM
			this.ctrlFldStatus.appendChild( this.ctrlFldStatusNew );
			
			// add class "fs-show-next" or "fs-show-prev" depending on the navigation direction
			var self = this;
			setTimeout( function() {
		
               self.ctrlFldStatus.classList.add(self.navdir === 'next' ? 'fs-show-next' : 'fs-show-prev' );
			}, 25 );
		}
	}

	/**
	 * progress function
	 * updates the progress bar by setting its width
	 */
	FForm.prototype._progress = function() {
		if( this.options.ctrlProgress ) {
			this.ctrlProgress.style.width = this.current * ( 100 / this.fieldsCount ) + '%';
		}
	}

	/**
	 * updateNav function
	 * updates the navigation dots
	 */
	FForm.prototype._updateNav = function() {
		if( this.options.ctrlNavDots ) {
        this.ctrlNav.querySelector( 'button.fs-dot-current' ).classList.remove('fs-dot-current' );
        this.ctrlNavDots[ this.current ].classList.add('fs-dot-current' );
			this.ctrlNavDots[ this.current ].disabled = false;
		}
	}

	/**
	 * showCtrl function
	 * shows a control
	 */
	FForm.prototype._showCtrl = function( ctrl ) {
		ctrl.classList.add('fs-show' );
	}

	/**
	 * hideCtrl function
	 * hides a control
	 */
	FForm.prototype._hideCtrl = function( ctrl ) {
		ctrl.classList.remove('fs-show' );
	}

	// TODO: this is a very basic validation function. Only checks for required fields..
	FForm.prototype._validade = function() {
        
        // add email validation
        function validateEmail(email) {
           const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
           return re.test(String(email).toLowerCase());
         }
      
		var fld = this.fields[ this.current ],
			input = fld.querySelector( 'input[required]' ) || fld.querySelector( 'textarea[required]' ) || fld.querySelector( 'select[required]') || ( !fld.classList.contains('checkbox-form') ? null : fld.classList.contains('required') ? fld : null ),
			error;

		if( !input ) return true;
       
		switch( input.tagName.toLowerCase() ) {
			case 'input' : 
				if( input.type === 'radio' || input.type === 'checkbox' ) {
					var checked = 0;
					[].slice.call( fld.querySelectorAll( 'input[type="' + input.type + '"]' ) ).forEach( function( inp ) {
						if( inp.checked ) {
							++checked;
						}
					} );
					if( !checked ) {
						error = 'NOVAL';
					}
				}
            	if( input.type === 'email') {
                  if(!validateEmail(input.value)) {
                   error = 'INVALIDEMAIL';
                  }
				}
				else if( input.value === '' ) {
					error = 'NOVAL';
				}
				break;

			case 'select' : 
				// assuming here '' or '-1' only
				if( input.value === '' || input.value === '-1' ) {
					error = 'NOVAL';
				}
				break;

			case 'textarea' :
				if( input.value === '' ) {
					error = 'NOVAL';
				}
				break;
            case 'li' :
                console.log('test');
                var checked = 0;
					[].slice.call( fld.querySelectorAll( 'input[type="checkbox"]' ) ).forEach( function( inp ) {
						if( inp.checked ) {
							++checked;
						}
					} );
					if( !checked ) {
						error = 'NOVAL';
					}
		}

		if( error != undefined ) {
			this._showError( error );
			return false;
		}

		return true;
	}

	// TODO
	FForm.prototype._showError = function( err ) {
		var message = '';
		switch( err ) {
			case 'NOVAL' : 
				message = 'Please fill the field before continuing';
				break;
			case 'INVALIDEMAIL' : 
				message = 'Please fill a valid email address';
				break;
			// ...
		};
		this.msgError.innerHTML = message;
		this._showCtrl( this.msgError );
	}

	// clears/hides the current error message
	FForm.prototype._clearError = function() {
		this._hideCtrl( this.msgError );
	}
    
    // Conditional logic
    FForm.prototype._conditional = async function (e) {
     var formFields = e.target.querySelectorAll('.fs-fields [data-conditional]');
     [].forEach.call(formFields, function(formField) {
       var conArray = JSON.parse(formField.dataset.conditional);
       if('block-' + conArray[0] == e.detail) {
         var triggerField = document.querySelector('#'+ e.detail);
         var input = triggerField.querySelector( 'input[type="radio"]' ) ||  triggerField.querySelector( 'select' ) ||  triggerField.querySelector( 'input' ); 
         var triggerInput = [];
         switch(input.type) {
			case 'select' : 
           var triggerInput = input;  
         break;
         case 'radio' : 
            [].slice.call( triggerField.querySelectorAll( 'input[type="radio"]' ) ).forEach( function( inp ) {
              console.log(inp);
              if(inp.checked) {
               triggerInput.push(inp); 
               triggerInput = triggerInput[0]; 
              }
            }); 
         	break;
           default: 
              var triggerInput = input;  
	     }
         

         switch (conArray[1]) {
           case 'is': 
             if(triggerInput.value == conArray[2]) {  
               formField.classList.remove('skip');
             }else{
              formField.classList.add('skip');
             }
             break;
             if(triggerInput.value !== conArray[2]) {
               formField.classList.remove('skip');
             }else{
              formField.classList.add('skip');
             }
             break;
           case 'contains': 
             if(triggerInput.value.indexOf(conArray[2])) {
               formField.classList.remove('skip');
             }else{
              formField.classList.add('skip');
             }
             break;
           case 'less than': 
             if( parseInt(triggerInput.value.replace(/\D/g,''), 10) < parseInt(conArray[2].replace(/\D/g,''))) {  
               formField.classList.remove('skip');
             }else{
              formField.classList.add('skip');
             }
             break;
            case 'greater than':  
             if( parseInt(triggerInput.value.replace(/\D/g,''), 10) > parseInt(conArray[2].replace(/\D/g,''))) {  
               formField.classList.remove('skip');
             }else{
              formField.classList.add('skip');
             }
               break;
             default:

         }
       }
     });
    }
    
    // Submit event
    FForm.prototype._onSubmit = async function (e) {
      	e.preventDefault();
      
        var data = {}
  
      
        this.fields.forEach(el => {
        	var elClass = el.className;
          	var className = el.className;
            var fieldName = el.getAttribute('data-field-id');
          	var inputName = 'input'
          
            if (className.includes('dropdown-form')){
              	inputName = 'select';
            }
          
          	if (className.includes('radio-form')){
              	inputName = 'input[type="radio"]:checked';
            }
          

          	
          	if (className.includes('textarea-form')){
              	inputName = 'textarea';
            }
          	
            try	{
              if (className.includes('checkbox-form')){
               	inputName = 'input[type="checkbox"]:checked';
                var values = [];
                var allchecked = el.querySelectorAll(inputName), i;  
                for (i = 0; i < allchecked.length; ++i) {
                  values.push(allchecked[i].value);
                }
                data[fieldName] = values;
              }else{
              data[fieldName] = el.querySelector(inputName).value;
              }
            }catch{}
        });
      	
        this.submitBtn.innerText = 'Working ...';
        this.submitBtn.disabled = true;   

        await this._onGoHighLevelAdd(data);
              
       // await this._onCloseIOAdd(data);
          
       // await this._onKlaviyoAdd(data);
         
        this.done();
      
      	return false;
    }
                            
   	FForm.prototype._onCloseIOAdd = async function (data) {
          var formData = {
            name: null,
            url: null,
            contacts: [{
              emails: [],
              phones: []
            
            }]
          };
          
          if ('name' in data){
            formData['name'] = data['name'];
            formData['contacts'][0]['name'] = data['name'];
          }
          
          if ('email' in data){
            formData['contacts'][0]['emails'].push({
            	type: "office",
                email: data['email']
            });
          }
          
          if ('description' in data){
            formData['description'] = data['description'];
          }
          
          if ('phone' in data){
            formData['contacts'][0]['phones'].push({
            	type: "mobile",
                phone: data['phone']
            });
          }
          
          if ('url' in data){
            formData['url'] = data['url'];
          }
          
          console.log(formData);
          
          if ('Has Website' in data) {
           var customKey = 'lcf_GNfq4mz4k9jntD7zWWTSxqoK5ol32OsSlaFMFdlUCXw';
           formData[`custom.${customKey}`] = data['Has Website'];
          }
          if ('Interested in' in data) {
           var customKey = 'cf_gYttdDxJWnvb8rYM6bndrWvCCzNi664uVY2j8LlyPrD';
          formData[`custom.${customKey}`] = data['Interested in'];
          }
          if ('Monthly revenue' in data) {
           var customKey = 'cf_3sRdCcz9KBDnHRRONujoCSsdT2n0Mqu84K4wqVO95Zf';
           formData[`custom.${customKey}`] = data['Monthly revenue'];
          }
          if ('Current budget' in data) {
           var customKey = 'lcf_4IoN9qS2X0HBSJVbV2Cr9vkNLcpV2ttwVeO7vCrtK56';
           formData[`custom.${customKey}`] = data['Current budget'];
          }
          if ('Needs funding' in data) {
           var customKey = 'cf_1LGneWiRRoafLfPljeXR4x3J7Z2kO5Csrn0jqj7I25k';
            formData[`custom.${customKey}`] = data['Needs funding'];
          }
          if ('Timeline' in data) {
           var customKey = 'lcf_hZofjVY2CcwPKfgzwAPBDoo56B0VvYTsYhJ6XPFIW8b';
            formData[`custom.${customKey}`] = data['Timeline'];
          }
          
          /*
          Object.keys(data).forEach(key => {
          	if(!key.includes('lcf') && !key.includes('cf')) return;
            
            formData[`custom.${key}`] = data[key];
          });
          */
          
          
           console.log(formData);
          
          return fetch('https://api-backend-c.herokuapp.com/closeio', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
    }




  
      
      	FForm.prototype._onKlaviyoAdd = async function (data) {
         
          var formData = {
            g: "Wf9NzK",
            email: data['email'],
            $phone_number: data['phone'],
          };
          
          //add name or split
          var clientName = data['name'].split(" ");
          if  ((clientName.toString().split(" ").length - 1) !== 1) {
            formData['$first_name'] = data['name'];
          }else{
           formData['$first_name'] = clientName[0];
           formData['$last_name'] = clientName[1];
          }
         
          var customFields = [];
          Object.keys(data).forEach(key => {
          	if(key.includes('email') || key.includes('name') || key.includes('phone')) return;
            if(Array.isArray(data[key])) {
            formData[key] = data[key].toString();  
            }else{
            formData[key] = data[key];
            }
            customFields.push(key);
          });
          
          formData['$source'] = "Put Gang Meeting";
          
          formData['$fields'] = customFields.toString();
          console.log(formData);
          
     
            var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://manage.kmail-lists.com/ajax/subscriptions/subscribe",
  "method": "POST",
  "headers": {
    "content-type": "application/x-www-form-urlencoded",
    "cache-control": "no-cache"
  },
  "data": formData
}

$.ajax(settings).done(function (response) {
  console.log(response);
});
}







      
    
    // This function is ran when the form is submitted  
    FForm.prototype.done = function () {
     // hide form, show confirm
      this.el.nextElementSibling.classList.add("showanim");
     var namearray = [];
     this.fields.forEach( function( fld ) {
       if(fld.dataset.fieldId == 'name') {
        namearray.push(fld.querySelector('input').value);
       }
       if(fld.dataset.fieldId == 'email') {
        namearray.push(fld.querySelector('input').value);
       }
       if(fld.dataset.fieldId == 'phone') {
        namearray.push(fld.querySelector('input').value);
       }
     });
    }

	// add to global namespace
	window.FForm = FForm;

})( window );


(function() {
var formWrap = document.getElementById( 'fs-form-wrap' );
new FForm( formWrap, {
	onReview : function() {
			document.body.classList.add('overview' ); // for demo purposes only
	}
} );
})();
