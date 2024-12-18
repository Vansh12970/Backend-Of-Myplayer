const asyncHandler = (requestHandler) => {
    (req, res, next)  => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((err) => next(err))
    }
}
export {asyncHandler}



// higherorder function function inside function 
//const asyncHandler = (fn) => async () => {}

    //this also use as in another method by promise
//const asyncHandler = (fn) => async (req, res, next) => {
//    try {
//        await fn(req, res, next)
//    } catch (error) {
//        res.status(error.code || 500).json({
//            success: false,
//            message: err.message
//        })
//    }
//}