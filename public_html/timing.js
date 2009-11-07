//---
//Frame rate calculator
//copied from my C# code
//
//call tick() AFTER everything is done in a frame
//including rendering
//
//getSeconds can be used to get the time for calculating
//speeds etc. for movement and physics
//
//use calculateFrameRate to get a FPS value
//---
function FrameTimer()
{
	var lastFrameRate;
	var frameRate;
	
	var startTime = getTime()
	
	var frameSpacing;
	
	var lastTick = getTime();
	var fpsLastTick = getTime();
	
	this.getSeconds = function()
	{
		var r = frameSpacing / 1000;		
		if(r == 0 || isNaN(r))
			return 0;	
		
		return r;
	}
	
	this.tick = function()
	{
		frameSpacing = getTime() - lastTick;
		lastTick = getTime();
	}
	
	this.calculateFrameRate = function()
	{
		if(getTime() - fpsLastTick >= 1000)
		{
			lastFrameRate = frameRate;
			frameRate = 0;
			fpsLastTick = getTime();			
		}
		frameRate++;
		return lastFrameRate;
	}
	this.time = getTime;
	
	function getTime()
	{
		var d = new Date();
		return d.getTime();
	}
}