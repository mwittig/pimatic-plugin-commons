

<!-- Start src\index.coffee -->

## pimatic-plugin-commons API

## settled(promise)

Waits for a given promise to be resolved or rejected.

### Params:

* **Promise** *promise* - the promise to wait for

## series(input, mapper)

Maps an array of promises or items to a mapping function resolving or
        rejection a promise. The mapping function will be called sequentially
        for each array item.

### Params:

* **Array** *input* - an array of promises or items
* **Function** *mapper* - the mapping function

## setPeriodicTimer(func, delay)

Calls a function repeatedly, with a fixed time delay between each call
        to that function. It is similar to setInterval(), but makes an immediate
        function call at the next ick rather than starting with timeout delay.
        Moreover, it adjust the delay time to dispatch periodic calls with higher
        accuracy than setInterval() does.

### Params:

* **Function** *func* - the function to be called
* **Number** *delay* - delay in milliseconds

### Return:

* **String** the timer id

## clearPeriodicTimer(id)

Takes a given timer id returned by a setPeriodicTimer()
        call and clears the timer. Invalid timer ids are ignored.

### Params:

* **String** *id* - the timer id

### Return:

* **String** the timer id

## clearAllPeriodicTimers()

Clears all active periodic timers.

## activePeriodicTimers()

Returns the number of active period timers.

## base(device, deviceName)

Base object providing device helper functions. **The functions described
        in the remainder of this document are members of base**.

### Params:

* **Object** *device* - the device object
* **String** *deviceName* - the device name to be used for log output

## rejectWithErrorString(reject, error, [customMessage])

Outputs an error message and optionally rejects a Promise on return.
            If the debug property is set on the device a stack trace is output.

### Params:

* **Function** *reject* - function to reject a promise on return,                                        may be null
* **Error** *error* - error object
* **String** *[customMessage]* - a custom message to be used                                                as prefix to the error message

## rejectWithError(reject, error)

Same as rejectWithErrorString, but has been deprecated

**Deprecated**

### Params:

* **Function** *reject* - function to reject a promise on return,                                        may be null
* **Error** *error* - error object

## info(...)

Outputs an info message with an arbitrary list of arguments.
            The output is prefixed with the 'deviceClassName' and optionally
            the 'id' property (if present) of the device.

### Params:

* *...* 

## debug(...)

Outputs a debug message with an arbitrary list of arguments if
            the debug property is set. The output is prefixed with the
            'deviceClassName' and optionally the 'id' property (if present)
            of the device.

### Params:

* *...* 

## logErrorWithLevel(level, ...)

Outputs an error message at a given log level followed by an arbitrary list of arguments.
            The output is prefixed with the 'deviceClassName'
            and optionally the 'id' property (if present) of the device.

### Params:

* *level* - one of "error", "info", "debug"
* *...* 

## error(...)

Outputs an error message with an arbitrary list of arguments.
            The output is prefixed with the 'deviceClassName'
            and optionally the 'id' property (if present) of the device.

### Params:

* *...* 

## resetLastError()

Reset the lastError guard which inhibits the repeated
            output of the same error message

## stack([error])

Outputs a stack trace if debug is enabled.
            The output is prefixed with the 'deviceClassName'
            and optionally the 'id' property (if present) of the device.

### Params:

* **Error** *[error]* Error object, or null

## setAttribute(attributeName, value, [Boolean} [discrete=false] - True if attribute value is)

Set the named attribute to the given value. The attribute
            value must be kept in a member variable named `_<attributeName>`
            where `<attributeName>` is a place holder for the attribute name.
            Note, a given undefined or null value is ignored.
          
            The optional `discrete` parameter can be used to optimize the update
            behaviour of discrete attribute value, i.e., the attribute value is
            only updated if the value has been changed.

### Params:

* **String** *attributeName* - the attribute name
* **Any** *value* - the attribute value
* *[Boolean} [discrete=false] - True if attribute value is*             discrete, e.g., a switch state. False, otherwise.

## cancelUpdate()

Cancel a scheduled update.

## scheduleUpdate(func, interval, [...])

Schedule an update. The given member function of the device
            is called after 'interval' milliseconds. Repeated call will
            remove any previous schedule.

### Params:

* **Function** *func* - update function to be called
* **Number** *interval* - interval in milliseconds. 0 will                             trigger an immediate update
* *[...]* - additional parameters which are passed through                            to the function specified by func once the
                           timer expires

## normalize(value, lowerRange, [upperRange])

Normalize a given value to match the given lowerRange and
            upperRange. The latter is optional.

### Params:

* **Number** *value* - the value
* **Number** *lowerRange* - the lower range
* **Number** *[upperRange]* - the upper range

## unique(array)

Removes duplicates from a given array of strings or number items. The
            result is returned to a new array. The used algorithm has a linear
            complexity of O(2n) in the worst case.

### Params:

* **Array** *array* - the input array

### Return:

* **Array** the resulting array with unique items

## debounce([id], delay, fn)

Schedules a given function which will not be called as long as it
            continues to be invoked. The function will be called after it stops
            being called for the given delay milliseconds. To be able to manage
            multiple, different debounce tasks an id string can be provided to
            identify the debounce task.

### Params:

* **String** *[id]* - a string to identify the task.                                   Required to debounce different tasks at
                                  the same time.
* **Number** *delay* - delay in milliseconds
* **Function** *fn* - function to be called

## generateDeviceId(framework, prefix, [lastId])

Generates a new device id which is not yet in use by another device

### Params:

* **Object** *framework* - the pimatic framework object.
* **String** *prefix* - a prefix string to be used as part of             the device id.
* **String** *[lastId]* - the lastId returned by generateDeviceId

### Return:

* **String** the id generated or undefined             if id could not be generated

<!-- End src\index.coffee -->

