import Parcel from "../models/Parcel"
import ParcelScan from "../models/ParcelScan"
import ParcelRisk from "../models/ParcelRisk"




const getparcel = async ()=>{
    try {

        const parcel = await Parcel.find().populate("reouteId").populate("currentFacilityId").sort({createdAt:-1})
        res.json({
            success: true,
            count: parcel.length,
            data: parcel
        });
    } catch (error) {
        res.status(500).json({sucess:false,message : error.message});
    }
}