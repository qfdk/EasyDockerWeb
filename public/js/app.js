$(document).ready(function () {
    var codePageCourante = $("[data-page]").attr("data-page");

    if (codePageCourante == 'containers') {
        $('#'+codePageCourante+'Nav').addClass('active');
    }
    if (codePageCourante == 'images') {
        $('#'+codePageCourante+'Nav').addClass('active');
    }
    if (codePageCourante == 'terminal') {
        terminal();
    }

});

function terminal() {
    Terminal.applyAddon(attach);
    Terminal.applyAddon(fit);
    var term = new Terminal({
        useStyle: true,
        convertEol: true,
        screenKeys: true,
        cursorBlink: false,
        visualBell: true,
        colors: Terminal.xtermColors
    });
    term.open(document.getElementById('terminal'));
    var id = window.location.pathname.split('/')[3];
    var socket = new WebSocket('ws://127.0.0.1:2375/v1.24/containers/' + id + '/attach/ws?logs=0&stream=1&stdin=1&stdout=1&stderr=1');
    term.attach(socket);
    term._initialized = true;
}