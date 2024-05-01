document.addEventListener("DOMContentLoaded", function(){
	initializeUIComponents();
});

function initializeUIComponents() {
	const toggleCheckbox = document.querySelector('.toggle-theme input[type=checkbox]');
    const plaintextTextArea = document.getElementById('plaintext');
    const ciphertextTextArea = document.getElementById('ciphertext');
	const cipherTypeSelect = document.getElementById('cipher-type');
    const clearButton = document.getElementById('clear');
    const clipboardPlaintextButton = document.getElementById('clipboard-plaintext');
    const clipboardCiphertextButton = document.getElementById('clipboard');

	setupThemeToggle(toggleCheckbox);
	setupClipboardActions(plaintextTextArea, ciphertextTextArea, clipboardPlaintextButton, clipboardCiphertextButton);
	setupCiphertextPlaceholder(cipherTypeSelect, ciphertextTextArea);
	setupClearTextAreas(clearButton, plaintextTextArea, ciphertextTextArea);
	setupRealTimeEncodingDecoding(plaintextTextArea, ciphertextTextArea, cipherTypeSelect);
}

function setupThemeToggle(checkbox) {
	//Set default to dark mode
	document.body.classList.toggle('dark-mode', checkbox.checked);
	checkbox.addEventListener('change', () => {
		document.body.classList.toggle('dark-mode', checkbox.checked);
	});
}

function setupClipboardActions(plaintext, ciphertext, plaintextButton, ciphertextButton){
	plaintextButton.addEventListener('click', () => copyToClipboard(plaintext, 'Plaintext copied'));
    ciphertextButton.addEventListener('click', () => copyToClipboard(ciphertext, 'Ciphertext copied'));
}

function copyToClipboard(textArea, message) {
	navigator.clipboard.writeText(textArea.value).then(() => {
		showNotification(message);
	});
}

function showNotification(message) {
	const notif = document.getElementById('notification');
	notif.textContent = message;
	notif.classList.add('show');
	setTimeout(() => {
		notif.classList.remove('show');
	}, 1500);
}

function setupClearTextAreas(clearButton, plaintextTextArea, ciphertextTextArea) {
	clearButton.addEventListener('click', () => {
		plaintextTextArea.value = '';
		ciphertextTextArea.value = '';
	});
}

function setupCiphertextPlaceholder(select, textArea){
	const placeholders = {
		'kimmyloo': 'Jimmu Xusmf',
		'base64': 'SGVsbG8gV29ybGQ=',
		'custCipher': 'Custom ciphertext...',
		'default': 'Enter ciphertext result here...'
	};
	function updatePlaceholder(){
		textArea.placeholder = placeholders[select.value]|| placeholders['default'];
	}
	select.addEventListener('change', updatePlaceholder);
	updatePlaceholder();	//	Call immediately to set initial state
}

function setupRealTimeEncodingDecoding(plaintext, ciphertext, select){
	let lastEdited = 'plaintext';

	//Event listener for plaintext textarea input
	plaintext.addEventListener('input', () => {
		lastEdited = 'plaintext';
		encodeDecode(lastEdited, select.value);
	});

	//Event listener for ciphertext textarea input
	ciphertext.addEventListener('input', () => {
		lastEdited = 'ciphertext';
		encodeDecode(lastEdited, select.value);
	});
}

function encodeDecode(lastEdited, cipherType){
	const inputTextArea = lastEdited === 'plaintext' ? plaintext : ciphertext;
    const outputTextArea = lastEdited === 'plaintext' ? ciphertext : plaintext;
	let result = '';

	switch(cipherType){
		case 'kimmyloo': result = kimmylooCipher(inputTextArea.value, lastEdited); break;
		case 'base64': result = base64Cipher(inputTextArea.value, lastEdited); break;
		case 'custCipher': result = lastEdited === 'plaintext' ?
			encodeCust(inputTextArea.value) : decodeCust(inputTextArea.value); break;
		default: result = inputTextArea.value;
	}
	outputTextArea.value = result;
}

function kimmylooCipher(text, type){
	const lowerVowels = 'aeiou';
	const upperVowels = 'AEIOU';
	const lowerConsonants = 'bcdfghjklmnpqrstvwxyz';
	const upperConsonants = 'BCDFGHJKLMNPQRSTVWXYZ';

	function shiftChar(char, charSet, direction){
		const index = charSet.indexOf(char);
		if(index === -1) return char;	//	Guard Clause for not found character
		const setLength = charSet.length;
		return charSet[(index + (direction ? 1 : -1) + setLength) % setLength];
	}

	//Process each character in input text
	return text.split('').map(char => {
        if (lowerVowels.includes(char) || upperVowels.includes(char)) {
            const set = lowerVowels.includes(char) ? lowerVowels : upperVowels;
            return shiftChar(char, set, type === 'plaintext');
        } else if (lowerConsonants.includes(char) || upperConsonants.includes(char)) {
            const set = lowerConsonants.includes(char) ? lowerConsonants : upperConsonants;
            return shiftChar(char, set, type === 'plaintext');
        } else {
            return char;  // Non-alphabetic characters remain unchanged
        }
    }).join('');
}

/**
 * Encodes or decodes a given text to/from Base64.
 * This function handles encoding and decoding between plaintext and Base64,
 * providing a mechanism to manage Unicode characters safely.
 *
 * @param {string} text The text to encode or decode.
 * @param {string} lastEdited Specifies the last text area edited ('plaintext' or 'ciphertext'),
 *                  which determines the direction of the encoding/decoding.
 * @returns {string} The encoded or decoded result.
 *
 * Unicode Safety:
 * - `btoa()` and `atob()` can only handle ASCII characters correctly.
 * - Non-ASCII characters (e.g., UTF-8) can cause these functions to throw exceptions.
 * - `encodeURIComponent()` and `decodeURIComponent()` are used to encode and decode
 *   UTF-8 characters safely before they are processed by `btoa()` and `atob()`.
 *
 * Error Handling:
 * - The function includes a try/catch block to manage exceptions from `btoa()` and `atob()`.
 * - This error handling prevents the application from crashing by catching exceptions
 *   related to invalid characters or formatting issues in Base64 encoding/decoding.
 *   It also provides feedback for diagnosing issues.
 */

function base64Cipher(text, lastEdited) {
	try{
		if(lastEdited === 'plaintext'){
			//	Encode to base64
			return btoa(unescape(encodeURIComponent(text)));
		} else {
			//	Decode from base64
			return decodeURIComponent(escape(atob(text)));
		}
	} catch(e){
		console.error("Error in Base64 encodeing/decoding: " + e);
		return "Error encoding/decoding Base64";
	}
}

function encodeCust(text){
	// Perform encoding steps: kimmyloo -> hex -> binary -> Base64
	let processedText = kimmylooCipher(text, 'plaintext');console.log("Test");
	processedText = toHex(processedText);
    // processedText = toBinary(processedText);
    return base64Cipher(processedText, 'plaintext');  // Encode final Morse code to Base64
}

function decodeCust(text) {
    // Perform decoding steps: Base64 -> binary -> hex -> kimmyloo
    let processedText = base64Cipher(text, 'ciphertext');  // Decode Base64 to Morse code
    // processedText = fromBinary(processedText);
    processedText = fromHex(processedText);
    return kimmylooCipher(processedText, 'ciphertext');
}

function toHex(text) {
	let tempVar = text.split('').map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
    return text.split('').map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
}

function toBinary(text) {
    return text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
}

function fromBinary(binaryString) {
	let newBin = binaryString.split(" ");
	let binCode = [];

	for(i = 0; i < newBin.length; i++) {
		binCode.push(String.fromCharCode(parseInt(newBin[i], 2)));
	}
	return binCode.join("");
}

function fromHex(hexString) {
    // Splitting the hex string by spaces
    const hexArray = hexString.split(' ');
    
    // Mapping each hex code to a character
    const characters = hexArray.map(hex => {
        const charCode = parseInt(hex, 16);
        
        if (isNaN(charCode)) {
            return '';
        } else {
            const char = String.fromCharCode(charCode);
            return char;
        }
    });
    
    // Joining all characters into a string
    const resultString = characters.join('');
    
    return resultString;
}




