const rootPath = "YOUR_BOOKMARK_DATA_DIR";

const html = document.documentElement;

const now = new Date();
const JSONPath = `${ rootPath }/data.json?nocache=${ now.getTime() }`;

const getKeyByValue = ( object, value ) => {
    for ( let prop in object ) {
        if ( object.hasOwnProperty( prop ) ) {
            if ( object[ prop ].url === value.url ) return prop;
        }
    }
}

const tagList = ( cat, e ) => {

    let folder = `data-${ cat }="`;
    for( let item in e ) folder += `${ e[ item ] } `;
        folder += `"`;

    return folder;

}

const displayList = ( data, dataLength ) => {

    let listContent = "";

    for ( let i = dataLength; i >= 0; i-- ) {
        
        const bookmark = data[ i ];

        if ( bookmark ) {

            const id = getKeyByValue( data, bookmark );

            listContent += `<article class="list__site"
                ${ tagList( "id", [ id ] ) }
                ${ bookmark.folder ? tagList( "folder", bookmark.folder ) : "" }
                ${ bookmark.tags ? tagList( "tags", bookmark.tags ) : "" }
                >
                <a href="${ bookmark.url }" target="_blank">
                    <img src="${ rootPath }/tmp/${ id }.png" />
                    <h2>${ bookmark.title }</h2>
                </a>
            </article>`;
        
        };

    };

    return listContent;

}

function loadJSON( path, success, error ) {
    let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if ( xhr.readyState === XMLHttpRequest.DONE ) {
                if ( xhr.status === 200 ) {
                    if ( success )
                        success( JSON.parse( xhr.responseText ) );
                } else {
                    if ( error )
                        error( xhr );
                }
            }
        };
        xhr.open( "GET", path, true );
        xhr.send();
}

const loadContent = () => { loadJSON( JSONPath,

    data => {

        const dataLength = Object.keys( data ).length;

        if ( dataLength !== 0 ) {

            const list = html.querySelector( ".list" );

            list.innerHTML = `
                <header class="list__header">
        
                    <h1>Bookmark page</h1>
                    
                </header>`;

            list.innerHTML += displayList( data, dataLength );
            
        }

    },

) }

loadContent();