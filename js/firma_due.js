var base_url = "http://localhost:8090"
var ds_url = base_url + "/api/sign";

function sign(params, separator, masterDocumentId, retryCounter=0) {
	
	console.log("REST request body: " + params);
    // costruisco la richiesta HTTP
    var xhttp = new XMLHttpRequest();

    // gestione response
    xhttp.onreadystatechange = function () {
        if (this.readyState == this.OPENED) {
            console.log("establishing server connection");
        }
        if (this.readyState == this.LOADING) {
            console.log("recieving response");
        }
        if (this.readyState == this.DONE) {
			resultString = xhttp.response;
            // status code != OK
            if (this.status != 200) {
				if ((this.status === 407 || this.status === 0) && retryCounter < 10) { // client update
					console.log("client is updating, wait some seconds and retry, ", new Date(), " counter: ", retryCounter);
					setTimeout(sign, 3000, params, separator, masterDocumentId, ++retryCounter);
					// invio richiesta
				} else if (this.status == 403) { // abort
					result = JSON.parse(resultString);
					var e = new IDEvent("cmd", "", null, RD3_Glb.EVENT_ACTIVE, "end_firmadue_sign" + separator + masterDocumentId + separator + "aborted" + separator + encodeURIComponent((result.user_tip)));
				} else { // errore
					var tip = "";
					if (retryCounter === 10) {
						tip = "Impossibile connettersi al servizio di firma digitale. Contattare Babel Care.";
					} else {
						try {
							result = JSON.parse(resultString);
							tip = result.user_tip
						}
						catch(error) {
						  console.error(error);
						  tip = "Errore non previsto. Contattare Babel Care."
						}
					}
					var e = new IDEvent("cmd", "", null, RD3_Glb.EVENT_ACTIVE, "end_firmadue_sign" + separator + masterDocumentId + separator + "error" + separator + encodeURIComponent((tip)));
				}
            }
            else {
				result = JSON.parse(resultString);
                signedFiles = result.signed_file_list;
                numSignedFiles = signedFiles.length;
                
                signStatus = "ok";
                for(i = 0; i < numSignedFiles && signStatus !== "error"; i++) {
					if (signStatus !== "aborted" && signedFiles[i].signed.startsWith("abort")) {
						signStatus = "aborted";
					} else if (signedFiles[i].signed.startsWith("no")) {
						signStatus = "error";
					}
				}

                if (signStatus !== "ok") {
                    // nessun file firmato
                    var e = new IDEvent("cmd", "", null, RD3_Glb.EVENT_ACTIVE, "end_firmadue_sign" + separator + masterDocumentId + separator + signStatus); // errore o abort
                }
                // caso alcuni file firmati e alcuni no?
                else {
                    // tutto ok
                    var e = new IDEvent("cmd", "", null, RD3_Glb.EVENT_ACTIVE, "end_firmadue_sign"  + separator + masterDocumentId + separator + "signed"  + separator + encodeURIComponent(JSON.stringify(result.signed_file_list)));
                }
                
            }
        }
    };

    // invio richiesta
    xhttp.open("POST", ds_url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(params);
	
}