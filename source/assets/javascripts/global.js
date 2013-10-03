jQuery(document).ready(function($) {
  $.urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results != null) {
      return results[1] || 0;
    } else {
      return false;
    }
  }

  function is_int(value){
    if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
      return true;
    } else {
      return false;
    }
  }

  var slideMenu = $.jPanelMenu({
    openPosition: "80%"
  });
  slideMenu.on();


});