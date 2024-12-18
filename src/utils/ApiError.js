class ApiError extends Error {
    constructor(
         statusCode,
         message= "SomethingWent Wrong",
         errors = [],
         statck = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.messge = message
        this.success = false;
        this.errors = errors
    //production grade 
        if (statck) {
            this.stack = statck
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}