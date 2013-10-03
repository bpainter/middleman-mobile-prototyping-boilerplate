(function ($) {
  $.fn.accessibleSelects = function () {
    return this.each(function () { 
      // Default options for the widget
      // The are overidden by whatever is passed to the constructor, eg:
      // $('#element').form-custom-select({ customSelectWidth: 200})

      options: {
          customSelectWidth: false
      },

      // Constructor
      // _create() will be called automagically when the widget is instantiated.
      //
      // The following members will already be set:
      //
      //  * this.options -> options hash passed to the constructor + defaults
      //  * this.element -> parent element for this widget

      _create: function() {
          var options     = this.options;
          var self        = this.element;
          var parent      = this.element.closest('.item');

          // console.log('Self', self);
          // console.log('Parent', parent);

          var originalSelect   = self;
          var originalSelectID = self.attr('id');
          var customSelect     = self.find('.custom-select');
          var customSelectID   = 'custom-select-' + originalSelectID;

          // generate an ID to the label to we can use the 'aria-labeledby' attr
          var customSelectLabel = 'custom-select-label-' + originalSelectID;
          parent.find('label[for="' + originalSelectID + '"]').attr('id', customSelectLabel);

          // Create and append the HTML for the custom select
          originalSelect.addClass('original-select').attr('aria-disabled', 'false')
               .parent().addClass('custom-select').attr('id', customSelectID)
               .prepend('<a href="#" class="custom-select-current" id="' + customSelectID + '-button" role="button" aria-haspopup="true" aria-owns="' + customSelectID + '-menu" aria-labeledby="' + customSelectLabel + '" aria-describedby="' + customSelectLabel + '" aria-disabled="false" tabindex="0"><span class="text"></span><span class="arrow"></span></a><ul class="custom-select-options" id="' + customSelectID + '-menu" role="listbox" aria-hidden="true" arial-labeledby="' + customSelectLabel + '" aria-describedby="' + customSelectLabel + '" aria-disabled="false" aria-activedescendant=""></ul>'); 

          // grab all of the options of the original select
          // so we can rewrite them as <li>'s and append them to
          // the new div for 'custom-select-options'                 
          var customSelectButton    = $('#' + customSelectID + '-button');
          var customSelectOptions   = $('#' + customSelectID + '-menu');
          var customOptionsToInsert = '';
          var isDisabled            = "";
          var isSelected            = "";

          if (options.customSelectWidth) {
              originalSelect.css('width', options.customSelectWidth);
              customSelectButton.css('width', options.customSelectWidth);
          }

          $('#' + originalSelectID).find('option').each(function(index) {
              // check to see if the option field is disabled;
              if($(this).is(":disabled")) {
                  isDisabled = ' aria-disabled="true"';
              } else {
                  isDisabled = ' aria-disabled="false"';
              }
              if($(this).is(":selected")) {
                  isSelected = ' aria-selected="true"';
              } else {
                  isSelected = ' aria-selected="false"';
              }
              customOptionsToInsert  += '<li id="custom-select-' + customSelectID + '-option-' + index + '"' + isDisabled + isSelected +' aria-labeledby="' + customSelectLabel + '"  aria-describedby="' + customSelectLabel + '" role="option" tabindex="0" >' + $(this).text() + '</li>';
          });
          $(customSelectOptions).append(customOptionsToInsert);

          // add the original selected option to the custom select
          var originalSelectText    = $('#' + originalSelectID).find('option:selected').text();
          var customSelectText      = $('#' + customSelectID).find('.text');
          customSelectText.text(originalSelectText);

          var customSelectCurrent   = $('#' + customSelectID).find('.custom-select-current');
          var isOpen                = false;

          // bind the parent label focus to the custom select
          parent.find('label[for="' + originalSelectID + '"]').bind('click', function(event){
              customSelectButton.focus();
              event.preventDefault();
          });

          // Toggle menu visibility
          // click to show the options for the custom select
          customSelectButton
              .bind('mousedown', function(event){
                  toggleOptions(event);
                  return false;
              })
              .bind('click', function(){
                  return false;
              })
              .bind('keydown', function(event){
                  var ret = false;
                  switch (event.keyCode) {
                      case $.ui.keyCode.ENTER:
                          toggleOptions(event);
                          ret = true;
                          break;
                      case $.ui.keyCode.SPACE:
                          toggleOptions(event);
                          break;
                      case $.ui.keyCode.UP:
                          if (event.altKey) {
                              openOptions(event);
                          } else {
                              openOptions(event);
                          }
                          break;
                      case $.ui.keyCode.DOWN:
                          openOptions(event);
                          break;
                      case $.ui.keyCode.LEFT:
                          openOptions(event);
                          break;
                      case $.ui.keyCode.RIGHT:
                          openOptions(event);
                          break;
                      default:
                          ret = true;
                  }
              return ret;
              })
              .bind('keypress', function(event){
                  // section for type select
              })
              .bind('mouseover', function(){
                  customSelectButton.addClass('hover');
              })
              .bind('mouseout', function(){
                  customSelectButton.removeClass('hover');
              })
              .bind('focus', function(){
                  customSelectButton.addClass('focus');
              })
              .bind('blur', function(){
                  customSelectButton.removeClass('focus');
          });

          // controls the events for the select options
          customSelectOptions.find('li')
              .bind('mousedown', function(event){
                  var liOption = $(this);
                  // change the current selected to what was chosen
                  customSelectText.text(liOption.text());

                  liOption.siblings().attr('aria-selected', 'false');
                  liOption.attr('aria-selected', 'true');
                  
                  // changes the selected option for the original select
                  var customOptionIndex = liOption.index();
                  originalSelect.find('option').removeAttr('selected');
                  originalSelect.find('option:eq('+ customOptionIndex +')').attr('selected', 'selected');

                  // sets the active descendant
                  var selectedItem = customSelectOptions.find('li[aria-selected="true"]');
                  var selectedID = selectedItem.attr('id');
                  customSelectOptions.attr('aria-activedescendant', selectedID);

                  closeOptions(event);
                  return false;
              })
              .bind('click', function(){
                  return false;
              })
              .bind("keydown", function(event) {
                  var ret = false;
                  switch (event.keyCode) {
                      case $.ui.keyCode.UP:
                          if (event.altKey) {
                              closeOptions(event);
                          } else {
                              moveFocus('prev');
                          }
                          break;
                      case $.ui.keyCode.DOWN:
                          if (event.altKey) {
                              closeOptions(event);
                          } else {
                              moveFocus('next');
                          }
                          break;
                      case $.ui.keyCode.LEFT:
                          moveFocus('prev');
                          break;
                      case $.ui.keyCode.RIGHT:
                          moveFocus('next');
                          break;
                      case $.ui.keyCode.HOME:
                          moveFocus('first');
                          break;
                      case $.ui.keyCode.PAGE_UP:
                          moveFocus('prev');
                          break;
                      case $.ui.keyCode.PAGE_DOWN:
                          moveFocus('next');
                          break;
                      case $.ui.keyCode.END:
                          moveFocus('last');
                          break;
                      case $.ui.keyCode.NUMLOCK:
                          break;
                      case $.ui.keyCode.ENTER:
                      case $.ui.keyCode.SPACE:
                          $(this).trigger('mousedown');
                          break;
                      case $.ui.keyCode.TAB:
                          ret = true;
                          $(this).trigger('mousedown');
                          break;
                      case $.ui.keyCode.ESCAPE:
                          closeOptions(event);
                          break;
                      default:
                          ret = true;
                  }
                  return ret;
              })
              .bind('keypress', function(event) {
                  if (event.which > 0) {
                      // autocomplete
                  }
                  return true;
              })
              .bind('mouseover', function(){
                  $(this).siblings().removeClass('focus');
                  $(this).addClass('focus');
              })
              .bind('mouseout', function(){
                  //customSelectOptions.find('.focus').removeClass('focus');
              })
              // this allows for using the scrollbar in an overflowed list
              .bind( 'mousedown mouseup', function() { 
                  return false; 
              }
          );

          // binds the original select to the custom select
          // so if you make changes to the original the
          // changes will change the custom select. If the select
          // is changed programatically then you have to call
          // the change() event for everything to update correctly.
          // $('select option:eq(2)').attr('selected', 'selected').change();
          originalSelect.bind('change', function(event){
              var originalSelectIndex = originalSelect.find('option:selected').index();
              // change the current selected to what was chosen
              customSelectText.text(customSelectOptions.find('li:eq('+ originalSelectIndex +')').text());
              customSelectOptions.find('li').attr('aria-selected', 'false');
              customSelectOptions.find('li:eq('+ originalSelectIndex +')').attr('aria-selected', 'true');
          });

          // close the custom options menu if you click
          // anywhere else on the document
          $(document).bind('mousedown', function(){
              customSelectCurrent.removeClass('custom-select-open').next().fadeOut(100);
          });

          function closeOtherOptions(event) {
              // hide any other open selects when more than one is clicked
              parent.find('.custom-select-open')
                  .removeClass('custom-select-open')
                  .next().attr('aria-hidden', true).fadeOut(100);
          };

          function openOptions(event){
              closeOtherOptions(event);
              customSelectButton.addClass('custom-select-open');
              customSelectOptions.attr('aria-hidden', false).fadeIn(100);
              // move focus to the currently selected item
              // in the custom options list
              customSelectOptions.find('li').removeClass('focus');
              var currentOption = customSelectOptions.find('li[aria-selected="true"]');
              currentOption.addClass('focus').focus();
              isOpen = true;


              // reposition the options box
              var currentPosition = currentOption.position()
              var newPosition     = currentPosition.top
              customSelectOptions.css({
                  top: - newPosition + "px"
              })
          };

          function closeOptions(event){
              customSelectButton.removeClass('custom-select-open').focus();
              customSelectOptions.find('li').removeClass('focus');
              customSelectOptions.attr('aria-hidden', true).fadeOut(100);
              isOpen = false;
          };

          function toggleOptions(event){
              if (isOpen == false) {
                  openOptions(event);
              } else {
                  closeOptions(event);
              }
              event.stopPropagation();
          };

          // moves the focus of the custom options up
          // or down for the keyboard navigation
          function moveFocus(direction) {
              var selectedItem = customSelectOptions.find('.focus');
              var selectedID   = selectedItem.attr('id');
              var listSize     = customSelectOptions.find('li').size();
              var currentIndex = customSelectOptions.find('.focus').index();

              if (direction == 'prev' && currentIndex > 0) {
                  selectedItem.prev().addClass('focus').focus().siblings().removeClass('focus');
              } else if (direction == 'next' && currentIndex < listSize-1) {
                  selectedItem.next().addClass('focus').focus().siblings().removeClass('focus');
              } else if (direction == 'first') {
                  customSelectOptions.find('li:first').addClass('focus').focus().siblings().removeClass('focus');
              } else if (direction == 'last') {
                  customSelectOptions.find('li:last').addClass('focus').focus().siblings().removeClass('focus');
              }

              customSelectOptions.attr('aria-activedescendant', selectedID);
          };
      },

      destroy: function() {
          // Call the "super class" destroy
          // Usually a good idea to keep this in.
          $.Widget.prototype.destroy.apply(this, arguments);
          
          console.log(this.element)
          this.element.siblings().remove();
          this.element.parent().removeClass('custom-select');
          this.element.parent().removeAttr('id');
      }
    });
  };
})(jQuery);


