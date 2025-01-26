import ResponseHelper from "@/lib/ResponseHelper";

export async function GET(){
    return ResponseHelper.success({}, "Server working properly", 200)
}