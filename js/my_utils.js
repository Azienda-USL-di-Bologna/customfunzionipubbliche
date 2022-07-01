var lastDocumentManaged = {
	callServlet: false,
	userId: "",
	lastGuid: "",
	step: "",
	ambito: ""
};

/*
$(window).unload(function () {
    console.log("unload");
	if (lastDocumentManaged && !!lastDocumentManaged.callServlet) {
		callUnlockServlet();
	}
})
*/

window.addEventListener('beforeunload', function(event) {
    console.log("unload");
    if (lastDocumentManaged && !!lastDocumentManaged.callServlet) {
        callUnlockServlet();
		lastDocumentManaged = {
			callServlet: false,
			userId: "",
			lastGuid: "",
			step: "",
			ambito: ""
		};
    }
    return "closed";
});


function setLastDocumentManaged(callServlet, userId, lastGuid, step, ambito) {
	lastDocumentManaged.callServlet = callServlet;
	lastDocumentManaged.userId = userId;
	lastDocumentManaged.lastGuid = lastGuid;
	lastDocumentManaged.step = step;
	lastDocumentManaged.ambito = ambito;
}


function callUnlockServlet() {


    // calcolo l'url sostituente al pathname (es. /Procton/Procton.htm) il nome dell'applicazione principale (es. /scrivania/scrivania)
    var mainAppUrl = window.location.href.replace(window.location.pathname, "/" + "bds_tools/UnlockDocument") + '?guid=' + lastDocumentManaged.lastGuid + '&userId=' + lastDocumentManaged.userId + '&step=' + lastDocumentManaged.step + '&ambito=' + lastDocumentManaged.ambito;
    //var mainAppUrl = 'https://gdml.internal.ausl.bologna.it/bds_tools/UnlockDocument?guid=' + lastDocumentManaged.lastGuid + '&step=' + lastDocumentManaged.step + '&ambito=' + lastDocumentManaged.ambito;

    console.log(mainAppUrl);
	
	console.log(mainAppUrl);
    navigator.sendBeacon(mainAppUrl, "gdm");

	/*
	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == this.OPENED) {
            console.log("establishing server connection");
        } else if (this.readyState == this.LOADING) {
            console.log("recieving response");
        } else if (this.readyState == this.DONE) {
            console.log("ping: ", new Date());
            console.log("status: ", this.status);
            console.log("status" + this.responseText);
        }
    }

    xhttp.open("GET", mainAppUrl, true);
    //xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("X-HTTP-Method-Override", "unlockDocument");

    console.log("sending request...");
    xhttp.send();
	*/
}


var canShowMessage = true;
var savedMessageText = "";

window.addEventListener("click", updateNg2IdelLocalStorage);

function showToastMessage(title, text, sticky, type, position) {

	if (text != savedMessageText)
		canShowMessage = true;
	if (canShowMessage) {
		//sistemaToast(text)
		$('.toast-container').remove();
		canShowMessage=false;
		savedMessageText = text;
		messageText = '<b>' + title + '</b><br/><br/>' + text;
		$().toastmessage('showToast', {
		text     : messageText,
		sticky   : sticky,
		type     : type,
		position : position,
		close    : function () {console.log("toast is closed ...");canShowMessage=true;}
		});
		sistemaToast(text)
	}
}

function getScreenResolution() {
	if (Math.abs(window.orientation) - 90 == 0)
		return screen.height + "x" + screen.width;
	else
		return screen.width + "x" + screen.height;
}

function sistemaToast(text) {
	var nChar=text.length
	nChar=nChar/30
	if((nChar)>4 ){
		console.log($('div.toast-container.toast-position-middle-center,'))
		$('div.toast-container.toast-position-middle-center').css({
			'width':'600px',
			'margin-left':' -300px',
			'top': '40%'
			
		});		
	}
}

/*
function downloadAndNotify(url,name,command,token,close=false) {
  myWindow = window.open(url,name);
  if (close) {
	myWindow.close()
  } else {
	  myWindow.focus();
  }	  

  var cmd = command + '&params='+token;
  var e = new IDEvent("cmd", "", null, RD3_Glb.EVENT_ACTIVE, cmd);
}
*/

function downloadAndNotify(url,name,command,token,close=false) {
  if (close) {
    window.location.href = url;
  } else {
      myWindow = window.open(url,name);
      myWindow.focus();
  }
  var cmd = command + '&params='+token;
  var e = new IDEvent("cmd", "", null, RD3_Glb.EVENT_ACTIVE, cmd);
}

/*
	Gestione del logout automatico
*/
var timeouts;
window.addEventListener("click", updateNg2IdelLocalStorage);
window.addEventListener("mousemove", updateNg2IdelLocalStorage);
window.addEventListener("keydown", updateNg2IdelLocalStorage);
function updateNg2IdelLocalStorage() {
    var nowMillis = new Date().getTime() + 15000;
     // localStorage.setItem("ng2Idle.main.idling", "false");
     //localStorage.removeItem("ng2Idle.main.idling");
    if (!timeouts) {
        timeouts = setTimeout(() => {
        // console.log("aaaaa");
        localStorage.removeItem("ng2Idle.main.expiry");
        //localStorage.removeItem("ng2Idle.main.idling");
        timeouts = null;
        }, 2000);
    }
    //localStorage.removeItem("ng2Idle.main.expiry");
    //localStorage.setItem("ng2Idle.main.expiry", new Date().getTime().toString() + 200);
}

/**
 *	controlla se la sessione Shibboleth o Spid facendo una chiamata HEAD all'url della applicazione principale (la scrivania internauta)
 */
function doPing(mainAppPathName) {
	var xhttp = new XMLHttpRequest();
	
	// calcolo l'url sostituente al pathname (es. /Procton/Procton.htm) il nome dell'applicazione principale (es. /scrivania/scrivania)
	var mainAppUrl = window.location.href.replace(window.location.pathname, "/" + mainAppPathName)
	
	xhttp.onreadystatechange = function () {
        if (this.readyState == this.OPENED) {
            console.log("establishing server connection");
        } else if (this.readyState == this.LOADING) {
            console.log("recieving response");
        } else if (this.readyState == this.DONE) {
			console.log("ping: ", new Date());
			console.log("status: ", this.status);
			if (this.status >= 300) {				
				console.log("logout");
				var logoutCommandParams = {
					redirectUrl: mainAppUrl
				}
				var cmd = "logout" + '&params='+ JSON.stringify(logoutCommandParams);
				var e = new IDEvent("cmd", "", null, RD3_Glb.EVENT_ACTIVE, cmd);
			} else {
				console.log("ping: ", new Date());
			}
		}
	}
	
	xhttp.open("HEAD", mainAppUrl, true);
    // xhttp.setRequestHeader("Content-Type", "application/json");
	console.log("sending request...");
    xhttp.send();
}

