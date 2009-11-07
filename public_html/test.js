//dynamic loading of scripts
var s = document.createElement('script');
s.src = 'test.js';
s.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(s);	
