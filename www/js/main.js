require.config({
    baseUrl: 'js',
    paths: {
        jquery: 'libs/jquery/jquery.min',
        underscore: 'libs/underscore.js/underscore',
        backbone: 'libs/backbone.js/backbone-min',
        text: 'libs/require-text/text',
        i18n: 'libs/require-i18n/i18n',
        template: '../templates'
    }
});

document.addEventListener('deviceready', function () {
    require([
        'app',
        'i18n!nls/app'
    ], function (App, appLang) {
        window.lang = appLang;

        App.initialize();
		
		
		
		
	});
});

document.addEventListener("backbutton", onBackKeyDown, false);
		
function onBackKeyDown(e) {
  console.log(window.navigator.onLine);
  //console.log(e);
  e.preventDefault();
  var url_back = $("#btn-back-url").prop("href");
  console.log(url_back);
  if(url_back != ""){
	  var res = url_back.split("#");
	  if( res[res.length-1] == "exit"){
	      navigator.app.exitApp();	  
	  }else if(res[res.length-1] == "javascript:history.back();"){
		  console.log("navigator.app.backHistory();");
		  navigator.app.backHistory();
	  }else{
	  	var url = '#'+res[res.length-1];
		console.log(url);
		window.location.href = url;
	  }
  }else{
	  var url = '#'; 
	  console.log(url); 
	  window.location.href = url;
  }
  //navigator.app.backHistory();
  
  
  
  //var MyApp = new Backbone.Router();
  //MyApp.navigate(url, {trigger: false});
  //window.location.href = url;
}