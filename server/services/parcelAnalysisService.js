import riskEngine from "../detection/riskEngine.js";

const analyzeParcel = async (parcelId) => {
  if (!parcelId) {
    throw new Error("Parcel ID is required");
  }

  const result = await riskEngine(parcelId);

  return result;
};

export default analyzeParcel;