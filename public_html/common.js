var PI2 = Math.PI * 2;
var ctx,gctx;
var mouseX,mouseY;
var canvasW,canvasH;
var terrain;
var engine,windIndicator,network;
var tankSprite;

var states = {	
	play: 1,
	wait: 2
}

var gameState = states.wait;

var shootQuotes = new Array('DIE DIE DIE!',
							'Fire!',
							'I love the smell of napalm in the morning',
							'Time to die!',
							'Say hello to my little friend!',
							"This won't hurt a bit!",							
							'Resistance is futile',
							'Sayonara!',
							"You can run but you can't hide!",
							'Say your prayers'
							);
var hitQuotes = new Array('OUCH!',
						"I'm burning!",
						'Help!',
						'That hurt!',
						"I'll get you for this!"
						);

function randomShootQuote()
{
	var qc = shootQuotes.length;	
	var r = Math.floor(Math.random()*qc)		
	return shootQuotes[r].toLowerCase();
}

function randomHitQuote()
{
	var qc = hitQuotes.length;	
	var r = Math.floor(Math.random()*qc)		
	return hitQuotes[r].toLowerCase();
}

Function.prototype.inheritsFrom = function( parentClassOrObject ){
    if ( parentClassOrObject.constructor == Function )
    {
        //Normal Inheritance
        this.prototype = new parentClassOrObject();
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject.prototype;
    }
    else
    {
        //Pure Virtual Inheritance
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
}

Array.prototype.find = function(o)
{
	var l = this.length;
	for(var i = 0; i < l; i++)
	{
		if(this[i] == o)
			return i;
	}
	
	return -1;
}
Array.prototype.remove = function(o)
{
	var i = this.find(o);
	if(i != -1)
		this.splice(i,1);
}

function createElement(type,id,cssClass,style)
{
	var obj = document.createElement(type);
	if(id)
		obj.id = id;
	if(cssClass)
		obj.className = cssClass;
	if(style)
		obj.setAttribute('style',style);
		
	return obj;
}

function radToDeg(r)
{
	return r * (180/Math.PI);
}

function $(id)
{
	return document.getElementById(id);
}

function log(txt)
{
	$('log').innerHTML = txt;
}

function showMessage(msg,time,callback)
{
	$('showMessage').innerHTML = msg;
	setTimeout('$(\'showMessage\').innerHTML = \'\'',time);
	if(callback)
		setTimeout(callback,time);
}

function Random(min,max)
{
	return (Math.random()*(max-min))+min;
}


function customPolyCheck(x,y)
{	
	var i, j=0;
	var oddNODES = false;
	

  for (i=0; i<terrain.pointCount; i++) {
    j++; if (j==terrain.pointCount) j=0;
    if (terrain.yArray[i]<y && terrain.yArray[j]>=y
    ||  terrain.yArray[j]<y && terrain.yArray[i]>=y) {
      if (terrain.xArray[i]+(y-terrain.yArray[i])/(terrain.yArray[j]-terrain.yArray[i])*(terrain.xArray[j]-terrain.xArray[i])<x) {
        oddNODES=!oddNODES; }}}

  return oddNODES; 
}

function Selector(parent,onclick)
{
	this.items = new Array();
	this.selectedItem;
	var selectedObject;
	this.parent = parent;
	this.value = 'moi';
	this.itemSelected = onclick;	
	
	var that = this;
	
	this.selectDefault = function()
	{		
		setSelected(this.items[0]);
	}
	
	this.addItem = function(obj,value)
	{
		obj.setAttribute('selectorValue',value);
		obj.onclick = this.selectItem;
		//obj.addEventListener('click',selectItem,false);
		this.items.push(obj);
		obj.className = 'selector';
		parent.appendChild(obj);
	}
	
	this.selectItem = function(e)
	{	
		if(!e.srcElement) {
			setSelected(e.target);
		}
		else {
			setSelected(e.srcElement);		
		}
	}
	
	function setSelected(obj)
	{		
		that.value = obj.getAttribute('selectorValue');
		
		if(selectedObject)
			selectedObject.className = 'selector';
		selectedObject = obj
		selectedObject.className = 'selector selected';
		
		if(that.itemSelected)
			that.itemSelected();
	}
	
	this.select = function(value)
	{
		for(var i = 0, l = this.items.length; i < l; i++)
		{
			var a = this.items[i].getAttribute('selectorValue');
			if(a == value)
				setSelected(this.items[i]);
		}
	}
}

function InputList(min,max)
{
	var that = this;

	this.inputs = new Array();
	this.parent;
	this.addButton;
	
	this.showNumbers = false;
	this.showButtons = true;
	
	var minFields = (min) ? min : 1;
	var maxFields = (max) ? max : -1;
	
	this.types = null;
	this.container = null;
	
	this.showTypeSelector = function(types)
	{
		this.types = types;
	}
	
	this.getValues = function()
	{
		var vals = new Array();
		for(var i = 0, l = this.inputs.length; i < l; i++)
		{
			if(this.types == null)
				vals.push(this.inputs[i].value);
			else
			{
				var v = new Array();
				v.push(this.inputs[i].value);
				var t = this.inputs[i].nextSibling;
				v.push(t.options[t.selectedIndex].value);
				
				vals.push(v);
			}
		}
		return vals;
	}
	
	this.addField = function(type,title,value,min,max)
	{
		if(maxFields != -1 && that.inputs.length == maxFields)
			return;
			
		var field = document.createElement('input');		
		field.type = type;
		if(type == 'number')
		{
			if(min)
				field.min = min;
			if(max)
				field.max = max;
		}
		
		if(value)
			field.value = value;
		
		var p = document.createElement('p');
		if(that.showNumbers)
			p.innerHTML = that.inputs.length+1;
		
		if(title)
			p.innerHTML += '<label>'+title+'</label>';
		
		p.appendChild(field);
		
		if(that.types != null)
		{
			var select = document.createElement('select');
			for(var i = 0, l = that.types.length; i < l; i++)
			{
				var o = document.createElement('option');
				o.value = that.types[i];
				o.innerHTML = that.types[i];
				select.appendChild(o);				
			}
			p.appendChild(select);
		}
		
		//that.parent.insertBefore(p,that.addButton);
		that.container.appendChild(p);
	
		that.inputs.push(field);		
	}
		
	this.removeField = function()
	{
		if(that.inputs.length == minFields)
			return;
			
		var field = that.inputs.pop();
		that.container.removeChild(field.parentNode);
	}
	
	this.appendTo = function(obj)
	{
		this.parent = obj;
		this.container = document.createElement('div');
		this.parent.appendChild(this.container);
		
		for(var i = 0; i < minFields; i++)
		{			
			this.addField('text');
		}
		
		if(this.showButtons)
		{
			this.addButton = document.createElement('button');	
			this.addButton.innerHTML = 'Add';
			this.addButton.onclick = this.addField;
			obj.appendChild(this.addButton);
	
			var removeButton = document.createElement('button');	
			removeButton.innerHTML = 'Remove';
			removeButton.onclick = this.removeField;		
			obj.appendChild(removeButton);
		}		
	}
}
