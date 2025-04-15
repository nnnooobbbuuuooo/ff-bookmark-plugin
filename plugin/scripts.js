( function() {

    /**
     * On vérifie que le script ne se lance qu'une seule fois.
     */
    if ( window.hasRun ) {

      return;

    }

    window.hasRun = true;

    /**
     * On écoute les messages envoyés par le script du popup.
     */
    browser.runtime.onMessage.addListener( message => {

        var now = new Date().getTime();
        var bookmark;

        switch ( message.command ) {

            case 'save':
            case 'update':

                bookmark = {

                    id: `${ message.id }`,
                    command: `${ message.command }`,
                    date: `${ now }`,
                    title: `${ message.title }`,
                    url: `${ message.url }`,
                    folder: message.folder,
                    tags: message.tags,
                    capture: message.capture
    
                };

                break;
         
            case 'erase':

                bookmark = {

                    id: `${ message.id }`,
                    command: `${ message.command }`,
                    date: `${ now }`
    
                };

                break;
         
            case 'onFocusChanged':

                console.log( message.data );

                break;
         
            default: console.log( "no command in script.js" );;

        }

        const sendJSON = () => {
                
            // Creating a Xmlhttp object
            var xhr = new XMLHttpRequest();
            var url = new URL( "https://www.flofromager.com/bookmark/submit.php" );
        
            // open a connection
            xhr.open( "POST", url, true );

            // xhr.setRequestHeader( 'Content-Type', 'multipart/form-data' );
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            
            // Create a state change callback
            xhr.onreadystatechange = function () {
                if ( xhr.readyState === 4 && xhr.status === 200 ) {
                    // Print received data from server
                    console.log( this.responseText );
                }
            };
            
            // Sending data with the request
            var formData = JSON.stringify( bookmark );
            xhr.send( formData );

        }

        sendJSON();

    });

})();