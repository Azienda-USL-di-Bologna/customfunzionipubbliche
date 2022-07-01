$(window).load(function () {
	var cmd = 'registerClient'
	var e = new IDEvent("cmd", "", null, RD3_Glb.EVENT_ACTIVE, cmd);
})

var hostname = window.location.hostname;
var port = null;

var PRIMUS_HOST;

if (hostname.match('(localhost|127\.0\.0\.1|gdml|babelcorso2)'))
	PRIMUS_HOST = 'https://gdml.internal.ausl.bologna.it:443';
else if (hostname.match('(arena)'))
	PRIMUS_HOST = 'https://arena.internal.ausl.bologna.it:' + 1339;
else if (hostname.match('(babel|pico|dete|deli)'))
	PRIMUS_HOST = 'https://babel105service-auslbo.avec.emr.it:' + 1339;

var primus = null;
function tts(user, application, browserinfo, ip){ 
	primus = Primus.connect(PRIMUS_HOST, {reconnect: {
			  maxDelay: 10000 // Number: The max delay for a reconnect retry.
			, minDelay: 500 // Number: The minimum delay before we reconnect.
			, retries: Infinity // Number: How many times should we attempt to reconnect.
			}});


	primus.on('data', function message(data) {
		console.log('Received a new message from the server', data);
		//alert (JSON.stringify(data));
		if (data.command=="registerClient"){
			registerClient(user, application, browserinfo, ip);
		}
		else if (data != null && data.command != null) {
			var cmd = data.command + '&params=' + JSON.stringify(data.params);
			var e = new IDEvent("cmd", "", null, RD3_Glb.EVENT_ACTIVE, cmd);
		}
		else{
			console.log(JSON.stringify(data));
		}

	});

	primus.on('open',function (){registerClient (user, application, browserinfo, ip);});
	//primus.on('open',function (){registerClient ();});
}

function registerClient(user, application, browserinfo, ip){
	var clientInfo = {command:'registerClient',params:{user:user,application:application,browserinfo:browserinfo,ip:ip,resolution:getScreenResolution()}};
	/*
	if (application == 'babel' && (new RegExp('^' + 'Chrome').test(browserinfo))) {
		text = 'L\'avviso riguarda solo i <b>FIRMATARI</b> che utilizzano il browser <b>CHROME</b>.<br/><br/>A causa delle nuove politiche di sicurezza per Java in Chrome da parte di Google, attualmente non è possibile firmare in Babel se si utilizza questo browser. E\' necessario contattare l\'Helpdesk Informatico per far installare e configurare <b>MOZILLA FIREFOX</b> sul proprio computer. <br/><br/><a target = "new" href = "http://assistenzapc.internal.ausl.bologna.it/gesut.asp">http://assistenzapc.internal.ausl.bologna.it/gesut.asp</a><br/>helpdesk.informatico@ausl.bologna.it<br/>Tel. 051/41314'
		showToastMessage('COMUNICAZIONE IMPORTANTE', text, true, 'warning', 'custom');
	}*/
	primus.write(clientInfo);
}

function subscribeClientPresence(){
	var command = {command:'subscribeClientPresence'};
	primus.write(command);
}

function unsubscribeClientPresence(){
	var command = {command:'unsubscribeClientPresence'};
	primus.write(command);
}


