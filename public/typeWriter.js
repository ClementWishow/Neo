export default class TypeWriter {
	constructor(elmt, noTyping=false) {
		this.elmt = elmt
		this.selector = $(elmt)
		this.firstDelay = 1500;
		this.typingDelay = 20;
		this.afterLineDelay = 1000;
		this.noTyping = noTyping
		this.canPrompt = true
		this.prompting = false
		this.promptNumber = 0
		this.speed = false
        this.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
	}

	// ajoute un retour à la ligne
	appendTypeWriterItem() {
		this.selector.append("<span class='typewriter-item'>")
	}

	// ecrit du text dans la dernier ligne de la console, avec un delai entre chaque lettre
	async typeIt(text) {
		if (!text) {
			return
		}
		this.prompting = true

		for (let n = 0; n < text.length; n++) {		
			$(this.elmt + ' span.typewriter-item:last-child').html(text.substring(0, n + 1));
			if (!this.speed) {
				await this.sleep(this.typingDelay);
			}
		}
		if (!this.canPrompt || this.noTyping) {
			$(this.elmt + ' span.typewriter-item:last-child').addClass('no-prompt')
		}
		this.prompting = false
	}

	/// meme chose, mais saans delai
    rewrite(text) {
        $(this.elmt + ' span.typewriter-item:last-child').html(text);
    }
	
	// ecrit plusieurs lignes
	async typeLines(lines) {
		if (!lines || lines.length < 1) {
			return
		}
		this.prompting = true
		this.appendTypeWriterItem();
		if (!this.speed) {
			await this.sleep(this.firstDelay)
		}
		await this.typeIt(lines[0]);
		
		for (var i = 1; i < lines.length; i++) {
			this.prompting = true			
			this.appendTypeWriterItem();
			if (!this.speed) {
				await this.sleep(this.afterLineDelay)
			}
			await this.typeIt(lines[i]);
		}
		if (!this.noTyping) {
			this.appendTypeWriterItem();
		}
		this.speed = false
	}


	// gestion du prompt de l'utilisateur
	prompt(input) {
		if (input === "Enter") {
			if (this.prompting) {
				this.speed = true
				const that = this
				setTimeout(function() {
					that.speed = false
				}, 1000);

			}
			else if (this.canPrompt) {
				const currentElem = $(this.elmt + ' span.typewriter-item:last-child')[0]
				if (currentElem.innerText.length === 0) {
					return
				}
				const styles = window.getComputedStyle(currentElem)
				const retStyles = {}
				for (let style of styles) {	
					retStyles[style] = styles.getPropertyValue(style)
				}
				this.promptNumber = this.promptNumber + 1
				const ret = { prompt: currentElem.innerText, styles: retStyles, try: this.promptNumber }
				return ret
			}
		}
		else if (this.canPrompt && !this.prompting && !this.noTyping) {
			if (input) {
				var currentPrompt = $(this.elmt + ' span.typewriter-item:last-child')[0].innerText
                if (input === "Backspace" ) {
                    currentPrompt =  currentPrompt.substring(0, currentPrompt.length - 1)
                }
                else if (input.length === 1) { 
                    currentPrompt = currentPrompt + input
                }
				this.rewrite(currentPrompt);
			}
		}
		return null
	}
}