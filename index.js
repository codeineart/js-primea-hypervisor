const Kernel = require('./index.js')

module.exports = class Hypervisor {
  constructor (opts) {
    this._opts = {
      state: {},
      imports: [],
      hypervisor: this
    }

    Object.assign(this._opts, opts)
    this._runningVMs = new Map()
  }

  set (path, value) {
    return this._opts.graph.set(this._opts.state, path, value)
  }

  sendMessage (portObj, message) {
    const vm = this.getInstaceFromPort(portObj)
    vm.queue(message)
  }

  getVMFromPort (port) {
    const id = Kernel.id(port)
    let kernel = this._vms.get(id)
    if (!kernel) {
      kernel = new Kernel(port)
      kernel.on('idle', () => {
        this._vms.delete(id)
      })
      this._vms.set(id, kernel)
    }
  }

  // given a port, wait untill its source contract has reached the threshold
  // tick count
  async waitOnPort (port, ticks) {
    let kernel = this.getVMFromPort(port)
    const tickCount = await kernel.wait(ticks)
    port.ticks = tickCount
    return tickCount
  }
}
