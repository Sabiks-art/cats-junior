define('Pourer', 
	function(require){
		var ExecutionUnitCommands = require('ExecutionUnitCommands');
		var ShowMessages = require('ShowMessages');
		var Message = ShowMessages.Message;
		var CylinderModule = require('Cylinder');
		var Declaration = require('Declaration');

		var Vessel = $.inherit({
			__constructor: function(capacity, initFilled, isEndless, div, maxCapacity) {
				this.capacity = capacity;
				this.initFilled = initFilled;
				this.filled = initFilled;
				this.isEndless = isEndless;
				this.div = div;
				this.maxCapacity = maxCapacity;
				this.init();
			},

			getCell: function(row) {
				return $(this.vesselBg);
			},

			init: function() {
				this.title = $('<div style="position: absolute;"></div>').appendTo(this.div);
				this.vesselDiv = $('<div style="width:150px; height:' + 
					(300 * (this.capacity + 0.0)/ this.maxCapacity) + ';position: absolute"></div>').appendTo($('body'));

				$(this.vesselDiv).css({'top': $(this.div).position().top})
				
				$(this.vesselDiv).cylinder({
					  colors: {
					    container: {
					      fill: '#e5e5e5',
					      stroke: '#dcdada'
					    },
					    fluid: {
					      fill: '#0051A6',
					      stroke: '#003974'
					    },
					  }, 
					  height: 300 * (this.capacity + 0.0)/ this.maxCapacity,
					  value: (this.initFilled + 0.0) / this.maxCapacity
				});
				$(this.vesselDiv).hide();
			},

			setDefault: function(dontDraw) {
				this.filled = this.initFilled;
			},

			draw: function() {
				$(this.vesselDiv).show();
				$(this.vesselDiv).cylinder('value', (this.filled + 0.0) / this.maxCapacity);

				$(this.title).css({'top': $(this.vesselDiv).position().top + $(this.vesselDiv).height() + 15,
					'left': $(this.vesselDiv).position().left});
				$(this.title).html(this.filled + '/' + this.capacity);
				
			},

			pourTo: function(delta) { //we pour from this vessel to another
				if (!this.isEndless) {
					this.filled -= delta;
				}
			},

			pourFrom: function(delta) {//we fill current vessel
				this.filled += delta;
			},

			pourOut: function() {
				if (this.isEndless) {
					throw 'Нельзя вылить содержимое бесконечного сосуда';
				}
				this.filled = 0;
			},

			fill: function() {
				this.filled = this.capacity;
			},

			getBottom: function() {
				return this.getTop() + $(this.vesselDiv).height() + 10;
			},

			getTop: function() {
				return $(this.div).position().top;
			},

			setBottom: function(bottom) {
				$(this.vesselDiv).css('top', bottom - $(this.vesselDiv).height());
			},
			
			setLeft: function(left) {
				$(this.vesselDiv).css('left', left + 10);
			},

			getDivLeft: function() {
				return $(this.div).position().left;
			},

			getWidth: function() {
				return $(this.vesselDiv).width(); 
			},

			hide: function() {
				$(this.vesselDiv).hide();
			},

			show: function() {
				this.draw();
			}
		});

		function pour(src, dst) {
			curProblem.oneStep('pour', undefined, [src, dst]);
		}

		function pourOut(vessel) {
			curProblem.oneStep('pourOut', undefined, [vessel]);
		}

		function fill(vessel) {
			curProblem.oneStep('fill', undefined, [vessel]);
		}

		function compare(args){
			if (args.length != 4 || !checkNumber(args[1]) || !checkNumber(args[3])) {
				throw 'Некорректный список аргументов';
			}

			var vessel = args[1] - 1;
			var comparator = args[2];
			var value = args[3];
			var result = false;

			switch(comparator) {
				case '<':
					result = curProblem.executionUnit.getExecutionUnit().isLess(vessel, value);
					break;
				case '>':
					result = curProblem.executionUnit.getExecutionUnit().isGreater(vessel, value);
					break;
				case '<=':
					result = curProblem.executionUnit.getExecutionUnit().isLess(vessel, value) || curProblem.getExecutionUnit().isEqual(vessel, value);
					break;
				case '>=':
					result = curProblem.executionUnit.getExecutionUnit().isGreater(vessel, value) || curProblem.getExecutionUnit().isEqual(vessel, value);
					break;
				case '==':
					result = curProblem.executionUnit.getExecutionUnit().isEqual(vessel, value);
					break;
				case '!=':
					result = !curProblem.executionUnit.getExecutionUnit().isEqual(vessel, value);			
					break;
			}

			if (args[0] == 'not')
				result = !result;

			return result;
		}

		function compare_handler(vessel, comparator, value){
			if (!checkNumber(vessel) || !checkNumber(value)) {
				throw 'Некорректный аргумент';
			}

			vessel -= 1;
			comparator = comparator.v;

			switch(comparator) {
				case '<':
					return curProblem.executionUnit.getExecutionUnit().isLess(vessel, value);
				case '>':
					return curProblem.executionUnit.getExecutionUnit().isGreater(vessel, value);
				case '<=':
					return curProblem.executionUnit.getExecutionUnit().isLess(vessel, value) || 
						curProblem.getExecutionUnit().isEqual(vessel, value);
				case '>=':
					return curProblem.executionUnit.getExecutionUnit().isGreater(vessel, value) || 
						curProblem.getExecutionUnit().isEqual(vessel, value);
				case '==':
					return curProblem.executionUnit.getExecutionUnit().isEqual(vessel, value);
				case '!=':
					return !curProblem.executionUnit.getExecutionUnit().isEqual(vessel, value);			
			}

			return false;
		}

		function checkFilled(args){
			if (args.length != 4 || !checkNumber(args[1]) || !checkNumber(args[3])) {
				throw 'Некорректный список аргументов';
			}

			var first = args[1] - 1;
			var comparator = args[2];
			var second = args[3] - 1;
			var result = false;

			switch(comparator) {
				case '<':
					result = curProblem.executionUnit.getExecutionUnit().isLessVessel(first, second);
					break;
				case '>':
					result = curProblem.executionUnit.getExecutionUnit().isGreaterVessel(first, second);
					break;
				case '<=':
					result = curProblem.executionUnit.getExecutionUnit().isLessVessel(first, second) || 
						curProblem.getExecutionUnit().isEqualVessel(first, second);
					break;
				case '>=':
					result = curProblem.executionUnit.getExecutionUnit().isGreaterVessel(first, second) || 
						curProblem.getExecutionUnit().isEqualVessel(first, second);
					break;
				case '==':
					result = curProblem.executionUnit.getExecutionUnit().isEqualVessel(first, second);
					break;
				case '!=':
					result = !curProblem.executionUnit.getExecutionUnit().isEqualVessel(first, second);			
					break;
			}

			if (args[0] == 'not')
				result = !result;

			return result;
		}

		function checkFilledHandler(first, comparator, second){
			if (!checkNumber(first) || !checkNumber(second)) {
				throw 'Некорректный аргумент';
			}
			first -= 1;
			comparator = comparator.v;
			second -= 1;

			switch(comparator) {
				case '<':
					return curProblem.executionUnit.getExecutionUnit().isLessVessel(first, second);
				case '>':
					return curProblem.executionUnit.getExecutionUnit().isGreaterVessel(first, second);
				case '<=':
					return curProblem.executionUnit.getExecutionUnit().isLessVessel(first, second) || 
						curProblem.getExecutionUnit().isEqualVessel(first, second);
				case '>=':
					return curProblem.executionUnit.getExecutionUnit().isGreaterVessel(first, second) || 
						curProblem.getExecutionUnit().isEqualVessel(first, second);
				case '==':
					return curProblem.executionUnit.getExecutionUnit().isEqualVessel(first, second);
				case '!=':
					return !curProblem.executionUnit.getExecutionUnit().isEqualVessel(first, second);			
			}

			return false;
		}

		var MessageWon = $.inherit(Message, {
			__constructor: function(step, points) {
				this.__base(['Шаг ', step + 1, ': Вы выполнили задание! Количество очков: ', points, '\n' ]);
			}
		});
		
		return {
			Pourer: $.inherit({
				__constructor: function(problem, problemData, div) {
					this.data = {};
					$.extend(true, this.data, problemData.data);
					this.div = div;
					$(this.div).empty();
					this.problem = problem;
					this.constructCommands();
					this.vessels = [];
					this.init();
				},

				constructCommands: function() {
					this.commands = {};
					var args = [
						new ExecutionUnitCommands.CommandArgumentSpin(1, this.data.vessels.length, false),
						new ExecutionUnitCommands.CommandArgumentSpin(1, this.data.vessels.length, false)];
					this.commands['pour'] = new ExecutionUnitCommands.ExecutionUnitCommand('pour', pour, args);
					this.commands['pourOut'] = new ExecutionUnitCommands.ExecutionUnitCommand('pourOut', pourOut, 
						[new ExecutionUnitCommands.CommandArgumentSpin(1, this.data.vessels.length, false)]);
					this.commands['fill'] = new ExecutionUnitCommands.ExecutionUnitCommand('fill', fill, 
						[new ExecutionUnitCommands.CommandArgumentSpin(1, this.data.vessels.length, false)]);

					var vesselsList = [];
					for (var i = 0; i < this.data.vessels.length; ++i) {
						vesselsList.push([i + 1, i + 1]);
					}

					this.testFunction = [
					{
						'name': 'compare',
						'title': 'Заполнено:',
						'args': [
							new ExecutionUnitCommands.CommandArgumentSelect(vesselsList),
							new ExecutionUnitCommands.CommandArgumentSelect([['<', '<'], ['>', '>'], ['<=', '<='], ['>=', '>='], ['==', '=='], ['!=', '!=']]),
							new ExecutionUnitCommands.CommandArgumentSpin(0, undefined)
						],
						'jsFunc': compare,
						'handlerFunc': compare_handler,
					},
					{
						'name': 'checkFilled',
						'title': 'Cравнение:',
						'args': [
							new ExecutionUnitCommands.CommandArgumentSelect(vesselsList),
							new ExecutionUnitCommands.CommandArgumentSelect([['<', '<'], ['>', '>'], ['<=', '<='], ['>=', '>='], ['==', '=='], ['!=', '!=']]),
							new ExecutionUnitCommands.CommandArgumentSelect(vesselsList),
						],
						'jsFunc': checkFilled,
						'handlerFunc': checkFilledHandler,
					}]
				},

				init: function() {
					$(this.div).append('<table><tr></tr></table>');
					this.row = $(this.div).children('table').children('tbody').children('tr');

					var maxCapacity = 0; 

					for (var i = 0; i < this.data.vessels.length; ++i) {
						maxCapacity = Math.max(this.data.vessels[i].capacity, maxCapacity);
					}
					
					for (var i = 0; i < this.data.vessels.length; ++i) {
						var cell = $('<td valign="bottom"></td>').appendTo($(this.row));
						this.vessels.push(new Vessel(this.data.vessels[i].capacity, 
							this.data.vessels[i].initFilled, 
							this.data.vessels[i].isEndless,
							cell,
							maxCapacity )
						);			
					}

					this.life = this.data.startLife;
					this.points = this.data.startPoints;
					this.dead = false;
				},

				generateCommands: function(div) {
					for (var i = 0; i < this.data.commands.length; ++i) {
						if (!this.__self.cmdClassToName[this.data.commands[i]]) {
							throw 'Команда ' + this.data.commands[i] + ' не поддерживается';
						}
						var divclass = this.data.commands[i];
						var j = this.problem.tabIndex;
						$(div).append('<td>' + 
										'<div id="' + divclass + j + '" class="' + divclass + '  jstree-draggable" type = "' + 
											divclass + '" rel = "' + divclass + '" title = "' + this.__self.cmdClassToName[divclass] + '">' + 
										'</div>' + 
									'</td>');

						$('#' + divclass + j).bind('dblclick', function(dclass, dname, problem){
							return function() {
								if ($(this).prop('ifLi')) {
									return;
								}
								$("#jstree-container" + problem.tabIndex).jstree("create", false,  "last", 
										{'data': (dclass == 'funcdef') ? ('func_' + problem.numOfFunctions) : dname}, function(newNode){
										InterfaceJSTree.onCreateItem(this, newNode, $('#' + dclass + problem.tabIndex).attr('rel'), problem);
									}, dclass != 'funcdef'); 
								problem.updated();
							}
						}(divclass, this.__self.cmdClassToName[divclass], this.problem));
					}
				},

				onTabSelect: function() {
					this.draw();
				},

				getCommandName: function(command) {
					return this.__self.cmdClassToName[command];
				},

				setDefault: function(dontDraw) {
					for (var i = 0; i < this.vessels.length; ++i) {
						this.vessels[i].setDefault();
					}

					this.life = this.data.startLife;
					this.points = this.data.startPoints;
					this.dead = false;

					if (!dontDraw) {
						this.draw();
					}
				},

				draw: function() {
					var maxBottom = 0;
					for (var i = 0; i < this.vessels.length; ++i){
						maxBottom = Math.max(maxBottom, this.vessels[i].getBottom());
					}
					
					for (var i = 0; i < this.vessels.length; ++i) {
						this.vessels[i].setLeft(this.vessels[i].getDivLeft() + i * this.vessels[i].getWidth());
						this.vessels[i].setBottom(maxBottom);
						this.vessels[i].draw();
					}
				},

				isDead: function() {
					return this.dead; // can user loose?
				},

				executeCommand: function(command, args) {
					if (this.data.commands.indexOf(command) === -1) {
						throw 'Команда ' + command + ' не поддерживается';
					}

					switch (command) {
						case 'pour':
							this.pour(args);
							break;
						case 'pourOut': 
							this.pourOut(args);
							break;
						case 'fill':
							this.fill(args);
							break;
						default:
							throw 'Команда ' + command + ' не поддерживается';
					}

					if (this.data.stepsFine){
						this.points -= this.data.stepsFine;
						var mes = new ShowMessages.MessageStepFine(this.problem.step, this.points);
					}

					this.draw();
				},

				cmdListFinished: function(){
					if (this.isFinished()) {
						this.points += this.data.pointsWon;
						var mes = new MessageWon(this.problem.step, this.points);
					}
				},

				pour: function(args) {
					var src = args[0] - 1;
					var dest = args[1] - 1;
					if (!checkNumber(src) || !checkNumber(dest)) {
						throw 'Некорректный аргумент';
					}
					try {
						
						if (src == dest) { //is it an error?
							return;
						}
						
						if (this.vessels[src].filled == 0 || this.vessels[dest].capacity == this.vessels[dest].filled) {
							return;
						}

						var delta = Math.min(this.vessels[dest].capacity - this.vessels[dest].filled, this.vessels[src].filled);
						this.vessels[src].pourTo(delta);
						this.vessels[dest].pourFrom(delta);

						/*if (this.problem.speed) {
							this.vessels[src].draw();
							this.vessels[dest].draw();
						}*/
					}
					catch (err) {
						throw 'Некорректная команда';
					}
				},

				pourOut: function(args) {
					var vessel = args[0] - 1;
					if (!checkNumber(vessel)) {
						throw 'Некорректный аргумент';
					}
					try {
						
						this.vessels[vessel].pourOut();
					}
					catch (err) {
						throw 'Некорректная команда';
					}
					
				},

				fill: function(args) {
					var vessel = args[0] - 1;
					if (!checkNumber(vessel)) {
						throw 'Некорректный аргумент';
					}

					try {

						this.vessels[vessel].fill();
					}
					catch (err) {
						throw 'Некорректная команда';
					}
				},

				gameOver: function() {
					this.dead = true;
				},

				getPoints: function() {
					return this.points;
				},

				isCommandSupported: function(command) {
					return this.data.commands.indexOf(command) !== -1
				},

				getConditionProperties: function(name) {
					if (name == undefined) {
						return this.testFunction;
					}

					for (var i = 0; i < this.testFunction.length; ++i) {
						if (this.testFunction[i].name == name) {
							return this.testFunction[i];
						}
					}

					return undefined;
				},

				getCommands: function() {
					return this.commands;
				},

				getCssFileName: function() {
					return this.__self.cssFileName;
				},

				isLess: function(vessel, value) {
					return this.vessels[vessel].filled < value;
				},

				isEqual: function(vessel, value) {
					return this.vessels[vessel].filled == value;
				},

				isGreater: function(vessel, value) {
					return this.vessels[vessel].filled > value;
				},

				isLessVessel: function(first, second) {
					return this.vessels[first].filled < this.vessels[second].filled;
				},

				isEqualVessel: function(first, second) {
					return this.vessels[first].filled == this.vessels[second].filled;
				},

				isGreaterVessel: function(first, second) {
					return this.vessels[first].filled > this.vessels[second].filled;
				},
				
				isFinished: function() {
					var finished = true;
					for (var i = 0; i < this.data.finishState.length; ++i) {
						var vessel = this.data.finishState[i].vessel;
						finished = finished && (this.vessels[vessel].filled == this.data.finishState[i].filled);
					}
					return finished;
				},

				onTabSelected: function(problemId) {
					if (problemId != this.problem.tabIndex) {
						this.hide();
					}
					else {
						this.show();
					}
				},

				hide: function() {
					for (var i = 0; i < this.vessels.length; ++i) {
						this.vessels[i].hide();
					}
				},

				show: function() {
					for (var i = 0; i < this.vessels.length; ++i) {
						this.vessels[i].show();
					}
				},
				
				getState: function() {
					var result = {};
					result.vessels = [];

					for (var i = 0; i < this.vessels.length; ++i){
						results.push(this.vessels[i].filled);
					}
					result.isFinished = this.isFinished();
					result.points = this.points;

					return result;
				}
			},
			{
				cmdClassToName: {
					'pour': 'Перелить',
					'pourOut': 'Вылить',
					'fill': 'Заполнить'
				},

				cssFileName: "styles/pourer.css",

				jsTreeTypes: [
					['pour', 'images/pour_small.png'],
					['pourOut', 'images/pourOut_small.png'],
					['fill', 'images/fill_small.png']
				]
			})
	};
});
