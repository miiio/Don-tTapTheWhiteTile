(function () {
	var Model = function (canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		document.onkeydown = this.keyDownEvent.bind(this);

		//解决模糊问题
		var ratio = this.getPixelRatio(this.ctx);
		canvas.width = 600 * ratio;
		canvas.height = 800 * ratio;

		this.interval = 10;
		this.blocksNum = 4;
		this.bWidth = Math.round(canvas.width / 4.0);
		this.bHeight = Math.round(canvas.height / this.blocksNum);


		this.gameRunning = false;
		this.gameOver = false;
		//this.initGame();

		this.rands = [];
		
		this.blockCnt = 0;
		this.st = 0;
	}
	Model.prototype.initGame = function (event) {
		this.level = 7; //块/秒 
		this.blocks = [];
		for (var i = this.blocksNum; i >= 0; i--)
			this.creatBlock((i - 1) * this.bHeight);
		this.draw();
	}

	
	Model.prototype.start = function () {
		this.intervalId = setInterval(this.game.bind(this), this.interval);
		this.st =  (new Date()).valueOf();
	}

	Model.prototype.stop = function () {
		console.log( (new Date()).valueOf() - this.st + "," + this.blockCnt);
		this.gameRunning = false;
		this.gameOver = true;
		if (this.intervalId != null) {
			clearInterval(this.intervalId);
		}

		setTimeout(function(){
			var best = parseFloat(localStorage.getItem("best"));
			var speedStr = this.level.toFixed(3) + "/s";
			if(isNaN(best)){
				best = 0;
			}
			var newBest = 0;
			if(this.level > best){
				best = this.level;
				localStorage.setItem("best",parseFloat(this.level));
				newBest = 1;
			}
			window.location.href = "GameOver.html?speed=" + speedStr +"&best=" + best.toFixed(3)+"/s&newBest="+newBest;
		}.bind(this),500);
		
	}


	Model.prototype.keyDownEvent = function (event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if(this.gameOver)return;
		if (e && e.keyCode == 68) { //'D' - 0
			this.dealBlock(0);
		}
		if (e && e.keyCode == 70) { //'F' - 1
			this.dealBlock(1);
		}
		if (e && e.keyCode == 74) { //'J' - 2
			this.dealBlock(2);
		}
		if (e && e.keyCode == 75) { //'K' - 3
			this.dealBlock(3);
		}
	}

	Model.prototype.dealBlock = function (pos) {
		if (this.gameRunning == false) {
			this.gameRunning = true;
			this.start();
			//return;
		}
		var bs = this.blocks;
		if (bs.length == 0) return;
		var last = this.getLastBlock();
		if (last.pos == pos) {
			//bs.pop();
			last.ani = 50;
		} else {
			this.stop();
		}
	}

	Model.prototype.getStep = function (level) {
		return level * this.bHeight * this.interval / 1000.0;
	}

	Model.prototype.creatBlock = function (y) {
		var pre = -1;
		var pos = 0;
		if (this.blocks.length > 0) {
			pre = this.blocks[0].pos;
		}
		// do {
		// 	pos = this.randomNum(0, 3);
		// } while (pos == pre);
		pos = this.randomNum(0, 3);
		if(pos == pre) {
			pos++;
			pos%=4;
		}
		this.blocks.unshift({
			pos: pos,
			y: y,
			ani: 0
		});
		this.blockCnt++;
	}

	Model.prototype.getLastBlock = function () {
		//return this.blocks[this.blocks.length-1];
		for(var i = this.blocks.length-1; i>=0; i--){
			if(this.blocks[i].ani == 0){
				return this.blocks[i];
			}
		}
		return null;
	}


	Model.prototype.game = function () {
		var step = this.getStep(this.level);

		if (this.blocks.length == 0 || this.blocks[0].ani != 0) {
			this.creatBlock(-this.bHeight);
			return;
		}
		var first = this.blocks[0];
		if (first.y > 0) {
			this.creatBlock(-this.bHeight);
		}

		var last = this.blocks[this.blocks.length - 1];
		if (last.y + 5 > this.canvas.height) {
			if(last.ani == 0){
				this.blocks.pop();
				this.stop();
			}else{
				this.blocks.pop();
			}
		}

		this.blocks[0].y += step;
		for (var i = 0; i < this.blocks.length; i++) {
			var block = this.blocks[i];
			if (block.ani != 0 && block.ani < 100) {
				block.ani += 10;
			}
			if (i > 0) {
				block.y = this.blocks[i - 1].y + this.bHeight;
			}
		}

		this.draw();
		this.level += 0.002;
	}


	Model.prototype.draw = function () {
		var ctx = this.ctx;
		this.canvas.height = this.canvas.height;
		//ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

		for (var i = 0; i < this.blocks.length; i++) {
			var block = this.blocks[i];
			ctx.fillStyle = "rgba(0,0,0,1)";
			ctx.fillRect(block.pos * this.bWidth, block.y, this.bWidth, this.bHeight);

			if(block.ani != 0){
				var aniWidth = this.bWidth * block.ani / 100;
				var aniHeight = this.bHeight * block.ani / 100;
				var aniX = block.pos * this.bWidth + this.bWidth / 2 - this.bWidth / 2 * block.ani / 100;
				var aniY = block.y + this.bHeight / 2 - this.bHeight / 2 * block.ani / 100;
				ctx.fillStyle = "#D9D9D9";
				ctx.fillRect(aniX,aniY,aniWidth,aniHeight);
			}
		}

		ctx.strokeStyle = "#3B3B3B";
		ctx.lineWidth = 1;
		for (var i = 0; i < 5; i++) {
			ctx.moveTo(i * this.bWidth, 0);
			ctx.lineTo(i * this.bWidth, this.canvas.height);
		}
		var firstY = 0;
		if (this.blocks.length > 0) {
			firstY = this.blocks[0].y + this.bHeight;
		}
		var cy = firstY;
		while (cy <= this.canvas.height) {
			ctx.moveTo(0, cy);
			ctx.lineTo(this.canvas.width, cy);
			cy += this.bHeight;
		}

		ctx.stroke();


		var speedStr = this.level.toFixed(3) + "/s";
		ctx.font = 'bold 35px Microsoft YaHei';

		var textWidth = ctx.measureText(speedStr).width;
		var textX = this.canvas.width/2 - textWidth/2;
		var textY = 50;

		ctx.fillStyle = 'rgba(270,270,270,0.5)';
		ctx.fillText(speedStr, textX+1, textY+2);

		ctx.fillStyle = '#FF0000';
		ctx.fillText(speedStr, textX, textY);
	}

	Model.prototype.getPixelRatio = function (context) {
		var backingStore = context.backingStorePixelRatio ||
			context.webkitBackingStorePixelRatio ||
			context.mozBackingStorePixelRatio ||
			context.msBackingStorePixelRatio ||
			context.oBackingStorePixelRatio ||
			context.backingStorePixelRatio || 1;
		return (window.devicePixelRatio || 1) / backingStore;
	}


	Model.prototype.randomNum = function (min, max) {
		return parseInt(Math.random() * (max - min + 1) + min, 10);
	}

	window.Game = Model;
}())