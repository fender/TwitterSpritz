
String.prototype.endsWith = String.prototype.endsWith || function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

window.accurateInterval = function(fn, time) {
	var cancel, nextAt, timeout, wrapper, _ref;
	nextAt = new Date().getTime() + time;
	timeout = null;
	if (typeof time === 'function') _ref = [time, fn], fn = _ref[0], time = _ref[1];
	wrapper = function() {
		nextAt += time;
		timeout = setTimeout(wrapper, nextAt - new Date().getTime());
		return fn();
	};
	cancel = function() {
		return clearTimeout(timeout);
	};
	delay = function(ms) {
		nextAt += ms;
	};
	timeout = setTimeout(wrapper, nextAt - new Date().getTime());
	return {
		cancel: cancel,
		delay: delay
	};
};


var ospritz = ospritz || {

	model: {

		state: {
			paragraph: 0,
			sentence: 0,
			word: 0
		},
		outputElement: $(),
		wpm: 400,
		timer: {cancel:function(){}},

		init: function(text, wpm, outputElement)
		{
			this.data = {
				text: text,
				paragraphs: this.getParagraphs(text)
			};
			this.wpm = wpm;
			this.outputElement = outputElement;
		},

		getParagraphs: function(text)
		{
			var map = function(x) {
				return {
					text: x,
					sentences: this.getSentences(x)
				};
			}
			return text.split(/[\n\r]+/g).filter(this.nonEmpty).map(map.bind(this));
		},

		getSentences:  function(text)
		{
			var map = function(x) {
				return {
					text: x,
					words: this.getWords(x)
				};
			}
			return text.split(/[\.]+/g).filter(this.nonEmpty).map(map.bind(this));
		},

		getWords:  function(text)
		{
			return text.split(/[\s]+/g).filter(this.nonEmpty).map(function(val, index, arr)
			{
				return (index == arr.length-1) ? val+"." : val;
			});
		},

		nonEmpty: function(x)
		{
			return x.length > 0;
		}
	},

	splitWord: function(word)
	{
		var pivot = 1;

		switch (word.length)
		{
			case 0:
			case 1:
			pivot = 0;
			break;
			case 2:
			case 3:
			case 4:
			case 5:
			pivot = 1;
			break;
			case 6:
			case 7:
			case 8:
			case 9:
			pivot = 2;
			break;
			case 10:
			case 11:
			case 12:
			case 13:
			pivot = 3;
			break;
			default:
			pivot = 4;
		};

		return [word.substring(0,pivot), word.substring(pivot, pivot+1), word.substring(pivot+1)];
	},

	draw: function(word)
	{
		var splitWord = this.splitWord(word);
		var outputElement = this.model.outputElement;
		outputElement.find('.left .text').html(splitWord[0]);
		outputElement.find('.pivot').html(splitWord[1]);
		outputElement.find('.right').html(splitWord[2]);
	},

	spritzParagraph: function()
	{
		this.model.state.sentence = 0; // start reading from the first sentence
		this.spritzSentence();
	},

	spritzSentence: function()
	{
		var self = this;
		var model = this.model;
		var state = model.state;
		var paragraphs = model.data.paragraphs;
		var sentence = paragraphs[state.paragraph].sentences[state.sentence];
		state.word = 0; // start reading from the first word

		var doNextWord = function()
		{
			if(state.word == sentence.words.length)
			{
				model.timer.cancel();
				self.finishSentence();
				return;
			}
			var next = sentence.words[state.word+1];
			if(next && next.endsWith(","))
			{
				model.timer.delay(100);
			}
			self.draw(sentence.words[state.word]);
			state.word++;
		};
		model.timer = accurateInterval(doNextWord, (60000/model.wpm));
	},

	finishSentence: function()
	{
		var state = this.model.state;
		var paragraph = this.model.data.paragraphs[state.paragraph];
		state.sentence++;
		if(state.sentence == paragraph.sentences.length)
		{
			this.finishParagraph(); //finished the paragraph
		} else {
			var self = this;
			this.model.timeout = setTimeout(function() {
				self.spritzSentence(); //do another sentence
			}, 300);
		}
	},

	finishParagraph: function()
	{
		var state = this.model.state;
		var paragraphs = this.model.data.paragraphs;
		state.paragraph++;
		if(state.paragraph == paragraphs.length)
		{
			this.finishSpritz(); //finished the spritz
		} else {
			var self = this;
			this.model.timeout = setTimeout(function() {
				self.spritzParagraph(); //do another paragraph
			}, 400);
		}
	},

	finishSpritz: function()
	{
		this.model.state =  {
			paragraph: 0,
			sentence: 0,
			word: 0
		};

		this.clearTimers();
	},

	startSpritzing: function()
	{
		var start = Date.now();
		this.spritzParagraph();
	},

	clearTimers: function()
	{
		clearTimeout(this.model.timeout);
		this.model.timer.cancel();
	},

	init: function(text, outputElement, wpm)
	{
		if (!window.jQuery) throw "jQuery Not Loaded";
		this.clearTimers();
		this.model.init(text, wpm, outputElement);
		this.startSpritzing();
	},

	refresh: function(text, outputElement, wpm)
	{
	  this.model.init(text, wpm, outputElement);
	}
};