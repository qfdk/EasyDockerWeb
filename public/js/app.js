$(document).ready(function () {
    var codePageCourante = $("[data-page]").attr("data-page");
    $('#' + codePageCourante + 'Nav').addClass('active');
    loading();
    if (codePageCourante == 'overview') {
    }

    if (codePageCourante == 'containers') {
        getContainersCPU();
        getContainersRAM();
    }
    // if (codePageCourante == 'terminal') {
    //     terminal();
    // }
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

// function terminal() {
//     Terminal.applyAddon(attach);
//     Terminal.applyAddon(fit);
//     var term = new Terminal({
//         screenKeys: true,
//         useStyle: true,
//         cursorBlink: true,
//         cursorStyle: 'bar', // 光标样式
//         fullscreenWin: true,
//         maximizeWin: true,
//         screenReaderMode: true,
//         cols: 128,
//         theme: {
//             foreground: 'white', // 字体
//             background: '#2A2C34', // 背景色
//             lineHeight: 16,
//         },
//     });
//
//     term.open(document.getElementById('terminal'));
//     term.fit();
//     var id = window.location.pathname.split('/')[3];
//     var host = window.location.origin;
//     var socket = io.connect(host);
//     socket.emit('exec', id, $('#terminal').width(), $('#terminal').height());
//     term.on('data', (data) => {
//         socket.emit('cmd', data);
//     });
//
//     socket.on('show', (data) => {
//         term.write(data);
//     });
//
//     socket.on('end', (status) => {
//         $('#terminal').empty();
//         socket.disconnect();
//     });
// }

function getContainersCPU() {
    var containers = $('.container-cpu');
    for (var i = 0; i < containers.length; i++) {
        var containerId = $('.container-cpu').eq(i).attr('container-id');
        getContainerCPUInfoById(containerId);
    }
}

function getContainersRAM() {
    var containers = $('.container-cpu');
    for (var i = 0; i < containers.length; i++) {
        var containerId = $('.container-ram').eq(i).attr('container-id');
        getContainerRAMInfoById(containerId);
    }
}

function getContainerCPUInfoById(id) {
    var host = window.location.origin;
    var socket = io.connect(host);
    socket.emit('getSysInfo', id);
    socket.on(id, (data) => {
        var json = JSON.parse(data);
        var res = calculateCPUPercentUnix(json);
        if (json.precpu_stats.system_cpu_usage) {
            $('.container-cpu[container-id=' + id + ']').text(res + ' %');
        }
    });
    socket.on('end', (status) => {
        console.log("[END] getContainerCPUInfoById");
    });
}

function getContainerRAMInfoById(id) {
    var host = window.location.origin;
    var socket = io.connect(host);
    socket.emit('getSysInfo', id);
    socket.on(id, (data) => {
        var json = JSON.parse(data);
        if (json.memory_stats.usage) {
            var tmp = ((json.memory_stats.usage / json.memory_stats.limit) * 100).toFixed(2);
            $('.container-ram[container-id=' + id + ']').text(tmp + ' %');
        }
    });
    socket.on('end', (status) => {
        console.log("[END] getContainerRAMInfoById");
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

// ref https://github.com/moby/moby/issues/29306
function calculateCPUPercentUnix(json) {
    var previousCPU = json.precpu_stats.cpu_usage.total_usage;
    var previousSystem = json.precpu_stats.system_cpu_usage;
    var cpuPercent = 0.0;
    var cpuDelta = parseInt(json.cpu_stats.cpu_usage.total_usage) - parseInt(previousCPU);
    var systemDelta = parseInt(json.cpu_stats.system_cpu_usage) - parseInt(previousSystem);
    if (systemDelta > 0.0 && cpuDelta > 0.0) {
        cpuPercent = (cpuDelta / systemDelta) * 100.0;
    }
    return new Number(cpuPercent).toFixed(2);
}

function loading() {
    $('a.btn').on('click', function () {
        var $btn = $(this).button('loading');
    });
    $('#create').on('click', function () {
        var $btn = $(this).button('loading');
    });
    $('#pullImage').on('click', function () {
        var $btn = $(this).button('loading');
    });
}
