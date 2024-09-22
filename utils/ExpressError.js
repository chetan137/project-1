class ExpressError extends Error{
    constructor(statusCod,message){
        super();
        this.statusCod=statusCod;
        this.message=message;
    }
}
module.exports=ExpressError;
