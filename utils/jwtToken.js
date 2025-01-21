export const generateToken = (user , message ,statusCode ,res)=>{
    const token = user.generatejsonWebToken();
    const cookieName = user.role === "Admin" ? "adminToken" : "PatientToken";
    res
        .status(statusCode)
        .cookie(cookieName , token ,{
            expiresIn : new Date(
                Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 *1000

            ),
            httpOnly:true,
        })
        .json({
            success : true,
            message,
            user,
            token,
        })
}