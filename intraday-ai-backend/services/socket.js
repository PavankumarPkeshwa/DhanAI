let io = null;

function setIO(serverIo) {
  io = serverIo;
}

function getIO() {
  return io;
}

module.exports = { setIO, getIO };
