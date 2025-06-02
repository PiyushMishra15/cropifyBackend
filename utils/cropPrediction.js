const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyBpKtchccAEMTdFVzVihOms5rsce_HItAQ");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const cropPredictorServices = async ({
  soil,
  altitudeNum,
  temperatureNum,
  humidityNum,
  rainfallNum,
}) => {
  try {
    const prompt = `Given the following environmental and soil conditions:
- Soil type: ${soil}
- Altitude: ${altitudeNum} meters
- Temperature: ${temperatureNum} °C
- Humidity: ${humidityNum} %
- Rainfall: ${rainfallNum} mm/year

List the most suitable crops for cultivation under these conditions. 

For each crop, use the following format:

Crop: <Crop Name>
Reason: <Reason why it is suitable under these conditions>

Present each crop in a new section.  only provide the crop names and reasons, without any additional text or explanations in short where crop name  numbered beatuify the format as presentaable size .`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text; // ✅ Return the result
  } catch (err) {
    console.error("AI Service Error:", err);
    throw new Error("AI model prediction failed."); // ✅ throw error to be caught in controller
  }
};

module.exports = cropPredictorServices;
