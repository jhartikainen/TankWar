/*
	update checker copyright 2006 Jani Hartikainen
	
	just simply queries a page and sees if the text there
	matches the text passed to the object 
	
*/

function UpdateChecker(vurl,cver,callback)
{
	var checkUrl = vurl;
	var currentVersion = cver;
	call = callback;

	this.Check = function()
	{
		var req = new XMLHttpRequest();
		req.onreadystatechange = function()
		{			
			if(req.readyState == 4) 
			{
				if(req.status == 200)
				{					
					if(req.responseText != currentVersion)
						call();
				}
			}
		}
		req.overrideMimeType('text/plain');
				
		try
		{
			req.open('GET',checkUrl+'?random='+Math.random(), true);
			req.send(null);
		}
		catch(e)
		{			
			//Connectivity problem :(	
		}
	}
}