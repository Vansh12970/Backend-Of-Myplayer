class ApiError extends Error {
    constructor(
         statusCode,
         message= "SomethingWent Wrong",
         errors = [],
         stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.messge = message
        this.success = false;
        this.errors = errors
    //production grade 
        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}