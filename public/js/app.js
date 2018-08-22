$(document).ready(function () {
    var codePageCourante = $("[data-page]").attr("data-page");
    $('#' + codePageCourante + 'Nav').addClass('active');
    loading();
    if (codePageCourante == 'overview') {
        getInfoContainer();
    }
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

        $('#imageName').typeahead({
            limit: 10,
            source: function (query, process) {
                return $.get("/images/search/" + $('#imageName').val(), function (data) {
                    return process(data);
                });
            }
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

function getInfoContainer() {
    // var id = window.location.pathname.split('/')[3];
    var host = window.location.origin;
    var socket = io.connect(host);
    socket.emit('getCPU', "7b0edccd2b24e2cb04f3b91c7fd3bb5bb2f9f5d8ab6a9a0de0b836474e9046ba");
    socket.on('cpu', (data) => {
        console.log(data);
    });

    socket.on('end', (status) => {
        console.log("end")
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
    var version = $('#imageVersionName').val();
    if (version) {
        imagesName = imagesName + ':' + version;
    } else {
        imagesName = imagesName + ':latest';
    }
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