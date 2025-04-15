const html = document.documentElement;

const errorContent = html.querySelector( "#error__content" ),
      resultContent = html.querySelector( "#result__content" );

const idInput = html.querySelector( "#id__input" ),
      titleInput = html.querySelector( "#title__input" ),
      urlInput = html.querySelector( "#url__input" ),
      folderInput = html.querySelector( "#folder__input" ),
      tagsInput = html.querySelector( "#tags__input" ),
      captureDiv = html.querySelector( ".capture" ),
      captureInput = html.querySelector( "#capture__input" );

const saveBtn = html.querySelector( "#save__btn" ),
      updateBtn = html.querySelector( "#update__btn" ),
      deleteBtn = html.querySelector( "#delete__btn" ),
      bookmarksBtn = html.querySelector( "#bookmarks__btn" );

const now = new Date();
const JSONPath = `YOUR_PERSONNAL_DATA_JSON_URL`;

const reportError = ( message, error ) => {

    html.querySelector( "#popup__content" ).classList.add( "hidden" );
    errorContent.classList.remove( "hidden" );
    console.error( `${ message }: ${ error }` );
    errorContent.innerHTML += `<p>${ message }: ${ error }</p>`;

}

const getKeyByValue = ( object, value ) => {
    for ( var prop in object ) {
        if ( object.hasOwnProperty( prop ) ) {
            if ( Object.keys( object )[ prop ] === value ) {
                return prop;
            }
        }
    }
}

bookmarksBtn.addEventListener( "click", () => {
    
    browser.tabs.create( { url: `../index.html` } );

} );

function tabAction() {
    
    browser.windows.onFocusChanged.addListener( () => {

        function onCaptured( uri ) {
            
            var img = new Image();
                img.src = uri;
                captureDiv.appendChild( img );

                captureInput.value = uri;

        }
          
        function onError( err ) {

            alert( `Error: ${ err }` );
            reportError( "Error", err );

        }

        function updateInput( tabs ) {
              
            var capturing = browser.tabs.captureVisibleTab( tabs[ 0 ].tabId );

            function loadJSON( path, success, error ) {
                var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function() {
                        if ( xhr.readyState === XMLHttpRequest.DONE ) {
                            if ( xhr.status === 200 ) {
                                if ( success ) {
                                    success( JSON.parse( xhr.responseText ) );
                                }
                            } else {
                                if ( error ) {
                                    error( xhr );
                                }
                            }
                        }
                    };
                    xhr.open( "GET", path, true );
                    xhr.send();
            }

            loadJSON( JSONPath,

                data => {

                    const dataLength = Object.keys( data ).length;

                    if ( dataLength !== 0 ) {

                        const tab = tabs[ 0 ];
                        const isFound = Object.keys( data ).find( e => data[ e ].url.includes( tab.url ) || tab.url.includes( data[ e ].url ) );

                        if ( isFound !== undefined ) {

                            const el = data[ isFound ];

                            idInput.value = isFound;
                            titleInput.value = el.title;
                            urlInput.value = el.url;
                            if ( el.folder !== undefined ) folderInput.value = el.folder;
                            if ( el.tags !== undefined ) tagsInput.value = el.tags;
                            
                            captureInput.value = el.capture !== undefined ? el.capture : capturing.then( onCaptured, onError );;
    
                            saveBtn.classList.add( "hidden" );
                            updateBtn.classList.remove( "hidden" );
                            deleteBtn.classList.remove( "hidden" );
                            
                        } else {
    
                            idInput.value = dataLength + 1;
                            titleInput.value = tab.title;
                            urlInput.value = tab.url;

                            capturing.then( onCaptured, onError );
    
                        }

                        const displayList = term => {
    
                            const list = html.querySelector( `#${ term }__list` );

                            if ( list ) {
        
                                var itemsArr = [];
            
                                for ( let i = 0; i < dataLength; i++ ) {
                                    
                                    const bookmark = data[ i ];
                                    const terms = bookmark[ term ];
        
                                    if ( terms !== undefined ) {
                
                                        [].forEach.call( terms, e => {
                        
                                            if ( e !== "" && !itemsArr.includes( e ) ) {
                                                
                                                itemsArr.push( e );
            
                                                list.innerHTML += `<option value="${ e }">`;
                                            
                                            };
                                            
                                        });
                                        
                                    };
            
                                };

                            };
    
                        };
    
                        displayList( "folder" );
                        displayList( "tags" );
                        
                    } else {

                        resultContent.innerHTML += "<p>NO</p>";
    
                        idInput.value = 0;
                        titleInput.value = tabs[ 0 ].title;
                        urlInput.value = tabs[ 0 ].url;

                        capturing.then( onCaptured, onError );

                    }

                },

                xhr => { resultContent.innerHTML += xhr }

            );

        };

        browser.tabs.query( { active: true, currentWindow: true} )
        .then( updateInput )
        .catch( reportError ( "Could not update URL", error ) );

    } );
    
    function reportError( error ) {

      console.error( `Could not save: ${ error }` );
      errorContent.innerHTML += `Could not save: ${ error }`;

    }

    [ saveBtn, updateBtn ].forEach( btn => {

        const command = btn.id.replace( "__btn", "" );

        btn.addEventListener( "click", e => {
    
            function save( tabs ) {
    
                browser.tabs.sendMessage( tabs[ 0 ].id, {
    
                    command: command,
                    id: idInput.value,
                    title: titleInput.value,
                    url: urlInput.value,
                    folder: folderInput.value.replace( ", ", "," ),
                    tags: tagsInput.value.replace( ", ", "," ),
                    capture: captureInput.value
    
                });
    
            }
    
            browser.tabs.query( { active: true, currentWindow: true } )
            .then( save )
            .then( window.close() )
            .catch( reportError );
    
        });

    } );

    deleteBtn.addEventListener( "click", e => {

        function erase( tabs ) {

            browser.tabs.sendMessage( tabs[ 0 ].id, {

                command: "erase",
                id: idInput.value

            });

        }

        browser.tabs.query( { active: true, currentWindow: true} )
        .then( erase )
        .then( window.close() )
        .catch( reportError );

    });

}

browser.tabs.executeScript( { file: "/scripts.js" } )
    .then( tabAction )
    .catch( reportError ( "Failed to execute the content script", error ) );