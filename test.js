var Docker = require('dockerode');
var stream = require('stream');
var docker = new Docker();

/**
 * Get logs from running container
 */
function containerLogs(container) {
    // create a single stream for stdin and stdout
    var logStream = new stream.PassThrough();
    logStream.on('data', function(chunk){
      console.log(chunk.toString('utf8'));
    });
  
    container.logs({
      follow: true,
      stdout: true,
      stderr: true
    }, function(err, stream){
      if(err) {
        return logger.error(err.message);
      }
      container.modem.demuxStream(stream, logStream, logStream);
      stream.on('end', function(){
        logStream.end('!stop!');
      });
    });
  }
  
  docker.createContainer({
    Image: 'adiazmor/docker-ubuntu-with-ping',
    Cmd: ['/bin/bash', '-c', 'ping 8.8.8.8']
  }, function(err, container) {
    container.start({}, function(err, data) {
      containerLogs(container);
    });
  });