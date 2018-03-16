$(document).ready(function () {
    var codePageCourante = $("[data-page]").attr("data-page");

    if (codePageCourante == 'containers') {
        $('#' + codePageCourante + 'Nav').addClass('active');
    }
    if (codePageCourante == 'images') {
        $('#' + codePageCourante + 'Nav').addClass('active');
    }
    if (codePageCourante == 'terminal') {
        terminal();
    }
    if (codePageCourante == 'logs') {
        logs();
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
    term.fit();
    var id = window.location.pathname.split('/')[3];
    var host = window.location.origin;
    var socket = io.connect(host);
    socket.emit('exec', id, $('#terminal').width(), $('#terminal').height());
    term.on('data', (data) => {
        socket.emit('cmd', data);
    });

    socket.on('show', (data) => {
        term.write(data);
    });

    socket.on('exec', (status) => {
        $('#terminal').empty();
        //socket.end();
    });
}

function logs() {
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
    term.fit();
    var id = window.location.pathname.split('/')[3];
    var host = window.location.origin;
    var socket = io.connect(host);
    socket.emit('attach', id, $('#terminal').width(), $('#terminal').height());

    socket.on('show', (data) => {
        term.write(data);
    });

    // socket.on('attach', (status) => {
    //     $('#terminal').empty();
    //     //socket.end();
    // });
}