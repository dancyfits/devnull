/**!
 * dev/null
 * @copyright (c) 2011 Observe.it (observe.it) <arnout@observe.com>
 * MIT Licensed
 */

describe('dev/null, logger', function () {
  it('should expose the current version number', function () {
    Logger.version.should.be.a('string')
    Logger.version.should.match(/[0-9]+\.[0-9]+\.[0-9]+/)
  })

  it('should expose the logging methods', function () {
    Logger.methods.should.be.a('object')
    Logger.methods.development.should.be.a('object')
    Logger.methods.production.should.be.a('object')

    var production = Object.keys(Logger.methods.production)
      , development = Object.keys(Logger.methods.development)

    production.length.should.be.above(0)
    development.length.should.be.above(0)

    production.length.should.equal(development.length)

    production.forEach(function (key) {
      development.indexOf(key).should.be.above(-1)

      Logger.methods.production[key].should.be.a('string')
      Logger.methods.development[key].should.be.a('string')
    })
  })

  it('should expose the logging levels', function () {
    Logger.levels.should.be.a('object')

    var levels = Object.keys(Logger.levels)

    levels.length.should.be.above(0)

    levels.forEach(function (key) {
      Logger.levels[key].should.be.a('number')
    })
  })

  it('should have the same log levels as methods', function () {
    var levels = Object.keys(Logger.levels)
      , production = Object.keys(Logger.methods.production)

    levels.length.should.equal(production.length)

    levels.forEach(function (key) {
      production.indexOf(key).should.be.above(-1)
    })
  })

  describe('#initialization', function () {
    it('should not throw when constructed without arguments', function () {
      var logger = new Logger
    })

    it('should have defaults', function () {
      var logger = new Logger

      logger.should.respondTo('configure')
      logger.should.respondTo('use')
      logger.should.respondTo('has')
      logger.should.respondTo('remove')
      logger.should.respondTo('write')

      logger.env.should.be.a('string')
      logger.level.should.be.a('number')
      logger.notification.should.be.a('number')
      logger.timestamp.should.be.a('boolean')
      logger.pattern.should.be.a('string')
    })

    it('should not throw when constructed with an empty object', function () {
      var logger = new Logger({})

      logger.should.respondTo('configure')
      logger.should.respondTo('use')
      logger.should.respondTo('has')
      logger.should.respondTo('remove')
      logger.should.respondTo('write')

      logger.env.should.be.a('string')
      logger.level.should.be.a('number')
      logger.notification.should.be.a('number')
      logger.timestamp.should.be.a('boolean')
      logger.pattern.should.be.a('string')
    })

    it('should override the defaults with a config object', function () {
      var logger = new Logger({
          level: 1
        , notification: 0
        , pattern: 'pew pew'
      })

      logger.level.should.equal(1)
      logger.notification.should.equal(0)
      logger.pattern.should.equal('pew pew')
    })

    it('should not override the methods with a config object', function () {
      var logger = new Logger({ use: 'pewpew' })

      logger.should.respondTo('use')
    })

    it('should not introduce new properties with a config object', function () {
      var logger = new Logger({
          level: 0
        , introduced: true
        , pattern: 'pew pew'
      })

      logger.level.should.equal(0)
      logger.pattern.should.equal('pew pew')
      Object.prototype.toString.call(logger.introduced).should.equal('[object Undefined]')
    })
  })

  describe('#configure', function () {
    it('no evenironment var should always trigger the callback', function () {
      var logger = new Logger
        , asserts = 0

      logger.configure.should.be.a('function')
      logger.configure(function () {
        ++asserts
        this.should.equal(logger)
      })

      asserts.should.equal(1)
    })

    it('should trigger callback for all environments and production', function () {
      var logger = new Logger
        , asserts = 0

      logger.env.should.be.a('string')
      logger.env = 'production';

      logger.configure(function () {
        ++asserts
        this.should.equal(logger)
      })

      logger.configure('production', function () {
        ++asserts
        this.should.equal(logger)
      })

      logger.configure('invalid', function () {
        should.fail('should not run')
      })

      asserts.should.equal(2)
    })

    it('should return a logger instance with no arguments are passed', function () {
      var logger = new Logger
        , configure = logger.configure()

      configure.should.equal(logger)
    })

    it('should return a logger instance', function (){
      var logger = new Logger
        , configure = logger.configure(function () {})

      configure.should.equal(logger)
    })
  })

  describe('#use', function () {
    it('should execute the given function', function () {
      var logger = new Logger
        , asserts = 0

      logger.use(function () {
        ++asserts
      })

      asserts.should.equal(1)
    })

    it('should executed function should receive arguments', function () {
      var logger = new Logger
        , asserts = 0

      logger.use(function (self, options) {
        ++asserts

        self.should.equal(logger)
        options.foo.should.equal('bar')
      }, { foo:'bar' })

      asserts.should.equal(1)
    })

    it('should add the transport to the transports array', function () {
      var logger = new Logger
        , asserts = 0
        , example = function () {
            ++asserts
          }

      logger.transports.length.should.equal(0)
      logger.use(example)
      logger.transports.length.should.equal(1)

      asserts.should.equal(1)
    })

    it('should create a new instance of the function', function () {
      var logger = new Logger
        , asserts = 0
        , example = function () {
            ++asserts
          }

      logger.use(example)
      logger.transports[0].should.be.an.instanceof(example)

      asserts.should.equal(1)
    })

    it('should only add functions', function () {
      var logger = new Logger

      logger.transports.length.should.equal(0)

      logger.use('string')
      logger.transports.length.should.equal(0)

      logger.use({})
      logger.transports.length.should.equal(0)

      logger.use([])
      logger.transports.length.should.equal(0)

      logger.use(1337)
      logger.transports.length.should.equal(0)

      logger.use(new Date)
      logger.transports.length.should.equal(0)

      logger.use(/regexp/)
      logger.transports.length.should.equal(0)
    })

    it('should return a logger instance', function () {
      var logger = new Logger
        , use = logger.use(function () {})

      use.should.equal(logger)
    })
  })

  describe('#has', function () {
    it('should return a boolean for failures', function () {
      var logger = new Logger

      logger.has('a').should.be.a('boolean')
      logger.has('b').should.be.false
    })

    it('should not throw without when called without arguments', function () {
      var logger = new Logger

      logger.has().should.be.a('boolean')
    })

    it('should return the found instance', function () {
      var logger = new Logger
        , example = function () {}

      logger.use(example)
      logger.has(example).should.be.an.instanceof(example)
    })

    it('should return the found match, if it equals the argument', function () {
      var logger = new Logger
        , fixture = function () {}

      logger.transports.push(fixture)
      logger.has(fixture).should.equal(fixture)
    })
  })
})