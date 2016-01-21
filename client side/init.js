////////////////////////////////
//                            //
//            Start           //
//                            //
////////////////////////////////
$("document").ready(function () {

    //env =new GpsEnvironment();
    //env.newCamera();
    //env.newModel();
    //engine =new GpsEngine();


    var canvasEvent = new GpsEvent("#myCanvas");

    var player = new GpsPlayer({
        canvas: "#myCanvas",
        info: "#info",
        event: canvasEvent,
        delay: 30, //optimum delay for each frame
        playbut: "#playbutton",
        but: "#renderbutton",
        slider: "#playslider",
        modelbut: '#modelbutton',
        resetbut: '#resetbutton',
        rotatebut: '#rotatebutton',
    });

    $("#playbutton").click();
    player.mainLoop();

})
