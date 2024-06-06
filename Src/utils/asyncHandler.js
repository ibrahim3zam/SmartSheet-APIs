

export const asyncHandler = (API) => {
    return (req, res, next) => {
        API(req, res, next)
            .catch((error) => {
                console.log(error);
                res.status(500).json({ Message: "Falied" })
            })

    }
}