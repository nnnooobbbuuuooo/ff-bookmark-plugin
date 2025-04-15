<?php

error_reporting( -1 );

$CONTENT = file_get_contents( 'php://input' );
$DATA = json_decode( $CONTENT, true );

function is( $str ) { return $key === $str; }

$URL = "YOUR_PERSONNAL_DATA_JSON_URL";

$DATE = $DATA[ "date" ] === null ? date( "Ymd-Gis" ) : $DATA[ "date" ];

$NOCACHE = "$URL?nocache=$DATE";
$COMMAND = $DATA[ "command" ];

$ID = $DATA[ "id" ];
$ID = ( int )$ID;

// var_dump( $DATA );

if ( isset( $ID ) ) {

    $JSON = file_get_contents( $NOCACHE );
    $JSON = json_decode( $JSON, true );

    switch( $COMMAND ){

        case 'save':
        case 'update':

            $target_URL = $DATA[ "url" ];
            // echo "$COMMAND: $target_URL\n";

            foreach ( $DATA as $key => $value ) {
    
                if ( $key !== "id" && $key !== "date" && $key !== "command" && $key !== "capture" ) {

                    if ( isset( $DATA[ $key ] ) && $value !== "" ) {
                    
                        $JSON[ $ID ][ $key ] = ( $key === "folder" || $key === "tags" ) ? explode( ',', $value ) : $value;

                    }
    
                }

                if ( $key === "capture" ) {

                    list($dataType, $imageData) = explode(';', $value);

                    // image file extension
                    $imageExtension = explode('/', $dataType)[1];

                    // base64-encoded image data
                    list(, $encodedImageData) = explode(',', $imageData);


                    // decode base64-encoded image data
                    $decodedImageData = base64_decode($encodedImageData);

                    // save image data as file
                    file_put_contents( "./tmp/$ID.{$imageExtension}", $decodedImageData );

                }
    
            }

            break;

        case 'erase':

            $target_URL = $JSON[ $ID ][ "url" ];
            echo "$COMMAND: $target_URL\n";

            unset( $JSON[ $ID ] );

            break;

        default:

            echo "There is no command";

    }
    
    // var_dump( $JSON );

    $JSON = json_encode( $JSON, JSON_PRETTY_PRINT );
    file_put_contents( "./data.json", $JSON );

}