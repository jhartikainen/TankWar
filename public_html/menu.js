function MenuHandler()
{	
	var menuStack = new Array();	
	var curMenu = null;
	
	this.showMenu = function(menu)
	{
		if(curMenu != null)
		{
			curMenu.hide();
			menuStack.push(curMenu);
		}
		curMenu = menu;
		curMenu.show();
	}
	
	this.closeMenu = function()
	{
		curMenu.remove();
		if(menuStack.length > 0)
		{
			curMenu = menuStack.pop();			
			curMenu.show();
		}
		else
			curMenu = null;
	}
	
	this.getOpenMenu = function()
	{
		return curMenu;
	}
}

function Menu(clazz)
{
	var cssClass = (clazz) ? clazz : 'menu';
	
	this.obj = document.createElement('div');
	this.obj.className = cssClass;
	
	var inDocument = false;

	this.addButton = function(text,clickHandler)
	{
		var b = document.createElement('input');
		b.type = 'button';
		b.value = text;
		b.onclick = clickHandler;
		this.obj.appendChild(b);
	}
	
	this.addTitle = function(text)
	{
		var h = document.createElement('h2');
		h.innerHTML = text;
		this.obj.appendChild(h);
	}
	
	this.show = function()
	{
		if(!inDocument)
		{		
			document.body.appendChild(this.obj);
			inDocument = true;
		}		

		this.obj.style.display = 'block';		
	}
	
	this.hide = function()
	{
		this.obj.style.display = 'none';
	}
	
	this.remove = function()
	{		
		if(inDocument)
		{
			document.body.removeChild(this.obj);
			inDocument = false;
		}
	}
}
