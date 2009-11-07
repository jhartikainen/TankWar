/***
 * Creates pixelfont text - param must be in lowercase
 * @author Jani 'zomg' Hartikainen
 * @param txt {String} Text for the object 
 * @return {Object} New PixelText instance
 */
function PixelText(txt)
{	
	this.text = txt;	

	//how many pixels between letters?
	this.letterSpacing = 1;
	
	//text color
	this.color = 'black';
	
	/*
	 * Letters are saved in a simple format:
	 * 
	 * for example, A
	 * 
	 * 1 1 1     0 marks an "empty" pixel
	 * 1 0 1     1 marks a filled pixel
	 * 1 1 1
	 * 1 0 1     Letters can be wider than this,
	 * 1 0 1     as long as every row has the same
	 *           amount of pixels
	 *           
	 * However, for more than five rows like in Q,
	 * special handling code is needed.
	 */
	var letters = {
		a: '111101111101101',
		b: '110101110101110',
		c: '111100100100111',
		d: '110101101101110',
		e: '111100110100111',
		f: '111100110100100',
		g: '111100101101111',
		h: '101101111101101',
		i: '11111',
		j: '001001001001111',
		k: '101101110101101',
		l: '100100100100111',
		m: '1111010101101011010110101',
		n: '110101101101101',
		o: '111101101101111',
		p: '111101111100100',
		q: '111101101101111001',
		r: '111101110101101',
		s: '111100111001111',
		t: '111010010010010',
		u: '101101101101111',
		v: '101101101101010',
		w: '1010110101101011010101010',
		x: '101101010101101',
		y: '101101010010010',
		z: '111001010100111',
		1: '010110010010111',
		2: '01101001001001001111',
		3: '01101001001010010110',
		4: '01101010101011110010',
		5: '11111000111000011110',
		6: '01101000111010010110',
		7: '11110001001000100010',
		8: '01101001011010010110',
		9: '01101001011100010110',
		0: '01101101101110010110',
		'-': '000000111000000',
		'!': '11101',
		"'": '11000'
		
	}
		
	/***
	 * Returns width of the text in pixels
	 * @return {Number} text length
	 */
	this.getWidth = function()
	{
		var w = 0;
		
		//loop through letters
		for(var i = 0, l = this.text.length; i < l; i++)
		{
			//space = 3 pixels
			if(this.text[i] == ' ')
			{			
				w += 3;
				continue;
			}
			
			letter = letters[this.text[i]];
			if(!letter)
				continue;
			
			var rowLen = letter.length/5;
			
			//q needs special handling :P
			if(this.text[i] == 'q')
				rowLen = letter.length/6;

			w += rowLen;
			
			w += this.letterSpacing;
		}		
		
		//Don't count space after last letter
		w -= this.letterSpacing;
		return w;
	}
	
	/***
	 * Draws text to canvas
	 * @param c {CanvasRenderingContext2D} canvas 2d context to draw on
	 */
	this.draw = function(c)
	{
		c.save();
		c.fillStyle = this.color;
	
		var x = 0;
		var y = 0;
		for(var i = 0, l = this.text.length; i < l; i++)
		{	
			if(this.text[i] == ' ')
			{			
				x += 3;
				continue;
			}
			
			var startX = x;
			var letter = letters[this.text[i]];
			
			//If the letter wasn't found, ignore it
			if(!letter)
				continue;
			
			var rowLen = letter.length/5;
			if(this.text[i] == 'q')
				rowLen = letter.length/6;
			
			for(var i2 = 0, l2 = letter.length; i2 < l2; i2++)
			{			
				if(letter[i2] == 1)
					c.fillRect(x,y,1,1);				
				
				x++;
				if(((i2+1)%rowLen) == 0 && ((i2+1) != l2))
				{				
					y++;
					x = startX;
				}
			}
			y = 0;
			x += this.letterSpacing;
		}
		
		c.restore();
	}
}