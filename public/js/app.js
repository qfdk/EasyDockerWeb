$(document).ready(function () {
    var codePageCourante = $("[data-page]").attr("data-page");
    $('#' + codePageCourante + 'Nav').addClass('active');
    loading();
    if (codePageCourante == 'terminal') {
        terminal();
    }
    if (codePageCourante == 'logs') {
        logs();
    }
    if (codePageCourante == 'images') {
        $('#pullImage').on('click', function () {
            pullIamges();
        });
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

    socket.on('end', (status) => {
        $('#terminal').empty();
        socket.disconnect();
    });
}

function logs() {
    Terminal.applyAddon(attach);
    Terminal.applyAddon(fit);
    var term = new Terminal({
        useStyle: true,
        convertEol: true,
        screenKeys: false,
        cursorBlink: false,
        visualBell: false,
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

    socket.on('end', (status) => {
        socket.disconnect();
    });
}

function pullIamges() {
    Terminal.applyAddon(attach);
    Terminal.applyAddon(fit);
    var term = new Terminal({
        useStyle: true,
        convertEol: true,
        screenKeys: false,
        cursorBlink: false,
        visualBell: false,
        colors: Terminal.xtermColors
    });

    term.open(document.getElementById('terminal'));
    term.fit();
    var imagesName = $('#imageName').val();
    var host = window.location.origin;
    var socket = io.connect(host);
    socket.emit('pull', imagesName, $('#terminal').width(), $('#terminal').height());
    socket.on('show', (data) => {
        term.write(data);
    });

    socket.on('end', (status) => {
        socket.disconnect();
        location.reload(); 
    });
}

function loading() {
    $('a.btn').on('click', function () {
        var $btn = $(this).button('loading');
    });
    $('#create').on('click', function () {
        var $btn = $(this).button('loading');
    })
    $('#pullImage').on('click', function () {
        var $btn = $(this).button('loading');
    })
}