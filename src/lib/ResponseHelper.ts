class ResponseHelper{
    static success(data?: object, message: string = "Success", status: number = 200 ){
        return new Response(
            JSON.stringify({
            status,
            success: true,
            message,
            data
        }), { status }
    )}

    static error(errors: unknown = null , message: string = "Somthing went wrong", status: number = 400 ){
        return new Response(
            JSON.stringify({
                status,
                success: false,
                message,
                errors
        }), { status }
    )}
    }

export default ResponseHelper