"use strict";

const Shadow     = require('shadowbot-core').Interface;
const Drawing    = require('shadowbot-core').Drawing;
const PluginBase = require('shadowbot-plugin-base');

const dns        = require('native-dns');

class DNS extends PluginBase {

	constructor() {
		super();

		this.command("dns", [
			"This tool is used to check whois data on remote hosts.",
			[
				['<host>', 'query dns data'],
				['[type]', 'query type (default: A)']
			]
		], this._cmdDNS.bind(this));
	}

	_cmdDNS(message, reply) {
		var host = message.getCommandArgument(0, "");
		var type = message.getCommandArgument(1, "A");

		this._queryDNS(host, type).then(answers => {
			let addresses = [];
			for(let answer of answers)
				addresses.push(answer.address ? answer.address : JSON.stringify(answer));
			reply(`Addresses: ${addresses.join(", ")}`);
		}).catch(err => reply(`Couldn't get DNS details: ${err}`));
	}

	_queryDNS(name, type) {
	    var question = dns.Question({name, type});
	    var request = dns.Request({
			timeout:  1000,
	        question: question,
	        server:   {
	            address: "8.8.8.8",
	            port:    53,
	            type:    "udp"
	        }
	    });

		return new Promise((resolve, reject) => {
		    var answers = [];
		    request.on('message', (e, a) => {
		        if(e || !a || !a.answer) return;
		        a.answer.forEach(answer => answers.push(answer));
		    });
		    request.on('end',   () => resolve(answers));
		    request.on('error', reject);
		    request.send();
		});
	}

}

module.exports = DNS;
