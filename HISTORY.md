# Release History

* 20190214, V0.9.10
    * Fixed wrong setting of loglevel as part of logErrorWithLevel function
    
* 20190214, V0.9.9
    * Added function logErrorWithLevel to report an error with a given log level of "error", "warn", or "info"
    
* 20180530, V0.9.8
    * Updated license file
    
* 20180221, V0.9.7
    * Code cleanup
    * Updated dependencies
    * Revised docs
   
* 20171228, V0.9.6   
    * Ignore undefined or null value parameter passed to setAttribute
    * Updated dependencies

* 20170429, V0.9.5
    * Optimized periodic timer support
    * Changed behavior of scheduleUpdate: Now, an interval of 0 will trigger an
      immediate update
    * Improved API documentation
    
* 20170420, V0.9.4
    * Added periodic timer support which provides better accuracy than
      setInterval()
    * Updated dependencies
    * Updated copyright notice

* 20160927, V0.9.3
    * Extended scheduleUpdate() method to handle variable arguments as
      additional parameters which are passed through to the function
      once the timer expires
    * Added release history
    * Updated dev-dependencies

* 201600706, V0.9.2
    * Added discrete parameter to setAtttribute() method
    
* 201600619, V0.9.1
    * Added generateDeviceId() method
    * Minor fixture for unique(array) method
    * Added customMessage feature to rejectWithErrorString()
    * Improved API Doc
    
* 201600615, V0.9.0
    * Added info method

* 20160325, V0.8.8
    * Updated dev-dependencies
    * Removed usage of deprecated Promise.settle
    * Added license info to README

* 20160305, V0.8.7
    * Improved test coverage
    * Updated dev-dependencies
    * Minor gulpfile changes

* 20160117, V0.8.6
    * Refactoring: Renamed rejectWithError() ro rejectWithErrorString() where rejectWithError() remains as a deprecated function for now.
    * Improved creation of the error message string as part of rejectWithErrorString().
    * Updated tests

* 20151228 V0.8.5
    * Added debounce() helper function
    * Added API documentation
    * Added unit tests
    * Setup travis build and coveralls

* 20151215, V0.8.4
    * Added resetLastError() method

* 20151213, V0.8.3
    * Added stack() method
    * Changed output header for debug and error messages
    * Documented code (work in progress)

* 20151213, V0.8.2
    * Fixed bug in normalize() method if no upperBound set
    * Downloads
    * Source code (zip)
    * Source code (tar.gz)

* 20151213, V0.8.1
    * Added error() logger and unique(array) methods

* 20151213, V0.8.0
    * Initial version